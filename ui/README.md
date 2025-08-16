# Jupiter SIEM UI

## Quickstart

1. Add the following entry to your `/etc/hosts` file:

   ```bash
   echo "127.0.0.1 projectjupiter" | sudo tee -a /etc/hosts
   ```

2. Generate self-signed TLS certificates:

   ```bash
   bash ui/gen-certs.sh
   ```

3. Build and run the application using Docker Compose:

   ```bash
   docker compose --profile core up -d --build
   ```

4. Access the application at:

   [https://projectjupiter:8443](https://projectjupiter:8443)

   > Note: If your browser warns about the self-signed certificate, proceed for local development.

## Features

- **HTTPS with HTTP/2**: Secure and fast communication.
- **Reverse Proxy**: API and WebSocket requests proxied to the backend.
- **Security Headers**: CSP, HSTS, Referrer-Policy, and more.
- **Static Asset Optimization**: Gzip/Brotli compression and caching.

## Customization

- Change the external port by setting the `UI_EXTERNAL_PORT` environment variable.
- Replace self-signed certificates with trusted ones for production use.
