#!/data/data/com.termux/files/usr/bin/bash
cd ~/KSV/gateway
set -a; . ./.env; set +a
pkill -f "node server.js" 2>/dev/null; sleep 1
PORT=4000 node server.js
