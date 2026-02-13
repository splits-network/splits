import type { Metadata } from 'next';
import type { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { Suspense } from 'react';
import MarketplaceList from './components/marketplace-list';
import { apiClient } from '@/lib/api-client';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Recruiter Marketplace',
    description: 'Discover expert recruiters by industry, specialty, and location.',
    openGraph: {
        title: "Recruiter Marketplace",
        description: "Discover expert recruiters by industry, specialty, and location.",
        url: "https://applicant.network/public/marketplace",
    },
    ...buildCanonical("/public/marketplace"),
};

export const revalidate = 60;

interface MarketplacePageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    tagline?: string;
    specialization?: string;
    location?: string;
    years_experience?: number;
    bio?: string;
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

async function getSearchParam(
    searchParamsPromise: Promise<Record<string, string | string[] | undefined>> | undefined,
    key: string
): Promise<string | undefined> {
    if (!searchParamsPromise) return undefined;
    const searchParams = await searchParamsPromise;
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
}

async function buildMarketplaceParams(searchParams: MarketplacePageProps['searchParams']): Promise<StandardListParams> {
    const page = Number(await getSearchParam(searchParams, 'page') ?? '1') || 1;
    const limit = Number(await getSearchParam(searchParams, 'limit') ?? '24') || 24;
    const search = await getSearchParam(searchParams, 'search');
    const sortBy = await getSearchParam(searchParams, 'sort_by') ?? 'reputation_score';
    const sortOrder = (await getSearchParam(searchParams, 'sort_order') as 'asc' | 'desc') ?? 'desc';
    const filtersRaw = await getSearchParam(searchParams, 'filters');

    let filters: Record<string, any> | undefined;
    if (filtersRaw) {
        try {
            filters = JSON.parse(filtersRaw);
        } catch (error) {
            filters = undefined;
        }
    }

    const mergedFilters = {
        marketplace_enabled: true,
        ...(filters ?? {}),
    };

    return {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        include: 'user,reputation',
        ...(search ? { search } : {}),
        filters: mergedFilters,
    };
}

function StaticRecruiterList({ recruiters }: { recruiters: Recruiter[] }) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Recruiter Marketplace</h1>
                <p className="text-base-content/70 mt-1">
                    Discover expert recruiters by industry, specialty, and location
                </p>
            </div>
            {recruiters.length === 0 ? (
                <p>No recruiters found. Check back soon.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recruiters.map((recruiter) => (
                        <article
                            key={recruiter.id}
                            className="card bg-base-100 shadow-sm border border-base-300"
                        >
                            <div className="card-body p-4">
                                <h2 className="card-title text-md">
                                    <a href={`/public/marketplace/${recruiter.id}`}>
                                        {recruiter.users?.name || recruiter.name || "Recruiter"}
                                    </a>
                                </h2>
                                {recruiter.tagline && (
                                    <p className="text-sm text-base-content/70">
                                        {recruiter.tagline}
                                    </p>
                                )}
                                {recruiter.specialization && (
                                    <p className="text-sm">{recruiter.specialization}</p>
                                )}
                                {recruiter.location && (
                                    <p className="text-sm">{recruiter.location}</p>
                                )}
                                {recruiter.years_experience != null && (
                                    <p className="text-sm">
                                        {recruiter.years_experience} years experience
                                    </p>
                                )}
                                {recruiter.bio && (
                                    <p className="text-sm line-clamp-3 text-base-content/80">
                                        {recruiter.bio.substring(0, 200)}
                                    </p>
                                )}
                                <a
                                    href={`/public/marketplace/${recruiter.id}`}
                                    className="btn btn-primary btn-sm mt-2"
                                >
                                    View Profile
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
    const params = await buildMarketplaceParams(searchParams);
    let initialData: Recruiter[] | undefined;
    let initialPagination: StandardListResponse<Recruiter>['pagination'] | undefined;

    try {
        const response = await apiClient.get<StandardListResponse<Recruiter>>('/recruiters', { params });
        initialData = response.data ?? [];
        initialPagination = response.pagination;
    } catch (error) {
        initialData = undefined;
        initialPagination = undefined;
    }

    return (
        <div className="container mx-auto p-6">
            <Suspense
                fallback={<StaticRecruiterList recruiters={initialData || []} />}
            >
                <MarketplaceList initialData={initialData} initialPagination={initialPagination} />
            </Suspense>
        </div>
    );
}
