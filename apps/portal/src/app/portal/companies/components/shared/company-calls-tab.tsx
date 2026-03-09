"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStandardList, PaginationControls, SearchInput } from "@/hooks/use-standard-list";
import { createAuthenticatedClient } from "@/lib/api-client";
import { CallTable } from "@/app/portal/calls/components/table/call-table";
import { CallFilterDropdowns } from "@/app/portal/calls/components/shared/call-filters";
import { CallCreationModal } from "@/components/calls/call-creation-modal";
import type { CallListItem, CallFilters, CallStats, CallTag } from "@/app/portal/calls/types";
import { formatDuration } from "@/app/portal/calls/types";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface CompanyCallsTabProps {
    companyId: string;
    companyName: string;
}

/* ─── Stats Summary ──────────────────────────────────────────────────── */

function EntityCallStats({ stats, loading }: { stats: CallStats | null; loading: boolean }) {
    const items = [
        { label: "Upcoming", value: stats?.upcoming_count ?? 0, icon: "fa-duotone fa-regular fa-calendar-clock" },
        { label: "This Month", value: stats?.this_month_count ?? 0, icon: "fa-duotone fa-regular fa-calendar" },
        { label: "Avg Duration", value: formatDuration(stats?.avg_duration_minutes ?? null), icon: "fa-duotone fa-regular fa-clock" },
        { label: "Follow-up", value: stats?.needs_follow_up_count ?? 0, icon: "fa-duotone fa-regular fa-flag" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-base-200 p-3">
                    <i className={`${item.icon} text-primary`} />
                    <div>
                        {loading ? (
                            <div className="h-5 w-8 bg-base-300 animate-pulse" />
                        ) : (
                            <div className="text-lg font-black">{item.value}</div>
                        )}
                        <div className="text-sm uppercase tracking-wider text-base-content/50">{item.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function CompanyCallsTab({ companyId, companyName }: CompanyCallsTabProps) {
    const { getToken } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState<CallStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [tags, setTags] = useState<CallTag[]>([]);

    const {
        data: calls,
        loading,
        searchInput,
        setSearchInput,
        filters,
        setFilter,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
    } = useStandardList<CallListItem, CallFilters>({
        endpoint: "/calls",
        defaultFilters: { entity_type: "company", entity_id: companyId },
        defaultSortBy: "scheduled_at",
        defaultSortOrder: "desc",
        defaultLimit: 10,
        syncToUrl: false,
    });

    const fetchMeta = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            const [statsRes, tagsRes] = await Promise.all([
                client.get<{ data: CallStats }>(`/calls/stats?entity_type=company&entity_id=${companyId}`),
                client.get<{ data: CallTag[] }>("/calls/tags"),
            ]);
            if (statsRes.data) setStats(statsRes.data);
            if (tagsRes.data) setTags(tagsRes.data);
        } catch {
            // Non-critical
        } finally {
            setStatsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        fetchMeta();
    }, [fetchMeta]);

    return (
        <div className="space-y-4">
            {/* Header + New Call button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Calls</h3>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-phone-plus mr-1" />
                    New Call
                </button>
            </div>

            {/* Stats */}
            <EntityCallStats stats={stats} loading={statsLoading} />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder="Search calls..."
                    className="flex-1 min-w-[180px] max-w-sm"
                />
                <CallFilterDropdowns
                    filters={filters}
                    onFilterChange={setFilter}
                    tags={tags}
                />
            </div>

            {/* Table */}
            {loading && calls.length === 0 ? (
                <div className="py-12 text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading calls...
                    </p>
                </div>
            ) : calls.length === 0 ? (
                <div className="py-12 text-center">
                    <i className="fa-duotone fa-regular fa-video text-4xl text-base-content/15 mb-4 block" />
                    <p className="text-base-content/50">No calls linked to this company yet.</p>
                </div>
            ) : (
                <CallTable calls={calls} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            )}

            {/* Creation Modal */}
            <CallCreationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                defaultEntityType="company"
                defaultEntityId={companyId}
                defaultEntityLabel={companyName}
                onSuccess={() => {
                    setShowCreateModal(false);
                    refresh();
                    fetchMeta();
                }}
            />
        </div>
    );
}
