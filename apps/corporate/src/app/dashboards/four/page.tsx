"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const kpiCards = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        value: 47,
        label: "Active Jobs",
        trend: "+12%",
        trendUp: true,
        color: "text-primary",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        value: "1,234",
        label: "Applications",
        trend: "+8%",
        trendUp: true,
        color: "text-secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        value: 23,
        label: "Placements",
        trend: "+18%",
        trendUp: true,
        color: "text-accent",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        value: "$234,500",
        label: "Revenue",
        trend: "-3%",
        trendUp: false,
        color: "text-success",
    },
];

const applicationsOverTime = [
    { day: "Jan 15", value: 28 },
    { day: "Jan 16", value: 35 },
    { day: "Jan 17", value: 22 },
    { day: "Jan 18", value: 41 },
    { day: "Jan 19", value: 38 },
    { day: "Jan 20", value: 15 },
    { day: "Jan 21", value: 12 },
    { day: "Jan 22", value: 45 },
    { day: "Jan 23", value: 52 },
    { day: "Jan 24", value: 48 },
    { day: "Jan 25", value: 61 },
    { day: "Jan 26", value: 55 },
    { day: "Jan 27", value: 18 },
    { day: "Jan 28", value: 14 },
    { day: "Jan 29", value: 58 },
    { day: "Jan 30", value: 67 },
    { day: "Jan 31", value: 72 },
    { day: "Feb 1", value: 63 },
    { day: "Feb 2", value: 49 },
    { day: "Feb 3", value: 20 },
    { day: "Feb 4", value: 16 },
    { day: "Feb 5", value: 71 },
    { day: "Feb 6", value: 78 },
    { day: "Feb 7", value: 65 },
    { day: "Feb 8", value: 82 },
    { day: "Feb 9", value: 74 },
    { day: "Feb 10", value: 25 },
    { day: "Feb 11", value: 19 },
    { day: "Feb 12", value: 85 },
    { day: "Feb 13", value: 91 },
];

const jobsByStatus = [
    { label: "Open", value: 24, color: "#16a34a" },
    { label: "Filled", value: 12, color: "#233876" },
    { label: "Pending", value: 7, color: "#d97706" },
    { label: "Closed", value: 4, color: "#ef4444" },
];

const placementsByMonth = [
    { month: "Sep", value: 3 },
    { month: "Oct", value: 5 },
    { month: "Nov", value: 4 },
    { month: "Dec", value: 7 },
    { month: "Jan", value: 6 },
    { month: "Feb", value: 8 },
];

const activityFeed = [
    {
        type: "job",
        icon: "fa-duotone fa-regular fa-plus-circle",
        iconColor: "text-primary",
        text: "New job posted: Senior React Developer",
        user: "Sarah Mitchell",
        time: "12 min ago",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-import",
        iconColor: "text-secondary",
        text: "Application received for Product Manager role",
        user: "James Chen",
        time: "28 min ago",
    },
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-trophy",
        iconColor: "text-accent",
        text: "Placement confirmed: DevOps Engineer at Acme Corp",
        user: "Maria Garcia",
        time: "1 hr ago",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-import",
        iconColor: "text-secondary",
        text: "3 new applications for UX Designer role",
        user: "Alex Thompson",
        time: "2 hrs ago",
    },
    {
        type: "job",
        icon: "fa-duotone fa-regular fa-pen-to-square",
        iconColor: "text-info",
        text: "Job updated: Data Analyst — salary range increased",
        user: "David Park",
        time: "3 hrs ago",
    },
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-handshake",
        iconColor: "text-success",
        text: "Offer accepted: Backend Engineer at TechStart",
        user: "Rachel Kim",
        time: "4 hrs ago",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-star",
        iconColor: "text-warning",
        text: "Candidate shortlisted for VP Engineering role",
        user: "Marcus Johnson",
        time: "5 hrs ago",
    },
    {
        type: "job",
        icon: "fa-duotone fa-regular fa-clock",
        iconColor: "text-error",
        text: "Job closing soon: Marketing Director (2 days left)",
        user: "System",
        time: "6 hrs ago",
    },
];

