"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@clerk/nextjs";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { BadgeGrid, LevelBadge, MiniLeaderboard } from "@splits-network/shared-gamification";
import { BaselTabBar } from "@splits-network/basel-ui";
import type { BadgeAward, EntityLevelInfo } from "@splits-network/shared-gamification";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ApiClient } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";
import ConnectModal, { type ConnectModalHandle } from "./connect-modal";
import SimilarRecruiters from "./similar-recruiters";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Types ───────────────────────────────────────────────────────────── */

interface Recruiter {
    id: string;
    user_id: string;
    slug?: string;
    name?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    specialization?: string;
    firm_name?: string;
    status?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    hire_rate?: number;
    reputation_score?: number;
    candidate_recruiter?: boolean;
    company_recruiter?: boolean;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
        profile_image_url?: string;
    };
    recent_activity?: {
        id: string;
        activity_type: string;
        description: string;
        metadata: Record<string, unknown>;
        created_at: string;
    }[];
    response_rate?: number;
    avg_response_time_hours?: number;
}

type ProfileTab = "about" | "experience" | "reviews";

/* ─── Constants ──────────────────────────────────────────────────────── */

const TABS: { key: ProfileTab; label: string; icon: string }[] = [
    { key: "about", label: "About", icon: "fa-duotone fa-regular fa-user" },
    {
        key: "experience",
        label: "Experience",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        key: "reviews",
        label: "Reviews",
        icon: "fa-duotone fa-regular fa-star",
    },
];

const STAT_ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

