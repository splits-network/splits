"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const D = { fast: 0.25, normal: 0.4, slow: 0.6 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };

// ── Mock data ────────────────────────────────────────────────────────────────

const profile = {
    name: "Sarah Mitchell",
    initials: "SM",
    title: "Senior Technical Recruiter",
    agency: "TechTalent Partners",
    location: "San Francisco, CA",
    email: "sarah@techtalent.com",
    phone: "+1 (415) 555-0142",
    linkedin: "linkedin.com/in/sarahmitchell",
    bio: "Specialized in placing senior engineering talent at top-tier technology companies. With 8+ years in technical recruiting, I focus on creating perfect matches between exceptional engineers and innovative teams. My approach combines deep technical understanding with relationship-driven recruiting.",
    stats: {
        placements: 142,
        successRate: 94,
        avgTimeToFill: 28,
        rating: 4.9,
        totalEarnings: "$2.4M",
        networkSize: 3200,
    },
    specializations: ["Frontend Engineering", "Full Stack", "Engineering Management", "DevOps", "AI/ML", "System Design"],
    certifications: ["AIRS CIR", "LinkedIn Recruiter Certified", "Sourcing Certified"],
    experience: [
        { period: "2021 - Present", role: "Senior Technical Recruiter", company: "TechTalent Partners", desc: "Leading the West Coast engineering practice. 142 placements at companies including Stripe, Figma, Vercel, and OpenAI." },
        { period: "2018 - 2021", role: "Technical Recruiter", company: "Elite Search Group", desc: "Built the frontend engineering specialization from scratch. Grew placement volume 3x in 2 years." },
        { period: "2016 - 2018", role: "Recruiting Coordinator", company: "Apex Talent Solutions", desc: "Started career in recruiting operations. Managed interview scheduling and candidate communications for 50+ roles." },
    ],
    recentActivity: [
        { time: "2h ago", action: "Placed candidate", detail: "Tom Baker at Stripe - Frontend Lead", icon: "fa-handshake" },
        { time: "5h ago", action: "Submitted candidate", detail: "Lisa Chen for Notion - Staff Engineer", icon: "fa-paper-plane" },
        { time: "1d ago", action: "New connection", detail: "Connected with David Park - CTO at Linear", icon: "fa-user-plus" },
        { time: "2d ago", action: "Earned badge", detail: "Top 10% Recruiter - Q1 2026", icon: "fa-trophy" },
        { time: "3d ago", action: "Published insight", detail: "Engineering Salary Trends - Bay Area 2026", icon: "fa-pen-to-square" },
        { time: "1w ago", action: "Completed training", detail: "AI-Assisted Sourcing Masterclass", icon: "fa-graduation-cap" },
    ],
    topPlacements: [
        { candidate: "James Wilson", role: "Senior Engineer", company: "Stripe", salary: "$240K", year: "2026" },
        { candidate: "Priya Patel", role: "Staff Engineer", company: "OpenAI", salary: "$310K", year: "2025" },
        { candidate: "Alex Rivera", role: "Eng Manager", company: "Figma", salary: "$280K", year: "2025" },
    ],
    relatedProfiles: [
        { name: "David Chen", role: "Design Recruiter", initials: "DC", placements: 98 },
        { name: "Maria Garcia", role: "AI/ML Recruiter", initials: "MG", placements: 67 },
        { name: "James Park", role: "Executive Search", initials: "JP", placements: 215 },
    ],
};

