"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import {
    CandidatesTrendsChart,
    calculateCandidateStatTrends,
} from "@/components/charts/candidates-trends-chart";

interface CandidateStats {
    total: number;
    myCandidates: number;
    verified: number;
    pendingVerification: number;
}

interface TrendCandidate {
    id: string;
    full_name: string;
    email: string;
    verification_status?: string;
    has_active_relationship?: boolean;
    is_sourcer?: boolean;
    is_new?: boolean;
    created_at: string;
}

const emptyStats: CandidateStats = {
    total: 0,
    myCandidates: 0,
    verified: 0,
    pendingVerification: 0,
};

const TIME_PERIODS = [
    { label: "1 Month", value: 1 },
    { label: "3 Months", value: 3 },
    { label: "6 Months", value: 6 },
    { label: "12 Months", value: 12 },
];

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [stats, setStats] = useState<CandidateStats>(emptyStats);
    const [candidates, setCandidates] = useState<TrendCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [trendPeriod, setTrendPeriod] = useState(6);

    const statTrends = useMemo(
        () => calculateCandidateStatTrends(candidates, trendPeriod),
        [candidates, trendPeriod],
    );

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isLoaded) return;
            setLoading(true);

            const token = await getToken();
            if (!token) {
                if (!cancelled) {
                    setStats(emptyStats);
                    setCandidates([]);
                    setLoading(false);
                }
                return;
            }

            try {
                const client = createAuthenticatedClient(token);

                const [
                    allResponse,
                    mineResponse,
                    verifiedResponse,
                    pendingResponse,
                ]: any[] = await Promise.all([
                    client.get("/candidates", {
                        params: { scope: "all", limit: 100 },
                    }),
                    client.get("/candidates", {
                        params: { scope: "mine", limit: 1 },
                    }),
                    client.get("/candidates", {
                        params: {
                            scope: "all",
                            verification_status: "verified",
                            limit: 1,
                        },
                    }),
                    client.get("/candidates", {
                        params: {
                            scope: "all",
                            verification_status: "pending",
                            limit: 1,
                        },
                    }),
                ]);

                if (!cancelled) {
                    setStats({
                        total: allResponse.pagination?.total || 0,
                        myCandidates: mineResponse.pagination?.total || 0,
                        verified: verifiedResponse.pagination?.total || 0,
                        pendingVerification:
                            pendingResponse.pagination?.total || 0,
                    });
                    setCandidates(allResponse.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch candidate stats:", error);
                if (!cancelled) {
                    setStats(emptyStats);
                    setCandidates([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
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
                    title="Total Candidates"
                    value={stats.total}
                    icon="fa-users"
                    color="primary"
                    trend={statTrends.total}
                    trendLabel={
                        TIME_PERIODS.find((p) => p.value === trendPeriod)?.label
                    }
                />
                <StatCard
                    title="My Candidates"
                    value={stats.myCandidates}
                    icon="fa-user-check"
                    color="success"
                />
                <StatCard
                    title="Verified"
                    value={stats.verified}
                    icon="fa-badge-check"
                    color="info"
                    trend={statTrends.verified}
                    trendLabel={
                        TIME_PERIODS.find((p) => p.value === trendPeriod)?.label
                    }
                />
                {isRecruiter && (
                    <StatCard
                        title="With Relationships"
                        value={
                            candidates.filter((c) => c.has_active_relationship)
                                .length
                        }
                        icon="fa-handshake"
                        color="warning"
                        trend={statTrends.withRelationships}
                        trendLabel={
                            TIME_PERIODS.find((p) => p.value === trendPeriod)
                                ?.label
                        }
                    />
                )}
                {!isRecruiter && (
                    <StatCard
                        title="Pending"
                        value={stats.pendingVerification}
                        icon="fa-clock"
                        color="warning"
                    />
                )}
            </StatCardGrid>
            <div className="p-4 pt-0">
                <CandidatesTrendsChart
                    candidates={candidates}
                    loading={loading && candidates.length === 0}
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
            </div>
        </div>
    );
}
