import StatusPageClient from "./status-client";
import type { ServiceHealth } from "@splits-network/shared-ui";

export const revalidate = 15;

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
            statuses: data.services.map((s: any) => ({
                name: s.displayName,
                status: s.status,
                timestamp: s.lastCheck,
                responseTime: s.lastResponseTime,
                error: s.error,
            })),
            checkedAt: data.lastUpdated,
        };
    } catch {
        return { statuses: [], checkedAt: new Date().toISOString() };
    }
}

export default async function StatusPage() {
    const { statuses, checkedAt } = await fetchSystemHealth();

    return (
        <StatusPageClient
            initialStatuses={statuses}
            initialCheckedAt={checkedAt}
        />
    );
}
