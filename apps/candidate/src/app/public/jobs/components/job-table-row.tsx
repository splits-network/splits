'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSalary, formatRelativeTime } from '@/lib/utils';

interface Job {
    id: string;
    title: string;
    description?: string | null;
    candidate_description?: string | null;
    location?: string | null;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    category?: string | null;
    open_to_relocation?: boolean;
    updated_at?: string | Date;
    created_at?: string | Date;
    company?: {
        id: string;
        name: string;
        logo_url?: string | null;
        headquarters_location?: string | null;
        industry?: string | null;
    };
}

interface JobTableRowProps {
    job: Job;
}

export function JobTableRow({ job }: JobTableRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    // Compute company initials for avatar (matching card component)
    const companyInitials = (() => {
        const name = job.company?.name || 'Company';
        const words = name.split(' ');
        const firstInitial = words[0]?.[0]?.toUpperCase() || '';
        const lastInitial = words[words.length - 1]?.[0]?.toUpperCase() || '';
        return words.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    const viewJob = () => {
        router.push(`/public/jobs/${job.id}`);
    };

    // Format employment type for display
    const formatEmploymentType = (type?: string) => {
        if (!type) return '—';
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Get job freshness badge
    const getFreshnessBadge = () => {
        const date = job.updated_at || job.created_at;
        if (!date) return null;

        const daysOld = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld <= 3) {
            return { label: 'New', color: 'badge-success' };
        } else if (daysOld <= 7) {
            return { label: 'Recent', color: 'badge-secondary' };
        }
        return null;
    };

    const freshnessBadge = getFreshnessBadge();

    return (
        <>
            {/* Collapsed Row */}
            <tr
                className="hover cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td>
                    <button className="btn btn-ghost btn-xs btn-circle">
                        <i className={`fa-duotone fa-regular ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                    </button>
                </td>
                <td>
                    <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                            <div className="bg-secondary text-secondary-content rounded-full w-10 h-10">
                                {job.company?.logo_url ? (
                                    <img src={job.company.logo_url} alt={job.company.name} className='object-contain w-full h-full' />
                                ) : (
                                    <span className="text-sm">
                                        {companyInitials}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{job.title}</div>
                            {freshnessBadge && (
                                <span className={`badge ${freshnessBadge.color} badge-xs mt-1`}>
                                    {freshnessBadge.label}
                                </span>
                            )}
                        </div>
                    </div>
                </td>
                <td>
                    <div className="text-sm">
                        {job.company?.name || 'Company'}
                    </div>
                    {job.company?.industry && (
                        <div className="text-xs text-base-content/60">
                            {job.company.industry}
                        </div>
                    )}
                </td>
                <td>
                    {job.location && (
                        <div className="flex items-center gap-1 text-sm">
                            <i className="fa-duotone fa-regular fa-location-dot"></i>
                            {job.location}
                        </div>
                    )}
                    {job.open_to_relocation && (
                        <span className="badge badge-outline badge-xs mt-1 gap-1">
                            <i className="fa-duotone fa-regular fa-location-arrow text-xs"></i>
                            Relocation OK
                        </span>
                    )}
                </td>
                <td>
                    <div className="text-sm">
                        {formatSalary(job.salary_min ?? 0, job.salary_max ?? 0)}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {formatEmploymentType(job.employment_type ?? undefined)}
                    </div>
                </td>
                <td>
                    <div className="text-sm">
                        {formatRelativeTime((job.updated_at || job.created_at) ?? new Date().toISOString())}
                    </div>
                </td>
                <td>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            viewJob();
                        }}
                    >
                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                        View Job
                    </button>
                </td>
            </tr>

            {/* Expanded Row */}
            {isExpanded && (
                <tr>
                    <td colSpan={7} className="bg-base-200">
                        <div className="p-4 space-y-4">
                            {/* Description */}
                            {(job.candidate_description || job.description) && (
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-file-lines"></i>
                                        Description
                                    </h4>
                                    <p className="text-sm text-base-content/70">
                                        {job.candidate_description || job.description}
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* Company HQ */}
                                {job.company?.headquarters_location && (
                                    <div className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-building text-primary mt-1"></i>
                                        <div>
                                            <div className="text-xs text-base-content/60">Company HQ</div>
                                            <div className="text-sm font-medium">
                                                {job.company.headquarters_location}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Category */}
                                {job.category && (
                                    <div className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-tags text-primary mt-1"></i>
                                        <div>
                                            <div className="text-xs text-base-content/60">Category</div>
                                            <div className="text-sm font-medium">{job.category}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Employment Type */}
                                <div className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-briefcase text-primary mt-1"></i>
                                    <div>
                                        <div className="text-xs text-base-content/60">Employment Type</div>
                                        <div className="text-sm font-medium">
                                            {formatEmploymentType(job.employment_type ?? undefined)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    className="btn btn-primary gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        viewJob();
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
