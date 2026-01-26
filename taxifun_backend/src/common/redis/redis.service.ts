import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly redis: Redis;

    constructor(private readonly configService: ConfigService) {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        this.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.error('Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
        });

        this.redis.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        this.redis.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
        });
    }

    async onModuleDestroy() {
        await this.redis.quit();
    }

    /**
     * Get a value from Redis
     */
    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    /**
     * Set a value in Redis with TTL (in seconds)
     */
    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        await this.redis.setex(key, ttlSeconds, value);
    }

    /**
     * Delete a key from Redis
     */
    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    /**
     * Check if Redis is connected
     */
    isConnected(): boolean {
        return this.redis.status === 'ready';
    }
}
