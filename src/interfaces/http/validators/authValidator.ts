import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const registerSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    farm_name: z.string().optional(),
});

export const refreshSchema = z.object({
    refresh_token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    new_password: z.string().min(8),
});

export function validate(schema: z.ZodSchema) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const result = schema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: result.error.flatten().fieldErrors,
            });
        }
        request.body = result.data;
    };
}