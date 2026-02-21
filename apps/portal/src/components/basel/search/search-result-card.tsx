"use client";

import { useRouter } from "next/navigation";
import { BaselStatusPill } from "@splits-network/basel-ui";
import type { SearchResult, SearchableEntityType } from "@/types/search";
import { ENTITY_TYPE_CONFIG, getEntityUrl } from "@/types/search";

/* ─── Entity color map (semantic only) ──────────────────────────────────── */

const ENTITY_COLORS: Record<
    SearchableEntityType,
    "primary" | "secondary" | "accent" | "info" | "success" | "warning"
> = {
    candidate: "primary",
    job: "accent",
    company: "secondary",
    recruiter: "info",
    application: "warning",
    placement: "success",
    recruiter_candidate: "primary",
};

/* ─── Highlight helper ───────────────────────────────────────────────────── */

function highlightQuery(text: string, query: string) {
    if (!query || query.length < 2) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="bg-primary/20 text-base-content px-0.5">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

/* ─── Entity-specific metadata renderer ──────────────────────────────────── */

function EntityMetadata({
    result,
}: {
    result: SearchResult;
}) {
    const m = result.metadata || {};

    switch (result.entity_type) {
        case "candidate":
            return (
                <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 mb-2">
                    {m.current_title && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            {m.current_title}
                        </span>
                    )}
                    {m.current_company && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-building" />
                            {m.current_company}
                        </span>
                    )}
                    {m.location && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {m.location}
                        </span>
                    )}
                    {m.email && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {m.email}
                        </span>
                    )}
                </div>
            );

        case "job":
            return (
                <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 mb-2">
                    {m.company_name && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-building" />
                            {m.company_name}
                        </span>
                    )}
                    {m.location && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {m.location}
                        </span>
                    )}
                    {m.employment_type && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-clock" />
                            {m.employment_type}
                        </span>
                    )}
                    {m.department && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-layer-group" />
                            {m.department}
                        </span>
                    )}
                    {m.status && (
                        <BaselStatusPill
                            color={m.status === "open" ? "success" : "warning"}
                        >
                            {m.status}
                        </BaselStatusPill>
                    )}
                </div>
            );

        case "company":
            return (
                <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 mb-2">
                    {m.industry && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-industry" />
                            {m.industry}
                        </span>
                    )}
                    {m.headquarters_location && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {m.headquarters_location}
                        </span>
                    )}
                    {m.company_size && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-users" />
                            {m.company_size}
                        </span>
                    )}
                    {m.website && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-globe" />
                            {m.website}
                        </span>
                    )}
                </div>
            );

        case "recruiter":
            return (
                <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/50 mb-2">
                    {m.email && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-envelope" />
                            {m.email}
                        </span>
                    )}
                    {m.company_name && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-building" />
                            {m.company_name}
                        </span>
                    )}
                </div>
            );

        default:
            return null;
    }
}

/* ─── Skills tags (candidates only) ──────────────────────────────────────── */

function SkillsTags({ skills }: { skills?: string }) {
    if (!skills) return null;
    const tags = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
    if (tags.length === 0) return null;

    return (
        <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="px-2 py-0.5 bg-base-100 text-[10px] font-semibold text-base-content/40"
                >
                    {tag}
                </span>
            ))}
        </div>
    );
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface SearchResultCardProps {
    result: SearchResult;
    query: string;
    isTopResult?: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function SearchResultCard({
    result,
    query,
    isTopResult,
}: SearchResultCardProps) {
    const router = useRouter();
    const config = ENTITY_TYPE_CONFIG[result.entity_type];
    const color = ENTITY_COLORS[result.entity_type];

    const handleClick = () => {
        const url = getEntityUrl(result.entity_type, result.entity_id);
        router.push(url);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className={`p-5 border transition-all cursor-pointer group ${
                isTopResult
                    ? "border-l-4 border-l-primary bg-base-200 border-t border-r border-b border-base-300"
                    : "bg-base-200 border-base-300 hover:border-primary/50"
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Entity icon */}
                    <div className="w-11 h-11 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                        <i
                            className={`fa-duotone fa-regular ${config.icon} text-lg`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                                {highlightQuery(result.title, query)}
                            </h3>
                            {isTopResult && (
                                <BaselStatusPill color="primary">
                                    Best Match
                                </BaselStatusPill>
                            )}
                        </div>

                        {/* Subtitle */}
                        {result.subtitle && (
                            <p className="text-sm text-base-content/50 mb-2">
                                {highlightQuery(result.subtitle, query)}
                            </p>
                        )}

                        {/* Entity-specific metadata */}
                        <EntityMetadata result={result} />

                        {/* Skills tags for candidates */}
                        {result.entity_type === "candidate" && (
                            <SkillsTags skills={result.metadata?.skills} />
                        )}

                        {/* Context */}
                        {result.context && (
                            <p className="text-sm text-base-content/40 mt-2 line-clamp-1">
                                {result.context}
                            </p>
                        )}
                    </div>
                </div>

                {/* Entity type badge */}
                <div className="flex-shrink-0 ml-4 text-right">
                    <BaselStatusPill color={color}>{config.label}</BaselStatusPill>
                </div>
            </div>
        </div>
    );
}
