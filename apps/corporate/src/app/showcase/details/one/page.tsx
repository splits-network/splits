"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const job = {
    title: "Senior Full-Stack Engineer",
    company: "TechCorp",
    companyInitials: "TC",
    department: "Engineering",
    location: "San Francisco, CA",
    remote: "Hybrid",
    type: "Full-Time",
    experience: "Senior (6-9 years)",
    salaryMin: 180000,
    salaryMax: 220000,
    splitFee: 20,
    guarantee: 90,
    urgency: "high",
    posted: "Feb 10, 2026",
    deadline: "Mar 15, 2026",
    applicants: 34,
    views: 1247,
    status: "Active",
    description: `We are looking for a Senior Full-Stack Engineer to join our platform team building the next generation of developer tools. You will work across the entire stack, from crafting responsive React interfaces to designing scalable Node.js microservices.

This is a high-impact role where you will architect features used by thousands of developers daily. You will collaborate closely with Product, Design, and Infrastructure teams to ship meaningful improvements every sprint.

Our tech stack includes React, TypeScript, Node.js, PostgreSQL, Redis, and AWS. We value clean code, thoughtful design, and pragmatic engineering decisions.`,
    responsibilities: [
        "Design and build full-stack features from concept to production",
        "Architect scalable APIs and microservices using Node.js and TypeScript",
        "Build responsive, performant React interfaces with modern patterns",
        "Collaborate with product and design on user experience decisions",
        "Mentor junior engineers through code reviews and pair programming",
        "Participate in on-call rotation and incident response",
        "Contribute to technical roadmap and architecture decisions",
    ],
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"],
    niceToHave: ["Kubernetes", "Terraform", "Redis", "CI/CD", "System Design"],
    benefits: ["Health Insurance", "Dental & Vision", "401(k) Match", "Remote Work", "Equity / Stock Options", "Unlimited PTO", "Learning Budget", "Gym Membership"],
};

const activity = [
    { type: "submission", user: "Sarah Kim", initials: "SK", role: "recruiter", action: "submitted 2 candidates", time: "2 hours ago" },
    { type: "view", user: "Marcus Chen", initials: "MC", role: "recruiter", action: "viewed this role", time: "4 hours ago" },
    { type: "comment", user: "Priya Patel", initials: "PP", role: "company", action: "added a note: 'Prefer fintech experience'", time: "Yesterday" },
    { type: "submission", user: "Elena Volkov", initials: "EV", role: "recruiter", action: "submitted 1 candidate", time: "Yesterday" },
    { type: "update", user: "James Okoro", initials: "JO", role: "admin", action: "updated salary range", time: "2 days ago" },
    { type: "created", user: "Robert Tanaka", initials: "RT", role: "company", action: "created this job posting", time: "4 days ago" },
];

const similarJobs = [
    { title: "Staff Engineer", company: "DataFlow Inc", salary: "$220k-$280k", location: "Remote", tags: ["Go", "Kubernetes"] },
    { title: "Senior Frontend Engineer", company: "InnovateCo", salary: "$165k-$200k", location: "Austin, TX", tags: ["React", "TypeScript"] },
    { title: "Backend Lead", company: "ScaleAI", salary: "$190k-$240k", location: "SF / Remote", tags: ["Node.js", "AWS"] },
];

const roleColors: Record<string, { bg: string; text: string }> = {
    recruiter: { bg: "bg-primary", text: "text-primary" },
    company: { bg: "bg-secondary", text: "text-secondary" },
    admin: { bg: "bg-neutral", text: "text-neutral" },
};

