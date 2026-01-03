'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getStatusColor, formatStage } from '@/lib/application-utils';

interface ApplicationCardProps {
    application: {
        id: string;
        stage: string;
        created_at: string;
        updated_at: string;
        job_id: string;
        recruiter_notes?: string;
        job?: {
            title?: string;
            location?: string;
            company?: {
                name?: string;
                industry?: string;
                headquarters_location?: string;
                logo_url?: string;
            };
        };
        recruiter?: {
            first_name?: string;
            last_name?: string;
        };
    };
    isActive?: boolean;
}

export default function ApplicationCard({ application: app, isActive = true }: ApplicationCardProps) {
    return (
        <div className={`group card bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${!isActive ? 'opacity-70' : ''}`}>
            {/* Company header with gradient background */}
            <div className="relative h-24 bg-linear-90 from-secondary/20 to-transparent flex items-center">

                {/* Company logo placeholder */}
                <div className="flex items-center gap-4 p-2">
                    <div className={`avatar avatar-placeholder`}>
                        <div className={`bg-base-100 text-primary text-3xl font-bold w-16 p-2 rounded-full shadow-lg`}>
                            {app.job?.company?.logo_url ? (
                                <img
                                    src={app.job?.company.logo_url}
                                    alt={`${app.job?.company.name} logo`}
                                    className="w-20 h-20 object-contain rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                                    }}
                                />
                            ) : (
                                (app.job?.company?.name || 'C')[0].toUpperCase()
                            )}
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                    <div className={`badge ${getStatusColor(app.stage)} shadow-lg font-semibold`}>
                        {formatStage(app.stage)}
                    </div>
                </div>
            </div>

            <div className="card-body pt-12 pb-6 space-y-4 flex-1 flex flex-col">
                {/* Job title and company */}
                <div className="space-y-2">
                    {isActive ? (
                        <Link
                            href={`/jobs/${app.job_id}`}
                            className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2"
                        >
                            {app.job?.title || 'Unknown Position'}
                        </Link>
                    ) : (
                        <h3 className="text-xl font-bold leading-tight line-clamp-2">{app.job?.title || 'Unknown Position'}</h3>
                    )}
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-base-content/70 flex items-center gap-2">
                            <i className="fa-solid fa-building text-primary"></i>
                            {app.job?.company?.name || 'Unknown Company'}
                        </p>
                        {app.job?.company?.headquarters_location && (
                            <p className="text-xs text-base-content/50 flex items-center gap-1.5">
                                <i className="fa-solid fa-location-dot text-xs"></i>
                                {app.job.company.headquarters_location}
                            </p>
                        )}
                        {app.job?.company?.industry && (
                            <div>
                                <span className="badge badge-outline badge-xs gap-1">
                                    <i className="fa-solid fa-industry text-xs"></i>
                                    {app.job.company.industry}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recruiter info */}
                {app.recruiter && (
                    <div className="bg-linear-to-r from-info/10 to-info/5 rounded-lg p-3 border border-info/20">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-user text-info"></i>
                            <span className="font-medium text-info">
                                {app.recruiter.first_name} {app.recruiter.last_name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Recruiter notes */}
                {app.recruiter_notes && (
                    <div className={`rounded-lg p-3 border ${isActive ? 'alert alert-info' : 'bg-base-200 border-base-300'}`}>
                        <div className="flex items-start gap-2">
                            <i className="fa-solid fa-comment text-info mt-0.5"></i>
                            <span className="text-sm">{app.recruiter_notes}</span>
                        </div>
                    </div>
                )}

                {/* Spacer to push footer to bottom */}
                <div className="flex-1"></div>

                {/* Application details */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm pb-3 border-b border-base-300">
                    {app.job?.location && (
                        <span className="flex items-center gap-1.5 text-base-content/70">
                            <i className="fa-solid fa-location-dot text-primary"></i>
                            <span className="font-medium">{app.job.location}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 text-base-content/70">
                        <i className="fa-solid fa-calendar text-primary"></i>
                        <span className="font-medium">Applied {formatDate(app.created_at)}</span>
                    </span>
                </div>

                {/* Footer with updated date and actions */}
                {isActive && (
                    <div className="flex items-center justify-between pt-3 mt-auto">
                        <div className="text-xs text-base-content/50">
                            Updated {formatDate(app.updated_at)}
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/applications/${app.id}`}
                                className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform"
                            >
                                <i className="fa-solid fa-eye"></i>
                                View Details
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}