#!/usr/bin/env python3
"""
Sends mouse/touch events to the iOS Simulator window.
Usage: echo '{"action":"tap","x":0.5,"y":0.5}' | python3 touch-helper.py
       echo '{"action":"swipe","x1":0.5,"y1":0.8,"x2":0.5,"y2":0.2,"duration":0.3}' | python3 touch-helper.py
       echo '{"action":"home"}' | python3 touch-helper.py

Coordinates are normalized 0-1 relative to the simulator screen content.
Runs as a persistent process reading JSON lines from stdin.
"""
import sys, json, time
import Quartz
from Quartz import (
    CGEventCreateMouseEvent, CGEventPost, kCGEventMouseMoved,
    kCGEventLeftMouseDown, kCGEventLeftMouseUp, kCGHIDEventTap,
    CGEventSetIntegerValueField, CGPointMake,
    CGWindowListCopyWindowInfo, kCGWindowListOptionAll, kCGNullWindowID,
)
import subprocess

TITLE_BAR_HEIGHT = 28  # macOS standard title bar height in points

def get_simulator_content_bounds():
    """Find the Simulator content area (excluding title bar)."""
    windows = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID)
    best = None
    for w in windows:
        owner = w.get("kCGWindowOwnerName", "")
        if "Simulator" not in owner:
            continue
        b = w.get("kCGWindowBounds", {})
        h = b.get("Height", 0)
        w_val = b.get("Width", 0)
        # The device window is the tall one (not menu bars which are 39px tall)
        if h > 100 and w_val > 100:
            area = h * w_val
            if best is None or area > (best["h"] * best["w"]):
                # Offset Y by title bar, shrink height accordingly
                best = {
                    "x": b["X"],
                    "y": b["Y"] + TITLE_BAR_HEIGHT,
                    "w": w_val,
                    "h": h - TITLE_BAR_HEIGHT,
                }
    return best

def send_click(screen_x, screen_y):
    """Send a mouse click at absolute screen coordinates."""
    point = CGPointMake(screen_x, screen_y)
    # Move
    move = CGEventCreateMouseEvent(None, kCGEventMouseMoved, point, 0)
    CGEventPost(kCGHIDEventTap, move)
    time.sleep(0.01)
    # Mouse down
    down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, 0)
    CGEventPost(kCGHIDEventTap, down)
    time.sleep(0.05)
    # Mouse up
    up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, point, 0)
    CGEventPost(kCGHIDEventTap, up)

def send_swipe(x1, y1, x2, y2, duration=0.3):
    """Send a swipe gesture as a mouse drag."""
    steps = max(int(duration / 0.016), 10)
    start = CGPointMake(x1, y1)
    # Move to start
    move = CGEventCreateMouseEvent(None, kCGEventMouseMoved, start, 0)
    CGEventPost(kCGHIDEventTap, move)
    time.sleep(0.01)
    # Mouse down
    down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, start, 0)
    CGEventPost(kCGHIDEventTap, down)
    # Drag
    from Quartz import kCGEventLeftMouseDragged
    for i in range(1, steps + 1):
        t = i / steps
        cx = x1 + (x2 - x1) * t
        cy = y1 + (y2 - y1) * t
        pt = CGPointMake(cx, cy)
        drag = CGEventCreateMouseEvent(None, kCGEventLeftMouseDragged, pt, 0)
        CGEventPost(kCGHIDEventTap, drag)
        time.sleep(duration / steps)
    # Mouse up
    end = CGPointMake(x2, y2)
    up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, end, 0)
    CGEventPost(kCGHIDEventTap, up)

def send_app_switcher():
    """Open app switcher — double Cmd+Shift+H."""
    subprocess.run(
        ["osascript", "-e", 'tell application "Simulator" to activate'],
        capture_output=True, timeout=5)
    time.sleep(0.3)
    subprocess.run(
        ["osascript", "-e", '''tell application "System Events"
  keystroke "h" using {command down, shift down}
  delay 0.3
  keystroke "h" using {command down, shift down}
end tell'''],
        capture_output=True, timeout=5)

def send_home():
    """Press home button — activate Simulator first, then send Cmd+Shift+H."""
    # Activate Simulator so it receives the keystroke
    subprocess.run(
        ["osascript", "-e", 'tell application "Simulator" to activate'],
        capture_output=True, timeout=5)
    time.sleep(0.3)
    # Send Cmd+Shift+H via AppleScript (System Events)
    subprocess.run(
        ["osascript", "-e",
         'tell application "System Events" to keystroke "h" using {command down, shift down}'],
        capture_output=True, timeout=5)

# Signal ready
sys.stdout.write("READY\n")
sys.stdout.flush()

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        cmd = json.loads(line)
        action = cmd.get("action", "tap")
        bounds = get_simulator_content_bounds()

        if not bounds and action != "home":
            sys.stdout.write(json.dumps({"error": "No simulator window found"}) + "\n")
            sys.stdout.flush()
            continue

        if action == "tap":
            nx, ny = cmd["x"], cmd["y"]
            sx = bounds["x"] + nx * bounds["w"]
            sy = bounds["y"] + ny * bounds["h"]
            send_click(sx, sy)
            sys.stdout.write(json.dumps({"ok": True, "action": "tap"}) + "\n")

        elif action == "swipe":
            sx1 = bounds["x"] + cmd["x1"] * bounds["w"]
            sy1 = bounds["y"] + cmd["y1"] * bounds["h"]
            sx2 = bounds["x"] + cmd["x2"] * bounds["w"]
            sy2 = bounds["y"] + cmd["y2"] * bounds["h"]
            dur = cmd.get("duration", 0.3)
            send_swipe(sx1, sy1, sx2, sy2, dur)
            sys.stdout.write(json.dumps({"ok": True, "action": "swipe"}) + "\n")

        elif action == "home":
            send_home()
            sys.stdout.write(json.dumps({"ok": True, "action": "home"}) + "\n")

        elif action == "appswitcher":
            send_app_switcher()
            sys.stdout.write(json.dumps({"ok": True, "action": "appswitcher"}) + "\n")

        else:
            sys.stdout.write(json.dumps({"error": f"Unknown action: {action}"}) + "\n")

        sys.stdout.flush()

    except Exception as e:
        sys.stdout.write(json.dumps({"error": str(e)}) + "\n")
        sys.stdout.flush()
