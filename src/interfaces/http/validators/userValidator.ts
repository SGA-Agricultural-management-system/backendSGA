import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    farm_name: z.string().optional(),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8),
});