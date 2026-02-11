import Redis from "ioredis";
import { Logger } from "@splits-network/shared-logging";
import {
    ServiceCheckResult,
    ServiceStatus,
    AggregatedServiceStatus,
    ServiceDefinition,
} from "./types";

const WINDOW_SIZE = 5;
const FAILURE_THRESHOLD = 3;
const REDIS_PREFIX = "health-monitor";
const AGGREGATED_KEY = `${REDIS_PREFIX}:aggregated`;

function slidingWindowKey(service: string): string {
    return `${REDIS_PREFIX}:window:${service}`;
}

export class SlidingWindowManager {
    constructor(
        private redis: Redis,
        private serviceDefinitions: ServiceDefinition[],
        private logger: Logger,
    ) {}

    async pushResult(result: ServiceCheckResult): Promise<void> {
        const key = slidingWindowKey(result.service);
        const entry = JSON.stringify({
            status: result.status,
            timestamp: result.timestamp,
            responseTime: result.responseTime,
            error: result.error,
        });

        const pipeline = this.redis.pipeline();
        pipeline.rpush(key, entry);
        pipeline.ltrim(key, -WINDOW_SIZE, -1);
        pipeline.expire(key, 300); // 5 min TTL for auto-cleanup
        await pipeline.exec();
    }

    async evaluateService(
        serviceName: string,
    ): Promise<AggregatedServiceStatus> {
        const key = slidingWindowKey(serviceName);
        const entries = await this.redis.lrange(key, 0, -1);
        const definition = this.serviceDefinitions.find(
            (s) => s.name === serviceName,
        );

        const recentResults = entries
            .map((e) => {
                try {
                    return JSON.parse(e);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        const unhealthyCount = recentResults.filter(
            (r: any) => r.status === "unhealthy",
        ).length;
        const degradedCount = recentResults.filter(
            (r: any) => r.status === "degraded",
        ).length;

        let status: ServiceStatus = "healthy";
        if (unhealthyCount >= FAILURE_THRESHOLD) {
            status = "unhealthy";
        } else if (degradedCount >= FAILURE_THRESHOLD) {
            status = "degraded";
        }

        const latest = recentResults[recentResults.length - 1];

        return {
            service: serviceName,
            displayName: definition?.displayName || serviceName,
            status,
            lastCheck: latest?.timestamp || new Date().toISOString(),
            lastResponseTime: latest?.responseTime || 0,
            recentResults: recentResults.map((r: any) => ({
                status: r.status,
                timestamp: r.timestamp,
            })),
            ...(status !== "healthy" &&
                latest?.error && { error: latest.error }),
        };
    }

    async evaluateAndAggregate(): Promise<AggregatedServiceStatus[]> {
        const serviceNames = this.serviceDefinitions.map((s) => s.name);
        const statuses = await Promise.all(
            serviceNames.map((name) => this.evaluateService(name)),
        );

        const hasUnhealthy = statuses.some((s) => s.status === "unhealthy");
        const hasDegraded = statuses.some((s) => s.status === "degraded");
        let overallStatus: ServiceStatus = "healthy";
        if (hasUnhealthy) overallStatus = "unhealthy";
        else if (hasDegraded) overallStatus = "degraded";

        const aggregated = {
            status: overallStatus,
            services: statuses,
            lastUpdated: new Date().toISOString(),
            checkIntervalMs: 15000,
        };

        await this.redis.set(AGGREGATED_KEY, JSON.stringify(aggregated), "EX", 60);

        return statuses;
    }

    static async getAggregated(redis: Redis): Promise<any | null> {
        const data = await redis.get(AGGREGATED_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }
}
