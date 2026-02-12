"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface ConnectionStats {
    total: number;
    pending: number;
    active: number;
    declined: number;
}

const emptyStats: ConnectionStats = {
    total: 0,
    pending: 0,
    active: 0,
    declined: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<ConnectionStats>(emptyStats);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) setStats(emptyStats);
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                const [totalRes, pendingRes, activeRes, declinedRes]: any[] =
                    await Promise.all([
                        client.get("/recruiter-companies", { params: { limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "pending", limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "active", limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "declined", limit: 1 } }),
                    ]);

                if (!cancelled) {
                    setStats({
                        total: totalRes.pagination?.total || 0,
                        pending: pendingRes.pagination?.total || 0,
                        active: activeRes.pagination?.total || 0,
                        declined: declinedRes.pagination?.total || 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch connection stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total Connections"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-handshake"
                    color="primary"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon="fa-duotone fa-regular fa-clock"
                    color="info"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon="fa-duotone fa-regular fa-circle-check"
                    color="success"
                />
                <StatCard
                    title="Declined"
                    value={stats.declined}
                    icon="fa-duotone fa-regular fa-circle-xmark"
                    color="error"
                />
            </StatCardGrid>
        </div>
    );
}
