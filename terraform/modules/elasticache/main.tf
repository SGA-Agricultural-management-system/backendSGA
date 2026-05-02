resource "aws_elasticache_subnet_group" "redis" {
  name       = "sga-redis-subnet-${var.env}"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "sga-redis-${var.env}"
  description          = "Redis for SGA ${var.env}"
  node_type            = var.node_type
  port                 = 6379
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]
  automatic_failover_enabled = false
  multi_az_enabled           = false
  num_cache_clusters         = 1

  engine         = "redis"
  engine_version = "7.1"

  lifecycle {
    prevent_destroy = false
  }
}