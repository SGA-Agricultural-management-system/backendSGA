import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { env } from '@shared/config/env';
import { errorHandler } from '@interfaces/http/middleware/errorHandler';
import { requestLogger } from '@interfaces/http/middleware/requestLogger';
import { authRoutes } from '@interfaces/http/routes/auth.routes';
import { farmRoutes } from '@interfaces/http/routes/farm.routes';
import { activityRoutes } from '@interfaces/http/routes/activity.routes';
import { sensorRoutes } from '@interfaces/http/routes/sensor.routes';
import { setupSwagger } from '@interfaces/http/docs/swagger';
import { userRoutes } from '@interfaces/http/routes/user.routes';

export async function buildApp() {
    const app = Fastify({
        logger: false, // Usamos pino manualmente
    });

    // Error handler global
    app.setErrorHandler(errorHandler);

    // Seguridad
    await app.register(fastifyHelmet);
    await app.register(fastifyCors, {
        origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(','),
        credentials: true,
    });

    // Rate limiting global
    await app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            return request.ip;
        },
    });

    // Swagger docs
    await setupSwagger(app);

    // Rutas con prefijo v1
    app.register(authRoutes, { prefix: '/api/v1' });
    app.register(farmRoutes, { prefix: '/api/v1' });
    app.register(activityRoutes, { prefix: '/api/v1' });
    app.register(sensorRoutes, { prefix: '/api/v1' });
    app.register(userRoutes, { prefix: '/api/v1' });

    // Health check endpoint
    app.get('/health', { logLevel: 'warn' }, async () => ({ status: 'ok' }));

    return app;
}