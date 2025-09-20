#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
NATIVE_DIR="${REPO_ROOT}/native"
BACKEND_DIR="${REPO_ROOT}/backend"
VENV_DIR="${NATIVE_DIR}/.venv"

# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"

# Load native env
set -a
source "${NATIVE_DIR}/.env" || true
set +a

cd "${BACKEND_DIR}"

# Ensure data dir exists if DUCKDB_PATH refers to it
if [[ -n "${DUCKDB_PATH:-}" ]]; then
  DATA_DIR="$(dirname "${DUCKDB_PATH}")"
  mkdir -p "${DATA_DIR}"
fi

exec uvicorn main:app --host 0.0.0.0 --port 8001 --log-level info
