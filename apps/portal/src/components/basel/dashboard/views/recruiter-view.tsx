"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import RoleWizardModal from "@/app/portal/roles/components/modals/role-wizard-modal";
import { useRecruiterStats } from "@/app/portal/dashboard/hooks/use-recruiter-stats";
import { useFunnelData } from "@/app/portal/dashboard/hooks/use-funnel-data";
import { useCommissionData } from "@/app/portal/dashboard/hooks/use-commission-data";
import { useReputationData } from "@/app/portal/dashboard/hooks/use-reputation-data";
import { usePipelineActivity } from "@/app/portal/dashboard/hooks/use-pipeline-activity";
import { useTopRoles } from "@/app/portal/dashboard/hooks/use-top-roles";
import { useTopMatches } from "@/app/portal/dashboard/hooks/use-top-matches";
import { usePlacementTrendData } from "@/app/portal/dashboard/hooks/use-placement-trend-data";
import { useDashboardRealtime } from "@/app/portal/dashboard/hooks/use-dashboard-realtime";
import { BaselAnimator } from "@/app/portal/dashboard/basel-animator";
import { MarketplaceProfileBanner } from "@/components/basel/dashboard/marketplace-profile-banner";
import { RecruiterHeader } from "@/components/basel/dashboard/recruiter/recruiter-header";
import { RecruiterKpis } from "@/components/basel/dashboard/recruiter/recruiter-kpis";
import { RecruiterAlerts } from "@/components/basel/dashboard/recruiter/recruiter-alerts";
import { RecruiterCharts } from "@/components/basel/dashboard/recruiter/recruiter-charts";
import { RecruiterEarningsForecast } from "@/components/basel/dashboard/recruiter/recruiter-earnings-forecast";
import { RecruiterSpeedCard } from "@/components/basel/dashboard/recruiter/recruiter-speed-card";
import { RecruiterActivityFeed } from "@/components/basel/dashboard/recruiter/recruiter-activity-feed";

export default function RecruiterView() {
    const { userId, getToken } = useAuth();
    const { profile, getCompanyIdsWithPermission } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [canCreateRole, setCanCreateRole] = useState(false);

    useEffect(() => {
        if (getCompanyIdsWithPermission("can_create_jobs").length > 0) {
            setCanCreateRole(true);
            return;
        }
        let cancelled = false;
        async function checkFirm() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: any[] }>(
                    "/firms/my-firms",
                );
                if (!cancelled && res.data?.length > 0) setCanCreateRole(true);
            } catch {
                /* not a firm member */
            }
        }
        checkFirm();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getCompanyIdsWithPermission]);

    /* Data hooks */
    const {
        stats,
        loading: statsLoading,
        refresh: refreshStats,
    } = useRecruiterStats();
    const { stages, loading: funnelLoading } = useFunnelData(trendPeriod);
    const {
        segments: commissionSegments,
        total: commissionTotal,
        loading: commissionLoading,
    } = useCommissionData(trendPeriod);
    const { metrics: reputation, loading: reputationLoading } =
        useReputationData();
    const {
        applications,
        loading: pipelineLoading,
        refresh: refreshPipeline,
    } = usePipelineActivity();
    const {
        roles,
        loading: rolesLoading,
        refresh: refreshRoles,
    } = useTopRoles();
    const {
        matches: topMatches,
        loading: matchesLoading,
        refresh: refreshMatches,
    } = useTopMatches();
    const {
        data: placementTrendData,
        loading: placementTrendLoading,
        refresh: refreshPlacementTrend,
    } = usePlacementTrendData(trendPeriod);

    /* Realtime */
    const handleStatsUpdate = useCallback(() => {
        refreshStats();
    }, [refreshStats]);
    const handleChartsUpdate = useCallback(() => {
        /* hooks refetch on their own */
    }, []);
    const handleReconnect = useCallback(() => {
        refreshStats();
        refreshRoles();
        refreshPipeline();
        refreshMatches();
        refreshPlacementTrend();
    }, [
        refreshStats,
        refreshRoles,
        refreshPipeline,
        refreshMatches,
        refreshPlacementTrend,
    ]);

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
                <RecruiterHeader
                    name={profile?.name || "Recruiter"}
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                    canCreateRole={canCreateRole}
                    onCreateRole={() => setShowAddRoleModal(true)}
                />

                <MarketplaceProfileBanner />

                <RecruiterKpis
                    stats={stats}
                    statsLoading={statsLoading}
                    matchCount={topMatches.length}
                    matchesLoading={matchesLoading}
                />

                <RecruiterAlerts
                    stats={stats}
                    statsLoading={statsLoading}
                />

                <RecruiterCharts
                    stages={stages}
                    funnelLoading={funnelLoading}
                    commissionSegments={commissionSegments}
                    commissionTotal={commissionTotal}
                    commissionLoading={commissionLoading}
                    placementTrendData={placementTrendData}
                    placementTrendLoading={placementTrendLoading}
                    reputation={reputation}
                    reputationLoading={reputationLoading}
                />

                {/* Row: Earnings Forecast (2/3) + Speed Gauge (1/3) */}
                <section className="bg-base-100 px-4 lg:px-6 pb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <RecruiterEarningsForecast
                                stages={stages}
                                funnelLoading={funnelLoading}
                                commissionTotal={commissionTotal}
                            />
                        </div>
                        <RecruiterSpeedCard />
                    </div>
                </section>

                <RecruiterActivityFeed
                    applications={applications}
                    pipelineLoading={pipelineLoading}
                    roles={roles}
                    rolesLoading={rolesLoading}
                    matches={topMatches}
                    matchesLoading={matchesLoading}
                />
            </BaselAnimator>

            <ModalPortal>
                {showAddRoleModal && (
                    <RoleWizardModal
                        isOpen={showAddRoleModal}
                        mode="create"
                        onClose={() => setShowAddRoleModal(false)}
                        onSuccess={() => setShowAddRoleModal(false)}
                    />
                )}
            </ModalPortal>
        </div>
    );
}
