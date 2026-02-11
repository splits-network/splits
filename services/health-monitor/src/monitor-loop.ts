import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";
import { HealthChecker } from "./health-checker";
import { SlidingWindowManager } from "./sliding-window";
import { IncidentManager } from "./incident-manager";
import { NotificationManager } from "./notification-manager";
import { EventPublisher } from "./event-publisher";

const CHECK_INTERVAL_MS = 15_000;

export class MonitorLoop {
    private timer: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;
    private supabase: SupabaseClient | null;

    constructor(
        private healthChecker: HealthChecker,
        private slidingWindow: SlidingWindowManager,
        private incidentManager: IncidentManager | null,
        private notificationManager: NotificationManager | null,
        private eventPublisher: EventPublisher | null,
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger,
        private dryRun = false,
    ) {
        this.supabase = dryRun ? null : createClient(supabaseUrl, supabaseKey);
    }

    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.logger.info(
            { intervalMs: CHECK_INTERVAL_MS },
            "Starting health monitor loop",
        );

        this.runCycle();
        this.timer = setInterval(() => this.runCycle(), CHECK_INTERVAL_MS);
    }

    stop(): void {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.logger.info("Health monitor loop stopped");
    }

    private async runCycle(): Promise<void> {
        try {
            // Step 1: Check all services
            const results = await this.healthChecker.checkAll();

            // Step 2: Push results into sliding windows
            await Promise.all(
                results.map((r) => this.slidingWindow.pushResult(r)),
            );

            // Step 3: Evaluate sliding windows and write aggregated status
            const aggregated = await this.slidingWindow.evaluateAndAggregate();

            // Steps 4-7 are skipped in dry-run mode (no DB/event writes)
            if (this.dryRun) {
                const unhealthyCount = aggregated.filter(
                    (s) => s.status !== "healthy",
                ).length;
                this.logger.debug(
                    { unhealthyCount, dryRun: true },
                    "Health check cycle complete (dry-run, DB writes skipped)",
                );
                return;
            }

            // Step 4: Persist raw check results to health_checks table
            await this.persistHealthChecks(results);

            // Step 5: Process incident transitions
            const transitions =
                await this.incidentManager!.processStatusChanges(aggregated);

            // Step 6: Process notification transitions
            for (const status of aggregated) {
                if (status.status !== "healthy") {
                    await this.notificationManager!.onServiceUnhealthy(status);
                } else {
                    await this.notificationManager!.onServiceRecovered(
                        status.service,
                    );
                }
            }

            // Step 6b: DB-level cleanup of orphaned notifications for healthy services
            const healthyServices = aggregated
                .filter((s) => s.status === "healthy")
                .map((s) => s.service);
            await this.notificationManager!.cleanupHealthyServices(
                healthyServices,
            );

            // Step 7: Publish events for status transitions
            if (this.eventPublisher && transitions.length > 0) {
                for (const t of transitions) {
                    const eventType = t.transition.includes("healthy")
                        ? "system.health.service_recovered"
                        : "system.health.service_unhealthy";
                    await this.eventPublisher.publish(eventType, {
                        service: t.service,
                        transition: t.transition,
                    });
                }
            }

            // Log summary
            const unhealthyCount = aggregated.filter(
                (s) => s.status !== "healthy",
            ).length;
            if (unhealthyCount > 0) {
                this.logger.warn(
                    { unhealthyCount, transitions },
                    "Health check cycle complete - degradation detected",
                );
            } else {
                this.logger.debug("Health check cycle complete - all healthy");
            }
        } catch (error) {
            this.logger.error({ err: error }, "Health check cycle failed");
        }
    }

    private async persistHealthChecks(
        results: import("./types").ServiceCheckResult[],
    ): Promise<void> {
        if (!this.supabase) {
            this.logger.debug(
                "Skipping health check persistence (dry run mode)",
            );
            return;
        }

        const rows = results.map((r) => ({
            service_name: r.service,
            status: r.status,
            response_time_ms: r.responseTime || 0,
            error_message: r.error || null,
            checked_at: r.timestamp,
            check_details: r.checks || null,
        }));

        const { error } = await this.supabase
            .from("health_checks")
            .insert(rows);

        if (error) {
            this.logger.error(
                { err: error },
                "Failed to persist health checks",
            );
        }
    }
}
