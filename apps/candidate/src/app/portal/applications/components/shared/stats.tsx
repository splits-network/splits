"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCardGrid, StatCard } from "@/components/ui";

interface ApplicationStats {
    total: number;
    active: number;
    interviewing: number;
    offers: number;
}

const emptyStats: ApplicationStats = {
    total: 0,
    active: 0,
    interviewing: 0,
    offers: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<ApplicationStats>(emptyStats);

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
                const response: any = await client.get("/applications", {
                    params: {
                        limit: 1000,
                        include: "job",
                    },
                });

                const items = response.data || [];
                if (!cancelled) {
                    setStats({
                        total:
                            response.pagination?.total || items.length,
                        active: items.filter(
                            (a: any) =>
                                !["rejected", "withdrawn"].includes(
                                    a.stage,
                                ) &&
                                a.job?.status !== "closed" &&
                                a.job?.status !== "filled",
                        ).length,
                        interviewing: items.filter(
                            (a: any) => a.stage === "interview",
                        ).length,
                        offers: items.filter(
                            (a: any) => a.stage === "offer",
                        ).length,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch application stats:", error);
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
                    title="Total Applications"
                    value={stats.total}
                    icon="fa-file-lines"
                    color="primary"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon="fa-circle-check"
                    color="secondary"
                />
                <StatCard
                    title="Interviewing"
                    value={stats.interviewing}
                    icon="fa-comments"
                    color="info"
                />
                <StatCard
                    title="Offers"
                    value={stats.offers}
                    icon="fa-trophy"
                    color="success"
                />
            </StatCardGrid>
        </div>
    );
}
