"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Animation constants ────────────────────────────────────────────────────
const D = { fast: 0.4, normal: 0.7, hero: 1.2, build: 0.8 };
const E = { smooth: "power2.out", bounce: "back.out(1.4)", elastic: "elastic.out(1, 0.5)" };
const S = { tight: 0.08, normal: 0.12, loose: 0.2 };

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

const sidebarNavItems = [
    { label: "Dashboard", icon: "fa-duotone fa-regular fa-grid-2", active: true },
    { label: "Roles", icon: "fa-duotone fa-regular fa-briefcase", active: false },
    { label: "Recruiters", icon: "fa-duotone fa-regular fa-hard-hat", active: false },
    { label: "Candidates", icon: "fa-duotone fa-regular fa-user-helmet-safety", active: false },
    { label: "Companies", icon: "fa-duotone fa-regular fa-building", active: false },
    { label: "Applications", icon: "fa-duotone fa-regular fa-file-lines", active: false },
    { label: "Messages", icon: "fa-duotone fa-regular fa-comments", active: false },
    { label: "Placements", icon: "fa-duotone fa-regular fa-handshake", active: false },
];

// ─── Mock Data ──────────────────────────────────────────────────────────────

const kpiCards = [
    {
        label: "Active Jobs",
        value: 47,
        trend: "+12%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        label: "Applications",
        value: 1234,
        trend: "+23%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-file-lines",
    },
    {
        label: "Placements",
        value: 23,
        trend: "+8%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        label: "Revenue",
        value: 234500,
        trend: "+18%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-dollar-sign",
        isCurrency: true,
    },
];

const applicationsOverTime = [
    { day: "Jan 15", count: 28 },
    { day: "Jan 16", count: 35 },
    { day: "Jan 17", count: 22 },
    { day: "Jan 18", count: 41 },
    { day: "Jan 19", count: 38 },
    { day: "Jan 20", count: 30 },
    { day: "Jan 21", count: 25 },
    { day: "Jan 22", count: 45 },
    { day: "Jan 23", count: 52 },
    { day: "Jan 24", count: 48 },
    { day: "Jan 25", count: 39 },
    { day: "Jan 26", count: 55 },
    { day: "Jan 27", count: 60 },
    { day: "Jan 28", count: 42 },
    { day: "Jan 29", count: 58 },
    { day: "Jan 30", count: 65 },
    { day: "Jan 31", count: 50 },
    { day: "Feb 1", count: 72 },
    { day: "Feb 2", count: 68 },
    { day: "Feb 3", count: 55 },
    { day: "Feb 4", count: 78 },
    { day: "Feb 5", count: 82 },
    { day: "Feb 6", count: 70 },
    { day: "Feb 7", count: 63 },
    { day: "Feb 8", count: 85 },
    { day: "Feb 9", count: 90 },
    { day: "Feb 10", count: 75 },
    { day: "Feb 11", count: 88 },
    { day: "Feb 12", count: 95 },
    { day: "Feb 13", count: 80 },
];

const jobsByStatus = [
    { status: "Open", count: 18, color: "#22d3ee" },
    { status: "Filled", count: 12, color: "#06b6d4" },
    { status: "Pending", count: 9, color: "#0891b2" },
    { status: "Closed", count: 8, color: "#164e63" },
];

const placementsByMonth = [
    { month: "Sep", count: 3 },
    { month: "Oct", count: 5 },
    { month: "Nov", count: 4 },
    { month: "Dec", count: 2 },
    { month: "Jan", count: 6 },
    { month: "Feb", count: 3 },
];

