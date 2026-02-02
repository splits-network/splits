"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { AdminPageHeader } from "../components";

interface Candidate {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    linkedin_url?: string;
    location?: string;
    resume_url?: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
    // Enriched
    application_count?: number;
    placement_count?: number;
    sourcer_type?: "recruiter" | "tsn";
}

interface CandidateFilters {
    status?: "active" | "inactive";
    sourcer_type?: "recruiter" | "tsn";
}

export default function CandidatesAdminPage() {
    const { getToken } = useAuth();

    const defaultFilters = useMemo<CandidateFilters>(() => ({}), []);

    const {
        items: candidates,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Candidate, CandidateFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.status)
                queryParams.set("status", params.filters.status);
            if (params.filters?.sourcer_type)
                queryParams.set("sourcer_type", params.filters.sourcer_type);
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            const response = await apiClient.get(
                `/candidates?${queryParams.toString()}`,
            );
            return response;
        },
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Candidate Management"
                subtitle="View and manage all candidates in the system"
                breadcrumbs={[{ label: "Candidates" }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Candidates</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active</div>
                    <div className="stat-value text-2xl text-success">
                        {loading
                            ? "..."
                            : candidates.filter((c) => c.status === "active")
                                  .length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">TSN Sourced</div>
                    <div className="stat-value text-2xl text-secondary">
                        {loading
                            ? "..."
                            : candidates.filter((c) => c.sourcer_type === "tsn")
                                  .length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Recruiter Sourced</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading
                            ? "..."
                            : candidates.filter(
                                  (c) => c.sourcer_type === "recruiter",
                              ).length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or email..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            status:
                                (e.target
                                    .value as CandidateFilters["status"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.sourcer_type || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            sourcer_type:
                                (e.target
                                    .value as CandidateFilters["sourcer_type"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Sources</option>
                    <option value="tsn">TSN Sourced</option>
                    <option value="recruiter">Recruiter Sourced</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading candidates..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : candidates.length === 0 ? (
                <EmptyState
                    icon="fa-user-tie"
                    title="No candidates found"
                    description={
                        search || filters.status || filters.sourcer_type
                            ? "Try adjusting your search or filters"
                            : "Candidates will appear here once added"
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
                                        <th>Email</th>
                                        <th>Location</th>
                                        <th>Source</th>
                                        <th>Applications</th>
                                        <th>Placements</th>
                                        <th>Status</th>
                                        <th>Added</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate) => (
                                        <tr key={candidate.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-base-300 text-base-content rounded-full w-10">
                                                            <span className="text-sm">
                                                                {(
                                                                    candidate
                                                                        .full_name?.[0] ||
                                                                    candidate
                                                                        .email[0]
                                                                ).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {candidate.full_name ||
                                                                "Unknown"}
                                                        </div>
                                                        {candidate.linkedin_url && (
                                                            <a
                                                                href={
                                                                    candidate.linkedin_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                LinkedIn
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {candidate.email}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {candidate.location || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                {candidate.sourcer_type ? (
                                                    <span
                                                        className={`badge badge-sm ${candidate.sourcer_type === "tsn" ? "badge-primary" : "badge-secondary"}`}
                                                    >
                                                        {candidate.sourcer_type ===
                                                        "tsn"
                                                            ? "TSN"
                                                            : "Recruiter"}
                                                    </span>
                                                ) : (
                                                    <span className="text-base-content/50">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {candidate.application_count ??
                                                        0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {candidate.placement_count ??
                                                        0}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${candidate.status === "active" ? "badge-success" : "badge-ghost"}`}
                                                >
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {new Date(
                                                        candidate.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Link
                                                        href={`/portal/admin/candidates/${candidate.id}`}
                                                        className="btn btn-xs btn-ghost"
                                                        title="View details"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-eye"></i>
                                                    </Link>
                                                    {candidate.resume_url && (
                                                        <a
                                                            href={
                                                                candidate.resume_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-xs btn-ghost"
                                                            title="View resume"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-file-pdf"></i>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && candidates.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
