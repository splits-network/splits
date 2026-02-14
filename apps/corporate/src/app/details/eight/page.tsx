"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.3, normal: 0.5, build: 0.6 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.04, normal: 0.08, loose: 0.12 };
const BG = { deep: "#0a1628", mid: "#0d1d33", card: "#0f2847", dark: "#081220", input: "#0b1a2e" };

const JOB = {
    id: "JOB-2026-0847",
    title: "Senior Backend Engineer",
    company: "TechForge Systems",
    companyLogo: "TF",
    department: "Engineering",
    location: "San Francisco, CA",
    remote: "Hybrid",
    type: "Full-Time",
    experience: "Senior (5-8 yrs)",
    postedDate: "Feb 10, 2026",
    closingDate: "Mar 15, 2026",
    applicants: 24,
    views: 312,
    status: "Active",
    urgency: "urgent",
    salary: { min: 180000, max: 240000, equity: true },
    splitFee: 25,
    skills: ["Go", "Kubernetes", "PostgreSQL", "gRPC", "AWS", "Terraform", "Redis", "Docker"],
    benefits: ["Health Insurance", "401k Match", "Unlimited PTO", "Remote Stipend", "Stock Options", "Learning Budget"],
    description: `We are looking for a Senior Backend Engineer to join our platform team. You will be responsible for designing and building the core services that power our real-time data processing pipeline, handling millions of events per day.

You will work closely with product, infrastructure, and frontend teams to deliver high-performance APIs and distributed systems. This is a high-impact role where your technical decisions will directly shape the product.`,
    requirements: [
        "5+ years of backend engineering experience",
        "Strong proficiency in Go or Rust",
        "Experience with Kubernetes and container orchestration",
        "Deep understanding of distributed systems patterns",
        "Experience designing and operating large-scale databases",
        "Strong communication skills and ability to mentor junior engineers",
    ],
    niceToHave: [
        "Experience with event-driven architecture (Kafka, NATS)",
        "Contributions to open source projects",
        "Experience at a high-growth startup",
    ],
};

const ACTIVITY = [
    { type: "application", user: "Sarah Chen", action: "submitted a candidate", time: "2 hours ago", icon: "fa-duotone fa-regular fa-paper-plane" },
    { type: "view", user: "Marcus Webb", action: "viewed this posting", time: "4 hours ago", icon: "fa-duotone fa-regular fa-eye" },
    { type: "comment", user: "Elena Vasquez", action: "left a comment", time: "Yesterday", icon: "fa-duotone fa-regular fa-message", comment: "I have 2 candidates with strong Go and K8s experience. Will submit by Thursday." },
    { type: "update", user: "System", action: "posting status changed to Active", time: "2 days ago", icon: "fa-duotone fa-regular fa-circle-check" },
    { type: "created", user: "Brandon K.", action: "created this posting", time: "4 days ago", icon: "fa-duotone fa-regular fa-plus" },
];

const SIMILAR_JOBS = [
    { title: "Platform Engineer", company: "CloudScale", salary: "$160K-$200K", skills: ["Go", "AWS", "Terraform"], applicants: 18 },
    { title: "Staff Backend Engineer", company: "DataFlow Inc", salary: "$200K-$280K", skills: ["Rust", "gRPC", "K8s"], applicants: 12 },
    { title: "Senior SRE", company: "NexGen AI", salary: "$170K-$230K", skills: ["K8s", "Docker", "Python"], applicants: 31 },
];

