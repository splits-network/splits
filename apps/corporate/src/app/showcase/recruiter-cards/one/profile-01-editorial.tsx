"use client";

import { useState } from "react";
import { SAMPLE_PROFILE, type RecruiterProfileData } from "./profile-data";

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function HeroHeader({ profile }: { profile: RecruiterProfileData }) {
    return (
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />
            <div className="relative px-8 pt-10 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40">
                        {profile.firm}
                    </p>
                    <div className="flex items-center gap-4">
                        {profile.verified && (
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                                <i className="fa-duotone fa-regular fa-badge-check text-sm" />
                                Verified
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                            <span className={`inline-block w-2 h-2 ${profile.online ? "bg-success" : "bg-neutral-content/20"}`} />
                            <span className={profile.online ? "text-success" : "text-neutral-content/30"}>
                                {profile.online ? "Online" : "Away"}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                    <div className="flex items-end gap-5 flex-1">
                        <div className="shrink-0 w-20 h-20 lg:w-24 lg:h-24 bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-black tracking-tight select-none">
                            {profile.initials}
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1">
                                {profile.title}
                            </p>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-neutral-content mb-3">
                                {profile.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                    {profile.location}
                                </span>
                                <span className="text-neutral-content/20">|</span>
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                    Member since {profile.memberSince}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-2 pb-1 shrink-0">
                        <button className="btn btn-primary btn-sm font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-comments" />
                            Message
                        </button>
                        <button className="btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-user-plus" />
                            Connect
                        </button>
                        <button className="btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-8">
                    {profile.stats.map((stat, i) => {
                        const iconStyles = [
                            "bg-primary text-primary-content",
                            "bg-secondary text-secondary-content",
                            "bg-accent text-accent-content",
                            "bg-warning text-warning-content",
                        ];
                        const iconStyle = iconStyles[i % iconStyles.length];
                        return (
                            <div key={stat.label} className="flex items-center gap-3 px-4 py-4">
                                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                    <i className={`${stat.icon} text-base`} />
                                </div>
                                <div>
                                    <span className="text-xl font-black text-neutral-content leading-none block">{stat.value}</span>
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">{stat.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}

/* ─── Tab nav ────────────────────────────────────────────────────────────── */

type TabKey = "about" | "experience" | "reviews";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "about", label: "About", icon: "fa-duotone fa-regular fa-user" },
    { key: "experience", label: "Experience", icon: "fa-duotone fa-regular fa-briefcase" },
    { key: "reviews", label: "Reviews", icon: "fa-duotone fa-regular fa-star" },
];

function TabNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
    return (
        <nav className="bg-base-100 border-b border-base-300">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex gap-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onChange(tab.key)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] border-b-2 transition-colors ${
                                active === tab.key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-base-content/40 hover:text-base-content/60 hover:border-base-300"
                            }`}
                        >
                            <i className={`${tab.icon} text-sm`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

/* ─── About panel ────────────────────────────────────────────────────────── */

function AboutPanel({ profile }: { profile: RecruiterProfileData }) {
    return (
        <div className="space-y-10">
            {/* Bio */}
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    About
                </p>
                <p className="text-base text-base-content/70 leading-relaxed">
                    {profile.bio}
                </p>
            </div>

            {/* Specializations */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Specializations
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                    {profile.specializations.map((spec) => (
                        <span key={spec} className="px-3 py-1.5 bg-primary text-primary-content text-xs font-bold uppercase tracking-wider">
                            {spec}
                        </span>
                    ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Industries
                </p>
                <div className="flex flex-wrap gap-2">
                    {profile.industries.map((ind) => (
                        <span key={ind} className="px-3 py-1.5 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60">
                            {ind}
                        </span>
                    ))}
                </div>
            </div>

            {/* Partnership signals */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${profile.seekingSplits ? "bg-primary text-primary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-handshake text-sm" />
                        Seeking Splits
                    </span>
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${profile.acceptsCandidates ? "bg-secondary text-secondary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-user-plus text-sm" />
                        Accepts Candidates
                    </span>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Recent Activity
                </p>
                <div className="divide-y divide-base-300 border border-base-300">
                    {profile.recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                            <i className={`${item.icon} ${item.color} text-base w-4 text-center shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-base-content/80">{item.action}</p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 shrink-0">
                                {item.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Experience panel ───────────────────────────────────────────────────── */

function ExperiencePanel({ profile }: { profile: RecruiterProfileData }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-8">
                Career History
            </p>
            <div className="space-y-0">
                {profile.experience.map((exp, i) => (
                    <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                        {/* Timeline connector */}
                        {i < profile.experience.length - 1 && (
                            <div className="absolute left-[17px] top-11 bottom-0 w-px bg-base-300" />
                        )}

                        {/* Icon node */}
                        <div className="w-9 h-9 bg-primary text-primary-content flex items-center justify-center shrink-0">
                            <i className="fa-duotone fa-regular fa-briefcase text-xs" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 border-l-4 border-l-base-300 pl-5 -ml-1">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                {exp.period}
                            </p>
                            <h3 className="text-base font-black tracking-tight text-base-content leading-tight">
                                {exp.title}
                            </h3>
                            <p className="text-sm font-bold text-primary mb-2">{exp.company}</p>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {exp.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Reviews panel ──────────────────────────────────────────────────────── */

function ReviewsPanel({ profile }: { profile: RecruiterProfileData }) {
    return (
        <div>
            <div className="flex items-end justify-between mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30">
                    Client Testimonials
                </p>
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <i key={n} className="fa-duotone fa-regular fa-star text-warning text-sm" />
                    ))}
                    <span className="ml-2 text-sm font-black text-base-content">
                        {profile.stats.find((s) => s.label === "Rating")?.value}
                    </span>
                </div>
            </div>
            <div className="space-y-6">
                {profile.testimonials.map((t, i) => (
                    <blockquote key={i} className="bg-base-200 border-l-4 border-l-primary px-7 py-6">
                        <i className="fa-duotone fa-regular fa-quote-left text-2xl text-primary/20 mb-4 block" />
                        <p className="text-base text-base-content/70 leading-relaxed italic mb-5">
                            &ldquo;{t.text}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-secondary text-secondary-content flex items-center justify-center font-black text-xs shrink-0">
                                {t.initials}
                            </div>
                            <div>
                                <p className="text-sm font-black text-base-content">{t.author}</p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                                    {t.role}
                                </p>
                            </div>
                        </div>
                    </blockquote>
                ))}
            </div>
        </div>
    );
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

function Sidebar({ profile }: { profile: RecruiterProfileData }) {
    const contactItems = [
        { icon: "fa-duotone fa-regular fa-envelope", label: "Email", value: profile.email },
        { icon: "fa-duotone fa-regular fa-phone", label: "Phone", value: profile.phone },
        { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", value: profile.linkedin },
    ];

    return (
        <aside className="space-y-6">
            {/* Contact card */}
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Contact
                    </p>
                </div>
                <div className="divide-y divide-base-300">
                    {contactItems.map((c) => (
                        <div key={c.label} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                <i className={`${c.icon} text-primary text-xs`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                    {c.label}
                                </p>
                                <p className="text-sm font-semibold text-base-content truncate">
                                    {c.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 pb-5 pt-4">
                    <button className="btn btn-primary btn-sm w-full font-bold uppercase tracking-wider">
                        <i className="fa-duotone fa-regular fa-comments" />
                        Send Message
                    </button>
                </div>
            </div>

            {/* Badges card */}
            <div className="bg-base-200 border border-base-300">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Earned Badges
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-px bg-base-300">
                    {profile.badges.map((badge) => (
                        <div key={badge.label} className="flex flex-col items-center gap-2 bg-base-200 px-4 py-5">
                            <i className={`${badge.icon} ${badge.color} text-xl`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 text-center leading-tight">
                                {badge.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Network stats card */}
            <div className="bg-base-200 border border-base-300">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Network Activity
                    </p>
                </div>
                <div className="divide-y divide-base-300">
                    {[
                        { label: "Response Rate", value: "98%", icon: "fa-duotone fa-regular fa-reply" },
                        { label: "Avg Response Time", value: "< 2 hrs", icon: "fa-duotone fa-regular fa-clock" },
                        { label: "Active Since", value: profile.memberSince, icon: "fa-duotone fa-regular fa-calendar" },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between px-6 py-3.5">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/40">
                                <i className={`${item.icon} text-xs`} />
                                {item.label}
                            </span>
                            <span className="text-sm font-black text-base-content">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Profile01() {
    const profile = SAMPLE_PROFILE;
    const [activeTab, setActiveTab] = useState<TabKey>("about");

    return (
        <main className="min-h-screen bg-base-100">
            <HeroHeader profile={profile} />
            <TabNav active={activeTab} onChange={setActiveTab} />

            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                    {/* Main content */}
                    <div className="lg:col-span-3">
                        {activeTab === "about" && <AboutPanel profile={profile} />}
                        {activeTab === "experience" && <ExperiencePanel profile={profile} />}
                        {activeTab === "reviews" && <ReviewsPanel profile={profile} />}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        <Sidebar profile={profile} />
                    </div>
                </div>
            </div>
        </main>
    );
}
