#!/usr/bin/env bash
set -euo pipefail

# Native setup for JupiterV1Alpha (no Docker)
# - Creates Python venv
# - Installs backend dependencies
# - Installs frontend dependencies

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
NATIVE_DIR="${REPO_ROOT}/native"
BACKEND_DIR="${REPO_ROOT}/backend"
FRONTEND_DIR="${REPO_ROOT}/frontend"
VENV_DIR="${NATIVE_DIR}/.venv"

echo "[+] Repository root: ${REPO_ROOT}"

if [[ ! -f "${NATIVE_DIR}/.env" ]]; then
  if [[ -f "${NATIVE_DIR}/env.example" ]]; then
    echo "[i] native/.env not found. Copying env.example -> .env"
    cp "${NATIVE_DIR}/env.example" "${NATIVE_DIR}/.env"
  else
    echo "[!] native/env.example missing; please create env file."
  fi
fi

# Create venv
if [[ ! -d "${VENV_DIR}" ]]; then
  echo "[+] Creating Python venv at ${VENV_DIR}"
  python3 -m venv "${VENV_DIR}"
fi

# Activate venv
# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"

python -m pip install --upgrade pip wheel setuptools

# Install backend dependencies (prefer native file for CPU-friendly install)
REQ_FILE=""
if [[ -f "${BACKEND_DIR}/requirements-native.txt" ]]; then
  REQ_FILE="${BACKEND_DIR}/requirements-native.txt"
  echo "[+] Using ${REQ_FILE} (native CPU-friendly set)"
elif [[ -f "${BACKEND_DIR}/requirements.txt" ]]; then
  REQ_FILE="${BACKEND_DIR}/requirements.txt"
  echo "[+] Using ${REQ_FILE}"
fi

if [[ -n "${REQ_FILE}" ]]; then
  pip install -r "${REQ_FILE}"
else
  # Fallback to compatible/clean files if main requirements files are missing
  for alt in requirements-compatible.txt requirements-clean.txt; do
    if [[ -f "${BACKEND_DIR}/${alt}" ]]; then
      echo "[+] Installing backend requirements from ${BACKEND_DIR}/${alt}"
      pip install -r "${BACKEND_DIR}/${alt}"
      break
    fi
  done
fi

# Ensure dotenv is available for env loading
pip install python-dotenv

# Frontend dependencies
if command -v npm >/dev/null 2>&1; then
  echo "[+] Installing frontend dependencies (npm ci)"
  (cd "${FRONTEND_DIR}" && npm ci)
else
  echo "[!] npm not found. Install Node.js/npm to run the frontend."
fi

echo "[✓] Setup complete. Use ./run_backend.sh and ./run_frontend.sh to start services."
