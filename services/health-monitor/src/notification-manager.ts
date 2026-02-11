import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";
import { AggregatedServiceStatus } from "./types";

export class NotificationManager {
    private supabase: SupabaseClient;
    // Track which services have active disruption notifications
    private activeNotifications: Map<string, string> = new Map(); // serviceName -> notificationId

    constructor(
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger,
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
    }
}
