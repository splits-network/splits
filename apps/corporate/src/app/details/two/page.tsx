"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Mock Data ──────────────────────────────────────────────────────────────── */

const job = {
    title: "Staff Frontend Engineer",
    company: "Meridian Corp",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    department: "Engineering",
    employmentType: "Full-Time",
    experienceLevel: "Staff",
    salary: "$200,000 - $260,000",
    splitFee: "50/50",
    posted: "February 3, 2026",
    deadline: "March 15, 2026",
    status: "Open",
    applicants: 34,
    views: 1287,
    recruiterAssigned: 6,
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Team Leadership"],
    description: `We are looking for a Staff Frontend Engineer to lead the evolution of our customer-facing platform. You will define frontend architecture decisions, mentor a team of six engineers, and ship features that directly impact revenue.

This role sits at the intersection of deep technical work and cross-functional leadership. You will partner closely with Product, Design, and Backend Engineering to deliver cohesive user experiences at scale.`,
    requirements: [
        "8+ years of professional frontend development experience",
        "Deep expertise in React, TypeScript, and modern build tooling",
        "Experience leading or mentoring engineering teams",
        "Track record of improving performance, accessibility, and developer experience",
        "Strong communication skills and comfort working cross-functionally",
        "Experience with design systems and component libraries",
    ],
    benefits: [
        "Competitive equity package with 4-year vesting",
        "Comprehensive health, dental, and vision coverage",
        "Unlimited PTO with a 3-week minimum encouraged",
        "Annual $5,000 professional development budget",
        "Hybrid schedule: 3 days in-office, 2 remote",
        "401(k) with 4% company match",
    ],
};

const timeline = [
    { id: 1, user: "Diana Foster", action: "posted this job to the network", time: "Feb 3 at 9:14 AM", icon: "fa-duotone fa-regular fa-plus-circle" },
    { id: 2, user: "Marcus Rivera", action: "was assigned as a network recruiter", time: "Feb 4 at 11:02 AM", icon: "fa-duotone fa-regular fa-user-plus" },
    { id: 3, user: "Sarah Chen", action: "submitted a candidate: Alex Kim", time: "Feb 6 at 2:30 PM", icon: "fa-duotone fa-regular fa-file-circle-plus" },
    { id: 4, user: "Diana Foster", action: "scheduled a phone screen with Alex Kim", time: "Feb 8 at 10:15 AM", icon: "fa-duotone fa-regular fa-calendar-check" },
    { id: 5, user: "James Park", action: "left a note: \"Strong culture fit, recommend advancing\"", time: "Feb 10 at 4:45 PM", icon: "fa-duotone fa-regular fa-comment" },
    { id: 6, user: "Lisa Okafor", action: "submitted a candidate: Jordan Lee", time: "Feb 12 at 9:00 AM", icon: "fa-duotone fa-regular fa-file-circle-plus" },
];

