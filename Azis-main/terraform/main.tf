data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "app_sg" {
  name_prefix = "azis-app-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["87.22.41.246/32"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.app_sg.name]

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    sudo apt update
    sudo apt upgrade -y

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu

    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Install Nginx
    sudo apt install -y nginx

    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx

    # Enable and start services
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo systemctl enable nginx
    sudo systemctl start nginx

    # Clone the repository
    cd /home/ubuntu
    git clone ${var.github_repo} projeto-integrador
    cd projeto-integrador

    # Run docker-compose
    sudo docker-compose up -d

    # Wait for containers to be ready
    sleep 30

    # Configure Nginx
    sudo tee /etc/nginx/sites-available/${var.domain} > /dev/null <<NGINX
    server {
        listen 80;
        server_name ${var.domain};

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
    NGINX

    sudo ln -s /etc/nginx/sites-available/${var.domain} /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx

    # Obtain SSL certificate
    sudo certbot --nginx -d ${var.domain} --non-interactive --agree-tos --email ${var.email}

    # Set up auto-renewal
    sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
  EOF

  tags = {
    Name = "Azis-App-Server"
  }
}

resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}