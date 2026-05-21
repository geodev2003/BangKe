#!/usr/bin/env python3
"""
Auto-deploy server: nhận webhook từ GitHub, tự pull code và rebuild Docker.
Chạy: python deploy_server.py
Port: 9999
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess, hmac, hashlib, json, os, threading, logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')

# ── Cấu hình ──────────────────────────────────────────────────────────────────
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "your-secret-here")
PROJECT_DIR    = os.getenv("PROJECT_DIR",    r"D:\Code\final")
PORT           = int(os.getenv("DEPLOY_PORT", "9999"))

def deploy():
    """Pull code mới và rebuild Docker."""
    logging.info("🚀 Starting deploy...")
    cmds = [
        ["git", "-C", PROJECT_DIR, "pull", "origin", "main"],
        ["docker-compose", "-f", f"{PROJECT_DIR}\\docker-compose.yml",
         "up", "-d", "--build"],
    ]
    for cmd in cmds:
        logging.info(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        logging.info(result.stdout)
        if result.returncode != 0:
            logging.error(result.stderr)
            return False
    logging.info("✅ Deploy completed!")
    return True

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/deploy":
            self.send_response(404); self.end_headers(); return

        length  = int(self.headers.get("Content-Length", 0))
        payload = self.rfile.read(length)

        # Verify GitHub signature
        sig = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(
            WEBHOOK_SECRET.encode(), payload, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(sig, expected):
            logging.warning("Invalid signature!")
            self.send_response(401); self.end_headers()
            return

        # Chỉ deploy khi push vào main
        try:
            data = json.loads(payload)
            if data.get("ref") != "refs/heads/main":
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Skipped (not main branch)")
                return
        except: pass

        # Deploy trong background
        threading.Thread(target=deploy, daemon=True).start()

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Deploy started!")

    def log_message(self, format, *args):
        logging.info(f"{self.address_string()} - {format % args}")

if __name__ == "__main__":
    logging.info(f"🌐 Deploy server running on port {PORT}")
    logging.info(f"📁 Project dir: {PROJECT_DIR}")
    logging.info(f"👂 Webhook URL: http://YOUR_IP:{PORT}/deploy")
    HTTPServer(("0.0.0.0", PORT), WebhookHandler).serve_forever()
