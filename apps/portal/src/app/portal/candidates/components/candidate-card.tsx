'use client';

import { DataRow, InteractiveDataRow, DataList, EntityCard } from '@/components/ui/cards';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    skills?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
    verification_status?: 'verified' | 'pending' | 'failed';
    is_new?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    is_sourcer?: boolean;
    has_active_relationship?: boolean;
    created_at: string;
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
}

// ===== BADGE HELPER =====

function getCandidateBadges(candidate: Candidate): Badge[] {
    const badges: Badge[] = [];

    // Verification status badge
    if (candidate.verification_status) {
        const verificationConfig = {
            verified: { class: 'badge-success', icon: 'fa-check-circle', text: 'Verified' },
            pending: { class: 'badge-warning', icon: 'fa-clock', text: 'Pending' },
            failed: { class: 'badge-error', icon: 'fa-xmark-circle', text: 'Failed' },
        };
        const normalizedStatus = candidate.verification_status.toLowerCase();
        const config = verificationConfig[normalizedStatus as keyof typeof verificationConfig];
        if (config) {
            badges.push({
                class: config.class,
                icon: config.icon,
                text: config.text,
                tooltip: `Verification: ${config.text}`,
            });
        }
    }

    // Sourcer badge
    if (candidate.is_sourcer) {
        badges.push({
            class: 'badge-primary',
            icon: 'fa-star',
            text: 'Sourcer',
            tooltip: 'You sourced this candidate',
        });
    }

    // Active relationship badge
    if (candidate.has_active_relationship) {
        badges.push({
            class: 'badge-success',
            icon: 'fa-handshake',
            text: 'Active',
            tooltip: 'Active relationship',
        });
    }

    // Assigned badge
    if (candidate.has_other_active_recruiters) {
        badges.push({
            class: 'badge-warning',
            icon: 'fa-users',
            text: `Assigned (${candidate.other_active_recruiters_count || 0})`,
            tooltip: `${candidate.other_active_recruiters_count || 0} other recruiter${candidate.other_active_recruiters_count! > 1 ? 's' : ''} working with this candidate`,
        });
    }

    // New badge
    if (candidate.is_new) {
        badges.push({
            class: 'badge-info',
            icon: 'fa-sparkles',
            text: 'New',
            tooltip: 'Recently added candidate',
        });
    }

    return badges;
}

// ===== CANDIDATE CARD COMPONENT =====

interface CandidateCardProps {
    candidate: Candidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    const badges = getCandidateBadges(candidate);

    // Compute initials for avatar
    const initials = (() => {
        const names = candidate.full_name.split(' ');
        const firstInitial = names[0]?.[0]?.toUpperCase() || '';
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    return (
        <EntityCard
            className="group hover:shadow-lg transition-all duration-200"
        >
            <EntityCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className='flex justify-between w-full items-center'>
                        {/* Avatar with initials */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-base-200 text-base-content/70 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {initials}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {candidate.full_name}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {candidate.current_title}
                                    {candidate.current_company && ` at ${candidate.current_company}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {/* Verification status badge */}
                            {candidate.verification_status && (
                                <div className={`badge ${candidate.verification_status.toLowerCase() === 'verified' ? 'badge-success' :
                                    candidate.verification_status.toLowerCase() === 'pending' ? 'badge-warning' :
                                        'badge-error'
                                    } shrink-0`}>
                                    {candidate.verification_status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                {/* Data Rows */}
                <DataList compact>
                    <InteractiveDataRow
                        icon="fa-envelope"
                        label="Email"
                    >
                        {candidate.email ? (
                            <a
                                href={`mailto:${candidate.email}`}
                                className="link link-hover text-sm max-w-xs truncate"
                                onClick={(e) => e.stopPropagation()}
                                title={candidate.email}
                            >
                                {candidate.email}
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/40 italic">Not provided</span>
                        )}
                    </InteractiveDataRow>
                    <InteractiveDataRow
                        icon="fa-phone"
                        label="Phone"
                    >
                        {candidate.phone ? (
                            <a href={`tel:${candidate.phone}`} className="link link-hover" onClick={(e) => e.stopPropagation()}>
                                {candidate.phone}
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/40 italic">Not provided</span>
                        )}
                    </InteractiveDataRow>
                    <DataRow
                        icon="fa-location-dot"
                        label="Location"
                        value={candidate.location || 'Not provided'}
                    />
                    <DataRow
                        icon="fa-code"
                        label="Skills"
                        value={candidate.skills || 'Not provided'}
                    />
                </DataList>

                {/* Profile Links Row */}
                {(candidate.linkedin_url || candidate.portfolio_url || candidate.github_url) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {candidate.linkedin_url && (
                            <a
                                href={candidate.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
                                onClick={(e) => e.stopPropagation()}
                                title="LinkedIn Profile"
                            >
                                <i className="fa-brands fa-linkedin"></i>
                                LinkedIn
                            </a>
                        )}
                        {candidate.portfolio_url && (
                            <a
                                href={candidate.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors group-hover:badge-accent"
                                onClick={(e) => e.stopPropagation()}
                                title="Portfolio"
                            >
                                <i className="fa-solid fa-globe"></i>
                                Portfolio
                            </a>
                        )}
                        {candidate.github_url && (
                            <a
                                href={candidate.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors hover:bg-[#238636] hover:text-white hover:border-[#238636]"
                                onClick={(e) => e.stopPropagation()}
                                title="GitHub"
                            >
                                <i className="fa-brands fa-github"></i>
                                GitHub
                            </a>
                        )}
                    </div>
                )}

                {/* Status Badges Row */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {badges.map((badge: Badge, idx: number) => (
                            <span
                                key={idx}
                                className={`badge badge-sm ${badge.class} gap-1`}
                                title={badge.tooltip}
                            >
                                <i className={`fa-solid ${badge.icon}`}></i>
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        Added {formatRelativeTime(candidate.created_at)}
                    </span>
                    <span className="text-primary text-sm font-medium group-hover:underline">
                        <Link href={`/portal/candidates/${candidate.id}`}>
                            View Details →
                        </Link>
                    </span>
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}