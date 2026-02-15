"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const profile = {
    name: "Marcus Chen",
    title: "Senior Technical Recruiter",
    location: "San Francisco, CA",
    email: "m.chen@splitsnetwork.com",
    joined: "Jan 2024",
    status: "ACTIVE",
    clearance: "LEVEL_3",
    stats: {
        placements: 47,
        activeRoles: 12,
        avgTimeToFill: "18d",
        successRate: "94%",
        networkSize: 2340,
        revenue: "$1.2M",
    },
    bio: "Specialized in placing senior engineering talent across fintech, AI/ML, and enterprise SaaS. 8+ years of experience in technical recruiting with a focus on building long-term relationships with both candidates and hiring managers. Known for deep technical understanding and high placement retention rates.",
    skills: [
        "Technical Recruiting",
        "Executive Search",
        "AI/ML Talent",
        "Fintech",
        "SaaS",
        "Compensation Negotiation",
        "Pipeline Development",
        "Employer Branding",
    ],
    experience: [
        {
            role: "Senior Technical Recruiter",
            company: "Splits Network",
            period: "2024 - Present",
            description: "Leading split-fee recruiting operations for enterprise tech clients.",
        },
        {
            role: "Technical Recruiter",
            company: "TalentForge Inc.",
            period: "2021 - 2024",
            description: "Managed full-cycle recruiting for Series B-D startups in the Bay Area.",
        },
        {
            role: "Recruiting Coordinator",
            company: "Apex Talent Solutions",
            period: "2018 - 2021",
            description: "Coordinated high-volume technical hiring pipelines for enterprise clients.",
        },
    ],
    activity: [
        { action: "Placed candidate", detail: "Sarah Kim → Staff Engineer at Meridian Labs", time: "2h ago", type: "success" },
        { action: "Submitted proposal", detail: "3 candidates for Senior PM role at Vertex AI", time: "5h ago", type: "info" },
        { action: "Role assigned", detail: "Lead Backend Engineer at Prism Financial", time: "1d ago", type: "info" },
        { action: "Placement confirmed", detail: "David Park → Engineering Manager at NovaTech", time: "3d ago", type: "success" },
        { action: "Proposal declined", detail: "2 candidates for DevOps Lead at CloudScale", time: "5d ago", type: "warning" },
    ],
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfilesSevenPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "experience">("overview");

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".bp-profile-ref", { opacity: 0 }, { opacity: 1, duration: 0.25 });
            tl.fromTo(".bp-profile-title", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, "-=0.1");
            tl.fromTo(".bp-profile-avatar", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }, "-=0.3");
            tl.fromTo(".bp-profile-stat", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.2");
            tl.fromTo(".bp-profile-section", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 }, "-=0.2");
            gsap.to(".bp-pulse-dot", { opacity: 0.3, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
        { scope: containerRef },
    );

    const tabs = [
        { key: "overview" as const, label: "OVERVIEW" },
        { key: "activity" as const, label: "ACTIVITY_LOG" },
        { key: "experience" as const, label: "EXPERIENCE" },
    ];

    return (
        <>
            <style jsx global>{`
                .bp-grid-bg {
                    background-image: linear-gradient(rgba(59, 92, 204, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 92, 204, 0.3) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            <div ref={containerRef} className="min-h-screen bg-[#0a0e17] text-[#c8ccd4] relative">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-10 relative z-10">
                    {/* ═══ Header ═══ */}
                    <div className="bp-profile-ref flex justify-between items-center mb-6 opacity-0">
                        <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest">REF: SN-PROF07-2026</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[#c8ccd4]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] bp-pulse-dot"></span>
                            PROFILE_VIEW
                        </div>
                    </div>

                    <h1 className="bp-profile-title text-3xl md:text-4xl font-bold text-white mb-2 opacity-0">
                        Recruiter <span className="text-[#3b5ccc]">Profile</span>
                    </h1>
                    <p className="font-mono text-xs text-[#c8ccd4]/40 tracking-wider mb-10">// OPERATOR DOSSIER</p>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* ═══ Left Column - Profile Card ═══ */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Avatar Card */}
                            <div className="bp-profile-avatar border border-[#3b5ccc]/15 opacity-0">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    IDENTITY_MODULE
                                </div>
                                <div className="p-6 text-center">
                                    <div className="w-24 h-24 border-2 border-[#3b5ccc]/30 mx-auto mb-4 flex items-center justify-center bg-[#3b5ccc]/5 relative">
                                        <span className="text-3xl font-bold text-[#3b5ccc]">MC</span>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#22c55e] border border-[#0a0e17] flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-check text-[8px] text-white"></i>
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                                    <p className="text-sm text-[#c8ccd4]/40 mt-1">{profile.title}</p>
                                    <div className="flex items-center justify-center gap-1 mt-2 font-mono text-[10px] text-[#c8ccd4]/30">
                                        <i className="fa-duotone fa-regular fa-location-dot text-[8px]"></i>
                                        {profile.location}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#3b5ccc]/10 flex justify-center gap-2">
                                        <span className="px-2 py-1 border border-[#22c55e]/30 bg-[#22c55e]/5 font-mono text-[9px] text-[#22c55e]/70 tracking-wider">
                                            {profile.status}
                                        </span>
                                        <span className="px-2 py-1 border border-[#3b5ccc]/30 bg-[#3b5ccc]/5 font-mono text-[9px] text-[#3b5ccc]/70 tracking-wider">
                                            {profile.clearance}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bp-profile-section border border-[#3b5ccc]/15 opacity-0">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    CONTACT_DATA
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-envelope text-xs text-[#3b5ccc]/30 w-4"></i>
                                        <span className="font-mono text-xs text-[#c8ccd4]/50">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="fa-duotone fa-regular fa-calendar text-xs text-[#3b5ccc]/30 w-4"></i>
                                        <span className="font-mono text-xs text-[#c8ccd4]/50">Joined {profile.joined}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bp-profile-section border border-[#3b5ccc]/15 opacity-0">
                                <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                    SKILL_MATRIX
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1.5 border border-[#3b5ccc]/15 bg-[#3b5ccc]/5 font-mono text-[10px] text-[#3b5ccc]/60 tracking-wider hover:border-[#3b5ccc]/30 hover:text-[#3b5ccc] transition-colors cursor-default"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bp-profile-section border border-[#3b5ccc]/15 opacity-0">
                                <div className="p-6 space-y-2">
                                    <button className="w-full px-5 py-2.5 bg-[#3b5ccc] text-white font-mono text-[10px] tracking-widest hover:bg-[#3b5ccc]/90 transition-colors border border-[#3b5ccc]">
                                        <i className="fa-duotone fa-regular fa-handshake text-[8px] mr-2"></i>
                                        INITIATE_SPLIT
                                    </button>
                                    <button className="w-full px-5 py-2.5 border border-[#c8ccd4]/15 text-[#c8ccd4]/40 font-mono text-[10px] tracking-widest hover:text-white hover:border-[#3b5ccc]/30 transition-colors">
                                        <i className="fa-duotone fa-regular fa-message text-[8px] mr-2"></i>
                                        SEND_MESSAGE
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══ Right Column - Content ═══ */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-[#3b5ccc]/10">
                                {[
                                    { label: "PLACEMENTS", value: profile.stats.placements },
                                    { label: "ACTIVE_ROLES", value: profile.stats.activeRoles },
                                    { label: "AVG_FILL", value: profile.stats.avgTimeToFill },
                                    { label: "SUCCESS_%", value: profile.stats.successRate },
                                    { label: "NETWORK", value: profile.stats.networkSize.toLocaleString() },
                                    { label: "REVENUE", value: profile.stats.revenue },
                                ].map((stat) => (
                                    <div key={stat.label} className="bp-profile-stat bg-[#0a0e17] p-4 text-center opacity-0">
                                        <div className="text-xl font-bold text-white">{stat.value}</div>
                                        <div className="font-mono text-[8px] text-[#3b5ccc]/40 tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="bp-profile-section opacity-0">
                                <div className="flex border-b border-[#3b5ccc]/10">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`px-6 py-3 font-mono text-[10px] tracking-widest transition-colors relative ${
                                                activeTab === tab.key ? "text-[#3b5ccc]" : "text-[#c8ccd4]/30 hover:text-[#c8ccd4]/60"
                                            }`}
                                        >
                                            {tab.label}
                                            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-px bg-[#3b5ccc]"></div>}
                                        </button>
                                    ))}
                                </div>

                                {/* Overview Tab */}
                                {activeTab === "overview" && (
                                    <div className="border border-[#3b5ccc]/15 border-t-0">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            BIO_MODULE
                                        </div>
                                        <div className="p-6">
                                            <p className="text-sm text-[#c8ccd4]/50 leading-relaxed">{profile.bio}</p>
                                        </div>
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-t border-b border-[#3b5ccc]/10">
                                            SPECIALIZATION_MATRIX
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: "Primary Sector", value: "Enterprise Technology" },
                                                    { label: "Secondary Sector", value: "Fintech / AI" },
                                                    { label: "Seniority Focus", value: "Senior to C-Level" },
                                                    { label: "Avg. Deal Size", value: "$25,500" },
                                                ].map((item) => (
                                                    <div key={item.label}>
                                                        <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-widest mb-1">{item.label}</div>
                                                        <div className="text-sm text-white">{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Activity Tab */}
                                {activeTab === "activity" && (
                                    <div className="border border-[#3b5ccc]/15 border-t-0">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            ACTIVITY_FEED // RECENT
                                        </div>
                                        <div className="divide-y divide-[#3b5ccc]/10">
                                            {profile.activity.map((item, idx) => (
                                                <div key={idx} className="px-6 py-4 flex items-start gap-4 hover:bg-[#3b5ccc]/5 transition-colors">
                                                    <div
                                                        className={`w-2 h-2 mt-1.5 flex-shrink-0 ${
                                                            item.type === "success"
                                                                ? "bg-[#22c55e]"
                                                                : item.type === "warning"
                                                                  ? "bg-[#eab308]"
                                                                  : "bg-[#3b5ccc]"
                                                        }`}
                                                    ></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-white">{item.action}</div>
                                                        <div className="text-xs text-[#c8ccd4]/30 mt-0.5">{item.detail}</div>
                                                    </div>
                                                    <div className="font-mono text-[9px] text-[#c8ccd4]/20 tracking-wider flex-shrink-0">{item.time}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience Tab */}
                                {activeTab === "experience" && (
                                    <div className="border border-[#3b5ccc]/15 border-t-0">
                                        <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest px-6 py-3 border-b border-[#3b5ccc]/10">
                                            CAREER_TIMELINE
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {profile.experience.map((exp, idx) => (
                                                <div key={idx} className="relative pl-6 border-l border-[#3b5ccc]/15">
                                                    <div className="absolute left-0 top-0 w-2 h-2 bg-[#3b5ccc] -translate-x-[4.5px]"></div>
                                                    <div className="font-mono text-[9px] text-[#3b5ccc]/40 tracking-widest mb-1">{exp.period}</div>
                                                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                                                    <div className="text-xs text-[#14b8a6]/60 mt-0.5">{exp.company}</div>
                                                    <p className="text-xs text-[#c8ccd4]/30 mt-2 leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
