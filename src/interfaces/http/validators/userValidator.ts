import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    farm_name: z.string().optional(),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1),
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