const ACTIVITY_TYPE_DISPLAY: Record<string, { icon: string; color: string }> = {
    placement_created: { icon: "fa-duotone fa-regular fa-file-signature", color: "text-primary" },
    placement_completed: { icon: "fa-duotone fa-regular fa-handshake", color: "text-primary" },
    company_connected: { icon: "fa-duotone fa-regular fa-building", color: "text-secondary" },
    candidate_connected: { icon: "fa-duotone fa-regular fa-user-plus", color: "text-secondary" },
    invitation_accepted: { icon: "fa-duotone fa-regular fa-envelope-open", color: "text-accent" },
    referral_signup: { icon: "fa-duotone fa-regular fa-link", color: "text-success" },
    profile_verified: { icon: "fa-duotone fa-regular fa-badge-check", color: "text-success" },
    profile_updated: { icon: "fa-duotone fa-regular fa-pen", color: "text-warning" },
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function getDisplayName(r: Recruiter): string {
    return r.users?.name || r.name || r.users?.email || "Unknown Recruiter";
}

function getInitials(name: string): string {
    const w = name.split(" ");
    return w.length > 1
        ? (w[0][0] + w[w.length - 1][0]).toUpperCase()
        : (w[0]?.[0] || "").toUpperCase();
}

function formatResponseTime(hours: number | null | undefined): string {
    if (hours == null) return "N/A";
    if (hours < 1) return "< 1 hr";
    if (hours < 2) return "< 2 hrs";
    if (hours < 24) return `~${Math.round(hours)} hrs`;
    const days = Math.round(hours / 24);
    return `~${days} day${days > 1 ? "s" : ""}`;
}

function memberSinceLabel(r: Recruiter): string | null {
    if (!r.created_at) return null;
    const d = new Date(r.created_at);
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildStats(r: Recruiter) {
    return [
        r.total_placements != null
            ? {
                  label: "Placements",
                  value: String(r.total_placements),
                  icon: "fa-duotone fa-regular fa-trophy",
              }
            : null,
        r.hire_rate != null
            ? {
                  label: "Success Rate",
                  value: `${Math.round(r.hire_rate)}%`,
                  icon: "fa-duotone fa-regular fa-bullseye",
              }
            : null,
        r.years_experience != null && r.years_experience > 0
            ? {
                  label: "Experience",
                  value: `${r.years_experience}+ yrs`,
                  icon: "fa-duotone fa-regular fa-clock",
              }
            : null,
        r.reputation_score != null
            ? {
                  label: "Rating",
                  value: r.reputation_score.toFixed(1),
                  icon: "fa-duotone fa-regular fa-star",
              }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];
}

/* ─── Component ───────────────────────────────────────────────────────── */

export default function RecruiterProfileClient({
    recruiter,
}: {
    recruiter: Recruiter;
}) {
    const mainRef = useRef<HTMLElement>(null);
    const connectModalRef = useRef<ConnectModalHandle>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("about");
    const [connected, setConnected] = useState(false);
    const [badges, setBadges] = useState<BadgeAward[]>([]);
    const [level, setLevel] = useState<EntityLevelInfo | null>(null);
    const { isSignedIn, getToken } = useAuth();
    const presence = usePresence([recruiter.user_id], {
        enabled: Boolean(recruiter.user_id),
    });
    const presenceStatus = recruiter.user_id
        ? presence[recruiter.user_id]?.status
        : undefined;

    /* ─── Check existing connection ──────────────────────────────────── */

    useEffect(() => {
        if (!isSignedIn) return;
        let cancelled = false;

        async function checkConnection() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res: any = await client.get("/chat/conversations", {
                    params: { filter: "inbox", limit: 100 },
                });
                const conversations = res?.data || [];
                const hasAccepted = conversations.some(
                    (c: any) =>
                        c.participant_a_id === recruiter.user_id ||
                        c.participant_b_id === recruiter.user_id,
                );
                if (!cancelled && hasAccepted) {
                    setConnected(true);
                }
            } catch {
                // Silently fail — default to showing Connect button
            }
        }

        checkConnection();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, recruiter.user_id]);

    /* ─── Fetch gamification data (public, no auth needed) ────────────── */

    useEffect(() => {
        let cancelled = false;
        const client = new ApiClient();

        async function fetchGamification() {
            try {
                const [badgeRes, levelRes] = await Promise.allSettled([
                    client.get<{ data: BadgeAward[] }>("/badges/awards", {
                        params: { entity_type: "recruiter", entity_id: recruiter.id },
                    }),
                    client.get<{ data: EntityLevelInfo }>("/xp/level", {
                        params: { entity_type: "recruiter", entity_id: recruiter.id },
                    }),
                ]);

                if (cancelled) return;

                if (badgeRes.status === "fulfilled" && badgeRes.value?.data) {
                    setBadges(badgeRes.value.data);
                }
                if (levelRes.status === "fulfilled" && levelRes.value?.data) {
                    setLevel(levelRes.value.data);
                }
            } catch {
                // Gamification data is non-critical — fail silently
            }
        }

        fetchGamification();
        return () => { cancelled = true; };
    }, [recruiter.id]);

    const name = getDisplayName(recruiter);
    const memberSince = memberSinceLabel(recruiter);
    const email = recruiter.users?.email || recruiter.email || null;
    const stats = buildStats(recruiter);

    /* ─── GSAP ────────────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const avatar = $1(".profile-avatar");
            if (avatar)
                tl.fromTo(
                    avatar,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        clearProps: "transform",
                    },
                );

            const nameEl = $1(".profile-name");
            if (nameEl)
                tl.fromTo(
                    nameEl,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        clearProps: "transform",
                    },
                    "-=0.3",
                );

            const metas = $(".profile-meta");
            if (metas.length)
                tl.fromTo(
                    metas,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.05,
                        clearProps: "transform",
                    },
                    "-=0.3",
                );

            const statEls = $(".profile-stat");
            if (statEls.length)
                tl.fromTo(
                    statEls,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.06,
                        clearProps: "transform",
                    },
                    "-=0.2",
                );

            const actions = $(".profile-action");
            if (actions.length)
                tl.fromTo(
                    actions,
                    { opacity: 0, y: 10 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        stagger: 0.06,
                        clearProps: "transform",
                    },
                    "-=0.2",
                );

            $(".profile-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        clearProps: "transform",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        },
                    },
                );
            });
        },
        { scope: mainRef, dependencies: [activeTab], revertOnUpdate: true },
    );

    /* ─── Render ──────────────────────────────────────────────────────── */

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative px-8 pt-10 pb-0">
                    {/* Kicker row */}
                    <div className="profile-meta opacity-0 flex items-center justify-between mb-8">
                        <div>
                            {recruiter.firm_name && (
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40">
                                    {recruiter.firm_name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                                <i className="fa-duotone fa-regular fa-badge-check text-sm" />
                                Verified
                            </span>
                            {presenceStatus === "online" && (
                                <Presence
                                    status={presenceStatus}
                                    variant="badge"
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Avatar + Identity */}
                    <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                        <div className="flex items-end gap-5 flex-1">
                            <div className="profile-avatar opacity-0 shrink-0">
                                {recruiter.users?.profile_image_url ? (
                                    <img
                                        src={recruiter.users.profile_image_url}
                                        alt={name}
                                        className="w-20 h-20 lg:w-24 lg:h-24 object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-black tracking-tight select-none">
                                        {getInitials(name)}
                                    </div>
                                )}
                            </div>

                            <div className="profile-name opacity-0 min-w-0 pb-1">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1">
                                    {recruiter.tagline ||
                                        recruiter.specialization ||
                                        "Recruiter"}
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-neutral-content mb-3">
                                    {name}
                                    {level && (
                                        <span className="ml-3 align-middle inline-block">
                                            <LevelBadge level={level} size="md" />
                                        </span>
                                    )}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                                    {recruiter.location && (
                                        <span className="flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                            {recruiter.location}
                                        </span>
                                    )}
                                    {recruiter.location && memberSince && (
                                        <span className="text-neutral-content/20">
                                            |
                                        </span>
                                    )}
                                    {memberSince && (
                                        <span className="flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                            Member since {memberSince}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap gap-2 pb-1 shrink-0">
                            {connected ? (
                                <a
                                    href="/chat"
                                    className="profile-action opacity-0 btn btn-primary btn-sm font-bold uppercase tracking-wider"
                                >
                                    <i className="fa-duotone fa-regular fa-comments" />{" "}
                                    Message
                                </a>
                            ) : (
                                <button
                                    className="profile-action opacity-0 btn btn-primary btn-sm font-bold uppercase tracking-wider"
                                    onClick={() =>
                                        connectModalRef.current?.open()
                                    }
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus" />{" "}
                                    Connect
                                </button>
                            )}
                            <button
                                className="profile-action opacity-0 btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: name,
                                            url: window.location.href,
                                        });
                                    } else {
                                        navigator.clipboard.writeText(
                                            window.location.href,
                                        );
                                    }
                                }}
                            >
                                <i className="fa-duotone fa-regular fa-share-nodes" />{" "}
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Stats strip */}
                    {stats.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-8">
                            {stats.map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="profile-stat opacity-0 flex items-center gap-3 px-4 py-4"
                                >
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center shrink-0 ${STAT_ICON_STYLES[i % STAT_ICON_STYLES.length]}`}
                                    >
                                        <i
                                            className={`${stat.icon} text-base`}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-xl font-black text-neutral-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* ── Tab Nav ─────────────────────────────────────────────── */}
            <BaselTabBar
                tabs={TABS.map(t => ({ label: t.label, value: t.key, icon: t.icon }))}
                active={activeTab}
                onChange={(v) => setActiveTab(v as ProfileTab)}
                className="bg-base-100 border-b border-base-300 container mx-auto px-8"
            />

            {/* ── Content ─────────────────────────────────────────────── */}
            <section className="container mx-auto px-8 py-12">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                    {/* Main column */}
                    <div className="lg:col-span-3">
                        {activeTab === "about" && (
                            <div className="space-y-10">
                                {/* Bio */}
                                {recruiter.bio && (
                                    <div className="profile-section opacity-0 border-l-4 border-l-primary pl-6">
                                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                                            About
                                        </p>
                                        <MarkdownRenderer
                                            content={recruiter.bio}
                                            className="text-base text-base-content/70 leading-relaxed"
                                        />
                                    </div>
                                )}

                                {/* Specializations + Industries */}
                                {((recruiter.specialties || []).length > 0 ||
                                    (recruiter.industries || []).length >
                                        0) && (
                                    <div className="profile-section opacity-0">
                                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                                            Specializations
                                        </p>
                                        {(recruiter.specialties || []).length >
                                            0 && (
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {recruiter.specialties!.map(
                                                    (s) => (
                                                        <span
                                                            key={s}
                                                            className="px-3 py-1.5 bg-primary text-primary-content text-xs font-bold uppercase tracking-wider"
                                                        >
                                                            {s}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        {(recruiter.industries || []).length >
                                            0 && (
                                            <>
                                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                                                    Industries
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {recruiter.industries!.map(
                                                        (ind) => (
                                                            <span
                                                                key={ind}
                                                                className="px-3 py-1.5 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60"
                                                            >
                                                                {ind}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Partnership signals */}
                                <div className="profile-section opacity-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                                        Partnership
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                                                recruiter.company_recruiter
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-200 border border-base-300 text-base-content/30"
                                            }`}
                                        >
                                            <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                            Seeking Splits
                                        </span>
                                        <span
                                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                                                recruiter.candidate_recruiter
                                                    ? "bg-secondary text-secondary-content"
                                                    : "bg-base-200 border border-base-300 text-base-content/30"
                                            }`}
                                        >
                                            <i className="fa-duotone fa-regular fa-user-plus text-sm" />
                                            Accepts Candidates
                                        </span>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="profile-section opacity-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                                        Recent Activity
                                    </p>
                                    <div className="divide-y divide-base-300 border border-base-300">
                                        {recruiter.recent_activity &&
                                        recruiter.recent_activity.length >
                                            0 ? (
                                            recruiter.recent_activity.map(
                                                (item) => {
                                                    const display =
                                                        ACTIVITY_TYPE_DISPLAY[
                                                            item.activity_type
                                                        ] || {
                                                            icon: "fa-duotone fa-regular fa-circle",
                                                            color: "text-base-content/40",
                                                        };
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-4 px-5 py-4"
                                                        >
                                                            <i
                                                                className={`${display.icon} ${display.color} text-base w-4 text-center shrink-0`}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-base-content/80">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 shrink-0">
                                                                {formatRelativeTime(
                                                                    item.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                },
                                            )
                                        ) : (
                                            <div className="px-5 py-6 text-center text-sm text-base-content/40">
                                                No recent activity
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "experience" && (
                            <div className="profile-section opacity-0">
                                <div className="bg-base-200 border border-base-300 p-10 lg:p-16">
                                    <div className="max-w-lg mx-auto text-center">
                                        <div className="w-20 h-20 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                            <i className="fa-duotone fa-regular fa-briefcase text-primary text-4xl" />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                                            Experience coming soon
                                        </h2>
                                        <p className="text-base font-semibold text-base-content/60 mb-3">
                                            We are building something great.
                                        </p>
                                        <p className="text-sm text-base-content/50 leading-relaxed">
                                            Detailed work history, placement
                                            timelines, and career milestones
                                            will appear here once available.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section opacity-0">
                                <div className="bg-base-200 border border-base-300 p-10 lg:p-16">
                                    <div className="max-w-lg mx-auto text-center">
                                        <div className="w-20 h-20 bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                                            <i className="fa-duotone fa-regular fa-star text-secondary text-4xl" />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                                            Reviews coming soon
                                        </h2>
                                        <p className="text-base font-semibold text-base-content/60 mb-3">
                                            Feedback that speaks for itself.
                                        </p>
                                        <p className="text-sm text-base-content/50 leading-relaxed">
                                            Client testimonials, placement
                                            ratings, and peer endorsements will
                                            be displayed here once the review
                                            system launches.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact card */}
                        <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                            <div className="px-6 py-4 border-b border-base-300">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                                    Contact
                                </p>
                            </div>
                            <div className="divide-y divide-base-300">
                                {[
                                    email
                                        ? {
                                              icon: "fa-duotone fa-regular fa-envelope",
                                              label: "Email",
                                              value: email,
                                          }
                                        : null,
                                    recruiter.phone
                                        ? {
                                              icon: "fa-duotone fa-regular fa-phone",
                                              label: "Phone",
                                              value: recruiter.phone,
                                          }
                                        : null,
                                    recruiter.location
                                        ? {
                                              icon: "fa-duotone fa-regular fa-location-dot",
                                              label: "Location",
                                              value: recruiter.location,
                                          }
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .map((c) => (
                                        <div
                                            key={c!.label}
                                            className="flex items-center gap-4 px-6 py-4"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                                <i
                                                    className={`${c!.icon} text-primary text-xs`}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                                    {c!.label}
                                                </p>
                                                <p className="text-sm font-semibold text-base-content truncate">
                                                    {c!.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <div className="px-6 pb-5 pt-4">
                                {connected ? (
                                    <a
                                        href="/chat"
                                        className="btn btn-primary btn-sm w-full font-bold uppercase tracking-wider"
                                    >
                                        <i className="fa-duotone fa-regular fa-comments" />
                                        Message
                                    </a>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-sm w-full font-bold uppercase tracking-wider"
                                        onClick={() =>
                                            connectModalRef.current?.open()
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-user-plus" />
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Badges card */}
                        <div className="bg-base-200 border border-base-300">
                            <div className="px-6 py-4 border-b border-base-300">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                                    Earned Badges
                                </p>
                            </div>
                            <BadgeGrid badges={badges} />
                        </div>

                        {/* Mini Leaderboard */}
                        <MiniLeaderboard
                            entityType="recruiter"
                            entityId={recruiter.id}
                            client={new ApiClient()}
                            showToggle={!!recruiter.specialties?.length}
                            specialization={recruiter.specialties?.[0]}
                            fullLeaderboardHref="/portal/leaderboard"
                        />

                        {/* Network Activity card */}
                        <div className="bg-base-200 border border-base-300">
                            <div className="px-6 py-4 border-b border-base-300">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                                    Network Activity
                                </p>
                            </div>
                            <div className="divide-y divide-base-300">
                                {[
                                    recruiter.response_rate != null
                                        ? {
                                              label: "Response Rate",
                                              value: `${Math.round(recruiter.response_rate)}%`,
                                              icon: "fa-duotone fa-regular fa-reply",
                                          }
                                        : null,
                                    recruiter.avg_response_time_hours != null
                                        ? {
                                              label: "Avg Response Time",
                                              value: formatResponseTime(recruiter.avg_response_time_hours),
                                              icon: "fa-duotone fa-regular fa-clock",
                                          }
                                        : null,
                                    memberSince
                                        ? {
                                              label: "Active Since",
                                              value: memberSince,
                                              icon: "fa-duotone fa-regular fa-calendar",
                                          }
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .map((item) => (
                                        <div
                                            key={item!.label}
                                            className="flex items-center justify-between px-6 py-3.5"
                                        >
                                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/40">
                                                <i
                                                    className={`${item!.icon} text-xs`}
                                                />
                                                {item!.label}
                                            </span>
                                            <span className="text-sm font-black text-base-content">
                                                {item!.value}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Similar Recruiters */}
                        <SimilarRecruiters
                            currentRecruiterId={recruiter.id}
                            industries={recruiter.industries}
                            specialties={recruiter.specialties}
                        />
                    </div>
                </div>
            </section>

            {/* Connect Modal */}
            <ConnectModal
                ref={connectModalRef}
                recruiterName={name}
                recruiterUserId={recruiter.user_id}
                specialization={recruiter.specialization}
                onConnected={() => setConnected(true)}
            />
        </main>
    );
}
