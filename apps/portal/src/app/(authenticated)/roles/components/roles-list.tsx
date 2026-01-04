'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/use-view-mode';
import { formatRelativeTime } from '@/lib/utils';
import { getJobStatusBorderColor } from '@/lib/utils/color-styles';
import { getRoleBadges } from '@/lib/utils/role-badges';
import { getJobStatusBadge } from '@/lib/utils/badge-styles';

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

interface Membership {
    role: string;
    organization_id: string;
}

interface UserProfile {
    memberships?: Membership[];
    roles?: string[];
    is_platform_admin?: boolean;
    recruiter_id?: string | null;
}

interface Stats {
    totalRoles: number;
    activeRoles: number;
    applicationsCount?: number;
    placementsCount?: number;
    companiesCount?: number;
    inReviewCount?: number;
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

// Using centralized utilities from @/lib/utils

export default function RolesList() {
    const { getToken } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'assigned'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [viewMode, setViewMode] = useViewMode('rolesViewMode');
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Check if user can manage roles
    const canManageRole = userRole === 'company_admin' || userRole === 'platform_admin';

    useEffect(() => {
        fetchUserRole();
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, ownershipFilter]);

    useEffect(() => {
        if (userRole) {
            fetchStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, statusFilter]);

    const resolveUserRole = (profile: UserProfile): string | null => {
        const membershipRoles = Array.isArray(profile.memberships)
            ? profile.memberships
                .map((membership) => membership.role)
                .filter((role): role is string => Boolean(role))
            : [];
        const normalizedRoles = Array.isArray(profile.roles) ? profile.roles : membershipRoles;

        if (profile.is_platform_admin || normalizedRoles.includes('platform_admin')) {
            return 'platform_admin';
        }
        if (normalizedRoles.includes('company_admin')) {
            return 'company_admin';
        }
        if (normalizedRoles.includes('hiring_manager')) {
            return 'hiring_manager';
        }
        if (profile.recruiter_id || normalizedRoles.includes('recruiter')) {
            return 'recruiter';
        }
        return normalizedRoles[0] || null;
    };

    const fetchUserRole = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.getCurrentUser();
            const profile: UserProfile = response.data?.[0] || response.data;
            const role = resolveUserRole(profile);
            setUserRole(role);

            if (!role) {
                setStatsLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch user role:', error);
            setStatsLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            // Use V2 getRoles() which shows all active jobs to recruiters, org jobs to company users
            const response: any = await client.getRoles({
                status: statusFilter === 'all' ? undefined : statusFilter,
                job_owner_filter: ownershipFilter,
            });
            // V2 returns { data, pagination }
            setJobs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                setStatsLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            // Fetch role-specific stats
            if (userRole === 'platform_admin') {
                // Platform admin sees system-wide stats
                const [rolesRes, companiesRes] = await Promise.all([
                    client.getRoles({ status: statusFilter === 'all' ? undefined : statusFilter }) as Promise<{ data: Job[] }>,
                    client.get('/companies') as Promise<{ data: any[] }>,
                ]);

                const allRoles = rolesRes.data || [];
                setStats({
                    totalRoles: allRoles.length,
                    activeRoles: allRoles.filter((j: Job) => j.status === 'active').length,
                    companiesCount: companiesRes.data?.length || 0,
                    applicationsCount: 0, // Will be enhanced later
                });
            } else if (userRole === 'recruiter') {
                // Recruiter sees their assigned roles and activities
                const rolesRes = await client.getRoles({
                    status: statusFilter === 'all' ? undefined : statusFilter
                }) as { data: Job[] };
                const allRoles = rolesRes.data || [];

                setStats({
                    totalRoles: allRoles.length,
                    activeRoles: allRoles.filter((j: Job) => j.status === 'active').length,
                    applicationsCount: 0, // Will be enhanced with real data
                    placementsCount: 0, // Will be enhanced with real data
                });
            } else if (userRole === 'company_admin' || userRole === 'hiring_manager') {
                // Company users see their company's roles
                const rolesRes = await client.getRoles({
                    status: statusFilter === 'all' ? undefined : statusFilter
                }) as { data: Job[] };
                const allRoles = rolesRes.data || [];

                setStats({
                    totalRoles: allRoles.length,
                    activeRoles: allRoles.filter((j: Job) => j.status === 'active').length,
                    applicationsCount: 0, // Will be enhanced with real data
                    inReviewCount: 0, // Will be enhanced with real data
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            {statsLoading ? (
                <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <i className="fa-solid fa-briefcase text-3xl"></i>
                            </div>
                            <div className="stat-title">Total Roles</div>
                            <div className="stat-value">{stats.totalRoles}</div>
                            <div className="stat-desc">
                                {userRole === 'platform_admin' ? 'System-wide' :
                                    userRole === 'recruiter' ? 'Assigned to you' : 'In your company'}
                            </div>
                        </div>
                    </div>

                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-success">
                                <i className="fa-solid fa-circle-check text-3xl"></i>
                            </div>
                            <div className="stat-title">Active Roles</div>
                            <div className="stat-value text-success">{stats.activeRoles}</div>
                            <div className="stat-desc">Currently open</div>
                        </div>
                    </div>

                    {userRole === 'recruiter' && (
                        <>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-primary">
                                        <i className="fa-solid fa-paper-plane text-3xl"></i>
                                    </div>
                                    <div className="stat-title">Applications</div>
                                    <div className="stat-value text-primary">{stats.applicationsCount}</div>
                                    <div className="stat-desc">Submitted by you</div>
                                </div>
                            </div>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-accent">
                                        <i className="fa-solid fa-handshake text-3xl"></i>
                                    </div>
                                    <div className="stat-title">Placements</div>
                                    <div className="stat-value text-accent">{stats.placementsCount}</div>
                                    <div className="stat-desc">Successfully placed</div>
                                </div>
                            </div>
                        </>
                    )}

                    {(userRole === 'company_admin' || userRole === 'hiring_manager') && (
                        <>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-primary">
                                        <i className="fa-solid fa-file-lines text-3xl"></i>
                                    </div>
                                    <div className="stat-title">Total Applications</div>
                                    <div className="stat-value text-primary">{stats.applicationsCount}</div>
                                    <div className="stat-desc">All submissions</div>
                                </div>
                            </div>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-warning">
                                        <i className="fa-solid fa-clock text-3xl"></i>
                                    </div>
                                    <div className="stat-title">In Review</div>
                                    <div className="stat-value text-warning">{stats.inReviewCount}</div>
                                    <div className="stat-desc">Awaiting decision</div>
                                </div>
                            </div>
                        </>
                    )}

                    {userRole === 'platform_admin' && (
                        <>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-info">
                                        <i className="fa-solid fa-building text-3xl"></i>
                                    </div>
                                    <div className="stat-title">Companies</div>
                                    <div className="stat-value text-info">{stats.companiesCount}</div>
                                    <div className="stat-desc">Active companies</div>
                                </div>
                            </div>
                            <div className="stats bg-base-100 shadow">
                                <div className="stat">
                                    <div className="stat-figure text-primary">
                                        <i className="fa-solid fa-file-lines text-3xl"></i>
                                    </div>
                                    <div className="stat-title">Applications</div>
                                    <div className="stat-value text-primary">{stats.applicationsCount}</div>
                                    <div className="stat-desc">Platform-wide</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-2">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="fieldset">
                            <select
                                className="select w-full max-w-xs"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="filled">Filled</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        {(userRole === 'recruiter' || userRole === 'company_admin' || userRole === 'hiring_manager') && (
                            <div className="fieldset">
                                <select
                                    className="select w-full max-w-xs"
                                    value={ownershipFilter}
                                    onChange={(e) => setOwnershipFilter(e.target.value as 'all' | 'assigned')}
                                >
                                    <option value="all">{userRole === 'recruiter' ? 'All Jobs' : 'All Organization Jobs'}</option>
                                    <option value="assigned">My Assigned Jobs</option>
                                </select>
                            </div>
                        )}
                        <div className="fieldset flex-1">
                            <input
                                type="text"
                                placeholder="Search roles..."
                                className="input w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="join">
                            <button
                                className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <i className="fa-solid fa-grip"></i>
                            </button>
                            <button
                                className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('table')}
                                title="Table View"
                            >
                                <i className="fa-solid fa-table"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles List - Grid View */}
            {viewMode === 'grid' && filteredJobs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => {
                        const badges = getRoleBadges(job, filteredJobs);
                        const maxPayout = job.salary_max ? Math.round(job.fee_percentage * job.salary_max / 100) : null;
                        const minPayout = job.salary_min ? Math.round(job.fee_percentage * job.salary_min / 100) : null;

                        return (
                            <div
                                key={job.id}
                                className="group card bg-base-100 border border-base-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                style={{ borderColor: getJobStatusBorderColor(job.status).replace('border-', '#').replace('border-base-300', 'hsl(var(--bc) / 0.2)').replace('border-success/30', 'hsl(var(--su) / 0.3)').replace('border-warning/30', 'hsl(var(--wa) / 0.3)').replace('border-error/30', 'hsl(var(--er) / 0.3)').replace('border-neutral/30', 'hsl(var(--n) / 0.3)') }}
                            >
                                {/* Company header with gradient background */}
                                <div className="relative h-24 bg-linear-90 from-secondary/20 to-transparent flex items-center">

                                    {/* Company logo and info */}

                                    <div className="flex items-center gap-4 p-2">
                                        <div className={`avatar avatar-placeholder`}>
                                            <div className={`bg-base-100 text-primary text-3xl font-bold w-16 p-2 rounded-full shadow-lg`}>
                                                {job.company?.logo_url ? (
                                                    <img
                                                        src={job.company.logo_url}
                                                        alt={`${job.company.name} logo`}
                                                        className="w-20 h-20 object-contain rounded-lg"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.removeAttribute('hidden');
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

                                    {/* Status and activity badges */}
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
                                    {/* Role title as main focus */}
                                    <div className="mt-6">
                                        <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {job.title}
                                        </h3>
                                    </div>

                                    {/* Role-specific financial information */}

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
                                                    <div className="text-xs text-base-content/50 mt-1">
                                                        placement fee
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Company Hiring Cost Box */}
                                    {(userRole === 'company_admin' || userRole === 'hiring_manager' || userRole === 'platform_admin') && (
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
                                                        <span>{job.application_count || 0} candidate{(job.application_count || 0) !== 1 ? 's' : ''} in pipeline</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Spacer to push footer section to bottom */}
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
                                                <span className="font-medium">{job.application_count} applicant{job.application_count !== 1 ? 's' : ''}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer with date and actions */}
                                    <div className="flex items-center justify-between pt-3 mt-auto">
                                        <div className="text-xs text-base-content/50">
                                            Posted {formatRelativeTime(job.created_at)}
                                        </div>
                                        <div className="flex gap-2">
                                            {canManageRole && (
                                                <button
                                                    className="btn btn-ghost btn-sm gap-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.location.href = `/roles/${job.id}/edit`;
                                                    }}
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                    Edit
                                                </button>
                                            )}
                                            <Link href={`/roles/${job.id}`} className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform">
                                                View Details
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Roles List - Table View */}
            {viewMode === 'table' && filteredJobs.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Role Title</th>
                                    <th>Location</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Posted</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => {
                                    const badges = getRoleBadges(job, filteredJobs);
                                    return (
                                        <tr key={job.id} className="hover">
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
                                                <div className={`badge ${getJobStatusBadge(job.status)}`}>
                                                    {job.status}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {formatRelativeTime(job.created_at)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    {canManageRole && (
                                                        <Link
                                                            href={`/roles/${job.id}/edit`}
                                                            className="btn btn-ghost btn-sm"
                                                            title="Edit Role"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={`/roles/${job.id}`}
                                                        className="btn btn-primary btn-sm"
                                                        title="View Pipeline"
                                                    >
                                                        <i className="fa-solid fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredJobs.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-briefcase text-6xl text-base-content/20"></i>
                        <h3 className="text-xl font-semibold mt-4">No Roles Found</h3>
                        <p className="text-base-content/70 mt-2">
                            {searchQuery ? 'Try adjusting your search' : 'No roles have been created yet'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
