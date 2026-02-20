import type { Metadata } from "next";
import StatusClient from "./status-client";
import type { ServiceHealth } from "@splits-network/shared-ui";

export const revalidate = 15;

export const metadata: Metadata = {
    title: "Platform Status | Splits Network",
    description:
        "Live system health for the Splits Network platform. Monitor service status, response times, and incident history in real time.",
    alternates: {
        canonical:
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://status.splits.network",
    },
};

interface HealthIncident {
    id: string;
    service_name: string;
    severity: string;
    started_at: string;
    resolved_at: string | null;
    duration_seconds: number | null;
}

async function fetchSystemHealth(): Promise<{
    statuses: ServiceHealth[];
    checkedAt: string;
}> {
    try {
        const gatewayUrl =
            process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
        const response = await fetch(`${gatewayUrl}/api/v2/system-health`, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });
        const json = await response.json().catch(() => ({}));
        const data = json.data;
        if (!data?.services) {
            return { statuses: [], checkedAt: new Date().toISOString() };
        }
        return {
            statuses: data.services.map(
                (s: {
                    displayName: string;
                    status: string;
                    lastCheck: string;
                    lastResponseTime: number;
                    error?: string;
                }) => ({
                    name: s.displayName,
                    status: s.status,
                    timestamp: s.lastCheck,
                    responseTime: s.lastResponseTime,
                    error: s.error,
                }),
            ),
            checkedAt: data.lastUpdated,
        };
    } catch {
        return { statuses: [], checkedAt: new Date().toISOString() };
    }
}

async function fetchIncidents(): Promise<HealthIncident[]> {
    try {
        const gatewayUrl =
            process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
        const response = await fetch(
            `${gatewayUrl}/api/v2/system-health/incidents?limit=50`,
            {
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            },
        );
        const json = await response.json().catch(() => ({}));
        return json.data || [];
    } catch {
        return [];
    }
}

export default async function StatusPage() {
    const [{ statuses, checkedAt }, incidents] = await Promise.all([
        fetchSystemHealth(),
        fetchIncidents(),
    ]);

    return (
        <StatusClient
            initialStatuses={statuses}
            initialCheckedAt={checkedAt}
            initialIncidents={incidents}
        />
    );
}
