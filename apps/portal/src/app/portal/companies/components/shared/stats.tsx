"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface CompanyStats {
    totalMarketplace: number;
    myCompanies: number;
    pendingConnections: number;
}

const emptyStats: CompanyStats = {
    totalMarketplace: 0,
    myCompanies: 0,
    pendingConnections: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<CompanyStats>(emptyStats);

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

                const [marketplaceResponse, activeResponse, pendingResponse]: any[] =
                    await Promise.all([
                        client.get("/companies", {
                            params: { limit: 1, browse_all: "true" },
                        }),
                        client.get("/recruiter-companies", {
                            params: { status: "active", limit: 1 },
                        }),
                        client.get("/recruiter-companies", {
                            params: { status: "pending", limit: 1 },
                        }),
                    ]);

                const active = activeResponse.pagination?.total || 0;
                const pending = pendingResponse.pagination?.total || 0;
                const totalMarketplace =
                    marketplaceResponse.pagination?.total || 0;

                if (!cancelled) {
                    setStats({
                        totalMarketplace,
                        myCompanies: active,
                        pendingConnections: pending,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch company stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Marketplace"
                    value={stats.totalMarketplace}
                    icon="fa-duotone fa-regular fa-store"
                    color="primary"
                />
                <StatCard
                    title="My Companies"
                    value={stats.myCompanies}
                    icon="fa-duotone fa-regular fa-handshake"
                    color="success"
                />
                <StatCard
                    title="Pending"
                    value={stats.pendingConnections}
                    icon="fa-duotone fa-regular fa-clock"
                    color="warning"
                />
            </StatCardGrid>
        </div>
    );
}
