import { apiClient } from "@/lib/api-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network";

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function buildDescription(job: any) {
    const company = job?.company?.name || job?.company_name || "";
    const location = job?.location || "";
    const salaryMin = job?.salary_min ? `$${Number(job.salary_min).toLocaleString()}` : "";
    const salaryMax = job?.salary_max ? `$${Number(job.salary_max).toLocaleString()}` : "";
    const salary = salaryMin && salaryMax ? `${salaryMin} - ${salaryMax}` : salaryMin || salaryMax || "";

    const summaryParts = [company, location, salary].filter(Boolean);
    const summary = summaryParts.length ? summaryParts.join(" | ") : "";

    const rawBody = job?.candidate_description || job?.recruiter_description || job?.description || "";
    const body = stripHtml(rawBody);

    return summary ? `${summary}. ${body}`.trim() : body;
}

function getJobUrl(job: any) {
    return `${baseUrl}/public/jobs/${job?.id}`;
}

export async function GET() {
    let jobs: any[] = [];

    try {
        const response: any = await apiClient.get("/jobs", {
            params: { limit: 50, sort_by: "updated_at", sort_order: "desc" },
        });
        jobs = response?.data || response || [];
    } catch (error) {
        jobs = [];
    }

    const now = new Date().toUTCString();

    const items = jobs
        .map((job) => {
            const title = escapeXml(job?.title || "Untitled role");
            const link = escapeXml(getJobUrl(job));
            const guid = link;
            const updatedAt = job?.updated_at || job?.created_at || new Date().toISOString();
            const pubDate = new Date(updatedAt).toUTCString();
            const description = escapeXml(buildDescription(job));

            return [
                "<item>",
                `  <title>${title}</title>`,
                `  <link>${link}</link>`,
                `  <guid>${guid}</guid>`,
                `  <pubDate>${pubDate}</pubDate>`,
                `  <description>${description}</description>`,
                "</item>",
            ].join("\n");
        })
        .join("\n");

    const xml = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<rss version=\"2.0\">",
        "<channel>",
        "<title>Applicant Network Jobs</title>",
        `<link>${baseUrl}/public/jobs</link>`,
        "<description>Latest jobs published on Applicant Network.</description>",
        "<language>en-us</language>",
        `<lastBuildDate>${now}</lastBuildDate>`,
        items || "",
        "</channel>",
        "</rss>",
    ].join("\n");

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
        },
    });
}

