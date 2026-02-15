"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const profile = {
    name: "Alexandra Whitfield", initials: "AW", title: "Senior Talent Partner", company: "Apex Recruiting",
    location: "San Francisco, CA", email: "alexandra@apexrecruiting.com", phone: "+1 (415) 555-0182",
    bio: "Seasoned recruiting professional with 8+ years specializing in engineering and executive placements. Passionate about connecting exceptional talent with transformative opportunities through collaborative split-fee partnerships. Known for deep technical understanding and a consultative approach to talent acquisition.",
    memberSince: "March 2023", verified: true, online: true,
    specializations: ["Engineering Leadership", "Staff+ Engineers", "Platform Engineering", "DevOps/SRE", "AI/ML"],
    stats: [
        { label: "Placements", value: "127" }, { label: "Active Roles", value: "12" },
        { label: "Success Rate", value: "94%" }, { label: "Avg. Time to Fill", value: "18d" },
        { label: "Network Partners", value: "43" }, { label: "Rating", value: "4.9" },
    ],
};

const experience = [
    { role: "Senior Talent Partner", company: "Apex Recruiting", period: "2023 \u2013 Present", current: true, desc: "Leading technical recruiting initiatives across 15+ enterprise accounts. Specialized in split-fee partnerships for engineering leadership roles." },
    { role: "Technical Recruiter", company: "Talent Bridge Inc.", period: "2020 \u2013 2023", current: false, desc: "Built and managed a pipeline of 500+ engineering candidates. Closed 80+ placements with a 92% retention rate." },
    { role: "Recruiting Coordinator", company: "StartupHire", period: "2018 \u2013 2020", current: false, desc: "Supported full-cycle recruiting for early-stage startups. Developed screening processes and candidate experience workflows." },
];

const recentActivity = [
    { icon: "fa-duotone fa-regular fa-trophy", action: "Completed placement: Staff Engineer at Meridian Corp", time: "2 days ago" },
    { icon: "fa-duotone fa-regular fa-handshake", action: "Partnered with Diana Foster on VP Engineering search", time: "5 days ago" },
    { icon: "fa-duotone fa-regular fa-briefcase", action: "Posted 3 new engineering roles", time: "1 week ago" },
    { icon: "fa-duotone fa-regular fa-star", action: "Received 5-star review from Marcus Chen", time: "2 weeks ago" },
    { icon: "fa-duotone fa-regular fa-user-plus", action: "Connected with 7 new recruiting partners", time: "3 weeks ago" },
];

const recommendations = [
    { name: "Diana Foster", initials: "DF", title: "Technical Recruiter", specialty: "Engineering", online: true },
    { name: "Tom Bradley", initials: "TB", title: "Executive Recruiter", specialty: "Leadership", online: false },
    { name: "Lisa Okafor", initials: "LO", title: "Senior Recruiter", specialty: "Data & AI", online: true },
];

