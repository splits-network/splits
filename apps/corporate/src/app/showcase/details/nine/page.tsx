"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// -- Data ---------------------------------------------------------------------

const jobData = {
    title: "Senior Software Engineer",
    company: "TechCorp Industries",
    companyInitials: "TC",
    location: "San Francisco, CA",
    remote: true,
    salary: "$150,000 - $200,000",
    type: "Full-Time",
    experience: "Senior (6-10 years)",
    category: "Engineering",
    posted: "3 days ago",
    deadline: "March 15, 2026",
    status: "Active",
    applicants: 24,
    recruiters: 5,
    ref: "JOB-2026-0847",
    fee: "20%",
    description: `We're looking for a Senior Software Engineer to join our platform team. You'll be responsible for building and scaling our core infrastructure, working closely with product and design teams to deliver features that impact millions of users.

This is a high-impact role where you'll have significant ownership over technical decisions and architecture. You'll mentor junior engineers, participate in code reviews, and help shape our engineering culture.`,
    responsibilities: [
        "Design and implement scalable backend services using TypeScript and Node.js",
        "Lead technical architecture decisions for new features and systems",
        "Mentor junior engineers through code reviews and pair programming",
        "Collaborate with product managers and designers on feature specifications",
        "Improve system reliability, performance, and observability",
        "Participate in on-call rotation for production systems",
    ],
    requirements: [
        "7+ years of professional software engineering experience",
        "Strong proficiency in TypeScript, Node.js, and PostgreSQL",
        "Experience with cloud infrastructure (AWS, GCP, or Azure)",
        "Track record of designing and shipping scalable systems",
        "Excellent communication and collaboration skills",
        "Experience mentoring other engineers",
    ],
    niceToHave: [
        "Experience with Kubernetes and container orchestration",
        "Familiarity with real-time systems (WebSockets, event streaming)",
        "Open source contributions",
        "Experience in recruiting or HR tech",
    ],
    benefits: [
        "Health, dental, and vision insurance",
        "401(k) with 4% match",
        "Unlimited PTO",
        "Remote-first with quarterly offsites",
        "$5,000 annual learning budget",
        "Stock options",
    ],
    skills: ["TypeScript", "Node.js", "PostgreSQL", "AWS", "Kubernetes", "React", "GraphQL", "Redis"],
};

const timeline = [
    { type: "application", title: "8 new applications received", time: "2 hours ago", icon: "fa-duotone fa-regular fa-file-plus", initials: "SY" },
    { type: "interview", title: "Interview scheduled with Marcus R.", time: "5 hours ago", icon: "fa-duotone fa-regular fa-calendar-check", initials: "MR" },
    { type: "recruiter", title: "Sarah Chen opted into this role", time: "1 day ago", icon: "fa-duotone fa-regular fa-user-tie", initials: "SC" },
    { type: "update", title: "Salary range updated from $140-180K", time: "2 days ago", icon: "fa-duotone fa-regular fa-pen", initials: "TC" },
    { type: "posted", title: "Job posted to recruiter network", time: "3 days ago", icon: "fa-duotone fa-regular fa-rocket", initials: "TC" },
];

const similarRoles = [
    { title: "Backend Engineer", company: "CloudSys", salary: "$130-170K", applicants: 18, ref: "JOB-0851" },
    { title: "Staff Engineer", company: "ScaleUp", salary: "$180-240K", applicants: 12, ref: "JOB-0839" },
    { title: "Platform Engineer", company: "DataFlow", salary: "$160-210K", applicants: 9, ref: "JOB-0862" },
];

// -- Component ----------------------------------------------------------------