const activityFeed = [
    {
        type: "job_posted",
        title: "Senior React Developer",
        user: "Sarah Chen",
        initials: "SC",
        time: "12 min ago",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        type: "application",
        title: "Application received for DevOps Engineer",
        user: "James Miller",
        initials: "JM",
        time: "34 min ago",
        icon: "fa-duotone fa-regular fa-file-import",
    },
    {
        type: "placement",
        title: "Placement confirmed - Product Manager",
        user: "Emily Torres",
        initials: "ET",
        time: "1 hr ago",
        icon: "fa-duotone fa-regular fa-check-circle",
    },
    {
        type: "application",
        title: "3 new applications for Data Analyst",
        user: "Alex Patel",
        initials: "AP",
        time: "2 hrs ago",
        icon: "fa-duotone fa-regular fa-file-import",
    },
    {
        type: "job_posted",
        title: "Backend Engineer (Go)",
        user: "Marcus Lee",
        initials: "ML",
        time: "3 hrs ago",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        type: "placement",
        title: "Placement confirmed - UX Designer",
        user: "Nina Patel",
        initials: "NP",
        time: "4 hrs ago",
        icon: "fa-duotone fa-regular fa-check-circle",
    },
    {
        type: "application",
        title: "Application received for ML Engineer",
        user: "David Kim",
        initials: "DK",
        time: "5 hrs ago",
        icon: "fa-duotone fa-regular fa-file-import",
    },
    {
        type: "job_posted",
        title: "Full Stack Developer",
        user: "Rachel Wong",
        initials: "RW",
        time: "6 hrs ago",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
];

const quickActions = [
    {
        label: "Post New Job",
        description: "Create a new job listing in the marketplace",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        label: "Review Applications",
        description: "Review pending candidate applications",
        icon: "fa-duotone fa-regular fa-clipboard-check",
    },
    {
        label: "Message Recruiters",
        description: "Send messages to your recruiter network",
        icon: "fa-duotone fa-regular fa-comments",
    },
];

// ─── Chart Components ───────────────────────────────────────────────────────

function AreaChart({ data }: { data: typeof applicationsOverTime }) {
    const max = Math.max(...data.map((d) => d.count));
    const width = 600;
    const height = 200;
    const padding = { top: 10, right: 10, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - (d.count / max) * chartH,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    const yTicks = [0, Math.round(max / 4), Math.round(max / 2), Math.round((3 * max) / 4), max];
    const xLabels = [data[0], data[Math.floor(data.length / 4)], data[Math.floor(data.length / 2)], data[Math.floor((3 * data.length) / 4)], data[data.length - 1]];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => {
                const y = padding.top + chartH - (tick / max) * chartH;
                return (
                    <g key={i}>
                        <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(34,211,238,0.08)" strokeWidth="1" />
                        <text x={padding.left - 6} y={y + 4} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="10" fontFamily="monospace">
                            {tick}
                        </text>
                    </g>
                );
            })}
            {/* Area fill */}
            <path d={areaPath} fill="rgba(34,211,238,0.1)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* Data points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#0f2847" stroke="#22d3ee" strokeWidth="1.5" />
            ))}
            {/* X-axis labels */}
            {xLabels.map((d, i) => {
                const idx = data.indexOf(d);
                const x = padding.left + (idx / (data.length - 1)) * chartW;
                return (
                    <text key={i} x={x} y={height - 5} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="monospace">
                        {d.day}
                    </text>
                );
            })}
        </svg>
    );
}

