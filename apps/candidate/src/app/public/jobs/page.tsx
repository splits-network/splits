import type { Metadata } from 'next';
import type { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { Suspense } from 'react';
import JobsList from './components/jobs-list';
import { apiClient } from '@/lib/api-client';
import { JsonLd } from '@splits-network/shared-ui';

export const metadata: Metadata = {
    title: 'Browse Jobs',
    description: 'Search thousands of open roles and apply with one click on Applicant Network.',
    alternates: {
        types: {
            'application/rss+xml': '/public/jobs/rss.xml',
            'application/atom+xml': '/public/jobs/atom.xml',
        },
    },
};

export const revalidate = 60;

interface JobsPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

async function buildJobsParams(searchParams: JobsPageProps['searchParams']): Promise<StandardListParams> {
    const page = Number(await getSearchParam(searchParams, 'page') ?? '1') || 1;
    const limit = Number(await getSearchParam(searchParams, 'limit') ?? '24') || 24;
    const search = await getSearchParam(searchParams, 'search');
    const sortBy = await getSearchParam(searchParams, 'sort_by') ?? 'updated_at';
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

    return {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search ? { search } : {}),
        ...(filters ? { filters } : {}),
    };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const params = await buildJobsParams(searchParams);
    let initialData: any[] | undefined;
    let initialPagination: any | undefined;

    try {
        const response = await apiClient.get<any>('/jobs', { params });
        initialData = response.data ?? [];
        initialPagination = response.pagination;
    } catch (error) {
        initialData = undefined;
        initialPagination = undefined;
    }

    const jobListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Applicant Network Jobs",
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://applicant.network'}/public/jobs`,
        itemListElement: (initialData || []).slice(0, 20).map((job, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://applicant.network'}/public/jobs/${job?.id}`,
            item: {
                "@type": "JobPosting",
                title: job?.title || "Untitled role",
                datePosted: job?.created_at || job?.updated_at,
                hiringOrganization: job?.company?.name
                    ? {
                          "@type": "Organization",
                          name: job.company.name,
                      }
                    : undefined,
                jobLocation: job?.location
                    ? {
                          "@type": "Place",
                          address: job.location,
                      }
                    : undefined,
            },
        })),
    };

    return (
        <div className="container mx-auto px-4 py-10 space-y-8">
            <JsonLd data={jobListJsonLd} id="jobs-jsonld" />
            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }>
                <JobsList initialData={initialData} initialPagination={initialPagination} />
            </Suspense>
        </div>
    );
}
