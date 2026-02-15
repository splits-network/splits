import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { DashboardAnimator } from "./dashboard-animator";
import { DashboardSidebar } from "./dashboard-sidebar";

export const metadata: Metadata = {
    title: "Recruiting Dashboard | Employment Networks",
    description:
        "Real-time recruiting dashboard with KPIs, analytics, and activity tracking. Retro Memphis design.",
    ...buildCanonical("/dashboards/six"),
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const kpis = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        value: 47,
        label: "Active Jobs",
        trend: "+12%",
        trendUp: true,
        color: "#FF6B6B",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        value: 1234,
        label: "Applications",
        trend: "+28%",
        trendUp: true,
        color: "#4ECDC4",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        value: 23,
        label: "Placements",
        trend: "+8%",
        trendUp: true,
        color: "#A78BFA",
    },
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        value: 234500,
        prefix: "$",
        label: "Revenue",
        trend: "+18%",
        trendUp: true,
        color: "#FFE66D",
    },
];

const applicationsOverTime = [
    { day: "Jan 15", value: 32 },
    { day: "Jan 18", value: 45 },
    { day: "Jan 21", value: 38 },
    { day: "Jan 24", value: 62 },
    { day: "Jan 27", value: 55 },
    { day: "Jan 30", value: 71 },
    { day: "Feb 2", value: 48 },
    { day: "Feb 5", value: 83 },
    { day: "Feb 8", value: 67 },
    { day: "Feb 11", value: 92 },
    { day: "Feb 14", value: 78 },
];

const jobsByStatus = [
    { label: "Open", value: 18, color: "#4ECDC4" },
    { label: "Filled", value: 12, color: "#A78BFA" },
    { label: "Pending", value: 9, color: "#FFE66D" },
    { label: "Closed", value: 8, color: "#FF6B6B" },
];

const placementsByMonth = [
    { month: "Sep", value: 4 },
    { month: "Oct", value: 6 },
    { month: "Nov", value: 3 },
    { month: "Dec", value: 8 },
    { month: "Jan", value: 5 },
    { month: "Feb", value: 7 },
];

const activities = [
    {
        type: "job_posted",
        icon: "fa-duotone fa-regular fa-plus-circle",
        color: "#4ECDC4",
        user: "Sarah K.",
        initials: "SK",
        text: "posted Senior React Developer at TechCorp",
        time: "2 minutes ago",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-arrow-up",
        color: "#A78BFA",
        user: "Marcus T.",
        initials: "MT",
        text: "submitted application for Product Manager",
        time: "15 minutes ago",
    },
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-trophy",
        color: "#FFE66D",
        user: "Priya S.",
        initials: "PS",
        text: "placed as UX Designer at DesignCo",
        time: "1 hour ago",
    },
    {
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        color: "#FF6B6B",
        user: "David L.",
        initials: "DL",
        text: "scheduled interview for Backend Engineer",
        time: "2 hours ago",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-arrow-up",
        color: "#A78BFA",
        user: "Emily R.",
        initials: "ER",
        text: "submitted application for Data Analyst",
        time: "3 hours ago",
    },
    {
        type: "job_posted",
        icon: "fa-duotone fa-regular fa-plus-circle",
        color: "#4ECDC4",
        user: "James W.",
        initials: "JW",
        text: "posted DevOps Engineer at CloudScale",
        time: "4 hours ago",
    },
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-trophy",
        color: "#FFE66D",
        user: "Nina C.",
        initials: "NC",
        text: "placed as Marketing Lead at GrowthCo",
        time: "5 hours ago",
    },
    {
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        color: "#FF6B6B",
        user: "Alex M.",
        initials: "AM",
        text: "completed final interview for VP Engineering",
        time: "6 hours ago",
    },
];

const quickActions = [
    {
        icon: "fa-duotone fa-regular fa-square-plus",
        label: "Post New Job",
        description: "Create a new job listing and start receiving applications",
        color: "#FF6B6B",
        href: "#",
    },
    {
        icon: "fa-duotone fa-regular fa-inbox",
        label: "Review Applications",
        description: "12 new applications waiting for your review",
        color: "#4ECDC4",
        badge: "12",
        href: "#",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        label: "Message Recruiters",
        description: "3 unread messages from your recruiting network",
        color: "#A78BFA",
        badge: "3",
        href: "#",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        label: "View Reports",
        description: "Access detailed analytics and performance reports",
        color: "#FFE66D",
        href: "#",
    },
];

// ─── Chart Helpers ──────────────────────────────────────────────────────────

