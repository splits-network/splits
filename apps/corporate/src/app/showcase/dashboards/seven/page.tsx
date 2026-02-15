import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { DashboardAnimator } from "./dashboard-animator";
import { DashboardSidebar } from "./dashboard-sidebar";

export const metadata: Metadata = {
    title: "Recruiting Command Center | Splits Network",
    description:
        "Real-time recruiting dashboard with pipeline analytics, placement tracking, and operational metrics. Industrial-grade visibility into your recruiting infrastructure.",
    ...buildCanonical("/dashboards/seven"),
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const kpiCards = [
    {
        id: "KPI-001",
        label: "ACTIVE JOBS",
        value: 47,
        icon: "fa-duotone fa-regular fa-briefcase",
        trend: { value: "+12%", direction: "up" as const },
        unit: "roles",
    },
    {
        id: "KPI-002",
        label: "APPLICATIONS",
        value: 1234,
        icon: "fa-duotone fa-regular fa-file-lines",
        trend: { value: "+8.3%", direction: "up" as const },
        unit: "submissions",
    },
    {
        id: "KPI-003",
        label: "PLACEMENTS",
        value: 23,
        icon: "fa-duotone fa-regular fa-circle-check",
        trend: { value: "+4", direction: "up" as const },
        unit: "this quarter",
    },
    {
        id: "KPI-004",
        label: "REVENUE",
        value: 234500,
        prefix: "$",
        icon: "fa-duotone fa-regular fa-chart-line-up",
        trend: { value: "+18.2%", direction: "up" as const },
        unit: "earned",
    },
];

const applicationsByDay = [
    { day: "Jan 15", count: 28 },
    { day: "Jan 16", count: 35 },
    { day: "Jan 17", count: 22 },
    { day: "Jan 18", count: 41 },
    { day: "Jan 19", count: 33 },
    { day: "Jan 20", count: 19 },
    { day: "Jan 21", count: 12 },
    { day: "Jan 22", count: 38 },
    { day: "Jan 23", count: 45 },
    { day: "Jan 24", count: 52 },
    { day: "Jan 25", count: 48 },
    { day: "Jan 26", count: 36 },
    { day: "Jan 27", count: 29 },
    { day: "Jan 28", count: 15 },
    { day: "Jan 29", count: 42 },
    { day: "Jan 30", count: 55 },
    { day: "Jan 31", count: 61 },
    { day: "Feb 01", count: 50 },
    { day: "Feb 02", count: 44 },
    { day: "Feb 03", count: 38 },
    { day: "Feb 04", count: 57 },
    { day: "Feb 05", count: 63 },
    { day: "Feb 06", count: 49 },
    { day: "Feb 07", count: 31 },
    { day: "Feb 08", count: 54 },
    { day: "Feb 09", count: 67 },
    { day: "Feb 10", count: 58 },
    { day: "Feb 11", count: 72 },
    { day: "Feb 12", count: 65 },
    { day: "Feb 13", count: 70 },
];

const jobsByStatus = [
    { status: "OPEN", count: 24, color: "#3b5ccc" },
    { status: "FILLED", count: 12, color: "#22c55e" },
    { status: "PENDING", count: 7, color: "#14b8a6" },
    { status: "CLOSED", count: 4, color: "#c8ccd4" },
];

const placementsByMonth = [
    { month: "Aug", count: 3 },
    { month: "Sep", count: 5 },
    { month: "Oct", count: 4 },
    { month: "Nov", count: 7 },
    { month: "Dec", count: 6 },
    { month: "Jan", count: 8 },
    { month: "Feb", count: 5 },
];

const activityFeed = [
    {
        id: 1,
        type: "placement",
        icon: "fa-duotone fa-regular fa-circle-check",
        color: "text-[#22c55e]",
        message: "Placement confirmed: Sarah Chen at TechCorp",
        user: "M. Rodriguez",
        initials: "MR",
        time: "12 min ago",
    },
    {
        id: 2,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-import",
        color: "text-[#3b5ccc]",
        message: "New application: Senior Engineer role #2847",
        user: "System",
        initials: "SN",
        time: "34 min ago",
    },
    {
        id: 3,
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-[#14b8a6]",
        message: "Job posted: VP of Engineering at Meridian Labs",
        user: "J. Thompson",
        initials: "JT",
        time: "1h ago",
    },
    {
        id: 4,
        type: "application",
        icon: "fa-duotone fa-regular fa-file-import",
        color: "text-[#3b5ccc]",
        message: "5 new applications for Product Manager #2831",
        user: "System",
        initials: "SN",
        time: "2h ago",
    },
    {
        id: 5,
        type: "placement",
        icon: "fa-duotone fa-regular fa-circle-check",
        color: "text-[#22c55e]",
        message: "Placement confirmed: David Park at FinanceIO",
        user: "A. Nguyen",
        initials: "AN",
        time: "3h ago",
    },
    {
        id: 6,
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        color: "text-[#a78bfa]",
        message: "Interview scheduled: Lisa Wang for role #2839",
        user: "K. Patel",
        initials: "KP",
        time: "4h ago",
    },
    {
        id: 7,
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        color: "text-[#14b8a6]",
        message: "Job updated: Data Scientist at Quantum Analytics",
        user: "R. Kim",
        initials: "RK",
        time: "5h ago",
    },
    {
        id: 8,
        type: "payout",
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        color: "text-[#22c55e]",
        message: "Payout processed: $12,500 split-fee settlement",
        user: "System",
        initials: "SN",
        time: "6h ago",
    },
];

const quickActions = [
    {
        label: "POST_NEW_JOB",
        icon: "fa-duotone fa-regular fa-plus",
        description: "Create and publish a new role to the network",
        href: "https://splits.network/jobs/new",
    },
    {
        label: "REVIEW_APPLICATIONS",
        icon: "fa-duotone fa-regular fa-inbox",
        description: "Process pending candidate submissions",
        href: "https://splits.network/applications",
    },
    {
        label: "MESSAGE_RECRUITERS",
        icon: "fa-duotone fa-regular fa-message-lines",
        description: "Communicate with assigned network recruiters",
        href: "https://splits.network/messages",
    },
];

// ─── Helper: SVG Area Chart ────────────────────────────────────────────────

function AreaChart({ data, maxHeight = 160 }: { data: typeof applicationsByDay; maxHeight?: number }) {
    const maxCount = Math.max(...data.map((d) => d.count));
    const width = 600;
    const padding = 2;
    const step = (width - padding * 2) / (data.length - 1);

    const points = data.map((d, i) => ({
        x: padding + i * step,
        y: maxHeight - (d.count / maxCount) * (maxHeight - 20),
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${maxHeight} L ${points[0].x} ${maxHeight} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${maxHeight}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b5ccc" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b5ccc" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                    key={ratio}
                    x1={0}
                    y1={maxHeight * ratio}
                    x2={width}
                    y2={maxHeight * ratio}
                    stroke="#3b5ccc"
                    strokeOpacity={0.1}
                    strokeDasharray="4 4"
                />
            ))}
            {/* Area fill */}
            <path d={areaPath} fill="url(#areaFill)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#3b5ccc" strokeWidth="2" />
            {/* End dot */}
            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4"
                fill="#3b5ccc"
                stroke="#0a0e17"
                strokeWidth="2"
            />
        </svg>
    );
}

// ─── Helper: Donut Chart ───────────────────────────────────────────────────

function DonutChart({ data }: { data: typeof jobsByStatus }) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const innerRadius = 45;
    let startAngle = -90;

    const segments = data.map((d) => {
        const angle = (d.count / total) * 360;
        const start = startAngle;
        const end = startAngle + angle;
        startAngle = end;

        const startRad = (start * Math.PI) / 180;
        const endRad = (end * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        const ix1 = center + innerRadius * Math.cos(startRad);
        const iy1 = center + innerRadius * Math.sin(startRad);
        const ix2 = center + innerRadius * Math.cos(endRad);
        const iy2 = center + innerRadius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            "Z",
        ].join(" ");

        return { ...d, path };
    });

    return (
        <div className="flex items-center gap-6">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-[180px] h-[180px] flex-shrink-0">
                {segments.map((seg) => (
                    <path key={seg.status} d={seg.path} fill={seg.color} fillOpacity={0.8} />
                ))}
                {/* Center text */}
                <text x={center} y={center - 6} textAnchor="middle" fill="white" fontSize="24" fontFamily="monospace" fontWeight="bold">
                    {total}
                </text>
                <text x={center} y={center + 14} textAnchor="middle" fill="#c8ccd4" fontSize="9" fontFamily="monospace" opacity={0.5}>
                    TOTAL
                </text>
            </svg>
            <div className="space-y-3">
                {data.map((d) => (
                    <div key={d.status} className="flex items-center gap-3">
                        <div className="w-3 h-3" style={{ backgroundColor: d.color, opacity: 0.8 }}></div>
                        <div>
                            <div className="font-mono text-[10px] tracking-wider text-[#c8ccd4]/50">{d.status}</div>
                            <div className="font-mono text-sm text-white">{d.count}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Helper: Bar Chart ─────────────────────────────────────────────────────

function BarChart({ data }: { data: typeof placementsByMonth }) {
    const maxCount = Math.max(...data.map((d) => d.count));

    return (
        <div className="flex items-end gap-3 h-[160px]">
            {data.map((d) => {
                const heightPct = (d.count / maxCount) * 100;
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="font-mono text-[10px] text-[#c8ccd4]/50">{d.count}</div>
                        <div className="w-full relative" style={{ height: `${heightPct}%` }}>
                            <div className="absolute inset-0 bg-[#3b5ccc]/80 hover:bg-[#3b5ccc] transition-colors"></div>
                        </div>
                        <div className="font-mono text-[10px] text-[#c8ccd4]/40">{d.month}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardSevenPage() {
    return (
        <DashboardSidebar>
        <DashboardAnimator>
            {/* ══════════════════════════════════════════════════════════
                HEADER - Command Center Status
               ══════════════════════════════════════════════════════════ */}
            <section className="db-header bg-[#0a0e17] text-[#c8ccd4] relative overflow-hidden pt-8 pb-4">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* System status bar */}
                        <div className="db-status-bar flex flex-wrap items-center justify-between gap-4 mb-6 opacity-0">
                            <div className="flex items-center gap-6 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#3b5ccc]/60">SYSTEM:</span>
                                    <span className="text-[#14b8a6]">COMMAND CENTER</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#3b5ccc]/60">OPERATOR:</span>
                                    <span className="text-[#c8ccd4]/80">ADMIN</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#3b5ccc]/60">SESSION:</span>
                                    <span className="text-[#c8ccd4]/80">2026-02-14</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="w-2 h-2 rounded-full bg-[#22c55e] db-pulse-dot"></span>
                                <span className="text-[#22c55e]/80">ALL SYSTEMS NOMINAL</span>
                            </div>
                        </div>

                        {/* Dashboard title */}
                        <div className="db-title mb-2 opacity-0">
                            <div className="font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-3">
                                // RECRUITING DASHBOARD
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Command Center
                            </h1>
                        </div>

                        {/* Divider */}
                        <div className="db-header-divider mt-6 h-px bg-[#3b5ccc]/20 relative opacity-0">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                KPI CARDS - Primary Metrics
               ══════════════════════════════════════════════════════════ */}
            <section className="db-kpi-section bg-[#0a0e17] text-[#c8ccd4] py-6 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="db-kpi-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4 opacity-0">
                            // PRIMARY METRICS
                        </div>

                        <div className="db-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#3b5ccc]/10">
                            {kpiCards.map((kpi) => (
                                <div
                                    key={kpi.id}
                                    className="db-kpi-card bg-[#0a0e17] p-6 relative group opacity-0"
                                >
                                    {/* Card ID */}
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-4">
                                        {kpi.id}
                                    </div>

                                    {/* Icon + Value */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div
                                                className="db-kpi-value font-mono text-3xl md:text-4xl font-bold text-white mb-1"
                                                data-value={kpi.value}
                                                data-prefix={kpi.prefix || ""}
                                            >
                                                {kpi.prefix || ""}0
                                            </div>
                                            <div className="font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]">
                                                {kpi.label}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 border border-[#3b5ccc]/30 flex items-center justify-center">
                                            <i className={`${kpi.icon} text-lg text-[#3b5ccc]`}></i>
                                        </div>
                                    </div>

                                    {/* Trend + Unit */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3b5ccc]/10">
                                        <div className="flex items-center gap-1.5">
                                            <i
                                                className={`fa-solid fa-arrow-${kpi.trend.direction === "up" ? "up" : "down"} text-[10px] ${
                                                    kpi.trend.direction === "up" ? "text-[#22c55e]" : "text-red-400"
                                                }`}
                                            ></i>
                                            <span
                                                className={`font-mono text-xs ${
                                                    kpi.trend.direction === "up" ? "text-[#22c55e]" : "text-red-400"
                                                }`}
                                            >
                                                {kpi.trend.value}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-[#c8ccd4]/30">
                                            [{kpi.unit}]
                                        </span>
                                    </div>

                                    {/* Hover accent */}
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                CHARTS - Data Visualization
               ══════════════════════════════════════════════════════════ */}
            <section className="db-charts-section bg-[#0d1220] text-[#c8ccd4] py-8 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.03]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="db-charts-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-6 opacity-0">
                            // DATA VISUALIZATION
                        </div>

                        {/* Top row: Area chart (full width) */}
                        <div className="db-area-chart border border-[#3b5ccc]/20 bg-[#0a0e17] p-6 mb-4 opacity-0">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-1">
                                        CHART-001
                                    </div>
                                    <h3 className="font-bold text-white text-sm">Applications Over Time</h3>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/40 mt-1">
                                        RANGE: LAST 30 DAYS
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-2xl font-bold text-white">
                                        {applicationsByDay.reduce((s, d) => s + d.count, 0).toLocaleString()}
                                    </div>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/40">TOTAL</div>
                                </div>
                            </div>
                            <div className="h-[160px]">
                                <AreaChart data={applicationsByDay} />
                            </div>
                            <div className="flex justify-between mt-2 font-mono text-[10px] text-[#c8ccd4]/30">
                                <span>{applicationsByDay[0].day}</span>
                                <span>{applicationsByDay[Math.floor(applicationsByDay.length / 2)].day}</span>
                                <span>{applicationsByDay[applicationsByDay.length - 1].day}</span>
                            </div>
                        </div>

                        {/* Bottom row: Donut + Bar charts */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Jobs by Status - Donut */}
                            <div className="db-donut-chart border border-[#3b5ccc]/20 bg-[#0a0e17] p-6 opacity-0">
                                <div className="mb-4">
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-1">
                                        CHART-002
                                    </div>
                                    <h3 className="font-bold text-white text-sm">Jobs by Status</h3>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/40 mt-1">
                                        DISTRIBUTION: CURRENT
                                    </div>
                                </div>
                                <DonutChart data={jobsByStatus} />
                            </div>

                            {/* Placements by Month - Bar */}
                            <div className="db-bar-chart border border-[#3b5ccc]/20 bg-[#0a0e17] p-6 opacity-0">
                                <div className="mb-4">
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-1">
                                        CHART-003
                                    </div>
                                    <h3 className="font-bold text-white text-sm">Placements by Month</h3>
                                    <div className="font-mono text-[10px] text-[#c8ccd4]/40 mt-1">
                                        RANGE: AUG 2025 &ndash; FEB 2026
                                    </div>
                                </div>
                                <BarChart data={placementsByMonth} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                ACTIVITY FEED + QUICK ACTIONS
               ══════════════════════════════════════════════════════════ */}
            <section className="db-activity-section bg-[#0a0e17] text-[#c8ccd4] py-8 relative overflow-hidden">
                <div className="absolute inset-0 bp-grid-bg opacity-[0.04]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-3 gap-4">
                            {/* Activity Feed - 2 cols */}
                            <div className="lg:col-span-2">
                                <div className="db-activity-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4 opacity-0">
                                    // ACTIVITY LOG
                                </div>

                                <div className="db-activity-feed border border-[#3b5ccc]/20 bg-[#0d1220] opacity-0">
                                    {/* Table header */}
                                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 font-mono text-[10px] tracking-[0.2em] text-[#3b5ccc]/60 uppercase border-b border-[#3b5ccc]/10">
                                        <div className="w-8">TYPE</div>
                                        <div>EVENT</div>
                                        <div>TIME</div>
                                    </div>

                                    {/* Activity rows */}
                                    <div className="max-h-[420px] overflow-y-auto">
                                        {activityFeed.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="db-activity-row grid grid-cols-[auto_1fr_auto] gap-4 items-center px-6 py-4 border-b border-[#3b5ccc]/5 hover:bg-[#3b5ccc]/5 transition-colors"
                                            >
                                                {/* Icon */}
                                                <div className={`w-8 h-8 border border-current/20 flex items-center justify-center ${activity.color}`}>
                                                    <i className={`${activity.icon} text-sm`}></i>
                                                </div>

                                                {/* Message + User */}
                                                <div className="min-w-0">
                                                    <div className="text-sm text-[#c8ccd4]/80 truncate">
                                                        {activity.message}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-5 h-5 bg-[#3b5ccc]/20 flex items-center justify-center font-mono text-[8px] text-[#3b5ccc]">
                                                            {activity.initials}
                                                        </div>
                                                        <span className="font-mono text-[10px] text-[#c8ccd4]/40">
                                                            {activity.user}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Time */}
                                                <div className="font-mono text-[10px] text-[#c8ccd4]/30 whitespace-nowrap">
                                                    {activity.time}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions - 1 col */}
                            <div>
                                <div className="db-actions-label font-mono text-xs text-[#3b5ccc]/60 tracking-[0.3em] uppercase mb-4 opacity-0">
                                    // QUICK ACTIONS
                                </div>

                                <div className="space-y-3">
                                    {quickActions.map((action) => (
                                        <a
                                            key={action.label}
                                            href={action.href}
                                            className="db-action-card block border border-[#3b5ccc]/20 bg-[#0d1220] p-5 group hover:border-[#3b5ccc]/40 transition-colors relative opacity-0"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-9 h-9 border border-[#3b5ccc]/30 flex items-center justify-center group-hover:bg-[#3b5ccc]/10 transition-colors">
                                                    <i className={`${action.icon} text-[#3b5ccc]`}></i>
                                                </div>
                                                <span className="font-mono text-sm tracking-wider text-white">
                                                    {action.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#c8ccd4]/40 leading-relaxed">
                                                {action.description}
                                            </p>

                                            {/* Arrow indicator */}
                                            <div className="absolute top-5 right-5 font-mono text-[#3b5ccc]/40 group-hover:text-[#3b5ccc] transition-colors">
                                                <i className="fa-duotone fa-regular fa-arrow-right text-xs"></i>
                                            </div>

                                            {/* Hover accent */}
                                            <div className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5ccc] group-hover:w-full transition-all duration-500"></div>
                                        </a>
                                    ))}
                                </div>

                                {/* System diagnostics mini-panel */}
                                <div className="db-diagnostics-mini border border-[#3b5ccc]/10 bg-[#0d1220] p-5 mt-4 opacity-0">
                                    <div className="font-mono text-[10px] text-[#3b5ccc]/40 tracking-widest mb-3">
                                        SYSTEM STATUS
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "Pipeline Health", status: "NOMINAL", color: "text-[#22c55e]" },
                                            { label: "API Response", status: "12ms", color: "text-[#14b8a6]" },
                                            { label: "Queue Depth", status: "3", color: "text-[#c8ccd4]/60" },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-xs text-[#c8ccd4]/50">{item.label}</span>
                                                <span className={`font-mono text-[10px] tracking-wider ${item.color}`}>
                                                    [{item.status}]
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                FOOTER - Reference Line
               ══════════════════════════════════════════════════════════ */}
            <section className="db-footer bg-[#0a0e17] text-[#c8ccd4] pb-8 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="db-footer-line h-px bg-[#3b5ccc]/20 relative mb-4 opacity-0">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border border-[#3b5ccc]/40 rotate-45"></div>
                        </div>
                        <div className="db-footer-text flex flex-wrap items-center justify-between font-mono text-[10px] text-[#3b5ccc]/30 tracking-widest opacity-0">
                            <span>REF: SN-DB07-2026</span>
                            <span>SPLITS NETWORK COMMAND CENTER v2.0.4</span>
                            <span>EMPLOYMENT NETWORKS INC.</span>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardAnimator>
        </DashboardSidebar>
    );
}
