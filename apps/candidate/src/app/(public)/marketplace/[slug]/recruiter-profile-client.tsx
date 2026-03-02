"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import ConnectModal, { type ConnectModalHandle } from "./connect-modal";
import SimilarRecruiters from "./similar-recruiters";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

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
    success_rate?: number;
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
}

type ProfileTab = "about" | "experience" | "reviews";

function getDisplayName(recruiter: Recruiter): string {
    return (
        recruiter.users?.name ||
        recruiter.name ||
        recruiter.users?.email ||
        "Unknown Recruiter"
    );
}

function getInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}

function memberSinceDisplay(recruiter: Recruiter): string | null {
    if (!recruiter.created_at) return null;
    const d = new Date(recruiter.created_at);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function RecruiterProfileClient({
    recruiter,
}: {
    recruiter: Recruiter;
}) {
    const mainRef = useRef<HTMLElement>(null);
    const connectModalRef = useRef<ConnectModalHandle>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("about");
    const [connected, setConnected] = useState(false);

    const name = getDisplayName(recruiter);
    const memberSince = memberSinceDisplay(recruiter);
    const email = recruiter.users?.email || recruiter.email || null;

    const stats = [
        recruiter.total_placements != null
            ? {
                  label: "Placements",
                  value: String(recruiter.total_placements),
                  icon: "fa-duotone fa-regular fa-trophy",
              }
            : null,
        recruiter.success_rate != null
            ? {
                  label: "Success Rate",
                  value: `${Math.round(recruiter.success_rate)}%`,
                  icon: "fa-duotone fa-regular fa-bullseye",
              }
            : null,
        recruiter.years_experience != null && recruiter.years_experience > 0
            ? {
                  label: "Experience",
                  value: `${recruiter.years_experience}+ yrs`,
                  icon: "fa-duotone fa-regular fa-clock",
              }
            : null,
        recruiter.reputation_score != null
            ? {
                  label: "Rating",
                  value: recruiter.reputation_score.toFixed(1),
                  icon: "fa-duotone fa-regular fa-star",
              }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

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
            if (avatar) {
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
            }

            const nameEl = $1(".profile-name");
            if (nameEl) {
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
            }

            const metas = $(".profile-meta");
            if (metas.length) {
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
            }

            const statEls = $(".profile-stat");
            if (statEls.length) {
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
            }

            const actions = $(".profile-action");
            if (actions.length) {
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
            }

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
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                        <div className="flex items-start gap-6 flex-1">
                            {/* Avatar */}
                            <div className="profile-avatar opacity-0 relative">
                                {recruiter.users?.profile_image_url ? (
                                    <img
                                        src={recruiter.users.profile_image_url}
                                        alt={name}
                                        className="w-24 h-24 lg:w-28 lg:h-28 object-cover border-2 border-primary"
                                    />
                                ) : (
                                    <div className="w-24 h-24 lg:w-28 lg:h-28 bg-primary text-primary-content flex items-center justify-center font-black text-3xl">
                                        {getInitials(name)}
                                    </div>
                                )}
                                {recruiter.status === "active" && (
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-success border-3 border-neutral rounded-full" />
                                )}
                            </div>

                            {/* Name + meta */}
                            <div className="profile-name opacity-0">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-2">
                                    {name}
                                </h1>
                                <p className="text-lg text-neutral-content/60 mb-3">
                                    {recruiter.tagline ||
                                        recruiter.specialization ||
                                        "Recruiter"}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {recruiter.location && (
                                        <span className="profile-meta opacity-0 flex items-center gap-1.5 text-sm text-neutral-content/40">
                                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                            {recruiter.location}
                                        </span>
                                    )}
                                    {memberSince && (
                                        <span className="profile-meta opacity-0 flex items-center gap-1.5 text-sm text-neutral-content/40">
                                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                            Member since {memberSince}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="profile-action opacity-0 btn btn-primary"
                                onClick={() => connectModalRef.current?.open()}
                                disabled={connected}
                            >
                                <i className="fa-duotone fa-regular fa-comments" />
                                {connected ? "Connected" : "Message"}
                            </button>
                            <button
                                className="profile-action opacity-0 btn btn-ghost border-neutral-content/20"
                                onClick={() =>
                                    connectModalRef.current?.open()
                                }
                                disabled={connected}
                            >
                                <i className="fa-duotone fa-regular fa-user-plus" />
                                Connect
                            </button>
                            <button
                                className="profile-action opacity-0 btn btn-ghost border-neutral-content/20"
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
                                <i className="fa-duotone fa-regular fa-share-nodes" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="profile-stat opacity-0 bg-neutral-content/5 p-4 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                                        <i
                                            className={`${stat.icon} text-primary`}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm uppercase tracking-widest opacity-40">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Tabs */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex gap-0">
                        {(["about", "experience", "reviews"] as const).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${
                                        activeTab === tab
                                            ? "border-primary text-primary"
                                            : "border-transparent text-base-content/40 hover:text-base-content/60"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">
                        {activeTab === "about" && (
                            <>
                                {/* Bio */}
                                {recruiter.bio && (
                                    <div className="profile-section opacity-0 mb-10">
                                        <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-user text-primary" />
                                            About
                                        </h2>
                                        <MarkdownRenderer
                                            content={recruiter.bio}
                                            className="text-base-content/70 leading-relaxed"
                                        />
                                    </div>
                                )}

                                {/* Specializations + Industries */}
                                {((recruiter.specialties || []).length > 0 ||
                                    (recruiter.industries || []).length >
                                        0) && (
                                    <div className="profile-section opacity-0 mb-10">
                                        <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-bullseye text-primary" />
                                            Specializations
                                        </h2>
                                        {(recruiter.specialties || []).length >
                                            0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {recruiter.specialties!.map(
                                                    (s) => (
                                                        <span
                                                            key={s}
                                                            className="px-3 py-1.5 bg-primary text-primary-content text-xs font-semibold"
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
                                                <h3 className="text-sm font-bold text-base-content/50 mb-2">
                                                    Industries
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {recruiter.industries!.map(
                                                        (ind) => (
                                                            <span
                                                                key={ind}
                                                                className="px-3 py-1.5 bg-base-200 text-base-content/60 text-xs font-semibold border border-base-300"
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
                            </>
                        )}

                        {activeTab === "experience" && (
                            <div className="profile-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-briefcase text-primary" />
                                    Experience
                                </h2>
                                <div className="flex items-center gap-3 p-6 bg-base-200 text-base-content/40">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-xl" />
                                    <p className="text-sm">
                                        Experience history coming soon.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-star text-primary" />
                                    Reviews
                                </h2>
                                <div className="flex items-center gap-3 p-6 bg-base-200 text-base-content/40">
                                    <i className="fa-duotone fa-regular fa-comments text-xl" />
                                    <p className="text-sm">
                                        Reviews coming soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        {/* Contact card */}
                        <div className="bg-base-200 border-t-4 border-t-primary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Contact
                            </h3>
                            <div className="space-y-3">
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
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <i
                                                    className={`${c!.icon} text-primary text-xs`}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-sm uppercase tracking-widest text-base-content/40">
                                                    {c!.label}
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    {c!.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-base-200 p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Badges
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    recruiter.company_recruiter
                                        ? {
                                              label: "Company Recruiter",
                                              icon: "fa-duotone fa-regular fa-building",
                                              color: "text-primary",
                                          }
                                        : null,
                                    recruiter.candidate_recruiter
                                        ? {
                                              label: "Candidate Recruiter",
                                              icon: "fa-duotone fa-regular fa-user-tie",
                                              color: "text-secondary",
                                          }
                                        : null,
                                    recruiter.reputation_score != null &&
                                    recruiter.reputation_score >= 4.5
                                        ? {
                                              label: "Top Rated",
                                              icon: "fa-duotone fa-regular fa-ranking-star",
                                              color: "text-primary",
                                          }
                                        : null,
                                    recruiter.total_placements != null &&
                                    recruiter.total_placements >= 10
                                        ? {
                                              label: "Experienced",
                                              icon: "fa-duotone fa-regular fa-award",
                                              color: "text-warning",
                                          }
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .map((b) => (
                                        <div
                                            key={b!.label}
                                            className="flex items-center gap-2 p-3 bg-base-100 border border-base-300"
                                        >
                                            <i
                                                className={`${b!.icon} ${b!.color}`}
                                            />
                                            <span className="text-xs font-semibold">
                                                {b!.label}
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
