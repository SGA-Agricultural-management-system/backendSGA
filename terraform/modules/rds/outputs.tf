output "db_host" { value = aws_db_instance.primary.address }
output "db_port" { value = aws_db_instance.primary.port }