import Link from 'next/link';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';

interface CandidateCardProps {
    candidate: any;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    return (
        <div className="group card bg-base-100 border border-base-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col" >
            {/* Header with gradient background */}
            <div className="relative h-24 bg-linear-90 from-secondary/20 to-transparent flex items-center">

                {/* Verification and relationship badges - vertical ribbon style */}
                <div className="absolute top-3 right-0 flex flex-col gap-2 items-end">
                    {candidate.verification_status && (
                        <span className={`badge ${getVerificationStatusBadge(candidate.verification_status)} gap-1 rounded-e-none shadow-lg`} title={`Verification Status: ${candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}`}>
                            <i className={`fa-solid mr-1 ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                            {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                        </span>
                    )}
                    {candidate.is_new && (
                        <span className="badge badge-info gap-1 rounded-e-none shadow-lg" title="Recently added candidate">
                            <i className="fa-solid fa-sparkles mr-1"></i>
                            New
                        </span>
                    )}
                    {candidate.has_other_active_recruiters && (
                        <span className="badge badge-warning gap-1 rounded-e-none shadow-lg" title={`${candidate.other_active_recruiters_count} other recruiter${candidate.other_active_recruiters_count > 1 ? 's' : ''} working with this candidate`}>
                            <i className="fa-solid fa-users mr-1"></i>
                            Assigned
                        </span>
                    )}
                    {candidate.is_sourcer && (
                        <span className="badge badge-primary gap-1 rounded-e-none shadow-lg" title="You sourced this candidate">
                            <i className="fa-solid fa-star mr-1"></i>
                            Sourcer
                        </span>
                    )}
                    {candidate.has_active_relationship && (
                        <span className="badge badge-success gap-1 rounded-e-none shadow-lg" title="Active relationship">
                            <i className="fa-solid fa-handshake mr-1"></i>
                            Active
                        </span>
                    )}
                </div>

                {/* Avatar positioned at bottom of header */}
                <div className="flex items-center gap-4 p-2">
                    <div className={`avatar avatar-placeholder`}>
                        <div className={`bg-base-100 text-primary text-2xl font-bold w-16 p-2 rounded-full shadow-lg`}>
                            {(() => {
                                const names = candidate.full_name.split(' ');
                                const firstInitial = names[0]?.[0]?.toUpperCase() || '';
                                const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
                                return names.length > 1 ? firstInitial + lastInitial : firstInitial;
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body pb-6 space-y-4">
                {/* Candidate name as main focus */}
                <div className="">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {candidate.full_name}
                    </h3>
                    <div className="flex flex-col items-start gap-2 mt-2">
                        <span
                            className="text-sm text-base-content/70 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `mailto:${candidate.email}`;
                            }}
                        >
                            <i className="fa-solid fa-envelope"></i>
                            {candidate.email}
                        </span>
                        {candidate.phone && (
                            <>
                                <span
                                    className="text-sm text-base-content/70 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.location.href = `tel:${candidate.phone}`;
                                    }}
                                >
                                    <i className="fa-solid fa-phone"></i>
                                    {candidate.phone}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Professional Information */}
                {(candidate.current_title || candidate.current_company || candidate.location) && (
                    <div className="bg-linear-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
                        <div className="space-y-2">
                            {candidate.current_title && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-briefcase text-primary w-4"></i>
                                    <span className="font-medium text-base-content/80">{candidate.current_title}</span>
                                    {candidate.current_company && (
                                        <>
                                            <span className="text-base-content/50">at</span>
                                            <span className="font-medium text-primary">{candidate.current_company}</span>
                                        </>
                                    )}
                                </div>
                            )}
                            {!candidate.current_title && candidate.current_company && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-building text-primary w-4"></i>
                                    <span className="font-medium text-primary">{candidate.current_company}</span>
                                </div>
                            )}
                            {candidate.location && (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-location-dot text-primary w-4"></i>
                                    <span className="text-sm text-base-content/70">{candidate.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {candidate.skills && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-base-content/70">
                            <i className="fa-solid fa-code text-primary"></i>
                            <span>Skills & Technologies</span>
                        </div>
                        <div className="text-sm text-base-content/70 line-clamp-3">
                            {candidate.skills}
                        </div>
                    </div>
                )}

                {/* Profile Links */}
                {(candidate.linkedin_url || candidate.portfolio_url || candidate.github_url) && (
                    <div className="bg-linear-to-r from-base-200/50 to-base-300/30 rounded-lg p-4 border border-base-300/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-base-content/70 mb-3">
                            <i className="fa-solid fa-link text-primary"></i>
                            <span>Profile Links</span>
                        </div>
                        <div className="space-y-2">
                            {candidate.linkedin_url && (
                                <a
                                    href={candidate.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 rounded hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className="fa-brands fa-linkedin text-lg w-5"></i>
                                    <span className="text-sm font-medium">LinkedIn Profile</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs ml-auto"></i>
                                </a>
                            )}
                            {candidate.portfolio_url && (
                                <a
                                    href={candidate.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors p-2 rounded hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className="fa-solid fa-globe text-lg w-5"></i>
                                    <span className="text-sm font-medium">Portfolio</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs ml-auto"></i>
                                </a>
                            )}
                            {candidate.github_url && (
                                <a
                                    href={candidate.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded hover:bg-gray-50/50 dark:hover:bg-gray-900/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className="fa-brands fa-github text-lg w-5"></i>
                                    <span className="text-sm font-medium">GitHub</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square text-xs ml-auto"></i>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer with date */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-4">
                    <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                        <i className="fa-solid fa-calendar-plus"></i>
                        Added {formatDate(candidate.created_at)}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/candidates/${candidate.id}`} className="btn btn-primary btn-sm gap-2 group-hover:scale-105 transition-transform">
                            View Details
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}