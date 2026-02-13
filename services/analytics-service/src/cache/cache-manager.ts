import Redis from 'ioredis';
import { createLogger } from '@splits-network/shared-logging';
import { CacheTTL } from '../v2/types';

const logger = createLogger('CacheManager');

export class CacheManager {
    private redis: Redis;

    constructor(redisConfig: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    }) {
        this.redis = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password || undefined,
            db: redisConfig.db,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.redis.on('error', (err) => {
            logger.error({ err }, 'Redis connection error');
        });

        this.redis.on('connect', () => {
            logger.info('Redis connected successfully');
        });
    }

    /**
     * Get value from cache
     */
    async get(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (error) {
            logger.error({ error, key }, 'Cache get error');
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     */
    async set(key: string, value: string, ttl: CacheTTL): Promise<void> {
        try {
            await this.redis.setex(key, ttl, value);
        } catch (error) {
            logger.error({ error, key }, 'Cache set error');
        }
    }

    /**
     * Delete specific key
     */
    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            logger.error({ error, key }, 'Cache delete error');
        }
    }

    /**
     * Invalidate all keys matching pattern
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
            }
        } catch (error) {
            logger.error({ error, pattern }, 'Cache invalidation error');
        }
    }

    /**
     * Invalidate cache for specific user
     */
    async invalidateUser(userId: string): Promise<void> {
        await this.invalidatePattern(`analytics:*:${userId}:*`);
    }

    /**
     * Invalidate cache for specific company
     */
    async invalidateCompany(companyId: string): Promise<void> {
        await this.invalidatePattern(`analytics:company:${companyId}:*`);
    }

    /**
     * Invalidate stats cache
     */
    async invalidateStats(scope: string, userId?: string): Promise<void> {
        if (userId) {
            await this.invalidatePattern(`analytics:stats:${scope}:${userId}:*`);
        } else {
            await this.invalidatePattern(`analytics:stats:${scope}:*`);
        }
    }

    /**
     * Invalidate chart cache
     */
    async invalidateCharts(chartType?: string): Promise<void> {
        if (chartType) {
            await this.invalidatePattern(`analytics:chart:${chartType}:*`);
        } else {
            await this.invalidatePattern(`analytics:chart:*`);
        }
    }

    /**
     * Close Redis connection
     */
    async close(): Promise<void> {
        await this.redis.quit();
    }
}
