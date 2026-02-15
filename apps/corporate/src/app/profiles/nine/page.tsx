"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const profile = {
    name: "Sarah Chen",
    initials: "SC",
    title: "Senior Technical Recruiter",
    company: "Independent",
    location: "San Francisco, CA",
    joined: "March 2022",
    email: "sarah.chen@splitsnetwork.com",
    phone: "+1 (415) 555-0147",
    timezone: "PST (UTC-8)",
    bio: "Experienced technical recruiter specializing in software engineering and infrastructure roles. I focus on building long-term relationships with both candidates and hiring managers. My approach prioritizes transparency, honest communication, and finding genuine mutual fit over quick placements.",
    ref: "REC-2847",
};

const stats = [
    { label: "Placements", value: "147" },
    { label: "Active Roles", value: "12" },
    { label: "Success Rate", value: "94%" },
    { label: "Avg. Time to Fill", value: "28d" },
    { label: "Rating", value: "4.9" },
    { label: "Network Size", value: "2,340" },
];

const specializations = [
    "Software Engineering", "Infrastructure", "DevOps", "Cloud Architecture",
    "Backend Systems", "Full-Stack Development", "Engineering Leadership",
    "Machine Learning", "Data Engineering",
];

const experience = [
    {
        period: "2022 - Present",
        role: "Senior Technical Recruiter",
        org: "Splits Network",
        desc: "Lead recruiter handling 12+ active roles. Specialized in senior-to-staff level engineering placements across the Bay Area and remote positions.",
        placements: 89,
    },
    {
        period: "2019 - 2022",
        role: "Technical Recruiter",
        org: "TalentBridge Staffing",
        desc: "Full-cycle recruiting for tech companies ranging from Series A startups to Fortune 500. Managed a pipeline of 200+ candidates.",
        placements: 42,
    },
    {
        period: "2017 - 2019",
        role: "Recruiting Coordinator",
        org: "CloudScale Inc",
        desc: "In-house recruiting support for engineering teams. Coordinated interview schedules, managed ATS workflows, and assisted with offer negotiations.",
        placements: 16,
    },
];

const recentActivity = [
    { action: "Placed", detail: "Staff Engineer at DataFlow", time: "2 days ago", icon: "fa-duotone fa-regular fa-badge-check", color: "text-emerald-600" },
    { action: "Submitted", detail: "3 candidates for Senior BE role at CloudSys", time: "4 days ago", icon: "fa-duotone fa-regular fa-paper-plane", color: "text-[#233876]" },
    { action: "Opted In", detail: "VP of Engineering role at ScaleUp Inc", time: "1 week ago", icon: "fa-duotone fa-regular fa-hand-pointer", color: "text-[#233876]" },
    { action: "Placed", detail: "Frontend Lead at Pixel Inc", time: "2 weeks ago", icon: "fa-duotone fa-regular fa-badge-check", color: "text-emerald-600" },
    { action: "Reviewed", detail: "12 candidate applications", time: "2 weeks ago", icon: "fa-duotone fa-regular fa-clipboard-check", color: "text-[#233876]/60" },
];

const recommendations = [
    { name: "Marcus Rivera", initials: "MR", specialty: "Executive Search", placements: 31, rating: 4.8 },
    { name: "Jamie Park", initials: "JP", specialty: "Product & Design", placements: 28, rating: 4.7 },
    { name: "Alex Thompson", initials: "AT", specialty: "Data Science", placements: 35, rating: 4.9 },
];

const reviews = [
    { author: "Hiring Manager, CloudSys", text: "Sarah consistently delivers qualified candidates who align with our culture. Her communication throughout the process is exceptional.", rating: 5 },
    { author: "Candidate, Placed at DataFlow", text: "Best recruiter I have worked with. She prepared me thoroughly for each interview and was honest about expectations from day one.", rating: 5 },
    { author: "Hiring Manager, TechCorp", text: "Reliable, professional, and fast. Sarah filled our senior role in under 3 weeks with a perfect fit.", rating: 5 },
];

// -- Component ----------------------------------------------------------------

