import { useRouter } from 'next/navigation';

interface MarketplaceRecruiter {
    id: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    tagline?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    marketplace_profile?: Record<string, any>;
    bio?: string;
    contact_available?: boolean;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
}

interface RecruiterCardProps {
    recruiter: MarketplaceRecruiter;
}

export default function RecruiterCard({ recruiter }: RecruiterCardProps) {
    const router = useRouter();


    const viewRecruiter = () => {
        router.push(`/public/marketplace/${recruiter.id}`);
    };

    return (
        <div className="card bg-base-100 shadow hover:shadow transition-shadow">
            <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-12">
                            <span className="text-xl">
                                {recruiter.user_name?.charAt(0)?.toUpperCase() || recruiter.user_id?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        </div>
                    </div>
                    {recruiter.years_experience && (
                        <div className="badge badge-outline">
                            {recruiter.years_experience}+ years
                        </div>
                    )}
                </div>

                {recruiter.user_name && (
                    <h3 className="card-title text-lg">{recruiter.user_name}</h3>
                )}

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
    );
}
