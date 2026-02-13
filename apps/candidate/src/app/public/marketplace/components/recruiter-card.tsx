import { useRouter } from 'next/navigation';
import { EntityCard, DataRow, VerticalDataRow, InteractiveDataRow, DataList } from '@/components/ui/cards';
import { MarketplaceProfile } from '@splits-network/shared-types';
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

// Lightweight profile completeness check (simplified for candidate view)
function getProfileCompleteness(recruiter: MarketplaceRecruiter): number {
    let score = 0;
    const checks = [
        { condition: !!recruiter.tagline && recruiter.tagline.length > 0, weight: 10 },
        { condition: !!recruiter.location && recruiter.location.length > 0, weight: 8 },
        { condition: typeof recruiter.years_experience === 'number' && recruiter.years_experience > 0, weight: 8 },
        { condition: !!recruiter.bio && recruiter.bio.length > 20, weight: 12 },
        { condition: !!recruiter.industries && recruiter.industries.length > 0, weight: 10 },
        { condition: !!recruiter.specialties && recruiter.specialties.length > 0, weight: 12 },
        { condition: !!recruiter.marketplace_profile?.bio_rich && recruiter.marketplace_profile.bio_rich.length > 50, weight: 15 },
        { condition: recruiter.total_placements !== undefined && recruiter.total_placements > 0, weight: 10 },
        { condition: recruiter.success_rate !== undefined && recruiter.success_rate > 0, weight: 10 },
        { condition: recruiter.reputation_score !== undefined && recruiter.reputation_score > 0, weight: 5 },
    ];

    checks.forEach(check => {
        if (check.condition) score += check.weight;
    });

    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    return Math.round((score / totalWeight) * 100);
}

function getProfileBadge(completeness: number) {
    if (completeness >= 90) {
        return { label: 'Complete Profile', color: 'badge-success', icon: 'fa-certificate' };
    } else if (completeness >= 70) {
        return { label: 'Strong Profile', color: 'badge-secondary', icon: 'fa-star' };
    }
    return null; // Don't show badge for incomplete profiles
}

interface RecruiterCardProps {
    recruiter: MarketplaceRecruiter;
}

export default function RecruiterCard({ recruiter }: RecruiterCardProps) {
    const router = useRouter();
    const completeness = getProfileCompleteness(recruiter);
    const profileBadge = getProfileBadge(completeness);


    // Compute initials for avatar
    const initials = (() => {
        const names = recruiter.users?.name?.split(' ') || [];
        const firstInitial = names[0]?.[0]?.toUpperCase() || '';
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    const viewRecruiter = () => {
        router.push(`/public/marketplace/${recruiter.id}`);
    };

    return (
        <EntityCard className='group hover:shadow-lg transition-all duratino-200'>
            <EntityCard.Header>
                <div className='flex items-center justify-between gap-3 min-w-0'>
                    <div className='flex items-center gap-3 min-w-0'>
                        {/* Avatar */}
                        <div className="avatar avatar-placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                                <span className="text-lg">
                                    {initials}
                                </span>
                            </div>
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <h3 className="font-semibold text-md truncate flex items-center gap-2">
                                {recruiter.users?.name}
                            </h3>
                            <div className="text-sm text-base-content/70 truncate">
                                {recruiter.tagline}
                            </div>
                        </div>
                    </div>
                    {recruiter.reputation_score !== undefined && (
                        <RecruiterReputation
                            reputationScore={recruiter.reputation_score}
                            totalPlacements={recruiter.total_placements}
                            variant="compact"
                        />
                    )}
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList>
                    <VerticalDataRow label="Bio" icon='fa-user-circle'>
                        <div className="w-full text-sm text-base-content/80 line-clamp-3">
                            {recruiter.marketplace_profile?.bio_rich || recruiter.bio ? (
                                <MarkdownRenderer content={recruiter.marketplace_profile?.bio_rich || recruiter.bio || ''} />
                            ) : (
                                <span>Not provided</span>
                            )}
                        </div>
                    </VerticalDataRow>
                    <DataRow label="Location" icon='fa-location-dot' value={recruiter.location || 'Not provided'} />
                    <DataRow label="Years Experience" icon='fa-hourglass-half' value={recruiter.years_experience !== undefined ? `${recruiter.years_experience}+ years` : 'Not specified'} />
                    <VerticalDataRow label="Industries" icon='fa-industry'>
                        <div className='w-full'>
                            {recruiter.industries && recruiter.industries.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {recruiter.industries.map(industry => (
                                        <span key={industry} className="badge badge-sm">
                                            {industry}
                                        </span>
                                    ))}
                                </div>
                            ) : 'Not specified'}
                        </div>
                    </VerticalDataRow>
                    <VerticalDataRow label="Specialties" icon='fa-briefcase'>
                        <div className='w-full'>
                            {recruiter.specialties && recruiter.specialties.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {recruiter.specialties.map(specialty => (
                                        <span key={specialty} className="badge badge-sm badge-outline">
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            ) : 'Not specified'}
                        </div>
                    </VerticalDataRow>
                </DataList>
            </EntityCard.Body>
            <EntityCard.Footer>
                <div className='flex justify-between'>
                    <div>
                        <div className="text-sm text-base-content/70">
                            Profile Completeness: {completeness}%
                        </div>
                        <span className="text-xs text-base-content/50">
                            Joined: {new Date(recruiter.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={viewRecruiter}
                    >
                        View Profile
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                </div>
            </EntityCard.Footer>
        </EntityCard >
    );
}
