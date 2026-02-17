"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import SimilarRecruiters from "./similar-recruiters";

const C = { coral: "#FF6B6B", teal: "#4ECDC4", mint: "#95E1D3", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

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

interface RecruiterDetailMemphisProps {
    recruiter: Recruiter;
}

export default function RecruiterDetailMemphis({ recruiter }: RecruiterDetailMemphisProps) {
    const [activeTab, setActiveTab] = useState<"about" | "activity" | "reviews">("about");
    const pageRef = useRef<HTMLDivElement>(null);

    const name = recruiter.users?.name || recruiter.name || "Recruiter";
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

    // Stats
    const stats = [
        { label: "Placements", value: recruiter.total_placements?.toString() || "0", color: C.coral },
        { label: "Success Rate", value: recruiter.success_rate ? `${(recruiter.success_rate * 100).toFixed(0)}%` : "N/A", color: C.teal },
        { label: "Experience", value: recruiter.years_experience ? `${recruiter.years_experience}y` : "N/A", color: C.yellow },
        { label: "Rating", value: recruiter.reputation_score?.toFixed(1) || "N/A", color: C.purple },
    ];

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(pageRef.current.querySelector(".profile-header"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        gsap.fromTo(pageRef.current.querySelectorAll(".stat-block"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.08, delay: 0.3 });
        gsap.fromTo(pageRef.current.querySelectorAll(".profile-section"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)", stagger: 0.1, delay: 0.5 });
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            {/* Colorful Stripe */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Profile Header */}
            <div className="profile-header border-b-4" style={{ backgroundColor: C.dark, borderColor: C.dark }}>
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-5xl mx-auto">
                        {/* Back Button */}
                        <Link href="/public/marketplace-memphis"
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 mb-6"
                            style={{ borderColor: "rgba(255,255,255,0.2)", color: C.white }}>
                            <i className="fa-duotone fa-regular fa-arrow-left text-xs"></i>Back to Marketplace
                        </Link>

                        <div className="flex flex-col md:flex-row items-start gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-28 h-28 border-4 flex items-center justify-center"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral }}>
                                    <span className="text-4xl font-black" style={{ color: C.white }}>{initials}</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-2"
                                    style={{ backgroundColor: C.teal, borderColor: C.dark }}>
                                    <i className="fa-solid fa-check text-xs" style={{ color: C.dark }}></i>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                {recruiter.tagline && (
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                                            style={{ backgroundColor: C.teal, color: C.dark }}>Active</span>
                                    </div>
                                )}
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1" style={{ color: C.white }}>
                                    {name}
                                </h1>
                                <p className="text-sm font-bold mb-3" style={{ color: C.coral }}>{recruiter.tagline || "Recruiter"}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    {recruiter.location && (
                                        <span><i className="fa-duotone fa-regular fa-location-dot mr-1" style={{ color: C.teal }}></i>{recruiter.location}</span>
                                    )}
                                    <span><i className="fa-duotone fa-regular fa-calendar mr-1" style={{ color: C.yellow }}></i>Joined {new Date(recruiter.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button className="w-10 h-10 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.2)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-share-nodes text-sm"></i>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.2)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-bookmark text-sm"></i>
                                </button>
                                <button className="px-5 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-handshake text-xs"></i>Connect
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="stat-block border-3 p-4 text-center"
                                    style={{ borderColor: stat.color, backgroundColor: "rgba(255,255,255,0.03)" }}>
                                    <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b-4" style={{ backgroundColor: C.white, borderColor: C.dark }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto flex">
                        {([
                            { key: "about" as const, label: "About", icon: "fa-duotone fa-regular fa-user", color: C.coral },
                            { key: "activity" as const, label: "Recent Activity", icon: "fa-duotone fa-regular fa-clock-rotate-left", color: C.teal },
                            { key: "reviews" as const, label: "Reviews", icon: "fa-duotone fa-regular fa-star", color: C.yellow },
                        ]).map((tab) => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className="px-5 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-4 -mb-1 transition-colors"
                                style={{ borderColor: activeTab === tab.key ? tab.color : "transparent", color: activeTab === tab.key ? C.dark : "rgba(26,26,46,0.4)" }}>
                                <i className={`${tab.icon} text-xs`} style={{ color: activeTab === tab.key ? tab.color : undefined }}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === "about" && (
                            <>
                                {/* Bio */}
                                {recruiter.bio && (
                                    <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                            <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                                <i className="fa-duotone fa-regular fa-user text-xs" style={{ color: C.white }}></i>
                                            </span>About
                                        </h2>
                                        <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.7 }}>{recruiter.bio}</p>
                                    </div>
                                )}

                                {/* Specializations & Industries */}
                                {(recruiter.specialties && recruiter.specialties.length > 0) || (recruiter.industries && recruiter.industries.length > 0) ? (
                                    <div className="profile-section border-4 p-8" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                                        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                            <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                                <i className="fa-duotone fa-regular fa-bullseye text-xs" style={{ color: C.dark }}></i>
                                            </span>Specializations
                                        </h2>
                                        {recruiter.specialties && recruiter.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {recruiter.specialties.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-3"
                                                        style={{ borderColor: C.teal, color: C.dark }}>{s}</span>
                                                ))}
                                            </div>
                                        )}
                                        {recruiter.industries && recruiter.industries.length > 0 && (
                                            <>
                                                <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                                    <i className="fa-duotone fa-regular fa-tags text-xs" style={{ color: C.yellow }}></i>Recruiting For
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {recruiter.industries.map((industry, i) => {
                                                        const colors = [C.coral, C.teal, C.yellow, C.purple];
                                                        return (
                                                            <span key={i} className="px-2 py-1 text-[10px] font-bold uppercase border-2"
                                                                style={{ borderColor: colors[i % 4], color: C.dark }}>{industry}</span>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-xs" style={{ color: C.dark }}></i>
                                    </span>Recent Activity
                                </h2>
                                <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>No recent activity available.</p>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="profile-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: C.yellow }}>
                                        <i className="fa-duotone fa-regular fa-star text-xs" style={{ color: C.dark }}></i>
                                    </span>Reviews
                                </h2>
                                <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>No reviews yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact */}
                        <div className="border-4 p-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                    <i className="fa-duotone fa-regular fa-address-card text-xs" style={{ color: C.white }}></i>
                                </span>Contact Info
                            </h3>
                            <div className="space-y-3">
                                {recruiter.users?.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-duotone fa-regular fa-envelope text-xs" style={{ color: C.coral }}></i>
                                        <span style={{ color: C.dark, opacity: 0.7 }}>{recruiter.users.email}</span>
                                    </div>
                                )}
                                {recruiter.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <i className="fa-duotone fa-regular fa-phone text-xs" style={{ color: C.teal }}></i>
                                        <span style={{ color: C.dark, opacity: 0.7 }}>{recruiter.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <i className="fa-duotone fa-regular fa-comment text-xs" style={{ color: C.purple }}></i>
                                    <button className="text-left" style={{ color: C.dark, opacity: 0.7 }}>Send Message</button>
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
                        <div className="border-4 p-6" style={{ borderColor: C.yellow, backgroundColor: C.white }}>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                    <i className="fa-duotone fa-regular fa-calendar-check text-xs" style={{ color: C.dark }}></i>
                                </span>Status
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.teal }} />
                                <span className="text-sm font-bold" style={{ color: C.teal }}>Currently Active</span>
                            </div>
                            <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Open to new opportunities and partnerships.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
