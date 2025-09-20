#!/bin/bash

CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

CRT_FILE="$CERT_DIR/projectjupiter.crt"
KEY_FILE="$CERT_DIR/projectjupiter.key"

if [ ! -f "$CRT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/CN=projectjupiter" \
    -addext "subjectAltName=DNS:projectjupiter"
  echo "Self-signed certificate generated at $CERT_DIR"
else
  echo "Certificates already exist at $CERT_DIR"
fi
