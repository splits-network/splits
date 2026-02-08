"use client";

import { useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
    ViewModeToggle,
} from "@/hooks/use-standard-list";
import { createAuthenticatedClient, ApiClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface Team {
    id: string;
    name: string;
    owner_user_id: string;
    billing_organization_id: string | null;
    status: "active" | "suspended";
    member_count: number;
    active_member_count: number;
    total_placements: number;
    total_revenue: number;
    created_at: string;
}

interface TeamFilters {
    status?: "active" | "suspended";
}

// Team card component
function TeamCard({ team }: { team: Team }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Link
            href={`/teams/${team.id}`}
            className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary hover:shadow-md transition-all"
        >
            <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="card-title text-lg">{team.name}</h3>
                    {team.status === "active" ? (
                        <span className="badge badge-success badge-sm">
                            Active
                        </span>
                    ) : (
                        <span className="badge badge-error badge-sm">
                            Suspended
                        </span>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-users w-4"></i>
                        <span>
                            {team.active_member_count} active member
                            {team.active_member_count !== 1 ? "s" : ""}
                            {team.member_count !== team.active_member_count && (
                                <span className="text-base-content/50">
                                    {" "}
                                    ({team.member_count} total)
                                </span>
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-briefcase w-4"></i>
                        <span>
                            {team.total_placements} placement
                            {team.total_placements !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-dollar-sign w-4"></i>
                        <span>
                            {formatCurrency(team.total_revenue)} revenue
                        </span>
                    </div>
                </div>

                <div className="card-actions justify-end mt-4">
                    <span className="text-sm text-primary">
                        View details{" "}
                        <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Team table row component
function TeamRow({ team }: { team: Team }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <tr className="hover:bg-base-200">
            <td>
                <Link
                    href={`/teams/${team.id}`}
                    className="font-medium hover:text-primary"
                >
                    {team.name}
                </Link>
            </td>
            <td>
                {team.status === "active" ? (
                    <span className="badge badge-success badge-sm">Active</span>
                ) : (
                    <span className="badge badge-error badge-sm">
                        Suspended
                    </span>
                )}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-users text-base-content/50"></i>
                    <span>{team.active_member_count}</span>
                    {team.member_count !== team.active_member_count && (
                        <span className="text-base-content/50 text-xs">
                            /{team.member_count}
                        </span>
                    )}
                </div>
            </td>
            <td>
                <span className="font-medium">{team.total_placements}</span>
            </td>
            <td>
                <span className="font-medium">
                    {formatCurrency(team.total_revenue)}
                </span>
            </td>
            <td>
                <Link
                    href={`/teams/${team.id}`}
                    className="btn btn-ghost btn-sm"
                >
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </Link>
            </td>
        </tr>
    );
}

export default function TeamsPage() {
    const { getToken } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "" });

    // Fetch function for teams
    const fetchTeams = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.set("page", params.page.toString());
            if (params.limit) queryParams.set("limit", params.limit.toString());
            if (params.search) queryParams.set("search", params.search);
            if (params.status) queryParams.set("status", params.status);

            const response = await client.get(
                `/teams?${queryParams.toString()}`,
            );

            // Handle response - teams endpoint may not have pagination yet
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
            const pagination = response.data?.pagination || {
                total: data.length,
                page: 1,
                limit: 25,
                total_pages: 1,
            };

            return { data, pagination };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const {
        data: teams,
        pagination,
        loading,
        error,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        viewMode,
        setViewMode,
        refetch,
    } = useStandardList<Team, TeamFilters>({
        fetchFn: fetchTeams,
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Handle create team
    const handleCreateTeam = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setCreating(true);
            setCreateError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post("/teams", { name: formData.name });

            setFormData({ name: "" });
            setShowCreateModal(false);
            refetch();
        } catch (err: any) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    // Calculate stats
    const totalMembers = teams.reduce(
        (sum, t) => sum + t.active_member_count,
        0,
    );
    const totalPlacements = teams.reduce(
        (sum, t) => sum + t.total_placements,
        0,
    );
    const totalRevenue = teams.reduce((sum, t) => sum + t.total_revenue, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Teams</h1>
                    <p className="text-base-content/60 mt-1">
                        Manage your recruiting teams and agencies
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    Create Team
                </button>
            </div>

            {/* Quick Stats */}
            {!loading && teams.length > 0 && (
                <StatCardGrid className="mb-6">
                    <StatCard
                        title="Teams"
                        value={teams.length}
                        icon="fa-duotone fa-regular fa-users"
                    />
                    <StatCard
                        title="Total Members"
                        value={totalMembers}
                        icon="fa-duotone fa-regular fa-user-group"
                    />
                    <StatCard
                        title="Total Placements"
                        value={totalPlacements}
                        icon="fa-duotone fa-regular fa-trophy"
                        color="success"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(totalRevenue)}
                        icon="fa-duotone fa-regular fa-dollar-sign"
                        color="primary"
                    />
                </StatCardGrid>
            )}

            {/* Filters Bar */}
            <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search teams..."
                        />
                    </div>

                    {/* Status Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Status Filter
                        </legend>
                        <select
                            className="select select-sm"
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    status:
                                        (e.target.value as any) || undefined,
                                })
                            }
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </fieldset>

                    {/* View Mode Toggle */}
                    <ViewModeToggle
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState />}

            {/* Error State */}
            {error && <ErrorState message={error} onRetry={refetch} />}

            {/* Empty State */}
            {!loading && !error && teams.length === 0 && (
                <EmptyState
                    icon="fa-users"
                    title="No teams yet"
                    description="Create a team to collaborate with other recruiters and manage split distributions."
                    action={
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-plus"></i>
                            Create Your First Team
                        </button>
                    }
                />
            )}

            {/* Teams List */}
            {!loading && !error && teams.length > 0 && (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teams.map((team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-base-100 rounded-lg shadow-sm overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Team Name</th>
                                        <th>Status</th>
                                        <th>Members</th>
                                        <th>Placements</th>
                                        <th>Revenue</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team) => (
                                        <TeamRow key={team.id} team={team} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={(page) => setFilters({ ...filters })}
                        />
                    )}
                </>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            Create New Team
                        </h3>

                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Team Name *
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Tech Recruiters Inc."
                                    required
                                    autoFocus
                                />
                                <p className="fieldset-label">
                                    Choose a name for your recruiting team or
                                    agency
                                </p>
                            </fieldset>

                            {createError && (
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                    <span>{createError}</span>
                                </div>
                            )}

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({ name: "" });
                                        setCreateError(null);
                                    }}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-check"></i>
                                            Create Team
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => !creating && setShowCreateModal(false)}
                    ></div>
                </div>
            )}
        </div>
    );
}
