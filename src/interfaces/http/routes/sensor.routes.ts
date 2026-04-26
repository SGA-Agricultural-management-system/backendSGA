import { FastifyInstance } from 'fastify';
import { container } from '@shared/container';
import { SensorController } from '@interfaces/http/controllers/SensorController';
import { authMiddleware } from '@interfaces/http/middleware/authMiddleware';

export async function sensorRoutes(app: FastifyInstance) {
    const controller = container.resolve(SensorController);

    app.get(
        '/farms/:id/sensors/latest',
        { preHandler: authMiddleware },
        controller.latest.bind(controller),
    );
}