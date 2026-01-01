import Link from 'next/link';
import { getApplicationStageBadge, getApplicationStageBorderColor } from '@/lib/utils';

interface ApplicationCardProps {
    application: {
        id: string;
        stage: string;
        accepted_by_company: boolean;
        accepted_at?: string;
        created_at: string;
        ai_reviewed?: boolean;
        candidate: {
            full_name: string;
            email: string;
            _masked?: boolean;
        };
        job?: {
            title: string;
        };
        company?: {
            name: string;
        };
        ai_review?: {
            fit_score: number;
            recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        };
    };
    canAccept: boolean;
    isAccepting: boolean;
    onAccept: () => void;
    formatDate: (date: string) => string;
}

export function ApplicationCard({
    application,
    canAccept,
    isAccepting,
    onAccept,
    formatDate,
}: ApplicationCardProps) {
    const candidate = application.candidate;
    const isMasked = candidate._masked;

    return (
        <div className={`group card bg-base-100 border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${getApplicationStageBorderColor(application.stage)}`}>
            {/* Company header with gradient background */}
            <div className="relative h-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                {/* Company logo placeholder */}
                <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-xl bg-base-100 border-4 border-base-100 shadow-lg flex items-center justify-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-info to-accent flex items-center justify-center text-primary-content font-bold text-xl">
                            {(application.company?.name || 'C')[0].toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                    <div className={`badge ${getApplicationStageBadge(application.stage)} shadow-lg font-semibold`}>
                        {application.stage}
                    </div>
                </div>
            </div>

            <div className="card-body pt-12 pb-6 space-y-4 flex-1 flex flex-col">
                {/* Candidate info with company */}
                <div className="flex gap-4 items-start">
                    {/* Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-12">
                            <span className="text-lg">
                                {isMasked ? <i className="fa-solid fa-user-secret"></i> : candidate.full_name[0]}
                            </span>
                        </div>
                    </div>

                    {/* Candidate details */}
                    <div className="flex-1 space-y-1">
                        <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                            {isMasked && (
                                <i className="fa-solid fa-eye-slash text-warning mr-1" title="Anonymous"></i>
                            )}
                            {candidate.full_name}
                        </h3>
                        <div className="text-sm text-base-content/70">
                            {!isMasked ? (
                                <a href={`mailto:${candidate.email}`} className="link link-hover">
                                    {candidate.email}
                                </a>
                            ) : (
                                <span className="italic">{candidate.email}</span>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-base-content/70 flex items-center gap-2">
                            <i className="fa-solid fa-building text-primary"></i>
                            {application.company?.name || 'Unknown Company'}
                        </p>
                    </div>
                </div>

                {/* Job title */}
                {application.job && (
                    <div className="bg-gradient-to-r from-info/10 to-info/5 rounded-lg p-3 border border-info/20">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-briefcase text-info"></i>
                            <span className="font-semibold text-info">{application.job.title}</span>
                        </div>
                    </div>
                )}

                {/* AI Review highlight */}
                {application.ai_reviewed && application.ai_review && (
                    <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-3 border border-accent/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-robot text-accent"></i>
                                <span className="font-medium text-accent">AI Reviewed</span>
                            </div>
                            <div className="badge badge-accent badge-lg">
                                {application.ai_review.fit_score}/100
                            </div>
                        </div>
                    </div>
                )}

                {/* Acceptance status */}
                {application.accepted_by_company && (
                    <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-lg p-3 border border-success/20">
                        <div className="flex items-center gap-2 text-success">
                            <i className="fa-solid fa-check"></i>
                            <span className="font-medium">Accepted {application.accepted_at && `on ${formatDate(application.accepted_at)}`}</span>
                        </div>
                    </div>
                )}

                {/* Masked warning */}
                {isMasked && !application.accepted_by_company && (
                    <div className="alert alert-warning text-sm">
                        <i className="fa-solid fa-eye-slash"></i>
                        <span>Accept application to reveal full candidate details</span>
                    </div>
                )}

                {/* Spacer to push footer to bottom */}
                <div className="flex-1"></div>

                {/* Footer with submission date and actions */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-auto">
                    <div className="text-xs text-base-content/50">
                        Submitted {formatDate(application.created_at)}
                    </div>
                    <div className="flex gap-2">
                        {canAccept && (
                            <button
                                onClick={onAccept}
                                className="btn btn-success btn-sm gap-2"
                                disabled={isAccepting}
                            >
                                {isAccepting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check"></i>
                                        Accept
                                    </>
                                )}
                            </button>
                        )}
                        <Link
                            href={`/applications/${application.id}`}
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
