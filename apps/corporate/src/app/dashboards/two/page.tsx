"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Sidebar Navigation ─────────────────────────────────────────────────────── */

const navItems = [
    { icon: "fa-duotone fa-regular fa-grid-2", label: "Dashboard", active: true },
    { icon: "fa-duotone fa-regular fa-briefcase", label: "Roles", active: false },
    { icon: "fa-duotone fa-regular fa-user-tie", label: "Recruiters", active: false },
    { icon: "fa-duotone fa-regular fa-users", label: "Candidates", active: false },
    { icon: "fa-duotone fa-regular fa-building", label: "Companies", active: false },
    { icon: "fa-duotone fa-regular fa-file-lines", label: "Applications", active: false },
    { icon: "fa-duotone fa-regular fa-paper-plane", label: "Messages", active: false },
    { icon: "fa-duotone fa-regular fa-handshake", label: "Placements", active: false },
];

/* ─── Mock Data ──────────────────────────────────────────────────────────────── */

const kpis = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        value: 47,
        label: "Active Jobs",
        trend: +12,
        prefix: "",
        suffix: "",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        value: 1234,
        label: "Applications",
        trend: +8.3,
        prefix: "",
        suffix: "",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        value: 23,
        label: "Placements",
        trend: +15,
        prefix: "",
        suffix: "",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        value: 234500,
        label: "Revenue",
        trend: +22.1,
        prefix: "$",
        suffix: "",
    },
];

const applicationsOverTime = [
    { day: "Feb 1", value: 32 },
    { day: "Feb 3", value: 45 },
    { day: "Feb 5", value: 28 },
    { day: "Feb 7", value: 64 },
    { day: "Feb 9", value: 52 },
    { day: "Feb 11", value: 71 },
    { day: "Feb 13", value: 43 },
    { day: "Feb 15", value: 58 },
    { day: "Feb 17", value: 39 },
    { day: "Feb 19", value: 82 },
    { day: "Feb 21", value: 67 },
    { day: "Feb 23", value: 54 },
    { day: "Feb 25", value: 91 },
    { day: "Feb 27", value: 76 },
    { day: "Mar 1", value: 88 },
];

const jobsByStatus = [
    { status: "Open", count: 24, color: "var(--color-secondary)" },
    { status: "Filled", count: 12, color: "var(--color-primary)" },
    { status: "Pending", count: 7, color: "var(--color-warning)" },
    { status: "Closed", count: 4, color: "var(--color-base-300)" },
];

const placementsByMonth = [
    { month: "Sep", value: 4 },
    { month: "Oct", value: 6 },
    { month: "Nov", value: 3 },
    { month: "Dec", value: 8 },
    { month: "Jan", value: 5 },
    { month: "Feb", value: 7 },
];

const activityFeed = [
    {
        id: 1,
        type: "placement",
        icon: "fa-duotone fa-regular fa-trophy",
        user: "Sarah Chen",
        initials: "SC",
        action: "completed a placement",
        detail: "Senior Frontend Engineer at Meridian Corp",
        time: "12 minutes ago",
    },
    {
        id: 2,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-circle-plus",
        user: "Marcus Rivera",
        initials: "MR",
        action: "submitted an application",
        detail: "Product Manager role, Helix Dynamics",
        time: "34 minutes ago",
    },
    {
        id: 3,
        type: "job",
        icon: "fa-duotone fa-regular fa-plus-circle",
        user: "Diana Foster",
        initials: "DF",
        action: "posted a new job",
        detail: "Staff Backend Engineer, Remote, $180k-$220k",
        time: "1 hour ago",
    },
    {
        id: 4,
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        user: "James Park",
        initials: "JP",
        action: "scheduled an interview",
        detail: "Alex Kim for Data Analyst, Round 2",
        time: "2 hours ago",
    },
    {
        id: 5,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-circle-plus",
        user: "Lisa Okafor",
        initials: "LO",
        action: "submitted an application",
        detail: "VP of Engineering, Quantum Financial",
        time: "3 hours ago",
    },
    {
        id: 6,
        type: "placement",
        icon: "fa-duotone fa-regular fa-trophy",
        user: "Tom Bradley",
        initials: "TB",
        action: "completed a placement",
        detail: "DevOps Lead at Cirrus Technologies",
        time: "4 hours ago",
    },
    {
        id: 7,
        type: "job",
        icon: "fa-duotone fa-regular fa-plus-circle",
        user: "Nina Vasquez",
        initials: "NV",
        action: "posted a new job",
        detail: "UX Research Lead, Hybrid, $140k-$170k",
        time: "5 hours ago",
    },
    {
        id: 8,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-circle-plus",
        user: "Kevin Zhang",
        initials: "KZ",
        action: "submitted an application",
        detail: "Mobile Engineer, Apex Robotics",
        time: "6 hours ago",
    },
];

