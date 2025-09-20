# 🧰 Command Reference

Common operational commands for Jupiter SIEM.

- Docker
  - docker-compose up -d
  - docker-compose down
  - docker-compose logs -f
- systemd
  - systemctl status jupiter-backend
  - systemctl restart jupiter-backend
- SSL
  - certbot certonly --standalone -d siem.yourdomain.com
- Health
  - curl -I http://localhost:8000/api/health
