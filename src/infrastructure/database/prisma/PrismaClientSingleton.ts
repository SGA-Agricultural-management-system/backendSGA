import { PrismaClient } from '@prisma/client';
import { env } from '@shared/config/env';
import logger from '@shared/logger';

class PrismaClientSingleton {
    private static instance: PrismaClient;

    static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            PrismaClientSingleton.instance = new PrismaClient({
                log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });
            logger.info('PrismaClient instance created');
        }
        return PrismaClientSingleton.instance;
    }

    static async disconnect(): Promise<void> {
        if (PrismaClientSingleton.instance) {
            await PrismaClientSingleton.instance.$disconnect();
            logger.info('PrismaClient disconnected');
        }
    }
}

export default PrismaClientSingleton;