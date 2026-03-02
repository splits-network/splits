"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import { getInitials } from "./status-color";
import { MarkdownRenderer } from "@splits-network/shared-ui";

interface GridCardProps {
    recruiter: Recruiter;
    isSelected?: boolean;
    onSelect?: (recruiter: Recruiter) => void;
}

function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusColor(status: string) {
    switch (status) {
        case "active":
            return "badge-info badge-soft badge-outline";
        case "pending":
            return "badge-warning badge-soft badge-outline";
        case "suspended":
            return "badge-error badge-soft badge-outline";
        case "inactive":
            return "badge-ghost";
        default:
            return "badge-ghost";
    }
}

function memberSinceDisplay(recruiter: Recruiter) {
    if (!recruiter.created_at) return null;
    const date = new Date(recruiter.created_at);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isNew(recruiter: Recruiter) {
    if (!recruiter.created_at) return false;
    const created = new Date(recruiter.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
}

export default function GridCard({
    recruiter,
    isSelected,
    onSelect,
}: GridCardProps) {
    const name = recruiter.users?.name || recruiter.name || "Unknown Recruiter";
    const location = recruiter.location;
    const status = recruiter.status || "active";
    const memberSince = memberSinceDisplay(recruiter);

    const stats = [
        recruiter.total_placements != null
            ? { label: "Placed", value: String(recruiter.total_placements), icon: "fa-duotone fa-regular fa-handshake" }
            : null,
        recruiter.success_rate != null
            ? { label: "Success", value: `${Math.round(recruiter.success_rate)}%`, icon: "fa-duotone fa-regular fa-bullseye" }
            : null,
        recruiter.reputation_score != null
            ? { label: "Rating", value: recruiter.reputation_score.toFixed(1), icon: "fa-duotone fa-regular fa-star" }
            : null,
        recruiter.years_experience != null && recruiter.years_experience > 0
            ? { label: "Exp.", value: `${recruiter.years_experience}yr`, icon: "fa-duotone fa-regular fa-clock" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <div
            onClick={() => onSelect?.(recruiter)}
            className={[
                "recruiter-card group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-lg",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary hover:border-primary/40",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: firm name + status badges */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        {recruiter.firm_name || "Independent"}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge ${statusColor(status)}`}>
                            {formatStatus(status)}
                        </span>
                        {isNew(recruiter) && (
                            <span className="badge badge-warning badge-soft badge-outline">
                                <i className="fa-duotone fa-regular fa-sparkles" />
                                New
                            </span>
                        )}
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    {recruiter.users?.profile_image_url ? (
                        <img
                            src={recruiter.users.profile_image_url}
                            alt={name}
                            className="w-16 h-16 object-cover border-2 border-primary shrink-0"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none shrink-0">
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        {recruiter.tagline && (
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                                {recruiter.tagline}
                            </p>
                        )}
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Location + Member since */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    {location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {location}
                        </span>
                    )}
                    {memberSince && (
                        <>
                            {location && <span className="text-base-content/20">|</span>}
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-calendar" />
                                Member since {memberSince}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Bio */}
            {recruiter.bio && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        About
                    </p>
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={recruiter.bio} />
                    </div>
                </div>
            )}

            {/* Stats Row */}
            {stats.length > 0 && (
                <div className="border-b border-base-300">
                    <div
                        className="grid divide-x divide-base-300"
                        style={{
                            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        }}
                    >
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-2.5 px-3 py-4"
                                >
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconStyle}`}
                                    >
                                        <i className={`${stat.icon} text-xs`} />
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-base-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Specialties + Industries tags */}
            {((recruiter.specialties || []).length > 0 ||
                (recruiter.industries || []).length > 0) && (
                <div className="px-6 py-5 border-b border-base-300 space-y-4">
                    {(recruiter.specialties || []).length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                                Specialties
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(recruiter.specialties || [])
                                    .slice(0, 4)
                                    .map((spec) => (
                                        <span
                                            key={spec}
                                            className="badge badge-primary badge-soft badge-outline"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                {(recruiter.specialties || []).length > 4 && (
                                    <span className="badge badge-ghost">
                                        +{(recruiter.specialties || []).length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {(recruiter.industries || []).length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                                Industries
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(recruiter.industries || [])
                                    .slice(0, 3)
                                    .map((ind) => (
                                        <span
                                            key={ind}
                                            className="badge badge-soft badge-outline"
                                        >
                                            {ind}
                                        </span>
                                    ))}
                                {(recruiter.industries || []).length > 3 && (
                                    <span className="badge badge-ghost">
                                        +{(recruiter.industries || []).length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Partnership Badges */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`badge gap-2 ${recruiter.company_recruiter ? "badge-primary" : "badge-ghost"}`}
                    >
                        <i className="fa-duotone fa-regular fa-building" />
                        Company Recruiter
                    </span>
                    <span
                        className={`badge gap-2 ${recruiter.candidate_recruiter ? "badge-secondary" : "badge-ghost"}`}
                    >
                        <i className="fa-duotone fa-regular fa-user-tie" />
                        Candidate Recruiter
                    </span>
                </div>
            </div>

            {/* Footer: view link */}
            <div
                className="mt-auto flex items-center justify-end gap-3 px-6 py-4 border-t border-base-200"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`/marketplace/${recruiter.slug || recruiter.id}`}
                    className="btn btn-sm btn-link gap-1"
                >
                    View Profile
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                </Link>
            </div>
        </div>
    );
}
