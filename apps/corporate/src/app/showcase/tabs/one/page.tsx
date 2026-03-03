"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface Tab {
    key: string;
    label: string;
    icon: string;
}

/* ─── Sample Data ─────────────────────────────────────────────────────────── */

const DETAIL_TABS: Tab[] = [
    { key: "overview", label: "Overview", icon: "fa-duotone fa-regular fa-clipboard" },
    { key: "candidate", label: "Candidate", icon: "fa-duotone fa-regular fa-user" },
    { key: "role", label: "Role", icon: "fa-duotone fa-regular fa-briefcase" },
    { key: "resume", label: "Resume", icon: "fa-duotone fa-regular fa-file-user" },
    { key: "documents", label: "Documents", icon: "fa-duotone fa-regular fa-file" },
    { key: "ai_review", label: "AI Analysis", icon: "fa-duotone fa-regular fa-brain" },
    { key: "notes", label: "Notes", icon: "fa-duotone fa-regular fa-comments" },
    { key: "timeline", label: "Timeline", icon: "fa-duotone fa-regular fa-timeline" },
];

const PROFILE_TABS: Tab[] = [
    { key: "about", label: "About", icon: "fa-duotone fa-regular fa-user" },
    { key: "experience", label: "Experience", icon: "fa-duotone fa-regular fa-briefcase" },
    { key: "reviews", label: "Reviews", icon: "fa-duotone fa-regular fa-star" },
];

const SETTINGS_TABS: Tab[] = [
    { key: "general", label: "General", icon: "fa-duotone fa-regular fa-gear" },
    { key: "notifications", label: "Notifications", icon: "fa-duotone fa-regular fa-bell" },
    { key: "privacy", label: "Privacy", icon: "fa-duotone fa-regular fa-shield" },
    { key: "billing", label: "Billing", icon: "fa-duotone fa-regular fa-credit-card" },
    { key: "integrations", label: "Integrations", icon: "fa-duotone fa-regular fa-plug" },
];

const TAB_CONTENT: Record<string, { title: string; body: string }> = {
    overview: {
        title: "Application Overview",
        body: "Summary of the application status, key dates, and current pipeline stage. Shows matching score, recruiter assignment, and quick actions.",
    },
    candidate: {
        title: "Candidate Profile",
        body: "Detailed candidate information including contact details, work history, education, and skills assessment.",
    },
    role: {
        title: "Role Details",
        body: "Job description, requirements, salary range, and company information for the target position.",
    },
    resume: {
        title: "Resume & CV",
        body: "Parsed resume data with highlighted skills, experience timeline, and downloadable original document.",
    },
    documents: {
        title: "Supporting Documents",
        body: "Cover letters, portfolios, certifications, and any additional files submitted with the application.",
    },
    ai_review: {
        title: "AI Analysis",
        body: "Automated candidate-role fit analysis, skill gap identification, and interview preparation suggestions.",
    },
    notes: {
        title: "Notes & Communication",
        body: "Internal notes, recruiter comments, and communication history related to this application.",
    },
    timeline: {
        title: "Activity Timeline",
        body: "Chronological log of all actions, status changes, and milestones for this application.",
    },
    about: {
        title: "About",
        body: "Professional background, specializations, and partnership preferences. Bio and career summary.",
    },
    experience: {
        title: "Experience",
        body: "Work history, placement timelines, and career milestones with verified outcomes.",
    },
    reviews: {
        title: "Reviews",
        body: "Client testimonials, placement ratings, and peer endorsements from the network.",
    },
    general: {
        title: "General Settings",
        body: "Account preferences, display name, timezone, and language configuration.",
    },
    notifications: {
        title: "Notification Preferences",
        body: "Email, push, and in-app notification settings for applications, messages, and system alerts.",
    },
    privacy: {
        title: "Privacy & Security",
        body: "Profile visibility, data sharing preferences, two-factor authentication, and session management.",
    },
    billing: {
        title: "Billing & Subscription",
        body: "Current plan, payment methods, invoices, and usage metrics for your account.",
    },
    integrations: {
        title: "Integrations",
        body: "Connected services, API keys, webhooks, and third-party tool configurations.",
    },
};

/* ─── Scrollable Tab Bar ─────────────────────────────────────────────────── */

