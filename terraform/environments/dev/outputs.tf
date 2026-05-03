output "db_host" {
  value = module.rds.db_host
}

output "redis_endpoint" {
  value = module.elasticache.redis_endpoint
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}