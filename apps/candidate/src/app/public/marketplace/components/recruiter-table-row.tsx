'use client';

import { useRouter } from 'next/navigation';
import { MarketplaceProfile } from '@splits-network/shared-types';
import {
    ExpandableTableRow,
    ExpandedDetailSection,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from '@/components/ui/tables';

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
                {recruiter.reputation_score !== undefined && (
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <i
                                key={i}
                                className={`fa-duotone fa-regular fa-star text-xs ${i < Math.round(recruiter.reputation_score! / 20)
                                    ? 'text-warning'
                                    : 'text-base-300'
                                    }`}
                            ></i>
                        ))}
                        <span className="text-sm ml-1">
                            ({recruiter.total_placements || 0} placements)
                        </span>
                    </div>
                )}
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

    // Expanded content for additional details
    const expandedContent = (
        <div className="space-y-4">
            {/* Tagline */}
            {recruiter.tagline && (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-quote-left"></i>
                    <span className="italic">{recruiter.tagline}</span>
                </div>
            )}

            {/* Bio */}
            {recruiter.bio && (
                <ExpandedDetailSection title="About">
                    <p className="text-sm text-base-content/70">{recruiter.bio}</p>
                </ExpandedDetailSection>
            )}

            {/* Industries */}
            {recruiter.industries && recruiter.industries.length > 0 && (
                <ExpandedDetailSection title="Industries">
                    <div className="flex flex-wrap gap-1">
                        {recruiter.industries.map(industry => (
                            <span key={industry} className="badge badge-sm">
                                {industry}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}

            {/* Specialties */}
            {recruiter.specialties && recruiter.specialties.length > 0 && (
                <ExpandedDetailSection title="Specialties">
                    <div className="flex flex-wrap gap-1">
                        {recruiter.specialties.map(specialty => (
                            <span key={specialty} className="badge badge-sm badge-outline">
                                {specialty}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}

            {/* Stats */}
            <ExpandedDetailSection title="Statistics">
                <ExpandedDetailGrid cols={4}>
                    {recruiter.years_experience !== undefined && recruiter.years_experience > 0 && (
                        <ExpandedDetailItem
                            label="Experience"
                            value={`${recruiter.years_experience}+ yrs`}
                        />
                    )}

                    {recruiter.total_placements !== undefined && (
                        <ExpandedDetailItem
                            label="Total Placements"
                            value={recruiter.total_placements.toString()}
                        />
                    )}

                    {recruiter.success_rate !== undefined && recruiter.success_rate > 0 && (
                        <ExpandedDetailItem
                            label="Success Rate"
                            value={`${recruiter.success_rate}%`}
                        />
                    )}

                    {recruiter.reputation_score !== undefined && recruiter.reputation_score > 0 && (
                        <ExpandedDetailItem
                            label="Rating"
                            value={`${(recruiter.reputation_score / 20).toFixed(1)} / 5`}
                        />
                    )}
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {/* Contact Actions */}
            <div className="flex gap-2 pt-2 border-t border-base-300">
                <button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        viewRecruiter();
                    }}
                >
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    View Full Profile
                </button>
                {recruiter.contact_available && recruiter.users?.email && (
                    <a
                        href={`mailto:${recruiter.users.email}`}
                        className="btn btn-outline btn-sm gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Contact
                    </a>
                )}
            </div>
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