function ScrollableTabBar({
    tabs,
    active,
    onChange,
    badge,
}: {
    tabs: Tab[];
    active: string;
    onChange: (key: string) => void;
    badge?: Record<string, number>;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(
            el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        );
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons);
        const observer = new ResizeObserver(updateScrollButtons);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollButtons);
            observer.disconnect();
        };
    }, [updateScrollButtons]);

    const scrollTabs = useCallback((direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction === "left" ? -160 : 160,
            behavior: "smooth",
        });
    }, []);

    return (
        <div className="relative shrink-0">
            {canScrollLeft && (
                <button
                    onClick={() => scrollTabs("left")}
                    className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-r from-base-100 via-base-100 to-transparent"
                    aria-label="Scroll tabs left"
                >
                    <i className="fa-duotone fa-regular fa-chevron-left text-sm text-base-content" />
                </button>
            )}
            <div
                ref={scrollRef}
                className="overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
                data-tab-scroll
            >
                <style>{`[data-tab-scroll]::-webkit-scrollbar { display: none; }`}</style>
                <div role="tablist" className="tabs tabs-bordered min-w-max">
                    {tabs.map((tab) => (
                        <a
                            key={tab.key}
                            role="tab"
                            className={`tab ${active === tab.key ? "tab-active" : ""}`}
                            onClick={() => onChange(tab.key)}
                        >
                            <i className={`${tab.icon} mr-2`} />
                            {tab.label}
                            {badge?.[tab.key] != null && badge[tab.key] > 0 && (
                                <span className="ml-1.5 text-sm uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 bg-primary/15 text-primary">
                                    {badge[tab.key]}
                                </span>
                            )}
                        </a>
                    ))}
                </div>
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scrollTabs("right")}
                    className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1.5 bg-gradient-to-l from-base-100 via-base-100 to-transparent"
                    aria-label="Scroll tabs right"
                >
                    <i className="fa-duotone fa-regular fa-chevron-right text-sm text-base-content" />
                </button>
            )}
        </div>
    );
}

/* ─── Tab Content Panel ──────────────────────────────────────────────────── */

function TabContentPanel({ tabKey }: { tabKey: string }) {
    const content = TAB_CONTENT[tabKey];
    if (!content) return null;

    return (
        <div className="p-6 border border-base-300 border-l-4 border-l-primary bg-base-100">
            <h3 className="text-lg font-black tracking-tight mb-2">
                {content.title}
            </h3>
            <p className="text-sm text-base-content/60 leading-relaxed">
                {content.body}
            </p>
        </div>
    );
}

/* ─── Showcase Sections ──────────────────────────────────────────────────── */

function DetailTabsDemo() {
    const [active, setActive] = useState("overview");

    return (
        <div>
            <ScrollableTabBar
                tabs={DETAIL_TABS}
                active={active}
                onChange={setActive}
                badge={{ documents: 3, notes: 5 }}
            />
            <TabContentPanel tabKey={active} />
        </div>
    );
}

function ProfileTabsDemo() {
    const [active, setActive] = useState("about");

    return (
        <div>
            <div
                role="tablist"
                className="tabs tabs-border overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
                data-tab-scroll
            >
                {PROFILE_TABS.map((tab) => (
                    <a
                        key={tab.key}
                        role="tab"
                        className={`tab ${active === tab.key ? "tab-active" : ""}`}
                        onClick={() => setActive(tab.key)}
                    >
                        <i className={`${tab.icon} mr-2`} />
                        {tab.label}
                    </a>
                ))}
            </div>
            <TabContentPanel tabKey={active} />
        </div>
    );
}

function SettingsTabsDemo() {
    const [active, setActive] = useState("general");

    return (
        <div>
            <ScrollableTabBar
                tabs={SETTINGS_TABS}
                active={active}
                onChange={setActive}
            />
            <TabContentPanel tabKey={active} />
        </div>
    );
}

