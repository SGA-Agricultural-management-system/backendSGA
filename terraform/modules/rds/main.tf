resource "aws_db_subnet_group" "db" {
  name       = "sga-${var.env}-db-subnet"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "primary" {
  identifier             = "sga-${var.env}-db"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.instance_class
  allocated_storage      = var.storage_size
  max_allocated_storage  = var.max_storage
  multi_az               = var.multi_az
  db_name                = var.db_name
  username               = var.username
  password               = var.password
  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = var.vpc_security_group_ids
  backup_retention_period = var.backup_retention_days
  storage_encrypted      = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "sga-${var.env}-final-snap"
  tags = { Name = "sga-${var.env}-db" }
}