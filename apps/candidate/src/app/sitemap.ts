import type { MetadataRoute } from "next";
import { apiClient } from "@/lib/api-client";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network";

const staticRoutes = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/public/jobs", changeFrequency: "daily", priority: 0.9 },
    { path: "/public/marketplace", changeFrequency: "weekly", priority: 0.8 },
    { path: "/public/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/public/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/public/help", changeFrequency: "monthly", priority: 0.7 },
    { path: "/public/how-it-works", changeFrequency: "monthly", priority: 0.7 },
    { path: "/public/for-recruiters", changeFrequency: "monthly", priority: 0.7 },
    { path: "/public/resources/career-guides", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/switch-careers", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/networking", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/remote-work", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/negotiating-offers", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/first-90-days", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/career-guides/personal-branding", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/industry-trends", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/interview-prep", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/resume-tips", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/salary-insights", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/resources/success-stories", changeFrequency: "monthly", priority: 0.6 },
    { path: "/public/status", changeFrequency: "monthly", priority: 0.4 },
    { path: "/public/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/public/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/public/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
];

const appRoot = join(process.cwd(), "apps", "candidate", "src", "app");

function getLastModifiedForPath(path: string) {
    const relative = path === "" ? "page.tsx" : `${path.slice(1)}/page.tsx`;
    const filePath = join(appRoot, relative);
    if (existsSync(filePath)) {
        return statSync(filePath).mtime;
    }
    return new Date();
}

function toDate(value?: string) {
    return value ? new Date(value) : new Date();
}

async function fetchJobs(): Promise<{ id: string; updated_at?: string; created_at?: string }[]> {
    const jobs: { id: string; updated_at?: string; created_at?: string }[] = [];
    let page = 1;
    const limit = 50;

    while (true) {
        const response: any = await apiClient.get("/jobs", {
            params: { page, limit, sort_by: "updated_at", sort_order: "desc" },
        });
        const data = response?.data ?? response ?? [];
        jobs.push(
            ...data
                .filter((job: any) => job?.id)
                .map((job: any) => ({
                    id: job.id,
                    updated_at: job.updated_at,
                    created_at: job.created_at,
                })),
        );

        const totalPages = response?.pagination?.total_pages ?? 1;
        if (page >= totalPages) break;
        page += 1;
    }

    return jobs;
}

async function fetchRecruiters(): Promise<{ id: string; updated_at?: string; created_at?: string }[]> {
    const recruiters: { id: string; updated_at?: string; created_at?: string }[] = [];
    let page = 1;
    const limit = 50;

    while (true) {
        const response: any = await apiClient.get("/recruiters", {
            params: {
                page,
                limit,
                include: "user,reputation",
                filters: { marketplace_enabled: true },
            },
        });
        const data = response?.data ?? response ?? [];
        recruiters.push(
            ...data
                .filter((recruiter: any) => recruiter?.id)
                .map((recruiter: any) => ({
                    id: recruiter.id,
                    updated_at: recruiter.updated_at,
                    created_at: recruiter.created_at,
                })),
        );

        const totalPages = response?.pagination?.total_pages ?? 1;
        if (page >= totalPages) break;
        page += 1;
    }

    return recruiters;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: getLastModifiedForPath(route.path),
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: route.priority,
    }));

    try {
        const jobs = await fetchJobs();
        entries.push(
            ...jobs.map((job) => ({
                url: `${baseUrl}/public/jobs/${job.id}`,
                lastModified: toDate(job.updated_at ?? job.created_at),
                changeFrequency: "daily" as MetadataRoute.Sitemap[number]["changeFrequency"],
                priority: 0.8,
            })),
        );
    } catch (error) {
        console.error("Failed to fetch jobs for sitemap:", error);
    }

    try {
        const recruiters = await fetchRecruiters();
        entries.push(
            ...recruiters.map((recruiter) => ({
                url: `${baseUrl}/public/marketplace/${recruiter.id}`,
                lastModified: toDate(recruiter.updated_at ?? recruiter.created_at),
                changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
                priority: 0.7,
            })),
        );
    } catch (error) {
        console.error("Failed to fetch recruiters for sitemap:", error);
    }

    return entries;
}
