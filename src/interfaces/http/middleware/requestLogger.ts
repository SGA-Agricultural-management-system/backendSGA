import { FastifyReply, FastifyRequest } from 'fastify';
import logger from '@shared/logger';

export async function requestLogger(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    logger.info(
        { method: request.method, url: request.url, query: request.query, params: request.params },
        'Incoming request',
    );
}