"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── Animation constants ──────────────────────────────────────────────────────
const D = { fast: 0.35, normal: 0.6, slow: 0.9, hero: 1.2, counter: 2.0 };
const E = { precise: "power3.out", mechanical: "power2.inOut" };
const S = { tight: 0.06, normal: 0.1, grid: 0.04 };

// ── Mock Data ────────────────────────────────────────────────────────────────

const kpiCards = [
    {
        key: "jobs",
        value: 47,
        label: "Active Jobs",
        trend: "+12%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        key: "applications",
        value: 1234,
        label: "Applications",
        trend: "+8.3%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-file-lines",
    },
    {
        key: "placements",
        value: 23,
        label: "Placements",
        trend: "+4",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        key: "revenue",
        value: 234500,
        label: "Revenue",
        trend: "+18.2%",
        trendUp: true,
        prefix: "$",
        icon: "fa-duotone fa-regular fa-chart-line-up",
    },
];

const applicationsOverTime = [
    { day: "Jan 15", value: 28 },
    { day: "Jan 16", value: 35 },
    { day: "Jan 17", value: 42 },
    { day: "Jan 18", value: 31 },
    { day: "Jan 19", value: 18 },
    { day: "Jan 20", value: 12 },
    { day: "Jan 21", value: 38 },
    { day: "Jan 22", value: 52 },
    { day: "Jan 23", value: 61 },
    { day: "Jan 24", value: 48 },
    { day: "Jan 25", value: 55 },
    { day: "Jan 26", value: 44 },
    { day: "Jan 27", value: 39 },
    { day: "Jan 28", value: 67 },
    { day: "Jan 29", value: 72 },
    { day: "Jan 30", value: 58 },
    { day: "Feb 1", value: 63 },
    { day: "Feb 2", value: 51 },
    { day: "Feb 3", value: 45 },
    { day: "Feb 4", value: 70 },
    { day: "Feb 5", value: 78 },
    { day: "Feb 6", value: 65 },
    { day: "Feb 7", value: 59 },
    { day: "Feb 8", value: 82 },
    { day: "Feb 9", value: 74 },
    { day: "Feb 10", value: 68 },
    { day: "Feb 11", value: 85 },
    { day: "Feb 12", value: 91 },
    { day: "Feb 13", value: 79 },
    { day: "Feb 14", value: 88 },
];

const jobsByStatus = [
    { label: "Open", value: 24, color: "oklch(var(--p))" },
    { label: "Filled", value: 12, color: "oklch(var(--s))" },
    { label: "Pending", value: 7, color: "oklch(var(--a))" },
    { label: "Closed", value: 4, color: "oklch(var(--n) / 0.3)" },
];

const placementsByMonth = [
    { month: "Sep", value: 4 },
    { month: "Oct", value: 6 },
    { month: "Nov", value: 8 },
    { month: "Dec", value: 5 },
    { month: "Jan", value: 11 },
    { month: "Feb", value: 14 },
];

