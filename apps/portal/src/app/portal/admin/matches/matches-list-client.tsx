"use client";

import { useMemo, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    SearchInput,
    PaginationControls,
    LoadingState,
    ErrorState,
    EmptyState,
} from "@/hooks/use-standard-list";
import { AdminPageHeader } from "../components";
import { MatchTableRow } from "./components/match-table-row";
import { UpgradePrompt } from "@/components/entitlements/upgrade-prompt";
import type { EnrichedMatch, MatchTier, MatchStatus } from "@splits-network/shared-types";

interface MatchFilters {
    match_tier?: MatchTier;
    status?: MatchStatus;
    min_score?: number;
}

export default function MatchesListClient() {
    const { getToken } = useAuth();
    const [dismissingId, setDismissingId] = useState<string | null>(null);

    const defaultFilters = useMemo<MatchFilters>(() => ({ status: "active" }), []);

    const {
        items: matches,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
        updateItem,
    } = useStandardList<EnrichedMatch, MatchFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.match_tier) queryParams.set("match_tier", params.filters.match_tier);
            if (params.filters?.status) queryParams.set("status", params.filters.status);
            if (params.filters?.min_score) queryParams.set("min_score", String(params.filters.min_score));
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order) queryParams.set("sort_order", params.sort_order);

            return apiClient.get(`/matches?${queryParams.toString()}`);
        },
        defaultFilters,
        defaultSortBy: "match_score",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    const handleDismiss = useCallback(
        async (id: string) => {
            try {
                setDismissingId(id);
                const token = await getToken();
                if (!token) return;
                const apiClient = createAuthenticatedClient(token);
                await apiClient.patch(`/matches/${id}/dismiss`);
                updateItem(id, { status: "dismissed" } as Partial<EnrichedMatch>);
            } catch (err) {
                console.error("Failed to dismiss match:", err);
            } finally {
                setDismissingId(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Candidate-job matches"
                subtitle="Scored recommendations based on skills, requirements, and compatibility"
                breadcrumbs={[{ label: "Matches" }]}
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                <SearchInput value={search} onChange={setSearch} placeholder="Search by candidate or job..." />
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Tier</legend>
                    <select
                        className="select select-sm"
                        value={filters.match_tier || ""}
                        onChange={(e) =>
                            setFilters({ ...filters, match_tier: (e.target.value as MatchTier) || undefined })
                        }
                    >
                        <option value="">All tiers</option>
                        <option value="standard">Standard</option>
                        <option value="true">True Score</option>
                    </select>
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select select-sm"
                        value={filters.status || ""}
                        onChange={(e) =>
                            setFilters({ ...filters, status: (e.target.value as MatchStatus) || undefined })
                        }
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="applied">Applied</option>
                    </select>
                </fieldset>
            </div>

            {/* True Score upsell for non-entitled users */}
            <UpgradePrompt entitlement="ai_match_scoring" variant="card" />

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading matches..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : matches.length === 0 ? (
                <EmptyState
                    icon="fa-bullseye"
                    title="No matches found"
                    description={
                        search || filters.match_tier || filters.status !== "active"
                            ? "Try adjusting your search or filters to see more results."
                            : "New matches are generated automatically as candidates and roles are added."
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Score</th>
                                        <th>Tier</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((match) => (
                                        <MatchTableRow
                                            key={match.id}
                                            match={match}
                                            onDismiss={handleDismiss}
                                            dismissing={dismissingId === match.id}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && matches.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
