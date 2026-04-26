import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function setupSwagger(app: FastifyInstance) {
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'SGA Backend API',
                description: 'Sistema de Gestión Agroindustrial',
                version: '1.0.0',
            },
            servers: [
                { url: 'http://localhost:3000/api/v1', description: 'Development' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            deepLinking: true,
        },
    });
}