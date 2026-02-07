"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface RecruiterStats {
    total: number;
    active: number;
    avgPlacements: number;
    topRated: number;
}

const emptyStats: RecruiterStats = {
    total: 0,
    active: 0,
    avgPlacements: 0,
    topRated: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<RecruiterStats>(emptyStats);

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
                const response: any = await client.get("/recruiters", {
                    params: {
                        limit: 1000,
                        filters: JSON.stringify({
                            marketplace_enabled: true,
                        }),
                    },
                });

                const items = response.data || [];

                if (!cancelled) {
                    const totalPlacements = items.reduce(
                        (sum: number, r: any) =>
                            sum + (r.total_placements || 0),
                        0,
                    );
                    const topRatedCount = items.filter(
                        (r: any) =>
                            r.reputation_score !== undefined &&
                            r.reputation_score >= 80,
                    ).length;

                    setStats({
                        total:
                            response.pagination?.total || items.length,
                        active: items.filter(
                            (r: any) => r.status === "active",
                        ).length,
                        avgPlacements:
                            items.length > 0
                                ? Math.round(totalPlacements / items.length)
                                : 0,
                        topRated: topRatedCount,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch recruiter stats:", error);
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
                    title="Total Recruiters"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-users"
                    color="primary"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon="fa-duotone fa-regular fa-circle-check"
                    color="success"
                />
                <StatCard
                    title="Avg. Placements"
                    value={stats.avgPlacements}
                    icon="fa-duotone fa-regular fa-handshake"
                    color="info"
                />
                <StatCard
                    title="Top Rated"
                    value={stats.topRated}
                    icon="fa-duotone fa-regular fa-star"
                    color="warning"
                />
            </StatCardGrid>
        </div>
    );
}
