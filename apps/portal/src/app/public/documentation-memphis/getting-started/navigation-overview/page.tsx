import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { NavigationAnimator } from "./navigation-animator";

export const metadata = getDocMetadata("getting-started/navigation-overview");

// ─── Data ────────────────────────────────────────────────────────────────────

const sidebarSections = [
    {
        title: "Management",
        icon: "fa-duotone fa-regular fa-grid-2",
        items: [
            { name: "Dashboard", description: "Activity feed, metrics at a glance, quick actions", icon: "fa-duotone fa-regular fa-gauge-high" },
            { name: "Roles", description: "Create, publish, and track job opportunities", icon: "fa-duotone fa-regular fa-briefcase" },
            { name: "Candidates", description: "Manage candidate profiles and sourcing data", icon: "fa-duotone fa-regular fa-users" },
            { name: "Applications", description: "Track submissions through hiring stages", icon: "fa-duotone fa-regular fa-clipboard-check" },
            { name: "Invitations", description: "Invite recruiters and teammates to collaborate", icon: "fa-duotone fa-regular fa-envelope-open" },
            { name: "Messages", description: "Real-time conversations with collaborators", icon: "fa-duotone fa-regular fa-comments" },
            { name: "Placements", description: "Track hires, fees, and recruiter earnings", icon: "fa-duotone fa-regular fa-trophy" },
        ],
        accent: "error",
    },
    {
        title: "Settings",
        icon: "fa-duotone fa-regular fa-sliders",
        items: [
            { name: "Profile", description: "Your personal details, bio, and visibility", icon: "fa-duotone fa-regular fa-user" },
            { name: "Billing", description: "Subscription plans and payment methods", icon: "fa-duotone fa-regular fa-credit-card" },
            { name: "Company Settings", description: "Organization profile, branding, preferences", icon: "fa-duotone fa-regular fa-building" },
            { name: "Team Management", description: "Member roles, access levels, invitations", icon: "fa-duotone fa-regular fa-people-group" },
            { name: "Notifications", description: "Alert preferences and delivery channels", icon: "fa-duotone fa-regular fa-bell" },
        ],
        accent: "success",
    },
];

const mobileDockItems = [
    { name: "Dashboard", icon: "fa-duotone fa-regular fa-gauge-high", description: "Your home base" },
    { name: "Roles", icon: "fa-duotone fa-regular fa-briefcase", description: "Job opportunities" },
    { name: "Candidates", icon: "fa-duotone fa-regular fa-users", description: "People in your pipeline" },
    { name: "Applications", icon: "fa-duotone fa-regular fa-clipboard-check", description: "Active submissions" },
    { name: "Messages", icon: "fa-duotone fa-regular fa-comments", description: "Conversations" },
    { name: "More", icon: "fa-duotone fa-regular fa-ellipsis", description: "Everything else" },
];

const shortcuts = [
    { keys: ["Ctrl", "K"], action: "Open global search", context: "Find anything fast" },
    { keys: ["G", "then", "D"], action: "Go to Dashboard", context: "Quick jump" },
    { keys: ["G", "then", "R"], action: "Go to Roles", context: "Quick jump" },
    { keys: ["G", "then", "C"], action: "Go to Candidates", context: "Quick jump" },
    { keys: ["G", "then", "M"], action: "Go to Messages", context: "Quick jump" },
    { keys: ["N"], action: "New item (context-aware)", context: "Creates role, candidate, etc." },
    { keys: ["?"], action: "Show keyboard shortcuts", context: "This reference" },
];