export default function ProfilesTwoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"about" | "activity">("about");

    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.from("[data-ph]", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
        gsap.from("[data-pstat]", { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.3 });
        gsap.from("[data-pc]", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.4 });
        gsap.from("[data-ps]", { x: 30, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
        gsap.from("[data-psect]", { y: 25, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: "[data-pc]", start: "top 80%" } });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-base-100">
            {/* Header */}
            <div data-ph className="border-b border-base-300">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-2xl font-bold text-secondary">{profile.initials}</div>
                            {profile.online && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-3 border-base-100" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">{profile.name}</h1>
                                {profile.verified && <i className="fa-duotone fa-regular fa-badge-check text-secondary" />}
                            </div>
                            <p className="text-sm text-base-content/50 mb-1">{profile.title} at {profile.company}</p>
                            <p className="text-xs text-base-content/35 flex items-center gap-3">
                                <span><i className="fa-duotone fa-regular fa-location-dot mr-1" />{profile.location}</span>
                                <span className="w-1 h-1 bg-base-content/15 rounded-full" />
                                <span>Member since {profile.memberSince}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-base-content text-base-100 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"><i className="fa-duotone fa-regular fa-paper-plane text-xs" /> Message</button>
                            <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content/60 transition-all"><i className="fa-duotone fa-regular fa-user-plus text-sm" /></button>
                            <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content/60 transition-all"><i className="fa-duotone fa-regular fa-share text-sm" /></button>
                            <button className="w-9 h-9 rounded-lg flex items-center justify-center border border-base-300 text-base-content/30 hover:text-base-content/60 transition-all"><i className="fa-duotone fa-regular fa-ellipsis text-sm" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="border-b border-base-200 bg-base-200/20">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">{profile.stats.map((s) => <div key={s.label} data-pstat className="text-center"><p className="text-lg md:text-xl font-bold text-base-content">{s.value}</p><p className="text-[10px] uppercase tracking-[0.2em] text-base-content/30 mt-0.5 font-medium">{s.label}</p></div>)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-base-200">
                <div className="max-w-6xl mx-auto px-6 md:px-10 flex gap-0">
                    {(["about", "activity"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all capitalize ${activeTab === tab ? "border-b-base-content text-base-content" : "border-b-transparent text-base-content/40"}`}>{tab}</button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div data-pc className="flex-1 min-w-0">
                        {activeTab === "about" && (
                            <div className="space-y-10">
                                <div data-psect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">About</h3><p className="text-sm text-base-content/60 leading-relaxed">{profile.bio}</p></div>
                                <div data-psect><h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Specializations</h3><div className="flex flex-wrap gap-2">{profile.specializations.map((s) => <span key={s} className="px-3 py-1.5 rounded-full border border-base-300 text-xs font-medium text-base-content/50">{s}</span>)}</div></div>
                                <div data-psect>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Experience</h3>
                                    <div className="space-y-6">{experience.map((e, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            {i < experience.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-px bg-base-200" />}
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${e.current ? "bg-secondary/10" : "bg-base-200/60"}`}>
                                                <i className={`fa-duotone fa-regular fa-briefcase text-xs ${e.current ? "text-secondary" : "text-base-content/30"}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-base-content">{e.role}</p>{e.current && <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-bold uppercase rounded">Current</span>}</div>
                                                <p className="text-xs text-base-content/40">{e.company} &middot; {e.period}</p>
                                                <p className="text-xs text-base-content/45 leading-relaxed mt-1.5">{e.desc}</p>
                                            </div>
                                        </div>
                                    ))}</div>
                                </div>
                            </div>
                        )}
                        {activeTab === "activity" && (
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-6">Recent Activity</h3>
                                <div className="space-y-4">{recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 border border-base-200 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-base-200/60 flex items-center justify-center shrink-0"><i className={`${a.icon} text-xs text-base-content/30`} /></div>
                                        <div><p className="text-sm text-base-content/70">{a.action}</p><p className="text-[11px] text-base-content/30 mt-0.5">{a.time}</p></div>
                                    </div>
                                ))}</div>
                            </div>
                        )}
                    </div>

                    <aside data-ps className="w-full lg:w-[280px] shrink-0 space-y-6">
                        <div className="border border-base-200 rounded-xl p-5">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Contact</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3"><i className="fa-duotone fa-regular fa-envelope text-xs text-base-content/30 w-4" /><span className="text-xs text-base-content/50">{profile.email}</span></div>
                                <div className="flex items-center gap-3"><i className="fa-duotone fa-regular fa-phone text-xs text-base-content/30 w-4" /><span className="text-xs text-base-content/50">{profile.phone}</span></div>
                                <div className="flex items-center gap-3"><i className="fa-duotone fa-regular fa-location-dot text-xs text-base-content/30 w-4" /><span className="text-xs text-base-content/50">{profile.location}</span></div>
                            </div>
                        </div>
                        <div className="border border-base-200 rounded-xl p-5">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-semibold mb-4">Similar Recruiters</h4>
                            <div className="space-y-3">{recommendations.map((r) => (
                                <a key={r.name} href="#" className="flex items-center gap-3 group">
                                    <div className="relative"><div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-[11px] font-bold text-secondary">{r.initials}</div>{r.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100" />}</div>
                                    <div><p className="text-xs font-semibold text-base-content group-hover:text-secondary transition-colors">{r.name}</p><p className="text-[10px] text-base-content/35">{r.specialty}</p></div>
                                </a>
                            ))}</div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
