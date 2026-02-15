"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const job = {
    title: "Staff Software Engineer", company: "Meridian Corp", companyInitials: "MC", department: "Engineering",
    location: "San Francisco, CA", locationType: "Hybrid", employmentType: "Full-time", experienceLevel: "Staff",
    salaryMin: 220000, salaryMax: 280000, postedDate: "February 10, 2026", closingDate: "March 15, 2026",
    status: "Active", urgency: "Urgent", applicants: 34, views: 1247, splitFee: "20%", splitModel: "50/50", featured: true,
    description: "We are looking for a Staff Software Engineer to lead our platform migration from a monolithic architecture to microservices. You will work closely with the VP of Engineering and a team of 12 engineers to design, build, and ship scalable systems that power Meridian's core products.\n\nThis is a high-impact role where you will define technical direction, mentor senior engineers, and drive decisions that affect millions of users.",
    requirements: ["10+ years of professional software engineering experience", "Deep expertise in distributed systems and service-oriented architecture", "Strong proficiency in TypeScript, Go, or similar languages", "Experience with Kubernetes, Docker, and cloud infrastructure (AWS/GCP)", "Track record of leading large-scale platform migrations", "Excellent communication and mentoring skills"],
    niceToHave: ["Experience with event-driven architectures (Kafka, RabbitMQ)", "Familiarity with GraphQL and API gateway patterns", "Previous experience in fintech or high-traffic consumer products"],
    benefits: [
        { icon: "fa-duotone fa-regular fa-heart-pulse", label: "Premium health, dental, and vision" },
        { icon: "fa-duotone fa-regular fa-chart-line-up", label: "Significant equity with 4-year vesting" },
        { icon: "fa-duotone fa-regular fa-umbrella-beach", label: "Unlimited PTO, 3-week minimum" },
        { icon: "fa-duotone fa-regular fa-graduation-cap", label: "$5,000 annual learning budget" },
        { icon: "fa-duotone fa-regular fa-house-laptop", label: "Flexible hybrid schedule" },
        { icon: "fa-duotone fa-regular fa-utensils", label: "Daily catered meals" },
    ],
    skills: ["TypeScript", "Go", "Kubernetes", "AWS", "PostgreSQL", "Microservices", "GraphQL", "Docker"],
};

const activity = [
    { id: 1, user: "Sarah Chen", action: "submitted an application", time: "2 hours ago", icon: "fa-duotone fa-regular fa-file-circle-plus" },
    { id: 2, user: "Marcus Rivera", action: "viewed this listing", time: "3 hours ago", icon: "fa-duotone fa-regular fa-eye" },
    { id: 3, user: "Diana Foster", action: "shared with a candidate", time: "5 hours ago", icon: "fa-duotone fa-regular fa-share" },
    { id: 4, user: "Kevin Zhang", action: "submitted an application", time: "Yesterday", icon: "fa-duotone fa-regular fa-file-circle-plus" },
    { id: 5, user: "System", action: "listing marked as urgent", time: "2 days ago", icon: "fa-duotone fa-regular fa-bolt" },
    { id: 6, user: "Alexandra Whitfield", action: "created this listing", time: "4 days ago", icon: "fa-duotone fa-regular fa-plus-circle" },
];

const relatedJobs = [
    { title: "Principal Engineer", company: "Quantum Financial", salary: "$250k\u2013$320k", location: "Remote" },
    { title: "Senior Platform Engineer", company: "Cirrus Technologies", salary: "$190k\u2013$240k", location: "New York" },
    { title: "Engineering Manager", company: "Helix Dynamics", salary: "$200k\u2013$260k", location: "Austin, TX" },
];