function DonutChart({ data }: { data: typeof jobsByStatus }) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const size = 180;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 70;
    const innerR = 45;

    let cumulative = 0;
    const segments = data.map((d) => {
        const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
        cumulative += d.count;
        const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const path = [
            `M ${cx + outerR * Math.cos(startAngle)} ${cy + outerR * Math.sin(startAngle)}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * Math.cos(endAngle)} ${cy + outerR * Math.sin(endAngle)}`,
            `L ${cx + innerR * Math.cos(endAngle)} ${cy + innerR * Math.sin(endAngle)}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * Math.cos(startAngle)} ${cy + innerR * Math.sin(startAngle)}`,
            "Z",
        ].join(" ");
        return { ...d, path };
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
                {segments.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} className="transition-opacity hover:opacity-80" />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="monospace">
                    {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="10" fontFamily="monospace">
                    TOTAL
                </text>
            </svg>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-slate-400">
                            {d.status} ({d.count})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data }: { data: typeof placementsByMonth }) {
    const max = Math.max(...data.map((d) => d.count));
    const barHeight = 140;

    return (
        <div className="flex items-end justify-between gap-3 h-[180px] px-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-mono text-cyan-300">{d.count}</span>
                    <div className="w-full relative rounded-t" style={{ height: `${(d.count / max) * barHeight}px`, backgroundColor: "#22d3ee" }}>
                        <div className="absolute inset-0 rounded-t border border-cyan-400/30" />
                    </div>
                    <span className="text-xs font-mono text-slate-500">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function DashboardEightPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "pipeline">("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => containerRef.current!.querySelector(sel);

            // ── HEADER ──
            const headerTl = gsap.timeline({ defaults: { ease: E.smooth } });
            headerTl.fromTo(
                $1(".db-header-badge"),
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: D.fast },
            );
            headerTl.fromTo(
                $1(".db-header-title"),
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: D.normal },
                "-=0.2",
            );
            headerTl.fromTo(
                $1(".db-header-sub"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: D.fast },
                "-=0.4",
            );
            headerTl.fromTo(
                $(".db-tab-btn"),
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: D.fast, stagger: S.tight },
                "-=0.2",
            );

            // ── KPI CARDS ──
            gsap.fromTo(
                $(".db-kpi-card"),
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.build, ease: E.bounce, stagger: S.normal,
                    scrollTrigger: { trigger: $1(".db-kpi-grid"), start: "top 85%" },
                },
            );

            // Counter animations for KPI values
            const kpiValueEls = $(".db-kpi-value");
            kpiValueEls.forEach((el, i) => {
                const target = parseInt(el.getAttribute("data-value") || "0", 10);
                const isCurrency = el.getAttribute("data-currency") === "true";
                gsap.fromTo(
                    { value: 0 },
                    { value: target },
                    {
                        duration: 1.5, ease: E.smooth,
                        delay: 0.3 + i * S.normal,
                        scrollTrigger: { trigger: $1(".db-kpi-grid"), start: "top 85%" },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            if (isCurrency) {
                                el.textContent = "$" + current.toLocaleString();
                            } else {
                                el.textContent = current.toLocaleString();
                            }
                        },
                    },
                );
            });

            // ── CHARTS ──
            gsap.fromTo(
                $(".db-chart-card"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: D.build, ease: E.smooth, stagger: S.normal,
                    scrollTrigger: { trigger: $1(".db-charts-grid"), start: "top 85%" },
                },
            );

            // ── ACTIVITY & ACTIONS ──
            gsap.fromTo(
                $1(".db-activity-card"),
                { opacity: 0, x: -30 },
                {
                    opacity: 1, x: 0,
                    duration: D.build, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".db-bottom-grid"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $(".db-activity-item"),
                { opacity: 0, x: -15 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.3,
                    scrollTrigger: { trigger: $1(".db-bottom-grid"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $1(".db-actions-card"),
                { opacity: 0, x: 30 },
                {
                    opacity: 1, x: 0,
                    duration: D.build, ease: E.smooth,
                    scrollTrigger: { trigger: $1(".db-bottom-grid"), start: "top 85%" },
                },
            );
            gsap.fromTo(
                $(".db-action-item"),
                { opacity: 0, y: 20, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: D.fast, ease: E.bounce, stagger: S.normal, delay: 0.3,
                    scrollTrigger: { trigger: $1(".db-bottom-grid"), start: "top 85%" },
                },
            );

            // ── SIDEBAR ──
            gsap.fromTo(
                $1(".db-sidebar-logo"),
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: D.fast, ease: E.bounce },
            );
            gsap.fromTo(
                $(".db-sidebar-item"),
                { opacity: 0, x: -20 },
                {
                    opacity: 1, x: 0,
                    duration: D.fast, ease: E.smooth, stagger: S.tight, delay: 0.2,
                },
            );
            gsap.fromTo(
                $1(".db-sidebar-footer"),
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: D.fast, ease: E.smooth, delay: 0.8 },
            );

            // Blueprint grid lines animation
            gsap.fromTo(
                $(".db-grid-line"),
                { scaleX: 0 },
                { scaleX: 1, duration: D.build, stagger: S.tight, ease: E.smooth },
            );
            gsap.fromTo(
                $(".db-grid-line-v"),
                { scaleY: 0 },
                { scaleY: 1, duration: D.build, stagger: S.tight, ease: E.smooth },
            );
        },
        { scope: containerRef },
    );

    return (
        <div ref={containerRef} className="flex min-h-screen" style={{ backgroundColor: "#0a1628" }}>
            {/* ══════════════════════════════════════════════════════════════
                SIDEBAR NAVIGATION
               ══════════════════════════════════════════════════════════════ */}

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col border-r border-cyan-500/15 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundColor: "#081220" }}
            >
                {/* Blueprint grid overlay on sidebar */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Corner dimension marks */}
                <div className="absolute top-3 left-3 w-6 h-6 border-l border-t border-cyan-500/25 pointer-events-none" />
                <div className="absolute top-3 right-3 w-6 h-6 border-r border-t border-cyan-500/25 pointer-events-none" />

                {/* Sidebar header / logo */}
                <div className="relative z-10 p-5 pb-4 border-b border-cyan-500/10">
                    <div className="db-sidebar-logo flex items-center gap-3 opacity-0">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center border border-cyan-500/30"
                            style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                        >
                            <i className="fa-duotone fa-regular fa-compass-drafting text-cyan-400" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm leading-tight">Splits</div>
                            <div className="text-[10px] font-mono text-cyan-500/50 tracking-wider">BLUEPRINT v2.0</div>
                        </div>
                    </div>

                    {/* Mobile close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-400 border border-cyan-500/15 transition-colors"
                        style={{ backgroundColor: "rgba(34,211,238,0.05)" }}
                    >
                        <i className="fa-solid fa-xmark text-xs" />
                    </button>
                </div>

                {/* Navigation label */}
                <div className="relative z-10 px-5 pt-5 pb-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-500/40 uppercase">Navigation</span>
                </div>

                {/* Nav items */}
                <nav className="relative z-10 flex-1 px-3 space-y-1 overflow-y-auto">
                    {sidebarNavItems.map((item, index) => (
                        <button
                            key={index}
                            className={`db-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group opacity-0 ${
                                item.active
                                    ? "text-slate-900 font-semibold"
                                    : "text-slate-400 hover:text-white hover:bg-cyan-500/5"
                            }`}
                            style={item.active ? { backgroundColor: "#22d3ee" } : {}}
                        >
                            <div
                                className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                    item.active
                                        ? "bg-white/20"
                                        : "border border-cyan-500/15 group-hover:border-cyan-500/30"
                                }`}
                                style={!item.active ? { backgroundColor: "rgba(34,211,238,0.05)" } : {}}
                            >
                                <i
                                    className={`${item.icon} text-sm ${
                                        item.active ? "text-slate-900" : "text-cyan-400/70 group-hover:text-cyan-400"
                                    }`}
                                />
                            </div>
                            <span>{item.label}</span>
                            {item.active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900/40" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="db-sidebar-footer relative z-10 p-4 border-t border-cyan-500/10 opacity-0">
                    {/* Dimension line */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                        <span className="text-[9px] font-mono text-cyan-500/25">SYS-NAV</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.1)" }} />
                    </div>
                    {/* User avatar */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20 text-xs font-bold text-cyan-300 font-mono"
                            style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                        >
                            JD
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">John Doe</div>
                            <div className="text-[10px] text-slate-500 font-mono">ADMIN</div>
                        </div>
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-cyan-400 border border-cyan-500/10 transition-colors hover:border-cyan-500/25">
                            <i className="fa-duotone fa-regular fa-gear text-xs" />
                        </button>
                    </div>
                </div>

                {/* Bottom corner marks */}
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l border-b border-cyan-500/25 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-cyan-500/25 pointer-events-none" />
            </aside>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT
               ══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 overflow-x-hidden">
            {/* ══════════════════════════════════════════════════════════════
                DASHBOARD HEADER
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden pt-12 pb-8" style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Animated grid lines */}
                <div className="absolute top-[30%] left-0 right-0 h-px bg-cyan-500/15 db-grid-line origin-left" />
                <div className="absolute top-[70%] left-0 right-0 h-px bg-cyan-500/10 db-grid-line origin-left" />
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-cyan-500/8 db-grid-line-v origin-top" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-cyan-500/8 db-grid-line-v origin-top" />

                {/* Corner marks */}
                <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20" />
                <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            {/* Mobile sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40 transition-colors"
                                style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                            >
                                <i className="fa-duotone fa-regular fa-bars text-sm" />
                            </button>

                            <div className="db-header-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-400 text-xs font-mono opacity-0">
                                <i className="fa-duotone fa-regular fa-compass-drafting text-[10px]" />
                                <span>COMMAND CENTER v2.0</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="db-header-title text-3xl md:text-4xl font-bold text-white opacity-0">
                                    Recruiting Dashboard
                                </h1>
                                <p className="db-header-sub text-slate-400 mt-1 opacity-0">
                                    Real-time overview of your recruiting operations
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {(["overview", "jobs", "pipeline"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`db-tab-btn px-4 py-2 rounded-lg text-sm font-mono transition-all opacity-0 ${
                                            activeTab === tab
                                                ? "text-slate-900 font-semibold"
                                                : "text-cyan-400/70 border border-cyan-500/20 hover:border-cyan-500/40"
                                        }`}
                                        style={activeTab === tab ? { backgroundColor: "#22d3ee" } : { backgroundColor: "transparent" }}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                KPI CARDS
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-8 overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
                <div className="container mx-auto px-4">
                    <div className="db-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                        {kpiCards.map((kpi, index) => (
                            <div
                                key={index}
                                className="db-kpi-card group relative rounded-xl p-5 border border-cyan-500/15 transition-all duration-300 hover:border-cyan-400/30 hover:-translate-y-0.5 opacity-0"
                                style={{ backgroundColor: "#0d1d33" }}
                            >
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "rgba(34,211,238,0.2)" }} />

                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                        style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                    >
                                        <i className={`${kpi.icon} text-lg text-cyan-400`} />
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono ${
                                            kpi.trendUp ? "text-emerald-400" : "text-red-400"
                                        }`}
                                        style={{ backgroundColor: kpi.trendUp ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)" }}
                                    >
                                        <i className={`fa-solid fa-arrow-${kpi.trendUp ? "up" : "down"} text-[8px]`} />
                                        {kpi.trend}
                                    </div>
                                </div>

                                <div
                                    className="db-kpi-value text-2xl md:text-3xl font-bold text-white font-mono mb-1"
                                    data-value={kpi.value}
                                    data-currency={kpi.isCurrency ? "true" : "false"}
                                >
                                    {kpi.isCurrency ? "$0" : "0"}
                                </div>
                                <div className="text-sm text-slate-400">{kpi.label}</div>

                                {/* Bottom blueprint dimension */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cyan-500/8">
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                                    <span className="text-[10px] font-mono text-cyan-500/30">SPEC-{String(index + 1).padStart(2, "0")}</span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CHARTS SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-6 overflow-hidden" style={{ backgroundColor: "#081220" }}>
                <div className="container mx-auto px-4">
                    <div className="db-charts-grid grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                        {/* Applications Over Time - spans 2 columns */}
                        <div
                            className="db-chart-card lg:col-span-2 rounded-xl p-6 border border-cyan-500/15 opacity-0"
                            style={{ backgroundColor: "#0d1d33" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Applications Over Time</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">LAST 30 DAYS</p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-chart-line text-sm text-cyan-400" />
                                </div>
                            </div>
                            <div className="h-[200px]">
                                <AreaChart data={applicationsOverTime} />
                            </div>
                        </div>

                        {/* Jobs by Status - donut chart */}
                        <div
                            className="db-chart-card rounded-xl p-6 border border-cyan-500/15 opacity-0"
                            style={{ backgroundColor: "#0d1d33" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Jobs by Status</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">DISTRIBUTION</p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-chart-pie text-sm text-cyan-400" />
                                </div>
                            </div>
                            <div className="flex items-center justify-center py-2">
                                <DonutChart data={jobsByStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Placements by Month - full width bar chart */}
                    <div className="max-w-7xl mx-auto mt-4">
                        <div
                            className="db-chart-card rounded-xl p-6 border border-cyan-500/15 opacity-0"
                            style={{ backgroundColor: "#0d1d33" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Placements by Month</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">LAST 6 MONTHS</p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-chart-bar text-sm text-cyan-400" />
                                </div>
                            </div>
                            <BarChart data={placementsByMonth} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ACTIVITY FEED & QUICK ACTIONS
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-6 pb-16 overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
                {/* Blueprint grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="db-bottom-grid grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                        {/* Activity Feed */}
                        <div
                            className="db-activity-card lg:col-span-2 rounded-xl border border-cyan-500/15 opacity-0"
                            style={{ backgroundColor: "#0d1d33" }}
                        >
                            <div className="flex items-center justify-between p-6 pb-4">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Recent Activity</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">LIVE FEED</p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-signal-stream text-sm text-cyan-400" />
                                </div>
                            </div>

                            <div className="px-6 pb-6 max-h-[400px] overflow-y-auto space-y-1">
                                {activityFeed.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="db-activity-item flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-cyan-500/5 opacity-0"
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-500/20 text-xs font-bold text-cyan-300 font-mono"
                                            style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                        >
                                            {activity.initials}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <i
                                                    className={`${activity.icon} text-xs ${
                                                        activity.type === "placement"
                                                            ? "text-emerald-400"
                                                            : activity.type === "job_posted"
                                                              ? "text-cyan-400"
                                                              : "text-sky-400"
                                                    }`}
                                                />
                                                <span className="text-sm text-white truncate">{activity.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">{activity.user}</span>
                                                <span className="text-xs text-cyan-500/30 font-mono">{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div
                            className="db-actions-card rounded-xl border border-cyan-500/15 opacity-0"
                            style={{ backgroundColor: "#0d1d33" }}
                        >
                            <div className="flex items-center justify-between p-6 pb-4">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Quick Actions</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">SHORTCUTS</p>
                                </div>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/20"
                                    style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                >
                                    <i className="fa-duotone fa-regular fa-bolt text-sm text-cyan-400" />
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-3">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        className="db-action-item w-full text-left p-4 rounded-xl border border-cyan-500/15 transition-all duration-300 hover:border-cyan-400/30 hover:-translate-y-0.5 group opacity-0"
                                        style={{ backgroundColor: "#0f2847" }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/20 transition-colors group-hover:border-cyan-400/40"
                                                style={{ backgroundColor: "rgba(34,211,238,0.08)" }}
                                            >
                                                <i className={`${action.icon} text-lg text-cyan-400`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-white text-sm">{action.label}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{action.description}</div>
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-sm text-cyan-500/40 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Bottom blueprint dimension */}
                            <div className="px-6 pb-4">
                                <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/10">
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                                    <span className="text-[10px] font-mono text-cyan-500/30">ACTIONS-PANEL</span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(34,211,238,0.15)" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </div>{/* end main content */}
        </div>
    );
}