export default function DetailsNinePage() {
    const containerRef = useRef<HTMLDivElement>(null);

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
            tl.fromTo($1(".detail-nine-header"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            tl.fromTo($1(".detail-nine-actions"), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, "-=0.4");
            tl.fromTo($1(".detail-nine-meta"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");

            gsap.fromTo($(".detail-nine-section"), { opacity: 0, y: 25 }, {
                opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.12,
                scrollTrigger: { trigger: $1(".detail-nine-content"), start: "top 80%" },
            });
            gsap.fromTo($(".detail-nine-timeline-item"), { opacity: 0, x: -15 }, {
                opacity: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.06,
                scrollTrigger: { trigger: $1(".detail-nine-timeline"), start: "top 80%" },
            });
            gsap.fromTo($(".detail-nine-similar"), { opacity: 0, y: 20 }, {
                opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.1,
                scrollTrigger: { trigger: $1(".detail-nine-similar-grid"), start: "top 85%" },
            });
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f7f8fa]">
            {/* Hero / Header */}
            <section className="relative bg-white border-b-2 border-[#233876]/10 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #233876 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="container mx-auto px-6 py-10 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-6">
                            <a href="#" className="font-mono text-xs text-[#233876]/40 hover:text-[#233876] transition-colors">Jobs</a>
                            <i className="fa-regular fa-chevron-right text-[8px] text-[#233876]/20" />
                            <a href="#" className="font-mono text-xs text-[#233876]/40 hover:text-[#233876] transition-colors">Engineering</a>
                            <i className="fa-regular fa-chevron-right text-[8px] text-[#233876]/20" />
                            <span className="font-mono text-xs text-[#0f1b3d]/60">{jobData.ref}</span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            {/* Left: Title and info */}
                            <div className="detail-nine-header opacity-0">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876]">
                                        <span className="font-mono text-lg font-bold text-white">{jobData.companyInitials}</span>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1b3d] leading-tight">{jobData.title}</h1>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-[#0f1b3d]/50">{jobData.company}</span>
                                            <span className="font-mono text-[10px] text-[#233876]/30 border border-[#233876]/15 px-2 py-0.5">{jobData.ref}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="detail-nine-actions flex items-center gap-2 opacity-0">
                                <button className="w-9 h-9 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/25 transition-colors" title="Save">
                                    <i className="fa-regular fa-bookmark text-sm text-[#233876]/40" />
                                </button>
                                <button className="w-9 h-9 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/25 transition-colors" title="Share">
                                    <i className="fa-regular fa-share-nodes text-sm text-[#233876]/40" />
                                </button>
                                <button className="w-9 h-9 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/25 transition-colors" title="Print">
                                    <i className="fa-regular fa-print text-sm text-[#233876]/40" />
                                </button>
                                <button className="px-5 py-2 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium flex items-center gap-2">
                                    Apply Now <i className="fa-regular fa-arrow-right text-xs" />
                                </button>
                            </div>
                        </div>

                        {/* Meta bar */}
                        <div className="detail-nine-meta mt-6 opacity-0">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-[#233876]/10">
                                {[
                                    { label: "Location", value: jobData.location, icon: "fa-regular fa-location-dot" },
                                    { label: "Remote", value: jobData.remote ? "Yes" : "No", icon: "fa-regular fa-wifi" },
                                    { label: "Salary", value: jobData.salary, icon: "fa-regular fa-money-bill" },
                                    { label: "Type", value: jobData.type, icon: "fa-regular fa-clock" },
                                    { label: "Applicants", value: String(jobData.applicants), icon: "fa-regular fa-users" },
                                    { label: "Recruiters", value: String(jobData.recruiters), icon: "fa-regular fa-user-tie" },
                                    { label: "Status", value: jobData.status, icon: "fa-regular fa-signal-bars" },
                                ].map((m, i) => (
                                    <div key={i} className="bg-white px-4 py-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <i className={`${m.icon} text-[10px] text-[#233876]/30`} />
                                            <span className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase">{m.label}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-[#0f1b3d]">{m.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative py-10 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="detail-nine-content grid lg:grid-cols-3 gap-6">
                            {/* Left column - Main content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Description */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-5">
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Section // Overview</div>
                                        <h2 className="text-xl font-bold text-[#0f1b3d]">About This Role</h2>
                                    </div>
                                    <div className="text-sm text-[#0f1b3d]/55 leading-relaxed whitespace-pre-line">{jobData.description}</div>
                                </div>

                                {/* Responsibilities */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-5">
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Section // Duties</div>
                                        <h2 className="text-xl font-bold text-[#0f1b3d]">Responsibilities</h2>
                                    </div>
                                    <ul className="space-y-3">
                                        {jobData.responsibilities.map((r, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 border border-[#233876]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="font-mono text-[8px] text-[#233876]/30">{String(i + 1).padStart(2, "0")}</span>
                                                </div>
                                                <span className="text-sm text-[#0f1b3d]/55 leading-relaxed">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Requirements */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-5">
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Section // Qualifications</div>
                                        <h2 className="text-xl font-bold text-[#0f1b3d]">Requirements</h2>
                                    </div>
                                    <div className="mb-5">
                                        <div className="text-xs font-semibold text-[#0f1b3d]/70 uppercase tracking-wider mb-3">Required</div>
                                        <ul className="space-y-2">
                                            {jobData.requirements.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="w-1.5 h-1.5 bg-[#233876] mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-[#0f1b3d]/55">{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-[#0f1b3d]/70 uppercase tracking-wider mb-3">Nice to Have</div>
                                        <ul className="space-y-2">
                                            {jobData.niceToHave.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="w-1.5 h-1.5 bg-[#233876]/25 mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-[#0f1b3d]/40">{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="border-b border-dashed border-[#233876]/10 pb-3 mb-5">
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-1">Section // Perks</div>
                                        <h2 className="text-xl font-bold text-[#0f1b3d]">Benefits</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {jobData.benefits.map((b, i) => (
                                            <div key={i} className="flex items-center gap-3 px-3 py-2 border border-[#233876]/8">
                                                <i className="fa-regular fa-check text-xs text-emerald-500" />
                                                <span className="text-sm text-[#0f1b3d]/55">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Sidebar */}
                            <div className="space-y-6">
                                {/* Skills */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-5 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-3">Skills Required</div>
                                    <div className="flex flex-wrap gap-2">
                                        {jobData.skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 border border-[#233876]/15 text-xs text-[#233876]/70 font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="detail-nine-section border-2 border-[#233876]/10 bg-white p-5 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-3">Quick Info</div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Posted", value: jobData.posted },
                                            { label: "Deadline", value: jobData.deadline },
                                            { label: "Fee", value: jobData.fee },
                                            { label: "Experience", value: jobData.experience },
                                        ].map((info, i) => (
                                            <div key={i} className="flex justify-between items-center py-2 border-b border-dashed border-[#233876]/5 last:border-0">
                                                <span className="text-xs text-[#0f1b3d]/40">{info.label}</span>
                                                <span className="text-xs font-semibold text-[#0f1b3d]">{info.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="detail-nine-section detail-nine-timeline border-2 border-[#233876]/10 bg-white p-5 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-4">Activity Timeline</div>
                                    <div className="space-y-4">
                                        {timeline.map((event, i) => (
                                            <div key={i} className="detail-nine-timeline-item flex items-start gap-3 opacity-0">
                                                <div className="w-8 h-8 border border-[#233876]/10 flex items-center justify-center flex-shrink-0 bg-[#f7f8fa]">
                                                    <span className="font-mono text-[9px] font-bold text-[#233876]/50">{event.initials}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-[#0f1b3d] mb-0.5">{event.title}</div>
                                                    <div className="font-mono text-[9px] text-[#233876]/25 tracking-wider">{event.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Apply CTA */}
                                <div className="detail-nine-section border-2 border-[#233876] bg-white p-5 relative opacity-0">
                                    <div className="text-center">
                                        <div className="font-mono text-[10px] text-[#233876]/40 tracking-wider uppercase mb-2">Ready?</div>
                                        <h3 className="font-bold text-[#0f1b3d] mb-3">Apply for This Role</h3>
                                        <button className="w-full px-5 py-2.5 border-2 border-[#233876] bg-[#233876] text-sm text-white hover:bg-[#1a2a5c] transition-colors font-medium">
                                            Submit Application
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar Roles */}
            <section className="relative py-12 bg-white overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-2">Recommendations</span>
                            <h2 className="text-2xl font-bold text-[#0f1b3d]">Similar Roles</h2>
                        </div>
                        <div className="detail-nine-similar-grid grid md:grid-cols-3 gap-px bg-[#233876]/10">
                            {similarRoles.map((role, i) => (
                                <div key={i} className="detail-nine-similar bg-white p-6 relative opacity-0 group hover:bg-[#f7f8fa] transition-colors cursor-pointer">
                                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#233876]/15">{role.ref}</div>
                                    <h3 className="font-bold text-[#0f1b3d] mb-1 group-hover:text-[#233876] transition-colors">{role.title}</h3>
                                    <div className="text-xs text-[#0f1b3d]/40 mb-3">{role.company}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm font-bold text-[#233876]">{role.salary}</span>
                                        <span className="font-mono text-[10px] text-[#0f1b3d]/30">{role.applicants} applicants</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#233876] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference bar */}
            <section className="relative py-6 bg-[#f7f8fa]">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">EMPLOYMENT NETWORKS // DETAIL VIEW v9.0</span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">CLEAN ARCHITECTURE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
