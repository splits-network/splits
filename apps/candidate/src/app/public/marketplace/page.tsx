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
            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }>
                <MarketplaceList initialData={initialData} initialPagination={initialPagination} />
            </Suspense>
        </div>
    );
}
