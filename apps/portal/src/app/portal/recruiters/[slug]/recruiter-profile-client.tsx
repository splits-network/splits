"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { RecruiterWithUser } from "../types";
import { getDisplayName, getInitials } from "../types";
import { statusColor } from "../components/shared/status-color";
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
} from "../components/shared/helpers";
import RecruiterActionsToolbar from "../components/shared/actions-toolbar";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type ProfileTab = "about" | "contact";

export default function RecruiterProfileClient({
    recruiter,
}: {
    recruiter: RecruiterWithUser;
}) {
    const mainRef = useRef<HTMLElement>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("about");

    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";
    const memberSince = memberSinceDisplay(recruiter);
    const email = recruiterEmail(recruiter);

    const stats = [
        {
            label: "Placements",
            value: placementsDisplay(recruiter),
            icon: "fa-duotone fa-regular fa-trophy",
        },
        successRateDisplay(recruiter)
            ? {
                  label: "Success Rate",
                  value: successRateDisplay(recruiter)!,
                  icon: "fa-duotone fa-regular fa-bullseye",
              }
            : null,
        experienceDisplay(recruiter)
            ? {
                  label: "Experience",
                  value: experienceDisplay(recruiter)!,
                  icon: "fa-duotone fa-regular fa-clock",
              }
            : null,
        reputationDisplay(recruiter)
            ? {
                  label: "Rating",
                  value: reputationDisplay(recruiter)!,
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
                    { opacity: 1, scale: 1, duration: 0.5, clearProps: "transform" },
                );
            }

            const nameEl = $1(".profile-name");
            if (nameEl) {
                tl.fromTo(
                    nameEl,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                    "-=0.3",
                );
            }

            const metas = $(".profile-meta");
            if (metas.length) {
                tl.fromTo(
                    metas,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, clearProps: "transform" },
                    "-=0.3",
                );
            }

            const statEls = $(".profile-stat");
            if (statEls.length) {
                tl.fromTo(
                    statEls,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, clearProps: "transform" },
                    "-=0.2",
                );
            }

            const actions = $(".profile-action");
            if (actions.length) {
                tl.fromTo(
                    actions,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, clearProps: "transform" },
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
                            </div>

                            {/* Name + meta */}
                            <div className="profile-name opacity-0">
                                {/* Kicker: firm + status */}
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-content/40">
                                        {recruiter.firm_name || "Independent"}
                                    </p>
                                    <span
                                        className={`badge ${statusColor(status)}`}
                                    >
                                        {formatStatus(status)}
                                    </span>
                                    {isNew(recruiter) && (
                                        <span className="badge badge-warning badge-soft badge-outline">
                                            <i className="fa-duotone fa-regular fa-sparkles" />
                                            New
                                        </span>
                                    )}
                                </div>

                                {recruiter.tagline && (
                                    <p className="text-sm font-semibold text-primary mb-1">
                                        {recruiter.tagline}
                                    </p>
                                )}

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-2">
                                    {name}
                                </h1>

                                <div className="flex flex-wrap gap-3">
                                    {location && (
                                        <span className="profile-meta opacity-0 flex items-center gap-1.5 text-sm text-neutral-content/40">
                                            <i className="fa-duotone fa-regular fa-location-dot" />
                                            {location}
                                        </span>
                                    )}
                                    {memberSince && (
                                        <span className="profile-meta opacity-0 flex items-center gap-1.5 text-sm text-neutral-content/40">
                                            <i className="fa-duotone fa-regular fa-calendar" />
                                            Member since {memberSince}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="profile-action opacity-0 flex flex-wrap gap-2">
                            <RecruiterActionsToolbar
                                recruiter={recruiter}
                                variant="descriptive"
                                size="md"
                                showActions={{ viewDetails: false }}
                            />
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
                        {(
                            [
                                {
                                    key: "about" as const,
                                    label: "About",
                                    icon: "fa-duotone fa-regular fa-user",
                                },
                                {
                                    key: "contact" as const,
                                    label: "Contact",
                                    icon: "fa-duotone fa-regular fa-address-book",
                                },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? "border-primary text-primary"
                                        : "border-transparent text-base-content/40 hover:text-base-content/60 hover:border-base-300"
                                }`}
                            >
                                <i className={tab.icon} />
                                {tab.label}
                            </button>
                        ))}
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
                                            className="prose prose-sm max-w-none text-base-content/70"
                                        />
                                    </div>
                                )}

                                {/* Specializations */}
                                {(recruiter.specialties || []).length > 0 && (
                                    <div className="profile-section opacity-0 mb-10">
                                        <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-bullseye text-primary" />
                                            Specializations
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {recruiter.specialties!.map(
                                                (s) => (
                                                    <span
                                                        key={s}
                                                        className="badge badge-primary"
                                                    >
                                                        {s}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Industries */}
                                {(recruiter.industries || []).length > 0 && (
                                    <div className="profile-section opacity-0 mb-10">
                                        <h3 className="text-sm font-bold text-base-content/50 mb-2">
                                            Industries
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {recruiter.industries!.map(
                                                (ind) => (
                                                    <span
                                                        key={ind}
                                                        className="badge badge-soft badge-outline"
                                                    >
                                                        {ind}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Partnership */}
                                <div className="profile-section opacity-0">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-handshake text-primary" />
                                        Partnership
                                    </h2>
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
                            </>
                        )}

                        {activeTab === "contact" && (
                            <div className="profile-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-address-book text-primary" />
                                    Contact Information
                                </h2>
                                <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                                    <div className="divide-y divide-base-300">
                                        {[
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
                                        ]
                                            .filter(Boolean)
                                            .map((c) => (
                                                <div
                                                    key={c!.label}
                                                    className="flex items-center gap-4 px-6 py-4"
                                                >
                                                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                                        <i
                                                            className={`${c!.icon} text-primary text-sm`}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                                            {c!.label}
                                                        </p>
                                                        {"href" in c! &&
                                                        c!.href ? (
                                                            <a
                                                                href={c!.href}
                                                                className="text-sm font-semibold text-base-content hover:text-primary transition-colors truncate block"
                                                            >
                                                                {c!.value}
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm font-semibold text-base-content truncate">
                                                                {c!.value}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        {/* Quick contact card */}
                        <div className="bg-base-200 border-t-4 border-primary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Quick Info
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
                                    location
                                        ? {
                                              icon: "fa-duotone fa-regular fa-location-dot",
                                              label: "Location",
                                              value: location,
                                          }
                                        : null,
                                    recruiter.firm_name
                                        ? {
                                              icon: "fa-duotone fa-regular fa-building",
                                              label: "Firm",
                                              value: recruiter.firm_name,
                                          }
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .map((c) => (
                                        <div
                                            key={c!.label}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                                <i
                                                    className={`${c!.icon} text-primary text-sm`}
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
                    </div>
                </div>
            </section>
        </main>
    );
}
