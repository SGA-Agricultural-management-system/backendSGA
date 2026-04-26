import 'reflect-metadata';
import { buildApp } from '@interfaces/http/server';
import { env } from '@shared/config/env';
import logger from '@shared/logger';

async function start() {
    try {
        const app = await buildApp();
        await app.listen({ port: env.PORT, host: '0.0.0.0' });
        logger.info(`Server listening on port ${env.PORT}`);
        logger.info(`Swagger docs available at http://localhost:${env.PORT}/documentation`);
    } catch (err) {
        logger.fatal({ err }, 'Failed to start server');
        process.exit(1);
    }
}

start();