const activityIcons: Record<string, string> = {
    submission: "fa-duotone fa-regular fa-user-plus",
    view: "fa-duotone fa-regular fa-eye",
    comment: "fa-duotone fa-regular fa-comment",
    update: "fa-duotone fa-regular fa-pen",
    created: "fa-duotone fa-regular fa-plus",
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function DetailsOne() {
    const mainRef = useRef<HTMLElement>(null);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

    useGSAP(() => {
        if (!mainRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (s: string) => mainRef.current!.querySelectorAll(s);
        const $1 = (s: string) => mainRef.current!.querySelector(s);

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo($1(".detail-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo($(".detail-title-word"), { opacity: 0, y: 60, rotateX: 30 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
          .fromTo($(".detail-meta"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")
          .fromTo($(".detail-action"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 }, "-=0.2");

        $(".detail-section").forEach((section) => {
            gsap.fromTo(section, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 85%" } });
        });
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ──────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10" style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }} />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="detail-kicker flex items-center gap-2 text-sm text-neutral-content/40 mb-6 opacity-0">
                            <a href="#" className="hover:text-neutral-content transition-colors">Jobs</a>
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <a href="#" className="hover:text-neutral-content transition-colors">{job.department}</a>
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <span className="text-neutral-content/70">{job.title}</span>
                        </div>

                        {/* Title + Company */}
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">{job.companyInitials}</div>
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                    <span className="detail-title-word inline-block opacity-0">{job.title}</span>
                                </h1>
                                <p className="detail-meta opacity-0 text-lg text-neutral-content/60 mt-2">{job.company}</p>
                            </div>
                        </div>

                        {/* Meta tags */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {[
                                { icon: "fa-duotone fa-regular fa-location-dot", text: job.location },
                                { icon: "fa-duotone fa-regular fa-globe", text: job.remote },
                                { icon: "fa-duotone fa-regular fa-clock", text: job.type },
                                { icon: "fa-duotone fa-regular fa-dollar-sign", text: `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k` },
                                { icon: "fa-duotone fa-regular fa-gauge-high", text: `${job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority` },
                            ].map((tag) => (
                                <span key={tag.text} className="detail-meta opacity-0 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-content/10 text-sm">
                                    <i className={`${tag.icon} text-xs text-secondary`} />{tag.text}
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button className="detail-action opacity-0 btn btn-primary"><i className="fa-duotone fa-regular fa-paper-plane" /> Submit Candidate</button>
                            <button onClick={() => setSaved(!saved)} className={`detail-action opacity-0 btn ${saved ? "btn-secondary" : "btn-ghost border-neutral-content/20"}`}>
                                <i className={`fa-${saved ? "solid" : "regular"} fa-bookmark`} /> {saved ? "Saved" : "Save"}
                            </button>
                            <button className="detail-action opacity-0 btn btn-ghost border-neutral-content/20"><i className="fa-duotone fa-regular fa-share-nodes" /> Share</button>
                            <button className="detail-action opacity-0 btn btn-ghost border-neutral-content/20"><i className="fa-duotone fa-regular fa-print" /> Print</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Status Bar ──────────────────────────────────── */}
            <section className="bg-base-200 border-b border-base-300 py-4">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-success">{job.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-calendar text-xs" /> Posted {job.posted}</div>
                        <div className="flex items-center gap-2 text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-hourglass text-xs" /> Deadline {job.deadline}</div>
                        <div className="flex items-center gap-2 text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-users text-xs" /> {job.applicants} applicants</div>
                        <div className="flex items-center gap-2 text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-eye text-xs" /> {job.views.toLocaleString()} views</div>
                        <div className="ml-auto flex items-center gap-2 text-sm"><span className="font-bold text-primary">{job.splitFee}%</span><span className="text-base-content/40">split fee</span></div>
                        <div className="flex items-center gap-2 text-sm"><span className="font-bold">{job.guarantee}</span><span className="text-base-content/40">day guarantee</span></div>
                    </div>
                </div>
            </section>

            {/* ── Tabs ────────────────────────────────────────── */}
            <section className="bg-base-100 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex gap-0">
                        {(["overview", "activity"] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${
                                    activeTab === tab ? "border-primary text-primary" : "border-transparent text-base-content/40 hover:text-base-content/60"
                                }`}>{tab}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Content ─────────────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    <div className="lg:col-span-3">
                        {activeTab === "overview" && (
                            <>
                                <div className="detail-section opacity-0 mb-10">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-file-lines text-primary" /> About This Role
                                    </h2>
                                    <div className="text-base-content/70 leading-relaxed whitespace-pre-line">{job.description}</div>
                                </div>

                                <div className="detail-section opacity-0 mb-10">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-list-check text-primary" /> Responsibilities
                                    </h2>
                                    <div className="space-y-3">
                                        {job.responsibilities.map((r, i) => (
                                            <div key={i} className="flex gap-3"><div className="w-6 h-6 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="fa-duotone fa-regular fa-check text-primary text-xs" /></div><span className="text-base-content/70 text-sm leading-relaxed">{r}</span></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-section opacity-0 mb-10">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-code text-primary" /> Required Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.skills.map((s) => <span key={s} className="px-3 py-1.5 bg-primary text-primary-content text-xs font-semibold">{s}</span>)}
                                    </div>
                                    <h3 className="text-sm font-bold text-base-content/50 mb-2">Nice to Have</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.niceToHave.map((s) => <span key={s} className="px-3 py-1.5 bg-base-200 text-base-content/50 text-xs font-semibold border border-base-300">{s}</span>)}
                                    </div>
                                </div>

                                <div className="detail-section opacity-0">
                                    <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-gift text-primary" /> Benefits
                                    </h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {job.benefits.map((b) => (
                                            <div key={b} className="flex items-center gap-2 p-3 bg-base-200">
                                                <i className="fa-duotone fa-regular fa-circle-check text-success text-sm" />
                                                <span className="text-sm">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div className="detail-section opacity-0">
                                <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-primary" /> Activity Timeline
                                </h2>
                                <div className="space-y-0">
                                    {activity.map((item, i) => {
                                        const rc = roleColors[item.role] || roleColors.admin;
                                        return (
                                            <div key={i} className="flex gap-4 pb-6 relative">
                                                {i < activity.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-px bg-base-300" />}
                                                <div className={`w-9 h-9 ${rc.bg} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 z-10`}>{item.initials}</div>
                                                <div className="flex-1 pt-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-bold">{item.user}</span>
                                                        <i className={`${activityIcons[item.type]} text-xs ${rc.text}`} />
                                                    </div>
                                                    <p className="text-sm text-base-content/60">{item.action}</p>
                                                    <p className="text-[10px] text-base-content/30 mt-1">{item.time}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        <div className="bg-primary text-primary-content p-6 mb-6">
                            <h3 className="text-lg font-black mb-3">Submit a Candidate</h3>
                            <p className="text-sm opacity-80 mb-4">Earn {job.splitFee}% placement fee on this ${(job.salaryMin / 1000).toFixed(0)}k-${(job.salaryMax / 1000).toFixed(0)}k role.</p>
                            <div className="text-xs opacity-60 mb-4">
                                <div className="flex justify-between py-1.5 border-b border-white/10"><span>Potential Fee (min)</span><span className="font-bold">${(job.salaryMin * job.splitFee / 100).toLocaleString()}</span></div>
                                <div className="flex justify-between py-1.5"><span>Potential Fee (max)</span><span className="font-bold">${(job.salaryMax * job.splitFee / 100).toLocaleString()}</span></div>
                            </div>
                            <button className="btn bg-white text-primary hover:bg-white/90 border-0 w-full btn-sm"><i className="fa-duotone fa-regular fa-paper-plane" /> Submit Now</button>
                        </div>

                        <div className="bg-base-200 border-t-4 border-secondary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Company Info</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg">{job.companyInitials}</div>
                                <div><div className="font-bold">{job.company}</div><div className="text-xs text-base-content/50">Enterprise Software</div></div>
                            </div>
                            <div className="space-y-2 text-sm">
                                {[
                                    { label: "Size", value: "500-1000 employees" },
                                    { label: "Founded", value: "2018" },
                                    { label: "Stage", value: "Series C" },
                                    { label: "HQ", value: "San Francisco, CA" },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between py-1 border-b border-base-300 last:border-0"><span className="text-base-content/50">{item.label}</span><span className="font-semibold">{item.value}</span></div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-base-200 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Similar Roles</h3>
                            <div className="space-y-3">
                                {similarJobs.map((sj) => (
                                    <a key={sj.title} href="#" className="block p-3 bg-base-100 border border-base-300 hover:border-primary/50 transition-colors">
                                        <div className="font-bold text-sm mb-1">{sj.title}</div>
                                        <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                                            <span>{sj.company}</span><span className="text-base-content/20">|</span><span>{sj.location}</span><span className="text-base-content/20">|</span><span className="text-primary font-semibold">{sj.salary}</span>
                                        </div>
                                        <div className="flex gap-1">{sj.tags.map((t) => <span key={t} className="px-2 py-0.5 bg-base-200 text-[10px] font-semibold text-base-content/50">{t}</span>)}</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