/* ─── SVG Chart Components ───────────────────────────────────────────────── */

function AreaChart({ data }: { data: typeof applicationsOverTime }) {
    const max = Math.max(...data.map((d) => d.value));
    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - (d.value / max) * chartH,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

    // Y-axis labels
    const yLabels = [0, Math.round(max / 2), max];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Grid lines */}
            {yLabels.map((val) => {
                const y = padding.top + chartH - (val / max) * chartH;
                return (
                    <g key={val}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity={0.08}
                            strokeDasharray="4 4"
                        />
                        <text
                            x={padding.left - 8}
                            y={y + 4}
                            textAnchor="end"
                            fill="currentColor"
                            fillOpacity={0.4}
                            fontSize={11}
                        >
                            {val}
                        </text>
                    </g>
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="oklch(var(--color-primary))" fillOpacity={0.1} />

            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke="oklch(var(--color-primary))"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots on last 5 points */}
            {points.slice(-5).map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill="oklch(var(--color-primary))"
                />
            ))}

            {/* X-axis labels (every 5th) */}
            {data
                .filter((_, i) => i % 7 === 0 || i === data.length - 1)
                .map((d, idx) => {
                    const i = data.indexOf(d);
                    const x = padding.left + (i / (data.length - 1)) * chartW;
                    return (
                        <text
                            key={idx}
                            x={x}
                            y={height - 5}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={0.4}
                            fontSize={10}
                        >
                            {d.day}
                        </text>
                    );
                })}
        </svg>
    );
}

