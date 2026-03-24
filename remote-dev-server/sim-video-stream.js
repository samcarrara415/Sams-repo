/**
 * JPEG canvas streaming — zero decode latency.
 * 12 parallel simctl+sips workers, each capturing and resizing independently.
 * JPEG frames sent directly over WebSocket → canvas drawImage (instant render).
 * No ffmpeg. No MSE. No video buffer. Every frame renders the moment it arrives.
 */

const { spawn } = require("child_process");

const TARGET_FPS = 30;
const NUM_WORKERS = 12;
const OUT_HEIGHT = 780;   // sips resampleHeight
const JPEG_QUALITY = 55;  // sips formatOptions (1-100)

class SimVideoStream {
  constructor() {
    this.proc = null;
    this.clients = new Set();
    this.running = false;
    this.buffer = Buffer.alloc(0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.buffer = Buffer.alloc(0);

    this.proc = spawn("python3", ["-u", "-c", `
import subprocess, sys, time, threading, queue, struct, tempfile, os

FPS = ${TARGET_FPS}
INTERVAL = 1.0 / FPS
OUT_H = ${OUT_HEIGHT}
Q = ${JPEG_QUALITY}
stdout = sys.stdout.buffer

frame_q = queue.Queue(maxsize=4)

def worker():
    tmp_in = tempfile.mktemp(suffix='.jpg', prefix='sc_')
    tmp_out = tempfile.mktemp(suffix='.jpg', prefix='sr_')
    while True:
        try:
            p = subprocess.run(
                ['xcrun','simctl','io','booted','screenshot','--type=jpeg', tmp_in],
                capture_output=True, timeout=5)
            if p.returncode != 0:
                time.sleep(0.5); continue
            subprocess.run(
                ['sips','--resampleHeight', str(OUT_H),
                 '-s','formatOptions', str(Q),
                 tmp_in,'--out', tmp_out],
                capture_output=True, timeout=3)
            if os.path.exists(tmp_out) and os.path.getsize(tmp_out) > 100:
                with open(tmp_out, 'rb') as f:
                    data = f.read()
                while frame_q.qsize() > 2:
                    try: frame_q.get_nowait()
                    except: break
                frame_q.put(data)
        except: time.sleep(0.5)

for _ in range(${NUM_WORKERS}):
    threading.Thread(target=worker, daemon=True).start()

# Output length-prefixed JPEG frames at target FPS
while True:
    fstart = time.monotonic()
    try: jpeg = frame_q.get(timeout=2)
    except: continue
    stdout.write(struct.pack('>I', len(jpeg)))
    stdout.write(jpeg)
    stdout.flush()
    elapsed = time.monotonic() - fstart
    s = INTERVAL - elapsed
    if s > 0: time.sleep(s)
`], { stdio: ["ignore", "pipe", "pipe"] });

    this.proc.stdout.on("data", (chunk) => this._parseFrames(chunk));
    this.proc.stderr.on("data", () => {});
    this.proc.on("exit", () => { if (this.running) this._restart(); });

    console.log(`JPEG stream: ${TARGET_FPS}fps ${NUM_WORKERS} workers q=${JPEG_QUALITY}`);
  }

  _parseFrames(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 4) {
      const len = this.buffer.readUInt32BE(0);
      if (len === 0 || len > 500000) { this.buffer = this.buffer.slice(1); continue; }
      if (this.buffer.length < 4 + len) break;
      const frame = this.buffer.slice(4, 4 + len);
      this.buffer = this.buffer.slice(4 + len);
      for (const ws of this.clients) {
        if (ws.readyState === 1) ws.send(frame, { binary: true });
      }
    }
    if (this.buffer.length > 1000000) this.buffer = this.buffer.slice(-100000);
  }

  stop() {
    this.running = false;
    try { this.proc?.kill(); } catch {}
    this.proc = null;
  }

  _restart() {
    this.stop();
    if (this.clients.size > 0) setTimeout(() => this.start(), 500);
  }

  addClient(ws) {
    this.clients.add(ws);
    if (!this.running) this.start();
    ws.on("message", () => {});
    ws.on("close", () => {
      this.clients.delete(ws);
      if (this.clients.size === 0) this.stop();
    });
  }
}

module.exports = SimVideoStream;
