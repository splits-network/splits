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
        <div className={`card bg-base-100 shadow hover:shadow transition-shadow ${!isActive ? 'opacity-70' : ''}`}>
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isActive ? (
                            <Link
                                href={`/jobs/${app.job_id}`}
                                className="card-title text-xl hover:text-primary mb-1"
                            >
                                {app.job?.title || 'Unknown Position'}
                            </Link>
                        ) : (
                            <h3 className="card-title text-xl">{app.job?.title || 'Unknown Position'}</h3>
                        )}
                        <p className="text-base font-semibold mb-2">{app.job?.company?.name || 'Unknown Company'}</p>
                    </div>
                    <span className={`badge ${getStatusColor(app.stage)}`}>
                        {formatStage(app.stage)}
                    </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-base-content/70 mb-3">
                    {app.job?.location && (
                        <span>
                            <i className="fa-solid fa-location-dot"></i> {app.job.location}
                        </span>
                    )}
                    <span>
                        <i className="fa-solid fa-calendar"></i> Applied {formatDate(app.created_at)}
                    </span>
                </div>
                {app.recruiter && (
                    <div className="text-sm text-base-content/60 mb-2">
                        <i className="fa-solid fa-user"></i> {app.recruiter.first_name} {app.recruiter.last_name}
                    </div>
                )}
                {isActive && app.recruiter_notes && (
                    <div className="alert alert-info text-sm py-2">
                        <i className="fa-solid fa-circle-info"></i>
                        <span>{app.recruiter_notes}</span>
                    </div>
                )}
                {!isActive && app.recruiter_notes && (
                    <p className="text-sm text-base-content/70 mt-2">{app.recruiter_notes}</p>
                )}
                {isActive && (
                    <div className="card-actions justify-between items-center mt-4">
                        <span className="text-sm text-base-content/60">
                            Updated {formatDate(app.updated_at)}
                        </span>
                        <div className="flex gap-2">
                            <Link
                                href={`/applications/${app.id}`}
                                className="btn btn-sm btn-primary"
                            >
                                <i className="fa-solid fa-eye"></i>
                                View
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}