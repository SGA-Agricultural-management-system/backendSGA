import { injectable } from 'tsyringe';
import { ICacheService } from '@application/ports/ICacheService';
import RedisClientSingleton from './RedisClientSingleton';
import Redis from 'ioredis';

@injectable()
export class RedisAdapter implements ICacheService {
    private readonly client: Redis;

    constructor() {
        this.client = RedisClientSingleton.getInstance();
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }
}