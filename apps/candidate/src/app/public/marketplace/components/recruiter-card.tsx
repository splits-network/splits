import { useRouter } from 'next/navigation';
import { EntityCard, DataRow, InteractiveDataRow, DataList } from '@/components/ui/cards';
import { MarketplaceProfile } from '@splits-network/shared-types';

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
        return { label: 'Strong Profile', color: 'badge-primary', icon: 'fa-star' };
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
    console.log('RecruiterCard render:', recruiter);
    return (
        <EntityCard className='group hover:shadow-lg transition-all duratino-200'>
            <EntityCard.Header>
                <div className='flex items-center gap-3 min-w-0'>
                    {/* Avatar */}
                    <div className="avatar avatar-placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                            <span className="text-lg">
                                {initials}
                            </span>
                        </div>
                    </div>
                    <div className='min-w-0'>
                        <h3 className="font-semibold text-md truncate flex items-center gap-2">
                            {recruiter.users?.name}
                            {profileBadge && (
                                <span className={`badge ${profileBadge.color} badge-sm gap-1`}>
                                    <i className={`fa-solid ${profileBadge.icon} text-xs`}></i>
                                    <span className="hidden sm:inline">{profileBadge.label}</span>
                                </span>
                            )}
                        </h3>
                        <div className="text-sm text-base-content/70 truncate">
                            {recruiter.tagline}
                        </div>
                    </div>
                </div>
            </EntityCard.Header>
            <div className="card bg-base-100 shadow hover:shadow transition-shadow">
                <div className="card-body">
                    <div className="flex items-start justify-between mb-2">
                        <div className="avatar avatar-placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-12">
                                <span className="text-xl">
                                    {initials}
                                </span>
                            </div>
                        </div>
                        {recruiter.years_experience && (
                            <div className="badge badge-outline">
                                {recruiter.years_experience}+ years
                            </div>
                        )}
                    </div>

                    <h3 className="card-title text-lg">{recruiter.users?.name}</h3>

                    {recruiter.tagline && (
                        <p className="text-sm text-base-content/70">{recruiter.tagline}</p>
                    )}

                    {recruiter.location && (
                        <p className="text-sm text-base-content/70 flex items-center gap-1">
                            <i className="fa-solid fa-location-dot"></i>
                            {recruiter.location}
                        </p>
                    )}

                    {recruiter.industries && recruiter.industries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {recruiter.industries.slice(0, 3).map(industry => (
                                <span key={industry} className="badge badge-sm">
                                    {industry}
                                </span>
                            ))}
                            {recruiter.industries.length > 3 && (
                                <span className="badge badge-sm">
                                    +{recruiter.industries.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {recruiter.specialties && recruiter.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {recruiter.specialties.slice(0, 3).map(specialty => (
                                <span key={specialty} className="badge badge-sm badge-outline">
                                    {specialty}
                                </span>
                            ))}
                            {recruiter.specialties.length > 3 && (
                                <span className="badge badge-sm badge-outline">
                                    +{recruiter.specialties.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rich Bio Preview */}
                    {recruiter.marketplace_profile?.bio_rich && (
                        <div className="mt-3 p-3 bg-base-200/50 rounded-lg">
                            <div className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                                <i className="fa-solid fa-sparkles"></i>
                                Featured Story
                            </div>
                            <div className="text-sm text-base-content/80 line-clamp-3">
                                {/* Simple text preview without full markdown rendering */}
                                {recruiter.marketplace_profile.bio_rich.replace(/[*_#\[\]]/g, '').substring(0, 150)}{recruiter.marketplace_profile.bio_rich.length > 150 ? '...' : ''}
                            </div>
                        </div>
                    )}

                    {recruiter.total_placements !== undefined && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                            <div className="stats bg-base-200 shadow mt-3">
                                <div className="stat">
                                    <div className="stat-title text-xs">Placements</div>
                                    <div className="stat-value text-lg">{recruiter.total_placements}</div>
                                </div>
                            </div>
                            {recruiter.success_rate !== undefined && (
                                <div className="stats bg-base-200 shadow mt-3">
                                    <div className="stat">
                                        <div className="stat-title text-xs">Success Rate</div>
                                        <div className="stat-value text-lg">{Math.round(recruiter.success_rate * 100)}%</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="card-actions justify-end mt-4">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={viewRecruiter}
                        >
                            View Profile
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </EntityCard>
    );
}
