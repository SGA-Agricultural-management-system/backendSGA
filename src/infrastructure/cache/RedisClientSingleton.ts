import Redis from 'ioredis';
import { env } from '@shared/config/env';
import logger from '@shared/logger';

class RedisClientSingleton {
    private static instance: Redis;

    static getInstance(): Redis {
        if (!RedisClientSingleton.instance) {
            RedisClientSingleton.instance = new Redis(env.REDIS_URL, {
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });
            RedisClientSingleton.instance.on('error', (err) => {
                logger.error({ err }, 'Redis connection error');
            });
            RedisClientSingleton.instance.on('connect', () => {
                logger.info('Redis connected');
            });
        }
        return RedisClientSingleton.instance;
    }

    static async disconnect(): Promise<void> {
        if (RedisClientSingleton.instance) {
            await RedisClientSingleton.instance.quit();
            logger.info('Redis disconnected');
        }
    }
}

export default RedisClientSingleton;