variable "env" { type = string }
variable "node_type" { type = string }
variable "subnet_ids" { type = list(string) }
variable "vpc_id" { type = string }
variable "redis_security_group_id" { type = string }