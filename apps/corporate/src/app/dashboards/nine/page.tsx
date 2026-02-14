import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { DashboardNineAnimator } from "./dashboard-nine-animator";
import { DashboardNineSidebar } from "./dashboard-nine-sidebar";

export const metadata: Metadata = {
    title: "Recruiting Dashboard | Employment Networks",
    description:
        "Real-time recruiting analytics dashboard. Track active jobs, applications, placements, and revenue with architectural precision.",
    ...buildCanonical("/dashboards/nine"),
};

// -- Mock Data ----------------------------------------------------------------

const kpiCards = [
    {
        label: "Active Jobs",
        value: "47",
        trend: "+12%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-briefcase",
        ref: "KPI-01",
    },
    {
        label: "Applications",
        value: "1,234",
        trend: "+8.3%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-file-lines",
        ref: "KPI-02",
    },
    {
        label: "Placements",
        value: "23",
        trend: "+3",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-badge-check",
        ref: "KPI-03",
    },
    {
        label: "Revenue",
        value: "$234,500",
        trend: "+18.2%",
        trendUp: true,
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        ref: "KPI-04",
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
    { day: "Jan 30", value: 63 },
    { day: "Jan 31", value: 49 },
    { day: "Feb 1", value: 67 },
    { day: "Feb 2", value: 72 },
    { day: "Feb 3", value: 25 },
    { day: "Feb 4", value: 20 },
    { day: "Feb 5", value: 74 },
    { day: "Feb 6", value: 68 },
    { day: "Feb 7", value: 79 },
    { day: "Feb 8", value: 82 },
    { day: "Feb 9", value: 71 },
    { day: "Feb 10", value: 30 },
    { day: "Feb 11", value: 27 },
    { day: "Feb 12", value: 85 },
    { day: "Feb 13", value: 91 },
];

const jobsByStatus = [
    { status: "Open", count: 24, color: "#233876" },
    { status: "In Progress", count: 13, color: "#3b5998" },
    { status: "Pending", count: 7, color: "#7b8fbe" },
    { status: "Closed", count: 3, color: "#c0c8dc" },
];

const placementsByMonth = [
    { month: "Sep", value: 4 },
    { month: "Oct", value: 6 },
    { month: "Nov", value: 5 },
    { month: "Dec", value: 8 },
    { month: "Jan", value: 12 },
    { month: "Feb", value: 10 },
];

const recentActivities = [
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-badge-check",
        title: "Placement Confirmed",
        desc: "Sarah Chen placed at TechCorp as Senior Engineer",
        time: "12 min ago",
        initials: "SC",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-plus",
        title: "New Application",
        desc: "Marcus Rivera applied for Product Manager at StartupXYZ",
        time: "28 min ago",
        initials: "MR",
    },
    {
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Job Posted",
        desc: "DesignCo posted UX Lead role - Remote, $140-180K",
        time: "1 hr ago",
        initials: "DC",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-plus",
        title: "New Application",
        desc: "Jamie Park applied for Data Scientist at AnalyticsCo",
        time: "1.5 hrs ago",
        initials: "JP",
    },
    {
        type: "interview",
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Interview Scheduled",
        desc: "Alex Morgan - Final round with BuildCo engineering team",
        time: "2 hrs ago",
        initials: "AM",
    },
    {
        type: "placement",
        icon: "fa-duotone fa-regular fa-badge-check",
        title: "Offer Accepted",
        desc: "Taylor Kim accepted Backend Engineer role at CloudSys",
        time: "3 hrs ago",
        initials: "TK",
    },
    {
        type: "job",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Job Updated",
        desc: "TechCorp increased salary range for Frontend Developer role",
        time: "4 hrs ago",
        initials: "TC",
    },
    {
        type: "application",
        icon: "fa-duotone fa-regular fa-file-plus",
        title: "New Application",
        desc: "Robin Patel applied for Engineering Manager at ScaleUp",
        time: "5 hrs ago",
        initials: "RP",
    },
];

const quickActions = [
    {
        icon: "fa-duotone fa-regular fa-file-plus",
        title: "Post New Job",
        desc: "Create and publish a new role to the network",
        ref: "ACT-01",
    },
    {
        icon: "fa-duotone fa-regular fa-files",
        title: "Review Applications",
        desc: "12 applications pending review",
        ref: "ACT-02",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Message Recruiters",
        desc: "3 unread conversations waiting",
        ref: "ACT-03",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "View Reports",
        desc: "Monthly analytics and pipeline insights",
        ref: "ACT-04",
    },
];

// -- SVG Charts ---------------------------------------------------------------

