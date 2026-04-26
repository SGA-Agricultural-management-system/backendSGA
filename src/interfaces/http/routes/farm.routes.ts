import { FastifyInstance } from 'fastify';
import { container } from '@shared/container';
import { FarmController } from '@interfaces/http/controllers/FarmController';
import { authMiddleware } from '@interfaces/http/middleware/authMiddleware';

export async function farmRoutes(app: FastifyInstance) {
    const controller = container.resolve(FarmController);

    app.get('/farms', { preHandler: authMiddleware }, controller.getFarms.bind(controller));
    app.get('/farms/:id', { preHandler: authMiddleware }, controller.getFarmById.bind(controller));
    app.get('/farms/:id/lots', { preHandler: authMiddleware }, controller.getLots.bind(controller));
}