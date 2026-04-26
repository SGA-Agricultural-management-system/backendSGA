import { FastifyInstance } from 'fastify';
import { container } from '@shared/container';
import { UserController } from '@interfaces/http/controllers/UserController';
import { authMiddleware } from '@interfaces/http/middleware/authMiddleware';
import { updateProfileSchema, changePasswordSchema, validate } from '@interfaces/http/validators/userValidator';

export async function userRoutes(app: FastifyInstance) {
    const controller = container.resolve(UserController);

    app.put(
        '/users/me',
        { preHandler: [authMiddleware, validate(updateProfileSchema)] },
        controller.updateProfile.bind(controller),
    );

    app.put(
        '/users/me/password',
        { preHandler: [authMiddleware, validate(changePasswordSchema)] },
        controller.changePassword.bind(controller),
    );
}