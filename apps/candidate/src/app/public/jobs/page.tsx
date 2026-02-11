import type { Metadata } from "next";
import type { StandardListParams } from "@splits-network/shared-types";
import { Suspense } from "react";
import { apiClient } from "@/lib/api-client";
import { JsonLd } from "@splits-network/shared-ui";
import JobsContent from "./components/jobs-content";
import { buildCanonical } from "@/lib/seo";

const canonicalUrl = buildCanonical("/public/jobs").alternates.canonical;

export const metadata: Metadata = {
    title: "Browse Jobs",
    description:
        "Search thousands of open roles and apply with one click on Applicant Network.",
    alternates: {
        canonical: canonicalUrl,
        types: {
            "application/rss+xml": "/public/jobs/rss.xml",
            "application/atom+xml": "/public/jobs/atom.xml",
        },
    },
};

export const revalidate = 60;

interface JobsPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function getSearchParam(
    searchParamsPromise:
        | Promise<Record<string, string | string[] | undefined>>
        | undefined,
    key: string,
): Promise<string | undefined> {
    if (!searchParamsPromise) return undefined;
    const searchParams = await searchParamsPromise;
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
}

async function buildJobsParams(
    searchParams: JobsPageProps["searchParams"],
): Promise<StandardListParams> {
    const page =
        Number((await getSearchParam(searchParams, "page")) ?? "1") || 1;
    const limit =
        Number((await getSearchParam(searchParams, "limit")) ?? "24") || 24;
    const search = await getSearchParam(searchParams, "search");
    const sortBy =
        (await getSearchParam(searchParams, "sort_by")) ?? "updated_at";
    const sortOrder =
        ((await getSearchParam(searchParams, "sort_order")) as
            | "asc"
            | "desc") ?? "desc";
    const filtersRaw = await getSearchParam(searchParams, "filters");

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

function JobsLoading() {
    return (
        <div>
            <div className="mb-8">
                <div className="h-10 w-64 bg-base-300 animate-pulse rounded mb-2" />
                <div className="h-6 w-96 bg-base-300 animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="h-16 bg-base-300 animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg" />
            </div>
        </div>
    );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const params = await buildJobsParams(searchParams);
    let initialData: any[] | undefined;
    let initialPagination: any | undefined;

    try {
        const response = await apiClient.get<any>("/jobs", { params });
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
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network"}/public/jobs`,
        itemListElement: (initialData || []).slice(0, 20).map((job, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network"}/public/jobs/${job?.id}`,
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
        <div className="container-fluid mx-auto px-4 py-4 space-y-8">
            <JsonLd data={jobListJsonLd} id="jobs-jsonld" />
            <Suspense fallback={<JobsLoading />}>
                <JobsContent
                    initialData={initialData}
                    initialPagination={initialPagination}
                />
            </Suspense>
        </div>
    );
}
