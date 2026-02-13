'use client';

import { useRouter } from 'next/navigation';
import { MarketplaceProfile } from '@splits-network/shared-types';
import { ExpandableTableRow } from '@/components/ui/tables';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import RecruiterReputation from './recruiter-reputation';

interface MarketplaceRecruiter {
    id: string;
    user_id: string;
    tagline?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    marketplace_profile?: MarketplaceProfile;
    bio?: string;
    contact_available?: boolean;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface RecruiterTableRowProps {
    recruiter: MarketplaceRecruiter;
}

export function RecruiterTableRow({ recruiter }: RecruiterTableRowProps) {
    const router = useRouter();

    // Compute initials for avatar (matching card component)
    const initials = (() => {
        const names = recruiter.users?.name?.split(' ') || [];
        const firstInitial = names[0]?.[0]?.toUpperCase() || '';
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    const viewRecruiter = () => {
        router.push(`/public/marketplace/${recruiter.id}`);
    };

    // Main row cells
    const cells = (
        <>
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-sm">
                                {initials}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{recruiter.users?.name || 'Anonymous Recruiter'}</div>
                        {recruiter.specialties && recruiter.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {recruiter.specialties.slice(0, 2).map(specialty => (
                                    <span key={specialty} className="badge badge-sm badge-ghost">
                                        {specialty}
                                    </span>
                                ))}
                                {recruiter.specialties.length > 2 && (
                                    <span className="badge badge-sm badge-ghost">
                                        +{recruiter.specialties.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td>
                {recruiter.location && (
                    <div className="flex items-center gap-1 text-sm">
                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                        {recruiter.location}
                    </div>
                )}
            </td>
            <td>
                <RecruiterReputation
                    reputationScore={recruiter.reputation_score ?? null}
                    totalPlacements={recruiter.total_placements}
                    variant="compact"
                />
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <button
                    className="btn btn-sm btn-primary whitespace-nowrap"
                    onClick={(e) => {
                        e.stopPropagation();
                        viewRecruiter();
                    }}
                >
                    <i className="fa-duotone fa-regular fa-user"></i>
                    View Profile
                </button>
            </td>
        </>
    );

    const hasStats = (recruiter.years_experience !== undefined && recruiter.years_experience > 0)
        || recruiter.total_placements !== undefined
        || (recruiter.success_rate !== undefined && recruiter.success_rate > 0);

    const hasTags = (recruiter.industries && recruiter.industries.length > 0)
        || (recruiter.specialties && recruiter.specialties.length > 0);

    // Expanded content for additional details
    const expandedContent = (
        <div className="space-y-3">
            {/* Tagline */}
            {recruiter.tagline && (
                <p className="text-sm italic text-base-content/60">
                    <i className="fa-duotone fa-regular fa-quote-left text-xs mr-1"></i>
                    {recruiter.tagline}
                </p>
            )}

            {/* Bio */}
            {(recruiter.marketplace_profile?.bio_rich || recruiter.bio) && (
                <div className="text-sm text-base-content/80">
                    <MarkdownRenderer content={recruiter.marketplace_profile?.bio_rich || recruiter.bio || ''} />
                </div>
            )}

            {/* Industries & Specialties inline */}
            {hasTags && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {recruiter.industries?.map(industry => (
                        <span key={industry} className="badge badge-sm">
                            {industry}
                        </span>
                    ))}
                    {recruiter.specialties?.map(specialty => (
                        <span key={specialty} className="badge badge-sm badge-outline">
                            {specialty}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats inline */}
            {hasStats && (
                <div className="flex items-center gap-4 text-xs text-base-content/60">
                    {recruiter.years_experience !== undefined && recruiter.years_experience > 0 && (
                        <span><i className="fa-duotone fa-regular fa-briefcase mr-1"></i>{recruiter.years_experience}+ yrs exp</span>
                    )}
                    {recruiter.total_placements !== undefined && (
                        <span><i className="fa-duotone fa-regular fa-handshake mr-1"></i>{recruiter.total_placements} placements</span>
                    )}
                    {recruiter.success_rate !== undefined && recruiter.success_rate > 0 && (
                        <span><i className="fa-duotone fa-regular fa-chart-line mr-1"></i>{recruiter.success_rate}% success</span>
                    )}
                </div>
            )}

            {/* Contact action (only if email available, profile button already in main row) */}
            {recruiter.contact_available && recruiter.users?.email && (
                <div className="pt-1">
                    <a
                        href={`mailto:${recruiter.users.email}`}
                        className="btn btn-outline btn-sm btn-xs gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Contact
                    </a>
                </div>
            )}
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`recruiter-${recruiter.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
