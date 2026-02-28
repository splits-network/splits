"use client";

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

interface User {
    id: string;
    clerk_user_id: string;
    email: string;
    name?: string;
    onboarding_status?: string;
    onboarding_step?: number;
    created_at: string;
    updated_at?: string;
    // Enriched fields (from memberships/roles - may not always be present)
    is_platform_admin?: boolean;
    roles?: string[];
    recruiter_id?: string;
    organization_ids?: string[];
}

interface UserFilters {
    role?: "recruiter" | "company_admin" | "hiring_manager" | "platform_admin";
}

export default function UsersAdminPage() {
    const { getToken } = useAuth();

    const {
        items: users,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<User, UserFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.role)
                queryParams.set("role", params.filters.role);
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            const response = await apiClient.get(
                `/users?${queryParams.toString()}`,
            );
            return response;
        },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    function OnboardingBadge({ status }: { status?: string }) {
        if (status === "completed") {
            return (
                <span className="badge badge-success gap-1">
                    <i className="fa-duotone fa-regular fa-check"></i>
                    Completed
                </span>
            );
        }
        if (status === "in_progress") {
            return (
                <span className="badge badge-warning gap-1">
                    <i className="fa-duotone fa-regular fa-clock"></i>
                    In Progress
                </span>
            );
        }
        return (
            <span className="badge badge-ghost gap-1">
                <i className="fa-duotone fa-regular fa-circle"></i>
                {status || "Not Started"}
            </span>
        );
    }

    function RoleBadges({ user }: { user: User }) {
        const badges = [];
        if (user.is_platform_admin) {
            badges.push(
                <span key="admin" className="badge badge-primary badge-sm">
                    Admin
                </span>,
            );
        }
        if (user.recruiter_id) {
            badges.push(
                <span
                    key="recruiter"
                    className="badge badge-secondary badge-sm"
                >
                    Recruiter
                </span>,
            );
        }
        if (user.organization_ids && user.organization_ids.length > 0) {
            badges.push(
                <span key="company" className="badge badge-accent badge-sm">
                    Company
                </span>,
            );
        }
        return (
            <div className="flex flex-wrap gap-1">
                {badges.length > 0 ? (
                    badges
                ) : (
                    <span className="text-base-content/50 text-sm">
                        No roles
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="User Management"
                subtitle="Manage platform users and their access"
                breadcrumbs={[{ label: "Users" }]}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total Users</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Onboarded</div>
                    <div className="stat-value text-2xl text-success">
                        {loading
                            ? "..."
                            : users.filter((u) => u.onboarding_status === "completed").length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">In Progress</div>
                    <div className="stat-value text-2xl text-warning">
                        {loading
                            ? "..."
                            : users.filter((u) => u.onboarding_status === "in_progress").length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Admins</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading
                            ? "..."
                            : users.filter((u) => u.is_platform_admin).length}
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
                    value={filters.role || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            role:
                                (e.target.value as UserFilters["role"]) ||
                                undefined,
                        })
                    }
                >
                    <option value="">All Roles</option>
                    <option value="platform_admin">Platform Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="hiring_manager">Hiring Manager</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading users..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : users.length === 0 ? (
                <EmptyState
                    icon="fa-users"
                    title="No users found"
                    description={
                        search || filters.role
                            ? "Try adjusting your search or filters"
                            : "Users will appear here once registered"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Onboarding</th>
                                        <th>Roles</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-base-300 text-base-content rounded-full w-10">
                                                            <span className="text-sm">
                                                                {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {user.name || "Unknown"}
                                                        </div>
                                                        <div className="text-xs text-base-content/50 font-mono">
                                                            {user.clerk_user_id?.substring(0, 12) || user.id.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td>
                                                <OnboardingBadge
                                                    status={user.onboarding_status}
                                                />
                                            </td>
                                            <td>
                                                <RoleBadges user={user} />
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Link
                                                        href={`/portal/admin/users/${user.id}`}
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

            {!loading && !error && users.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}
        </div>
    );
}
