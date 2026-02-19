"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SimilarRecruiters from "./similar-recruiters";
import { getInitials } from "../components/status-color";

interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    specialization?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface RecruiterDetailProps {
    recruiter: Recruiter;
}

type TabKey = "about" | "activity" | "reviews";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    {
        key: "about",
        label: "About",
        icon: "fa-duotone fa-regular fa-user",
    },
    {
        key: "activity",
        label: "Recent Activity",
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
    },
    {
        key: "reviews",
        label: "Reviews",
        icon: "fa-duotone fa-regular fa-star",
    },
];

export default function RecruiterDetail({ recruiter }: RecruiterDetailProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("about");
    const pageRef = useRef<HTMLDivElement>(null);

    const name = recruiter.users?.name || recruiter.name || "Recruiter";
    const initials = getInitials(name);

    const stats = [
        {
            label: "Placements",
            value: recruiter.total_placements?.toString() || "0",
        },
        {
            label: "Success Rate",
            value: recruiter.success_rate
                ? `${(recruiter.success_rate * 100).toFixed(0)}%`
                : "N/A",
        },
        {
            label: "Experience",
            value: recruiter.years_experience
                ? `${recruiter.years_experience}y`
                : "N/A",
        },
        {
            label: "Rating",
            value: recruiter.reputation_score?.toFixed(1) || "N/A",
        },
    ];

    useGSAP(
        () => {
            if (
                !pageRef.current ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                if (pageRef.current) {
                    gsap.set(
                        pageRef.current.querySelectorAll(
                            "[class*='opacity-0']",
                        ),
                        { opacity: 1 },
                    );
                }
                return;
            }

            const $1 = (sel: string) =>
                pageRef.current!.querySelector(sel);
            const $ = (sel: string) =>
                pageRef.current!.querySelectorAll(sel);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            // Profile header
            const header = $1(".profile-header");
            if (header) {
                tl.fromTo(
                    header,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.7 },
                );
            }

            // Stat blocks
            const statBlocks = $(".stat-block");
            if (statBlocks.length) {
                tl.fromTo(
                    statBlocks,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.08,
                    },
                    "-=0.3",
                );
            }

            // Profile sections
            const sections = $(".profile-section");
            if (sections.length) {
                tl.fromTo(
                    sections,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                    },
                    "-=0.2",
                );
            }
        },
        { scope: pageRef },
    );

    return (
        <div ref={pageRef} className="min-h-screen bg-base-100">
            {/* Primary accent line */}
            <div className="h-1 bg-primary" />

            {/* Profile Header */}
            <div className="profile-header bg-neutral text-neutral-content opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-12">
                    <div className="max-w-5xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/public/marketplace"
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-content/50 hover:text-neutral-content transition-colors mb-8"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left" />
                            Back to Marketplace
                        </Link>

                        <div className="flex flex-col md:flex-row items-start gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 flex items-center justify-center bg-primary text-primary-content">
                                    <span className="text-3xl font-black">
                                        {initials}
                                    </span>
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 flex items-center justify-center bg-success text-success-content">
                                    <i className="fa-solid fa-check text-xs" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-success/15 text-success">
                                        Active
                                    </span>
                                    {recruiter.specialization && (
                                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-primary/15 text-primary">
                                            {recruiter.specialization}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[0.95] mb-2">
                                    {name}
                                </h1>

                                {recruiter.tagline && (
                                    <p className="text-sm font-semibold text-primary mb-3">
                                        {recruiter.tagline}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-content/50">
                                    {recruiter.location && (
                                        <span>
                                            <i className="fa-duotone fa-regular fa-location-dot mr-1 text-secondary" />
                                            {recruiter.location}
                                        </span>
                                    )}
                                    <span>
                                        <i className="fa-duotone fa-regular fa-calendar mr-1 text-secondary" />
                                        Joined{" "}
                                        {new Date(
                                            recruiter.created_at,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    className="btn btn-sm btn-ghost btn-square text-neutral-content/50 hover:text-neutral-content"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-share-nodes" />
                                </button>
                                <button
                                    className="btn btn-sm btn-ghost btn-square text-neutral-content/50 hover:text-neutral-content"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-bookmark" />
                                </button>
                                <button
                                    className="btn btn-sm btn-primary gap-2"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-handshake" />
                                    Connect
                                </button>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-neutral-content/10 mt-8">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="stat-block bg-neutral p-5 text-center opacity-0"
                                >
                                    <p className="text-2xl font-black tracking-tight text-primary">
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-content/40 mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-base-100 border-b-2 border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-5xl mx-auto flex">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
                                    activeTab === tab.key
                                        ? "border-primary text-base-content"
                                        : "border-transparent text-base-content/40 hover:text-base-content/60"
                                }`}
                            >
                                <i
                                    className={`${tab.icon} text-xs ${
                                        activeTab === tab.key
                                            ? "text-primary"
                                            : ""
                                    }`}
                                />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 lg:px-12 py-10">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === "about" && (
                            <>
                                {/* Bio */}
                                {recruiter.bio && (
                                    <div className="profile-section bg-base-100 border-2 border-base-300 border-l-4 border-l-primary p-8 opacity-0">
                                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                                            About
                                        </h2>
                                        <p className="text-base-content/70 leading-relaxed">
                                            {recruiter.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Specializations */}
                                {((recruiter.specialties &&
                                    recruiter.specialties.length > 0) ||
                                    (recruiter.industries &&
                                        recruiter.industries.length > 0)) && (
                                    <div className="profile-section bg-base-100 border-2 border-base-300 border-l-4 border-l-secondary p-8 opacity-0">
                                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                                            Specializations
                                        </h2>

                                        {recruiter.specialties &&
                                            recruiter.specialties.length >
                                                0 && (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {recruiter.specialties.map(
                                                        (s, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-xs font-bold uppercase tracking-[0.15em] bg-secondary/10 text-secondary px-3 py-1.5"
                                                            >
                                                                {s}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {recruiter.industries &&
                                            recruiter.industries.length >
                                                0 && (
                                                <>
                                                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                                        <i className="fa-duotone fa-regular fa-tags mr-2 text-accent" />
                                                        Industries
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {recruiter.industries.map(
                                                            (industry, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs uppercase tracking-[0.15em] text-base-content/60 border border-base-300 px-3 py-1.5"
                                                                >
                                                                    {industry}
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

                        {activeTab === "activity" && (
                            <div className="profile-section bg-base-100 border-2 border-base-300 border-l-4 border-l-info p-8 opacity-0">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-6">
                                    Recent Activity
                                </h2>
                                <div className="text-center py-8">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-3xl text-base-content/15 mb-3 block" />
                                    <p className="text-sm text-base-content/50">
                                        No recent activity available.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section bg-base-100 border-2 border-base-300 border-l-4 border-l-warning p-8 opacity-0">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-6">
                                    Reviews
                                </h2>
                                <div className="text-center py-8">
                                    <i className="fa-duotone fa-regular fa-star text-3xl text-base-content/15 mb-3 block" />
                                    <p className="text-sm text-base-content/50">
                                        No reviews yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-base-200 border-t-4 border-t-primary p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Contact Info
                            </h3>
                            <div className="space-y-3">
                                {recruiter.users?.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary">
                                            <i className="fa-duotone fa-regular fa-envelope text-xs" />
                                        </div>
                                        <span className="text-base-content/70 truncate">
                                            {recruiter.users.email}
                                        </span>
                                    </div>
                                )}
                                {recruiter.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-7 h-7 flex items-center justify-center bg-secondary/10 text-secondary">
                                            <i className="fa-duotone fa-regular fa-phone text-xs" />
                                        </div>
                                        <span className="text-base-content/70">
                                            {recruiter.phone}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent">
                                        <i className="fa-duotone fa-regular fa-comment text-xs" />
                                    </div>
                                    <button className="text-base-content/70 hover:text-primary transition-colors text-left">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Similar Recruiters */}
                        <SimilarRecruiters
                            currentRecruiterId={recruiter.id}
                            industries={recruiter.industries}
                            specialties={recruiter.specialties}
                        />

                        {/* Availability */}
                        <div className="bg-base-200 border-t-4 border-t-success p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-3">
                                Status
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                                <span className="text-sm font-bold text-success">
                                    Currently Active
                                </span>
                            </div>
                            <p className="text-xs text-base-content/50">
                                Open to new opportunities and partnerships.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
