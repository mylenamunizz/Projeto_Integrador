output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.app_eip.public_ip
}

output "application_url" {
  description = "URL of the deployed application"
  value       = "https://${var.domain}"
}