export default function DetailsTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-dh]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-dm]", { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.2 });
        gsap.from("[data-dc]", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.4 });
        gsap.from("[data-ds]", { x: 30, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
        gsap.from("[data-sect]", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: "[data-dc]", start: "top 80%" } });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            <div data-dh className="border-b border-base-300">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
                    <button className="flex items-center gap-2 text-xs text-base-content/40 hover:text-base-content/60 transition-colors mb-5"><i className="fa-duotone fa-regular fa-arrow-left text-[10px]" /> Back to Jobs</button>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">{job.companyInitials}</div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-warning/10 text-warning text-[9px] font-bold uppercase tracking-[0.1em] rounded-full"><i className="fa-duotone fa-regular fa-star text-[8px] mr-0.5" /> Featured</span>
                                    <span className="px-2 py-0.5 bg-success/10 text-success text-[9px] font-bold uppercase tracking-[0.1em] rounded-full">{job.status}</span>
                                    <span className="px-2 py-0.5 bg-error/10 text-error text-[9px] font-bold uppercase tracking-[0.1em] rounded-full"><i className="fa-duotone fa-regular fa-bolt text-[8px] mr-0.5" /> {job.urgency}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">{job.title}</h1>
                                <div data-dm className="flex flex-wrap items-center gap-3 mt-2 text-sm text-base-content/50">
                                    <span className="flex items-center gap-1.5"><i className="fa-duotone fa-regular fa-building text-xs" /> {job.company}</span>
                                    <span className="w-1 h-1 bg-base-content/20 rounded-full" />
                                    <span><i className="fa-duotone fa-regular fa-location-dot text-xs mr-1" />{job.location}</span>
                                    <span className="w-1 h-1 bg-base-content/20 rounded-full" />
                                    <span>{job.locationType}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setSaved(!saved)} className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${saved ? "bg-secondary/10 border-secondary/30 text-secondary" : "border-base-300 text-base-content/30 hover:text-base-content/60"}`}><i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark text-sm`} /></button>
                            <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content/60 transition-all"><i className="fa-duotone fa-regular fa-share text-sm" /></button>
                            <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content/60 transition-all"><i className="fa-duotone fa-regular fa-print text-sm" /></button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"><i className="fa-duotone fa-regular fa-paper-plane text-xs" /> Apply Now</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-base-200"><div className="max-w-6xl mx-auto px-6 md:px-10 flex gap-0">
                {(["overview", "activity"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all capitalize ${activeTab === tab ? "border-b-base-content text-base-content" : "border-b-transparent text-base-content/40 hover:text-base-content/60"}`}>
                        {tab}{tab === "activity" && <span className="ml-2 px-1.5 py-0.5 bg-base-200 rounded text-[10px] font-bold">{activity.length}</span>}
                    </button>
                ))}
            </div></div>

            <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div data-dc className="flex-1 min-w-0">
                        {activeTab === "overview" && (
                            <div className="space-y-10">
                                <div data-sect className="p-6 border border-base-200 rounded-xl bg-base-200/20">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div><p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-1">Compensation</p><p className="text-2xl md:text-3xl font-bold text-base-content tracking-tight">${job.salaryMin.toLocaleString()} &ndash; ${job.salaryMax.toLocaleString()}</p><p className="text-xs text-base-content/40 mt-1">USD &middot; {job.experienceLevel} &middot; {job.department}</p></div>
                                        <div className="flex gap-6"><div className="text-center"><p className="text-lg font-bold text-secondary">{job.splitFee}</p><p className="text-[10px] text-base-content/30 uppercase tracking-wider">Fee</p></div><div className="text-center"><p className="text-lg font-bold text-base-content">{job.splitModel}</p><p className="text-[10px] text-base-content/30 uppercase tracking-wider">Split</p></div></div>
                                    </div>
                                </div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">About the Role</h3>{job.description.split("\n\n").map((p, i) => <p key={i} className="text-sm text-base-content/60 leading-relaxed mb-4">{p}</p>)}</div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Requirements</h3><ul className="space-y-2.5">{job.requirements.map((r, i) => <li key={i} className="flex gap-3 text-sm text-base-content/60"><i className="fa-duotone fa-regular fa-check text-secondary text-xs mt-1 shrink-0" />{r}</li>)}</ul></div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Nice to Have</h3><ul className="space-y-2.5">{job.niceToHave.map((n, i) => <li key={i} className="flex gap-3 text-sm text-base-content/50"><i className="fa-duotone fa-regular fa-circle text-[6px] text-base-content/20 mt-2 shrink-0" />{n}</li>)}</ul></div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Skills</h3><div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="px-3 py-1.5 rounded-full border border-base-300 text-xs font-medium text-base-content/50">{s}</span>)}</div></div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Benefits</h3><div className="grid md:grid-cols-2 gap-3">{job.benefits.map((b) => <div key={b.label} className="flex items-center gap-3 p-3 rounded-lg border border-base-200"><div className="w-8 h-8 rounded-lg bg-base-200/60 flex items-center justify-center shrink-0"><i className={`${b.icon} text-sm text-base-content/30`} /></div><span className="text-xs text-base-content/60">{b.label}</span></div>)}</div></div>
                                <div data-sect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Similar Roles</h3><div className="space-y-3">{relatedJobs.map((rj) => <a key={rj.title} href="#" className="flex items-center justify-between p-4 border border-base-200 rounded-xl hover:border-base-300 transition-colors group"><div><p className="text-sm font-semibold text-base-content group-hover:text-secondary transition-colors">{rj.title}</p><p className="text-xs text-base-content/40 mt-0.5">{rj.company} &middot; {rj.location}</p></div><span className="text-xs font-semibold text-base-content/50">{rj.salary}</span></a>)}</div></div>
                            </div>
                        )}
                        {activeTab === "activity" && (
                            <div><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-6">Timeline</h3>{activity.map((a, i) => (<div key={a.id} className="flex gap-4 relative">{i < activity.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-px bg-base-200" />}<div className="w-9 h-9 rounded-full bg-base-200/60 flex items-center justify-center shrink-0 z-10"><i className={`${a.icon} text-xs text-base-content/40`} /></div><div className="pb-6"><p className="text-sm text-base-content/70"><span className="font-semibold">{a.user}</span> {a.action}</p><p className="text-[11px] text-base-content/30 mt-0.5">{a.time}</p></div></div>))}</div>
                        )}
                    </div>
                    <aside data-ds className="w-full lg:w-[300px] shrink-0 space-y-6">
                        <div className="border border-base-200 rounded-xl p-5"><h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Metrics</h4><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-base-200/30 rounded-lg"><p className="text-xl font-bold text-base-content">{job.applicants}</p><p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-0.5">Applicants</p></div><div className="text-center p-3 bg-base-200/30 rounded-lg"><p className="text-xl font-bold text-base-content">{job.views.toLocaleString()}</p><p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-0.5">Views</p></div></div></div>
                        <div className="border border-base-200 rounded-xl p-5"><h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Details</h4><div className="space-y-3">{[{ l: "Posted", v: job.postedDate }, { l: "Closing", v: job.closingDate }, { l: "Department", v: job.department }, { l: "Experience", v: job.experienceLevel }].map((d) => <div key={d.l} className="flex justify-between"><span className="text-xs text-base-content/40">{d.l}</span><span className="text-xs font-medium text-base-content/70">{d.v}</span></div>)}</div></div>
                        <div className="border border-base-200 rounded-xl p-5"><h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Recruiter</h4><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">AW</div><div><p className="text-sm font-semibold text-base-content">Alexandra Whitfield</p><p className="text-[11px] text-base-content/40">Senior Talent Partner</p></div></div><button className="w-full flex items-center justify-center gap-2 py-2.5 border border-base-300 rounded-lg text-xs font-semibold text-base-content/60 hover:border-base-content/30 transition-colors"><i className="fa-duotone fa-regular fa-paper-plane" /> Message</button></div>
                        <div className="border border-base-200 rounded-xl p-5"><h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Share</h4><div className="flex gap-2">{["fa-brands fa-linkedin-in", "fa-brands fa-x-twitter", "fa-duotone fa-regular fa-envelope", "fa-duotone fa-regular fa-link"].map((ic, i) => <button key={i} className="flex-1 py-2.5 rounded-lg bg-base-200/50 text-base-content/30 hover:text-base-content/60 hover:bg-base-200 transition-colors"><i className={`${ic} text-sm`} /></button>)}</div></div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
