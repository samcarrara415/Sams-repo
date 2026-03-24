#!/usr/bin/env python3
"""
PTY helper — spawns a login shell in a real PTY and bridges stdin/stdout.
Resize: write JSON to control file, then send SIGUSR1 to this process.
"""
import os, sys, pty, select, signal, struct, fcntl, termios, json

CONTROL_FILE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pty-helper-ctl"
SHELL = os.environ.get("SHELL", "/bin/zsh")

# openpty returns (master_fd, slave_fd)
master_fd, slave_fd = pty.openpty()

child = os.fork()
if child == 0:
    # Child process
    os.close(master_fd)
    os.setsid()
    # Set the slave as controlling terminal
    fcntl.ioctl(slave_fd, termios.TIOCSCTTY, 0)
    os.dup2(slave_fd, 0)
    os.dup2(slave_fd, 1)
    os.dup2(slave_fd, 2)
    if slave_fd > 2:
        os.close(slave_fd)
    os.environ["TERM"] = "xterm-256color"
    os.execvp(SHELL, [SHELL, "-l"])

# Parent process
os.close(slave_fd)

# Set master_fd non-blocking
flags = fcntl.fcntl(master_fd, fcntl.F_GETFL)
fcntl.fcntl(master_fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)

# Set stdin non-blocking
flags = fcntl.fcntl(0, fcntl.F_GETFL)
fcntl.fcntl(0, fcntl.F_SETFL, flags | os.O_NONBLOCK)

def set_size(cols, rows):
    winsize = struct.pack("HHHH", rows, cols, 0, 0)
    fcntl.ioctl(master_fd, termios.TIOCSWINSZ, winsize)
    try:
        os.kill(child, signal.SIGWINCH)
    except ProcessLookupError:
        pass

def handle_usr1(signum, frame):
    try:
        with open(CONTROL_FILE, "r") as f:
            data = json.load(f)
            set_size(data.get("cols", 80), data.get("rows", 24))
    except:
        pass

signal.signal(signal.SIGUSR1, handle_usr1)

# Default size
set_size(120, 40)

# Tell parent our PID
sys.stderr.write(f"PID:{os.getpid()}\n")
sys.stderr.flush()

try:
    while True:
        rlist, _, _ = select.select([0, master_fd], [], [], 0.05)

        if 0 in rlist:
            try:
                data = os.read(0, 65536)
                if not data:
                    break
                os.write(master_fd, data)
            except BlockingIOError:
                pass
            except OSError:
                break

        if master_fd in rlist:
            try:
                data = os.read(master_fd, 65536)
                if not data:
                    break
                os.write(1, data)
            except BlockingIOError:
                pass
            except OSError:
                break

        # Check if child exited
        try:
            rpid, status = os.waitpid(child, os.WNOHANG)
            if rpid != 0:
                break
        except ChildProcessError:
            break

except (SystemExit, KeyboardInterrupt):
    pass
finally:
    try:
        os.kill(child, signal.SIGTERM)
    except:
        pass
    try:
        os.close(master_fd)
    except:
        pass
