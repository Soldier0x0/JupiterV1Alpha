# Jupiter SIEM - Production Nginx Container
FROM nginx:alpine

# Install necessary packages
RUN apk add --no-cache \
    curl \
    openssl \
    tzdata

# Create nginx user with specific UID/GID for consistency
RUN addgroup -g 101 nginx && \
    adduser -D -u 101 -G nginx nginx

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /etc/nginx/ssl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check script
RUN echo '#!/bin/sh' > /health-check.sh && \
    echo 'curl -f http://localhost/health || exit 1' >> /health-check.sh && \
    chmod +x /health-check.sh

# Set proper permissions
RUN chown -R nginx:nginx /var/log/nginx /var/cache/nginx /etc/nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /health-check.sh

# Use non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]