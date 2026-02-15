"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Mock data ────────────────────────────────────────────────────────────────

const job = {
    id: "JOB-2024-0847",
    title: "Senior Frontend Engineer",
    company: "Stripe",
    companyLogo: "S",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    remote: "Hybrid",
    salary: { min: 180000, max: 240000, currency: "USD" },
    splitFee: 20,
    status: "open" as const,
    postedDate: "2026-01-28",
    deadline: "2026-03-15",
    applicants: 47,
    views: 1284,
    saves: 89,
    description: `We're looking for a Senior Frontend Engineer to join our Payments team and build the next generation of financial infrastructure UI. You'll work on the dashboard that millions of businesses use daily to manage their payments, subscriptions, and revenue.`,
    responsibilities: [
        "Lead frontend architecture decisions for the Payments Dashboard",
        "Build and maintain high-performance React components",
        "Collaborate with design, product, and backend teams",
        "Mentor junior engineers and establish coding standards",
        "Drive performance optimization and accessibility improvements",
        "Participate in on-call rotation for frontend systems",
    ],
    requirements: [
        "5+ years of professional frontend development experience",
        "Expert-level React and TypeScript knowledge",
        "Experience with design systems and component libraries",
        "Strong understanding of web performance optimization",
        "Excellent communication and collaboration skills",
        "Experience with CI/CD pipelines and testing frameworks",
    ],
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS", "Jest", "Playwright"],
    benefits: [
        { icon: "fa-heart-pulse", label: "Full Health Coverage" },
        { icon: "fa-money-bill-wave", label: "401(k) with 6% Match" },
        { icon: "fa-umbrella-beach", label: "Unlimited PTO" },
        { icon: "fa-chart-line", label: "Equity Package" },
        { icon: "fa-house-laptop", label: "Hybrid Remote" },
        { icon: "fa-book-open", label: "$5K Learning Budget" },
    ],
    recruiter: {
        name: "Sarah Mitchell",
        agency: "TechTalent Partners",
        initials: "SM",
        placements: 142,
        responseRate: 98,
    },
};

const activities = [
    { time: "2 hours ago", user: "Sarah M.", action: "submitted a candidate", detail: "James Wilson - Senior Engineer at Meta", icon: "fa-user-plus" },
    { time: "5 hours ago", user: "System", action: "status updated", detail: "3 candidates moved to Interview stage", icon: "fa-arrows-rotate" },
    { time: "1 day ago", user: "Mike R.", action: "left a note", detail: "Strong pipeline - expecting 2 more submissions this week", icon: "fa-message" },
    { time: "2 days ago", user: "Sarah M.", action: "submitted a candidate", detail: "Lisa Chen - Staff Engineer at Shopify", icon: "fa-user-plus" },
    { time: "3 days ago", user: "System", action: "listing viewed", detail: "1,284 views from 892 unique recruiters", icon: "fa-eye" },
    { time: "1 week ago", user: "Admin", action: "listing published", detail: "Job posted to marketplace", icon: "fa-rocket" },
];

