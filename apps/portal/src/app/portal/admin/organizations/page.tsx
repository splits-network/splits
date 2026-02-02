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

interface Organization {
    id: string;
    name: string;
    slug?: string;
    logo_url?: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
    // Enriched
    member_count?: number;
    company_count?: number;
}

interface OrganizationFilters {
    status?: "active" | "inactive";
}

export default function OrganizationsAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const defaultFilters = useMemo<OrganizationFilters>(() => ({}), []);

    const {
        items: organizations,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<Organization, OrganizationFilters>({
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
                `/organizations?${queryParams.toString()}`,
            );
            return response;
        },
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    async function updateOrgStatus(
        orgId: string,
        newStatus: "active" | "inactive",
    ) {
        const action = newStatus === "inactive" ? "deactivate" : "activate";
        const confirmed = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Organization`,
            message: `Are you sure you want to ${action} this organization?`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            type: newStatus === "inactive" ? "warning" : "info",
        });
        if (!confirmed) return;

        setUpdatingId(orgId);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/organizations/${orgId}`, {
                status: newStatus,
            });
            toast.success(`Organization ${action}d successfully`);
            refresh();
        } catch (err) {
            console.error(`Failed to ${action} organization:`, err);
            toast.error(`Failed to ${action} organization`);
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Organization Management"
                subtitle="Manage platform organizations and their settings"
                breadcrumbs={[{ label: "Organizations" }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">
                        Total Organizations
                    </div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active</div>
                    <div className="stat-value text-2xl text-success">
                        {loading
                            ? "..."
                            : organizations.filter((o) => o.status === "active")
                                  .length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Inactive</div>
                    <div className="stat-value text-2xl text-base-content/50">
                        {loading
                            ? "..."
                            : organizations.filter(
                                  (o) => o.status === "inactive",
                              ).length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search organizations..."
                />
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            status:
                                (e.target
                                    .value as OrganizationFilters["status"]) ||
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
                <LoadingState message="Loading organizations..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : organizations.length === 0 ? (
                <EmptyState
                    icon="fa-sitemap"
                    title="No organizations found"
                    description={
                        search || filters.status
                            ? "Try adjusting your search or filters"
                            : "Organizations will appear here once created"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Organization</th>
                                        <th>Slug</th>
                                        <th>Status</th>
                                        <th>Members</th>
                                        <th>Companies</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.map((org) => (
                                        <tr key={org.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-base-300 text-base-content rounded-lg w-10">
                                                            {org.logo_url ? (
                                                                <img
                                                                    src={
                                                                        org.logo_url
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-building"></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold">
                                                        {org.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-mono text-sm text-base-content/70">
                                                    {org.slug || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${org.status === "active" ? "badge-success" : "badge-ghost"}`}
                                                >
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {org.member_count ?? 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {org.company_count ?? 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {new Date(
                                                        org.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {org.status === "active" ? (
                                                        <button
                                                            onClick={() =>
                                                                updateOrgStatus(
                                                                    org.id,
                                                                    "inactive",
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost text-warning"
                                                            disabled={
                                                                updatingId ===
                                                                org.id
                                                            }
                                                            title="Deactivate"
                                                        >
                                                            {updatingId ===
                                                            org.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-pause"></i>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                updateOrgStatus(
                                                                    org.id,
                                                                    "active",
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost text-success"
                                                            disabled={
                                                                updatingId ===
                                                                org.id
                                                            }
                                                            title="Activate"
                                                        >
                                                            {updatingId ===
                                                            org.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-play"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/portal/admin/organizations/${org.id}`}
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

            {!loading && !error && organizations.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
