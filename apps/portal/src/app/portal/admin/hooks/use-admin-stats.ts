"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export interface AdminStats {
    totals: {
        users: number;
        recruiters: {
            total: number;
            active: number;
            pending: number;
            suspended: number;
        };
        companies: {
            total: number;
            active: number;
        };
        jobs: {
            total: number;
            active: number;
            closed: number;
        };
        applications: {
            total: number;
        };
        placements: {
            total: number;
            hired: number;
            active: number;
            completed: number;
            failed: number;
        };
        candidates: number;
    };
    pendingActions: {
        recruiterApprovals: number;
        fraudSignals: number;
        pendingPayouts: number;
        activeEscrow: number;
    };
}

interface UseAdminStatsReturn {
    stats: AdminStats | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const defaultStats: AdminStats = {
    totals: {
        users: 0,
        recruiters: { total: 0, active: 0, pending: 0, suspended: 0 },
        companies: { total: 0, active: 0 },
        jobs: { total: 0, active: 0, closed: 0 },
        applications: { total: 0 },
        placements: { total: 0, hired: 0, active: 0, completed: 0, failed: 0 },
        candidates: 0,
    },
    pendingActions: {
        recruiterApprovals: 0,
        fraudSignals: 0,
        pendingPayouts: 0,
        activeEscrow: 0,
    },
};

export function useAdminStats(): UseAdminStatsReturn {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setError("Unauthorized");
                return;
            }

            const client = createAuthenticatedClient(token);

            // Fetch platform stats and pending action counts in parallel
            const [
                statsRes,
                recruitersRes,
                fraudRes,
                payoutsRes,
                escrowRes,
            ] = await Promise.allSettled([
                client.get("/stats?scope=platform&range=all"),
                client.get("/recruiters?status=pending&limit=1"),
                client.get("/fraud-signals?status=active&limit=1"),
                client.get("/payouts?status=pending&limit=1"),
                client.get("/escrow-holds?status=active&limit=1"),
            ]);

            // Extract base stats
            const baseStats = statsRes.status === "fulfilled" ? statsRes.value?.data : null;

            // Build stats object
            const newStats: AdminStats = {
                totals: {
                    users: baseStats?.totalUsers ?? 0,
                    recruiters: {
                        total: baseStats?.totalRecruiters ?? 0,
                        active: baseStats?.activeRecruiters ?? 0,
                        pending: baseStats?.pendingRecruiters ?? 0,
                        suspended: baseStats?.suspendedRecruiters ?? 0,
                    },
                    companies: {
                        total: baseStats?.totalCompanies ?? 0,
                        active: baseStats?.activeCompanies ?? 0,
                    },
                    jobs: {
                        total: baseStats?.totalJobs ?? 0,
                        active: baseStats?.activeJobs ?? 0,
                        closed: baseStats?.closedJobs ?? 0,
                    },
                    applications: {
                        total: baseStats?.totalApplications ?? 0,
                    },
                    placements: {
                        total: baseStats?.totalPlacements ?? 0,
                        hired: baseStats?.hiredPlacements ?? 0,
                        active: baseStats?.activePlacements ?? 0,
                        completed: baseStats?.completedPlacements ?? 0,
                        failed: baseStats?.failedPlacements ?? 0,
                    },
                    candidates: baseStats?.totalCandidates ?? 0,
                },
                pendingActions: {
                    recruiterApprovals:
                        recruitersRes.status === "fulfilled"
                            ? recruitersRes.value?.pagination?.total ?? 0
                            : 0,
                    fraudSignals:
                        fraudRes.status === "fulfilled"
                            ? fraudRes.value?.pagination?.total ?? 0
                            : 0,
                    pendingPayouts:
                        payoutsRes.status === "fulfilled"
                            ? payoutsRes.value?.pagination?.total ?? 0
                            : 0,
                    activeEscrow:
                        escrowRes.status === "fulfilled"
                            ? escrowRes.value?.pagination?.total ?? 0
                            : 0,
                },
            };

            setStats(newStats);
        } catch (err) {
            console.error("Failed to fetch admin stats:", err);
            setError("Failed to load statistics");
            setStats(defaultStats);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats,
    };
}
