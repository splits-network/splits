"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── data ─── */

const jobData = {
    title: "Senior Software Engineer",
    company: "Nexus Dynamics",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    type: "Full-Time",
    posted: "3 days ago",
    deadline: "Mar 15, 2026",
    salary: "$160,000 - $210,000",
    equity: "0.05% - 0.12% ISOs",
    split: "50/50 Standard",
    status: "active",
    applicants: 24,
    views: 1847,
    saves: 63,
    department: "Platform Engineering",
    reportTo: "VP of Engineering",
    teamSize: "8-12 engineers",
};

const skills = [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "Kubernetes",
    "AWS",
    "GraphQL",
    "CI/CD",
    "System Design",
];

const benefits = [
    { label: "Health Insurance", icon: "fa-heart-pulse" },
    { label: "401(k) Match", icon: "fa-piggy-bank" },
    { label: "Remote Work", icon: "fa-house-laptop" },
    { label: "Unlimited PTO", icon: "fa-umbrella-beach" },
    { label: "Education Budget", icon: "fa-graduation-cap" },
    { label: "Home Office Stipend", icon: "fa-desktop" },
];

const timeline = [
    {
        action: "Job order created",
        user: "J. Martinez",
        time: "3 days ago",
        icon: "fa-plus",
        color: "primary",
    },
    {
        action: "Posted to network",
        user: "System",
        time: "3 days ago",
        icon: "fa-globe",
        color: "primary",
    },
    {
        action: "First candidate submitted",
        user: "K. Patel (Apex Recruiting)",
        time: "2 days ago",
        icon: "fa-user-plus",
        color: "success",
    },
    {
        action: "5 applications received",
        user: "System",
        time: "1 day ago",
        icon: "fa-inbox",
        color: "primary",
    },
    {
        action: "Interview scheduled - R. Chen",
        user: "J. Martinez",
        time: "8 hours ago",
        icon: "fa-calendar-check",
        color: "warning",
    },
    {
        action: "Split-fee proposal updated",
        user: "TechFlow Partners",
        time: "2 hours ago",
        icon: "fa-money-bill-transfer",
        color: "success",
    },
];

const relatedJobs = [
    {
        title: "Staff Frontend Engineer",
        company: "Nexus Dynamics",
        salary: "$180K-$240K",
        applicants: 18,
    },
    {
        title: "Senior Backend Engineer",
        company: "Nexus Dynamics",
        salary: "$155K-$200K",
        applicants: 31,
    },
    {
        title: "Engineering Manager",
        company: "Nexus Dynamics",
        salary: "$200K-$260K",
        applicants: 12,
    },
];

const recruiters = [
    {
        name: "Apex Recruiting",
        focus: "Senior Engineering",
        candidates: 4,
        rating: 4.8,
    },
    {
        name: "TechFlow Partners",
        focus: "Platform Teams",
        candidates: 2,
        rating: 4.6,
    },
    {
        name: "Horizon Staffing",
        focus: "Full-Stack",
        candidates: 1,
        rating: 4.9,
    },
];

/* ─── component ─── */

