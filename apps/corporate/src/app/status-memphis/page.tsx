import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import StatusMemphisClient from "./status-client";
import type { ServiceHealth } from "@splits-network/shared-ui";

export const revalidate = 15;

export const metadata: Metadata = {
    title: "Platform Status | Employment Networks",
    description:
        "Live system health for the Employment Networks platform. Monitor service status, response times, and incident history in real time.",
    ...buildCanonical("/status-memphis"),
};

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

export default async function StatusMemphisPage() {
    const { statuses, checkedAt } = await fetchSystemHealth();

    return (
        <StatusMemphisClient
            initialStatuses={statuses}
            initialCheckedAt={checkedAt}
        />
    );
}
