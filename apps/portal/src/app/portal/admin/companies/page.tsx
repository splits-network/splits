"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { AdminPageHeader, useAdminConfirm } from "../components";

interface Company {
    id: string;
    name: string;
    website?: string;
    logo_url?: string;
    industry?: string;
    size?: string;
    location?: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
    // Enriched
    job_count?: number;
    placement_count?: number;
    organization_id?: string;
    has_billing_profile?: boolean;
}

interface CompanyFilters {
    status?: "active" | "inactive";
    has_billing?: "yes" | "no";
}

export default function CompaniesAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const defaultFilters = useMemo<CompanyFilters>(() => ({}), []);

    const {
        items: companies,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Company, CompanyFilters>({
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
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            const response = await apiClient.get(
                `/companies?${queryParams.toString()}`,
            );
            return response;
        },
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    async function updateCompanyStatus(
        companyId: string,
        newStatus: "active" | "inactive",
    ) {
        const action = newStatus === "inactive" ? "deactivate" : "activate";
        const confirmed = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Company`,
            message: `Are you sure you want to ${action} this company? ${newStatus === "inactive" ? "Their job postings will be hidden." : ""}`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            type: newStatus === "inactive" ? "warning" : "info",
        });
        if (!confirmed) return;

        setUpdatingId(companyId);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/companies/${companyId}`, {
                status: newStatus,
            });
            toast.success(`Company ${action}d successfully`);
            refresh();
        } catch (err) {
            console.error(`Failed to ${action} company:`, err);
            toast.error(`Failed to ${action} company`);
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Company Management"
                subtitle="Manage hiring companies and their profiles"
                breadcrumbs={[{ label: "Companies" }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Companies</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active</div>
                    <div className="stat-value text-2xl text-success">
                        {loading
                            ? "..."
                            : companies.filter((c) => c.status === "active")
                                  .length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Jobs</div>
                    <div className="stat-value text-2xl text-secondary">
                        {loading
                            ? "..."
                            : companies.reduce(
                                  (sum, c) => sum + (c.job_count ?? 0),
                                  0,
                              )}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Placements</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading
                            ? "..."
                            : companies.reduce(
                                  (sum, c) => sum + (c.placement_count ?? 0),
                                  0,
                              )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search companies..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            status:
                                (e.target.value as CompanyFilters["status"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading companies..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : companies.length === 0 ? (
                <EmptyState
                    icon="fa-building"
                    title="No companies found"
                    description={
                        search || filters.status
                            ? "Try adjusting your search or filters"
                            : "Companies will appear here once registered"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Industry</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Jobs</th>
                                        <th>Placements</th>
                                        <th>Billing</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-base-300 text-base-content rounded-lg w-10">
                                                            {company.logo_url ? (
                                                                <img
                                                                    src={
                                                                        company.logo_url
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-building"></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {company.name}
                                                        </div>
                                                        {company.website && (
                                                            <div className="text-xs text-base-content/50">
                                                                {
                                                                    company.website
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {company.industry || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {company.location || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${company.status === "active" ? "badge-success" : "badge-ghost"}`}
                                                >
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {company.job_count ?? 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {company.placement_count ??
                                                        0}
                                                </span>
                                            </td>
                                            <td>
                                                {company.has_billing_profile ? (
                                                    <span className="badge badge-success badge-sm">
                                                        <i className="fa-duotone fa-regular fa-check mr-1"></i>
                                                        Set up
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-ghost badge-sm">
                                                        Not set up
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {company.status ===
                                                    "active" ? (
                                                        <button
                                                            onClick={() =>
                                                                updateCompanyStatus(
                                                                    company.id,
                                                                    "inactive",
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost text-warning"
                                                            disabled={
                                                                updatingId ===
                                                                company.id
                                                            }
                                                            title="Deactivate"
                                                        >
                                                            {updatingId ===
                                                            company.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-pause"></i>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                updateCompanyStatus(
                                                                    company.id,
                                                                    "active",
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost text-success"
                                                            disabled={
                                                                updatingId ===
                                                                company.id
                                                            }
                                                            title="Activate"
                                                        >
                                                            {updatingId ===
                                                            company.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-play"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/portal/admin/companies/${company.id}`}
                                                        className="btn btn-xs btn-ghost"
                                                        title="View details"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-eye"></i>
                                                    </Link>
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

            {!loading && !error && companies.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
