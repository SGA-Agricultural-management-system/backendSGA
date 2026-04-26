import { z } from 'zod';

export const createActivitySchema = z.object({
    type: z.enum([
        'Riego', 'Fertilización', 'Fumigación', 'Control de Plagas',
        'Temperatura', 'Cosecha', 'Otro',
    ]),
    lot_id: z.string().uuid(),
    crop: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    date: z.string().datetime(),
    notes: z.string().optional(),
    farm_id: z.string().uuid(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: z.enum([
        'Riego', 'Fertilización', 'Fumigación', 'Control de Plagas',
        'Temperatura', 'Cosecha', 'Otro',
    ]).optional(),
});