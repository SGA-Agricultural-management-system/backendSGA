module "vpc" {
  source = "../../modules/vpc"
  env               = var.env
  vpc_cidr          = var.vpc_cidr
  azs               = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  data_subnet_cidrs    = var.data_subnet_cidrs
}

# Security Groups
resource "aws_security_group" "ecs" {
  name        = "sga-${var.env}-ecs-sg"
  vpc_id      = module.vpc.vpc_id
  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [module.alb.alb_sg_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
}
}

resource "aws_security_group" "rds" {
  name        = "sga-${var.env}-rds-sg"
  vpc_id      = module.vpc.vpc_id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
}

resource "aws_security_group" "redis" {
  name        = "sga-${var.env}-redis-sg"
  vpc_id      = module.vpc.vpc_id
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
}

module "alb" {
  source          = "../../modules/alb"
  env             = var.env
  alb_name        = "sga-${var.env}-alb"
  public_subnet_ids = module.vpc.public_subnet_ids
  vpc_id          = module.vpc.vpc_id
  certificate_arn = var.certificate_arn
}

module "ecr" {
  source    = "../../modules/ecr"
  repo_name = "sga-backend"
}

module "rds" {
  source                  = "../../modules/rds"
  env                     = var.env
  instance_class          = var.instance_class
  storage_size            = var.rds_storage
  max_storage             = 100
  multi_az                = var.multi_az
  backup_retention_days   = var.backup_retention_days
  subnet_ids              = module.vpc.data_subnet_ids
  vpc_security_group_ids  = [aws_security_group.rds.id]
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
}

module "elasticache" {
  source                = "../../modules/elasticache"
  env                   = var.env
  node_type             = var.node_type
  subnet_ids            = module.vpc.data_subnet_ids
  vpc_id                = module.vpc.vpc_id
  redis_security_group_id = aws_security_group.redis.id
}

# IAM roles - si no tienes permisos, comentamos este módulo y usamos roles existentes
# module "iam" {
#   source = "../../modules/iam"
#   env    = var.env
# }

# Para simplificar, usamos el rol de ejecución por defecto "ecsTaskExecutionRole" que puede existir en la cuenta
data "aws_iam_role" "ecs_execution" {
  name = "ecsTaskExecutionRole"
}

# Rol de tarea (puedes usar uno existente o crearlo manualmente)
resource "aws_iam_role" "ecs_task" {
  name = "sga-${var.env}-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

# Asignamos política gestionada para S3 (opcional)
resource "aws_iam_role_policy_attachment" "task_s3" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"  # en producción restringir a solo los buckets necesarios
}

# Secretos desde Secrets Manager (los creamos manualmente después)
locals {
  secrets = [
    {
      name      = "DATABASE_URL"
      valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:sga/${var.env}/database"
    },
    {
      name      = "JWT_PRIVATE_KEY"
      valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:sga/${var.env}/jwt"
    },
    {
      name      = "JWT_PUBLIC_KEY"
      valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:sga/${var.env}/jwt"
    },
    {
      name      = "REDIS_URL"
      valueFrom = "arn:aws:secretsmanager:us-east-1:${data.aws_caller_identity.current.account_id}:secret:sga/${var.env}/redis"
    }
  ]
}

data "aws_caller_identity" "current" {}

module "ecs" {
  source               = "../../modules/ecs"
  env                  = var.env
  cluster_name         = "sga-cluster-${var.env}"
  cpu                  = var.ecs_cpu
  memory               = var.ecs_memory
  desired_count        = var.desired_count
  container_image      = "${module.ecr.repo_url}:${var.image_tag}"
  container_port       = var.container_port
  private_subnet_ids   = module.vpc.private_subnet_ids
  vpc_id               = module.vpc.vpc_id
  alb_target_group_arn = module.alb.target_group_arn
  ecs_sg_id            = aws_security_group.ecs.id
  execution_role_arn   = data.aws_iam_role.ecs_execution.arn
  task_role_arn        = aws_iam_role.ecs_task.arn
  secrets              = local.secrets
  environment_vars = {
    PORT = "8000"
    CORS_ORIGINS = "*"
    LOG_LEVEL = "debug"
    BCRYPT_SALT_ROUNDS = "12"
    MAX_ACTIVITIES_PER_PAGE = "100"
    ACCESS_TOKEN_EXPIRY_MINUTES = "15"
    REFRESH_TOKEN_EXPIRY_DAYS = "7"
  }
}