export default function ProfilesNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"about" | "activity" | "reviews">("about");

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo($1(".profile-nine-header"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($(".profile-nine-stat"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.4");

            gsap.fromTo($(".profile-nine-section"), { opacity: 0, y: 25 }, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
                scrollTrigger: { trigger: $1(".profile-nine-body"), start: "top 85%" },
            });
            gsap.fromTo($(".profile-nine-timeline"), { opacity: 0, x: -20 }, {
                opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power3.out",
                scrollTrigger: { trigger: $1(".profile-nine-experience"), start: "top 85%" },
            });
            gsap.fromTo($(".profile-nine-activity"), { opacity: 0, y: 15 }, {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out",
                scrollTrigger: { trigger: $1(".profile-nine-feed"), start: "top 85%" },
            });
            gsap.fromTo($(".profile-nine-rec"), { opacity: 0, y: 20 }, {
                opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out",
                scrollTrigger: { trigger: $1(".profile-nine-recs"), start: "top 85%" },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Header */}
            <section className="relative bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-8 left-8 right-8 bottom-8 border border-dashed border-[#233876]/10 pointer-events-none" />
                <div className="absolute top-8 right-8 font-mono text-[10px] text-[#233876]/20 tracking-wider">v9.0</div>

                <div className="container mx-auto px-6 relative z-10 py-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="profile-nine-header opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-6">
                                REF: {profile.ref} // Recruiter Profile
                            </span>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Avatar */}
                                <div className="w-24 h-24 border-2 border-[#233876]/20 flex items-center justify-center bg-[#233876] flex-shrink-0 relative">
                                    <span className="font-mono text-3xl font-bold text-white">{profile.initials}</span>
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/40" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/40" />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/40" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/40" />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] mb-2">{profile.name}</h1>
                                    <div className="text-lg text-[#0f1b3d]/50 mb-4">{profile.title}</div>
                                    <div className="flex flex-wrap gap-4 text-sm text-[#0f1b3d]/40">
                                        <span className="flex items-center gap-2">
                                            <i className="fa-regular fa-location-dot text-[#233876]/40" />
                                            {profile.location}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <i className="fa-regular fa-building text-[#233876]/40" />
                                            {profile.company}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <i className="fa-regular fa-calendar text-[#233876]/40" />
                                            Joined {profile.joined}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <i className="fa-regular fa-clock text-[#233876]/40" />
                                            {profile.timezone}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 flex-shrink-0">
                                    <button className="px-6 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                        <i className="fa-regular fa-envelope mr-2" />Message
                                    </button>
                                    <button className="px-4 py-2.5 border-2 border-[#233876]/20 text-sm text-[#233876] hover:border-[#233876] transition-colors font-medium">
                                        <i className="fa-regular fa-user-plus mr-2" />Connect
                                    </button>
                                    <button className="px-3 py-2.5 border-2 border-[#233876]/10 text-[#233876]/40 hover:border-[#233876]/30 hover:text-[#233876] transition-colors">
                                        <i className="fa-regular fa-share-nodes" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative bg-white border-t border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#233876]/10">
                            {stats.map((stat, i) => (
                                <div key={i} className="profile-nine-stat bg-white px-4 py-5 text-center opacity-0">
                                    <div className="font-mono text-2xl font-bold text-[#233876] mb-1">{stat.value}</div>
                                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#0f1b3d]/35 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Body */}
            <section className="relative py-10 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto profile-nine-body">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Tab Navigation */}
                                <div className="profile-nine-section opacity-0 flex gap-px bg-[#233876]/10">
                                    {(["about", "activity", "reviews"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                                                activeTab === tab
                                                    ? "bg-[#233876] text-white"
                                                    : "bg-white text-[#0f1b3d]/40 hover:text-[#0f1b3d]/60"
                                            }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* About Tab */}
                                {activeTab === "about" && (
                                    <>
                                        {/* Bio */}
                                        <div className="profile-nine-section border-2 border-[#233876]/10 bg-white p-8 relative opacity-0">
                                            <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">BIO</div>
                                            <h3 className="font-bold text-[#0f1b3d] mb-4 flex items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center">
                                                    <i className="fa-duotone fa-regular fa-user text-[#233876] text-sm" />
                                                </div>
                                                About
                                            </h3>
                                            <p className="text-sm text-[#0f1b3d]/50 leading-relaxed">{profile.bio}</p>
                                        </div>

                                        {/* Specializations */}
                                        <div className="profile-nine-section border-2 border-[#233876]/10 bg-white p-8 relative opacity-0">
                                            <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">SPEC</div>
                                            <h3 className="font-bold text-[#0f1b3d] mb-4 flex items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center">
                                                    <i className="fa-duotone fa-regular fa-bullseye-arrow text-[#233876] text-sm" />
                                                </div>
                                                Specializations
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {specializations.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 border border-[#233876]/15 text-xs text-[#233876]/60 font-medium hover:border-[#233876]/30 transition-colors">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Experience Timeline */}
                                        <div className="profile-nine-section profile-nine-experience border-2 border-[#233876]/10 bg-white p-8 relative opacity-0">
                                            <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">EXP</div>
                                            <h3 className="font-bold text-[#0f1b3d] mb-6 flex items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center">
                                                    <i className="fa-duotone fa-regular fa-timeline text-[#233876] text-sm" />
                                                </div>
                                                Experience
                                            </h3>
                                            <div className="space-y-6">
                                                {experience.map((exp, i) => (
                                                    <div key={i} className="profile-nine-timeline opacity-0 relative pl-8 border-l-2 border-[#233876]/10 pb-6 last:pb-0">
                                                        <div className="absolute left-[-7px] top-1 w-3 h-3 border-2 border-[#233876]/30 bg-white" />
                                                        <div className="font-mono text-[10px] text-[#233876]/35 tracking-wider uppercase mb-1">{exp.period}</div>
                                                        <div className="font-bold text-[#0f1b3d] mb-1">{exp.role}</div>
                                                        <div className="text-sm text-[#233876]/60 mb-2">{exp.org}</div>
                                                        <p className="text-sm text-[#0f1b3d]/40 leading-relaxed mb-2">{exp.desc}</p>
                                                        <span className="font-mono text-xs text-[#233876]/40 border border-[#233876]/15 px-2 py-0.5">
                                                            {exp.placements} placements
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Activity Tab */}
                                {activeTab === "activity" && (
                                    <div className="profile-nine-section profile-nine-feed border-2 border-[#233876]/10 bg-white p-8 relative opacity-0">
                                        <div className="absolute top-4 right-4 font-mono text-[10px] text-[#233876]/15">LOG</div>
                                        <h3 className="font-bold text-[#0f1b3d] mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-clock-rotate-left text-[#233876] text-sm" />
                                            </div>
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-0">
                                            {recentActivity.map((item, i) => (
                                                <div key={i} className="profile-nine-activity opacity-0 flex items-start gap-4 p-4 border-b border-dashed border-[#233876]/8 last:border-b-0 hover:bg-[#f7f8fa] transition-colors">
                                                    <div className="w-8 h-8 border-2 border-[#233876]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <i className={`${item.icon} text-sm ${item.color}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm text-[#0f1b3d]">
                                                            <span className="font-semibold">{item.action}</span>{" "}
                                                            <span className="text-[#0f1b3d]/50">{item.detail}</span>
                                                        </div>
                                                        <div className="font-mono text-[10px] text-[#0f1b3d]/25 mt-1">{item.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === "reviews" && (
                                    <div className="space-y-4">
                                        {reviews.map((review, i) => (
                                            <div key={i} className="profile-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                                <div className="flex items-center gap-1 mb-3">
                                                    {[...Array(review.rating)].map((_, j) => (
                                                        <i key={j} className="fa-solid fa-star text-xs text-[#233876]" />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-[#0f1b3d]/50 leading-relaxed mb-3">&ldquo;{review.text}&rdquo;</p>
                                                <div className="font-mono text-[10px] text-[#0f1b3d]/30 tracking-wider uppercase">{review.author}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Contact Card */}
                                <div className="profile-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/15">CONTACT</div>

                                    <h4 className="font-bold text-sm text-[#0f1b3d] mb-4">Contact Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <i className="fa-regular fa-envelope text-[#233876]/40 w-4 text-center" />
                                            <span className="text-[#0f1b3d]/50 text-xs">{profile.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <i className="fa-regular fa-phone text-[#233876]/40 w-4 text-center" />
                                            <span className="text-[#0f1b3d]/50 text-xs">{profile.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <i className="fa-regular fa-location-dot text-[#233876]/40 w-4 text-center" />
                                            <span className="text-[#0f1b3d]/50 text-xs">{profile.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="profile-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/15">STATUS</div>
                                    <h4 className="font-bold text-sm text-[#0f1b3d] mb-4">Availability</h4>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                        <span className="text-sm text-[#0f1b3d]/60 font-medium">Available for new roles</span>
                                    </div>
                                    <div className="text-xs text-[#0f1b3d]/35 leading-relaxed">
                                        Currently handling 12 active roles. Capacity for 3 more assignments.
                                    </div>
                                    <div className="mt-4 bg-[#f7f8fa] p-3 border border-[#233876]/8">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[#0f1b3d]/35">Capacity</span>
                                            <span className="font-mono text-[#233876]">12/15</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#233876]/10">
                                            <div className="h-full bg-[#233876]" style={{ width: "80%" }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Similar Recruiters */}
                                <div className="profile-nine-section profile-nine-recs border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/15">SIMILAR</div>
                                    <h4 className="font-bold text-sm text-[#0f1b3d] mb-4">Similar Recruiters</h4>
                                    <div className="space-y-3">
                                        {recommendations.map((rec, i) => (
                                            <div key={i} className="profile-nine-rec opacity-0 flex items-center gap-3 p-3 border border-[#233876]/8 hover:border-[#233876]/20 transition-colors cursor-pointer">
                                                <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876] flex-shrink-0">
                                                    <span className="font-mono text-xs font-bold text-white">{rec.initials}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm text-[#0f1b3d] truncate">{rec.name}</div>
                                                    <div className="text-[10px] text-[#0f1b3d]/35">{rec.specialty}</div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-mono text-xs text-[#233876]">{rec.rating}</div>
                                                    <div className="font-mono text-[9px] text-[#0f1b3d]/25">{rec.placements}p</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-white border-t border-[#233876]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // PROFILE v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
