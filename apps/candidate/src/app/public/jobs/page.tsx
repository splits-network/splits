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
    openGraph: {
        title: "Browse Jobs",
        description:
            "Search thousands of open roles and apply with one click on Applicant Network.",
        url: "https://applicant.network/public/jobs",
    },
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

function formatEmploymentType(type?: string | null): string {
    if (!type) return "Not specified";
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

function formatSalaryRange(min?: number | null, max?: number | null): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

function StaticJobsList({ jobs }: { jobs: any[] }) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Browse Jobs</h1>
                <p className="text-base-content/70 mt-1">
                    Search thousands of open roles and apply with one click
                </p>
            </div>
            {jobs.length === 0 ? (
                <p>No jobs found. Check back soon for new opportunities.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {jobs.map((job) => (
                        <article
                            key={job.id}
                            className="card bg-base-100 shadow-sm border border-base-300"
                        >
                            <div className="card-body p-4">
                                <h2 className="card-title text-md">
                                    <a href={`/public/jobs/${job.id}`}>
                                        {job.title}
                                    </a>
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    {job.company?.name || job.company_name || "Company"}
                                </p>
                                {job.location && (
                                    <p className="text-sm">{job.location}</p>
                                )}
                                <p className="text-sm">
                                    {formatEmploymentType(job.employment_type)}
                                </p>
                                {job.show_salary_range !== false &&
                                    formatSalaryRange(job.salary_min, job.salary_max) && (
                                        <p className="text-sm font-medium">
                                            {formatSalaryRange(job.salary_min, job.salary_max)}
                                        </p>
                                    )}
                                <p className="text-sm line-clamp-3 text-base-content/80">
                                    {(
                                        job.candidate_description ||
                                        job.description ||
                                        "No description provided"
                                    ).substring(0, 200)}
                                </p>
                                <a
                                    href={`/public/jobs/${job.id}`}
                                    className="btn btn-primary btn-sm mt-2"
                                >
                                    View Details
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}
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
            <Suspense
                fallback={<StaticJobsList jobs={initialData || []} />}
            >
                <JobsContent
                    initialData={initialData}
                    initialPagination={initialPagination}
                />
            </Suspense>
        </div>
    );
}
