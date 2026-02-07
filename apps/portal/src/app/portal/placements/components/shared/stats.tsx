"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import { formatCurrency } from "../../types";

interface PlacementStats {
    total: number;
    totalEarnings: number;
    thisYearEarnings: number;
    avgCommission: number;
}

const emptyStats: PlacementStats = {
    total: 0,
    totalEarnings: 0,
    thisYearEarnings: 0,
    avgCommission: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<PlacementStats>(emptyStats);

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
                const response = await client.get("/placements", {
                    params: { limit: 1000 },
                });

                const placements: any[] = response.data || [];
                const currentYear = new Date().getFullYear();

                const totalEarnings = placements.reduce(
                    (sum, p) => sum + (p.recruiter_share || 0),
                    0,
                );

                const thisYearPlacements = placements.filter(
                    (p) =>
                        p.hired_at &&
                        new Date(p.hired_at).getFullYear() === currentYear,
                );
                const thisYearEarnings = thisYearPlacements.reduce(
                    (sum, p) => sum + (p.recruiter_share || 0),
                    0,
                );

                const total = response.pagination?.total || placements.length;

                if (!cancelled) {
                    setStats({
                        total,
                        totalEarnings,
                        thisYearEarnings,
                        avgCommission:
                            placements.length > 0
                                ? Math.round(totalEarnings / placements.length)
                                : 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch placement stats:", error);
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
                    title="Total Placements"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-trophy"
                    color="primary"
                    description="All time"
                />
                <StatCard
                    title="Total Earnings"
                    value={formatCurrency(stats.totalEarnings)}
                    icon="fa-duotone fa-regular fa-sack-dollar"
                    color="success"
                    description="All placements"
                />
                <StatCard
                    title={`${new Date().getFullYear()} Earnings`}
                    value={formatCurrency(stats.thisYearEarnings)}
                    icon="fa-duotone fa-regular fa-calendar-days"
                    color="secondary"
                    description="This year"
                />
                <StatCard
                    title="Avg. Commission"
                    value={formatCurrency(stats.avgCommission)}
                    icon="fa-duotone fa-regular fa-dollar-sign"
                    color="info"
                    description="Per placement"
                />
            </StatCardGrid>
        </div>
    );
}
