"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const job = {
    title: "Staff Software Engineer (Backend)",
    company: "Notion",
    location: "Remote (US)",
    salary: { min: 180000, max: 240000, currency: "USD" },
    type: "remote",
    status: "open" as const,
    postedDate: "2026-02-12",
    deadline: "2026-03-20",
    department: "Engineering",
    experienceLevel: "Senior",
    applicants: 203,
    views: 2947,
    equity: "0.1% - 0.3%",
    featured: true,
    description:
        "Join Notion's backend team to build the infrastructure powering millions of collaborative workspaces. You'll work on distributed systems, real-time sync, and scaling challenges that affect how teams around the world think and create together.",
    requirements: [
        "8+ years of backend engineering experience",
        "Deep expertise in distributed systems and databases",
        "Proficiency in Go, Python, or similar languages",
        "Experience with real-time collaboration systems",
        "Strong system design and architecture skills",
    ],
    responsibilities: [
        "Design and implement scalable backend services",
        "Optimize database performance and data models",
        "Lead technical architecture discussions",
        "Mentor engineers and set technical standards",
        "Collaborate with product teams on feature development",
    ],
    benefits: [
        "Competitive salary",
        "Equity package",
        "Remote work",
        "Health/dental/vision",
        "Home office stipend",
        "Learning budget",
    ],
    tags: [
        "Go",
        "Python",
        "PostgreSQL",
        "Distributed Systems",
        "Redis",
        "gRPC",
        "Kubernetes",
    ],
    recruiter: {
        name: "Michael Torres",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        agency: "Scale Recruiting",
        email: "michael@scalerecruiting.com",
        placements: 47,
        rating: 4.8,
    },
};

const activity = [
    {
        type: "posted",
        text: "Role published to the network",
        time: "2d ago",
        icon: "fa-duotone fa-regular fa-rocket",
        color: "text-info",
    },
    {
        type: "applicant",
        text: "15 new applications received",
        time: "1d ago",
        icon: "fa-duotone fa-regular fa-users",
        color: "text-success",
    },
    {
        type: "update",
        text: "Salary range updated",
        time: "18h ago",
        icon: "fa-duotone fa-regular fa-pen",
        color: "text-warning",
    },
    {
        type: "milestone",
        text: "200+ applicants milestone reached",
        time: "6h ago",
        icon: "fa-duotone fa-regular fa-trophy",
        color: "text-accent",
    },
    {
        type: "match",
        text: "AI matched 3 high-fit candidates",
        time: "2h ago",
        icon: "fa-duotone fa-regular fa-microchip-ai",
        color: "text-info",
    },
];

