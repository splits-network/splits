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
        <div className={`card card-lg bg-base-100 shadow border-2 ${getApplicationStageBorderColor(application.stage)} relative overflow-hidden`}>
            <div className="absolute -right-1 -top-1">
                <span className={`badge ${getApplicationStageBadge(application.stage)}`}>
                    {application.stage}
                </span>
            </div>
            <div className="card-body space-y-4">
                <div className="flex items-start gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-primary/10 text-primary rounded-full w-12">
                            <span className="text-lg">
                                {isMasked ? <i className="fa-solid fa-user-secret"></i> : candidate.full_name[0]}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-2xl font-semibold leading-tight">
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
                        {application.job && (
                            <div className="text-sm flex items-center gap-2">
                                <i className="fa-solid fa-briefcase text-base-content/40"></i>
                                <span className="font-medium">{application.job.title}</span>
                            </div>
                        )}
                        {application.company && (
                            <div className="text-sm flex items-center gap-2">
                                <i className="fa-solid fa-building text-base-content/40"></i>
                                <span className="text-base-content/70">{application.company.name}</span>
                            </div>
                        )}
                        {application.ai_reviewed && application.ai_review && (
                            <div className="text-sm flex items-center gap-2 text-primary">
                                <i className="fa-solid fa-robot"></i>
                                <span className="font-medium">
                                    AI Score: {application.ai_review.fit_score}/100
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isMasked && !application.accepted_by_company && (
                    <div className="alert alert-info text-xs">
                        <i className="fa-solid fa-info-circle"></i>
                        <span className="text-xs">Accept to view full details</span>
                    </div>
                )}

                {application.accepted_by_company && (
                    <div className="badge badge-success gap-2">
                        <i className="fa-solid fa-check"></i>
                        Accepted {application.accepted_at && `on ${formatDate(application.accepted_at)}`}
                    </div>
                )}

                <div className="card-actions justify-between items-center">
                    <span className="text-sm text-base-content/60">
                        Submitted {formatDate(application.created_at)}
                    </span>
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
                            className="btn btn-primary btn-sm gap-2"
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
