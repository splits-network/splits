"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    StatCard,
    StatCardGrid,
    ActionCard,
    ActionCardGrid,
} from "@/components/ui/cards";

interface AdminStats {
    totalRecruiters: number;
    activeRecruiters: number;
    pendingRecruiters: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalPlacements: number;
}

export default function AdminDashboardClient() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = await getToken();
                if (!token) {
                    setError("Unauthorized");
                    setLoading(false);
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    "/stats?scope=platform&range=all",
                );

                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
                setError("Failed to load statistics");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [getToken]);

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-base-content/70 mt-1">
                    Platform administration and management
                </p>
            </div>

            {/* Stats Grid */}
            <StatCardGrid>
                <StatCard
                    title="Total Recruiters"
                    value={loading ? "..." : (stats?.totalRecruiters ?? 0)}
                    icon="fa-duotone fa-regular fa-users"
                    color="primary"
                    description={
                        loading
                            ? undefined
                            : `${stats?.activeRecruiters ?? 0} active, ${stats?.pendingRecruiters ?? 0} pending`
                    }
                    href="/portal/admin/recruiters"
                />
                <StatCard
                    title="Active Jobs"
                    value={loading ? "..." : (stats?.activeJobs ?? 0)}
                    icon="fa-duotone fa-regular fa-briefcase"
                    color="secondary"
                    description={
                        loading
                            ? undefined
                            : `${stats?.totalJobs ?? 0} total jobs`
                    }
                    href="/portal/roles"
                />
                <StatCard
                    title="Applications"
                    value={loading ? "..." : (stats?.totalApplications ?? 0)}
                    icon="fa-duotone fa-regular fa-file-lines"
                    color="accent"
                    description="All time"
                    href="/portal/applications"
                />
                <StatCard
                    title="Placements"
                    value={loading ? "..." : (stats?.totalPlacements ?? 0)}
                    icon="fa-duotone fa-regular fa-handshake"
                    color="success"
                    description="Successful hires"
                    href="/portal/placements"
                />
            </StatCardGrid>

            {/* Phase 1 Management */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Phase 1 Management
                </h2>
                <ActionCardGrid columns={3}>
                    <ActionCard
                        title="Recruiter Management"
                        description="Approve and manage recruiters"
                        icon="fa-duotone fa-regular fa-user-check"
                        href="/portal/admin/recruiters"
                        color="primary"
                        badge={
                            !loading && stats && stats.pendingRecruiters > 0 ? (
                                <span className="badge badge-warning gap-1.5">
                                    <i className="fa-duotone fa-regular fa-clock text-xs"></i>
                                    {stats.pendingRecruiters} pending approval
                                </span>
                            ) : undefined
                        }
                    />
                    <ActionCard
                        title="Role Assignments"
                        description="Assign recruiters to roles"
                        icon="fa-duotone fa-regular fa-link"
                        href="/portal/admin/assignments"
                        color="secondary"
                    />
                    <ActionCard
                        title="Placement Audit"
                        description="Review all placements"
                        icon="fa-duotone fa-regular fa-chart-line"
                        href="/portal/admin/placements"
                        color="success"
                    />
                </ActionCardGrid>
            </div>

            {/* Phase 2 Management */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Phase 2 Management
                </h2>
                <ActionCardGrid columns={2}>
                    <ActionCard
                        title="Ownership Audit"
                        description="Review candidate ownership and sourcing conflicts"
                        icon="fa-duotone fa-regular fa-shield-halved"
                        href="/portal/admin/ownership"
                        color="accent"
                    />
                    <ActionCard
                        title="Reputation Management"
                        description="Monitor and manage recruiter reputation scores"
                        icon="fa-duotone fa-regular fa-star"
                        href="/portal/admin/reputation"
                        color="warning"
                    />
                </ActionCardGrid>
            </div>

            {/* Phase 3 Management */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Phase 3: Automation & Intelligence
                </h2>
                <ActionCardGrid columns={3}>
                    <ActionCard
                        title="Payout Management"
                        description="Process and reconcile recruiter payouts"
                        icon="fa-duotone fa-regular fa-money-bill-transfer"
                        href="/portal/admin/payouts"
                        color="success"
                    />
                    <ActionCard
                        title="Billing Profiles"
                        description="Review company billing terms and invoices"
                        icon="fa-duotone fa-regular fa-file-invoice-dollar"
                        href="/portal/admin/billing-profiles"
                        color="primary"
                    />
                    <ActionCard
                        title="Automation Controls"
                        description="Manage automation rules and executions"
                        icon="fa-duotone fa-regular fa-robot"
                        href="/portal/admin/automation"
                        color="info"
                    />
                    <ActionCard
                        title="Fraud Detection"
                        description="Review and resolve fraud signals"
                        icon="fa-duotone fa-regular fa-shield-halved"
                        href="/portal/admin/fraud"
                        color="error"
                    />
                    <ActionCard
                        title="Marketplace Health"
                        description="Platform metrics and health indicators"
                        icon="fa-duotone fa-regular fa-chart-line"
                        href="/portal/admin/metrics"
                        color="primary"
                    />
                    <ActionCard
                        title="AI Match Suggestions"
                        description="Review candidate-role match suggestions"
                        icon="fa-duotone fa-regular fa-wand-magic-sparkles"
                        href="/portal/admin/ai-matches"
                        color="secondary"
                    />
                    <ActionCard
                        title="Decision Audit Log"
                        description="AI and human decision tracking"
                        icon="fa-duotone fa-regular fa-clipboard-list"
                        href="/portal/admin/decision-log"
                        color="accent"
                    />
                    <ActionCard
                        title="Chat Moderation"
                        description="Review reports, evidence, and actions"
                        icon="fa-duotone fa-regular fa-comments-question"
                        href="/portal/admin/chat"
                        color="warning"
                    />
                </ActionCardGrid>
            </div>
        </div>
    );
}
