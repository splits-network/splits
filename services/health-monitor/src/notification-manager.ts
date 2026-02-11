import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";
import { AggregatedServiceStatus } from "./types";
import { EventPublisher } from "./event-publisher";

export class NotificationManager {
    private supabase: SupabaseClient;
    // Track which services have active disruption notifications
    private activeNotifications: Map<string, string> = new Map(); // serviceName -> notificationId

    constructor(
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger,
        private eventPublisher: EventPublisher | null = null,
    ) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async initialize(): Promise<void> {
        const { data, error } = await this.supabase
            .from("site_notifications")
            .select("id, metadata")
            .eq("source", "health-monitor")
            .eq("type", "service_disruption")
            .eq("is_active", true);

        if (error) {
            this.logger.error(
                { err: error },
                "Failed to load active health notifications",
            );
            return;
        }

        for (const notification of data || []) {
            const serviceName = notification.metadata?.service_name;
            if (serviceName) {
                this.activeNotifications.set(serviceName, notification.id);
            }
        }

        this.logger.info(
            { activeCount: this.activeNotifications.size },
            "Loaded active health notifications from database",
        );
    }

    async onServiceUnhealthy(status: AggregatedServiceStatus): Promise<void> {
        if (this.activeNotifications.has(status.service)) return;

        const severityMap: Record<string, string> = {
            unhealthy: "error",
            degraded: "warning",
        };

        const { data, error } = await this.supabase
            .from("site_notifications")
            .insert({
                type: "service_disruption",
                severity: severityMap[status.status] || "error",
                source: "health-monitor",
                title: status.displayName,
                message: `${status.displayName} is currently experiencing issues.`,
                is_active: true,
                dismissible: true,
                metadata: {
                    service_name: status.service,
                    display_name: status.displayName,
                    error: status.error,
                },
            })
            .select("id")
            .single();

        if (error) {
            this.logger.error(
                { err: error, service: status.service },
                "Failed to create disruption notification",
            );
            return;
        }

        this.activeNotifications.set(status.service, data.id);
        this.logger.info(
            { service: status.service, notificationId: data.id },
            "Disruption notification created",
        );

        // Publish event for email alerting
        if (this.eventPublisher) {
            await this.eventPublisher.publish(
                "system.health.service_unhealthy",
                {
                    service_name: status.service,
                    display_name: status.displayName,
                    severity: status.status,
                    error: status.error || null,
                    notification_id: data.id,
                },
            );
        }
    }

    async onServiceRecovered(serviceName: string): Promise<void> {
        const notificationId = this.activeNotifications.get(serviceName);
        if (!notificationId) return;

        const { error } = await this.supabase
            .from("site_notifications")
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", notificationId);

        if (error) {
            this.logger.error(
                { err: error, service: serviceName, notificationId },
                "Failed to deactivate disruption notification",
            );
            return;
        }

        this.activeNotifications.delete(serviceName);
        this.logger.info(
            { service: serviceName, notificationId },
            "Disruption notification deactivated",
        );

        // Publish recovery event for email alerting
        if (this.eventPublisher) {
            // Look up display name from service definitions
            const displayName = serviceName
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            await this.eventPublisher.publish(
                "system.health.service_recovered",
                {
                    service_name: serviceName,
                    display_name: displayName,
                    notification_id: notificationId,
                },
            );
        }
    }

    /**
     * DB-level cleanup: deactivate ALL active health-monitor notifications
     * for services that are currently healthy. Catches orphaned notifications
     * that the in-memory map missed (restarts, duplicates, race conditions).
     */
    async cleanupHealthyServices(
        healthyServiceNames: string[],
    ): Promise<void> {
        if (healthyServiceNames.length === 0) return;

        const healthySet = new Set(healthyServiceNames);

        // Query all active health-monitor disruption notifications
        const { data, error } = await this.supabase
            .from("site_notifications")
            .select("id, metadata")
            .eq("source", "health-monitor")
            .eq("type", "service_disruption")
            .eq("is_active", true);

        if (error) {
            this.logger.error(
                { err: error },
                "Failed to query health notifications for cleanup",
            );
            return;
        }

        // Find notifications for services that are now healthy
        const orphanedIds = (data || [])
            .filter((n: any) => {
                const svc = n.metadata?.service_name;
                return svc && healthySet.has(svc);
            })
            .map((n: any) => n.id);

        if (orphanedIds.length === 0) return;

        // Deactivate them all
        const { error: updateError } = await this.supabase
            .from("site_notifications")
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .in("id", orphanedIds);

        if (updateError) {
            this.logger.error(
                { err: updateError },
                "Failed to cleanup orphaned health notifications",
            );
            return;
        }

        // Sync in-memory map
        for (const n of data || []) {
            const svc = n.metadata?.service_name;
            if (svc && healthySet.has(svc)) {
                this.activeNotifications.delete(svc);
            }
        }

        this.logger.warn(
            {
                cleaned: orphanedIds.length,
                services: (data || [])
                    .filter((n: any) => healthySet.has(n.metadata?.service_name))
                    .map((n: any) => n.metadata?.service_name),
            },
            "Cleaned up orphaned health-monitor notifications",
        );
    }
}
