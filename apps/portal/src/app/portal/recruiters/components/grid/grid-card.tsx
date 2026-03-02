"use client";

import Link from "next/link";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    reputationDisplay,
    experienceDisplay,
    memberSinceDisplay,
    isNew,
} from "../shared/helpers";
import RecruiterActionsToolbar from "../shared/actions-toolbar";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

export function GridCard({
    recruiter,
    isSelected,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(recruiter.id);
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";
    const memberSince = memberSinceDisplay(recruiter);
    const recruiterUserId = recruiter.users?.id;
    const presence = usePresence([recruiterUserId], {
        enabled: Boolean(recruiterUserId),
    });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    const stats = [
        {
            label: "Placed",
            value: placementsDisplay(recruiter),
            icon: "fa-duotone fa-regular fa-handshake",
        },
        successRateDisplay(recruiter)
            ? {
                  label: "Success",
                  value: successRateDisplay(recruiter)!,
                  icon: "fa-duotone fa-regular fa-bullseye",
              }
            : null,
        reputationDisplay(recruiter)
            ? {
                  label: "Rating",
                  value: reputationDisplay(recruiter)!,
                  icon: "fa-duotone fa-regular fa-star",
              }
            : null,
        experienceDisplay(recruiter)
            ? {
                  label: "Exp.",
                  value: experienceDisplay(recruiter)!,
                  icon: "fa-duotone fa-regular fa-clock",
              }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col h-full bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-lg",
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
                        {presenceStatus === "online" && (
                            <Presence status={presenceStatus} variant="badge" />
                        )}
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
                            {level && (
                                <span className="ml-2 align-middle inline-block">
                                    <LevelBadge level={level} size="sm" />
                                </span>
                            )}
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
                            {location && (
                                <span className="text-base-content/20">|</span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-calendar" />
                                Member since {memberSince}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Card Body — evenly distribute sections */}
            <div className="flex-1 flex flex-col justify-between">
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
                                const iconStyle =
                                    iconStyles[i % iconStyles.length];
                                return (
                                    <div
                                        key={stat.label}
                                        className="flex items-center gap-2.5 px-3 py-4"
                                    >
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconStyle}`}
                                        >
                                            <i
                                                className={`${stat.icon} text-xs`}
                                            />
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
                                    {(recruiter.specialties || []).length >
                                        4 && (
                                        <span className="badge badge-ghost">
                                            +
                                            {(recruiter.specialties || [])
                                                .length - 4}
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
                                    {(recruiter.industries || []).length >
                                        3 && (
                                        <span className="badge badge-ghost">
                                            +
                                            {(recruiter.industries || [])
                                                .length - 3}
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
            </div>

            {/* Footer: actions */}
            <div
                className="mt-auto flex items-center justify-between gap-3 px-6 py-4 border-t border-base-200"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`/recruiters/${recruiter.slug || recruiter.id}`}
                    className="btn btn-sm btn-link gap-1"
                >
                    View Profile
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                </Link>
                <RecruiterActionsToolbar
                    recruiter={recruiter}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        viewDetails: false,
                    }}
                />
            </div>
        </div>
    );
}
