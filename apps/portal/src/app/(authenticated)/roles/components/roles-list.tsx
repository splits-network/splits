'use client';

import Link from 'next/link';
import {
    useStandardList,
    PaginationControls,
    ViewModeToggle,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';
import { formatRelativeTime } from '@/lib/utils';
import { getJobStatusBorderColor } from '@/lib/utils/color-styles';
import { getRoleBadges } from '@/lib/utils/role-badges';
import { getJobStatusBadge } from '@/lib/utils/badge-styles';
import { useUserProfile } from '@/contexts';

// ===== TYPES =====

interface Job {
    id: string;
    title: string;
    company_id: string;
    company: {
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    status: string;
    created_at: string | Date;
    application_count?: number;
}

interface JobFilters {
    status?: string;
    job_owner_filter?: 'all' | 'assigned';
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

// ===== COMPONENT =====

export default function RolesList() {
    const { profile, isAdmin, isRecruiter, isLoading: profileLoading } = useUserProfile();

    // Derive user role from context
    const userRole = isAdmin
        ? 'platform_admin'
        : profile?.roles?.includes('company_admin')
            ? 'company_admin'
            : profile?.roles?.includes('hiring_manager')
                ? 'hiring_manager'
                : isRecruiter
                    ? 'recruiter'
                    : profile?.roles?.[0] || null;

    // Check if user can manage roles
    const canManageRole = isAdmin || profile?.roles?.includes('company_admin');

    // Use the standard list hook with server-side pagination/filtering
    const {
        data: jobs,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        getSortIcon,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<Job, JobFilters>({
        endpoint: '/jobs',
        defaultFilters: { status: undefined, job_owner_filter: 'all' },
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        defaultLimit: 25,
        syncToUrl: true,
        viewModeKey: 'rolesViewMode',
    });

    // Wait for profile to load
    if (profileLoading) {
        return <LoadingState message="Loading your profile..." />;
    }

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-primary">
                            <i className="fa-solid fa-briefcase text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Total Roles</div>
                        <div className="stat-value text-2xl">{total}</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-success">
                            <i className="fa-solid fa-circle-check text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Active</div>
                        <div className="stat-value text-2xl text-success">
                            {jobs.filter(j => j.status === 'active').length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-warning">
                            <i className="fa-solid fa-pause text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Paused</div>
                        <div className="stat-value text-2xl text-warning">
                            {jobs.filter(j => j.status === 'paused').length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-info">
                            <i className="fa-solid fa-check-double text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Filled</div>
                        <div className="stat-value text-2xl text-info">
                            {jobs.filter(j => j.status === 'filled').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Filter */}
                        <div className="fieldset">
                            <select
                                className="select w-full max-w-xs"
                                value={filters.status || 'all'}
                                onChange={(e) => setFilter('status', e.target.value === 'all' ? undefined : e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="filled">Filled</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Ownership Filter (for recruiters and company users) */}
                        {(userRole === 'recruiter' || userRole === 'company_admin' || userRole === 'hiring_manager') && (
                            <div className="fieldset">
                                <select
                                    className="select w-full max-w-xs"
                                    value={filters.job_owner_filter || 'all'}
                                    onChange={(e) => setFilter('job_owner_filter', e.target.value as 'all' | 'assigned')}
                                >
                                    <option value="all">
                                        {userRole === 'recruiter' ? 'All Jobs' : 'All Organization Jobs'}
                                    </option>
                                    <option value="assigned">My Assigned Jobs</option>
                                </select>
                            </div>
                        )}

                        {/* Search */}
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            onClear={clearSearch}
                            placeholder="Search roles..."
                            loading={loading}
                            className="flex-1 min-w-[200px]"
                        />

                        {/* View Toggle */}
                        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && jobs.length === 0 && <LoadingState />}

            {/* Grid View */}
            {viewMode === 'grid' && jobs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <RoleCard
                            key={job.id}
                            job={job}
                            allJobs={jobs}
                            userRole={userRole}
                            canManageRole={canManageRole}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && jobs.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th
                                        className="cursor-pointer hover:bg-base-200"
                                        onClick={() => handleSort('title')}
                                    >
                                        Role Title
                                        <i className={`fa-solid ${getSortIcon('title')} ml-2 text-xs`}></i>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200"
                                        onClick={() => handleSort('location')}
                                    >
                                        Location
                                        <i className={`fa-solid ${getSortIcon('location')} ml-2 text-xs`}></i>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200"
                                        onClick={() => handleSort('fee_percentage')}
                                    >
                                        Fee
                                        <i className={`fa-solid ${getSortIcon('fee_percentage')} ml-2 text-xs`}></i>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status
                                        <i className={`fa-solid ${getSortIcon('status')} ml-2 text-xs`}></i>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Posted
                                        <i className={`fa-solid ${getSortIcon('created_at')} ml-2 text-xs`}></i>
                                    </th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <RoleTableRow
                                        key={job.id}
                                        job={job}
                                        allJobs={jobs}
                                        canManageRole={canManageRole}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
                <EmptyState
                    icon="fa-briefcase"
                    title="No Roles Found"
                    description={
                        searchInput
                            ? 'Try adjusting your search or filters'
                            : 'No roles have been created yet'
                    }
                />
            )}

            {/* Pagination */}
            <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={goToPage}
                onLimitChange={setLimit}
                loading={loading}
            />
        </div>
    );
}

// ===== SUB-COMPONENTS =====

interface RoleCardProps {
    job: Job;
    allJobs: Job[];
    userRole: string | null;
    canManageRole: boolean | undefined;
}

function RoleCard({ job, allJobs, userRole, canManageRole }: RoleCardProps) {
    const badges = getRoleBadges(job, allJobs);
    const maxPayout = job.salary_max ? Math.round(job.fee_percentage * job.salary_max / 100) : null;
    const minPayout = job.salary_min ? Math.round(job.fee_percentage * job.salary_min / 100) : null;

    return (
        <div
            className="group card bg-base-100 border border-base-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            style={{
                borderColor: getJobStatusBorderColor(job.status)
                    .replace('border-', '#')
                    .replace('border-base-300', 'hsl(var(--bc) / 0.2)')
                    .replace('border-success/30', 'hsl(var(--su) / 0.3)')
                    .replace('border-warning/30', 'hsl(var(--wa) / 0.3)')
                    .replace('border-error/30', 'hsl(var(--er) / 0.3)')
                    .replace('border-neutral/30', 'hsl(var(--n) / 0.3)'),
            }}
        >
            {/* Company header */}
            <div className="relative h-24 bg-linear-90 from-secondary/20 to-transparent flex items-center">
                <div className="flex items-center gap-4 p-2">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-base-100 text-primary text-3xl font-bold w-16 p-2 rounded-full shadow-lg">
                            {job.company?.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={`${job.company.name} logo`}
                                    className="w-20 h-20 object-contain rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                (job.company?.name || 'C')[0].toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold text-base-content/70 flex items-center gap-2">
                            <i className="fa-solid fa-building text-primary"></i>
                            {job.company?.name}
                        </p>
                        {(job.company?.headquarters_location || job.company?.industry) && (
                            <div className="mt-1 flex gap-2">
                                {job.company?.headquarters_location && (
                                    <span className="badge badge-outline badge-sm gap-1">
                                        <i className="fa-solid fa-location-dot text-xs"></i>
                                        {job.company.headquarters_location}
                                    </span>
                                )}
                                {job.company?.industry && (
                                    <span className="badge badge-outline badge-sm gap-1">
                                        <i className="fa-solid fa-industry text-xs"></i>
                                        {job.company.industry}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status and badges */}
                <div className="absolute top-3 right-0 flex flex-col items-end gap-2">
                    <div className={`badge ${getJobStatusBadge(job.status)} shadow-lg font-semibold rounded-e-none`}>
                        {job.status}
                    </div>
                    {badges.map((badge: Badge, idx: number) => (
                        <div
                            key={idx}
                            className={`badge ${badge.class} gap-1 shadow-lg rounded-e-none ${badge.animated ? 'animate-pulse' : ''} ${badge.tooltip ? 'tooltip tooltip-left' : ''}`}
                            data-tip={badge.tooltip}
                        >
                            <i className={`fa-solid mr-1 ${badge.icon}`}></i>
                            {badge.text && <span>{badge.text}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-body pt-8 pb-6 space-y-4 flex-1 flex flex-col">
                {/* Role title */}
                <div className="mt-6">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {job.title}
                    </h3>
                </div>

                {/* Recruiter Commission Box */}
                {(userRole === 'recruiter' || userRole === 'platform_admin') && (
                    <div className="bg-linear-to-r from-success/10 to-success/5 rounded-lg p-4 border border-success/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-success/70 uppercase tracking-wide mb-1">
                                    Potential Commission
                                </div>
                                <div className="font-bold text-2xl text-success">
                                    {maxPayout ? `$${maxPayout.toLocaleString()}` : 'TBD'}
                                </div>
                                {minPayout && maxPayout && minPayout !== maxPayout && (
                                    <div className="text-xs text-base-content/60 mt-1">
                                        ${minPayout.toLocaleString()} - ${maxPayout.toLocaleString()} range
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="badge badge-success badge-lg gap-2">
                                    <i className="fa-solid fa-percent"></i>
                                    {job.fee_percentage}%
                                </div>
                                <div className="text-xs text-base-content/50 mt-1">placement fee</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Company Hiring Cost Box */}
                {(userRole === 'company_admin' || userRole === 'hiring_manager') && (
                    <div className="bg-linear-to-r from-info/10 to-info/5 rounded-lg p-4 border border-info/20">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-info/70 uppercase tracking-wide mb-1">
                                        Total Hiring Cost
                                    </div>
                                    <div className="font-bold text-2xl text-info">
                                        {job.salary_max && maxPayout
                                            ? `$${(job.salary_max + maxPayout).toLocaleString()}`
                                            : 'TBD'}
                                    </div>
                                    {job.salary_min && job.salary_max && minPayout && maxPayout && (
                                        <div className="text-xs text-base-content/60 mt-1">
                                            Salary + placement fee
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="badge badge-info badge-lg gap-2">
                                        <i className="fa-solid fa-receipt"></i>
                                        {maxPayout ? `$${maxPayout.toLocaleString()}` : 'TBD'}
                                    </div>
                                    <div className="text-xs text-base-content/50 mt-1">
                                        {job.fee_percentage}% fee
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-base-content/60">
                                    <i className="fa-solid fa-users text-info"></i>
                                    <span>
                                        {job.application_count || 0} candidate
                                        {(job.application_count || 0) !== 1 ? 's' : ''} in pipeline
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Role details */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm pb-3 border-b border-base-300">
                    {job.location && (
                        <span className="flex items-center gap-1.5 text-base-content/70">
                            <i className="fa-solid fa-location-dot text-primary"></i>
                            <span className="font-medium">{job.location}</span>
                        </span>
                    )}
                    {job.salary_min && job.salary_max && (
                        <span className="flex items-center gap-1.5 text-base-content/70">
                            <i className="fa-solid fa-dollar-sign text-primary"></i>
                            <span className="font-medium">
                                ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                            </span>
                        </span>
                    )}
                    {job.application_count !== undefined && (
                        <span className="flex items-center gap-1.5 text-base-content/70">
                            <i className="fa-solid fa-users text-primary"></i>
                            <span className="font-medium">
                                {job.application_count} applicant{job.application_count !== 1 ? 's' : ''}
                            </span>
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 mt-auto">
                    <div className="text-xs text-base-content/50">
                        Posted {formatRelativeTime(job.created_at)}
                    </div>
                    <div className="flex gap-2">
                        {canManageRole && (
                            <Link href={`/roles/${job.id}/edit`} className="btn btn-ghost btn-sm gap-2">
                                <i className="fa-solid fa-pen"></i>
                                Edit
                            </Link>
                        )}
                        <Link
                            href={`/roles/${job.id}`}
                            className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform"
                        >
                            View Details
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface RoleTableRowProps {
    job: Job;
    allJobs: Job[];
    canManageRole: boolean | undefined;
}

function RoleTableRow({ job, allJobs, canManageRole }: RoleTableRowProps) {
    const badges = getRoleBadges(job, allJobs);

    return (
        <tr className="hover">
            <td>
                <div className="flex items-center gap-2">
                    <Link href={`/roles/${job.id}`} className="font-semibold hover:text-primary transition-colors">
                        {job.title}
                    </Link>
                    {badges.map((badge: Badge, idx: number) => (
                        <div
                            key={idx}
                            className={`badge badge-sm ${badge.class} gap-1 ${badge.animated ? 'animate-pulse' : ''} ${badge.tooltip ? 'tooltip tooltip-right' : ''}`}
                            data-tip={badge.tooltip}
                        >
                            <i className={`fa-solid ${badge.icon}`}></i>
                            {badge.text && <span>{badge.text}</span>}
                        </div>
                    ))}
                </div>
                <div className="text-sm text-base-content/60 mt-1">
                    <i className="fa-solid fa-building mr-1"></i>
                    {job.company.name}
                </div>
            </td>
            <td>
                {job.location ? (
                    <span className="flex items-center gap-1">
                        <i className="fa-solid fa-location-dot"></i>
                        {job.location}
                    </span>
                ) : (
                    <span className="text-base-content/40">—</span>
                )}
            </td>
            <td>
                <span className="flex items-center gap-1">
                    <i className="fa-solid fa-percent"></i>
                    {job.fee_percentage}%
                </span>
            </td>
            <td>
                <div className={`badge ${getJobStatusBadge(job.status)}`}>{job.status}</div>
            </td>
            <td>
                <span className="text-sm">{formatRelativeTime(job.created_at)}</span>
            </td>
            <td>
                <div className="flex gap-2 justify-end">
                    {canManageRole && (
                        <Link href={`/roles/${job.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Role">
                            <i className="fa-solid fa-pen"></i>
                        </Link>
                    )}
                    <Link href={`/roles/${job.id}`} className="btn btn-primary btn-sm" title="View Pipeline">
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
            </td>
        </tr>
    );
}
