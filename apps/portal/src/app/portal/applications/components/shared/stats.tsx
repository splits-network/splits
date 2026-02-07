"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import ApplicationsTrendsChart, {
    calculateApplicationTrends,
} from "@/components/charts/applications-trends-chart";
import type { ApplicationStage } from "@splits-network/shared-types";

interface ApplicationStats {
    total: number;
    awaitingReview: number;
    aiPending: number;
    acceptedByCompany: number;
}

interface StatsApplication {
    id: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    ai_reviewed: boolean;
    created_at: string;
}

const emptyStats: ApplicationStats = {
    total: 0,
    awaitingReview: 0,
    aiPending: 0,
    acceptedByCompany: 0,
};

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<ApplicationStats>(emptyStats);
    const [applications, setApplications] = useState<StatsApplication[]>([]);

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
                const response = await client.get("/applications", {
                    params: { limit: 1000 },
                });

                const apps: StatsApplication[] = response.data || [];

                const awaitingReviewStages = new Set([
                    "submitted",
                    "screen",
                    "interview",
                ]);

                const computed = apps.reduce(
                    (acc, app) => {
                        if (awaitingReviewStages.has(app.stage)) {
                            acc.awaitingReview += 1;
                        }
                        if (
                            app.stage === "ai_review" &&
                            !app.ai_reviewed
                        ) {
                            acc.aiPending += 1;
                        }
                        if (app.accepted_by_company) {
                            acc.acceptedByCompany += 1;
                        }
                        return acc;
                    },
                    { awaitingReview: 0, aiPending: 0, acceptedByCompany: 0 },
                );

                if (!cancelled) {
                    setApplications(apps);
                    setStats({
                        total:
                            response.pagination?.total || apps.length,
                        ...computed,
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
    }, [getToken, isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-folder-open"
                    color="primary"
                    description="All applications"
                />
                <StatCard
                    title="Awaiting Review"
                    value={stats.awaitingReview}
                    icon="fa-duotone fa-regular fa-hourglass-half"
                    color="warning"
                    description="Need action"
                />
                <StatCard
                    title="AI Reviews Pending"
                    value={stats.aiPending}
                    icon="fa-duotone fa-regular fa-robot"
                    color="info"
                    description="Queued for AI triage"
                />
                <StatCard
                    title="Accepted by Company"
                    value={stats.acceptedByCompany}
                    icon="fa-duotone fa-regular fa-circle-check"
                    color="success"
                    description="Greenlit offers"
                />
            </StatCardGrid>
            <div className="p-4 pt-0">
                <ApplicationsTrendsChart
                    applications={applications as any[]}
                    loading={applications.length === 0}
                    trendPeriod={6}
                    onTrendPeriodChange={() => {}}
                />
            </div>
        </div>
    );
}