const quickActions = [
    {
        icon: "fa-duotone fa-regular fa-plus-circle",
        title: "Post New Job",
        description: "Create a new job listing and distribute it across the network",
        accent: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-inbox",
        title: "Review Applications",
        description: "18 new applications are waiting for your review",
        accent: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Message Recruiters",
        description: "Connect with your recruiting partners in real time",
        accent: "accent",
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatNumber(n: number, prefix = "", suffix = "") {
    const formatted = n >= 1000 ? n.toLocaleString() : String(n);
    return `${prefix}${formatted}${suffix}`;
}

/* ─── Area Chart (SVG) ───────────────────────────────────────────────────────── */

function AreaChart({
    data,
}: {
    data: { day: string; value: number }[];
}) {
    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;
    const width = 600;
    const height = 200;
    const padding = 20;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartW;
        const y = padding + chartH - ((d.value - min) / range) * chartH;
        return { x, y, ...d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padding + chartH - pct * chartH;
                return (
                    <line
                        key={pct}
                        x1={padding}
                        y1={y}
                        x2={width - padding}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity={0.08}
                        strokeWidth={1}
                    />
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="var(--color-secondary)" fillOpacity={0.1} />

            {/* Line */}
            <path d={linePath} fill="none" stroke="var(--color-secondary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-secondary)" />
            ))}

            {/* X-axis labels (every other) */}
            {points.filter((_, i) => i % 3 === 0).map((p) => (
                <text
                    key={p.day}
                    x={p.x}
                    y={height - 2}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.4}
                    fontSize={10}
                    fontFamily="inherit"
                >
                    {p.day}
                </text>
            ))}
        </svg>
    );
}

/* ─── Donut Chart (SVG) ──────────────────────────────────────────────────────── */

