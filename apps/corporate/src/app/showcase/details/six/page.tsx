"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Memphis Colors ─────────────────────────────────────────────────────────
const C = {
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",
};

// ─── Job Data ───────────────────────────────────────────────────────────────
const JOB = {
    title: "Senior Software Engineer",
    company: "TechCorp Industries",
    location: "San Francisco, CA",
    type: "Full-Time",
    remote: "Hybrid",
    salary: "$150,000 - $200,000",
    equity: "0.1% - 0.3%",
    posted: "3 days ago",
    applicants: 47,
    status: "Active",
    urgency: "High Priority",
    experience: "5+ years",
    department: "Engineering",
    reportsTo: "VP of Engineering",
    teamSize: "8 engineers",
};

const DESCRIPTION = `We're looking for a Senior Software Engineer to join our growing engineering team. You'll work on our core platform, building scalable systems that power the next generation of recruiting technology.

As a senior engineer, you'll mentor junior developers, lead technical design discussions, and help shape our engineering culture. We value pragmatic solutions, clear communication, and a bias for action.`;

const REQUIREMENTS = [
    "5+ years of professional software engineering experience",
    "Strong proficiency in TypeScript and React",
    "Experience with Node.js and backend API development",
    "Familiarity with PostgreSQL and database design",
    "Experience with cloud platforms (AWS, GCP, or Azure)",
    "Excellent communication and collaboration skills",
];

const NICE_TO_HAVE = [
    "Experience with Next.js and server-side rendering",
    "Knowledge of Kubernetes and container orchestration",
    "Contributions to open-source projects",
    "Experience in recruiting/HR tech industry",
];

const BENEFITS = [
    { icon: "fa-duotone fa-regular fa-heart-pulse", label: "Health Insurance", desc: "Full medical, dental, vision", color: C.coral },
    { icon: "fa-duotone fa-regular fa-island-tropical", label: "Unlimited PTO", desc: "Take time when you need it", color: C.teal },
    { icon: "fa-duotone fa-regular fa-laptop-mobile", label: "Remote Flexible", desc: "2 days/week from home", color: C.yellow },
    { icon: "fa-duotone fa-regular fa-piggy-bank", label: "401(k) Match", desc: "4% employer match", color: C.purple },
    { icon: "fa-duotone fa-regular fa-graduation-cap", label: "Learning Budget", desc: "$2,000/year for education", color: C.coral },
    { icon: "fa-duotone fa-regular fa-baby-carriage", label: "Parental Leave", desc: "16 weeks paid leave", color: C.teal },
];

const TIMELINE = [
    { date: "Feb 11, 2026", event: "Job listing published", icon: "fa-duotone fa-regular fa-rocket", color: C.teal },
    { date: "Feb 12, 2026", event: "First 10 applications received", icon: "fa-duotone fa-regular fa-inbox", color: C.coral },
    { date: "Feb 13, 2026", event: "Recruiter Marcus T. assigned", icon: "fa-duotone fa-regular fa-user-plus", color: C.purple },
    { date: "Feb 13, 2026", event: "Split-fee agreement finalized (60/40)", icon: "fa-duotone fa-regular fa-handshake", color: C.yellow },
    { date: "Feb 14, 2026", event: "5 candidates shortlisted", icon: "fa-duotone fa-regular fa-list-check", color: C.teal },
    { date: "Today", event: "Interview scheduling in progress", icon: "fa-duotone fa-regular fa-calendar-check", color: C.coral },
];

