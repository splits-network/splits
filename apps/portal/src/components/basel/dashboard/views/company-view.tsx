"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import RoleWizardModal from "@/app/portal/roles/components/modals/role-wizard-modal";
import { useCompanyStats } from "@/app/portal/dashboard/hooks/use-company-stats";
import { useHiringPipeline } from "@/app/portal/dashboard/hooks/use-hiring-pipeline";
import { useCompanyHealth } from "@/app/portal/dashboard/hooks/use-company-health";
import { useRoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";
import { useCompanyActivity } from "@/app/portal/dashboard/hooks/use-company-activity";
import { useApplicationVolume } from "@/app/portal/dashboard/hooks/use-application-volume";
import { useCostMetrics } from "@/app/portal/dashboard/hooks/use-cost-metrics";
import { useRecruiterScorecard } from "@/app/portal/dashboard/hooks/use-recruiter-scorecard";
import { usePipelineBottleneck } from "@/app/portal/dashboard/hooks/use-pipeline-bottleneck";
import { useCompanyPlacementTrend } from "@/app/portal/dashboard/hooks/use-company-placement-trend";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import { useSubmissionHeatmap } from "@/app/portal/dashboard/hooks/use-submission-heatmap";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";
import { CompanyHeader } from "@/components/basel/dashboard/company/company-header";
import { CompanyBillingBanner } from "@/components/basel/dashboard/company/company-billing-banner";
import { CompanyKpis } from "@/components/basel/dashboard/company/company-kpis";
import { CompanyCharts } from "@/components/basel/dashboard/company/company-charts";
import { CompanyCostCard } from "@/components/basel/dashboard/company/company-cost-card";
import { CompanyVelocityChart } from "@/components/basel/dashboard/company/company-velocity-chart";
import { CompanyBottleneck } from "@/components/basel/dashboard/company/company-bottleneck";
import { CompanyHiringTrends } from "@/components/basel/dashboard/company/company-hiring-trends";
import { CompanySubmissionHeatmap } from "@/components/basel/dashboard/company/company-submission-heatmap";
import { CompanyRolePipelineTable } from "@/components/basel/dashboard/company/company-role-pipeline-table";
import { CompanyRoleStatusDonut } from "@/components/basel/dashboard/company/company-role-status-donut";
import { CompanyRecruiterScorecard } from "@/components/basel/dashboard/company/company-recruiter-scorecard";
import { CompanyOperations } from "@/components/basel/dashboard/company/company-operations";

export default function CompanyView() {
    const { userId, getToken } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    /* Resolve company ID for billing check */
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        async function resolveCompany() {
            const orgId = profile?.organization_ids?.[0];
            if (!orgId) return;
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{
                    data: Array<{
                        id: string;
                        identity_organization_id: string;
                    }>;
                }>("/companies");
                const match = (res.data || []).find(
                    (c) => c.identity_organization_id === orgId,
                );
                if (match) setCompanyId(match.id);
            } catch {
                /* Company resolution failed */
            }
        }
        resolveCompany();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.organization_ids]);

    const { status: billingStatus, loading: billingLoading } =
        useCompanyBillingStatus(companyId);

    /* Data hooks */
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = useCompanyStats();
    const { stages, loading: pipelineLoading } =
        useHiringPipeline(trendPeriod);
    const { metrics: healthMetrics, loading: healthLoading } =
        useCompanyHealth();
    const { roles, loading: rolesLoading } = useRoleBreakdown();
    const { activities, loading: activityLoading } = useCompanyActivity();
    const { data: applicationVolumeData, loading: applicationVolumeLoading } =
        useApplicationVolume(trendPeriod);
    const {
        metrics: costMetrics,
        monthlySpend,
        loading: costLoading,
    } = useCostMetrics();
    const { recruiters, loading: recruiterScorecardLoading } =
        useRecruiterScorecard();
    const { stages: bottleneckStages, loading: bottleneckLoading } =
        usePipelineBottleneck();
    const { data: placementTrendData, loading: placementTrendLoading } =
        useCompanyPlacementTrend(trendPeriod);
    const { days: heatmapDays, loading: heatmapLoading } =
        useSubmissionHeatmap(trendPeriod, "company");

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {
        /* hooks refetch on their own */
    }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
    }, [refreshStats]);

    useDashboardRealtime({
        enabled: !!userId,
        userId: userId || undefined,
        onStatsUpdate: handleStatsUpdate,
        onChartsUpdate: handleChartsUpdate,
        onReconnect: handleReconnect,
    });

    return (
        <div className="min-h-screen bg-base-100">
            <BaselAnimator>
                <CompanyHeader
                    companyName={profile?.name || "Company"}
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                    onPostRole={() => setIsRoleModalOpen(true)}
                />

                <CompanyBillingBanner
                    companyId={companyId}
                    billingStatus={billingStatus}
                    billingLoading={billingLoading}
                />

                <CompanyKpis
                    stats={stats}
                    statsLoading={statsLoading}
                    costMetrics={costMetrics}
                    costLoading={costLoading}
                />

                {/* Analytics: Funnel+Table pair, Health+Volume pair */}
                <CompanyCharts
                    stages={stages}
                    pipelineLoading={pipelineLoading}
                    healthMetrics={healthMetrics}
                    healthLoading={healthLoading}
                    applicationVolumeData={applicationVolumeData}
                    applicationVolumeLoading={applicationVolumeLoading}
                />

                {/* Hiring Trends line + Submission Heatmap (2-col) */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CompanyHiringTrends
                            applicationData={applicationVolumeData}
                            applicationLoading={applicationVolumeLoading}
                            placementData={placementTrendData}
                            placementLoading={placementTrendLoading}
                        />
                        <CompanySubmissionHeatmap
                            days={heatmapDays}
                            loading={heatmapLoading}
                        />
                    </div>
                </section>

                {/* Spend + Velocity + Bottleneck (3-col) */}
                <section className="bg-base-100 px-4 lg:px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <CompanyCostCard
                            costMetrics={costMetrics}
                            loading={costLoading}
                            placementsByMonth={monthlySpend.map((m) => ({
                                month: m.month,
                                count: 0,
                                cost: m.cost,
                            }))}
                        />
                        <CompanyVelocityChart
                            data={placementTrendData}
                            loading={placementTrendLoading}
                        />
                        <CompanyBottleneck
                            stages={bottleneckStages}
                            loading={bottleneckLoading}
                        />
                    </div>
                </section>

                {/* Role Pipeline table + Role Status donut (GA-style chart+table pair) */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-3">
                            <CompanyRolePipelineTable
                                roles={roles}
                                loading={rolesLoading}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <CompanyRoleStatusDonut
                                roles={roles}
                                loading={rolesLoading}
                            />
                        </div>
                    </div>
                </section>

                {/* Recruiter Scorecard */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
                    <CompanyRecruiterScorecard
                        recruiters={recruiters}
                        loading={recruiterScorecardLoading}
                    />
                </section>

                {/* Operations: Roles table + Activity feed */}
                <CompanyOperations
                    roles={roles}
                    rolesLoading={rolesLoading}
                    activities={activities}
                    activityLoading={activityLoading}
                />
            </BaselAnimator>

            <ModalPortal>
                <RoleWizardModal
                    isOpen={isRoleModalOpen}
                    onClose={() => setIsRoleModalOpen(false)}
                    onSuccess={refreshStats}
                />
            </ModalPortal>
        </div>
    );
}