export default function DetailsShowcaseTen() {
    const mainRef = useRef<HTMLElement>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "activity" | "recruiters"
    >("overview");
    const [saved, setSaved] = useState(false);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(
                ".detail-scanline",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6 },
            )
                .fromTo(
                    ".detail-header",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2",
                )
                .fromTo(
                    ".detail-actions",
                    { opacity: 0 },
                    { opacity: 1, duration: 0.4 },
                    "-=0.1",
                )
                .fromTo(
                    ".detail-sidebar",
                    { opacity: 0, x: 30 },
                    { opacity: 1, x: 0, duration: 0.5 },
                    "-=0.3",
                )
                .fromTo(
                    ".detail-content",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                );

            gsap.fromTo(
                ".timeline-item",
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".timeline-section",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".related-card",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".related-section",
                        start: "top 85%",
                    },
                },
            );

            gsap.fromTo(
                ".status-pulse",
                { scale: 0.6, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                },
            );
        },
        { scope: mainRef },
    );

    return (
        <main
            ref={mainRef}
            className="min-h-screen bg-base-300 text-base-content overflow-x-hidden"
        >
            {/* Grid overlay */}
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div className="fixed top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-coral/30 pointer-events-none z-10" />
            <div className="fixed bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-coral/30 pointer-events-none z-10" />

            {/* Breadcrumb */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
                <div className="flex items-center gap-2 mb-8">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                        Jobs
                    </span>
                    <i className="fa-duotone fa-regular fa-chevron-right text-[8px] text-base-content/15" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/30">
                        Active
                    </span>
                    <i className="fa-duotone fa-regular fa-chevron-right text-[8px] text-base-content/15" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                        JOB-2847
                    </span>
                </div>
            </div>

            {/* Header */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-8">
                <div className="detail-scanline h-[2px] bg-primary w-32 mb-6 origin-left" />

                <div className="detail-header flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-0.5 bg-success/10 border border-success/20 text-success font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                                Active
                            </span>
                            <span className="px-2 py-0.5 bg-base-200 border border-base-content/10 font-mono text-[10px] uppercase tracking-wider text-base-content/40">
                                {jobData.type}
                            </span>
                            <span className="px-2 py-0.5 bg-base-200 border border-base-content/10 font-mono text-[10px] uppercase tracking-wider text-base-content/40">
                                {jobData.locationType}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            {jobData.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-base-content/40">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-building text-xs" />{" "}
                                {jobData.company}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot text-xs" />{" "}
                                {jobData.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-clock text-xs" />{" "}
                                Posted {jobData.posted}
                            </span>
                        </div>
                    </div>

                    <div className="detail-actions flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => setSaved(!saved)}
                            className={`btn btn-sm font-mono uppercase tracking-wider text-[10px] ${saved ? "btn-primary" : "btn-outline"}`}
                        >
                            <i
                                className={`fa-${saved ? "solid" : "regular"} fa-bookmark mr-1`}
                            />
                            {saved ? "Saved" : "Save"}
                        </button>
                        <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
                            <i className="fa-duotone fa-regular fa-share-nodes mr-1" />{" "}
                            Share
                        </button>
                        <button className="btn btn-ghost btn-sm font-mono uppercase tracking-wider text-[10px]">
                            <i className="fa-duotone fa-regular fa-print mr-1" />{" "}
                            Print
                        </button>
                        <button className="btn btn-primary btn-sm font-mono uppercase tracking-wider text-[10px]">
                            <i className="fa-duotone fa-regular fa-paper-plane mr-1" />{" "}
                            Submit Candidate
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 detail-content space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-1 border-b border-base-content/10 pb-0">
                            {(
                                ["overview", "activity", "recruiters"] as const
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                                        activeTab === tab
                                            ? "text-primary border-coral bg-primary/5"
                                            : "text-base-content/30 border-transparent hover:text-base-content/50"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                {/* Description */}
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-file-lines text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // role.description
                                        </span>
                                    </div>
                                    <div className="text-sm text-base-content/60 leading-relaxed space-y-3">
                                        <p>
                                            We are looking for a Senior Software
                                            Engineer to join our Platform
                                            Engineering team. You will design,
                                            build, and maintain the core
                                            infrastructure that powers our
                                            split-fee recruiting marketplace,
                                            serving thousands of recruiters and
                                            hiring companies.
                                        </p>
                                        <p>
                                            In this role, you will work closely
                                            with product, design, and other
                                            engineering teams to deliver
                                            high-quality, scalable solutions.
                                            You will have significant ownership
                                            over technical decisions and
                                            architecture.
                                        </p>
                                        <p>
                                            The ideal candidate has deep
                                            experience with distributed systems,
                                            modern web technologies, and a
                                            passion for building products that
                                            improve how people work together.
                                        </p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-microchip text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // required.skills
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-primary/5 border border-coral/15 text-primary font-mono text-xs"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Qualifications */}
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-list-check text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // qualifications
                                        </span>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {[
                                            "6+ years of professional software engineering experience",
                                            "Strong proficiency in TypeScript and React ecosystem",
                                            "Experience with distributed systems and microservices",
                                            "Familiarity with cloud infrastructure (AWS preferred)",
                                            "Track record of mentoring junior engineers",
                                            "Strong written and verbal communication skills",
                                        ].map((q) => (
                                            <li
                                                key={q}
                                                className="flex items-start gap-2.5 text-sm text-base-content/50"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Benefits */}
                                <div className="p-6 bg-base-200 border border-base-content/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-gift text-primary text-sm" />
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                            // benefits.package
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {benefits.map((b) => (
                                            <div
                                                key={b.label}
                                                className="flex items-center gap-2.5 p-3 bg-base-300 border border-base-content/5"
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${b.icon} text-sm text-primary/60`}
                                                />
                                                <span className="text-xs text-base-content/50">
                                                    {b.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "activity" && (
                            <div className="timeline-section p-6 bg-base-200 border border-base-content/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <i className="fa-duotone fa-regular fa-signal-stream text-primary text-sm" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                        // activity.timeline
                                    </span>
                                </div>
                                <div className="space-y-0">
                                    {timeline.map((item, i) => (
                                        <div
                                            key={i}
                                            className="timeline-item flex gap-4 relative"
                                        >
                                            {i < timeline.length - 1 && (
                                                <div className="absolute left-[15px] top-9 bottom-0 w-[1px] bg-base-content/10" />
                                            )}
                                            <div
                                                className={`w-8 h-8 flex items-center justify-center border flex-shrink-0 ${
                                                    item.color === "success"
                                                        ? "bg-success/10 border-success/20 text-success"
                                                        : item.color ===
                                                            "warning"
                                                          ? "bg-warning/10 border-warning/20 text-warning"
                                                          : "bg-primary/10 border-coral/20 text-primary"
                                                }`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${item.icon} text-xs`}
                                                />
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <p className="text-sm text-base-content/70">
                                                    {item.action}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="font-mono text-[10px] text-base-content/30">
                                                        {item.user}
                                                    </span>
                                                    <span className="text-base-content/10">
                                                        |
                                                    </span>
                                                    <span className="font-mono text-[10px] text-base-content/20">
                                                        {item.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "recruiters" && (
                            <div className="space-y-4">
                                {recruiters.map((r) => (
                                    <div
                                        key={r.name}
                                        className="p-5 bg-base-200 border border-base-content/5 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary border border-coral/20 font-mono text-sm font-bold">
                                                {r.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {r.name}
                                                </p>
                                                <p className="font-mono text-[10px] text-base-content/30">
                                                    {r.focus}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-mono font-bold text-primary">
                                                    {r.candidates}
                                                </p>
                                                <p className="font-mono text-[9px] text-base-content/25 uppercase">
                                                    Candidates
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-mono font-bold text-warning">
                                                    {r.rating}
                                                </p>
                                                <p className="font-mono text-[9px] text-base-content/25 uppercase">
                                                    Rating
                                                </p>
                                            </div>
                                            <button className="btn btn-outline btn-xs font-mono uppercase tracking-wider text-[9px]">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="detail-sidebar space-y-6">
                        {/* Key Metrics */}
                        <div className="p-5 bg-base-200 border border-base-content/5">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-duotone fa-regular fa-chart-simple text-primary text-sm" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                    // metrics
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-base-300 border border-base-content/5">
                                    <p className="font-mono text-xl font-black text-primary">
                                        {jobData.applicants}
                                    </p>
                                    <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">
                                        Applicants
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-base-300 border border-base-content/5">
                                    <p className="font-mono text-xl font-black">
                                        {jobData.views}
                                    </p>
                                    <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">
                                        Views
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-base-300 border border-base-content/5">
                                    <p className="font-mono text-xl font-black">
                                        {jobData.saves}
                                    </p>
                                    <p className="font-mono text-[9px] uppercase tracking-wider text-base-content/25">
                                        Saves
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Compensation */}
                        <div className="p-5 bg-base-200 border border-base-content/5">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-duotone fa-regular fa-money-bill-wave text-primary text-sm" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                    // compensation
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-base-content/25 font-mono text-[10px] uppercase block">
                                        Salary Range
                                    </span>
                                    <p className="font-mono text-lg font-bold text-primary">
                                        {jobData.salary}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-base-content/25 font-mono text-[10px] uppercase block">
                                        Equity
                                    </span>
                                    <p className="text-sm text-base-content/60">
                                        {jobData.equity}
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-base-content/5">
                                    <span className="text-base-content/25 font-mono text-[10px] uppercase block">
                                        Split Fee
                                    </span>
                                    <p className="text-sm text-base-content/60">
                                        {jobData.split}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 bg-base-200 border border-base-content/5">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fa-duotone fa-regular fa-info-circle text-primary text-sm" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                                    // details
                                </span>
                            </div>
                            <div className="space-y-3 text-sm">
                                {[
                                    {
                                        label: "Department",
                                        value: jobData.department,
                                    },
                                    {
                                        label: "Reports To",
                                        value: jobData.reportTo,
                                    },
                                    {
                                        label: "Team Size",
                                        value: jobData.teamSize,
                                    },
                                    {
                                        label: "Deadline",
                                        value: jobData.deadline,
                                    },
                                ].map((d) => (
                                    <div key={d.label}>
                                        <span className="text-base-content/25 font-mono text-[10px] uppercase block">
                                            {d.label}
                                        </span>
                                        <p className="text-base-content/60">
                                            {d.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-5 bg-base-200 border border-base-content/5 space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-base-content/25 mb-3">
                                Quick Actions
                            </p>
                            {[
                                {
                                    label: "Edit Listing",
                                    icon: "fa-pen-to-square",
                                },
                                { label: "Duplicate", icon: "fa-copy" },
                                { label: "Archive", icon: "fa-box-archive" },
                                {
                                    label: "Delete",
                                    icon: "fa-trash",
                                    danger: true,
                                },
                            ].map((a) => (
                                <button
                                    key={a.label}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 font-mono text-xs transition-colors ${
                                        a.danger
                                            ? "text-error/50 hover:text-error hover:bg-error/5"
                                            : "text-base-content/30 hover:text-base-content/60 hover:bg-base-content/5"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${a.icon} text-xs w-4 text-center`}
                                    />
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Jobs */}
                <div className="related-section mt-16">
                    <div className="mb-8">
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-3">
                            // related.positions
                        </p>
                        <h2 className="text-2xl font-black tracking-tight">
                            Similar Openings
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedJobs.map((job) => (
                            <div
                                key={job.title}
                                className="related-card p-5 bg-base-200 border border-base-content/5 hover:border-coral/20 transition-colors cursor-pointer"
                            >
                                <h3 className="text-sm font-bold tracking-tight mb-1">
                                    {job.title}
                                </h3>
                                <p className="text-xs text-base-content/30 mb-3">
                                    {job.company}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-primary">
                                        {job.salary}
                                    </span>
                                    <span className="font-mono text-[10px] text-base-content/25">
                                        {job.applicants} applicants
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="py-10 px-6 border-t border-base-content/10 bg-base-200">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-base-content/20">
                    <div className="flex items-center gap-2">
                        <span className="status-pulse w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                            Detail System Operational
                        </span>
                    </div>
                    <span className="text-base-content/10">|</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                        Splits Network // Component Showcase
                    </span>
                </div>
            </section>
        </main>
    );
}