const relatedJobs = [
    { title: "Senior Frontend Engineer", company: "Helix Dynamics", location: "Remote", salary: "$170k - $210k", applicants: 22 },
    { title: "Frontend Tech Lead", company: "Cirrus Technologies", location: "New York, NY", salary: "$190k - $240k", applicants: 18 },
    { title: "Principal UI Engineer", company: "Quantum Financial", location: "Austin, TX", salary: "$210k - $270k", applicants: 11 },
];

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function DetailTwo() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from("[data-detail-title]", {
            y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
        });
        gsap.from("[data-meta-item]", {
            y: 20, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power2.out", delay: 0.4,
        });
        gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
            gsap.from(line, {
                scaleX: 0, transformOrigin: "left center", duration: 1, ease: "power2.inOut",
                scrollTrigger: { trigger: line, start: "top 90%" },
            });
        });
        gsap.from("[data-section]", {
            y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: "[data-content]", start: "top 80%" },
        });
        gsap.from("[data-timeline-item]", {
            x: -30, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out",
            scrollTrigger: { trigger: "[data-timeline]", start: "top 80%" },
        });
        gsap.from("[data-related]", {
            y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: "[data-related-section]", start: "top 80%" },
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="overflow-hidden min-h-screen bg-base-100">
            {/* ─── Header ────────────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span data-detail-title className="px-2 py-0.5 text-xs uppercase tracking-wider font-semibold bg-success/20 text-success">{job.status}</span>
                        <span data-detail-title className="text-xs uppercase tracking-[0.2em] text-neutral-content/40">Posted {job.posted}</span>
                    </div>
                    <h1 data-detail-title className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4">{job.title}</h1>
                    <p data-detail-title className="text-xl text-neutral-content/70 mb-8">
                        {job.company} &middot; {job.location} &middot; {job.locationType}
                    </p>
                    <div data-detail-title className="flex flex-wrap gap-3">
                        <button className="btn btn-secondary text-xs uppercase tracking-[0.15em] font-semibold px-6">
                            <i className="fa-regular fa-paper-plane mr-2" /> Submit Candidate
                        </button>
                        <button className="btn btn-ghost text-xs uppercase tracking-[0.15em] font-semibold px-6 border border-neutral-content/20 text-neutral-content hover:bg-neutral-content/10">
                            <i className="fa-regular fa-bookmark mr-2" /> Save
                        </button>
                        <button className="btn btn-ghost text-xs uppercase tracking-[0.15em] font-semibold px-6 border border-neutral-content/20 text-neutral-content hover:bg-neutral-content/10">
                            <i className="fa-regular fa-share-nodes mr-2" /> Share
                        </button>
                        <button className="btn btn-ghost text-xs uppercase tracking-[0.15em] font-semibold px-6 border border-neutral-content/20 text-neutral-content hover:bg-neutral-content/10">
                            <i className="fa-regular fa-print mr-2" /> Print
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── Metadata Bar ───────────────────────────────────────── */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { label: "Department", value: job.department, icon: "fa-duotone fa-regular fa-building" },
                            { label: "Type", value: job.employmentType, icon: "fa-duotone fa-regular fa-clock" },
                            { label: "Level", value: job.experienceLevel, icon: "fa-duotone fa-regular fa-chart-simple" },
                            { label: "Salary", value: job.salary, icon: "fa-duotone fa-regular fa-dollar-sign" },
                            { label: "Split Fee", value: job.splitFee, icon: "fa-duotone fa-regular fa-handshake" },
                            { label: "Deadline", value: "Mar 15", icon: "fa-duotone fa-regular fa-calendar" },
                        ].map((item) => (
                            <div key={item.label} data-meta-item className="flex items-center gap-3">
                                <i className={`${item.icon} text-secondary`} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 font-medium">{item.label}</p>
                                    <p className="text-sm font-semibold text-base-content">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Stats Row ──────────────────────────────────────────── */}
            <section className="bg-base-100 border-b border-base-300">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-4">
                    <div className="flex items-center gap-8 text-sm">
                        <span className="flex items-center gap-2 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-eye text-secondary" />
                            <strong className="text-base-content">{job.views.toLocaleString()}</strong> views
                        </span>
                        <span className="flex items-center gap-2 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-file-lines text-secondary" />
                            <strong className="text-base-content">{job.applicants}</strong> applicants
                        </span>
                        <span className="flex items-center gap-2 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-user-tie text-secondary" />
                            <strong className="text-base-content">{job.recruiterAssigned}</strong> recruiters
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── Main Content ───────────────────────────────────────── */}
            <section className="py-16 md:py-24" data-content>
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        <div className="lg:col-span-2 space-y-12">
                            <div data-section>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">About the Role</p>
                                <div data-divider className="h-px bg-base-300 mb-6" />
                                {job.description.split("\n\n").map((para, i) => (
                                    <p key={i} className="text-base-content/70 leading-relaxed mb-4 last:mb-0">{para}</p>
                                ))}
                            </div>

                            <div data-section>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Requirements</p>
                                <div data-divider className="h-px bg-base-300 mb-6" />
                                <ul className="space-y-3">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 text-base-content/70">
                                            <i className="fa-regular fa-check text-secondary mt-1 shrink-0" /><span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div data-section>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Benefits & Perks</p>
                                <div data-divider className="h-px bg-base-300 mb-6" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {job.benefits.map((b, i) => (
                                        <div key={i} className="flex items-start gap-3 text-base-content/70">
                                            <i className="fa-duotone fa-regular fa-circle-check text-success mt-0.5 shrink-0" />
                                            <span className="text-sm">{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div data-section>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Required Skills</p>
                                <div data-divider className="h-px bg-base-300 mb-6" />
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((s) => (
                                        <span key={s} className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium border border-base-300 text-base-content/70">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div data-timeline>
                                <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Activity Timeline</p>
                                <div data-divider className="h-px bg-base-300 mb-6" />
                                <div className="space-y-0">
                                    {timeline.map((item) => (
                                        <div key={item.id} data-timeline-item className="flex items-start gap-4 py-4 border-b border-base-300 last:border-b-0">
                                            <div className="w-8 h-8 bg-base-200 flex items-center justify-center shrink-0 mt-0.5">
                                                <i className={`${item.icon} text-secondary text-sm`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm"><span className="font-semibold text-base-content">{item.user}</span> <span className="text-base-content/60">{item.action}</span></p>
                                                <p className="text-xs text-base-content/40 mt-0.5 uppercase tracking-wider">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="border border-base-300 p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-4">Quick Actions</p>
                                <div className="space-y-3">
                                    <button className="btn btn-secondary w-full text-xs uppercase tracking-[0.15em] font-semibold">
                                        <i className="fa-regular fa-paper-plane mr-2" /> Submit Candidate
                                    </button>
                                    <button className="btn btn-ghost w-full text-xs uppercase tracking-[0.15em] font-semibold border border-base-300 text-base-content/60">
                                        <i className="fa-regular fa-message mr-2" /> Contact Hiring Manager
                                    </button>
                                </div>
                            </div>

                            <div className="border border-base-300 p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-4">Split-Fee Terms</p>
                                <div className="text-center py-4 mb-4">
                                    <p className="text-4xl font-bold text-primary tracking-tight">{job.splitFee}</p>
                                    <p className="text-xs text-base-content/40 uppercase tracking-wider mt-1">Fee Split</p>
                                </div>
                                <div className="h-px bg-base-300 mb-4" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-base-content/50">Guarantee</span><span className="font-medium text-base-content">90 days</span></div>
                                    <div className="flex justify-between"><span className="text-base-content/50">Payment</span><span className="font-medium text-base-content">Net 30</span></div>
                                    <div className="flex justify-between"><span className="text-base-content/50">Fee Rate</span><span className="font-medium text-base-content">20% of salary</span></div>
                                </div>
                            </div>

                            <div className="border border-base-300 p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium mb-4">Company</p>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary flex items-center justify-center"><span className="text-primary-content text-sm font-bold">MC</span></div>
                                    <div>
                                        <p className="font-bold text-base-content">{job.company}</p>
                                        <p className="text-xs text-base-content/50">Enterprise SaaS &middot; 500-1000</p>
                                    </div>
                                </div>
                                <p className="text-sm text-base-content/60 leading-relaxed">
                                    Meridian Corp builds data infrastructure for enterprise teams. Series C, backed by Accel and Sequoia.
                                </p>
                            </div>

                            <div className="border-l-4 border-secondary pl-6 py-2">
                                <p className="text-lg italic text-base-content/70 leading-snug mb-3">
                                    &ldquo;This is a high-impact role with direct access to the CTO. We need someone who can own the frontend platform end to end.&rdquo;
                                </p>
                                <cite className="text-xs text-base-content/40 not-italic uppercase tracking-wider">Diana Foster, VP Engineering</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Related Jobs ───────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24" data-related-section>
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-4">Similar Roles</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">You may also be interested in</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedJobs.map((rj) => (
                            <div key={rj.title} data-related className="border border-neutral-content/10 p-6 hover:border-secondary/40 transition-colors group cursor-pointer">
                                <h3 className="font-bold text-neutral-content group-hover:text-secondary transition-colors mb-2">{rj.title}</h3>
                                <p className="text-sm text-neutral-content/50 mb-4">{rj.company} &middot; {rj.location}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-secondary font-semibold">{rj.salary}</span>
                                    <span className="text-neutral-content/40">{rj.applicants} applicants</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-base-200 py-12">
                <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">Splits Network &middot; Job Detail &middot; Magazine Editorial</p>
                </div>
            </section>
        </div>
    );
}
