import { Logger } from "@splits-network/shared-logging";
import { ServiceDefinition, ServiceCheckResult, ServiceStatus } from "./types";

export class HealthChecker {
    constructor(
        private services: ServiceDefinition[],
        private logger: Logger,
        private timeoutMs: number = 5000,
    ) {}

    async checkService(service: ServiceDefinition): Promise<ServiceCheckResult> {
        const startTime = Date.now();
        try {
            const response = await fetch(
                `${service.url}${service.healthPath}`,
                {
                    signal: AbortSignal.timeout(this.timeoutMs),
                    headers: { Accept: "application/json" },
                },
            );
            const responseTime = Date.now() - startTime;
            const data = await response.json().catch(() => ({})) as {
                status?: string;
                checks?: Record<string, any>;
                error?: string;
            };

            let status: ServiceStatus = "unhealthy";
            if (response.ok && data.status === "healthy") {
                status = "healthy";
            } else if (response.ok && data.status === "degraded") {
                status = "degraded";
            }

            return {
                service: service.name,
                status,
                responseTime,
                timestamp: new Date().toISOString(),
                checks: data.checks,
                ...(status !== "healthy" && {
                    error: data.error || response.statusText || "Service returned unhealthy status",
                }),
            };
        } catch (error) {
            return {
                service: service.name,
                status: "unhealthy",
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                error:
                    error instanceof Error
                        ? error.message
                        : "Health check failed",
            };
        }
    }

    async checkAll(): Promise<ServiceCheckResult[]> {
        const results = await Promise.allSettled(
            this.services.map((s) => this.checkService(s)),
        );

        return results.map((result, i) => {
            if (result.status === "fulfilled") {
                return result.value;
            }
            this.logger.error(
                { service: this.services[i].name, err: result.reason },
                "Health check promise rejected unexpectedly",
            );
            return {
                service: this.services[i].name,
                status: "unhealthy" as ServiceStatus,
                responseTime: 0,
                timestamp: new Date().toISOString(),
                error: "Health check failed unexpectedly",
            };
        });
    }
}