function DonutChart({ data }: { data: typeof jobsByStatus }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 80;
    const innerR = 50;
    let currentAngle = -90;

    const segments = data.map((d) => {
        const angle = (d.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const largeArc = angle > 180 ? 1 : 0;

        const x1 = cx + outerR * Math.cos(startRad);
        const y1 = cy + outerR * Math.sin(startRad);
        const x2 = cx + outerR * Math.cos(endRad);
        const y2 = cy + outerR * Math.sin(endRad);
        const x3 = cx + innerR * Math.cos(endRad);
        const y3 = cy + innerR * Math.sin(endRad);
        const x4 = cx + innerR * Math.cos(startRad);
        const y4 = cy + innerR * Math.sin(startRad);

        const path = `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4} Z`;

        return { ...d, path };
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
                {segments.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} opacity={0.85} />
                ))}
                <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={24}
                    fontWeight="900"
                >
                    {total}
                </text>
                <text
                    x={cx}
                    y={cy + 12}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.5}
                    fontSize={10}
                >
                    Total Jobs
                </text>
            </svg>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                        <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: d.color }}
                        />
                        <span className="text-base-content/60">
                            {d.label} ({d.value})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data }: { data: typeof placementsByMonth }) {
    const max = Math.max(...data.map((d) => d.value));

    return (
        <div className="flex items-end justify-between gap-3 h-40 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-base-content/70">
                        {d.value}
                    </span>
                    <div
                        className="w-full rounded-t-md bg-accent/80 transition-all duration-500"
                        style={{ height: `${(d.value / max) * 100}%` }}
                    />
                    <span className="text-[10px] text-base-content/50 uppercase tracking-wider font-medium">
                        {d.month}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ─── Sidebar Navigation ─────────────────────────────────────────────────── */

const sidebarNavItems = [
    { icon: "fa-duotone fa-regular fa-grid-2", label: "Dashboard", href: "#", active: true },
    { icon: "fa-duotone fa-regular fa-briefcase", label: "Roles", href: "#roles", active: false },
    { icon: "fa-duotone fa-regular fa-user-tie", label: "Recruiters", href: "#recruiters", active: false },
    { icon: "fa-duotone fa-regular fa-users", label: "Candidates", href: "#candidates", active: false },
    { icon: "fa-duotone fa-regular fa-building", label: "Companies", href: "#companies", active: false },
    { icon: "fa-duotone fa-regular fa-file-lines", label: "Applications", href: "#applications", active: false },
    { icon: "fa-duotone fa-regular fa-comments", label: "Messages", href: "#messages", active: false, badge: 3 },
    { icon: "fa-duotone fa-regular fa-handshake", label: "Placements", href: "#placements", active: false },
];

/* ─── Main Dashboard Page ────────────────────────────────────────────────── */

export default function DashboardFourPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".cin-reveal"), {
                    opacity: 1,
                    y: 0,
                });
                return;
            }

            const $ = (sel: string) =>
                containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                containerRef.current!.querySelector(sel);

            // ════════════════════════════════════════
            // HEADER — cinematic entrance
            // ════════════════════════════════════════
            const headerTl = gsap.timeline({ defaults: { ease: "power3.out" } });
            headerTl
                .fromTo(
                    $1(".cin-dash-kicker"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    0.1,
                )
                .fromTo(
                    $1(".cin-dash-headline"),
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.9 },
                    0.2,
                )
                .fromTo(
                    $1(".cin-dash-sub"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    0.5,
                );

            // ════════════════════════════════════════
            // KPI CARDS — stagger in
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-kpi"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.4)",
                    scrollTrigger: {
                        trigger: $1(".cin-kpi-row"),
                        start: "top 85%",
                    },
                },
            );

            // ════════════════════════════════════════
            // CHART CARDS — fade up
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-chart-card"),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-charts"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ACTIVITY + ACTIONS — slide in
            // ════════════════════════════════════════
            gsap.fromTo(
                $1(".cin-activity"),
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-bottom-row"),
                        start: "top 80%",
                    },
                },
            );

            gsap.fromTo(
                $1(".cin-actions"),
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: $1(".cin-bottom-row"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // ACTION CARDS — stagger
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-action-card"),
                { opacity: 0, y: 25, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: $1(".cin-actions"),
                        start: "top 80%",
                    },
                },
            );

            // ════════════════════════════════════════
            // SIDEBAR NAV ITEMS — stagger down
            // ════════════════════════════════════════
            gsap.fromTo(
                $(".cin-nav-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                    delay: 0.3,
                },
            );
        },
        { scope: containerRef },
    );

    /* Shared sidebar content rendered in both mobile drawer and desktop */
    const sidebarContent = (
        <nav className="flex flex-col h-full">
            {/* Brand / Logo area */}
            <div className="p-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-chart-network text-white text-sm" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white tracking-tight">
                            Splits
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                            Network
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation items */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {sidebarNavItems.map((item, i) => (
                    <a
                        key={i}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`cin-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all opacity-0 ${
                            item.active
                                ? "bg-primary text-white shadow-md"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <i className={`${item.icon} w-5 text-center text-base`} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white px-1.5">
                                {item.badge}
                            </span>
                        )}
                    </a>
                ))}
            </div>

            {/* Bottom section */}
            <div className="p-4 border-t border-white/10">
                <a
                    href="#settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                    <i className="fa-duotone fa-regular fa-gear w-5 text-center text-base" />
                    <span>Settings</span>
                </a>
                <div className="flex items-center gap-3 px-3 py-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white">
                        SM
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                            Sarah Mitchell
                        </div>
                        <div className="text-[10px] text-white/30 truncate">
                            Admin
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );

    return (
        <div ref={containerRef} className="cin-page min-h-screen bg-base-100 flex">
            {/* ══════════════════════════════════════════════════════════════
                MOBILE SIDEBAR OVERLAY
               ══════════════════════════════════════════════════════════════ */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral transform transition-transform duration-300 ease-out lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                    <i className="fa-solid fa-xmark" />
                </button>
                {sidebarContent}
            </aside>

            {/* ══════════════════════════════════════════════════════════════
                DESKTOP SIDEBAR (always visible)
               ══════════════════════════════════════════════════════════════ */}
            <aside className="hidden lg:block w-64 bg-neutral flex-shrink-0 sticky top-0 h-screen">
                {sidebarContent}
            </aside>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0">
                {/* ══════════════════════════════════════════════════════════════
                    HEADER — Cinematic Editorial Style
                   ══════════════════════════════════════════════════════════════ */}
                <section className="bg-neutral text-white py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden mb-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
                        >
                            <i className="fa-solid fa-bars text-lg" />
                            <span className="font-medium">Menu</span>
                        </button>

                        <p className="cin-dash-kicker text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4 opacity-0">
                            Recruiting Command Center
                        </p>
                        <h1 className="cin-dash-headline text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-tight mb-6 opacity-0">
                            Dashboard
                        </h1>
                        <p className="cin-dash-sub text-lg text-white/50 max-w-2xl leading-relaxed opacity-0">
                            Real-time overview of your recruiting pipeline, placements,
                            and revenue performance across the network.
                        </p>

                        {/* Tab switcher */}
                        <div className="mt-10 flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                                    activeTab === "overview"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-white/50 hover:text-white/80"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-chart-mixed mr-2" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("activity")}
                                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                                    activeTab === "activity"
                                        ? "bg-primary text-white shadow-md"
                                        : "text-white/50 hover:text-white/80"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-stream mr-2" />
                                Activity
                            </button>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    KPI CARDS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="cin-kpi-row max-w-7xl mx-auto px-6 lg:px-8 -mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {kpiCards.map((kpi, i) => (
                            <div
                                key={i}
                                className="cin-kpi bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow opacity-0"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${kpi.color} text-2xl`}>
                                        <i className={kpi.icon} />
                                    </div>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            kpi.trendUp
                                                ? "bg-success/10 text-success"
                                                : "bg-error/10 text-error"
                                        }`}
                                    >
                                        <i
                                            className={`fa-solid fa-arrow-${kpi.trendUp ? "up" : "down"} mr-1 text-[10px]`}
                                        />
                                        {kpi.trend}
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-base-content tracking-tight mb-1">
                                    {kpi.value}
                                </div>
                                <div className="text-sm text-base-content/50 uppercase tracking-wider font-medium">
                                    {kpi.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CHARTS SECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="cin-charts max-w-7xl mx-auto px-6 lg:px-8 mt-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Applications Over Time — spans 2 cols */}
                        <div className="cin-chart-card lg:col-span-2 bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm opacity-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        Applications Over Time
                                    </h3>
                                    <p className="text-xs text-base-content/40 mt-1">
                                        Last 30 days
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-base-content/40">
                                    <i className="fa-duotone fa-regular fa-chart-line text-primary" />
                                    <span>Trend: +24%</span>
                                </div>
                            </div>
                            <div className="h-52">
                                <AreaChart data={applicationsOverTime} />
                            </div>
                        </div>

                        {/* Jobs by Status — donut */}
                        <div className="cin-chart-card bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm opacity-0">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">
                                    Jobs by Status
                                </h3>
                                <p className="text-xs text-base-content/40 mt-1">
                                    Current distribution
                                </p>
                            </div>
                            <DonutChart data={jobsByStatus} />
                        </div>
                    </div>

                    {/* Placements by Month — full width bar */}
                    <div className="cin-chart-card bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm mt-5 opacity-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-base-content">
                                    Placements by Month
                                </h3>
                                <p className="text-xs text-base-content/40 mt-1">
                                    Last 6 months
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-base-content/40">
                                <i className="fa-duotone fa-regular fa-trophy text-accent" />
                                <span>33 total placements</span>
                            </div>
                        </div>
                        <BarChart data={placementsByMonth} />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ACTIVITY FEED + QUICK ACTIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="cin-bottom-row max-w-7xl mx-auto px-6 lg:px-8 mt-10 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Activity Feed — spans 2 cols */}
                        <div className="cin-activity lg:col-span-2 bg-base-100 border border-base-300 rounded-xl shadow-sm opacity-0">
                            <div className="p-6 border-b border-base-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-base-content">
                                            Recent Activity
                                        </h3>
                                        <p className="text-xs text-base-content/40 mt-1">
                                            Live updates from your network
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        <span className="text-xs text-base-content/40 font-medium">
                                            Live
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-base-300 max-h-[420px] overflow-y-auto">
                                {activityFeed.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-4 p-5 hover:bg-base-200/50 transition-colors"
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`${item.iconColor} text-lg mt-0.5 w-8 text-center flex-shrink-0`}
                                        >
                                            <i className={item.icon} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-base-content font-medium leading-snug">
                                                {item.text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                {/* Avatar placeholder */}
                                                <div className="w-5 h-5 rounded-full bg-base-300 flex items-center justify-center text-[9px] font-bold text-base-content/60">
                                                    {item.user
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <span className="text-xs text-base-content/40">
                                                    {item.user}
                                                </span>
                                                <span className="text-xs text-base-content/30">
                                                    {item.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="cin-actions opacity-0">
                            <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm p-6 mb-5">
                                <h3 className="text-lg font-bold text-base-content mb-1">
                                    Quick Actions
                                </h3>
                                <p className="text-xs text-base-content/40 mb-6">
                                    Common tasks at your fingertips
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button className="cin-action-card flex items-center gap-4 p-4 bg-base-200 rounded-xl hover:bg-primary hover:text-white transition-all group text-left opacity-0">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                            <i className="fa-duotone fa-regular fa-plus text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                Post New Job
                                            </div>
                                            <div className="text-xs text-base-content/40 group-hover:text-white/60 transition-colors">
                                                Create a new listing
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-chevron-right ml-auto text-xs text-base-content/20 group-hover:text-white/60 transition-colors" />
                                    </button>

                                    <button className="cin-action-card flex items-center gap-4 p-4 bg-base-200 rounded-xl hover:bg-secondary hover:text-white transition-all group text-left opacity-0">
                                        <div className="w-10 h-10 rounded-lg bg-secondary/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                            <i className="fa-duotone fa-regular fa-inbox text-secondary group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                Review Applications
                                            </div>
                                            <div className="text-xs text-base-content/40 group-hover:text-white/60 transition-colors">
                                                14 pending review
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-chevron-right ml-auto text-xs text-base-content/20 group-hover:text-white/60 transition-colors" />
                                    </button>

                                    <button className="cin-action-card flex items-center gap-4 p-4 bg-base-200 rounded-xl hover:bg-accent hover:text-white transition-all group text-left opacity-0">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                            <i className="fa-duotone fa-regular fa-comments text-accent group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                Message Recruiters
                                            </div>
                                            <div className="text-xs text-base-content/40 group-hover:text-white/60 transition-colors">
                                                3 unread conversations
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-chevron-right ml-auto text-xs text-base-content/20 group-hover:text-white/60 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Performance Summary Card */}
                            <div className="cin-action-card bg-neutral text-white rounded-xl p-6 shadow-sm opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <i className="fa-duotone fa-regular fa-gauge-high text-primary text-xl" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">
                                        Performance
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/50">
                                                Fill Rate
                                            </span>
                                            <span className="font-bold">76%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: "76%" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/50">
                                                Time to Fill
                                            </span>
                                            <span className="font-bold">
                                                18 days avg
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-secondary rounded-full"
                                                style={{ width: "64%" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/50">
                                                Candidate Quality
                                            </span>
                                            <span className="font-bold">92%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent rounded-full"
                                                style={{ width: "92%" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
