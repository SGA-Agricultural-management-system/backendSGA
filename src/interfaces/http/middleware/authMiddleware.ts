import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from '@shared/container';
import { ITokenService } from '@application/ports/ITokenService';
import { AuthenticationError } from '@domain/errors/AuthenticationError';
import logger from '@shared/logger';

declare module 'fastify' {
    interface FastifyRequest {
        userId?: string;
        userRole?: string;
    }
}

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
            error: 'No authorization token provided',
            code: 'AUTHENTICATION_ERROR',
        });
    }

    const token = authHeader.substring(7);
    const tokenService = container.resolve<ITokenService>('ITokenService');
    const result = await tokenService.verifyAccessToken(token);

    if (result.isFailure) {
        return reply.status(401).send({
            error: result.error.message,
            code: 'AUTHENTICATION_ERROR',
        });
    }

    request.userId = result.value.userId;
    request.userRole = result.value.role;
}