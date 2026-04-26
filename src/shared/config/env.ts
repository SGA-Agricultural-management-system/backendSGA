import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    DATABASE_URL: z.string().url(),
    JWT_PRIVATE_KEY: z.string().min(1),
    JWT_PUBLIC_KEY: z.string().min(1),
    ACCESS_TOKEN_EXPIRY_MINUTES: z.string().transform(Number).default('15'),
    REFRESH_TOKEN_EXPIRY_DAYS: z.string().transform(Number).default('7'),
    REDIS_URL: z.string().url(),
    CORS_ORIGINS: z.string().default('*'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),
    MAX_ACTIVITIES_PER_PAGE: z.string().transform(Number).default('100'),
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
}

export const env: Env = result.data;