const roleNavDifferences = [
    {
        role: "Recruiter",
        sees: ["Dashboard", "Roles (assigned)", "Candidates", "Applications", "Messages", "Placements", "Profile"],
        doesNotSee: ["Company Settings", "Team Management", "Billing", "Invitations (send)"],
        accent: "error",
    },
    {
        role: "Hiring Manager",
        sees: ["Dashboard", "Roles (owned)", "Candidates", "Applications", "Messages", "Invitations", "Team Management"],
        doesNotSee: ["Placements (recruiter view)", "Billing"],
        accent: "warning",
    },
    {
        role: "Company Admin",
        sees: ["Everything", "Company Settings", "Billing", "Team Management", "All Roles", "All Applications"],
        doesNotSee: ["Nothing hidden -- full access"],
        accent: "success",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NavigationOverviewMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("getting-started/navigation-overview")} id="docs-navigation-overview-jsonld" />
            <NavigationAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-16 h-16 rounded-full border-[4px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[10%] w-14 h-14 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[12%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-12 h-12 rotate-12 bg-warning opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[40%] w-16 h-6 -rotate-6 border-[3px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[60%] left-[35%] w-6 h-6 rotate-45 bg-error opacity-0" />
                        {/* Compass SVG */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="36" height="36" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-warning" strokeWidth="3" />
                            <polygon points="18,4 22,18 18,22 14,18" className="fill-warning" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[55%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[72%] left-[50%] opacity-0" width="70" height="20" viewBox="0 0 70 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 70,16"
                                fill="none" className="stroke-error" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-16">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-warning">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/getting-started" className="text-base-content/50 transition-colors hover:text-warning">
                                        Getting Started
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-warning">Navigation Overview</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-warning text-warning-content">
                                    <i className="fa-duotone fa-regular fa-compass"></i>
                                    Find Your Way
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Navigation{" "}
                                <span className="relative inline-block">
                                    <span className="text-warning">Overview</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-warning" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl opacity-0">
                                Here is how you navigate Splits Network. The sidebar, mobile dock,
                                and keyboard shortcuts are designed so you never lose your place --
                                whether you are reviewing applications or managing a team of twenty recruiters.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 mt-6 opacity-0">
                                {["Recruiter", "Hiring Manager", "Company Admin"].map((role) => (
                                    <span key={role} className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    THE SIDEBAR — Structure & Sections
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Desktop
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The{" "}
                                    <span className="text-error">Sidebar</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The sidebar is your command center. It is always visible on desktop and organizes
                                    every feature into two sections: Management (where you do the work) and Settings
                                    (where you configure things). Here is what lives in each.
                                </p>
                            </div>

                            <div className="nav-cards-container grid md:grid-cols-2 gap-8">
                                {sidebarSections.map((section) => (
                                    <div
                                        key={section.title}
                                        className={`nav-card border-4 border-${section.accent} bg-base-100 opacity-0`}
                                    >
                                        {/* Section header */}
                                        <div className={`flex items-center gap-3 px-6 py-4 bg-${section.accent} text-${section.accent}-content`}>
                                            <i className={`${section.icon} text-lg`}></i>
                                            <h3 className="font-black text-lg uppercase tracking-wide">
                                                {section.title}
                                            </h3>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-base-content/10">
                                            {section.items.map((item) => (
                                                <div key={item.name} className="flex items-start gap-3 px-6 py-3">
                                                    <i className={`${item.icon} text-sm mt-0.5 text-${section.accent}`}></i>
                                                    <div>
                                                        <div className="font-bold text-sm uppercase tracking-wide text-base-content">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-base-content/50 leading-relaxed">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sidebar behavior notes */}
                            <div className="content-section mt-12 p-6 border-4 border-warning bg-warning/5 opacity-0">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-warning-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            How The Sidebar Behaves
                                        </h4>
                                        <ul className="space-y-1 text-sm text-base-content/70 leading-relaxed">
                                            <li>The sidebar collapses to icons on smaller desktop viewports. Hover to expand.</li>
                                            <li>Active pages are highlighted so you always know where you are.</li>
                                            <li>Unread message counts appear as badges next to Messages.</li>
                                            <li>Navigation items appear or disappear based on your role and permissions.</li>
                                            <li>Organization switching is at the top -- swap orgs without logging out.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    MOBILE DOCK
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Mobile
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The Mobile{" "}
                                    <span className="text-success">Dock</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    On phones and tablets the sidebar becomes a bottom dock -- a fixed bar at the bottom
                                    of the screen with the six most important destinations. Everything else is behind the
                                    &quot;More&quot; button.
                                </p>
                            </div>

                            {/* Dock visualization */}
                            <div className="nav-cards-container max-w-lg mx-auto">
                                <div className="border-4 border-success bg-base-100 rounded-t-2xl overflow-hidden">
                                    {/* Fake phone screen */}
                                    <div className="bg-base-200 h-48 flex items-center justify-center">
                                        <span className="text-sm text-base-content/30 font-bold uppercase tracking-wider">
                                            Page Content
                                        </span>
                                    </div>
                                    {/* Dock */}
                                    <div className="border-t-4 border-success bg-base-100 px-2 py-3">
                                        <div className="grid grid-cols-6 gap-1">
                                            {mobileDockItems.map((item) => (
                                                <div key={item.name} className="nav-card flex flex-col items-center gap-1 opacity-0">
                                                    <i className={`${item.icon} text-base text-success`}></i>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-base-content/70">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile dock details */}
                            <div className="mt-10 grid md:grid-cols-3 gap-4">
                                {mobileDockItems.map((item) => (
                                    <div key={item.name} className="nav-card flex items-center gap-3 p-4 border-2 border-base-content/10 bg-base-100 opacity-0">
                                        <i className={`${item.icon} text-lg text-success`}></i>
                                        <div>
                                            <div className="font-bold text-xs uppercase tracking-wide text-base-content">
                                                {item.name}
                                            </div>
                                            <div className="text-[11px] text-base-content/50">
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="content-section mt-10 p-6 border-4 border-success bg-success/5 opacity-0">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-mobile text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Mobile Tips
                                        </h4>
                                        <ul className="space-y-1 text-sm text-base-content/70 leading-relaxed">
                                            <li>The dock stays fixed at the bottom, even when you scroll.</li>
                                            <li>Tap &quot;More&quot; to access Settings, Placements, Invitations, and other pages not in the dock.</li>
                                            <li>Unread badges appear on Messages the same way they do on desktop.</li>
                                            <li>Pull-to-refresh works on most list pages (Roles, Candidates, Applications).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NAVIGATION → WORKFLOW MAPPING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Workflows
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Navigation Maps To{" "}
                                    <span className="text-warning">Work</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every sidebar item maps directly to a step in your hiring workflow.
                                    Here is how the navigation connects to what you actually do every day.
                                </p>
                            </div>

                            <div className="nav-cards-container space-y-4">
                                {[
                                    { from: "Roles", workflow: "Create or find a job opportunity, set compensation, publish it for recruiters", icon: "fa-duotone fa-regular fa-briefcase", accent: "error" },
                                    { from: "Candidates", workflow: "Source candidates, build profiles, track their history across roles", icon: "fa-duotone fa-regular fa-users", accent: "success" },
                                    { from: "Applications", workflow: "Submit candidates to roles, review submissions, move them through stages", icon: "fa-duotone fa-regular fa-clipboard-check", accent: "warning" },
                                    { from: "Invitations", workflow: "Bring recruiters onto a role, invite teammates to your organization", icon: "fa-duotone fa-regular fa-envelope-open", accent: "error" },
                                    { from: "Messages", workflow: "Coordinate with recruiters and hiring managers in real time", icon: "fa-duotone fa-regular fa-comments", accent: "success" },
                                    { from: "Placements", workflow: "Track successful hires, monitor fees, confirm payout details", icon: "fa-duotone fa-regular fa-trophy", accent: "warning" },
                                ].map((item) => (
                                    <div key={item.from} className={`nav-card flex items-center gap-5 p-5 border-l-[6px] border-${item.accent} bg-base-100 border border-base-content/10 opacity-0`}>
                                        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center bg-${item.accent}`}>
                                            <i className={`${item.icon} text-lg text-${item.accent}-content`}></i>
                                        </div>
                                        <div>
                                            <div className="font-black text-sm uppercase tracking-wide text-base-content">
                                                {item.from}
                                            </div>
                                            <div className="text-sm text-base-content/60 leading-relaxed">
                                                {item.workflow}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SEARCH & FILTERING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Speed
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Search &{" "}
                                    <span className="text-error">Filter</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Clicking through menus is fine. Searching is faster. Here is how to find
                                    exactly what you need without leaving your keyboard.
                                </p>
                            </div>

                            <div className="nav-cards-container grid md:grid-cols-2 gap-6">
                                {/* Global search */}
                                <div className="nav-card border-4 border-error bg-base-100 p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-error">
                                            <i className="fa-duotone fa-regular fa-magnifying-glass text-error-content"></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                            Global Search
                                        </h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-base-content/70 leading-relaxed">
                                        <li>Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-base-300 border border-base-content/20">Ctrl+K</kbd> to open from anywhere.</li>
                                        <li>Search across roles, candidates, applications, and messages.</li>
                                        <li>Results are filtered by your role and permissions.</li>
                                        <li>Recent searches appear when you open the search bar.</li>
                                    </ul>
                                </div>

                                {/* Page-level filtering */}
                                <div className="nav-card border-4 border-error bg-base-100 p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-error">
                                            <i className="fa-duotone fa-regular fa-filter text-error-content"></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                            Page-Level Filters
                                        </h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-base-content/70 leading-relaxed">
                                        <li>Every list page (Roles, Candidates, Applications) has filter controls.</li>
                                        <li>Filter by status, date range, assignee, or custom fields.</li>
                                        <li>Filters are server-side -- they scale to thousands of records.</li>
                                        <li>Your active filters persist until you clear them.</li>
                                    </ul>
                                </div>

                                {/* View toggles */}
                                <div className="nav-card border-4 border-error bg-base-100 p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-error">
                                            <i className="fa-duotone fa-regular fa-table-layout text-error-content"></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                            View Toggles
                                        </h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-base-content/70 leading-relaxed">
                                        <li>Switch between Table, Grid, and Split views on list pages.</li>
                                        <li>Table view shows dense, sortable columns.</li>
                                        <li>Grid view shows cards with more visual detail.</li>
                                        <li>Split view shows a list on the left and detail on the right.</li>
                                    </ul>
                                </div>

                                {/* Quick access */}
                                <div className="nav-card border-4 border-error bg-base-100 p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-error">
                                            <i className="fa-duotone fa-regular fa-bolt text-error-content"></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                            Quick Access Patterns
                                        </h3>
                                    </div>
                                    <ul className="space-y-2 text-sm text-base-content/70 leading-relaxed">
                                        <li>Dashboard widgets link directly to filtered views.</li>
                                        <li>Click any metric card to jump to the matching list.</li>
                                        <li>Notification items link directly to the relevant record.</li>
                                        <li>Message threads link to the associated role or application.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    KEYBOARD SHORTCUTS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Keyboard
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Keyboard{" "}
                                    <span className="text-success">Shortcuts</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Power users do not click. They press keys. Here are the shortcuts
                                    that will cut your navigation time in half.
                                </p>
                            </div>

                            <div className="shortcut-table border-4 border-success bg-base-100 overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-success text-success-content text-[10px] font-bold uppercase tracking-wider">
                                    <div className="col-span-3">Keys</div>
                                    <div className="col-span-5">Action</div>
                                    <div className="col-span-4">Context</div>
                                </div>

                                {/* Table rows */}
                                <div className="divide-y divide-base-content/10">
                                    {shortcuts.map((shortcut, idx) => (
                                        <div key={idx} className="shortcut-row grid grid-cols-12 gap-4 px-6 py-3 items-center opacity-0">
                                            <div className="col-span-3 flex items-center gap-1 flex-wrap">
                                                {shortcut.keys.map((key, ki) => (
                                                    key === "then"
                                                        ? <span key={ki} className="text-[10px] text-base-content/40 font-bold">then</span>
                                                        : <kbd key={ki} className="px-2 py-0.5 text-[11px] font-mono font-bold bg-base-200 border border-base-content/15 text-base-content">
                                                            {key}
                                                        </kbd>
                                                ))}
                                            </div>
                                            <div className="col-span-5 text-sm font-semibold text-base-content">
                                                {shortcut.action}
                                            </div>
                                            <div className="col-span-4 text-xs text-base-content/50">
                                                {shortcut.context}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE-SPECIFIC NAVIGATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Roles
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Each Role{" "}
                                    <span className="text-warning">Sees</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Navigation is role-aware. A recruiter sees a different sidebar than a company admin.
                                    Here is exactly what each role gets access to and what is hidden.
                                </p>
                            </div>

                            <div className="role-cards-container grid md:grid-cols-3 gap-6">
                                {roleNavDifferences.map((role) => (
                                    <div key={role.role} className={`role-card border-4 border-${role.accent} bg-base-100 opacity-0`}>
                                        {/* Role header */}
                                        <div className={`px-6 py-4 bg-${role.accent} text-${role.accent}-content`}>
                                            <h3 className="font-black text-base uppercase tracking-wide">
                                                {role.role}
                                            </h3>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            {/* Sees */}
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-success mb-2">
                                                    <i className="fa-duotone fa-regular fa-eye mr-1"></i> Can See
                                                </div>
                                                <ul className="space-y-1">
                                                    {role.sees.map((item) => (
                                                        <li key={item} className="text-xs text-base-content/70 flex items-center gap-2">
                                                            <i className="fa-duotone fa-regular fa-check text-success text-[10px]"></i>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Does not see */}
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-error mb-2">
                                                    <i className="fa-duotone fa-regular fa-eye-slash mr-1"></i> Hidden
                                                </div>
                                                <ul className="space-y-1">
                                                    {role.doesNotSee.map((item) => (
                                                        <li key={item} className="text-xs text-base-content/50 flex items-center gap-2">
                                                            <i className="fa-duotone fa-regular fa-xmark text-error text-[10px]"></i>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TIPS FOR EFFICIENT NAVIGATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Pro Tips
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Navigate{" "}
                                    <span className="text-error">Faster</span>
                                </h2>
                            </div>

                            <div className="tips-container grid md:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: "Start From Dashboard",
                                        tip: "Dashboard shows your most important items first. Use its widgets as launchpads instead of browsing the sidebar.",
                                        icon: "fa-duotone fa-regular fa-gauge-high",
                                    },
                                    {
                                        title: "Use Breadcrumbs To Go Back",
                                        tip: "Every detail page shows breadcrumbs at the top. Click them to go up one level without losing your place in the hierarchy.",
                                        icon: "fa-duotone fa-regular fa-arrow-turn-up",
                                    },
                                    {
                                        title: "Watch For Badge Counts",
                                        tip: "Unread messages and pending actions show badge counts on sidebar items. Check these first to handle what needs attention.",
                                        icon: "fa-duotone fa-regular fa-circle-1",
                                    },
                                    {
                                        title: "Bookmark Filtered Views",
                                        tip: "When you apply filters on a list page, the URL updates. Bookmark that URL to jump straight to your preferred view.",
                                        icon: "fa-duotone fa-regular fa-bookmark",
                                    },
                                    {
                                        title: "Switch Organizations Fast",
                                        tip: "If you belong to multiple organizations, use the org switcher at the top of the sidebar. No need to log out and back in.",
                                        icon: "fa-duotone fa-regular fa-arrows-rotate",
                                    },
                                    {
                                        title: "Notifications Are Actionable",
                                        tip: "Every notification links directly to the item that needs attention. Click through instead of searching for it manually.",
                                        icon: "fa-duotone fa-regular fa-bell",
                                    },
                                ].map((item) => (
                                    <div key={item.title} className="tip-card flex items-start gap-4 p-5 border-2 border-base-content/10 bg-base-100 opacity-0">
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                            <i className={`${item.icon} text-error-content`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide mb-1 text-base-content">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {item.tip}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                            </div>

                            <div className="nav-cards-container space-y-4">
                                {[
                                    {
                                        symptom: "A menu item is missing from the sidebar",
                                        cause: "Your role does not have access to that feature",
                                        fix: "Ask a company admin to update your role or permissions. Navigation items are role-based.",
                                    },
                                    {
                                        symptom: "A page opens but shows no data",
                                        cause: "Active filters or permissions are limiting results",
                                        fix: "Clear all filters at the top of the page. If still empty, confirm you belong to the correct organization.",
                                    },
                                    {
                                        symptom: "The sidebar is collapsed and I cannot see labels",
                                        cause: "The sidebar auto-collapses on narrower desktop viewports",
                                        fix: "Hover over the sidebar to temporarily expand it, or widen your browser window.",
                                    },
                                    {
                                        symptom: "I switched organizations but still see old data",
                                        cause: "Page data may not have refreshed after the org switch",
                                        fix: "Navigate to Dashboard after switching orgs. All pages will load data for the new organization.",
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="nav-card border-4 border-success bg-base-100 p-6 opacity-0">
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center bg-error text-error-content text-[10px] font-bold">!</span>
                                                <div>
                                                    <div className="font-bold text-sm text-base-content">{item.symptom}</div>
                                                    <div className="text-xs text-base-content/50 mt-1">Likely cause: {item.cause}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 pl-9">
                                                <div className="text-sm text-base-content/70">
                                                    <span className="font-bold text-success uppercase text-[10px] tracking-wider">Fix: </span>
                                                    {item.fix}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CTA — Related Pages
                   ══════════════════════════════════════════════════════════════ */}
                <section className="nav-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-warning" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-success" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-warning text-warning-content">
                                Keep Going
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                Ready To{" "}
                                <span className="text-warning">Explore?</span>
                            </h2>
                            <p className="text-lg mb-10 text-base-content/70">
                                Now that you know where everything lives, dive into the platform basics
                                or jump straight into a workflow.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href="/public/documentation-memphis/getting-started"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-warning bg-warning text-warning-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket"></i>
                                    Getting Started
                                </Link>
                                <Link
                                    href="/public/documentation-memphis/core-workflows"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-base-content text-base-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-route"></i>
                                    Core Workflows
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </NavigationAnimator>
        </>
    );
}
