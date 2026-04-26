import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '@domain/errors/DomainError';
import { ValidationError } from '@domain/errors/ValidationError';
import logger from '@shared/logger';

interface ErrorResponse {
    error: string;
    code: string;
    details?: string;
}

export function errorHandler(
    error: FastifyError | Error,
    request: FastifyRequest,
    reply: FastifyReply,
) {
    logger.error({ err: error, url: request.url }, 'Request error');

    if (error instanceof DomainError) {
        const statusCode = error.statusCode;
        const body: ErrorResponse = {
            error: error.message,
            code: error.code,
        };
        return reply.status(statusCode).send(body);
    }

    if (error instanceof ValidationError) {
        return reply.status(400).send({
            error: error.message,
            code: 'VALIDATION_ERROR',
        });
    }

    // Default to 500
    return reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}