const SIMILAR_JOBS = [
    { title: "Staff Engineer", company: "StartupXYZ", salary: "$180K-$240K", color: C.coral, tags: ["Remote", "Series B"] },
    { title: "Full Stack Lead", company: "DesignCo", salary: "$140K-$180K", color: C.teal, tags: ["Hybrid", "Growth"] },
    { title: "Platform Engineer", company: "DataDriven", salary: "$160K-$210K", color: C.purple, tags: ["On-site", "Enterprise"] },
];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DetailsSixPage() {
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "similar">("overview");
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(
            pageRef.current.querySelector(".detail-hero"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );

        gsap.fromTo(
            pageRef.current.querySelectorAll(".detail-section"),
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)", stagger: 0.1, delay: 0.3 },
        );

        const sidebar = pageRef.current.querySelectorAll(".sidebar-card");
        gsap.fromTo(
            sidebar,
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.5)", stagger: 0.1, delay: 0.5 },
        );
    }, []);

    return (
        <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: C.cream }}>
            {/* Color Accent Bar */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: C.coral }} />
                <div className="flex-1" style={{ backgroundColor: C.teal }} />
                <div className="flex-1" style={{ backgroundColor: C.yellow }} />
                <div className="flex-1" style={{ backgroundColor: C.purple }} />
            </div>

            {/* Hero Header */}
            <div className="detail-hero border-b-4" style={{ backgroundColor: C.dark, borderColor: C.dark }}>
                <div className="container mx-auto px-4 py-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <a href="#" style={{ color: C.teal }}>Jobs</a>
                            <i className="fa-solid fa-chevron-right text-[8px]"></i>
                            <span>Engineering</span>
                            <i className="fa-solid fa-chevron-right text-[8px]"></i>
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>{JOB.title}</span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div>
                                {/* Status Tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider"
                                        style={{ backgroundColor: C.teal, color: C.dark }}>
                                        {JOB.status}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider"
                                        style={{ backgroundColor: C.coral, color: C.white }}>
                                        {JOB.urgency}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider border-2"
                                        style={{ borderColor: C.yellow, color: C.yellow }}>
                                        {JOB.type}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider border-2"
                                        style={{ borderColor: C.purple, color: C.purple }}>
                                        {JOB.remote}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1] mb-3"
                                    style={{ color: C.white }}>
                                    {JOB.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-building text-xs" style={{ color: C.coral }}></i>
                                        {JOB.company}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" style={{ color: C.teal }}></i>
                                        {JOB.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-clock text-xs" style={{ color: C.yellow }}></i>
                                        Posted {JOB.posted}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-users text-xs" style={{ color: C.purple }}></i>
                                        {JOB.applicants} applicants
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button onClick={() => setSaved(!saved)}
                                    className="w-11 h-11 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{
                                        borderColor: C.yellow,
                                        backgroundColor: saved ? C.yellow : "transparent",
                                        color: saved ? C.dark : C.yellow,
                                    }}>
                                    <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark text-sm`}></i>
                                </button>
                                <button className="w-11 h-11 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.3)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-share-nodes text-sm"></i>
                                </button>
                                <button className="w-11 h-11 flex items-center justify-center border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: "rgba(255,255,255,0.3)", color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-print text-sm"></i>
                                </button>
                                <button className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                                    <i className="fa-duotone fa-regular fa-paper-plane text-xs"></i>
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b-4" style={{ backgroundColor: C.white, borderColor: C.dark }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex">
                        {([
                            { key: "overview", label: "Overview", icon: "fa-duotone fa-regular fa-eye", color: C.coral },
                            { key: "timeline", label: "Activity Timeline", icon: "fa-duotone fa-regular fa-timeline", color: C.teal },
                            { key: "similar", label: "Similar Jobs", icon: "fa-duotone fa-regular fa-grid-2", color: C.purple },
                        ] as const).map((tab) => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className="px-6 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b-4 transition-colors -mb-1"
                                style={{
                                    borderColor: activeTab === tab.key ? tab.color : "transparent",
                                    color: activeTab === tab.key ? C.dark : "rgba(26,26,46,0.4)",
                                }}>
                                <i className={`${tab.icon} text-xs`} style={{ color: activeTab === tab.key ? tab.color : undefined }}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === "overview" && (
                            <>
                                {/* Description */}
                                <div className="detail-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                    <h2 className="text-lg font-black uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                            <i className="fa-duotone fa-regular fa-file-lines text-sm" style={{ color: C.white }}></i>
                                        </span>
                                        About This Role
                                    </h2>
                                    {DESCRIPTION.split("\n\n").map((p, i) => (
                                        <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: C.dark, opacity: 0.75 }}>
                                            {p}
                                        </p>
                                    ))}
                                </div>

                                {/* Requirements */}
                                <div className="detail-section border-4 p-8" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                                    <h2 className="text-lg font-black uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                            <i className="fa-duotone fa-regular fa-list-check text-sm" style={{ color: C.dark }}></i>
                                        </span>
                                        Requirements
                                    </h2>
                                    <ul className="space-y-3">
                                        {REQUIREMENTS.map((req, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5 border-2"
                                                    style={{ borderColor: C.teal }}>
                                                    <i className="fa-solid fa-check text-[10px]" style={{ color: C.teal }}></i>
                                                </div>
                                                <span className="text-sm font-semibold" style={{ color: C.dark, opacity: 0.75 }}>{req}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <h3 className="text-sm font-black uppercase tracking-wider mt-6 mb-3 flex items-center gap-2" style={{ color: C.dark }}>
                                        <i className="fa-duotone fa-regular fa-star text-xs" style={{ color: C.yellow }}></i>
                                        Nice to Have
                                    </h3>
                                    <ul className="space-y-2">
                                        {NICE_TO_HAVE.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5"
                                                    style={{ backgroundColor: C.yellow }}>
                                                    <i className="fa-solid fa-plus text-[8px]" style={{ color: C.dark }}></i>
                                                </div>
                                                <span className="text-sm" style={{ color: C.dark, opacity: 0.6 }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Benefits */}
                                <div className="detail-section border-4 p-8" style={{ borderColor: C.purple, backgroundColor: C.white }}>
                                    <h2 className="text-lg font-black uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: C.dark }}>
                                        <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.purple }}>
                                            <i className="fa-duotone fa-regular fa-gift text-sm" style={{ color: C.white }}></i>
                                        </span>
                                        Benefits & Perks
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {BENEFITS.map((benefit, i) => (
                                            <div key={i} className="border-3 p-4" style={{ borderColor: benefit.color }}>
                                                <div className="w-10 h-10 flex items-center justify-center mb-3"
                                                    style={{ backgroundColor: benefit.color }}>
                                                    <i className={`${benefit.icon} text-sm`}
                                                        style={{ color: benefit.color === C.yellow ? C.dark : C.white }}></i>
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>
                                                    {benefit.label}
                                                </h4>
                                                <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{benefit.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "timeline" && (
                            <div className="detail-section border-4 p-8" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                                <h2 className="text-lg font-black uppercase tracking-wider mb-8 flex items-center gap-2" style={{ color: C.dark }}>
                                    <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                        <i className="fa-duotone fa-regular fa-timeline text-sm" style={{ color: C.dark }}></i>
                                    </span>
                                    Activity Timeline
                                </h2>
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ backgroundColor: "rgba(26,26,46,0.1)" }} />

                                    <div className="space-y-8">
                                        {TIMELINE.map((entry, i) => (
                                            <div key={i} className="flex items-start gap-5 relative">
                                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-3 relative z-10"
                                                    style={{ borderColor: entry.color, backgroundColor: C.white }}>
                                                    <i className={`${entry.icon} text-sm`} style={{ color: entry.color }}></i>
                                                </div>
                                                <div className="flex-1 border-3 p-4" style={{ borderColor: entry.color }}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold" style={{ color: C.dark }}>{entry.event}</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5"
                                                            style={{ backgroundColor: entry.color, color: entry.color === C.yellow ? C.dark : C.white }}>
                                                            {entry.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "similar" && (
                            <div className="space-y-6">
                                {SIMILAR_JOBS.map((job, i) => (
                                    <div key={i} className="detail-section border-4 p-6 transition-transform hover:-translate-y-1 cursor-pointer"
                                        style={{ borderColor: job.color, backgroundColor: C.white }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {job.tags.map((tag) => (
                                                        <span key={tag} className="px-2 py-0.5 text-xs font-bold uppercase border-2"
                                                            style={{ borderColor: job.color, color: C.dark }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h3 className="text-xl font-black uppercase tracking-wide mb-1" style={{ color: C.dark }}>
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm font-semibold" style={{ color: C.dark, opacity: 0.5 }}>
                                                    {job.company}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black" style={{ color: job.color }}>{job.salary}</p>
                                                <p className="text-xs font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>per year</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>
                                                Posted 2 days ago
                                            </span>
                                            <button className="px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                                style={{ borderColor: job.color, backgroundColor: job.color, color: job.color === C.yellow ? C.dark : C.white }}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Facts */}
                        <div className="sidebar-card border-4 p-6" style={{ borderColor: C.dark, backgroundColor: C.white }}>
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.yellow }}>
                                    <i className="fa-duotone fa-regular fa-bolt text-xs" style={{ color: C.dark }}></i>
                                </span>
                                Quick Facts
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Salary", value: JOB.salary, color: C.coral },
                                    { label: "Equity", value: JOB.equity, color: C.teal },
                                    { label: "Experience", value: JOB.experience, color: C.yellow },
                                    { label: "Department", value: JOB.department, color: C.purple },
                                    { label: "Reports To", value: JOB.reportsTo, color: C.coral },
                                    { label: "Team Size", value: JOB.teamSize, color: C.teal },
                                ].map((fact, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b-2" style={{ borderColor: C.cream }}>
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.5 }}>
                                            {fact.label}
                                        </span>
                                        <span className="text-sm font-bold" style={{ color: fact.color }}>{fact.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Company Card */}
                        <div className="sidebar-card border-4 p-6" style={{ borderColor: C.coral, backgroundColor: C.white }}>
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
                                    <i className="fa-duotone fa-regular fa-building text-xs" style={{ color: C.white }}></i>
                                </span>
                                About the Company
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 border-3 flex items-center justify-center"
                                    style={{ borderColor: C.dark }}>
                                    <span className="text-lg font-black" style={{ color: C.coral }}>TC</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase" style={{ color: C.dark }}>{JOB.company}</h4>
                                    <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Recruiting Technology</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { label: "Size", value: "50-100" },
                                    { label: "Founded", value: "2020" },
                                    { label: "Stage", value: "Series B" },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center p-2 border-2" style={{ borderColor: C.cream }}>
                                        <p className="text-sm font-black" style={{ color: C.dark }}>{stat.value}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.4 }}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                            <a href="#" className="block w-full py-2.5 text-center text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                style={{ borderColor: C.coral, color: C.coral }}>
                                View Company Profile
                            </a>
                        </div>

                        {/* Recruiter Card */}
                        <div className="sidebar-card border-4 p-6" style={{ borderColor: C.teal, backgroundColor: C.white }}>
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.teal }}>
                                    <i className="fa-duotone fa-regular fa-user-tie text-xs" style={{ color: C.dark }}></i>
                                </span>
                                Assigned Recruiter
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 border-3 flex items-center justify-center rounded-full"
                                    style={{ borderColor: C.teal, backgroundColor: C.teal }}>
                                    <span className="text-sm font-black" style={{ color: C.dark }}>MT</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm" style={{ color: C.dark }}>Marcus Thompson</h4>
                                    <p className="text-xs" style={{ color: C.teal }}>Senior Recruiter</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
                                    <i className="fa-duotone fa-regular fa-comment mr-1"></i> Message
                                </button>
                                <button className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
                                    style={{ borderColor: C.teal, color: C.teal }}>
                                    <i className="fa-duotone fa-regular fa-eye mr-1"></i> Profile
                                </button>
                            </div>
                        </div>

                        {/* Split Fee Info */}
                        <div className="sidebar-card border-4 p-6" style={{ borderColor: C.yellow, backgroundColor: C.white }}>
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: C.dark }}>
                                <span className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: C.yellow }}>
                                    <i className="fa-duotone fa-regular fa-money-check-dollar text-xs" style={{ color: C.dark }}></i>
                                </span>
                                Split Fee Details
                            </h3>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black" style={{ color: C.coral }}>60%</p>
                                    <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.5 }}>Sourcing</p>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center border-2" style={{ borderColor: C.dark }}>
                                    <i className="fa-solid fa-slash text-xs" style={{ color: C.dark }}></i>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black" style={{ color: C.teal }}>40%</p>
                                    <p className="text-[10px] font-bold uppercase" style={{ color: C.dark, opacity: 0.5 }}>Closing</p>
                                </div>
                            </div>
                            <div className="flex h-3 border-2 overflow-hidden" style={{ borderColor: C.dark }}>
                                <div className="h-full" style={{ width: "60%", backgroundColor: C.coral }} />
                                <div className="h-full" style={{ width: "40%", backgroundColor: C.teal }} />
                            </div>
                            <p className="text-xs mt-3 font-semibold" style={{ color: C.dark, opacity: 0.5 }}>
                                Estimated fee: $25,000 - $33,000
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
