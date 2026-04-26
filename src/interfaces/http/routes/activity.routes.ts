import { FastifyInstance } from 'fastify';
import { container } from '@shared/container';
import { ActivityController } from '@interfaces/http/controllers/ActivityController';
import { authMiddleware } from '@interfaces/http/middleware/authMiddleware';
import { createActivitySchema, updateActivitySchema, validate } from '@interfaces/http/validators/activityValidator';

export async function activityRoutes(app: FastifyInstance) {
    const controller = container.resolve(ActivityController);

    app.get(
        '/farms/:id/activities',
        { preHandler: authMiddleware },
        controller.getActivities.bind(controller),
    );

    app.post(
        '/activities',
        { preHandler: [authMiddleware, validate(createActivitySchema)] },
        controller.createActivity.bind(controller),
    );

    app.put(
        '/activities/:id',
        { preHandler: [authMiddleware, validate(updateActivitySchema)] },
        controller.updateActivity.bind(controller),
    );

    app.delete(
        '/activities/:id',
        { preHandler: authMiddleware },
        controller.deleteActivity.bind(controller),
    );
}