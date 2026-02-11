import type { MetadataRoute } from "next";
import { apiClient } from "@/lib/api-client";

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

async function fetchJobIds(): Promise<string[]> {
    const ids: string[] = [];
    let page = 1;
    const limit = 50;

    while (true) {
        const response: any = await apiClient.get("/jobs", {
            params: { page, limit, sort_by: "updated_at", sort_order: "desc" },
        });
        const data = response?.data ?? response ?? [];
        ids.push(
            ...data.map((job: any) => job?.id).filter(Boolean),
        );

        const totalPages = response?.pagination?.total_pages ?? 1;
        if (page >= totalPages) break;
        page += 1;
    }

    return ids;
}

async function fetchRecruiterIds(): Promise<string[]> {
    const ids: string[] = [];
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
        ids.push(
            ...data.map((recruiter: any) => recruiter?.id).filter(Boolean),
        );

        const totalPages = response?.pagination?.total_pages ?? 1;
        if (page >= totalPages) break;
        page += 1;
    }

    return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const lastModified = new Date();
    const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
        priority: route.priority,
    }));

    try {
        const jobIds = await fetchJobIds();
        entries.push(
            ...jobIds.map((id) => ({
                url: `${baseUrl}/public/jobs/${id}`,
                lastModified,
                changeFrequency: "daily" as MetadataRoute.Sitemap[number]["changeFrequency"],
                priority: 0.8,
            })),
        );
    } catch (error) {
        console.error("Failed to fetch jobs for sitemap:", error);
    }

    try {
        const recruiterIds = await fetchRecruiterIds();
        entries.push(
            ...recruiterIds.map((id) => ({
                url: `${baseUrl}/public/marketplace/${id}`,
                lastModified,
                changeFrequency: "weekly" as MetadataRoute.Sitemap[number]["changeFrequency"],
                priority: 0.7,
            })),
        );
    } catch (error) {
        console.error("Failed to fetch recruiters for sitemap:", error);
    }

    return entries;
}
