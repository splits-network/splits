"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor } from "./status-color";
import {
    recruiterEmail,
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    reputationDisplay,
    experienceDisplay,
    memberSinceDisplay,
    isNew,
} from "./helpers";
import Link from "next/link";
import RecruiterActionsToolbar from "./actions-toolbar";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import {
    LevelBadge,
    BadgeGrid,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselTabBar } from "@splits-network/basel-ui";

// ─── Types ──────────────────────────────────────────────────────────────────

type DetailTab = "about" | "contact";

// ─── Sub-components ─────────────────────────────────────────────────────────

function HeroHeader({
    recruiter,
    onClose,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel, getBadges } = useGamification();
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
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                }}
            />

            <div className="relative px-6 pt-6 pb-0">
                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 btn btn-sm btn-square btn-ghost text-neutral-content/60 hover:text-neutral-content z-10"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}

                {/* Kicker row: firm + status */}
                <div className="flex items-center justify-between mb-6 pr-10">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40 truncate">
                        {recruiter.firm_name || "Independent"}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
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

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    {recruiter.users?.profile_image_url ? (
                        <img
                            src={recruiter.users.profile_image_url}
                            alt={name}
                            className="w-20 h-20 object-cover border-2 border-primary shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none shrink-0">
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0 pb-1">
                        {recruiter.tagline && (
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                                {recruiter.tagline}
                            </p>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none text-neutral-content mb-2 truncate">
                            {name}
                            {level && (
                                <span className="ml-2 align-middle inline-block">
                                    <LevelBadge level={level} size="sm" />
                                </span>
                            )}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                            {location && (
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                    {location}
                                </span>
                            )}
                            {memberSince && (
                                <>
                                    {location && (
                                        <span className="text-neutral-content/20">
                                            |
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                        Member since {memberSince}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <RecruiterActionsToolbar
                        recruiter={recruiter}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{ viewDetails: false }}
                    />
                    <div className="w-px self-stretch bg-neutral-content/20" />
                    <Link
                        href={`/recruiters/${recruiter.slug || recruiter.id}`}
                        className="btn btn-sm btn-link gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                        <span className="hidden md:inline">View Profile</span>
                    </Link>
                </div>

                {/* Stats strip */}
                <div
                    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
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
                                    className={`w-9 h-9 flex items-center justify-center shrink-0 ${iconStyle}`}
                                >
                                    <i className={`${stat.icon} text-sm`} />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-neutral-content leading-none block">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}

function AboutPanel({ recruiter }: { recruiter: RecruiterWithUser }) {
    const { getBadges } = useGamification();
    const badges = getBadges(recruiter.id);
    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];
    const bioContent = recruiter.bio;

    return (
        <div className="space-y-8 p-6">
            {/* Bio */}
            {bioContent && (
                <div className="border-l-4 border-l-primary pl-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        About
                    </p>
                    <MarkdownRenderer
                        content={bioContent}
                        className="prose prose-sm max-w-none text-base-content/70"
                    />
                </div>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Specializations
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {specialties.map((spec) => (
                            <span key={spec} className="badge badge-primary">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Industries */}
            {industries.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Industries
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {industries.map((ind) => (
                            <span
                                key={ind}
                                className="badge badge-soft badge-outline"
                            >
                                {ind}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Partnership */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`badge gap-2 ${
                            recruiter.company_recruiter
                                ? "badge-primary"
                                : "badge-ghost"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-building" />
                        Company Recruiter
                    </span>
                    <span
                        className={`badge gap-2 ${
                            recruiter.candidate_recruiter
                                ? "badge-secondary"
                                : "badge-ghost"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-user-tie" />
                        Candidate Recruiter
                    </span>
                </div>
            </div>

            {/* Earned Badges */}
            {badges.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Earned Badges
                    </p>
                    <div className="bg-base-200 border border-base-300">
                        <BadgeGrid badges={badges} maxVisible={6} />
                    </div>
                </div>
            )}
        </div>
    );
}

function ContactPanel({ recruiter }: { recruiter: RecruiterWithUser }) {
    const email = recruiterEmail(recruiter);
    const location = recruiterLocation(recruiter);

    const contactItems = [
        email
            ? {
                  icon: "fa-duotone fa-regular fa-envelope",
                  label: "Email",
                  value: email,
                  href: `mailto:${email}`,
              }
            : null,
        recruiter.phone
            ? {
                  icon: "fa-duotone fa-regular fa-phone",
                  label: "Phone",
                  value: recruiter.phone,
              }
            : null,
        location
            ? {
                  icon: "fa-duotone fa-regular fa-location-dot",
                  label: "Location",
                  value: location,
              }
            : null,
    ].filter(Boolean) as {
        icon: string;
        label: string;
        value: string;
        href?: string;
    }[];

    return (
        <div className="p-6">
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Contact
                    </p>
                </div>
                <div className="divide-y divide-base-300">
                    {contactItems.map((c) => (
                        <div
                            key={c.label}
                            className="flex items-center gap-4 px-6 py-4"
                        >
                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                <i
                                    className={`${c.icon} text-primary text-xs`}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                    {c.label}
                                </p>
                                {c.href ? (
                                    <a
                                        href={c.href}
                                        className="text-sm font-semibold text-base-content hover:text-primary transition-colors truncate block"
                                    >
                                        {c.value}
                                    </a>
                                ) : (
                                    <p className="text-sm font-semibold text-base-content truncate">
                                        {c.value}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function RecruiterDetail({
    recruiter,
    onClose,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const [activeTab, setActiveTab] = useState<DetailTab>("about");
    const { registerEntities } = useGamification();

    useEffect(() => {
        registerEntities("recruiter", [recruiter.id]);
    }, [recruiter.id, registerEntities]);

    return (
        <div>
            <HeroHeader
                recruiter={recruiter}
                onClose={onClose}
                onRefresh={onRefresh}
            />
            <BaselTabBar
                tabs={[
                    { label: "About", value: "about", icon: "fa-duotone fa-regular fa-user" },
                    { label: "Contact", value: "contact", icon: "fa-duotone fa-regular fa-address-book" },
                ]}
                active={activeTab}
                onChange={(v) => setActiveTab(v as DetailTab)}
                className="bg-base-100 border-b border-base-300"
            />
            {activeTab === "about" && <AboutPanel recruiter={recruiter} />}
            {activeTab === "contact" && <ContactPanel recruiter={recruiter} />}
        </div>
    );
}

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

export function DetailLoader({
    recruiterId,
    onClose,
    onRefresh,
}: {
    recruiterId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [recruiter, setRecruiter] = useState<RecruiterWithUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: RecruiterWithUser }>(
                    `/recruiters/${id}`,
                    {
                        params: { include: "user,reputation" },
                    },
                );
                if (!signal?.cancelled) setRecruiter(res.data);
            } catch (err) {
                console.error("Failed to fetch recruiter detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(recruiterId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [recruiterId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (!recruiter) return null;

    return (
        <RecruiterDetail
            recruiter={recruiter}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
