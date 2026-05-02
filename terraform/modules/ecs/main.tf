resource "aws_ecs_cluster" "main" {
  name = var.cluster_name
}

resource "aws_ecs_task_definition" "app" {
  family                   = "sga-${var.env}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name  = "sga-backend"
    image = var.container_image
    portMappings = [{ containerPort = var.container_port }]
    secrets = var.secrets
    environment = [for k, v in var.environment_vars : { name = k, value = v }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/sga-backend-${var.env}"
        awslogs-region        = "us-east-1"
        awslogs-stream-prefix = "ecs"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
    }
  }])
}

resource "aws_ecs_service" "app" {
  name            = "sga-${var.env}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = "sga-backend"
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}