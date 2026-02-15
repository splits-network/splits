"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Data ────────────────────────────────────────────────────────────────────

const job = {
    id: "JOB-014",
    title: "Machine Learning Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    type: "FULL-TIME",
    level: "L3-SENIOR",
    status: "OPEN",
    posted: "FEB 10, 2026",
    deadline: "MAR 17, 2026",
    salary: "USD 200K-300K",
    equity: "0.1% - 0.4%",
    applicants: 876,
    views: 12453,
    department: "Research",
    description:
        "Push the boundaries of AI research and deployment. Work on large language models, training infrastructure, and cutting-edge ML systems. You will collaborate with world-class researchers on projects that shape the future of artificial intelligence.",
    requirements: [
        "PhD or MS in Computer Science, ML, or equivalent experience",
        "5+ years of ML engineering experience",
        "Deep understanding of transformers and large language models",
        "Experience with PyTorch and distributed training",
        "Strong systems and infrastructure background",
    ],
    responsibilities: [
        "Train and fine-tune large language models",
        "Optimize training infrastructure and efficiency",
        "Implement and experiment with new architectures",
        "Collaborate with research team on publications",
        "Deploy models to production at scale",
    ],
    benefits: [
        "Top-tier compensation",
        "Significant equity",
        "Health/dental/vision",
        "Compute credits",
        "Research time",
    ],
    tags: ["Machine Learning", "PyTorch", "LLMs", "Distributed Systems", "Python"],
    recruiter: {
        name: "Dr. Priya Patel",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        agency: "AI Talent Partners",
        rating: "4.9/5",
        placements: 47,
    },
};

const relatedJobs = [
    { id: "JOB-004", title: "Data Scientist", company: "Airbnb", salary: "USD 140K-180K", status: "OPEN" },
    { id: "JOB-002", title: "Staff Software Engineer", company: "Notion", salary: "USD 180K-240K", status: "OPEN" },
    { id: "JOB-007", title: "DevOps Engineer", company: "GitLab", salary: "USD 110K-150K", status: "OPEN" },
];

