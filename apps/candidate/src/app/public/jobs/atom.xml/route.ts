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

function buildSummary(job: any) {
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

    const updated = new Date().toISOString();

    const entries = jobs
        .map((job) => {
            const title = escapeXml(job?.title || "Untitled role");
            const link = escapeXml(getJobUrl(job));
            const id = link;
            const updatedAt = job?.updated_at || job?.created_at || updated;
            const summary = escapeXml(buildSummary(job));

            return [
                "<entry>",
                `  <title>${title}</title>`,
                `  <link href=\"${link}\" />`,
                `  <id>${id}</id>`,
                `  <updated>${new Date(updatedAt).toISOString()}</updated>`,
                `  <summary>${summary}</summary>`,
                "</entry>",
            ].join("\n");
        })
        .join("\n");

    const xml = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<feed xmlns=\"http://www.w3.org/2005/Atom\">",
        "<title>Applicant Network Jobs</title>",
        `<link href=\"${baseUrl}/public/jobs\" />`,
        `<link href=\"${baseUrl}/public/jobs/atom.xml\" rel=\"self\" />`,
        `<id>${baseUrl}/public/jobs</id>`,
        `<updated>${updated}</updated>`,
        entries || "",
        "</feed>",
    ].join("\n");

    return new Response(xml, {
        headers: {
            "Content-Type": "application/atom+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
        },
    });
}

