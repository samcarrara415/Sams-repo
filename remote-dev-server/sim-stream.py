#!/usr/bin/env python3
"""
Streams the iOS Simulator framebuffer as length-prefixed JPEG frames to stdout.
Uses 'xcrun simctl io' for framebuffer capture (works regardless of window state).
Adaptive quality via /tmp/sim-stream-quality control file.

Frame format: [4-byte big-endian length][JPEG bytes]
Zero-length frame = no booted simulator.
"""
import sys, time, struct, subprocess, signal, threading, queue, json, os, tempfile

signal.signal(signal.SIGUSR1, lambda *_: None)

CONTROL_FILE = "/tmp/sim-stream-quality"

# (scale_pct, jpeg_quality_pct, max_fps)
QUALITY_PRESETS = {
    1: (20,  25,  3),
    2: (30,  35,  6),
    3: (45,  45, 10),
    4: (65,  55, 15),
    5: (100, 70, 20),
}

current_quality = 5
quality_lock = threading.Lock()

def read_quality():
    global current_quality
    try:
        with open(CONTROL_FILE, "r") as f:
            data = json.load(f)
            q = int(data.get("quality", 5))
            with quality_lock:
                current_quality = max(1, min(5, q))
    except Exception:
        pass

def get_quality():
    with quality_lock:
        return current_quality

def capture_and_resize():
    """Capture a frame and resize it according to current quality. Returns JPEG bytes or None."""
    try:
        q = get_quality()
        scale_pct, jpeg_q, _ = QUALITY_PRESETS[q]

        if scale_pct >= 100 and jpeg_q >= 70:
            # Full quality — just capture directly
            p = subprocess.run(
                ["xcrun", "simctl", "io", "booted", "screenshot", "--type=jpeg", "-"],
                capture_output=True, timeout=5,
            )
            if p.returncode == 0 and len(p.stdout) > 100:
                return p.stdout
            return None

        # Capture to temp file, resize with sips, read back
        tmp_in = tempfile.mktemp(suffix=".jpg", prefix="sim_")
        tmp_out = tempfile.mktemp(suffix=".jpg", prefix="sim_r_")

        try:
            # Capture
            p = subprocess.run(
                ["xcrun", "simctl", "io", "booted", "screenshot", "--type=jpeg", tmp_in],
                capture_output=True, timeout=5,
            )
            if p.returncode != 0 or not os.path.exists(tmp_in):
                return None

            # Get original height for scaling
            info = subprocess.run(
                ["sips", "-g", "pixelHeight", tmp_in],
                capture_output=True, timeout=2,
            )
            height = 2622
            for line in info.stdout.decode().split("\n"):
                if "pixelHeight" in line:
                    try: height = int(line.split(":")[-1].strip())
                    except: pass

            new_h = max(100, int(height * scale_pct / 100))

            # Resize + recompress
            subprocess.run(
                ["sips", "--resampleHeight", str(new_h),
                 "-s", "formatOptions", str(jpeg_q),
                 tmp_in, "--out", tmp_out],
                capture_output=True, timeout=3,
            )

            if os.path.exists(tmp_out) and os.path.getsize(tmp_out) > 100:
                with open(tmp_out, "rb") as f:
                    return f.read()

            # Fallback: return original
            with open(tmp_in, "rb") as f:
                return f.read()

        finally:
            try: os.unlink(tmp_in)
            except: pass
            try: os.unlink(tmp_out)
            except: pass

    except Exception:
        pass
    return None

def capture_worker(frame_q):
    while True:
        q = get_quality()
        _, _, max_fps = QUALITY_PRESETS[q]
        frame_start = time.monotonic()

        data = capture_and_resize()
        if data is not None:
            while frame_q.qsize() > 1:
                try: frame_q.get_nowait()
                except queue.Empty: break
            frame_q.put(data)
        else:
            frame_q.put(None)
            time.sleep(1)
            continue

        # Pace to half of max_fps per worker (2 workers share the load)
        target = 1.0 / max(1, max_fps)
        elapsed = time.monotonic() - frame_start
        if elapsed < target:
            time.sleep(target - elapsed)

def main():
    stdout = sys.stdout.buffer
    stdout.write(b"READY\n")
    stdout.flush()

    frame_q = queue.Queue(maxsize=4)

    for _ in range(2):
        t = threading.Thread(target=capture_worker, args=(frame_q,), daemon=True)
        t.start()

    # Quality check thread
    def quality_reader():
        while True:
            read_quality()
            time.sleep(0.5)
    threading.Thread(target=quality_reader, daemon=True).start()

    while True:
        try:
            data = frame_q.get(timeout=2)
        except queue.Empty:
            stdout.write(struct.pack(">I", 0))
            stdout.flush()
            continue

        if data is None:
            stdout.write(struct.pack(">I", 0))
            stdout.flush()
            continue

        stdout.write(struct.pack(">I", len(data)))
        stdout.write(data)
        stdout.flush()

if __name__ == "__main__":
    main()
