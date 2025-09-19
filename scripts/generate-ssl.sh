#!/bin/bash
# Generate SSL certificates for Jupiter SIEM

set -e

echo "🔐 Generating SSL certificates for Jupiter SIEM..."

# Create SSL directory
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/key.pem 4096

# Generate certificate signing request
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=US/ST=State/L=City/O=Jupiter SIEM/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Clean up CSR
rm ssl/cert.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates location: ./ssl/"
echo "   - cert.pem (Certificate)"
echo "   - key.pem (Private Key)"
