"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { mockJobs } from "@/data/mock-jobs";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const job = mockJobs[0]; // Senior Product Designer at Stripe

const activityTimeline = [
    { type: "posted", text: "Job listing published to marketplace", time: "3 days ago", icon: "fa-duotone fa-regular fa-rocket", color: "text-primary" },
    { type: "featured", text: "Listing promoted to featured status", time: "3 days ago", icon: "fa-duotone fa-regular fa-star", color: "text-warning" },
    { type: "applicant", text: "First application received from external candidate", time: "2 days ago", icon: "fa-duotone fa-regular fa-user-plus", color: "text-success" },
    { type: "milestone", text: "50 applications milestone reached", time: "1 day ago", icon: "fa-duotone fa-regular fa-trophy", color: "text-primary" },
    { type: "recruiter", text: "Sarah Chen assigned as lead recruiter", time: "1 day ago", icon: "fa-duotone fa-regular fa-user-tie", color: "text-secondary" },
    { type: "views", text: "Listing surpassed 1,000 views", time: "12 hours ago", icon: "fa-duotone fa-regular fa-eye", color: "text-info" },
    { type: "update", text: "Job description updated with additional requirements", time: "6 hours ago", icon: "fa-duotone fa-regular fa-pen", color: "text-base-content/50" },
];

const relatedJobs = mockJobs.filter((j) => j.id !== job.id && j.department === "Design").slice(0, 3);
const alsoRecommended = mockJobs.filter((j) => j.id !== job.id && j.featured).slice(0, 3);

