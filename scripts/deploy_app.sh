#!/bin/bash
set -e

# Clone the repository
cd /home/ubuntu
git clone https://github.com/yourusername/projeto-integrador.git
cd projeto-integrador

# Run docker-compose
sudo docker-compose up -d

# Wait for containers to be ready
sleep 30

# Configure Nginx
sudo tee /etc/nginx/sites-available/azis.duckdns.org > /dev/null <<EOF
server {
    listen 80;
    server_name azis.duckdns.org;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/azis.duckdns.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

