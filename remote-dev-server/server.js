const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const SimVideoStream = require("./sim-video-stream");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

// --- Persistent touch helper ---
let touchProc = null;
let touchReady = false;

function ensureTouchHelper() {
  if (touchProc && !touchProc.killed) return;
  touchReady = false;
  touchProc = spawn("python3", [path.join(__dirname, "touch-helper.py")], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  touchProc.stdout.on("data", (d) => {
    if (d.toString().trim() === "READY") {
      touchReady = true;
      console.log("Touch helper ready");
    }
  });
  touchProc.stderr.on("data", (d) => console.error("touch-helper:", d.toString().trim()));
  touchProc.on("exit", () => { touchReady = false; touchProc = null; });
}
ensureTouchHelper();

app.use(express.json());
app.post("/api/touch", (req, res) => {
  ensureTouchHelper();
  if (!touchProc || !touchReady) return res.status(503).json({ error: "Touch helper not ready" });
  try {
    touchProc.stdin.write(JSON.stringify(req.body) + "\n");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Persistent sim-stream process (shared across all WS clients) ---
let simProc = null;
let simClients = new Set();
let simBuffer = Buffer.alloc(0);
let simExpectedLen = -1;

function ensureSimStream() {
  if (simProc && !simProc.killed) return;

  simProc = spawn("python3", [path.join(__dirname, "sim-stream.py")], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let gotReady = false;

  simProc.stdout.on("data", (chunk) => {
    // First line is "READY\n"
    if (!gotReady) {
      const idx = chunk.indexOf(0x0a); // newline
      if (idx !== -1) {
        gotReady = true;
        console.log("Sim stream ready");
        chunk = chunk.slice(idx + 1);
        if (chunk.length === 0) return;
      } else {
        return;
      }
    }

    // Accumulate and parse length-prefixed frames
    simBuffer = Buffer.concat([simBuffer, chunk]);
    drainFrames();
  });

  simProc.stderr.on("data", (d) => console.error("sim-stream:", d.toString().trim()));
  simProc.on("exit", () => {
    console.log("Sim stream exited, restarting...");
    simProc = null;
    // Auto-restart if we have clients
    if (simClients.size > 0) {
      setTimeout(ensureSimStream, 1000);
    }
  });
}

function drainFrames() {
  while (true) {
    if (simExpectedLen === -1) {
      if (simBuffer.length < 4) return;
      simExpectedLen = simBuffer.readUInt32BE(0);
      simBuffer = simBuffer.slice(4);
    }

    // Zero-length = no simulator
    if (simExpectedLen === 0) {
      const msg = JSON.stringify({ error: "No booted simulator. Boot one from Xcode." });
      for (const ws of simClients) {
        if (ws.readyState === 1) ws.send(msg);
      }
      simExpectedLen = -1;
      continue;
    }

    if (simBuffer.length < simExpectedLen) return;

    const frame = simBuffer.slice(0, simExpectedLen);
    simBuffer = simBuffer.slice(simExpectedLen);
    simExpectedLen = -1;

    // Broadcast to all connected clients
    for (const ws of simClients) {
      if (ws.readyState === 1) {
        ws.send(frame, { binary: true });
      }
    }
  }
}

// --- Refocus: bring Simulator to front and re-detect window bounds ---
app.post("/api/sim/refocus", (_req, res) => {
  // Bring Simulator.app to front
  spawn("osascript", ["-e", 'tell application "Simulator" to activate'], {
    stdio: "ignore", detached: true,
  }).unref();

  // Restart the video stream so it re-detects the window after activation
  setTimeout(() => {
    if (videoStream.running) {
      videoStream.stop();
      setTimeout(() => videoStream.start(), 500);
    }
    // Also handle old JPEG stream if running
    if (simProc && !simProc.killed) {
      try { process.kill(simProc.pid, "SIGUSR1"); } catch {}
    }
  }, 800);

  res.json({ ok: true });
});

// --- List available simulators ---
app.get("/api/sim/list", (_req, res) => {
  try {
    const out = execSync("xcrun simctl list devices available -j", { timeout: 10000 });
    const data = JSON.parse(out);
    const devices = [];
    for (const [runtime, devs] of Object.entries(data.devices)) {
      for (const d of devs) {
        devices.push({
          name: d.name,
          udid: d.udid,
          state: d.state,
          runtime: runtime.replace(/com\.apple\.CoreSimulator\.SimRuntime\./, "").replace(/-/g, " "),
        });
      }
    }
    // Sort: booted first, then by name
    devices.sort((a, b) => {
      if (a.state === "Booted" && b.state !== "Booted") return -1;
      if (b.state === "Booted" && a.state !== "Booted") return 1;
      return a.name.localeCompare(b.name);
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Boot a simulator ---
app.post("/api/sim/boot/:udid", (req, res) => {
  const udid = req.params.udid;
  // Validate UDID format
  if (!/^[0-9A-F-]{36}$/i.test(udid)) {
    return res.status(400).json({ error: "Invalid UDID" });
  }
  try {
    execSync(`xcrun simctl boot ${udid}`, { timeout: 30000 });
    // Open Simulator.app so the window appears for capture
    spawn("open", ["-a", "Simulator"], { detached: true, stdio: "ignore" }).unref();
    // Signal stream to refresh bounds after a short delay
    setTimeout(() => {
      if (simProc && !simProc.killed) {
        try { process.kill(simProc.pid, "SIGUSR1"); } catch {}
      }
    }, 2000);
    res.json({ ok: true });
  } catch (err) {
    // "Unable to boot device in current state: Booted" is fine
    if (err.message && err.message.includes("Booted")) {
      spawn("open", ["-a", "Simulator"], { detached: true, stdio: "ignore" }).unref();
      return res.json({ ok: true, already: true });
    }
    res.status(500).json({ error: err.stderr?.toString() || err.message });
  }
});

// --- Stream quality control ---
app.post("/api/sim/quality", (req, res) => {
  const q = parseInt(req.body.quality);
  if (isNaN(q) || q < 1 || q > 5) return res.status(400).json({ error: "quality must be 1-5" });
  fs.writeFileSync("/tmp/sim-stream-quality", JSON.stringify({ quality: q }));
  res.json({ ok: true, quality: q });
});

app.get("/api/sim/quality", (_req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("/tmp/sim-stream-quality", "utf8"));
    res.json({ quality: data.quality || 5 });
  } catch {
    res.json({ quality: 5 });
  }
});

// --- Build & Run: scan for Xcode projects ---
app.get("/api/xcode/projects", (req, res) => {
  const dir = req.query.dir || process.env.HOME;
  try {
    // Find .xcodeproj and .xcworkspace up to 4 levels deep
    const out = execSync(
      `find ${JSON.stringify(dir)} -maxdepth 4 \\( -name "*.xcodeproj" -o -name "*.xcworkspace" \\) -not -path "*/.*" -not -path "*/Pods/*" 2>/dev/null | head -50`,
      { timeout: 10000 }
    ).toString().trim();
    const projects = out ? out.split("\n").map((p) => ({
      path: p,
      name: path.basename(p).replace(/\.(xcodeproj|xcworkspace)$/, ""),
      type: p.endsWith(".xcworkspace") ? "workspace" : "project",
    })) : [];
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Build & Run: get schemes for a project ---
app.get("/api/xcode/schemes", (req, res) => {
  const proj = req.query.path;
  if (!proj) return res.status(400).json({ error: "path required" });
  try {
    const flag = proj.endsWith(".xcworkspace") ? "-workspace" : "-project";
    const out = execSync(
      `xcodebuild ${flag} ${JSON.stringify(proj)} -list -json 2>/dev/null`,
      { timeout: 15000 }
    ).toString();
    const data = JSON.parse(out);
    const info = data.project || data.workspace || {};
    res.json({ schemes: info.schemes || [] });
  } catch (err) {
    res.status(500).json({ error: err.stderr?.toString() || err.message });
  }
});

// --- Build & Run: build, install, launch (streams logs via SSE) ---
app.get("/api/xcode/build", (req, res) => {
  const { path: projPath, scheme, destination } = req.query;
  if (!projPath || !scheme) return res.status(400).json({ error: "path and scheme required" });

  // Server-Sent Events for streaming build output
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  function send(type, data) {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  }

  const flag = projPath.endsWith(".xcworkspace") ? "-workspace" : "-project";
  const dest = destination || "platform=iOS Simulator,name=iPhone 17 Pro";

  send("status", "Building...");

  // Step 1: Build
  const buildProc = spawn("xcodebuild", [
    flag, projPath,
    "-scheme", scheme,
    "-destination", dest,
    "-derivedDataPath", "/tmp/xcode-remote-build",
    "build",
  ], { stdio: ["ignore", "pipe", "pipe"] });

  buildProc.stdout.on("data", (d) => send("log", d.toString()));
  buildProc.stderr.on("data", (d) => send("log", d.toString()));

  buildProc.on("close", (code) => {
    if (code !== 0) {
      send("error", `Build failed (exit ${code})`);
      res.end();
      return;
    }

    send("status", "Build succeeded. Finding .app...");

    // Step 2: Find the built .app
    try {
      const appPath = execSync(
        `find /tmp/xcode-remote-build -name "*.app" -path "*/Debug-iphonesimulator/*" -not -path "*/__*" | head -1`,
        { timeout: 5000 }
      ).toString().trim();

      if (!appPath) {
        send("error", "Could not find built .app bundle");
        res.end();
        return;
      }

      send("status", `Installing ${path.basename(appPath)}...`);

      // Step 3: Install
      const installOut = execSync(
        `xcrun simctl install booted ${JSON.stringify(appPath)}`,
        { timeout: 30000 }
      ).toString();

      // Step 4: Get bundle ID and launch
      const plistPath = path.join(appPath, "Info.plist");
      const bundleId = execSync(
        `/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ${JSON.stringify(plistPath)}`,
        { timeout: 5000 }
      ).toString().trim();

      send("status", `Launching ${bundleId}...`);

      execSync(`xcrun simctl launch booted ${bundleId}`, { timeout: 10000 });

      send("done", `${path.basename(appPath)} is running on simulator`);
    } catch (err) {
      send("error", err.stderr?.toString() || err.message);
    }
    res.end();
  });

  // Handle client disconnect
  req.on("close", () => {
    buildProc.kill();
  });
});

// --- Bandwidth probe: returns a payload of known size for speed testing ---
app.get("/api/probe/:sizeKB", (req, res) => {
  const sizeKB = Math.min(Math.max(parseInt(req.params.sizeKB) || 100, 1), 2000);
  res.set("Cache-Control", "no-store");
  res.set("Content-Type", "application/octet-stream");
  res.send(Buffer.alloc(sizeKB * 1024, 0x42));
});

// --- H.264 Video stream ---
const videoStream = new SimVideoStream();

// --- WebSocket setup ---
const termWss = new WebSocketServer({ noServer: true });
const simWss = new WebSocketServer({ noServer: true });
const videoWss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/ws/terminal") {
    termWss.handleUpgrade(req, socket, head, (ws) => handleTerminal(ws));
  } else if (url.pathname === "/ws/simulator") {
    simWss.handleUpgrade(req, socket, head, (ws) => handleSimulatorWs(ws));
  } else if (url.pathname === "/ws/video") {
    videoWss.handleUpgrade(req, socket, head, (ws) => {
      videoStream.addClient(ws);
    });
  } else {
    socket.destroy();
  }
});

// --- Terminal ---
function handleTerminal(ws) {
  const ctlFile = `/tmp/pty-ctl-${Date.now()}`;
  const proc = spawn("python3", [path.join(__dirname, "pty-helper.py"), ctlFile], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, TERM: "xterm-256color" },
    cwd: process.env.HOME,
  });

  let helperPid = null;
  proc.stderr.on("data", (data) => {
    const match = data.toString().match(/PID:(\d+)/);
    if (match) helperPid = parseInt(match[1]);
  });

  proc.stdout.on("data", (data) => { if (ws.readyState === 1) ws.send(data); });
  proc.on("exit", () => {
    if (ws.readyState === 1) ws.close();
    try { fs.unlinkSync(ctlFile); } catch {}
  });

  ws.on("message", (msg) => {
    const str = Buffer.isBuffer(msg) ? msg.toString() : msg;
    if (typeof str === "string" && str.charCodeAt(0) === 1) {
      try {
        const size = JSON.parse(str.slice(1));
        fs.writeFileSync(ctlFile, JSON.stringify(size));
        if (helperPid) process.kill(helperPid, "SIGUSR1");
      } catch {}
    } else {
      proc.stdin.write(msg);
    }
  });

  ws.on("close", () => {
    proc.kill();
    try { fs.unlinkSync(ctlFile); } catch {}
  });
}

// --- Simulator WebSocket handler ---
function handleSimulatorWs(ws) {
  ensureSimStream();
  simClients.add(ws);
  ws.on("close", () => {
    simClients.delete(ws);
    // Stop stream if no clients
    if (simClients.size === 0 && simProc && !simProc.killed) {
      simProc.kill();
      simProc = null;
    }
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Remote Dev Server running at http://0.0.0.0:${PORT}`);
});