const relatedJobs = [
    { title: "Staff Frontend Engineer", company: "Notion", salary: "$200K-$280K", location: "Remote" },
    { title: "Senior React Developer", company: "Figma", salary: "$170K-$230K", location: "San Francisco" },
    { title: "Frontend Architect", company: "Vercel", salary: "$190K-$260K", location: "Remote" },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function DetailsThreePage() {
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "candidates">("overview");
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            const tl = gsap.timeline({ defaults: { ease: E.precise } });
            tl.fromTo($1(".page-number"), { opacity: 0, y: 60, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: D.slow });
            tl.fromTo($1(".page-title"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.3");
            tl.fromTo($1(".page-divider"), { scaleX: 0 }, { scaleX: 1, duration: D.normal, transformOrigin: "left center" }, "-=0.2");
            tl.fromTo($(".meta-item"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.04 }, "-=0.1");
            tl.fromTo($(".action-btn"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: D.fast, stagger: 0.04 }, "-=0.2");

            $(".scroll-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: D.normal, ease: E.precise, scrollTrigger: { trigger: section, start: "top 88%" } },
                );
            });
        },
        { scope: containerRef },
    );

    const fmtSalary = (n: number) => "$" + Math.round(n / 1000) + "K";
    const daysUntilDeadline = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000);

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── HEADER ─────────────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-6 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/25">
                        <span className="hover:text-base-content cursor-pointer transition-colors">Roles</span>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[7px]" />
                        <span className="hover:text-base-content cursor-pointer transition-colors">Engineering</span>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[7px]" />
                        <span className="text-base-content/50">{job.id}</span>
                    </div>

                    <div className="flex items-end gap-4 mb-5">
                        <span className="page-number opacity-0 text-5xl lg:text-7xl font-black tracking-tighter text-neutral/6 select-none leading-none">
                            D3
                        </span>
                        <div className="page-title opacity-0 pb-1 flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-neutral text-neutral-content flex items-center justify-center text-[10px] font-black">
                                    {job.companyLogo}
                                </div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-base-content/30 font-bold">
                                    {job.company} / {job.department}
                                </p>
                                <span className="px-2 py-0.5 bg-success/10 text-success text-[8px] uppercase tracking-[0.2em] font-black">
                                    Active
                                </span>
                            </div>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight">{job.title}</h1>
                        </div>
                    </div>

                    <div className="page-divider h-[2px] bg-neutral/20 mb-5" style={{ transformOrigin: "left center" }} />

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                        {[
                            { icon: "fa-location-dot", text: job.location },
                            { icon: "fa-clock", text: job.type },
                            { icon: "fa-house-laptop", text: job.remote },
                            { icon: "fa-money-bill", text: `${fmtSalary(job.salary.min)} - ${fmtSalary(job.salary.max)}` },
                            { icon: "fa-calendar", text: `${daysUntilDeadline}d remaining` },
                        ].map((item, i) => (
                            <div key={i} className="meta-item opacity-0 flex items-center gap-2 text-base-content/40">
                                <i className={`fa-duotone fa-regular ${item.icon} text-xs`} />
                                <span className="text-[10px] uppercase tracking-[0.15em] font-bold">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-[2px]">
                        <button className="action-btn opacity-0 px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-paper-plane text-xs" />
                            Submit Candidate
                        </button>
                        <button className="action-btn opacity-0 px-4 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-bookmark text-xs" />
                            Save
                        </button>
                        <button className="action-btn opacity-0 px-4 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-share text-xs" />
                            Share
                        </button>
                        <button className="action-btn opacity-0 px-4 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-print text-xs" />
                            Print
                        </button>
                    </div>
                </div>
            </header>

            {/* ── TAB BAR ────────────────────────────────────── */}
            <div className="border-b border-neutral/10 px-6 lg:px-12">
                <div className="flex gap-0">
                    {(["overview", "activity", "candidates"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                                activeTab === tab
                                    ? "text-base-content border-b-2 border-neutral -mb-[1px]"
                                    : "text-base-content/30 hover:text-base-content"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONTENT ────────────────────────────────────── */}
            <div className="px-6 lg:px-12 py-10">
                <div className="grid grid-cols-12 gap-8">
                    {/* Main content */}
                    <div className="col-span-12 lg:col-span-8">
                        {activeTab === "overview" && (
                            <div className="space-y-0">
                                {/* Stats row */}
                                <div className="scroll-section grid grid-cols-3 gap-[2px] bg-neutral/10 mb-8">
                                    {[
                                        { value: job.applicants.toString(), label: "Submissions" },
                                        { value: job.views.toLocaleString(), label: "Views" },
                                        { value: job.saves.toString(), label: "Saves" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-base-100 py-5 px-4 text-center">
                                            <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
                                            <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30 mt-1">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="scroll-section mb-8">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">01</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Description</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <p className="text-sm text-base-content/60 leading-relaxed">{job.description}</p>
                                </div>

                                {/* Responsibilities */}
                                <div className="scroll-section mb-8">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">02</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Responsibilities</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <ul className="space-y-3">
                                        {job.responsibilities.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 border border-neutral/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-[8px] font-black text-base-content/20">{String(i + 1).padStart(2, "0")}</span>
                                                </div>
                                                <span className="text-sm text-base-content/50">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Requirements */}
                                <div className="scroll-section mb-8">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">03</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Requirements</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <ul className="space-y-3">
                                        {job.requirements.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-check text-[10px] text-base-content/20 mt-1" />
                                                <span className="text-sm text-base-content/50">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Skills */}
                                <div className="scroll-section mb-8">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">04</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Tech Stack</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <div className="flex flex-wrap gap-[2px]">
                                        {job.skills.map((skill) => (
                                            <span key={skill} className="px-3 py-2 bg-base-200 text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/50">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="scroll-section mb-8">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">05</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Benefits</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] bg-neutral/10">
                                        {job.benefits.map((benefit) => (
                                            <div key={benefit.label} className="bg-base-100 p-4 flex items-center gap-3">
                                                <i className={`fa-duotone fa-regular ${benefit.icon} text-base-content/20`} />
                                                <span className="text-xs font-bold tracking-tight">{benefit.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "activity" && (
                            <div className="scroll-section">
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">TL</span>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Activity Timeline</p>
                                </div>
                                <div className="space-y-0">
                                    {activities.map((activity, i) => (
                                        <div key={i} className="flex gap-4 py-4 border-b border-base-300 last:border-0">
                                            <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                                <i className={`fa-duotone fa-regular ${activity.icon} text-xs text-base-content/30`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold tracking-tight">{activity.user}</span>
                                                    <span className="text-[10px] text-base-content/30">{activity.action}</span>
                                                </div>
                                                <p className="text-xs text-base-content/40">{activity.detail}</p>
                                            </div>
                                            <span className="text-[9px] text-base-content/20 uppercase tracking-[0.1em] whitespace-nowrap">
                                                {activity.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "candidates" && (
                            <div className="scroll-section">
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">47</span>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Submitted Candidates</p>
                                </div>
                                <div className="space-y-[2px] bg-neutral/10">
                                    {[
                                        { name: "James Wilson", role: "Senior Engineer at Meta", stage: "Interview", match: 94 },
                                        { name: "Lisa Chen", role: "Staff Engineer at Shopify", stage: "Screening", match: 91 },
                                        { name: "Alex Rivera", role: "Lead Frontend at Netflix", stage: "Submitted", match: 88 },
                                        { name: "Priya Patel", role: "Senior SWE at Google", stage: "Interview", match: 87 },
                                        { name: "Tom Baker", role: "Frontend Lead at Airbnb", stage: "Offer", match: 96 },
                                    ].map((candidate) => (
                                        <div key={candidate.name} className="bg-base-100 p-4 flex items-center gap-4">
                                            <div className="w-9 h-9 bg-base-200 flex items-center justify-center text-[10px] font-black text-base-content/30">
                                                {candidate.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold tracking-tight">{candidate.name}</div>
                                                <div className="text-[10px] text-base-content/30">{candidate.role}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] font-black ${
                                                candidate.stage === "Offer" ? "bg-success/10 text-success" :
                                                candidate.stage === "Interview" ? "bg-primary/10 text-primary" :
                                                "bg-base-200 text-base-content/40"
                                            }`}>
                                                {candidate.stage}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-sm font-black tracking-tight">{candidate.match}%</div>
                                                <div className="text-[8px] text-base-content/20 uppercase tracking-[0.1em]">Match</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4">
                        {/* Recruiter card */}
                        <div className="scroll-section border-2 border-neutral/10 mb-6">
                            <div className="p-5 border-b border-base-300">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">
                                    Lead Recruiter
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center text-xs font-black">
                                        {job.recruiter.initials}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold tracking-tight">{job.recruiter.name}</div>
                                        <div className="text-[10px] text-base-content/30">{job.recruiter.agency}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-[2px] bg-neutral/10">
                                <div className="bg-base-100 p-4 text-center">
                                    <div className="text-lg font-black tracking-tighter">{job.recruiter.placements}</div>
                                    <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30">Placements</div>
                                </div>
                                <div className="bg-base-100 p-4 text-center">
                                    <div className="text-lg font-black tracking-tighter">{job.recruiter.responseRate}%</div>
                                    <div className="text-[8px] uppercase tracking-[0.2em] text-base-content/30">Response</div>
                                </div>
                            </div>
                        </div>

                        {/* Fee details */}
                        <div className="scroll-section border-2 border-neutral/10 p-5 mb-6">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-4">
                                Split Fee Details
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: "Fee Rate", value: `${job.splitFee}%` },
                                    { label: "Est. Min Fee", value: `$${(job.salary.min * job.splitFee / 100).toLocaleString()}` },
                                    { label: "Est. Max Fee", value: `$${(job.salary.max * job.splitFee / 100).toLocaleString()}` },
                                    { label: "Payment Terms", value: "Net 30" },
                                    { label: "Guarantee", value: "90 days" },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-baseline justify-between border-b border-base-300 pb-2">
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-base-content/30 font-bold">{row.label}</span>
                                        <span className="text-sm font-bold tracking-tight">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Related jobs */}
                        <div className="scroll-section border-2 border-neutral/10">
                            <div className="px-5 py-4 border-b border-base-300">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold">
                                    Similar Roles
                                </p>
                            </div>
                            {relatedJobs.map((rj) => (
                                <div key={rj.title} className="px-5 py-4 border-b border-base-300 last:border-0 hover:bg-base-200/50 transition-colors cursor-pointer">
                                    <div className="text-xs font-bold tracking-tight mb-0.5">{rj.title}</div>
                                    <div className="text-[10px] text-base-content/30">{rj.company} / {rj.location}</div>
                                    <div className="text-[10px] font-bold text-base-content/40 mt-1">{rj.salary}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
