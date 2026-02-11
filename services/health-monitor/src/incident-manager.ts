import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";
import { AggregatedServiceStatus } from "./types";

export interface StatusTransition {
    service: string;
    transition: string;
}

export class IncidentManager {
    private supabase: SupabaseClient;
    private activeIncidents: Map<string, string> = new Map(); // serviceName -> incidentId

    constructor(
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger,
    ) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async initialize(): Promise<void> {
        const { data, error } = await this.supabase
            .from("health_incidents")
            .select("id, service_name")
            .is("resolved_at", null);

        if (error) {
            this.logger.error({ err: error }, "Failed to load active incidents");
            return;
        }

        for (const incident of data || []) {
            this.activeIncidents.set(incident.service_name, incident.id);
        }

        this.logger.info(
            { activeCount: this.activeIncidents.size },
            "Loaded active incidents from database",
        );
    }

    async processStatusChanges(
        statuses: AggregatedServiceStatus[],
    ): Promise<StatusTransition[]> {
        const transitions: StatusTransition[] = [];

        for (const status of statuses) {
            const hasActiveIncident = this.activeIncidents.has(status.service);
            const isHealthy = status.status === "healthy";

            if (!isHealthy && !hasActiveIncident) {
                await this.openIncident(status);
                transitions.push({
                    service: status.service,
                    transition: `healthy -> ${status.status}`,
                });
            } else if (isHealthy && hasActiveIncident) {
                await this.resolveIncident(status.service);
                transitions.push({
                    service: status.service,
                    transition: "incident -> healthy",
                });
            } else if (!isHealthy && hasActiveIncident) {
                await this.updateIncidentSeverity(status);
            }
        }

        return transitions;
    }

    private async openIncident(
        status: AggregatedServiceStatus,
    ): Promise<void> {
        const { data, error } = await this.supabase
            .from("health_incidents")
            .insert({
                service_name: status.service,
                severity: status.status,
                error_details: {
                    error: status.error,
                    recentResults: status.recentResults,
                },
            })
            .select("id")
            .single();

        if (error) {
            this.logger.error(
                { err: error, service: status.service },
                "Failed to create incident",
            );
            return;
        }

        this.activeIncidents.set(status.service, data.id);
        this.logger.warn(
            {
                service: status.service,
                incidentId: data.id,
                severity: status.status,
            },
            "Incident opened",
        );
    }

    private async resolveIncident(serviceName: string): Promise<void> {
        const incidentId = this.activeIncidents.get(serviceName);
        if (!incidentId) return;

        const { error } = await this.supabase
            .from("health_incidents")
            .update({
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", incidentId);

        if (error) {
            this.logger.error(
                { err: error, service: serviceName, incidentId },
                "Failed to resolve incident",
            );
            return;
        }

        this.activeIncidents.delete(serviceName);
        this.logger.info(
            { service: serviceName, incidentId },
            "Incident resolved",
        );
    }

    private async updateIncidentSeverity(
        status: AggregatedServiceStatus,
    ): Promise<void> {
        const incidentId = this.activeIncidents.get(status.service);
        if (!incidentId) return;

        await this.supabase
            .from("health_incidents")
            .update({
                severity: status.status,
                error_details: {
                    error: status.error,
                    recentResults: status.recentResults,
                },
                updated_at: new Date().toISOString(),
            })
            .eq("id", incidentId);
    }
}
