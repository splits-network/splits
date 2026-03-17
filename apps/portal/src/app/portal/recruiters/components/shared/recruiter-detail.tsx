"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
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
import { usePresenceStatus } from "@/contexts";
import { Presence } from "@/components/presense";
import {
    LevelBadge,
    BadgeGrid,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselTabBar, BaselBadge } from "@splits-network/basel-ui";

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
    const presenceData = usePresenceStatus(recruiterUserId);
    const presenceStatus = presenceData?.status;

    const successRate = successRateDisplay(recruiter);
    const reputation = reputationDisplay(recruiter);
    const experience = experienceDisplay(recruiter);

    const stats: { label: string; value: string; icon: string; muted: boolean }[] = [
        { label: "Placed", value: placementsDisplay(recruiter), icon: "fa-duotone fa-regular fa-handshake", muted: false },
        { label: "Success", value: successRate || "\u2014", icon: "fa-duotone fa-regular fa-bullseye", muted: !successRate },
        { label: "Rating", value: reputation || "\u2014", icon: "fa-duotone fa-regular fa-star", muted: !reputation },
        { label: "Exp.", value: experience || "\u2014", icon: "fa-duotone fa-regular fa-clock", muted: !experience },
    ];

    return (
        <header className="bg-base-300 text-base-content border-l-4 border-l-primary">
            <div className="px-6 pt-6 pb-0">
                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 btn btn-sm btn-square btn-primary rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}

                {/* Kicker row: firm + status badges */}
                <div className="flex items-center justify-between mb-6 pr-10">
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 truncate">
                        {recruiter.firm_name || "Independent"}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {presenceStatus === "online" && (
                            <Presence status={presenceStatus} variant="badge" />
                        )}
                        <BaselBadge color={status === "active" ? "success" : status === "pending" ? "warning" : status === "suspended" ? "error" : "neutral"} variant="soft" size="sm">
                            {formatStatus(status)}
                        </BaselBadge>
                        {isNew(recruiter) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    <div className="relative shrink-0">
                        {recruiter.users?.profile_image_url ? (
                            <img
                                src={recruiter.users.profile_image_url}
                                alt={name}
                                className="w-20 h-20 object-cover border-2 border-primary"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none">
                                {getInitials(name)}
                            </div>
                        )}
                        {level && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={level} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 pb-1">
                        {recruiter.tagline && (
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-1 truncate">
                                {recruiter.tagline}
                            </p>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content mb-2 truncate">
                            {name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className={`flex items-center gap-1.5 ${location ? "text-base-content/40" : "text-base-content/20"}`}>
                                <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                {location || "Location not specified"}
                            </span>
                            <span className="text-base-content/20">|</span>
                            <span className={`flex items-center gap-1.5 ${memberSince ? "text-base-content/40" : "text-base-content/20"}`}>
                                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                {memberSince ? `Member since ${memberSince}` : "Join date unknown"}
                            </span>
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
                        className="btn btn-sm btn-link btn-accent gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                        <span className="hidden md:inline">View Profile</span>
                    </Link>
                </div>

                {/* Stats strip — always show all 4 */}
                <div
                    className="grid grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                >
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2.5 px-3 py-4"
                        >
                            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10">
                                <i className={`${stat.icon} text-sm ${stat.muted ? "text-base-content/20" : "text-primary"}`} />
                            </div>
                            <div>
                                <span className={`text-lg font-black leading-none block ${stat.muted ? "text-base-content/30" : "text-base-content"}`}>
                                    {stat.value}
                                </span>
                                <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 leading-none">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
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
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-3">
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
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">
                        Specializations
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {specialties.map((spec) => (
                            <BaselBadge key={spec} color="primary" size="sm">
                                {spec}
                            </BaselBadge>
                        ))}
                    </div>
                </div>
            )}

            {/* Industries */}
            {industries.length > 0 && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">
                        Industries
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {industries.map((ind) => (
                            <BaselBadge key={ind} color="info" variant="soft" size="sm">
                                {ind}
                            </BaselBadge>
                        ))}
                    </div>
                </div>
            )}

            {/* Partnership */}
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <BaselBadge
                        color={recruiter.company_recruiter ? "primary" : "neutral"}
                        size="sm"
                        icon="fa-building"
                    >
                        Company Recruiter
                    </BaselBadge>
                    <BaselBadge
                        color={recruiter.candidate_recruiter ? "secondary" : "neutral"}
                        size="sm"
                        icon="fa-user-tie"
                    >
                        Candidate Recruiter
                    </BaselBadge>
                </div>
            </div>

            {/* Earned Badges */}
            {badges.length > 0 && (
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-4">
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
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40">
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
                                <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 mb-0.5">
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
                    {
                        label: "About",
                        value: "about",
                        icon: "fa-duotone fa-regular fa-user",
                    },
                    {
                        label: "Contact",
                        value: "contact",
                        icon: "fa-duotone fa-regular fa-address-book",
                    },
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
                    `/recruiters/${id}/view/profile`,
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
