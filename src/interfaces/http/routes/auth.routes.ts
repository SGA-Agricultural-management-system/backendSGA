import { FastifyInstance } from 'fastify';
import { container } from '@shared/container';
import { AuthController } from '@interfaces/http/controllers/AuthController';
import { loginSchema, registerSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, validate } from '@interfaces/http/validators/authValidator';
import { authMiddleware } from '@interfaces/http/middleware/authMiddleware';

export async function authRoutes(app: FastifyInstance) {
    const controller = container.resolve(AuthController);

    app.post('/auth/login', { preHandler: validate(loginSchema) }, controller.login.bind(controller));
    app.post('/auth/register', { preHandler: validate(registerSchema) }, controller.register.bind(controller));
    app.post('/auth/refresh', { preHandler: validate(refreshSchema) }, controller.refresh.bind(controller));
    app.post('/auth/logout', { preHandler: authMiddleware }, controller.logout.bind(controller));
    app.get('/auth/me', { preHandler: authMiddleware }, controller.me.bind(controller));
    app.post('/auth/forgot-password', { preHandler: validate(forgotPasswordSchema) }, controller.forgotPassword.bind(controller));
    app.post('/auth/reset-password', { preHandler: validate(resetPasswordSchema) }, controller.resetPassword.bind(controller));
}