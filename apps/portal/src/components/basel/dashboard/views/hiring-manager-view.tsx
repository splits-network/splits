"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { useCompanyStats } from "@/app/portal/dashboard/hooks/use-company-stats";
import { useHiringPipeline } from "@/app/portal/dashboard/hooks/use-hiring-pipeline";
import { useCompanyHealth } from "@/app/portal/dashboard/hooks/use-company-health";
import { useRoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";
import { useCompanyActivity } from "@/app/portal/dashboard/hooks/use-company-activity";
import { useApplicationVolume } from "@/app/portal/dashboard/hooks/use-application-volume";
import { useRecruiterScorecard } from "@/app/portal/dashboard/hooks/use-recruiter-scorecard";
import { usePipelineBottleneck } from "@/app/portal/dashboard/hooks/use-pipeline-bottleneck";
import { useSubmissionHeatmap } from "@/app/portal/dashboard/hooks/use-submission-heatmap";
import { useCompanyPlacementTrend } from "@/app/portal/dashboard/hooks/use-company-placement-trend";
import { usePendingReviews } from "@/app/portal/dashboard/hooks/use-pending-reviews";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";
import { HmHeader } from "@/components/basel/dashboard/hiring-manager/hm-header";
import { HmKpis } from "@/components/basel/dashboard/hiring-manager/hm-kpis";
import { HmPendingActions } from "@/components/basel/dashboard/hiring-manager/hm-pending-actions";
import { CompanyCharts } from "@/components/basel/dashboard/company/company-charts";
import { CompanyHiringTrends } from "@/components/basel/dashboard/company/company-hiring-trends";
import { CompanySubmissionHeatmap } from "@/components/basel/dashboard/company/company-submission-heatmap";
import { CompanyBottleneck } from "@/components/basel/dashboard/company/company-bottleneck";
import { CompanyRolePipelineTable } from "@/components/basel/dashboard/company/company-role-pipeline-table";
import { CompanyRoleStatusDonut } from "@/components/basel/dashboard/company/company-role-status-donut";
import { CompanyRecruiterScorecard } from "@/components/basel/dashboard/company/company-recruiter-scorecard";

export default function HiringManagerView() {
    const { userId } = useAuth();
    const { profile } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);

    /* Data hooks — same as company but no cost/billing */
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
    const { recruiters, loading: recruiterScorecardLoading } =
        useRecruiterScorecard();
    const { stages: bottleneckStages, loading: bottleneckLoading } =
        usePipelineBottleneck();
    const { data: placementTrendData, loading: placementTrendLoading } =
        useCompanyPlacementTrend(trendPeriod);
    const { days: heatmapDays, loading: heatmapLoading } =
        useSubmissionHeatmap(trendPeriod, "company");
    const { actions: pendingActions, loading: pendingLoading } =
        usePendingReviews();

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {}, []);
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

    const firstName = profile?.name?.split(" ")[0] || "Hiring Manager";

    return (
        <div className="min-h-screen bg-base-100">
            <BaselAnimator>
                <HmHeader
                    userName={firstName}
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />

                <HmKpis stats={stats} statsLoading={statsLoading} />

                {/* Pipeline funnel + Health + Volume */}
                <CompanyCharts
                    stages={stages}
                    pipelineLoading={pipelineLoading}
                    healthMetrics={healthMetrics}
                    healthLoading={healthLoading}
                    applicationVolumeData={applicationVolumeData}
                    applicationVolumeLoading={applicationVolumeLoading}
                />

                {/* Pending Reviews + Bottleneck (2-col) */}
                <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <HmPendingActions
                            actions={pendingActions}
                            loading={pendingLoading}
                        />
                        <CompanyBottleneck
                            stages={bottleneckStages}
                            loading={bottleneckLoading}
                        />
                    </div>
                </section>

                {/* Hiring Trends + Submission Heatmap (2-col) */}
                <section className="bg-base-100 py-4 lg:py-6 px-4 lg:px-6">
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

                {/* Role Pipeline table + Role Status donut */}
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
            </BaselAnimator>
        </div>
    );
}