function ApplicationsChart() {
    const max = Math.max(...applicationsOverTime.map((d) => d.value));
    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 10, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = applicationsOverTime.map((d, i) => ({
        x: padding.left + (i / (applicationsOverTime.length - 1)) * chartW,
        y: padding.top + chartH - (d.value / max) * chartH,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    const yTicks = [0, 25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-axis grid lines and labels */}
            {yTicks.map((tick) => {
                const y = padding.top + chartH - (tick / max) * chartH;
                return (
                    <g key={tick}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="#233876"
                            strokeOpacity={0.08}
                            strokeDasharray="4 4"
                        />
                        <text
                            x={padding.left - 8}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-[#233876]/30"
                            style={{ fontSize: "9px", fontFamily: "monospace" }}
                        >
                            {tick}
                        </text>
                    </g>
                );
            })}

            {/* X-axis labels - show every 5th */}
            {applicationsOverTime.map((d, i) => {
                if (i % 7 !== 0 && i !== applicationsOverTime.length - 1) return null;
                const x = padding.left + (i / (applicationsOverTime.length - 1)) * chartW;
                return (
                    <text
                        key={i}
                        x={x}
                        y={height - 5}
                        textAnchor="middle"
                        className="fill-[#233876]/30"
                        style={{ fontSize: "8px", fontFamily: "monospace" }}
                    >
                        {d.day.split(" ")[1]}
                    </text>
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="#233876" fillOpacity={0.06} />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#233876" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2} fill="#233876" fillOpacity={i === points.length - 1 ? 1 : 0.4} />
            ))}
        </svg>
    );
}

function JobsStatusChart() {
    const total = jobsByStatus.reduce((sum, d) => sum + d.count, 0);
    const radius = 70;
    const innerRadius = 45;
    const centerX = 90;
    const centerY = 90;

    let cumAngle = -Math.PI / 2;
    const arcs = jobsByStatus.map((d) => {
        const angle = (d.count / total) * Math.PI * 2;
        const startAngle = cumAngle;
        cumAngle += angle;
        const endAngle = cumAngle;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        const ix1 = centerX + innerRadius * Math.cos(endAngle);
        const iy1 = centerY + innerRadius * Math.sin(endAngle);
        const ix2 = centerX + innerRadius * Math.cos(startAngle);
        const iy2 = centerY + innerRadius * Math.sin(startAngle);

        const largeArc = angle > Math.PI ? 1 : 0;

        const path = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
            "Z",
        ].join(" ");

        return { ...d, path };
    });

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 180 180" className="w-36 h-36 flex-shrink-0">
                {arcs.map((arc, i) => (
                    <path key={i} d={arc.path} fill={arc.color} />
                ))}
                <text x={centerX} y={centerY - 4} textAnchor="middle" className="fill-[#0f1b3d]" style={{ fontSize: "22px", fontWeight: "bold", fontFamily: "monospace" }}>
                    {total}
                </text>
                <text x={centerX} y={centerY + 12} textAnchor="middle" className="fill-[#0f1b3d]/40" style={{ fontSize: "8px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    TOTAL
                </text>
            </svg>
            <div className="flex-1 space-y-3">
                {jobsByStatus.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3" style={{ backgroundColor: d.color }} />
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs text-[#0f1b3d]/60">{d.status}</span>
                                <span className="font-mono text-xs font-semibold text-[#0f1b3d]">{d.count}</span>
                            </div>
                            <div className="h-1 bg-[#233876]/5 mt-1">
                                <div className="h-full" style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlacementsChart() {
    const max = Math.max(...placementsByMonth.map((d) => d.value));
    const barWidth = 40;
    const gap = 16;
    const chartHeight = 140;
    const width = placementsByMonth.length * (barWidth + gap) - gap + 40;

    return (
        <svg viewBox={`0 0 ${width} ${chartHeight + 30}`} className="w-full h-auto">
            {/* Horizontal grid */}
            {[0, 4, 8, 12].map((tick) => {
                const y = chartHeight - (tick / max) * chartHeight;
                return (
                    <g key={tick}>
                        <line x1={30} y1={y} x2={width} y2={y} stroke="#233876" strokeOpacity={0.08} strokeDasharray="4 4" />
                        <text x={24} y={y + 3} textAnchor="end" className="fill-[#233876]/30" style={{ fontSize: "9px", fontFamily: "monospace" }}>
                            {tick}
                        </text>
                    </g>
                );
            })}

            {placementsByMonth.map((d, i) => {
                const barHeight = (d.value / max) * chartHeight;
                const x = 30 + i * (barWidth + gap);
                const y = chartHeight - barHeight;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barWidth} height={barHeight} fill="#233876" fillOpacity={i === placementsByMonth.length - 1 ? 0.9 : 0.25} />
                        <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" className="fill-[#233876]/30" style={{ fontSize: "9px", fontFamily: "monospace" }}>
                            {d.month}
                        </text>
                        <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-[#0f1b3d]/50" style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: "bold" }}>
                            {d.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// -- Page ---------------------------------------------------------------------

export default function DashboardNinePage() {
    return (
        <DashboardNineAnimator>
            <div className="flex min-h-screen">
                {/* Sidebar Navigation */}
                <DashboardNineSidebar />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
            {/* ============================================================
                HEADER - Dashboard title bar
            ============================================================ */}
            <section className="dash-nine-header relative py-16 bg-white overflow-hidden">
                {/* Dotted grid background */}
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blueprint border */}
                <div className="absolute top-6 left-6 right-6 bottom-6 border border-dashed border-[#233876]/10 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="dash-nine-header-ref mb-4 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">
                                REF: EN-DASH-09 // Recruiting Command Center
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div className="dash-nine-header-title opacity-0">
                                <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b3d] leading-tight">
                                    Recruiting
                                    <br />
                                    <span className="text-[#233876]">Dashboard</span>
                                </h1>
                            </div>

                            <div className="dash-nine-header-meta opacity-0 flex items-center gap-4">
                                <span className="font-mono text-xs text-[#0f1b3d]/30 border border-[#233876]/15 px-3 py-1.5">
                                    <i className="fa-duotone fa-regular fa-calendar-day mr-2 text-[#233876]/40" />
                                    Feb 14, 2026
                                </span>
                                <span className="font-mono text-xs text-[#0f1b3d]/30 border border-[#233876]/15 px-3 py-1.5">
                                    <i className="fa-duotone fa-regular fa-clock mr-2 text-[#233876]/40" />
                                    Live Data
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corner marks */}
                <div className="absolute top-6 right-6 font-mono text-[10px] text-[#233876]/20 tracking-wider">
                    v9.0
                </div>
            </section>

            {/* ============================================================
                KPI CARDS - Top metrics row
            ============================================================ */}
            <section className="dash-nine-kpi relative py-8 bg-[#f7f8fa] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#233876 1px, transparent 1px), linear-gradient(90deg, #233876 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="dash-nine-kpi-label mb-4 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase">
                                Key Performance Indicators
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#233876]/10">
                            {kpiCards.map((kpi, i) => (
                                <div
                                    key={i}
                                    className="dash-nine-kpi-card bg-white p-6 relative opacity-0"
                                >
                                    {/* Reference number */}
                                    <div className="absolute top-3 right-3 font-mono text-[10px] text-[#233876]/15">
                                        {kpi.ref}
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center">
                                            <i className={`${kpi.icon} text-[#233876]`} />
                                        </div>
                                        <div className={`flex items-center gap-1 font-mono text-xs ${kpi.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                                            <i className={`fa-regular ${kpi.trendUp ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-[10px]`} />
                                            {kpi.trend}
                                        </div>
                                    </div>

                                    <div className="font-mono text-3xl font-bold text-[#233876] mb-1">
                                        {kpi.value}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.15em] text-[#0f1b3d]/40 font-medium">
                                        {kpi.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                CHARTS SECTION - Analytics visualizations
            ============================================================ */}
            <section className="dash-nine-charts relative py-12 bg-white overflow-hidden">
                {/* Horizontal blueprint lines */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-dashed border-[#233876]/4"
                            style={{ top: `${(i + 1) * 9}%` }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="dash-nine-charts-heading mb-8 opacity-0">
                            <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-3">
                                Analytics Overview
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1b3d]">
                                Performance Metrics
                            </h2>
                        </div>

                        {/* Top row - Applications line chart (full width) */}
                        <div className="dash-nine-chart-line border-2 border-[#233876]/10 bg-white p-6 mb-6 relative opacity-0">
                            {/* Corner marks */}
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                            <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                <div>
                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                        Applications // Last 30 Days
                                    </div>
                                    <div className="font-bold text-lg text-[#0f1b3d]">
                                        Applications Over Time
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-2xl font-bold text-[#233876]">91</span>
                                    <span className="font-mono text-xs text-[#0f1b3d]/30">today</span>
                                </div>
                            </div>

                            <ApplicationsChart />
                        </div>

                        {/* Bottom row - Donut + Bar charts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Jobs by Status - Donut */}
                            <div className="dash-nine-chart-donut border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                    <div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            Distribution // Current
                                        </div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            Jobs by Status
                                        </div>
                                    </div>
                                </div>

                                <JobsStatusChart />
                            </div>

                            {/* Placements by Month - Bar */}
                            <div className="dash-nine-chart-bar border-2 border-[#233876]/10 bg-white p-6 relative opacity-0">
                                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#233876]/10 pb-4">
                                    <div>
                                        <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase">
                                            Trend // 6 Months
                                        </div>
                                        <div className="font-bold text-[#0f1b3d]">
                                            Placements by Month
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xl font-bold text-[#233876]">45</span>
                                        <span className="font-mono text-xs text-[#0f1b3d]/30">total</span>
                                    </div>
                                </div>

                                <PlacementsChart />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                ACTIVITY FEED + QUICK ACTIONS - Two-column layout
            ============================================================ */}
            <section className="dash-nine-activity relative py-12 bg-[#f7f8fa] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Activity Feed - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="dash-nine-feed-heading mb-4 opacity-0">
                                    <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-3">
                                        Activity Log
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-bold text-[#0f1b3d]">
                                        Recent Activity
                                    </h2>
                                </div>

                                <div className="border-2 border-[#233876]/10 bg-white relative">
                                    {/* Corner marks */}
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                    <div className="max-h-[520px] overflow-y-auto">
                                        <div className="divide-y divide-[#233876]/5">
                                            {recentActivities.map((activity, i) => (
                                                <div
                                                    key={i}
                                                    className="dash-nine-feed-item flex items-start gap-4 p-5 opacity-0"
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center flex-shrink-0 bg-[#f7f8fa]">
                                                        <span className="font-mono text-xs font-bold text-[#233876]/60">
                                                            {activity.initials}
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <i className={`${activity.icon} text-xs text-[#233876]/50`} />
                                                            <span className="font-semibold text-sm text-[#0f1b3d]">
                                                                {activity.title}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                                            {activity.desc}
                                                        </p>
                                                    </div>

                                                    {/* Timestamp */}
                                                    <span className="font-mono text-[10px] text-[#233876]/30 tracking-wider whitespace-nowrap flex-shrink-0">
                                                        {activity.time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions - Takes 1 column */}
                            <div>
                                <div className="dash-nine-actions-heading mb-4 opacity-0">
                                    <span className="font-mono text-xs tracking-[0.3em] text-[#233876]/40 uppercase block mb-3">
                                        Quick Access
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-bold text-[#0f1b3d]">
                                        Actions
                                    </h2>
                                </div>

                                <div className="space-y-px bg-[#233876]/10">
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            className="dash-nine-action-card w-full bg-white p-5 text-left relative hover:bg-[#f7f8fa] transition-colors opacity-0 group"
                                        >
                                            {/* Reference number */}
                                            <div className="absolute top-3 right-3 font-mono text-[10px] text-[#233876]/15">
                                                {action.ref}
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 border-2 border-[#233876]/15 flex items-center justify-center flex-shrink-0 group-hover:border-[#233876]/30 transition-colors">
                                                    <i className={`${action.icon} text-[#233876]`} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-[#0f1b3d] mb-1">
                                                        {action.title}
                                                    </div>
                                                    <div className="text-xs text-[#0f1b3d]/40 leading-relaxed">
                                                        {action.desc}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom line accent */}
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#233876] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                        </button>
                                    ))}
                                </div>

                                {/* Summary stat block */}
                                <div className="dash-nine-summary border-2 border-[#233876]/10 bg-white p-5 mt-6 relative opacity-0">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#233876]/25" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#233876]/25" />

                                    <div className="font-mono text-[10px] text-[#233876]/30 tracking-wider uppercase mb-3">
                                        Pipeline Health
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#0f1b3d]/50">Response Rate</span>
                                            <span className="font-mono text-sm font-bold text-[#233876]">94.2%</span>
                                        </div>
                                        <div className="h-1 bg-[#233876]/5">
                                            <div className="h-full bg-[#233876]" style={{ width: "94.2%" }} />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#0f1b3d]/50">Fill Rate</span>
                                            <span className="font-mono text-sm font-bold text-[#233876]">67.8%</span>
                                        </div>
                                        <div className="h-1 bg-[#233876]/5">
                                            <div className="h-full bg-[#233876]/70" style={{ width: "67.8%" }} />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#0f1b3d]/50">Avg Time to Fill</span>
                                            <span className="font-mono text-sm font-bold text-[#233876]">18 days</span>
                                        </div>
                                        <div className="h-1 bg-[#233876]/5">
                                            <div className="h-full bg-[#233876]/50" style={{ width: "40%" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                FOOTER REFERENCE BAR
            ============================================================ */}
            <section className="relative py-8 bg-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">
                            EMPLOYMENT NETWORKS // DASHBOARD v9.0
                        </span>
                        <span className="font-mono text-[10px] text-[#233876]/20 tracking-wider">
                            DATA REFRESH: REAL-TIME // LAST SYNC: 00:00:14 AGO
                        </span>
                    </div>
                </div>
            </section>
                </div>{/* end Main Content */}
            </div>{/* end flex layout */}
        </DashboardNineAnimator>
    );
}
