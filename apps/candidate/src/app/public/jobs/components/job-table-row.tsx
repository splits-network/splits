'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    employment_type: string | null;
    salary_min: number | null;
    salary_max: number | null;
    category: string | null;
    open_to_relocation: boolean;
    posted_at: string;
    company?: {
        id: string;
        name: string;
        logo_url: string | null;
        headquarters_location: string | null;
        industry: string | null;
    };
}

interface JobTableRowProps {
    job: Job;
    badges?: Array<{
        text?: string;
        icon: string;
        class: string;
        animated?: boolean;
        tooltip?: string;
    }>;
}

export default function JobTableRow({ job, badges = [] }: JobTableRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min || !max) return '—';
        const formatNum = (n: number) => `$${(n / 1000).toFixed(0)}k`;
        return `${formatNum(min)} - ${formatNum(max)}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <tr className="hover cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <td colSpan={6}>
                <div className="space-y-2">
                    {/* Collapsed Row */}
                    <div className="flex items-center gap-4">
                        {/* Company Logo */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-base-200 text-primary w-12 rounded-lg">
                                {job.company?.logo_url ? (
                                    <img
                                        src={job.company.logo_url}
                                        alt={`${job.company.name} logo`}
                                        className="w-full h-full object-contain p-1"
                                    />
                                ) : (
                                    <span className="text-lg font-bold">
                                        {(job.company?.name || 'C')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-base truncate">{job.title}</div>
                                    <div className="text-sm text-base-content/60">
                                        {job.company?.name || 'Confidential'}
                                    </div>
                                </div>
                                {badges.length > 0 && (
                                    <div className="flex gap-1 shrink-0">
                                        {badges.map((badge, idx) => (
                                            <div
                                                key={idx}
                                                className={`badge badge-sm ${badge.class} ${badge.animated ? 'animate-pulse' : ''}`}
                                                title={badge.tooltip}
                                            >
                                                <i className={`fa-duotone fa-regular ${badge.icon}`}></i>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60 mt-1">
                                {job.location && (
                                    <span className="flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                                        {job.location}
                                    </span>
                                )}
                                {job.employment_type && (
                                    <span className="flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                                        {job.employment_type.replace('_', '-')}
                                    </span>
                                )}
                                {job.open_to_relocation && (
                                    <span className="flex items-center gap-1 text-success">
                                        <i className="fa-duotone fa-regular fa-house-laptop"></i>
                                        Remote OK
                                    </span>
                                )}
                                {job.salary_min && job.salary_max && (
                                    <span className="flex items-center gap-1 text-success font-medium">
                                        <i className="fa-duotone fa-regular fa-dollar-sign"></i>
                                        {formatSalary(job.salary_min, job.salary_max)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                href={`/public/jobs/${job.id}`}
                                className="btn btn-primary btn-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View Role
                            </Link>
                            <i className={`fa-duotone fa-regular fa-chevron-${isExpanded ? 'down' : 'right'} text-base-content/40`}></i>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="bg-base-200 -mx-4 px-4 py-4 space-y-4">
                            {/* Description */}
                            {job.description && (
                                <div>
                                    <div className="text-sm font-semibold text-base-content/70 mb-2">
                                        <i className="fa-duotone fa-regular fa-file-lines mr-2"></i>
                                        Description
                                    </div>
                                    <p className="text-sm text-base-content/80 leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Company Info */}
                                {job.company && (
                                    <div className="stat bg-base-100 rounded-box p-3">
                                        <div className="stat-title text-xs">Company</div>
                                        <div className="stat-value text-base">{job.company.name}</div>
                                        {job.company.industry && (
                                            <div className="stat-desc">{job.company.industry}</div>
                                        )}
                                    </div>
                                )}

                                {/* Category */}
                                {job.category && (
                                    <div className="stat bg-base-100 rounded-box p-3">
                                        <div className="stat-title text-xs">Category</div>
                                        <div className="stat-value text-base">{job.category}</div>
                                    </div>
                                )}

                                {/* HQ Location */}
                                {job.company?.headquarters_location && (
                                    <div className="stat bg-base-100 rounded-box p-3">
                                        <div className="stat-title text-xs">Company HQ</div>
                                        <div className="stat-value text-base flex items-center gap-1">
                                            <i className="fa-duotone fa-regular fa-building text-sm"></i>
                                            {job.company.headquarters_location}
                                        </div>
                                    </div>
                                )}

                                {/* Posted Date */}
                                <div className="stat bg-base-100 rounded-box p-3">
                                    <div className="stat-title text-xs">Posted</div>
                                    <div className="stat-value text-base flex items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-calendar text-sm"></i>
                                        {formatDate(job.posted_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={`/public/jobs/${job.id}`}
                                    className="btn btn-primary gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                    View Full Details
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
