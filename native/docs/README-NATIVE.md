# JupiterV1Alpha — Native (No-Docker) Runbook

This folder provides a native Linux setup for running Jupiter SIEM without Docker. It does not modify the existing Docker-based repo.

## Components
- Backend: FastAPI via Uvicorn at :8001 from `backend/main.py` (`main:app`)
- Frontend: Vite build + preview at :3000 from `frontend/`
- Optional reverse proxy: Nginx forwarding `/` -> :3000 and `/api` -> :8001
- Optional systemd services for boot persistence

## Prerequisites (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm nginx
# Recommended Node >= 20 (use nvm if the distro Node is too old)
```

## First-time setup
```bash
cd native
cp env.example .env   # edit values as needed
./setup.sh            # creates venv, installs backend & frontend deps
```

## Run locally (two terminals)
- Backend
```bash
./run_backend.sh
```
- Frontend
```bash
./run_frontend.sh
```

Visit:
- Frontend: http://localhost:3000
- Backend health: http://localhost:8001/api/health

## Optional: Nginx reverse proxy
```bash
sudo cp native/nginx/nginx.conf /etc/nginx/sites-available/jupiter
sudo ln -sf /etc/nginx/sites-available/jupiter /etc/nginx/sites-enabled/jupiter
sudo nginx -t && sudo systemctl reload nginx
```

## Optional: systemd units
```bash
sudo cp native/systemd/jupiter-backend.service /etc/systemd/system/
sudo cp native/systemd/jupiter-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now jupiter-backend jupiter-frontend
```

## Notes
- Backend app import is `main:app` from `backend/main.py`.
- Ports align with docker-compose: 8001 (backend) and 3000 (frontend).
- Uses local Python venv under `native/.venv`.
- This folder is designed to live alongside the existing repo without changing current files.