export default function DetailsEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "similar">("overview");

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => containerRef.current!.querySelectorAll(s);
        const $1 = (s: string) => containerRef.current!.querySelector(s);

        gsap.fromTo($1(".bp-det-header"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: D.normal, ease: E.smooth });
        gsap.fromTo($1(".bp-det-hero"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.build, ease: E.smooth, delay: 0.15 });
        gsap.fromTo($(".bp-det-stat"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.bounce, stagger: S.normal, delay: 0.3 });
        gsap.fromTo($1(".bp-det-main"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.build, ease: E.smooth, delay: 0.4 });
        gsap.fromTo($1(".bp-det-sidebar"), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: D.build, ease: E.smooth, delay: 0.5 });
        gsap.fromTo($(".bp-corner"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: D.fast, ease: E.elastic, stagger: S.normal, delay: 0.6 });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: BG.deep }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="bp-corner fixed top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />
            <div className="bp-corner fixed bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20 z-50 pointer-events-none" />

            {/* Header bar */}
            <div className="bp-det-header border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.12)" }}>
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                                <i className="fa-duotone fa-regular fa-arrow-left text-sm" />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-cyan-500/40">JOB DETAIL</span>
                                <span className="text-[10px] text-slate-600">/</span>
                                <span className="text-[10px] font-mono text-slate-500">{JOB.id}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setBookmarked(!bookmarked)} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${bookmarked ? "border-cyan-500/40 text-cyan-400" : "border-cyan-500/15 text-slate-500 hover:text-cyan-400"}`} style={{ backgroundColor: bookmarked ? "rgba(34,211,238,0.1)" : "transparent" }}>
                                <i className={`${bookmarked ? "fa-solid" : "fa-regular"} fa-bookmark text-sm`} />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors">
                                <i className="fa-duotone fa-regular fa-share-nodes text-sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors">
                                <i className="fa-duotone fa-regular fa-print text-sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-cyan-500/15 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors">
                                <i className="fa-duotone fa-regular fa-ellipsis-vertical text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero section */}
            <div className="bp-det-hero border-b opacity-0" style={{ backgroundColor: BG.mid, borderColor: "rgba(34,211,238,0.08)" }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl border border-cyan-500/25 flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ backgroundColor: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>
                                {JOB.companyLogo}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${JOB.urgency === "urgent" ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}>
                                        {JOB.urgency === "urgent" ? "URGENT" : "STANDARD"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20">
                                        {JOB.status.toUpperCase()}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-1">{JOB.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-building text-xs text-cyan-500/40" />{JOB.company}</span>
                                    <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-location-dot text-xs text-cyan-500/40" />{JOB.location}</span>
                                    <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-clock text-xs text-cyan-500/40" />Posted {JOB.postedDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button className="px-4 py-2.5 rounded-lg border border-cyan-500/25 text-cyan-400 text-sm font-medium hover:bg-cyan-500/10 transition-colors">
                                <i className="fa-duotone fa-regular fa-pen-to-square mr-1.5" />Edit
                            </button>
                            <button className="px-5 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>
                                <i className="fa-duotone fa-regular fa-paper-plane mr-1.5" />Submit Candidate
                            </button>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                        {[
                            { label: "Salary Range", value: `$${(JOB.salary.min / 1000)}K-$${(JOB.salary.max / 1000)}K`, icon: "fa-duotone fa-regular fa-money-bill-wave" },
                            { label: "Split Fee", value: `${JOB.splitFee}%`, icon: "fa-duotone fa-regular fa-handshake" },
                            { label: "Applicants", value: String(JOB.applicants), icon: "fa-duotone fa-regular fa-users" },
                            { label: "Views", value: String(JOB.views), icon: "fa-duotone fa-regular fa-eye" },
                            { label: "Closes", value: JOB.closingDate, icon: "fa-duotone fa-regular fa-calendar" },
                        ].map((stat, i) => (
                            <div key={i} className="bp-det-stat rounded-lg p-3 border border-cyan-500/10 opacity-0" style={{ backgroundColor: BG.dark }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <i className={`${stat.icon} text-[10px] text-cyan-500/40`} />
                                    <span className="text-[10px] font-mono text-slate-600 uppercase">{stat.label}</span>
                                </div>
                                <div className="text-sm font-bold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Tabs */}
                <div className="flex gap-1 mb-6">
                    {[
                        { key: "overview" as const, label: "Overview", icon: "fa-duotone fa-regular fa-file-lines" },
                        { key: "activity" as const, label: "Activity", icon: "fa-duotone fa-regular fa-timeline", count: ACTIVITY.length },
                        { key: "similar" as const, label: "Similar Roles", icon: "fa-duotone fa-regular fa-grid-2", count: SIMILAR_JOBS.length },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.key ? "text-cyan-400 border border-cyan-500/30" : "text-slate-500 border border-transparent hover:text-slate-300"}`} style={{ backgroundColor: activeTab === tab.key ? "rgba(34,211,238,0.08)" : "transparent" }}>
                            <i className={`${tab.icon} text-xs`} />
                            {tab.label}
                            {tab.count !== undefined && <span className="text-[10px] font-mono text-cyan-500/40">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="bp-det-main lg:col-span-2 space-y-6 opacity-0">
                        {activeTab === "overview" && (
                            <>
                                {/* Description */}
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-file-lines text-cyan-400 text-sm" /> Description
                                    </h3>
                                    {JOB.description.split("\n\n").map((p, i) => (
                                        <p key={i} className="text-sm text-slate-400 leading-relaxed mb-3 last:mb-0">{p}</p>
                                    ))}
                                </div>
                                {/* Requirements */}
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-list-check text-cyan-400 text-sm" /> Requirements
                                    </h3>
                                    <ul className="space-y-2">
                                        {JOB.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#22d3ee" }} />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(34,211,238,0.08)" }}>
                                        <h4 className="text-xs font-mono text-cyan-500/40 uppercase mb-2">Nice to Have</h4>
                                        <ul className="space-y-1.5">
                                            {JOB.niceToHave.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "rgba(34,211,238,0.3)" }} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                {/* Skills */}
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-code text-cyan-400 text-sm" /> Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {JOB.skills.map((skill) => (
                                            <span key={skill} className="px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs text-cyan-400 font-medium" style={{ backgroundColor: "rgba(34,211,238,0.06)" }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Benefits */}
                                <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-gift text-cyan-400 text-sm" /> Benefits & Perks
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {JOB.benefits.map((benefit) => (
                                            <div key={benefit} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ backgroundColor: BG.input }}>
                                                <i className="fa-duotone fa-regular fa-check text-[10px] text-cyan-500/60" />
                                                <span className="text-sm text-slate-400">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {JOB.salary.equity && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/15" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>
                                            <i className="fa-duotone fa-regular fa-chart-pie text-sm text-cyan-400" />
                                            <span className="text-sm text-cyan-400/80">Equity compensation included</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div className="rounded-xl border border-cyan-500/12 p-6" style={{ backgroundColor: BG.card }}>
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-timeline text-cyan-400 text-sm" /> Activity Timeline
                                </h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[15px] top-4 bottom-4 w-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                                    {ACTIVITY.map((item, i) => (
                                        <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                                            <div className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: BG.mid }}>
                                                <i className={`${item.icon} text-xs text-cyan-400`} />
                                            </div>
                                            <div className="flex-1 pt-0.5">
                                                <p className="text-sm text-slate-300">
                                                    <span className="font-medium text-white">{item.user}</span>{" "}
                                                    {item.action}
                                                </p>
                                                <span className="text-[10px] font-mono text-slate-600">{item.time}</span>
                                                {item.comment && (
                                                    <div className="mt-2 px-3 py-2 rounded-lg border border-cyan-500/10 text-sm text-slate-400" style={{ backgroundColor: BG.input }}>
                                                        {item.comment}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Add comment */}
                                <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(34,211,238,0.08)" }}>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ backgroundColor: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>BK</div>
                                        <div className="flex-1 flex gap-2">
                                            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 rounded-lg border border-cyan-500/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40" style={{ backgroundColor: BG.input }} />
                                            <button disabled={!commentText.trim()} className="px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: commentText.trim() ? "#22d3ee" : "rgba(34,211,238,0.08)", color: commentText.trim() ? BG.deep : "rgba(34,211,238,0.3)" }}>
                                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "similar" && (
                            <div className="space-y-4">
                                {SIMILAR_JOBS.map((job, i) => (
                                    <div key={i} className="rounded-xl border border-cyan-500/12 p-5 hover:border-cyan-400/25 transition-all cursor-pointer" style={{ backgroundColor: BG.card }}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-white mb-1">{job.title}</h4>
                                                <span className="text-sm text-slate-400">{job.company}</span>
                                            </div>
                                            <span className="text-sm font-mono text-cyan-400">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {job.skills.map((s) => (
                                                    <span key={s} className="px-2 py-0.5 rounded text-[10px] border border-cyan-500/15 text-cyan-500/60" style={{ backgroundColor: "rgba(34,211,238,0.04)" }}>{s}</span>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-600">{job.applicants} applicants</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="bp-det-sidebar space-y-4 opacity-0">
                        {/* Job meta */}
                        <div className="rounded-xl border border-cyan-500/12 p-5" style={{ backgroundColor: BG.card }}>
                            <h3 className="text-xs font-mono text-cyan-500/40 uppercase mb-4">Job Details</h3>
                            {[
                                { label: "Department", value: JOB.department, icon: "fa-duotone fa-regular fa-sitemap" },
                                { label: "Employment", value: JOB.type, icon: "fa-duotone fa-regular fa-briefcase" },
                                { label: "Experience", value: JOB.experience, icon: "fa-duotone fa-regular fa-chart-bar" },
                                { label: "Work Model", value: JOB.remote, icon: "fa-duotone fa-regular fa-house-laptop" },
                                { label: "Posting ID", value: JOB.id, icon: "fa-duotone fa-regular fa-hashtag" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? "1px solid rgba(34,211,238,0.06)" : undefined }}>
                                    <i className={`${item.icon} text-xs text-cyan-500/40 w-4`} />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-mono text-slate-600 uppercase">{item.label}</div>
                                        <div className="text-sm text-white">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recruiter CTA */}
                        <div className="rounded-xl border border-cyan-500/20 p-5 relative overflow-hidden" style={{ backgroundColor: BG.card }}>
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.5) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-lg border border-cyan-500/25 flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(34,211,238,0.1)" }}>
                                    <i className="fa-duotone fa-regular fa-hard-hat text-lg text-cyan-400" />
                                </div>
                                <h3 className="font-bold text-white mb-1">Claim This Role</h3>
                                <p className="text-xs text-slate-400 mb-4">Submit candidates and earn a {JOB.splitFee}% split fee on successful placement.</p>
                                <button className="w-full py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: "#22d3ee", color: BG.deep }}>
                                    <i className="fa-duotone fa-regular fa-handshake mr-1.5" />Claim Role
                                </button>
                            </div>
                        </div>

                        {/* Company info */}
                        <div className="rounded-xl border border-cyan-500/12 p-5" style={{ backgroundColor: BG.card }}>
                            <h3 className="text-xs font-mono text-cyan-500/40 uppercase mb-3">Company</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg border border-cyan-500/20 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>TF</div>
                                <div>
                                    <div className="font-bold text-white text-sm">{JOB.company}</div>
                                    <div className="text-[10px] font-mono text-slate-600">Series B // 120 employees</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Building next-generation enterprise data infrastructure for Fortune 500 companies.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
