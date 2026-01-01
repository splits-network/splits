import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import Link from 'next/link';

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
        <div className={`group card bg-base-100 border border-base-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`} >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/10">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                {/* Status badges - vertical ribbon style */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`badge ${getApplicationStageBadge(application.stage)} gap-1 shadow-lg`}>
                        <i className="fa-solid fa-clipboard-check"></i>
                        {application.stage}
                    </span>
                    {application.accepted_by_company && (
                        <span className="badge badge-success gap-1 shadow-lg" title="Accepted by company">
                            <i className="fa-solid fa-check"></i>
                            Accepted
                        </span>
                    )}
                    {application.ai_reviewed && application.ai_review && (
                        <span className="badge badge-accent gap-1 shadow-lg" title={`AI Score: ${application.ai_review.fit_score}/100`}>
                            <i className="fa-solid fa-robot"></i>
                            AI: {application.ai_review.fit_score}
                        </span>
                    )}
                    {isMasked && (
                        <span className="badge badge-warning gap-1 shadow-lg" title="Anonymous candidate">
                            <i className="fa-solid fa-eye-slash"></i>
                            Anonymous
                        </span>
                    )}
                </div>

                {/* Avatar positioned at bottom of header */}
                <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-3xl shadow-lg border-4 border-base-100">
                        {isMasked ? (
                            <i className="fa-solid fa-user-secret text-2xl"></i>
                        ) : (
                            (() => {
                                const names = candidate.full_name.split(' ');
                                const firstInitial = names[0]?.[0]?.toUpperCase() || '';
                                const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
                                return names.length > 1 ? firstInitial + lastInitial : firstInitial;
                            })()
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body pt-8 pb-6 space-y-4">
                {/* Candidate name as main focus */}
                <div className="mt-6">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {candidate.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        {!isMasked ? (
                            <a
                                href={`mailto:${candidate.email}`}
                                className="text-sm text-base-content/70 hover:text-primary transition-colors flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="fa-solid fa-envelope"></i>
                                {candidate.email}
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/70 flex items-center gap-1.5">
                                <i className="fa-solid fa-envelope"></i>
                                {candidate.email}
                            </span>
                        )}
                    </div>
                </div>

                {/* Job and Company Information */}
                {(application.job || application.company) && (
                    <div className="bg-linear-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
                        <div className="space-y-2">
                            {application.job && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-briefcase text-primary w-4"></i>
                                    <span className="font-medium text-base-content/80">{application.job.title}</span>
                                </div>
                            )}
                            {application.company && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-building text-primary w-4"></i>
                                    <span className="font-medium text-primary">{application.company.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Review Details */}
                {application.ai_reviewed && application.ai_review && (
                    <div className="bg-linear-to-r from-accent/5 to-accent/5 rounded-lg p-4 border border-accent/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-base-content/70">
                                <i className="fa-solid fa-robot text-accent"></i>
                                <span>AI Analysis Complete</span>
                            </div>
                            <div className="text-sm text-base-content/70">
                                Fit Score: <span className="font-bold text-accent">{application.ai_review.fit_score}/100</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer with date */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-4">
                    <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                        <i className="fa-solid fa-paper-plane"></i>
                        Submitted {formatDate(application.created_at)}
                    </div>
                    <div className="flex gap-2">
                        {canAccept && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onAccept();
                                }}
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
                        <Link href={`/applications/${application.id}`} className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform">
                            View Details
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
