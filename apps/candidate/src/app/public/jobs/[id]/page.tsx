import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { apiClient, createAuthenticatedClient } from "@/lib/api-client";
import JobDetailClient from "./components/job-detail-client";
import { cache } from "react";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical, CANDIDATE_BASE_URL } from "@/lib/seo";

interface JobRequirement {
    id: string;
    requirement_type: "mandatory" | "preferred";
    description: string;
    sort_order: number;
}

interface Job {
    id: string;
    title: string;
    company?: {
        name: string;
        description?: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    open_to_relocation?: boolean;
    updated_at?: string;
    created_at?: string;
    status?: string;
    description?: string;
    candidate_description?: string;
    requirements?: JobRequirement[];
}

interface PageProps {
    params: Promise<{ id: string }>;
}

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength = 155) {
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength - 1).trimEnd() + "…";
}

const fetchJob = cache(async (id: string): Promise<Job | null> => {
    try {
        const response = await apiClient.get<{ data: Job }>(`/jobs/${id}`, {
            params: { include: "company,requirements" },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch job:", error);
        return null;
    }
});

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const job = await fetchJob(id);
    const canonicalPath = `/public/jobs/${id}`;

    if (!job) {
        return {
            title: "Job Details",
            description:
                "Explore job details and requirements on Applicant Network.",
            ...buildCanonical(canonicalPath),
        };
    }

    const rawDescription =
        job.candidate_description ||
        job.description ||
        "View job responsibilities, requirements, and application details.";
    const description = truncateText(stripHtml(rawDescription));

    return {
        title: job.title
            ? `${job.title} at ${job.company?.name ?? "Applicant Network"}`
            : "Job Details",
        description,
        ...buildCanonical(canonicalPath),
    };
}

export default async function JobDetailPage({ params }: PageProps) {
    const { id } = await params;
    const { userId, getToken } = await auth();

    const job = await fetchJob(id);
    let hasActiveRecruiter = false;
    let existingApplication: any = null;

    if (!job) {
        notFound();
    }

    const jobPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title || "Job Opportunity",
        description:
            job.candidate_description ||
            job.description ||
            "View job responsibilities, requirements, and application details.",
        datePosted: job.created_at || job.updated_at,
        validThrough: job.updated_at,
        employmentType: job.employment_type,
        hiringOrganization: job.company?.name
            ? {
                  "@type": "Organization",
                  name: job.company.name,
              }
            : undefined,
        jobLocation: job.location
            ? {
                  "@type": "Place",
                  address: job.location,
              }
            : undefined,
        baseSalary:
            job.salary_min || job.salary_max
                ? {
                      "@type": "MonetaryAmount",
                      currency: "USD",
                      value: {
                          "@type": "QuantitativeValue",
                          minValue: job.salary_min ?? undefined,
                          maxValue: job.salary_max ?? undefined,
                          unitText: "YEAR",
                      },
                  }
                : undefined,
        identifier: job.id
            ? {
                  "@type": "PropertyValue",
                  name: "Applicant Network Job ID",
                  value: job.id,
              }
            : undefined,
        url: `${CANDIDATE_BASE_URL}/public/jobs/${job.id}`,
    };

    // Check if user has an active recruiter relationship and existing application
    if (userId) {
        try {
            const token = await getToken();
            if (token) {
                const authClient = createAuthenticatedClient(token);
                const [recruitersResponse, applicationsResponse] =
                    await Promise.all([
                        authClient.get<{ data: any[] }>(
                            "/recruiter-candidates",
                        ),
                        authClient.get<{ data: any[] }>("/applications"),
                    ]);

                hasActiveRecruiter =
                    recruitersResponse.data &&
                    recruitersResponse.data.length > 0;

                // Check for existing application to this job
                const applications = applicationsResponse.data || [];
                existingApplication = applications.find(
                    (app: any) =>
                        app.job_id === id &&
                        !["rejected", "withdrawn"].includes(app.stage),
                );
            }
        } catch (error) {
            console.error(
                "Failed to fetch recruiter relationships or applications:",
                error,
            );
        }
    }

    return (
        <>
            <JsonLd data={jobPostingJsonLd} id="job-posting-jsonld" />
            <JobDetailClient
                job={job}
                isAuthenticated={!!userId}
                hasActiveRecruiter={hasActiveRecruiter}
                existingApplication={existingApplication}
            />
        </>
    );
}
