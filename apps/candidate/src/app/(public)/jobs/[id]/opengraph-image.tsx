import { ImageResponse } from "next/og";
import { apiClient } from "@/lib/api-client";

export const alt = "Job listing on Applicant Network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Basel theme tokens (from apps/candidate/src/app/themes/light.css)
 * OG images are static PNGs — no CSS vars available, so we
 * hardcode the light-theme values from the single source of truth.
 */
const theme = {
    primary: "#233876",
    primaryContent: "#f9fafb",
    secondary: "#0f9d8a",
    secondaryContent: "#f9fafb",
    neutral: "#18181b",
    neutralContent: "#fafafa",
    base100: "#ffffff",
    base200: "#f4f4f5",
    base300: "#e4e4e7",
    baseContent: "#18181b",
};

interface Job {
    title?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    show_salary_range?: boolean;
    employment_type?: string;
    company?: { name?: string; logo_url?: string };
}

function formatSalary(min?: number, max?: number): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

export default async function OgImage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let job: Job | null = null;
    try {
        const res = await apiClient.get<{ data: Job }>(
            `/jobs/${id}/view/candidate-detail`,
        );
        job = res.data;
    } catch {
        /* fall through to default */
    }

    const title = job?.title || "Job Opportunity";
    const company = job?.company?.name || "Applicant Network";
    const location = job?.location;
    const salary =
        job?.show_salary_range !== false
            ? formatSalary(job?.salary_min, job?.salary_max)
            : null;
    const employmentType = job?.employment_type
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const tags = [location, employmentType, salary].filter(Boolean);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    backgroundColor: theme.neutral,
                    color: theme.neutralContent,
                    fontFamily: "sans-serif",
                }}
            >
                {/* Left accent border — Basel border-l-4 pattern */}
                <div
                    style={{
                        width: 8,
                        backgroundColor: theme.primary,
                        flexShrink: 0,
                    }}
                />

                {/* Main content area — editorial asymmetric 70/30 split */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flex: 1,
                        padding: "60px 72px",
                    }}
                >
                    {/* Top: kicker + title */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* Kicker — company name */}
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: theme.secondary,
                                marginBottom: 20,
                            }}
                        >
                            {company}
                        </div>

                        {/* Title — large editorial heading */}
                        <div
                            style={{
                                fontSize: title.length > 40 ? 48 : 56,
                                fontWeight: 900,
                                lineHeight: 1.05,
                                letterSpacing: "-0.02em",
                                maxWidth: "85%",
                            }}
                        >
                            {title}
                        </div>
                    </div>

                    {/* Bottom: tags + branding */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Tags — sharp corners, solid fills */}
                        {tags.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                {tags.map((tag) => (
                                    <div
                                        key={tag}
                                        style={{
                                            fontSize: 18,
                                            padding: "8px 20px",
                                            backgroundColor: "rgba(255,255,255,0.08)",
                                            color: theme.base300,
                                        }}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer bar */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderTop: `1px solid rgba(255,255,255,0.08)`,
                                paddingTop: 20,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: theme.secondary,
                                }}
                            >
                                applicant.network
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    color: "rgba(255,255,255,0.4)",
                                }}
                            >
                                View full details &amp; apply
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right accent panel — diagonal clip-path, Basel signature */}
                <div
                    style={{
                        width: 200,
                        backgroundColor: theme.primary,
                        display: "flex",
                        flexShrink: 0,
                        clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />
            </div>
        ),
        { ...size },
    );
}