const activityLog = [
    { time: "2h ago", user: "System", action: "New applicant submission received", type: "info" },
    { time: "5h ago", user: "Dr. Priya Patel", action: "Updated requirements section", type: "edit" },
    { time: "1d ago", user: "System", action: "Role promoted to featured listing", type: "featured" },
    { time: "2d ago", user: "Dr. Priya Patel", action: "Role published to network", type: "publish" },
    { time: "3d ago", user: "System", action: "Role specification created", type: "create" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DetailsSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-detail-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-detail-header", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-detail-meta", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
            tl.fromTo(".bp-detail-actions", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4 }, "-=0.2");
            tl.fromTo(".bp-detail-body", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
            tl.fromTo(".bp-detail-sidebar", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");

            gsap.fromTo(".bp-related-card", { opacity: 0, y: 20 }, {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power3.out",
                scrollTrigger: { trigger: ".bp-related-section", start: "top 85%" },
            });

            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59,92,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,92,204,0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    {/* Ref bar */}
                    <div className="bp-detail-ref flex justify-between items-center mb-8 opacity-0">
                        <div className="flex items-center gap-4 font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">
                            <span>{job.id}</span>
                            <span className="text-[#c8ccd4]/10">|</span>
                            <span>DETAIL VIEW</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            {job.status}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div>
                                <div className="bp-detail-header opacity-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <i className="fa-duotone fa-regular fa-star text-[#eab308] text-xs"></i>
                                        <span className="font-mono text-[10px] text-[#eab308] tracking-widest">FEATURED</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{job.title}</h1>
                                </div>
                                <div className="bp-detail-meta flex flex-wrap items-center gap-3 font-mono text-xs opacity-0">
                                    <span className="text-[#3b5ccc]">{job.company}</span>
                                    <span className="text-[#c8ccd4]/15">|</span>
                                    <span className="text-[#c8ccd4]/50"><i className="fa-duotone fa-regular fa-location-dot mr-1 text-[#3b5ccc]/40"></i>{job.location}</span>
                                    <span className="text-[#c8ccd4]/15">|</span>
                                    <span className="text-[#c8ccd4]/40">{job.type}</span>
                                    <span className="text-[#c8ccd4]/15">|</span>
                                    <span className="text-[#c8ccd4]/40">{job.level}</span>
                                    <span className="text-[#c8ccd4]/15">|</span>
                                    <span className="text-[#14b8a6]">{job.salary}</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="bp-detail-actions flex flex-wrap gap-2 opacity-0">
                                <button className="px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                    <i className="fa-duotone fa-regular fa-paper-plane text-[8px] mr-2"></i>APPLY_NOW
                                </button>
                                <button className="px-4 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                    <i className="fa-duotone fa-regular fa-bookmark text-[8px] mr-2"></i>SAVE
                                </button>
                                <button className="px-4 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                    <i className="fa-duotone fa-regular fa-share-nodes text-[8px] mr-2"></i>SHARE
                                </button>
                                <button className="px-4 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                    <i className="fa-duotone fa-regular fa-print text-[8px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#3b5ccc]/10 mb-8">
                        {[
                            { label: "APPLICANTS", value: String(job.applicants), icon: "fa-duotone fa-regular fa-users" },
                            { label: "VIEWS", value: job.views.toLocaleString(), icon: "fa-duotone fa-regular fa-eye" },
                            { label: "POSTED", value: job.posted, icon: "fa-duotone fa-regular fa-calendar" },
                            { label: "DEADLINE", value: job.deadline, icon: "fa-duotone fa-regular fa-clock" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#0a0e17] p-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className={`${stat.icon} text-[10px] text-[#3b5ccc]/40`}></i>
                                    <span className="font-mono text-[9px] text-[#3b5ccc]/50 tracking-widest">{stat.label}</span>
                                </div>
                                <div className="font-mono text-lg font-bold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main content + Sidebar */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main body */}
                        <div className="bp-detail-body flex-1 opacity-0">
                            {/* Tabs */}
                            <div className="flex gap-px bg-[#3b5ccc]/10 mb-6">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`px-5 py-2.5 font-mono text-[10px] tracking-widest transition-colors ${
                                        activeTab === "overview" ? "bg-[#3b5ccc] text-white" : "bg-[#0d1220] text-[#c8ccd4]/40 hover:text-white"
                                    }`}
                                >
                                    OVERVIEW
                                </button>
                                <button
                                    onClick={() => setActiveTab("activity")}
                                    className={`px-5 py-2.5 font-mono text-[10px] tracking-widest transition-colors ${
                                        activeTab === "activity" ? "bg-[#3b5ccc] text-white" : "bg-[#0d1220] text-[#c8ccd4]/40 hover:text-white"
                                    }`}
                                >
                                    ACTIVITY LOG
                                </button>
                            </div>

                            {activeTab === "overview" && (
                                <div className="space-y-8">
                                    {/* Description */}
                                    <div className="border border-[#3b5ccc]/15 p-6">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// DESCRIPTION</div>
                                        <p className="text-sm text-[#c8ccd4]/60 leading-relaxed">{job.description}</p>
                                    </div>

                                    {/* Requirements */}
                                    <div className="border border-[#3b5ccc]/15 p-6">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// REQUIREMENTS</div>
                                        <div className="space-y-2.5">
                                            {job.requirements.map((r) => (
                                                <div key={r} className="flex items-start gap-2 text-sm">
                                                    <span className="font-mono text-[#3b5ccc]/50 text-xs mt-0.5">&gt;</span>
                                                    <span className="text-[#c8ccd4]/60">{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Responsibilities */}
                                    <div className="border border-[#3b5ccc]/15 p-6">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// RESPONSIBILITIES</div>
                                        <div className="space-y-2.5">
                                            {job.responsibilities.map((r) => (
                                                <div key={r} className="flex items-start gap-2 text-sm">
                                                    <span className="font-mono text-[#3b5ccc]/50 text-xs mt-0.5">--</span>
                                                    <span className="text-[#c8ccd4]/60">{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="border border-[#3b5ccc]/15 p-6">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// BENEFITS</div>
                                        <div className="flex flex-wrap gap-2">
                                            {job.benefits.map((b) => (
                                                <span key={b} className="px-3 py-1.5 border border-[#14b8a6]/20 text-[#14b8a6]/70 font-mono text-[10px] tracking-wider">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="border border-[#3b5ccc]/15 p-6">
                                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// SKILLS &amp; TECHNOLOGIES</div>
                                        <div className="flex flex-wrap gap-2">
                                            {job.tags.map((t) => (
                                                <span key={t} className="px-3 py-1.5 border border-[#3b5ccc]/20 text-[#3b5ccc]/70 font-mono text-[10px] tracking-wider">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "activity" && (
                                <div className="border border-[#3b5ccc]/15">
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                        // ACTIVITY TIMELINE
                                    </div>
                                    {activityLog.map((entry, i) => (
                                        <div key={i} className={`flex gap-4 px-6 py-4 ${i > 0 ? "border-t border-[#3b5ccc]/[0.06]" : ""}`}>
                                            <div className="flex flex-col items-center flex-shrink-0">
                                                <div className={`w-8 h-8 border flex items-center justify-center ${
                                                    entry.type === "publish" ? "border-[#22c55e]/30 text-[#22c55e]"
                                                        : entry.type === "featured" ? "border-[#eab308]/30 text-[#eab308]"
                                                            : "border-[#3b5ccc]/20 text-[#3b5ccc]/50"
                                                }`}>
                                                    <i className={`fa-duotone fa-regular ${
                                                        entry.type === "publish" ? "fa-rocket"
                                                            : entry.type === "featured" ? "fa-star"
                                                                : entry.type === "edit" ? "fa-pen"
                                                                    : entry.type === "create" ? "fa-plus"
                                                                        : "fa-circle-info"
                                                    } text-[10px]`}></i>
                                                </div>
                                                {i < activityLog.length - 1 && (
                                                    <div className="w-px flex-1 bg-[#3b5ccc]/10 min-h-[10px] mt-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-[#c8ccd4]/60">{entry.action}</div>
                                                <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-[#c8ccd4]/25 tracking-wider">
                                                    <span>{entry.user}</span>
                                                    <span>|</span>
                                                    <span>{entry.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="bp-detail-sidebar w-full lg:w-80 flex-shrink-0 space-y-6 opacity-0">
                            {/* Recruiter card */}
                            <div className="border border-[#3b5ccc]/15 p-6">
                                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// ASSIGNED RECRUITER</div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={job.recruiter.avatar} alt={job.recruiter.name} className="w-12 h-12 object-cover border border-[#3b5ccc]/30" />
                                    <div>
                                        <div className="font-mono text-sm text-white">{job.recruiter.name}</div>
                                        <div className="font-mono text-[10px] text-[#c8ccd4]/40">{job.recruiter.agency}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-px bg-[#3b5ccc]/10">
                                    <div className="bg-[#0a0e17] p-3 text-center">
                                        <div className="font-mono text-sm font-bold text-white">{job.recruiter.rating}</div>
                                        <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-widest">RATING</div>
                                    </div>
                                    <div className="bg-[#0a0e17] p-3 text-center">
                                        <div className="font-mono text-sm font-bold text-white">{job.recruiter.placements}</div>
                                        <div className="font-mono text-[8px] text-[#3b5ccc]/50 tracking-widest">PLACEMENTS</div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-4 py-2.5 border border-[#3b5ccc]/20 text-[#3b5ccc] font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/10 transition-colors">
                                    <i className="fa-duotone fa-regular fa-envelope text-[8px] mr-2"></i>CONTACT
                                </button>
                            </div>

                            {/* Quick stats */}
                            <div className="border border-[#3b5ccc]/15 p-6">
                                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// ROLE DETAILS</div>
                                <div className="space-y-3">
                                    {[
                                        { label: "Department", value: job.department },
                                        { label: "Equity", value: job.equity },
                                        { label: "Posted", value: job.posted },
                                        { label: "Deadline", value: job.deadline },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between items-center">
                                            <span className="font-mono text-[10px] text-[#c8ccd4]/30 tracking-wider">{row.label}</span>
                                            <span className="font-mono text-[10px] text-white tracking-wider">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Share */}
                            <div className="border border-[#3b5ccc]/15 p-6">
                                <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// SHARE LISTING</div>
                                <div className="flex gap-2">
                                    {["fa-brands fa-linkedin-in", "fa-brands fa-x-twitter", "fa-duotone fa-regular fa-link", "fa-duotone fa-regular fa-envelope"].map((icon) => (
                                        <button key={icon} className="w-9 h-9 border border-[#3b5ccc]/15 flex items-center justify-center text-[#c8ccd4]/30 hover:text-[#3b5ccc] hover:border-[#3b5ccc]/30 transition-colors">
                                            <i className={`${icon} text-xs`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Jobs */}
                    <div className="bp-related-section mt-12">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">// RELATED LISTINGS</div>
                        <div className="grid md:grid-cols-3 gap-px bg-[#3b5ccc]/10">
                            {relatedJobs.map((rj) => (
                                <div key={rj.id} className="bp-related-card bg-[#0a0e17] p-6 group relative opacity-0 cursor-pointer">
                                    <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest mb-2">{rj.id}</div>
                                    <h3 className="text-sm font-bold text-white mb-1">{rj.title}</h3>
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/50 mb-2">{rj.company}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] text-[#14b8a6]">{rj.salary}</span>
                                        <span className="font-mono text-[9px] text-[#22c55e]">[{rj.status}]</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