function buildLineChartPath(data: { value: number }[], width: number, height: number, padding: number): string {
    const maxVal = Math.max(...data.map((d) => d.value));
    const minVal = Math.min(...data.map((d) => d.value));
    const range = maxVal - minVal || 1;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    return data
        .map((d, i) => {
            const x = padding + (i / (data.length - 1)) * usableW;
            const y = padding + usableH - ((d.value - minVal) / range) * usableH;
            return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
}

function buildDonutSegments(data: { value: number; color: string }[]): { offset: number; dash: string; color: string }[] {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulative = 0;
    return data.map((d) => {
        const pct = (d.value / total) * 100;
        const offset = 25 - cumulative; // 25 = start at top (rotate -90deg equivalent in stroke-dashoffset)
        const dash = `${pct} ${100 - pct}`;
        cumulative += pct;
        return { offset, dash, color: d.color };
    });
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardSixPage() {
    const lineChartPath = buildLineChartPath(applicationsOverTime, 440, 200, 20);
    const donutSegments = buildDonutSegments(jobsByStatus);
    const maxPlacement = Math.max(...placementsByMonth.map((p) => p.value));
    const barColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FF6B6B", "#4ECDC4"];

    return (
        <>
            <DashboardSidebar />
            <div className="lg:ml-[260px]">
                <DashboardAnimator>
                    {/* ══════════════════════════════════════════════════════════════
                        HEADER + KPI CARDS
                       ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[60vh] overflow-hidden flex items-center"
                style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis geometric decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-28 h-28 rounded-full border-[5px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[55%] right-[6%] w-20 h-20 rounded-full opacity-0"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="memphis-shape absolute bottom-[12%] left-[10%] w-14 h-14 rounded-full opacity-0"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <div className="memphis-shape absolute top-[18%] right-[12%] w-16 h-16 rotate-12 opacity-0"
                        style={{ backgroundColor: "#A78BFA" }} />
                    <div className="memphis-shape absolute bottom-[20%] right-[22%] w-24 h-10 -rotate-6 border-[4px] opacity-0"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[40%] left-[18%] w-12 h-12 rotate-45 opacity-0"
                        style={{ backgroundColor: "#FF6B6B" }} />
                    <div className="memphis-shape absolute top-[28%] left-[38%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "25px solid transparent",
                            borderRight: "25px solid transparent",
                            borderBottom: "44px solid #FFE66D",
                            transform: "rotate(-15deg)",
                        }} />
                    <svg className="memphis-shape absolute bottom-[8%] right-[35%] opacity-0" width="100" height="35" viewBox="0 0 100 35">
                        <polyline points="0,28 12,7 24,28 36,7 48,28 60,7 72,28 84,7 100,28"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute top-[65%] left-[30%] opacity-0" width="35" height="35" viewBox="0 0 35 35">
                        <line x1="17" y1="4" x2="17" y2="31" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="4" y1="17" x2="31" y2="17" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="memphis-shape absolute top-[12%] right-[30%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF6B6B" }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="dash-overline inline-block mb-6 opacity-0">
                                <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]"
                                    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                    <i className="fa-duotone fa-regular fa-chart-line"></i>
                                    Dashboard
                                </span>
                            </div>
                            <h1 className="dash-headline text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 opacity-0 uppercase tracking-tight"
                                style={{ color: "#FFFFFF" }}>
                                Recruiting{" "}
                                <span style={{ color: "#4ECDC4" }}>Command Center</span>
                            </h1>
                            <p className="dash-subtext text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-0"
                                style={{ color: "rgba(255,255,255,0.7)" }}>
                                Real-time metrics, pipeline analytics, and activity tracking -- all in one view.
                            </p>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {kpis.map((kpi, index) => (
                                <div key={index}
                                    className="kpi-card relative p-5 md:p-6 border-4 opacity-0"
                                    style={{ borderColor: kpi.color, backgroundColor: "rgba(255,255,255,0.04)" }}>
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-10 h-10"
                                        style={{ backgroundColor: kpi.color }} />
                                    <div className="w-10 h-10 flex items-center justify-center mb-3 border-3"
                                        style={{ borderColor: kpi.color }}>
                                        <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
                                    </div>
                                    <div className="kpi-value text-3xl md:text-4xl font-black mb-1"
                                        style={{ color: "#FFFFFF" }}
                                        data-value={kpi.value}
                                        data-prefix={kpi.prefix || ""}
                                        data-suffix="">
                                        {kpi.prefix || ""}{kpi.value >= 1000 ? kpi.value.toLocaleString() : kpi.value}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-[0.15em] mb-2"
                                        style={{ color: "rgba(255,255,255,0.6)" }}>
                                        {kpi.label}
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold"
                                        style={{
                                            backgroundColor: kpi.trendUp ? "rgba(78,205,196,0.15)" : "rgba(255,107,107,0.15)",
                                            color: kpi.trendUp ? "#4ECDC4" : "#FF6B6B",
                                        }}>
                                        <i className={`fa-solid fa-arrow-${kpi.trendUp ? "up" : "down"} text-[10px]`}></i>
                                        {kpi.trend}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CHARTS SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-charts py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="charts-heading text-center mb-14 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                            Analytics
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                            style={{ color: "#1A1A2E" }}>
                            Pipeline{" "}
                            <span style={{ color: "#A78BFA" }}>At A Glance</span>
                        </h2>
                    </div>

                    <div className="charts-grid grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        {/* Applications Over Time - Line Chart */}
                        <div className="chart-card border-4 p-6 opacity-0 line-chart-container"
                            style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 flex items-center justify-center"
                                    style={{ backgroundColor: "#4ECDC4" }}>
                                    <i className="fa-duotone fa-regular fa-chart-line text-lg" style={{ color: "#1A1A2E" }}></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        Applications Over Time
                                    </h3>
                                    <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(26,26,46,0.5)" }}>
                                        Last 30 days
                                    </p>
                                </div>
                            </div>
                            <svg viewBox="0 0 440 200" className="w-full" style={{ height: "200px" }}>
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <line key={i} x1="20" y1={20 + i * 40} x2="420" y2={20 + i * 40}
                                        stroke="rgba(26,26,46,0.08)" strokeWidth="1" />
                                ))}
                                {/* Area fill */}
                                <path
                                    d={`${lineChartPath} L420,180 L20,180 Z`}
                                    fill="rgba(78,205,196,0.1)"
                                />
                                {/* Line */}
                                <path
                                    className="line-chart-path"
                                    d={lineChartPath}
                                    fill="none"
                                    stroke="#4ECDC4"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Data points */}
                                {applicationsOverTime.map((d, i) => {
                                    const maxVal = Math.max(...applicationsOverTime.map((p) => p.value));
                                    const minVal = Math.min(...applicationsOverTime.map((p) => p.value));
                                    const range = maxVal - minVal || 1;
                                    const x = 20 + (i / (applicationsOverTime.length - 1)) * 400;
                                    const y = 20 + 160 - ((d.value - minVal) / range) * 160;
                                    return (
                                        <circle key={i} cx={x} cy={y} r="4"
                                            fill="#FFFFFF" stroke="#4ECDC4" strokeWidth="2.5" />
                                    );
                                })}
                            </svg>
                            {/* X-axis labels */}
                            <div className="flex justify-between mt-2 px-2">
                                {applicationsOverTime.filter((_, i) => i % 2 === 0).map((d, i) => (
                                    <span key={i} className="text-[10px] font-bold uppercase"
                                        style={{ color: "rgba(26,26,46,0.4)" }}>
                                        {d.day}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Jobs by Status - Donut Chart */}
                        <div className="chart-card border-4 p-6 opacity-0 donut-chart-container"
                            style={{ borderColor: "#A78BFA", backgroundColor: "#FFFFFF" }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 flex items-center justify-center"
                                    style={{ backgroundColor: "#A78BFA" }}>
                                    <i className="fa-duotone fa-regular fa-chart-pie text-lg" style={{ color: "#FFFFFF" }}></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        Jobs By Status
                                    </h3>
                                    <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(26,26,46,0.5)" }}>
                                        Current distribution
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="relative flex-shrink-0">
                                    <svg width="180" height="180" viewBox="0 0 40 40">
                                        {donutSegments.map((seg, i) => (
                                            <circle key={i}
                                                className="donut-segment"
                                                cx="20" cy="20" r="15.915"
                                                fill="transparent"
                                                stroke={seg.color}
                                                strokeWidth="5"
                                                data-dash={seg.dash}
                                                strokeDasharray="0 100"
                                                strokeDashoffset={seg.offset}
                                            />
                                        ))}
                                    </svg>
                                    {/* Center label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black" style={{ color: "#1A1A2E" }}>
                                            {jobsByStatus.reduce((sum, j) => sum + j.value, 0)}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(26,26,46,0.5)" }}>
                                            Total
                                        </span>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="flex-1 space-y-3">
                                    {jobsByStatus.map((job, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2"
                                                    style={{ backgroundColor: job.color, borderColor: job.color }} />
                                                <span className="text-sm font-bold uppercase tracking-wide"
                                                    style={{ color: "#1A1A2E" }}>
                                                    {job.label}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black" style={{ color: job.color }}>
                                                {job.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Placements by Month - Bar Chart */}
                        <div className="chart-card border-4 p-6 opacity-0 bar-chart-container lg:col-span-2"
                            style={{ borderColor: "#FFE66D", backgroundColor: "#FFFFFF" }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 flex items-center justify-center"
                                    style={{ backgroundColor: "#FFE66D" }}>
                                    <i className="fa-duotone fa-regular fa-chart-bar text-lg" style={{ color: "#1A1A2E" }}></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                                        Placements By Month
                                    </h3>
                                    <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(26,26,46,0.5)" }}>
                                        Last 6 months
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-end gap-4 md:gap-8 h-48 px-4">
                                {placementsByMonth.map((p, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-sm font-black" style={{ color: "#1A1A2E" }}>
                                            {p.value}
                                        </span>
                                        <div className="w-full relative" style={{ height: "140px" }}>
                                            <div
                                                className="chart-bar absolute bottom-0 w-full border-3"
                                                style={{
                                                    height: `${(p.value / maxPlacement) * 100}%`,
                                                    backgroundColor: barColors[i],
                                                    borderColor: barColors[i],
                                                    transformOrigin: "bottom",
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(26,26,46,0.5)" }}>
                                            {p.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ACTIVITY FEED
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-activity py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                <div className="container mx-auto px-4">
                    <div className="activity-heading text-center mb-14 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                            Live Feed
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                            style={{ color: "#FFFFFF" }}>
                            Recent{" "}
                            <span style={{ color: "#FFE66D" }}>Activity</span>
                        </h2>
                    </div>

                    <div className="activity-list max-w-3xl mx-auto space-y-4 max-h-[520px] overflow-y-auto pr-2"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#A78BFA #1A1A2E",
                        }}>
                        {activities.map((activity, index) => (
                            <div key={index}
                                className="activity-item flex items-start gap-4 p-4 border-4 opacity-0"
                                style={{ borderColor: activity.color, backgroundColor: "rgba(255,255,255,0.04)" }}>
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-black text-sm uppercase"
                                    style={{ backgroundColor: activity.color, color: activity.color === "#FFE66D" ? "#1A1A2E" : "#FFFFFF" }}>
                                    {activity.initials}
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
                                        <span className="font-black" style={{ color: activity.color }}>
                                            {activity.user}
                                        </span>{" "}
                                        {activity.text}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <i className={`${activity.icon} text-xs`} style={{ color: activity.color }}></i>
                                        <span className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "rgba(255,255,255,0.4)" }}>
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                QUICK ACTIONS
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-actions py-20 overflow-hidden" style={{ backgroundColor: "#F5F0EB" }}>
                <div className="container mx-auto px-4">
                    <div className="actions-heading text-center mb-14 opacity-0 max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                            style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                            Quick Actions
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                            style={{ color: "#1A1A2E" }}>
                            What&apos;s{" "}
                            <span style={{ color: "#FF6B6B" }}>Next?</span>
                        </h2>
                    </div>

                    <div className="actions-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {quickActions.map((action, index) => (
                            <a key={index}
                                href={action.href}
                                className="action-card relative p-6 border-4 opacity-0 transition-transform hover:-translate-y-1 block"
                                style={{ borderColor: action.color, backgroundColor: "#FFFFFF" }}>
                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-10 h-10"
                                    style={{ backgroundColor: action.color }} />
                                {/* Badge */}
                                {action.badge && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center font-black text-xs"
                                        style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                                        {action.badge}
                                    </div>
                                )}
                                <div className="w-14 h-14 flex items-center justify-center mb-4 border-4"
                                    style={{ borderColor: action.color }}>
                                    <i className={`${action.icon} text-2xl`} style={{ color: action.color }}></i>
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-wide mb-2"
                                    style={{ color: "#1A1A2E" }}>
                                    {action.label}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.6)" }}>
                                    {action.description}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                    style={{ color: action.color }}>
                                    <span>Go</span>
                                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                BOTTOM CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative py-20 overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] right-[5%] w-16 h-16 rounded-full border-4"
                        style={{ borderColor: "#FF6B6B" }} />
                    <div className="absolute bottom-[15%] left-[8%] w-12 h-12 rotate-45"
                        style={{ backgroundColor: "#4ECDC4" }} />
                    <div className="absolute top-[50%] left-[3%] w-10 h-10 rounded-full"
                        style={{ backgroundColor: "#FFE66D" }} />
                    <svg className="absolute bottom-[20%] right-[15%]" width="80" height="30" viewBox="0 0 80 30">
                        <polyline points="0,25 10,5 20,25 30,5 40,25 50,5 60,25 70,5 80,25"
                            fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-[1]"
                            style={{ color: "#FFFFFF" }}>
                            Ready To{" "}
                            <span style={{ color: "#4ECDC4" }}>Scale</span>{" "}
                            Your Pipeline?
                        </h2>
                        <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                            Join thousands of recruiters using real-time dashboards to close more placements.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://splits.network/sign-up"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Get Started Free
                            </a>
                            <a href="https://employment-networks.com/landing/six"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: "transparent", borderColor: "#FFFFFF", color: "#FFFFFF" }}>
                                <i className="fa-duotone fa-regular fa-circle-info"></i>
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>
                </DashboardAnimator>
            </div>
        </>
    );
}