function VerticalTabsDemo() {
    const [active, setActive] = useState("general");

    return (
        <div className="flex flex-col sm:flex-row border border-base-300">
            <nav className="sm:w-52 shrink-0 sm:border-r border-b sm:border-b-0 border-base-300 bg-base-200">
                <div className="flex flex-col">
                    {SETTINGS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActive(tab.key)}
                            className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap border-l-4 ${
                                active === tab.key
                                    ? "bg-base-100 text-primary border-primary"
                                    : "text-base-content/50 hover:text-base-content hover:bg-base-100/50 border-transparent"
                            }`}
                        >
                            <i className={`${tab.icon} text-sm w-4 text-center`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>
            <div className="flex-1 p-6">
                <TabContentPanel tabKey={active} />
            </div>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function TabsShowcasePage() {
    const mainRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            mainRef.current
                .querySelectorAll(".showcase-section")
                .forEach((section) => {
                    gsap.fromTo(
                        section,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            ease: "power3.out",
                            clearProps: "transform",
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                            },
                        },
                    );
                });
        },
        { scope: mainRef },
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero ────────────────────────────────────────────────── */}
            <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative px-8 py-16 lg:py-20 max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">
                        Design System
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
                        Tabs
                    </h1>
                    <p className="text-base text-neutral-content/60 max-w-xl leading-relaxed">
                        Responsive tab navigation with scroll indicators, badge
                        counts, and variant layouts. Handles overflow gracefully
                        across all breakpoints.
                    </p>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-8 py-12 space-y-16">
                {/* ── 1. Scrollable Detail Tabs ──────────────────────── */}
                <section className="showcase-section opacity-0">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                            Pattern 01
                        </p>
                        <h2 className="text-2xl font-black tracking-tight mb-1">
                            Scrollable Detail Tabs
                        </h2>
                        <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                            Used in detail panels with many tabs (applications,
                            roles). Scroll arrows appear automatically when tabs
                            overflow. Supports badge counts per tab.
                        </p>
                    </div>
                    <DetailTabsDemo />

                    {/* Usage notes */}
                    <div className="mt-6 bg-base-200 border border-base-300 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                            Usage
                        </p>
                        <ul className="space-y-2 text-sm text-base-content/60">
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Uses DaisyUI <code className="text-xs bg-base-300 px-1.5 py-0.5">tabs tabs-bordered</code> as the base
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Scroll arrows auto-show via <code className="text-xs bg-base-300 px-1.5 py-0.5">ResizeObserver</code> + scroll listener
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Hidden scrollbar with <code className="text-xs bg-base-300 px-1.5 py-0.5">scrollbar-width: none</code> + webkit pseudo
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Badge counts render as <code className="text-xs bg-base-300 px-1.5 py-0.5">bg-primary/15 text-primary</code> inline chips
                            </li>
                        </ul>
                    </div>
                </section>

                {/* ── 2. Profile Tabs (Few Items) ────────────────────── */}
                <section className="showcase-section opacity-0">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                            Pattern 02
                        </p>
                        <h2 className="text-2xl font-black tracking-tight mb-1">
                            Static Profile Tabs
                        </h2>
                        <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                            Used on profile pages with 2-4 tabs that fit without
                            scrolling. Editorial underline style with uppercase
                            tracking and FontAwesome icons.
                        </p>
                    </div>
                    <ProfileTabsDemo />

                    <div className="mt-6 bg-base-200 border border-base-300 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                            Usage
                        </p>
                        <ul className="space-y-2 text-sm text-base-content/60">
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Uses DaisyUI <code className="text-xs bg-base-300 px-1.5 py-0.5">tabs tabs-border</code> with <code className="text-xs bg-base-300 px-1.5 py-0.5">tab</code> / <code className="text-xs bg-base-300 px-1.5 py-0.5">tab-active</code>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Same component as scrollable tabs, just fewer items
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Best for 2-4 tabs. Allows horizontal swipe on narrow screens to prevent overflow
                            </li>
                        </ul>
                    </div>
                </section>

                {/* ── 3. Settings / Mid-Count Tabs ───────────────────── */}
                <section className="showcase-section opacity-0">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                            Pattern 03
                        </p>
                        <h2 className="text-2xl font-black tracking-tight mb-1">
                            Scrollable Settings Tabs
                        </h2>
                        <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                            Mid-count tabs (4-6) that may overflow on smaller
                            screens. Same scrollable pattern as detail tabs,
                            without badge counts.
                        </p>
                    </div>
                    <SettingsTabsDemo />
                </section>

                {/* ── 4. Vertical / Sidebar Tabs ─────────────────────── */}
                <section className="showcase-section opacity-0">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                            Pattern 04
                        </p>
                        <h2 className="text-2xl font-black tracking-tight mb-1">
                            Vertical Sidebar Tabs
                        </h2>
                        <p className="text-sm text-base-content/50 leading-relaxed max-w-lg">
                            Settings-style layout with sidebar navigation.
                            Stays vertical on all breakpoints with
                            border-left accent on the active item.
                        </p>
                    </div>
                    <VerticalTabsDemo />

                    <div className="mt-6 bg-base-200 border border-base-300 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                            Usage
                        </p>
                        <ul className="space-y-2 text-sm text-base-content/60">
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Always vertical with <code className="text-xs bg-base-300 px-1.5 py-0.5">border-l-4 border-primary</code> active indicator
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Sidebar stacks above content on mobile, side-by-side on <code className="text-xs bg-base-300 px-1.5 py-0.5">sm:</code> and up
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fa-duotone fa-regular fa-check text-primary mt-0.5 shrink-0" />
                                Best for full-page settings and account pages with 4+ sections
                            </li>
                        </ul>
                    </div>
                </section>

                {/* ── Decision Guide ─────────────────────────────────── */}
                <section className="showcase-section opacity-0">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                            Reference
                        </p>
                        <h2 className="text-2xl font-black tracking-tight mb-1">
                            Which Pattern to Use
                        </h2>
                    </div>
                    <div className="border border-base-300">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className="text-xs font-bold uppercase tracking-wider">
                                        Tabs
                                    </th>
                                    <th className="text-xs font-bold uppercase tracking-wider">
                                        Pattern
                                    </th>
                                    <th className="text-xs font-bold uppercase tracking-wider">
                                        When
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-semibold">2-3</td>
                                    <td>Static Profile</td>
                                    <td className="text-sm text-base-content/60">
                                        Profile pages, simple detail views
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">4-6</td>
                                    <td>Scrollable</td>
                                    <td className="text-sm text-base-content/60">
                                        Settings, mid-complexity features
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">6+</td>
                                    <td>Scrollable + Badges</td>
                                    <td className="text-sm text-base-content/60">
                                        Detail panels, admin views
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">4+</td>
                                    <td>Vertical Sidebar</td>
                                    <td className="text-sm text-base-content/60">
                                        Full-page settings, account pages
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