const relatedJobs = [
    {
        title: "Senior Backend Engineer",
        company: "Linear",
        salary: "EUR 90k-130k",
        type: "Remote",
        color: "border-info/20",
    },
    {
        title: "Staff Engineer (Platform)",
        company: "Vercel",
        salary: "USD 190k-250k",
        type: "Remote",
        color: "border-warning/20",
    },
    {
        title: "Principal Engineer",
        company: "Stripe",
        salary: "USD 220k-300k",
        type: "Full-Time",
        color: "border-success/20",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DetailsFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), {
                    opacity: 1,
                });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".detail-status",
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
            );
            tl.fromTo(
                ".detail-title",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
                "-=0.1",
            );
            tl.fromTo(
                ".detail-meta",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.3",
            );
            tl.fromTo(
                ".detail-actions",
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
                "-=0.1",
            );
            tl.fromTo(
                ".stat-card",
                { opacity: 0, y: 20, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "back.out(1.4)",
                },
                "-=0.1",
            );

            // Scroll-triggered sections
            gsap.fromTo(
                $1(".section-description"),
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    scrollTrigger: {
                        trigger: $1(".section-description"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $(".req-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: $1(".section-requirements"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $(".resp-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: $1(".section-responsibilities"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $1(".section-recruiter"),
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    scrollTrigger: {
                        trigger: $1(".section-recruiter"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $(".activity-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: $1(".section-activity"),
                        start: "top 85%",
                    },
                },
            );
            gsap.fromTo(
                $(".related-card"),
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: $1(".section-related"),
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: containerRef },
    );

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#09090b] text-[#e5e7eb]"
        >
            {/* Scanline */}
            <div
                className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            {/* Header */}
            <header className="border-b border-[#27272a] bg-[#0a0a0c] relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
                        alt=""
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-[#0a0a0c]/80" />
                </div>
                <div className="container mx-auto px-4 py-10 relative z-10">
                    {/* Status */}
                    <div className="detail-status flex items-center gap-3 mb-6 opacity-0">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">
                            Signal Active
                        </span>
                        <span className="font-mono text-xs text-[#e5e7eb]/20 ml-auto">
                            JOB-002 // {job.postedDate}
                        </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-3 mb-4">
                        {job.featured && (
                            <i className="fa-duotone fa-regular fa-star text-warning mt-2" />
                        )}
                        <h1 className="detail-title text-3xl md:text-4xl font-bold opacity-0">
                            {job.title}
                        </h1>
                    </div>

                    {/* Meta */}
                    <div className="detail-meta flex flex-wrap items-center gap-3 mb-6 opacity-0">
                        <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#18181b]/60 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                            <i className="fa-duotone fa-regular fa-building text-info" />{" "}
                            {job.company}
                        </span>
                        <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#18181b]/60 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                            <i className="fa-duotone fa-regular fa-location-dot text-warning" />{" "}
                            {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#18181b]/60 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider text-[#e5e7eb]/50">
                            <i className="fa-duotone fa-regular fa-money-bill text-success" />{" "}
                            {job.salary.currency}{" "}
                            {Math.round(job.salary.min / 1000)}k -{" "}
                            {Math.round(job.salary.max / 1000)}k
                        </span>
                        <span className="inline-flex items-center gap-1.5 border border-[#27272a] bg-[#18181b]/60 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
                            {job.status}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="detail-actions flex flex-wrap gap-3 opacity-0">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-info/10 border border-info/20 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/20 transition-colors">
                            <i className="fa-duotone fa-regular fa-paper-plane" />{" "}
                            Apply Now
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#27272a] text-[#e5e7eb]/40 text-xs font-mono uppercase tracking-wider hover:text-[#e5e7eb] hover:border-info/30 transition-colors">
                            <i className="fa-duotone fa-regular fa-bookmark" />{" "}
                            Save
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#27272a] text-[#e5e7eb]/40 text-xs font-mono uppercase tracking-wider hover:text-[#e5e7eb] hover:border-info/30 transition-colors">
                            <i className="fa-duotone fa-regular fa-share-nodes" />{" "}
                            Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#27272a] text-[#e5e7eb]/40 text-xs font-mono uppercase tracking-wider hover:text-[#e5e7eb] hover:border-info/30 transition-colors">
                            <i className="fa-duotone fa-regular fa-print" />{" "}
                            Print
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats bar */}
            <div className="border-b border-[#27272a] bg-[#09090b]">
                <div className="container mx-auto px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            {
                                label: "Applicants",
                                value: String(job.applicants),
                                icon: "fa-duotone fa-regular fa-users",
                                color: "text-info",
                            },
                            {
                                label: "Views",
                                value: job.views.toLocaleString(),
                                icon: "fa-duotone fa-regular fa-eye",
                                color: "text-success",
                            },
                            {
                                label: "Department",
                                value: job.department,
                                icon: "fa-duotone fa-regular fa-layer-group",
                                color: "text-warning",
                            },
                            {
                                label: "Level",
                                value: job.experienceLevel,
                                icon: "fa-duotone fa-regular fa-signal",
                                color: "text-accent",
                            },
                            {
                                label: "Equity",
                                value: job.equity,
                                icon: "fa-duotone fa-regular fa-chart-pie",
                                color: "text-info",
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="stat-card border border-[#27272a] bg-[#18181b]/40 rounded-lg p-3 opacity-0"
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <i
                                        className={`${stat.icon} text-[10px] ${stat.color}`}
                                    />
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/25">
                                        {stat.label}
                                    </span>
                                </div>
                                <div className="font-mono text-sm font-bold text-[#e5e7eb]">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-10">
                <div className="grid lg:grid-cols-[1fr_340px] gap-8">
                    {/* Left content */}
                    <div className="space-y-8">
                        {/* Description */}
                        <section className="section-description opacity-0">
                            <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-info/60 mb-4">
                                <i className="fa-duotone fa-regular fa-file-lines" />{" "}
                                Description
                            </h2>
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-6">
                                <p className="text-sm leading-relaxed text-[#e5e7eb]/60">
                                    {job.description}
                                </p>
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="section-requirements">
                            <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-warning/60 mb-4">
                                <i className="fa-duotone fa-regular fa-list-check" />{" "}
                                Requirements
                            </h2>
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-6 space-y-3">
                                {job.requirements.map((req, i) => (
                                    <div
                                        key={i}
                                        className="req-item flex items-start gap-3 opacity-0"
                                    >
                                        <span className="w-6 h-6 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-terminal text-warning text-[9px]" />
                                        </span>
                                        <span className="text-sm text-[#e5e7eb]/60">
                                            {req}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Responsibilities */}
                        <section className="section-responsibilities">
                            <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-success/60 mb-4">
                                <i className="fa-duotone fa-regular fa-clipboard-check" />{" "}
                                Responsibilities
                            </h2>
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-6 space-y-3">
                                {job.responsibilities.map((r, i) => (
                                    <div
                                        key={i}
                                        className="resp-item flex items-start gap-3 opacity-0"
                                    >
                                        <span className="w-6 h-6 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-chevron-right text-success text-[9px]" />
                                        </span>
                                        <span className="text-sm text-[#e5e7eb]/60">
                                            {r}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills & Benefits */}
                        <section>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-4">
                                        <i className="fa-duotone fa-regular fa-tags" />{" "}
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="border border-[#27272a] bg-[#18181b] px-3 py-1.5 rounded-lg font-mono text-[10px] text-[#e5e7eb]/50"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent/60 mb-4">
                                        <i className="fa-duotone fa-regular fa-gift" />{" "}
                                        Benefits
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.benefits.map((b, i) => (
                                            <span
                                                key={i}
                                                className="border border-yellow/20 bg-accent/5 px-3 py-1.5 rounded-lg font-mono text-[10px] text-accent/70"
                                            >
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Activity Timeline */}
                        <section className="section-activity">
                            <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-4">
                                <i className="fa-duotone fa-regular fa-timeline" />{" "}
                                Activity
                            </h2>
                            <div className="border border-[#27272a] bg-[#18181b]/40 rounded-xl p-6 space-y-0">
                                {activity.map((item, i) => (
                                    <div
                                        key={i}
                                        className="activity-item flex gap-4 opacity-0"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center ${item.color}`}
                                            >
                                                <i
                                                    className={`${item.icon} text-xs`}
                                                />
                                            </div>
                                            {i < activity.length - 1 && (
                                                <div className="w-px flex-1 bg-[#27272a]/50 my-1" />
                                            )}
                                        </div>
                                        <div
                                            className={`pb-5 ${i === activity.length - 1 ? "pb-0" : ""}`}
                                        >
                                            <div className="text-sm text-[#e5e7eb]/60">
                                                {item.text}
                                            </div>
                                            <div className="font-mono text-[10px] text-[#e5e7eb]/20 mt-0.5">
                                                {item.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        {/* Recruiter card */}
                        <div className="section-recruiter border border-[#27272a] bg-[#18181b]/40 rounded-xl p-5 opacity-0 sticky top-4">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-4">
                                Recruiter
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={job.recruiter.avatar}
                                    alt={job.recruiter.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#27272a]"
                                />
                                <div>
                                    <div className="text-sm font-bold">
                                        {job.recruiter.name}
                                    </div>
                                    <div className="font-mono text-[10px] text-[#e5e7eb]/30 uppercase tracking-wider">
                                        {job.recruiter.agency}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-2.5 text-center">
                                    <div className="font-mono text-sm font-bold text-info">
                                        {job.recruiter.placements}
                                    </div>
                                    <div className="font-mono text-[8px] text-[#e5e7eb]/20 uppercase">
                                        Placements
                                    </div>
                                </div>
                                <div className="border border-[#27272a] bg-[#09090b] rounded-lg p-2.5 text-center">
                                    <div className="font-mono text-sm font-bold text-warning">
                                        {job.recruiter.rating}
                                    </div>
                                    <div className="font-mono text-[8px] text-[#e5e7eb]/20 uppercase">
                                        Rating
                                    </div>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-info/10 border border-info/20 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/20 transition-colors">
                                <i className="fa-duotone fa-regular fa-envelope" />{" "}
                                Contact Recruiter
                            </button>
                        </div>

                        {/* Deadline */}
                        <div className="border border-warning/20 bg-[#18181b]/40 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <i className="fa-duotone fa-regular fa-clock text-warning text-sm" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning/60">
                                    Deadline
                                </span>
                            </div>
                            <div className="font-mono text-lg font-bold text-[#e5e7eb]">
                                {job.deadline}
                            </div>
                            <div className="font-mono text-[10px] text-[#e5e7eb]/20 mt-1">
                                Applications close at midnight UTC
                            </div>
                        </div>

                        {/* Related jobs */}
                        <div className="section-related">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/30 mb-4">
                                Related Signals
                            </h3>
                            <div className="space-y-3">
                                {relatedJobs.map((rj, i) => (
                                    <div
                                        key={i}
                                        className={`related-card border ${rj.color} bg-[#18181b]/40 rounded-xl p-4 cursor-pointer hover:bg-[#18181b]/60 transition-colors opacity-0`}
                                    >
                                        <div className="text-sm font-bold mb-1">
                                            {rj.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#e5e7eb]/40">
                                            <span>{rj.company}</span>
                                            <span className="text-[#e5e7eb]/15">
                                                |
                                            </span>
                                            <span className="font-mono text-info/60">
                                                {rj.salary}
                                            </span>
                                        </div>
                                        <div className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/20 mt-2">
                                            {rj.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
