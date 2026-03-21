variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "chave-site-prod"
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/LariWerneck/prj-integrador.git"
}

variable "domain" {
  description = "Domain name"
  type        = string
  default     = "azis.duckdns.org"
}

variable "email" {
  description = "Email for Let's Encrypt"
  type        = string
  default     = "larissawerneck8@gmail.com"
}