type ProfileTab = "overview" | "placements" | "activity";

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function ProfilesThreePage() {
    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);
        const tl = gsap.timeline({ defaults: { ease: E.precise } });
        tl.fromTo($1(".profile-avatar"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: D.normal });
        tl.fromTo($1(".profile-name"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: D.normal }, "-=0.2");
        tl.fromTo($(".profile-meta"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.04 }, "-=0.2");
        tl.fromTo($(".stat-card"), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: D.fast, stagger: 0.05 }, "-=0.1");
        $(".scroll-section").forEach((s) => {
            gsap.fromTo(s, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: D.normal, ease: E.precise, scrollTrigger: { trigger: s, start: "top 88%" } });
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="bg-base-100 text-base-content min-h-screen">
            {/* ── PROFILE HEADER ──────────────────────────────── */}
            <header className="border-b-2 border-neutral">
                <div className="px-6 lg:px-12 pt-10 pb-6">
                    <div className="flex items-center gap-2 mb-6 text-[9px] uppercase tracking-[0.2em] font-bold text-base-content/25">
                        <span className="hover:text-base-content cursor-pointer transition-colors">Network</span>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[7px]" />
                        <span className="hover:text-base-content cursor-pointer transition-colors">Recruiters</span>
                        <i className="fa-duotone fa-regular fa-chevron-right text-[7px]" />
                        <span className="text-base-content/50">{profile.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                        <div className="profile-avatar opacity-0 w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black flex-shrink-0">
                            {profile.initials}
                        </div>
                        <div className="profile-name opacity-0 flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl lg:text-4xl font-black tracking-tight">{profile.name}</h1>
                                <span className="px-2 py-0.5 bg-success/10 text-success text-[8px] uppercase tracking-[0.2em] font-black">
                                    Verified
                                </span>
                            </div>
                            <p className="text-sm text-base-content/40 mb-3">{profile.title} at {profile.agency}</p>
                            <div className="flex flex-wrap items-center gap-4">
                                {[
                                    { icon: "fa-location-dot", text: profile.location },
                                    { icon: "fa-envelope", text: profile.email },
                                    { icon: "fa-phone", text: profile.phone },
                                ].map((item, i) => (
                                    <span key={i} className="profile-meta opacity-0 flex items-center gap-1.5 text-[10px] text-base-content/30">
                                        <i className={`fa-duotone fa-regular ${item.icon} text-xs`} />
                                        {item.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-[2px] flex-shrink-0">
                            <button className="profile-meta opacity-0 px-5 py-2.5 bg-neutral text-neutral-content text-[10px] uppercase tracking-[0.25em] font-black hover:bg-primary hover:text-primary-content transition-colors flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-envelope text-xs" /> Message
                            </button>
                            <button className="profile-meta opacity-0 px-4 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors">
                                <i className="fa-duotone fa-regular fa-user-plus text-xs" />
                            </button>
                            <button className="profile-meta opacity-0 px-4 py-2.5 bg-base-200 text-[10px] uppercase tracking-[0.25em] font-black text-base-content/40 hover:text-base-content transition-colors">
                                <i className="fa-duotone fa-regular fa-share text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-[2px] bg-neutral/10">
                        {[
                            { value: profile.stats.placements.toString(), label: "Placements" },
                            { value: `${profile.stats.successRate}%`, label: "Success Rate" },
                            { value: `${profile.stats.avgTimeToFill}d`, label: "Avg Fill Time" },
                            { value: profile.stats.rating.toString(), label: "Rating" },
                            { value: profile.stats.totalEarnings, label: "Total Earned" },
                            { value: profile.stats.networkSize.toLocaleString(), label: "Network" },
                        ].map((stat) => (
                            <div key={stat.label} className="stat-card opacity-0 bg-base-100 py-4 px-3 text-center">
                                <div className="text-lg font-black tracking-tighter">{stat.value}</div>
                                <div className="text-[7px] uppercase tracking-[0.2em] text-base-content/25 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── TABS ───────────────────────────────────────── */}
            <div className="border-b border-neutral/10 px-6 lg:px-12">
                <div className="flex gap-0">
                    {(["overview", "placements", "activity"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${activeTab === tab ? "text-base-content border-b-2 border-neutral -mb-[1px]" : "text-base-content/30 hover:text-base-content"}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONTENT ────────────────────────────────────── */}
            <div className="px-6 lg:px-12 py-10">
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8">
                        {activeTab === "overview" && (
                            <div className="space-y-8">
                                <div className="scroll-section">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">01</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">About</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <p className="text-sm text-base-content/50 leading-relaxed">{profile.bio}</p>
                                </div>

                                <div className="scroll-section">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">02</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Specializations</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <div className="flex flex-wrap gap-[2px]">
                                        {profile.specializations.map((s) => (
                                            <span key={s} className="px-3 py-2 bg-base-200 text-[10px] uppercase tracking-[0.15em] font-bold text-base-content/50">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="scroll-section">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">03</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Experience</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <div className="space-y-0">
                                        {profile.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-4 py-4 border-b border-base-300 last:border-0">
                                                <div className="w-10 text-center flex-shrink-0">
                                                    <span className="text-lg font-black tracking-tighter text-neutral/10">{String(i + 1).padStart(2, "0")}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-base-content/25 uppercase tracking-[0.15em] mb-1">{exp.period}</p>
                                                    <h4 className="text-sm font-bold tracking-tight">{exp.role}</h4>
                                                    <p className="text-[10px] text-base-content/30 mb-1">{exp.company}</p>
                                                    <p className="text-xs text-base-content/40 leading-relaxed">{exp.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="scroll-section">
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">04</span>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Certifications</p>
                                    </div>
                                    <div className="h-[1px] bg-neutral/10 mb-4" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[2px] bg-neutral/10">
                                        {profile.certifications.map((cert) => (
                                            <div key={cert} className="bg-base-100 p-4 flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-certificate text-base-content/15" />
                                                <span className="text-xs font-bold tracking-tight">{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "placements" && (
                            <div className="scroll-section">
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">142</span>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Total Placements</p>
                                </div>
                                <p className="text-[9px] uppercase tracking-[0.25em] text-base-content/25 font-bold mb-3">Top Placements</p>
                                <div className="space-y-[2px] bg-neutral/10">
                                    {profile.topPlacements.map((p) => (
                                        <div key={p.candidate} className="bg-base-100 p-4 flex items-center gap-4">
                                            <div className="w-9 h-9 bg-base-200 flex items-center justify-center text-[10px] font-black text-base-content/30">
                                                {p.candidate.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold tracking-tight">{p.candidate}</div>
                                                <div className="text-[10px] text-base-content/30">{p.role} at {p.company}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black tracking-tight">{p.salary}</div>
                                                <div className="text-[8px] text-base-content/20 uppercase">{p.year}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "activity" && (
                            <div className="scroll-section">
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-3xl font-black tracking-tighter text-neutral/8 select-none">TL</span>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/30 font-bold pb-0.5">Recent Activity</p>
                                </div>
                                <div className="space-y-0">
                                    {profile.recentActivity.map((a, i) => (
                                        <div key={i} className="flex gap-4 py-4 border-b border-base-300 last:border-0">
                                            <div className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0">
                                                <i className={`fa-duotone fa-regular ${a.icon} text-xs text-base-content/30`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold tracking-tight">{a.action}</span>
                                                </div>
                                                <p className="text-xs text-base-content/40">{a.detail}</p>
                                            </div>
                                            <span className="text-[9px] text-base-content/20 uppercase tracking-[0.1em] whitespace-nowrap">{a.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="scroll-section border-2 border-neutral/10">
                            <div className="px-5 py-4 border-b border-base-300">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold">Similar Recruiters</p>
                            </div>
                            {profile.relatedProfiles.map((rp) => (
                                <div key={rp.name} className="px-5 py-4 border-b border-base-300 last:border-0 hover:bg-base-200/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-base-200 flex items-center justify-center text-[9px] font-black text-base-content/30">{rp.initials}</div>
                                        <div>
                                            <div className="text-xs font-bold tracking-tight">{rp.name}</div>
                                            <div className="text-[9px] text-base-content/30">{rp.role} / {rp.placements} placements</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="scroll-section border-2 border-neutral/10 p-5">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-base-content/30 font-bold mb-3">Quick Actions</p>
                            <div className="space-y-[2px]">
                                {[
                                    { icon: "fa-paper-plane", label: "Send a split-fee proposal" },
                                    { icon: "fa-calendar", label: "Schedule a call" },
                                    { icon: "fa-star", label: "Leave a review" },
                                    { icon: "fa-flag", label: "Report profile" },
                                ].map((action) => (
                                    <button key={action.label} className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors">
                                        <i className={`fa-duotone fa-regular ${action.icon} text-xs w-4 text-center`} />
                                        <span className="text-[10px] font-bold tracking-tight">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