function formatSalary(salary: typeof job.salary) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: salary.currency, maximumFractionDigits: 0 }).format(n);
    return `${fmt(salary.min)} - ${fmt(salary.max)}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DetailFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".cin-reveal"), { opacity: 1, y: 0, x: 0 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // Hero entrance
            const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            heroTl
                .fromTo($1(".cin-detail-kicker"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.1)
                .fromTo($1(".cin-detail-title"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
                .fromTo($1(".cin-detail-meta"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5)
                .fromTo($(".cin-detail-action"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.6);

            // Quick stats
            gsap.fromTo(
                $(".cin-quick-stat"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: $1(".cin-quick-stats"), start: "top 85%" } },
            );

            // Content sections
            $(".cin-section").forEach((sec) => {
                gsap.fromTo(sec, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 80%" } });
            });

            // Timeline items
            gsap.fromTo(
                $(".cin-timeline-item"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: $1(".cin-timeline"), start: "top 80%" } },
            );

            // Related cards
            gsap.fromTo(
                $(".cin-related-card"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: $1(".cin-related"), start: "top 85%" } },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100">
            {/* ══════════════════════════════════════════════════════════════
                HERO HEADER
               ══════════════════════════════════════════════════════════════ */}
            <header className="bg-neutral text-white">
                <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
                    {/* Breadcrumb */}
                    <div className="cin-detail-kicker flex items-center gap-2 text-xs text-white/40 mb-6 opacity-0">
                        <a href="#" className="hover:text-white/70 transition-colors">Jobs</a>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[8px]" />
                        <a href="#" className="hover:text-white/70 transition-colors">{job.department}</a>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[8px]" />
                        <span className="text-white/60">{job.title}</span>
                    </div>

                    {/* Title area */}
                    <div className="cin-detail-title opacity-0">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="badge badge-success font-semibold uppercase tracking-wider">{job.status}</span>
                            {job.featured && <span className="badge badge-primary font-semibold"><i className="fa-duotone fa-regular fa-star mr-1" />Featured</span>}
                            <span className="badge bg-white/10 border-0 text-white/50 font-medium capitalize">{job.type}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight mb-2">
                            {job.title}
                        </h1>
                        <p className="text-lg text-white/50 font-medium">{job.company}</p>
                    </div>

                    {/* Meta row */}
                    <div className="cin-detail-meta flex flex-wrap gap-5 mt-6 text-sm text-white/40 opacity-0">
                        <span className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-location-dot text-primary" />{job.location}</span>
                        <span className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-money-bill-wave text-primary" />{formatSalary(job.salary)}</span>
                        <span className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-chart-simple text-primary" /><span className="capitalize">{job.experienceLevel}</span></span>
                        <span className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-calendar text-primary" />Posted {formatDate(job.postedDate)}</span>
                        <span className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-clock text-primary" />Deadline {formatDate(job.deadline)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        <button className="cin-detail-action btn btn-primary font-semibold border-0 shadow-sm opacity-0">
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            Apply Now
                        </button>
                        <button className="cin-detail-action btn bg-white/10 border-white/10 text-white hover:bg-white/20 font-semibold opacity-0">
                            <i className="fa-duotone fa-regular fa-bookmark" />
                            Save
                        </button>
                        <button className="cin-detail-action btn bg-white/10 border-white/10 text-white hover:bg-white/20 font-semibold opacity-0">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                            Share
                        </button>
                        <button className="cin-detail-action btn bg-white/10 border-white/10 text-white hover:bg-white/20 font-semibold opacity-0">
                            <i className="fa-duotone fa-regular fa-print" />
                            Print
                        </button>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                QUICK STATS BAR
               ══════════════════════════════════════════════════════════════ */}
            <div className="cin-quick-stats bg-base-200 border-b border-base-content/5">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: job.applicants.toString(), label: "Applicants", icon: "fa-duotone fa-regular fa-users" },
                            { value: job.views.toLocaleString(), label: "Views", icon: "fa-duotone fa-regular fa-eye" },
                            { value: "14", label: "Days Active", icon: "fa-duotone fa-regular fa-calendar-days" },
                            { value: job.equity || "N/A", label: "Equity", icon: "fa-duotone fa-regular fa-chart-pie" },
                        ].map((stat, i) => (
                            <div key={i} className="cin-quick-stat flex items-center gap-3 opacity-0">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <i className={`${stat.icon} text-primary`} />
                                </div>
                                <div>
                                    <div className="font-black text-lg leading-none">{stat.value}</div>
                                    <div className="text-xs text-base-content/40 font-medium mt-0.5">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT + SIDEBAR
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Description */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">About This Role</h2>
                            <p className="text-base-content/70 leading-relaxed text-lg">{job.description}</p>
                        </section>

                        {/* Requirements */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Requirements</h2>
                            <ul className="space-y-3">
                                {job.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base-content/70">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <i className="fa-duotone fa-regular fa-check text-primary text-xs" />
                                        </div>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Responsibilities */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Responsibilities</h2>
                            <ul className="space-y-3">
                                {job.responsibilities.map((resp, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base-content/70">
                                        <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-base-content/30">{i + 1}</span>
                                        </div>
                                        {resp}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Benefits */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Benefits & Perks</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {job.benefits.map((b, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-base-200 rounded-xl px-4 py-3">
                                        <i className="fa-duotone fa-regular fa-circle-check text-primary" />
                                        <span className="font-medium text-sm">{b}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Tags */}
                        <section className="cin-section opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Skills & Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag, i) => (
                                    <span key={i} className="badge badge-lg bg-base-200 border-base-content/10 font-medium">{tag}</span>
                                ))}
                            </div>
                        </section>

                        {/* Activity Timeline */}
                        <section className="cin-section cin-timeline opacity-0">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-6">Activity Timeline</h2>
                            <div className="space-y-0">
                                {activityTimeline.map((item, i) => (
                                    <div key={i} className="cin-timeline-item flex gap-4 pb-6 last:pb-0 relative opacity-0">
                                        {i < activityTimeline.length - 1 && (
                                            <div className="absolute left-[15px] top-8 w-px h-[calc(100%-16px)] bg-base-content/10" />
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0 z-10">
                                            <i className={`${item.icon} ${item.color} text-xs`} />
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm text-base-content/70">{item.text}</p>
                                            <span className="text-xs text-base-content/30 mt-0.5 block">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Recruiter Card */}
                        <div className="cin-section border border-base-content/5 rounded-xl p-5 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Recruiter</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <img src={job.recruiter.avatar} alt={job.recruiter.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20" />
                                <div>
                                    <div className="font-bold">{job.recruiter.name}</div>
                                    <div className="text-sm text-base-content/50">{job.recruiter.agency}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-block btn-sm font-semibold">
                                <i className="fa-duotone fa-regular fa-comment" />
                                Message Recruiter
                            </button>
                        </div>

                        {/* Quick Info */}
                        <div className="cin-section border border-base-content/5 rounded-xl p-5 space-y-4 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Quick Info</h3>
                            {[
                                { label: "Department", value: job.department, icon: "fa-duotone fa-regular fa-building" },
                                { label: "Job Type", value: job.type, icon: "fa-duotone fa-regular fa-briefcase" },
                                { label: "Experience", value: job.experienceLevel, icon: "fa-duotone fa-regular fa-chart-simple" },
                                { label: "Posted", value: formatDate(job.postedDate), icon: "fa-duotone fa-regular fa-calendar" },
                                { label: "Deadline", value: formatDate(job.deadline), icon: "fa-duotone fa-regular fa-clock" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-base-content/40">
                                        <i className={`${item.icon} w-4 text-center`} />
                                        {item.label}
                                    </span>
                                    <span className="font-semibold capitalize">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Salary Card */}
                        <div className="cin-section bg-neutral text-white rounded-xl p-5 opacity-0">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Compensation</h3>
                            <div className="text-2xl font-black mb-1">{formatSalary(job.salary)}</div>
                            <div className="text-xs text-white/40">per year</div>
                            {job.equity && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-xs text-white/40 mb-1">Equity</div>
                                    <div className="font-bold">{job.equity}</div>
                                </div>
                            )}
                        </div>

                        {/* Apply CTA */}
                        <div className="cin-section border border-primary/20 bg-primary/5 rounded-xl p-5 text-center opacity-0">
                            <h3 className="font-black text-lg mb-1">Interested?</h3>
                            <p className="text-sm text-base-content/50 mb-4">
                                Apply now or save for later
                            </p>
                            <button className="btn btn-primary btn-block font-semibold mb-2">
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Apply Now
                            </button>
                            <button className="btn bg-base-200 border-base-content/10 btn-block btn-sm font-medium">
                                <i className="fa-duotone fa-regular fa-bookmark" />
                                Save to Favorites
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                RELATED JOBS
               ══════════════════════════════════════════════════════════════ */}
            <section className="cin-related bg-base-200 py-16 lg:py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">More Opportunities</p>
                            <h2 className="text-2xl md:text-3xl font-black">Similar roles in {job.department}</h2>
                        </div>
                        <a href="#" className="hidden sm:flex text-sm text-primary font-semibold hover:underline items-center gap-1">
                            View All <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                        </a>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {(relatedJobs.length > 0 ? relatedJobs : alsoRecommended).map((rj) => (
                            <div key={rj.id} className="cin-related-card bg-base-100 rounded-xl border border-base-content/5 p-5 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group opacity-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`badge badge-sm badge-success font-semibold uppercase tracking-wider`}>{rj.status}</span>
                                    {rj.featured && <i className="fa-duotone fa-regular fa-star text-primary text-xs" />}
                                </div>
                                <h3 className="font-black text-base mb-1 group-hover:text-primary transition-colors">{rj.title}</h3>
                                <p className="text-sm text-base-content/50 font-medium mb-3">{rj.company}</p>
                                <div className="space-y-1 text-sm text-base-content/40 mb-4">
                                    <div className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-location-dot text-primary text-xs w-4" />{rj.location}</div>
                                    <div className="flex items-center gap-2"><i className="fa-duotone fa-regular fa-money-bill-wave text-primary text-xs w-4" /><span className="font-semibold text-base-content/60">{formatSalary(rj.salary)}</span></div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {rj.tags.slice(0, 3).map((t, i) => (
                                        <span key={i} className="badge badge-sm bg-base-200 border-0 text-base-content/50">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
