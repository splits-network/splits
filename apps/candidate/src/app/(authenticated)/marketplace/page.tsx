'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';

interface MarketplaceRecruiter {
    id: string;
    user_id: string;
    marketplace_tagline?: string;
    marketplace_industries?: string[];
    marketplace_specialties?: string[];
    marketplace_location?: string;
    marketplace_years_experience?: number;
    marketplace_profile?: Record<string, any>;
    bio?: string;
    contact_available?: boolean;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
}

export default function MarketplacePage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState<MarketplaceRecruiter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        industries: [] as string[],
        specialties: [] as string[],
        location: '',
        search: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 24,
        total: 0,
        total_pages: 0,
    });

    useEffect(() => {
        loadRecruiters();
    }, [filters, pagination.page]);

    const loadRecruiters = async () => {
        try {
            setLoading(true);
            setError('');

            const token = await getToken();
            if (!token) {
                setError('Please sign in to view recruiters.');
                setLoading(false);
                return;
            }

            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filters.industries.length > 0) {
                params.set('industries', filters.industries.join(','));
            }
            if (filters.specialties.length > 0) {
                params.set('specialties', filters.specialties.join(','));
            }
            if (filters.location) {
                params.set('location', filters.location);
            }
            if (filters.search) {
                params.set('search', filters.search);
            }

            const result = await apiClient.get<any>(`/marketplace/recruiters?${params}`, token);
            setRecruiters(result.data);
            setPagination(prev => ({
                ...prev,
                total: result.pagination.total,
                total_pages: result.pagination.total_pages,
            }));
        } catch (err) {
            console.error('Failed to load marketplace recruiters:', err);
            setError('Failed to load recruiters. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const viewRecruiter = (recruiterId: string) => {
        router.push(`/marketplace/${recruiterId}`);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Find Your Recruiter</h1>
                <p className="text-lg text-base-content/70">
                    Connect with specialized recruiters who can help you land your dream job
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="fieldset">
                            <label className="label">Search</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Search recruiters..."
                                value={filters.search}
                                onChange={(e) => {
                                    setFilters({ ...filters, search: e.target.value });
                                    setPagination({ ...pagination, page: 1 });
                                }}
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">Location</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="City or state..."
                                value={filters.location}
                                onChange={(e) => {
                                    setFilters({ ...filters, location: e.target.value });
                                    setPagination({ ...pagination, page: 1 });
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : recruiters.length === 0 ? (
                <div className="card bg-base-100 shadow-md">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-users text-5xl text-base-content/20 mb-4"></i>
                        <h3 className="text-xl font-semibold mb-2">No recruiters found</h3>
                        <p className="text-base-content/70">
                            Try adjusting your search filters
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Results Count */}
                    <div className="mb-4 text-sm text-base-content/70">
                        Showing {recruiters.length} of {pagination.total} recruiters
                    </div>

                    {/* Recruiters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {recruiters.map((recruiter) => (
                            <div key={recruiter.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="avatar placeholder">
                                            <div className="bg-primary text-primary-content rounded-full w-12">
                                                <span className="text-xl">
                                                    {recruiter.user_id.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        {recruiter.marketplace_years_experience && (
                                            <div className="badge badge-outline">
                                                {recruiter.marketplace_years_experience}+ years
                                            </div>
                                        )}
                                    </div>

                                    {recruiter.marketplace_tagline && (
                                        <h3 className="card-title text-lg">{recruiter.marketplace_tagline}</h3>
                                    )}

                                    {recruiter.marketplace_location && (
                                        <p className="text-sm text-base-content/70 flex items-center gap-1">
                                            <i className="fa-solid fa-location-dot"></i>
                                            {recruiter.marketplace_location}
                                        </p>
                                    )}

                                    {recruiter.marketplace_industries && recruiter.marketplace_industries.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {recruiter.marketplace_industries.slice(0, 3).map(industry => (
                                                <span key={industry} className="badge badge-sm">
                                                    {industry}
                                                </span>
                                            ))}
                                            {recruiter.marketplace_industries.length > 3 && (
                                                <span className="badge badge-sm">
                                                    +{recruiter.marketplace_industries.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {recruiter.marketplace_specialties && recruiter.marketplace_specialties.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {recruiter.marketplace_specialties.slice(0, 3).map(specialty => (
                                                <span key={specialty} className="badge badge-sm badge-outline">
                                                    {specialty}
                                                </span>
                                            ))}
                                            {recruiter.marketplace_specialties.length > 3 && (
                                                <span className="badge badge-sm badge-outline">
                                                    +{recruiter.marketplace_specialties.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {recruiter.total_placements !== undefined && (
                                        <div className="stats stats-horizontal shadow-sm mt-3">
                                            <div className="stat px-2 py-2">
                                                <div className="stat-title text-xs">Placements</div>
                                                <div className="stat-value text-lg">{recruiter.total_placements}</div>
                                            </div>
                                            {recruiter.success_rate !== undefined && (
                                                <div className="stat px-2 py-2">
                                                    <div className="stat-title text-xs">Success Rate</div>
                                                    <div className="stat-value text-lg">{Math.round(recruiter.success_rate * 100)}%</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="card-actions justify-end mt-4">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => viewRecruiter(recruiter.id)}
                                        >
                                            View Profile
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                className="btn btn-sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                                Previous
                            </button>
                            <div className="join">
                                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                    let pageNum: number;
                                    if (pagination.total_pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.total_pages - 2) {
                                        pageNum = pagination.total_pages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            className={`join-item btn btn-sm ${pagination.page === pageNum ? 'btn-active' : ''
                                                }`}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="btn btn-sm"
                                disabled={pagination.page === pagination.total_pages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            >
                                Next
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