function DonutChart({
    data,
}: {
    data: { status: string; count: number; color: string }[];
}) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const radius = 80;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <div className="flex items-center gap-8">
            <svg viewBox="0 0 220 220" className="w-44 h-44 shrink-0">
                {data.map((segment) => {
                    const pct = segment.count / total;
                    const dashLength = pct * circumference;
                    const dashGap = circumference - dashLength;
                    const rotation = (cumulativeOffset / total) * 360 - 90;
                    cumulativeOffset += segment.count;

                    return (
                        <circle
                            key={segment.status}
                            cx={110}
                            cy={110}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashLength} ${dashGap}`}
                            transform={`rotate(${rotation} 110 110)`}
                            strokeLinecap="butt"
                        />
                    );
                })}
                <text x={110} y={105} textAnchor="middle" fill="currentColor" fontSize={28} fontWeight={700}>
                    {total}
                </text>
                <text x={110} y={125} textAnchor="middle" fill="currentColor" fillOpacity={0.5} fontSize={11} style={{ textTransform: "uppercase", letterSpacing: 2 }}>
                    TOTAL
                </text>
            </svg>

            <div className="space-y-3">
                {data.map((segment) => (
                    <div key={segment.status} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                        <span className="text-sm text-base-content/70">{segment.status}</span>
                        <span className="text-sm font-semibold text-base-content ml-auto">{segment.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Bar Chart (SVG) ────────────────────────────────────────────────────────── */

function BarChart({
    data,
}: {
    data: { month: string; value: number }[];
}) {
    const max = Math.max(...data.map((d) => d.value));
    const barWidth = 48;
    const gap = 24;
    const width = data.length * (barWidth + gap) - gap + 40;
    const height = 180;
    const chartH = 140;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {data.map((d, i) => {
                const barH = (d.value / max) * chartH;
                const x = 20 + i * (barWidth + gap);
                const y = chartH - barH + 10;

                return (
                    <g key={d.month}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barH}
                            fill="var(--color-primary)"
                            rx={3}
                        />
                        <text
                            x={x + barWidth / 2}
                            y={y - 8}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={0.7}
                            fontSize={12}
                            fontWeight={600}
                        >
                            {d.value}
                        </text>
                        <text
                            x={x + barWidth / 2}
                            y={height - 4}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={0.4}
                            fontSize={11}
                        >
                            {d.month}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function DashboardTwo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"activity" | "actions">("activity");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useGSAP(
        () => {
            // Sidebar nav items stagger
            gsap.from("[data-nav-item]", {
                x: -20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "power2.out",
                delay: 0.2,
            });

            // Page title
            gsap.from("[data-dash-title]", {
                y: 40,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
            });

            // KPI cards stagger
            gsap.from("[data-kpi]", {
                y: 30,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3,
            });

            // Divider draw-ins
            gsap.utils.toArray<HTMLElement>("[data-divider]").forEach((line) => {
                gsap.from(line, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 90%",
                    },
                });
            });

            // Chart sections
            gsap.from("[data-chart-section]", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-charts]",
                    start: "top 80%",
                },
            });

            // Activity feed items
            gsap.from("[data-activity-item]", {
                x: -30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-feed]",
                    start: "top 80%",
                },
            });

            // Quick action cards
            gsap.from("[data-action-card]", {
                y: 30,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "[data-actions]",
                    start: "top 85%",
                },
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="flex min-h-screen overflow-hidden">
            {/* ─── Mobile Sidebar Overlay ─────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ─── Sidebar ───────────────────────────────────────────── */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-neutral text-neutral-content flex flex-col border-r border-neutral-content/10 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Header */}
                <div className="px-6 py-8 border-b border-neutral-content/10">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium mb-1">
                        Splits Network
                    </p>
                    <h2 className="text-lg font-bold tracking-tight">
                        Recruiting
                    </h2>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.label} data-nav-item>
                                <button
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                                        item.active
                                            ? "bg-secondary/15 text-secondary border-l-2 border-secondary"
                                            : "text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/5 border-l-2 border-transparent"
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <i
                                        className={`${item.icon} w-5 text-center ${
                                            item.active
                                                ? "text-secondary"
                                                : "text-neutral-content/40"
                                        }`}
                                    />
                                    <span className="uppercase tracking-[0.1em] text-xs">
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="px-6 py-5 border-t border-neutral-content/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                            JD
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-content truncate">
                                Jane Doe
                            </p>
                            <p className="text-xs text-neutral-content/40 truncate">
                                Admin
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ───────────────────────────────────────── */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                {/* Mobile Top Bar */}
                <div className="sticky top-0 z-30 bg-neutral text-neutral-content px-4 py-3 flex items-center gap-4 border-b border-neutral-content/10 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 flex items-center justify-center text-neutral-content/70 hover:text-neutral-content transition-colors"
                        aria-label="Open sidebar"
                    >
                        <i className="fa-regular fa-bars text-lg" />
                    </button>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary font-medium">
                        Splits Network
                    </p>
                </div>

            {/* ─── Header ────────────────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p
                        data-dash-title
                        className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4"
                    >
                        Recruiting Dashboard
                    </p>
                    <h1
                        data-dash-title
                        className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-4"
                    >
                        Performance
                        <br />
                        Overview
                    </h1>
                    <p
                        data-dash-title
                        className="text-lg text-neutral-content/60 max-w-xl leading-relaxed"
                    >
                        A real-time view of your recruiting pipeline, placements,
                        and network activity. Data refreshed continuously.
                    </p>
                </div>
            </section>

            {/* ─── KPI Cards ─────────────────────────────────────────────── */}
            <section className="bg-base-200 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((kpi) => (
                            <div
                                key={kpi.label}
                                data-kpi
                                className="bg-base-100 p-6 md:p-8 border border-base-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <i className={`${kpi.icon} text-secondary text-xl`} />
                                    <span
                                        className={`text-xs font-semibold uppercase tracking-wider ${
                                            kpi.trend > 0
                                                ? "text-success"
                                                : "text-error"
                                        }`}
                                    >
                                        {kpi.trend > 0 ? "+" : ""}
                                        {kpi.trend}%
                                    </span>
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-base-content tracking-tight">
                                    {formatNumber(kpi.value, kpi.prefix, kpi.suffix)}
                                </p>
                                <p className="text-xs uppercase tracking-[0.2em] text-base-content/50 mt-2 font-medium">
                                    {kpi.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Charts Section ────────────────────────────────────────── */}
            <section data-charts className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    {/* Section header */}
                    <div className="max-w-2xl mb-12">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-4">
                            Analytics
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content tracking-tight leading-tight">
                            Pipeline at a glance
                        </h2>
                    </div>

                    <div data-divider className="h-px bg-base-300 mb-12" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Applications Over Time */}
                        <div data-chart-section>
                            <div className="flex items-center gap-3 mb-6">
                                <i className="fa-duotone fa-regular fa-chart-line text-secondary" />
                                <h3 className="text-lg font-bold text-base-content">
                                    Applications Over Time
                                </h3>
                            </div>
                            <div className="bg-base-100 border border-base-300 p-6">
                                <AreaChart data={applicationsOverTime} />
                            </div>
                            <p className="text-xs text-base-content/40 mt-3 uppercase tracking-wider">
                                Last 30 days &middot; 15 data points
                            </p>
                        </div>

                        {/* Jobs by Status */}
                        <div data-chart-section>
                            <div className="flex items-center gap-3 mb-6">
                                <i className="fa-duotone fa-regular fa-chart-pie text-secondary" />
                                <h3 className="text-lg font-bold text-base-content">
                                    Jobs by Status
                                </h3>
                            </div>
                            <div className="bg-base-100 border border-base-300 p-6 flex items-center justify-center">
                                <DonutChart data={jobsByStatus} />
                            </div>
                            <p className="text-xs text-base-content/40 mt-3 uppercase tracking-wider">
                                Current distribution across all job listings
                            </p>
                        </div>
                    </div>

                    {/* Placements by Month - full width */}
                    <div className="mt-12 lg:mt-16" data-chart-section>
                        <div data-divider className="h-px bg-base-300 mb-12" />
                        <div className="flex items-center gap-3 mb-6">
                            <i className="fa-duotone fa-regular fa-chart-column text-secondary" />
                            <h3 className="text-lg font-bold text-base-content">
                                Placements by Month
                            </h3>
                        </div>
                        <div className="bg-base-100 border border-base-300 p-6">
                            <BarChart data={placementsByMonth} />
                        </div>
                        <p className="text-xs text-base-content/40 mt-3 uppercase tracking-wider">
                            Completed placements &middot; Last 6 months
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Activity & Actions ────────────────────────────────────── */}
            <section className="bg-neutral text-neutral-content py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Left: Activity Feed */}
                        <div className="lg:col-span-2" data-feed>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-2">
                                        Live Feed
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                        Recent Activity
                                    </h2>
                                </div>

                                {/* Tabs */}
                                <div className="hidden md:flex gap-1 bg-neutral-content/5 p-1">
                                    <button
                                        onClick={() => setActiveTab("activity")}
                                        className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
                                            activeTab === "activity"
                                                ? "bg-secondary text-secondary-content"
                                                : "text-neutral-content/50 hover:text-neutral-content"
                                        }`}
                                    >
                                        Activity
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("actions")}
                                        className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors ${
                                            activeTab === "actions"
                                                ? "bg-secondary text-secondary-content"
                                                : "text-neutral-content/50 hover:text-neutral-content"
                                        }`}
                                    >
                                        Actions
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-neutral-content/10 mb-8" />

                            {/* Activity List */}
                            {activeTab === "activity" && (
                                <div className="space-y-0 max-h-[520px] overflow-y-auto pr-2">
                                    {activityFeed.map((item) => (
                                        <div
                                            key={item.id}
                                            data-activity-item
                                            className="flex items-start gap-4 py-5 border-b border-neutral-content/10 last:border-b-0"
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-neutral-content/10 flex items-center justify-center shrink-0 text-sm font-bold text-neutral-content/70">
                                                {item.initials}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-semibold text-neutral-content">
                                                        {item.user}
                                                    </span>{" "}
                                                    <span className="text-neutral-content/60">
                                                        {item.action}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-secondary mt-0.5 truncate">
                                                    {item.detail}
                                                </p>
                                                <p className="text-xs text-neutral-content/40 mt-1 uppercase tracking-wider">
                                                    {item.time}
                                                </p>
                                            </div>

                                            <i
                                                className={`${item.icon} text-neutral-content/30 text-lg shrink-0 mt-1`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions view (mobile-accessible) */}
                            {activeTab === "actions" && (
                                <div className="space-y-6">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.title}
                                            className="w-full text-left border border-neutral-content/10 p-6 hover:border-secondary/50 transition-colors group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <i
                                                    className={`${action.icon} text-secondary text-xl mt-0.5`}
                                                />
                                                <div>
                                                    <h4 className="font-bold text-neutral-content group-hover:text-secondary transition-colors">
                                                        {action.title}
                                                    </h4>
                                                    <p className="text-sm text-neutral-content/50 mt-1">
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <i className="fa-regular fa-arrow-right text-neutral-content/20 group-hover:text-secondary ml-auto mt-1 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Quick Actions sidebar */}
                        <div data-actions className="hidden lg:block">
                            <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-2">
                                Quick Actions
                            </p>
                            <h3 className="text-2xl font-bold tracking-tight mb-8">
                                Take Action
                            </h3>

                            <div className="h-px bg-neutral-content/10 mb-8" />

                            <div className="space-y-4">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.title}
                                        data-action-card
                                        className="w-full text-left border border-neutral-content/10 p-6 hover:border-secondary/50 transition-colors group"
                                    >
                                        <i
                                            className={`${action.icon} text-secondary text-2xl mb-4 block`}
                                        />
                                        <h4 className="font-bold text-neutral-content group-hover:text-secondary transition-colors mb-2">
                                            {action.title}
                                        </h4>
                                        <p className="text-sm text-neutral-content/50 leading-relaxed">
                                            {action.description}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* Pull quote */}
                            <div className="mt-10 border-l-4 border-secondary pl-6 py-2">
                                <p className="text-lg italic text-neutral-content/80 leading-snug mb-3">
                                    &ldquo;The dashboard reduced our reporting overhead by
                                    60%. I open it every morning instead of building
                                    spreadsheets.&rdquo;
                                </p>
                                <cite className="text-xs text-neutral-content/40 not-italic uppercase tracking-wider">
                                    VP of Talent, Enterprise SaaS
                                </cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Summary Strip ─────────────────────────────────────────── */}
            <section className="bg-base-200 py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div>
                            <i className="fa-duotone fa-regular fa-bolt text-secondary text-2xl mb-4 block" />
                            <h3 className="text-xl font-bold text-base-content mb-2">
                                Real-Time Updates
                            </h3>
                            <p className="text-base-content/60 leading-relaxed">
                                Every metric refreshes automatically. No manual
                                exports, no stale data, no waiting for Monday reports.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-users text-secondary text-2xl mb-4 block" />
                            <h3 className="text-xl font-bold text-base-content mb-2">
                                Team Collaboration
                            </h3>
                            <p className="text-base-content/60 leading-relaxed">
                                Share dashboards with your team. Everyone sees the
                                same numbers, aligned on the same goals.
                            </p>
                        </div>
                        <div>
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl mb-4 block" />
                            <h3 className="text-xl font-bold text-base-content mb-2">
                                Secure by Default
                            </h3>
                            <p className="text-base-content/60 leading-relaxed">
                                Role-based access controls ensure each user sees only
                                the data they are authorized to view.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Colophon ──────────────────────────────────────────────── */}
            <section className="bg-base-100 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-base-content/40 uppercase tracking-[0.2em]">
                        Splits Network &middot; Recruiting Dashboard &middot;
                        Magazine Editorial
                    </p>
                </div>
            </section>

            </div>{/* end main content */}
        </div>
    );
}