const activityFeed = [
    {
        id: 1,
        type: "placement",
        user: "Sarah Chen",
        initials: "SC",
        action: "Placement confirmed",
        detail: "Senior Backend Engineer at Stripe",
        time: "12 min ago",
        icon: "fa-duotone fa-regular fa-check-circle",
    },
    {
        id: 2,
        type: "application",
        user: "Marcus Johnson",
        initials: "MJ",
        action: "Application received",
        detail: "Product Manager role at Acme Corp",
        time: "34 min ago",
        icon: "fa-duotone fa-regular fa-file-import",
    },
    {
        id: 3,
        type: "job",
        user: "Lisa Park",
        initials: "LP",
        action: "New job posted",
        detail: "Staff Frontend Engineer - $180K-$220K",
        time: "1 hr ago",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        id: 4,
        type: "application",
        user: "David Kim",
        initials: "DK",
        action: "Application reviewed",
        detail: "Data Scientist at TechFlow",
        time: "2 hr ago",
        icon: "fa-duotone fa-regular fa-eye",
    },
    {
        id: 5,
        type: "placement",
        user: "Emma Wilson",
        initials: "EW",
        action: "Offer accepted",
        detail: "DevOps Lead at CloudScale",
        time: "3 hr ago",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        id: 6,
        type: "job",
        user: "Alex Rivera",
        initials: "AR",
        action: "Job updated",
        detail: "ML Engineer - Salary range adjusted",
        time: "4 hr ago",
        icon: "fa-duotone fa-regular fa-pen",
    },
    {
        id: 7,
        type: "application",
        user: "Nina Patel",
        initials: "NP",
        action: "Candidate shortlisted",
        detail: "UX Designer at DesignHub",
        time: "5 hr ago",
        icon: "fa-duotone fa-regular fa-star",
    },
    {
        id: 8,
        type: "job",
        user: "Tom Brady",
        initials: "TB",
        action: "New job posted",
        detail: "VP of Engineering - Series B Startup",
        time: "6 hr ago",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
];

const quickActions = [
    {
        label: "Post New Job",
        description: "Create and publish a new role to the marketplace",
        icon: "fa-duotone fa-regular fa-plus",
        accent: "btn-neutral",
    },
    {
        label: "Review Applications",
        description: "12 applications awaiting review",
        icon: "fa-duotone fa-regular fa-inbox",
        accent: "btn-outline border-2",
    },
    {
        label: "Message Recruiters",
        description: "3 unread conversations",
        icon: "fa-duotone fa-regular fa-comments",
        accent: "btn-outline border-2",
    },
];

// ── Sidebar Navigation ───────────────────────────────────────────────────────

const sidebarNavItems = [
    { key: "dashboard", label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2", active: true },
    { key: "roles", label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", active: false },
    { key: "recruiters", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie", active: false },
    { key: "candidates", label: "Candidates", icon: "fa-duotone fa-regular fa-users", active: false },
    { key: "companies", label: "Companies", icon: "fa-duotone fa-regular fa-building", active: false },
    { key: "applications", label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", active: false },
    { key: "messages", label: "Messages", icon: "fa-duotone fa-regular fa-comments", active: false, badge: 3 },
    { key: "placements", label: "Placements", icon: "fa-duotone fa-regular fa-handshake", active: false },
];

function SidebarContent({ activeItem, onItemClick }: { activeItem: string; onItemClick: (key: string) => void }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo / Brand */}
            <div className="p-6 pb-4 border-b border-neutral/10">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-base-content/30 mb-1">
                    Splits Network
                </div>
                <div className="text-lg font-black tracking-tight">
                    Recruiting
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4 px-3 space-y-[2px]">
                {sidebarNavItems.map((item) => {
                    const isActive = item.key === activeItem;
                    return (
                        <button
                            key={item.key}
                            onClick={() => onItemClick(item.key)}
                            className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 group ${
                                isActive
                                    ? "bg-neutral text-neutral-content"
                                    : "text-base-content/50 hover:text-base-content hover:bg-neutral/5"
                            }`}
                        >
                            <i
                                className={`${item.icon} w-5 text-center text-sm ${
                                    isActive ? "text-neutral-content" : "text-base-content/30 group-hover:text-base-content/60"
                                } transition-colors duration-200`}
                            />
                            <span className="text-xs font-bold uppercase tracking-[0.15em] flex-1">
                                {item.label}
                            </span>
                            {item.badge && (
                                <span
                                    className={`text-[10px] font-black w-5 h-5 flex items-center justify-center ${
                                        isActive
                                            ? "bg-neutral-content/20 text-neutral-content"
                                            : "bg-neutral/10 text-base-content/40"
                                    }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-neutral/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral/10 border border-neutral/10 flex items-center justify-center">
                        <span className="text-[10px] font-black text-base-content/40">JD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold tracking-tight truncate">John Doe</div>
                        <div className="text-[10px] text-base-content/30 tracking-wider uppercase">Admin</div>
                    </div>
                    <button className="text-base-content/20 hover:text-base-content transition-colors duration-200">
                        <i className="fa-duotone fa-regular fa-gear text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── SVG Chart Components ─────────────────────────────────────────────────────

function AreaChart({ data }: { data: typeof applicationsOverTime }) {
    const maxVal = Math.max(...data.map((d) => d.value));
    const w = 600;
    const h = 200;
    const padX = 0;
    const padY = 10;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2;

    const points = data.map((d, i) => ({
        x: padX + (i / (data.length - 1)) * chartW,
        y: padY + chartH - (d.value / maxVal) * chartH,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(var(--n))" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="oklch(var(--n))" stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                <line
                    key={i}
                    x1={padX}
                    y1={padY + chartH * (1 - frac)}
                    x2={w - padX}
                    y2={padY + chartH * (1 - frac)}
                    stroke="oklch(var(--n) / 0.08)"
                    strokeWidth="1"
                />
            ))}
            <path d={areaPath} fill="url(#areaFill)" />
            <path d={linePath} fill="none" stroke="oklch(var(--n))" strokeWidth="2" strokeLinejoin="round" />
            {/* End dot */}
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="oklch(var(--n))" />
        </svg>
    );
}

function DonutChart({ data }: { data: typeof jobsByStatus }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const size = 180;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 70;
    const strokeWidth = 28;

    let currentAngle = -90;

    const arcs = data.map((d) => {
        const angle = (d.value / total) * 360;
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = ((currentAngle + angle) * Math.PI) / 180;
        const largeArc = angle > 180 ? 1 : 0;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
        currentAngle += angle;

        return { path, color: d.color, label: d.label, value: d.value };
    });

    return (
        <div className="flex items-center gap-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {arcs.map((arc, i) => (
                    <path
                        key={i}
                        d={arc.path}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" className="fill-base-content text-3xl font-black">
                    {total}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" className="fill-base-content/40 text-[10px] uppercase tracking-widest">
                    Total
                </text>
            </svg>
            <div className="space-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 inline-block" style={{ backgroundColor: d.color }} />
                        <span className="text-base-content/60">{d.label}</span>
                        <span className="font-black ml-auto">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data }: { data: typeof placementsByMonth }) {
    const maxVal = Math.max(...data.map((d) => d.value));

    return (
        <div className="flex items-end gap-3 h-40">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-black">{d.value}</span>
                    <div className="w-full relative" style={{ height: `${(d.value / maxVal) * 100}%` }}>
                        <div className="absolute inset-0 bg-neutral hover:bg-primary transition-colors duration-200" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-base-content/40">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardThreePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
    const [activeNavItem, setActiveNavItem] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const handler = () => { if (mq.matches) setSidebarOpen(false); };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Animate sidebar nav items
    useGSAP(
        () => {
            if (!sidebarRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            gsap.fromTo(
                sidebarRef.current.querySelectorAll(".sidebar-nav-item"),
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: D.fast, ease: E.precise, stagger: S.tight, delay: 0.3 },
            );
        },
        { scope: sidebarRef },
    );

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll("[data-animate]"), { opacity: 1 });
                gsap.set(containerRef.current.querySelectorAll(".anim"), { opacity: 1 });
                return;
            }

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ── HEADER ──────────────────────────────────────
            const headerTl = gsap.timeline({ defaults: { ease: E.precise } });

            headerTl.fromTo(
                $1(".dash-number"),
                { opacity: 0, y: 60, skewY: 5 },
                { opacity: 1, y: 0, skewY: 0, duration: D.slow },
            );

            headerTl.fromTo(
                $1(".dash-headline"),
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: D.normal },
                "-=0.4",
            );

            headerTl.fromTo(
                $1(".dash-divider"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.normal, transformOrigin: "left center" },
                "-=0.3",
            );

            headerTl.fromTo(
                $1(".dash-date"),
                { opacity: 0 },
                { opacity: 1, duration: D.fast },
                "-=0.2",
            );

            // ── KPI CARDS ───────────────────────────────────
            headerTl.fromTo(
                $(".kpi-card"),
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: D.fast, stagger: S.normal },
                "-=0.1",
            );

            // KPI counters
            $(".kpi-counter").forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const prefix = el.getAttribute("data-prefix") || "";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: D.counter,
                        ease: E.precise,
                        delay: 0.3 + i * S.normal,
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            el.textContent = prefix + (target >= 1000 ? current.toLocaleString() : String(current));
                        },
                    },
                );
            });

            // KPI trend indicators
            headerTl.fromTo(
                $(".kpi-trend"),
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: D.fast, stagger: S.tight },
                "-=0.2",
            );

            // ── CHARTS SECTION ──────────────────────────────
            gsap.fromTo(
                $1(".charts-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".charts-section"), start: "top 80%" },
                },
            );

            $(".chart-card").forEach((card) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: D.normal, ease: E.precise,
                        scrollTrigger: { trigger: card, start: "top 90%" },
                    },
                );
            });

            // ── ACTIVITY SECTION ────────────────────────────
            gsap.fromTo(
                $1(".activity-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".activity-section"), start: "top 80%" },
                },
            );

            $(".activity-item").forEach((item, i) => {
                gsap.fromTo(
                    item,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0, duration: D.fast, ease: E.precise,
                        delay: i * S.tight,
                        scrollTrigger: { trigger: $1(".activity-list"), start: "top 85%" },
                    },
                );
            });

            // ── QUICK ACTIONS ───────────────────────────────
            gsap.fromTo(
                $1(".actions-label"),
                { opacity: 0, x: -40 },
                {
                    opacity: 1, x: 0, duration: D.normal, ease: E.precise,
                    scrollTrigger: { trigger: $1(".actions-section"), start: "top 80%" },
                },
            );

            $(".action-card").forEach((card, i) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0, duration: D.fast, ease: E.precise,
                        delay: i * S.normal,
                        scrollTrigger: { trigger: $1(".actions-grid"), start: "top 85%" },
                    },
                );
            });
        },
        { scope: containerRef },
    );

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleNavClick = (key: string) => {
        setActiveNavItem(key);
        setSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-base-100 text-base-content">
            {/* ════════════════════════════════════════════════════════
                SIDEBAR - Desktop (always visible)
               ════════════════════════════════════════════════════════ */}
            <aside
                ref={sidebarRef}
                className="hidden lg:flex lg:w-60 xl:w-64 flex-col border-r-2 border-neutral bg-base-100 fixed top-0 left-0 h-screen z-40"
            >
                <SidebarContent activeItem={activeNavItem} onItemClick={handleNavClick} />
            </aside>

            {/* ════════════════════════════════════════════════════════
                SIDEBAR - Mobile overlay
               ════════════════════════════════════════════════════════ */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-neutral/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative w-64 bg-base-100 border-r-2 border-neutral h-full flex flex-col shadow-2xl">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-base-content/30 hover:text-base-content transition-colors duration-200 z-10"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                        <SidebarContent activeItem={activeNavItem} onItemClick={handleNavClick} />
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                MAIN CONTENT - offset by sidebar width on desktop
               ════════════════════════════════════════════════════════ */}
            <div ref={containerRef} className="flex-1 lg:ml-60 xl:ml-64">
                {/* HEADER */}
                <section className="border-b-2 border-neutral relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-neutral" />
                    <div className="container mx-auto px-6 lg:px-12 pt-16 pb-12">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 mb-6 text-base-content/40 hover:text-base-content transition-colors duration-200"
                        >
                            <i className="fa-duotone fa-regular fa-bars text-lg" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Menu</span>
                        </button>

                        <div className="grid grid-cols-12 gap-4 lg:gap-6 items-end mb-8">
                            <div className="col-span-12 lg:col-span-3">
                                <div className="dash-number opacity-0 text-[6rem] sm:text-[8rem] lg:text-[10rem] font-black leading-none tracking-tighter text-neutral/10 select-none">
                                    03
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-9 pb-2">
                                <div className="dash-headline opacity-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-2">
                                        Recruiting Dashboard
                                    </p>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight">
                                        Performance
                                        <br />
                                        Overview
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="dash-divider h-[2px] bg-neutral mb-4 opacity-100" style={{ transformOrigin: "left center" }} />

                        <div className="dash-date opacity-0 flex items-center justify-between mb-10">
                            <p className="text-sm text-base-content/40">{dateStr}</p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                                        activeTab === "overview"
                                            ? "bg-neutral text-neutral-content"
                                            : "text-base-content/40 hover:text-base-content"
                                    }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab("activity")}
                                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                                        activeTab === "activity"
                                            ? "bg-neutral text-neutral-content"
                                            : "text-base-content/40 hover:text-base-content"
                                    }`}
                                >
                                    Activity
                                </button>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-neutral/10">
                            {kpiCards.map((kpi) => (
                                <div key={kpi.key} className="kpi-card opacity-0 bg-base-100 p-6 lg:p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <i className={`${kpi.icon} text-xl text-base-content/20`} />
                                        <span className="kpi-trend opacity-0 text-xs font-bold tracking-wide text-base-content/60 flex items-center gap-1">
                                            {kpi.trendUp ? (
                                                <i className="fa-solid fa-arrow-up text-[10px]" />
                                            ) : (
                                                <i className="fa-solid fa-arrow-down text-[10px]" />
                                            )}
                                            {kpi.trend}
                                        </span>
                                    </div>
                                    <div
                                        className="kpi-counter text-3xl lg:text-4xl font-black tracking-tighter leading-none mb-2"
                                        data-value={kpi.value}
                                        data-prefix={kpi.prefix || ""}
                                    >
                                        {kpi.prefix || ""}0
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                                        {kpi.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CHARTS */}
                <section className="charts-section py-16 lg:py-24 border-b-2 border-neutral">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="charts-label opacity-0 flex items-center gap-4 mb-12 lg:mb-16">
                            <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">01</span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">Analytics</p>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Data Insights</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-neutral/10">
                            <div className="chart-card opacity-0 bg-base-100 p-6 lg:p-8 lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">Last 30 Days</p>
                                        <h3 className="text-lg font-black tracking-tight">Applications Over Time</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black tracking-tighter">
                                            {applicationsOverTime[applicationsOverTime.length - 1].value}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40">Today</p>
                                    </div>
                                </div>
                                <div className="h-48">
                                    <AreaChart data={applicationsOverTime} />
                                </div>
                                <div className="flex justify-between mt-2">
                                    {applicationsOverTime
                                        .filter((_, i) => i % 7 === 0 || i === applicationsOverTime.length - 1)
                                        .map((d, i) => (
                                            <span key={i} className="text-[10px] text-base-content/30 tracking-wider">{d.day}</span>
                                        ))}
                                </div>
                            </div>

                            <div className="chart-card opacity-0 bg-base-100 p-6 lg:p-8">
                                <div className="mb-6">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">Distribution</p>
                                    <h3 className="text-lg font-black tracking-tight">Jobs by Status</h3>
                                </div>
                                <div className="flex justify-center">
                                    <DonutChart data={jobsByStatus} />
                                </div>
                            </div>

                            <div className="chart-card opacity-0 bg-base-100 p-6 lg:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">6-Month Trend</p>
                                        <h3 className="text-lg font-black tracking-tight">Placements by Month</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black tracking-tighter">
                                            {placementsByMonth.reduce((sum, d) => sum + d.value, 0)}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40">Total</p>
                                    </div>
                                </div>
                                <BarChart data={placementsByMonth} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ACTIVITY FEED + QUICK ACTIONS */}
                <section className="activity-section py-16 lg:py-24 border-b-2 border-neutral">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                            <div className="lg:col-span-8">
                                <div className="activity-label opacity-0 flex items-center gap-4 mb-10 lg:mb-12">
                                    <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">02</span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">Timeline</p>
                                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Recent Activity</h2>
                                    </div>
                                </div>

                                <div className="activity-list space-y-0 max-h-[600px] overflow-y-auto">
                                    {activityFeed.map((item) => (
                                        <div
                                            key={item.id}
                                            className="activity-item opacity-0 group border-t border-neutral/10 hover:border-neutral transition-colors duration-200"
                                        >
                                            <div className="grid grid-cols-12 gap-3 py-5 items-center">
                                                <div className="col-span-1">
                                                    <div className="w-10 h-10 bg-neutral/5 border border-neutral/10 flex items-center justify-center">
                                                        <span className="text-xs font-black tracking-tight text-base-content/40">
                                                            {item.initials}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-span-7 sm:col-span-8">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <i className={`${item.icon} text-xs text-base-content/20 group-hover:text-primary transition-colors duration-200`} />
                                                        <span className="text-sm font-bold">{item.user}</span>
                                                    </div>
                                                    <p className="text-sm text-base-content/50">
                                                        {item.action} &mdash; {item.detail}
                                                    </p>
                                                </div>
                                                <div className="col-span-4 sm:col-span-3 text-right">
                                                    <span className="text-[10px] uppercase tracking-[0.15em] text-base-content/30">
                                                        {item.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-neutral/10" />
                                </div>
                            </div>

                            <div className="lg:col-span-4 actions-section">
                                <div className="actions-label opacity-0 flex items-center gap-4 mb-10 lg:mb-12">
                                    <span className="text-6xl lg:text-8xl font-black tracking-tighter text-neutral/10">03</span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40">Actions</p>
                                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Quick Start</h2>
                                    </div>
                                </div>

                                <div className="actions-grid space-y-[2px] bg-neutral/10">
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            className="action-card opacity-0 w-full bg-base-100 p-6 text-left group hover:bg-neutral/5 transition-colors duration-200"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 border-2 border-neutral/10 group-hover:border-neutral flex items-center justify-center transition-colors duration-200">
                                                    <i className={`${action.icon} text-lg text-base-content/30 group-hover:text-base-content transition-colors duration-200`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black tracking-tight mb-1 group-hover:text-primary transition-colors duration-200">
                                                        {action.label}
                                                    </h4>
                                                    <p className="text-xs text-base-content/40">{action.description}</p>
                                                </div>
                                                <i className="fa-duotone fa-regular fa-arrow-right text-base-content/10 group-hover:text-base-content/40 transition-colors duration-200 mt-1" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 border-t-2 border-neutral pt-8">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-base-content/40 mb-4">
                                        Pipeline Summary
                                    </p>
                                    <div className="grid grid-cols-2 gap-[2px] bg-neutral/10">
                                        {[
                                            { label: "In Review", value: "12" },
                                            { label: "Interviews", value: "8" },
                                            { label: "Offers", value: "3" },
                                            { label: "Avg Days", value: "14" },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-base-100 p-4">
                                                <div className="text-xl font-black tracking-tighter">{stat.value}</div>
                                                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER CTA */}
                <section className="py-16 lg:py-24">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-12 lg:col-span-4">
                                <div className="text-[6rem] lg:text-[8rem] font-black leading-none tracking-tighter text-neutral/5 select-none">
                                    04
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-8 pb-2">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-base-content/40 mb-3">
                                    Next Steps
                                </p>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight mb-6">
                                    Build your
                                    <br />
                                    pipeline today.
                                </h2>
                                <div className="h-[2px] bg-neutral/10 mb-6" />
                                <div className="flex flex-wrap gap-3">
                                    <a href="#" className="btn btn-neutral font-bold tracking-wide">
                                        <i className="fa-duotone fa-regular fa-plus mr-2" />
                                        Post a Job
                                    </a>
                                    <a href="#" className="btn btn-outline border-2 font-bold tracking-wide">
                                        <i className="fa-duotone fa-regular fa-users mr-2" />
                                        Browse Recruiters
                                    </a>
                                    <a href="#" className="btn btn-ghost font-bold tracking-wide">
                                        <i className="fa-duotone fa-regular fa-chart-mixed mr-2" />
                                        Full Analytics
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
