import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { DashboardAnimator } from "./dashboard-animator";

export const metadata = getDocMetadata("feature-guides/dashboard");

// --- Data ---------------------------------------------------------------

const widgetCards = [
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Pipeline At A Glance",
        description:
            "The pipeline widget condenses your entire hiring funnel into a single visual. Open roles, active applications, pending reviews, and placements -- all in one snapshot. Instead of clicking through five pages to understand where things stand, the pipeline widget tells you in two seconds. When the numbers shift, you know immediately whether your funnel is healthy or leaking.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Activity Feed",
        description:
            "Every meaningful event surfaces in the activity feed. New applications submitted, candidates advancing through stages, messages from recruiters, placement confirmations, and team actions. The feed is chronological and filterable. It is the first place to look when you want to know what happened while you were away. Think of it as your hiring inbox -- everything that needs your attention lands here.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Quick Actions",
        description:
            "The quick actions panel surfaces the tasks that matter right now. Review pending applications, respond to recruiter messages, approve placements, or jump to your most active roles. These are not random shortcuts -- the system analyzes your current pipeline state and surfaces the actions with the highest impact. One click to get from overview to action.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Performance Metrics",
        description:
            "Key performance indicators live front and center on the dashboard. Time-to-fill averages, submission-to-hire ratios, recruiter response times, and placement revenue. These metrics update in real time as your pipeline moves. When a metric trends in the wrong direction, the dashboard highlights it so you can investigate before a small problem becomes a big one.",
    },
];

const roleWidgets = [
    {
        role: "Recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
        color: "info",
        headline: "Your Active Pipeline",
        description:
            "As a recruiter, your dashboard focuses on what drives revenue: active role assignments, pending submissions, candidate status updates, and placement progress. The widget layout prioritizes the roles where you have candidates in play. If a candidate just advanced to the interview stage, you see it here first. If a hiring manager left feedback on your submission, the activity feed highlights it. The recruiter dashboard is built to minimize the time between something happening and you knowing about it.",
        widgets: [
            "Active role assignments with submission counts",
            "Candidate pipeline status (submitted, interviewing, offered)",
            "Recent messages from hiring managers",
            "Placement milestones and revenue tracking",
            "Upcoming deadlines and expiring submissions",
        ],
    },
    {
        role: "Hiring Manager",
        icon: "fa-duotone fa-regular fa-building",
        color: "warning",
        headline: "Your Hiring Progress",
        description:
            "Hiring managers see their open roles and the submission funnel for each. How many candidates were submitted this week? How many are in review? How long has that top candidate been waiting for feedback? The hiring manager dashboard turns a complex multi-role, multi-stage process into a scannable summary. When your team is hiring for ten positions simultaneously, this is how you keep track without drowning in spreadsheets.",
        widgets: [
            "Open roles with application volume trends",
            "Submissions awaiting your review",
            "Stage-by-stage candidate breakdown per role",
            "Average time-to-review and time-to-fill",
            "Recent recruiter activity on your roles",
        ],
    },
    {
        role: "Company Admin",
        icon: "fa-duotone fa-regular fa-building-shield",
        color: "success",
        headline: "Organization Overview",
        description:
            "Company admins get the widest lens. Your dashboard aggregates data across all roles, all hiring managers, and all recruiters in your organization. Total open positions, aggregate pipeline health, team activity trends, and billing status. When leadership asks how hiring is going across the company, this dashboard has the answer. It is the executive summary that updates itself in real time.",
        widgets: [
            "Organization-wide role and application totals",
            "Team member activity and engagement metrics",
            "Aggregate pipeline health across all departments",
            "Billing status and usage against plan limits",
            "Recent placements and revenue summary",
        ],
    },
];

const metricsExplained = [
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Time To Fill",
        description:
            "Measures the average number of days from when a role opens to when a placement is confirmed. This metric tells you how efficient your hiring pipeline is. A low time-to-fill means your roles attract strong candidates quickly and your review process is tight. A high time-to-fill signals bottlenecks -- maybe roles sit in Draft too long, maybe reviews take too many days, maybe your recruiter network is not engaged enough. The dashboard shows time-to-fill both as a current average and as a trend line over the past 90 days so you can see whether things are improving or slipping.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-left-right-to-line",
        title: "Submission To Hire Ratio",
        description:
            "How many candidate submissions does it take to make one hire? If you are receiving 50 submissions per role but only hiring from 1 in 50, either the role requirements are unclear, the recruiter network is submitting low-quality candidates, or your review criteria are too narrow. The ideal ratio depends on the role type, but tracking this number over time reveals patterns. A rising ratio means quality is dropping. A falling ratio means your pipeline is getting more efficient. The dashboard breaks this metric down by role, by recruiter, and as an organization-wide aggregate.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Response Time",
        description:
            "Tracks the average time between a candidate being submitted and the first piece of feedback from the hiring team. Fast response times keep recruiters engaged and candidates interested. Slow response times cause good candidates to drop out and recruiters to deprioritize your roles. The dashboard measures response time in hours and flags any submissions that have been sitting without feedback for more than 48 hours. If you see that number climbing, it is a direct signal to speed up your review process.",
    },
    {
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Placement Rate",
        description:
            "The percentage of open roles that result in a confirmed placement within a defined period. A high placement rate means your hiring machine is working -- roles open, candidates flow in, hires happen. A low placement rate might mean roles are opening that should not be open yet, or that the pipeline is strong but decision-making stalls at the offer stage. The dashboard shows placement rate as a rolling metric and compares it to your historical average so you can spot trends early.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrow-trend-up",
        title: "Pipeline Velocity",
        description:
            "Pipeline velocity combines volume and speed: how many candidates are moving through your pipeline and how fast are they progressing from stage to stage. High velocity means your pipeline is flowing smoothly. Low velocity means candidates are getting stuck -- maybe in review queues, maybe waiting for interview scheduling, maybe stalled at the offer stage. The dashboard visualizes velocity as a flow diagram showing where candidates accumulate and where they move freely.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Source Distribution",
        description:
            "Shows where your best candidates come from. Which recruiters consistently submit strong candidates? Which network tiers produce the highest hire rate? Source distribution helps you double down on what works and reduce investment in channels that do not convert. The dashboard breaks this down by recruiter, by network tier, and by role category so you can make targeted decisions about where to allocate your recruiting resources.",
    },
];

const filterOptions = [
    {
        icon: "fa-duotone fa-regular fa-calendar-range",
        title: "Date Range Filters",
        description:
            "Control the time window for every metric on your dashboard. View the last 7 days for a quick pulse check, the last 30 days for trend analysis, the last 90 days for quarterly reviews, or set a custom range for specific reporting periods. Date range changes apply globally -- every widget, metric, and chart adjusts simultaneously so you get a consistent view across the entire dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter",
        title: "Role Status Filters",
        description:
            "Focus on what matters right now. Filter the dashboard to show only Open roles, only Closed roles awaiting final placement, or all statuses together. When you have 50 roles in various stages, filtering by status cuts through the noise. The pipeline widget, activity feed, and metrics all respect the active status filter so you see a cohesive filtered view.",
    },
    {
        icon: "fa-duotone fa-regular fa-sitemap",
        title: "Department Filters",
        description:
            "For organizations with multiple departments hiring simultaneously, department filters let you isolate the dashboard to Engineering, Sales, Marketing, Operations, or any custom department. Company admins find this especially useful for reporting to department heads who only care about their own hiring. The filter persists across sessions so you do not have to reapply it every time you load the dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-group",
        title: "Team Member Filters",
        description:
            "Admins and managers can filter the dashboard by specific team members to see individual performance. How is a particular hiring manager progressing on their roles? How active is a specific recruiter this month? Team member filters transform the dashboard from an organizational overview into an individual performance review tool. Useful for one-on-ones and quarterly check-ins.",
    },
];

const refreshItems = [
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Real-Time Event Updates",
        description:
            "The activity feed and notification badges update in real time as events occur. When a recruiter submits a candidate, the submission count ticks up without a page refresh. When a candidate advances to the next stage, the pipeline widget reflects the change immediately. Real-time updates mean you are never looking at stale data -- what you see is what is happening right now.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Metric Refresh Intervals",
        description:
            "Aggregate metrics like time-to-fill, placement rate, and pipeline velocity recalculate on a regular interval. Most metrics refresh every 5 minutes to balance accuracy with performance. The last-refreshed timestamp appears at the bottom of each widget so you always know how current the data is. For on-demand freshness, the refresh button forces an immediate recalculation of all dashboard metrics.",
    },
    {
        icon: "fa-duotone fa-regular fa-database",
        title: "Historical Data Availability",
        description:
            "Dashboard metrics draw from your complete history on the platform. Trend charts can show data going back to your first day on Splits Network. There is no data retention limit -- every placement, every submission, every stage change is available for analysis. When you need to compare this quarter to the same quarter last year, the data is there.",
    },
];

const exportItems = [
    {
        icon: "fa-duotone fa-regular fa-file-csv",
        title: "CSV Export",
        description:
            "Export any dashboard view as a CSV file. The export includes all visible metrics, filtered by your current date range and filters. CSV files open directly in Excel, Google Sheets, or any data analysis tool. Use this for custom reporting, board presentations, or feeding data into external BI tools. The export captures exactly what you see -- same filters, same date range, same breakdowns.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-pdf",
        title: "PDF Snapshots",
        description:
            "Generate a formatted PDF snapshot of your dashboard for sharing with stakeholders who do not have platform access. The PDF includes all visible widgets, charts, and metrics with your organization branding. Send this to leadership for quarterly reviews, attach it to board decks, or archive it as a point-in-time record of your hiring metrics.",
    },
    {
        icon: "fa-duotone fa-regular fa-share-nodes",
        title: "Scheduled Reports",
        description:
            "Set up automated dashboard snapshots delivered to your inbox. Choose weekly or monthly frequency, select which metrics to include, and define the recipient list. Scheduled reports run automatically and land in your email with the latest data. No login required to stay informed. Perfect for executives who want regular updates without opening the platform.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Check Your Dashboard Daily",
        description:
            "Make the dashboard your first stop every morning. A 60-second scan of the activity feed, pipeline widget, and metric highlights tells you what changed overnight and what needs attention today. Teams that check the dashboard daily catch issues before they snowball. Teams that check it weekly are always playing catch-up. The dashboard is designed for daily consumption -- every widget earns its space.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Investigate Metric Anomalies",
        description:
            "When a metric spikes or drops unexpectedly, dig into it. A sudden increase in time-to-fill might mean a specific role is stuck. A drop in submission quality might indicate unclear job descriptions. The dashboard surfaces the symptom -- your job is to diagnose the cause. Use the drill-down capabilities to move from aggregate numbers to specific roles, recruiters, and candidates.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter-list",
        title: "Use Filters For Focused Reviews",
        description:
            "Do not try to consume the entire dashboard at once. Use filters to focus your attention. During a team meeting, filter by department. During a one-on-one, filter by team member. During a quarterly review, set the date range to the past quarter. Filters turn a general-purpose dashboard into a purpose-built reporting tool for whatever context you are working in.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Export Before Important Meetings",
        description:
            "Before any hiring review meeting, export a dashboard snapshot. Having the data in hand -- as a PDF or CSV -- means you are not scrambling to pull up the dashboard on a projector. It also creates a historical record. When someone asks how this quarter compared to last quarter, you can pull up the archived snapshot instead of trying to reconstruct the data from memory.",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        title: "Set Up Scheduled Reports Early",
        description:
            "Do not wait until someone asks for regular reporting. Set up weekly dashboard snapshots for yourself and monthly snapshots for leadership from day one. Automated reports build a cadence of data-driven decision making. They also create a paper trail of hiring performance that is invaluable during annual planning and budgeting conversations.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Share Dashboard Access With Your Team",
        description:
            "The dashboard is most powerful when everyone uses it. Make sure every hiring manager knows their dashboard exists and what it shows. Walk new team members through the widgets during onboarding. When everyone operates from the same data, conversations about hiring become more productive -- less opinion, more evidence.",
    },
];

const troubleshootItems = [
    {
        symptom: "Dashboard shows zero data",
        cause: "Your account has no roles, applications, or placements yet. The dashboard requires at least one active data point to populate widgets.",
        fix: "Create your first role or submit your first candidate. Widgets populate automatically once there is data in the system. If you have existing data but still see zeros, check your date range filter -- it may be set to a period with no activity.",
    },
    {
        symptom: "Metrics seem inaccurate or outdated",
        cause: "Aggregate metrics refresh every 5 minutes. If you just made a change, the dashboard may not reflect it yet. Additionally, active filters or date range settings may exclude recent activity.",
        fix: "Click the refresh button to force an immediate recalculation. Check your date range and status filters to make sure they include the data you expect. If metrics still seem wrong after a manual refresh, clear all filters and verify with an unfiltered view.",
    },
    {
        symptom: "Activity feed is empty",
        cause: "No events have occurred within the selected date range, or the feed filter is set to a specific event type that has no recent entries.",
        fix: "Expand the date range or reset feed filters to All Activity. If you are a recruiter, confirm you have active role assignments -- the feed only shows events related to your assigned roles. If you are an admin, ensure team members have been actively using the platform.",
    },
    {
        symptom: "Quick actions panel is not showing suggestions",
        cause: "Quick actions are generated based on your current pipeline state. If there are no pending reviews, unread messages, or actionable items, the panel has nothing to surface.",
        fix: "This is actually a good sign -- it means you are caught up. Quick actions reappear as soon as new actionable items enter your pipeline. If you believe there should be suggestions, check that your role assignments and permissions are configured correctly.",
    },
    {
        symptom: "Dashboard loads slowly",
        cause: "Large organizations with thousands of roles and applications generate significant data volumes. Complex date ranges or unfiltered views across all history can slow down rendering.",
        fix: "Narrow your date range to the most relevant period. Apply department or status filters to reduce the data set. If performance remains slow after filtering, contact support -- there may be an optimization opportunity for your account's data volume.",
    },
    {
        symptom: "Export produces an empty file",
        cause: "The export captures exactly what the current dashboard view shows. If all widgets are filtered to show no data, the export will be empty.",
        fix: "Before exporting, verify that the dashboard is displaying the data you want. Adjust filters and date ranges, confirm the widgets show populated metrics, then export. The export file should match what you see on screen.",
    },
];

const faqItems = [
    {
        question: "Can I customize which widgets appear on my dashboard?",
        answer: "Widget layout is determined by your role. Recruiters, hiring managers, and admins each see a dashboard optimized for their workflow. Within your role-based layout, you can adjust date ranges and filters to focus on what matters most to you. Full widget customization is on the roadmap for a future release.",
    },
    {
        question: "How far back does dashboard data go?",
        answer: "All the way back to your first day on the platform. There is no data retention limit. Trend charts, metrics, and activity history are available for your entire account history. Set the date range to any period and the dashboard will show you the data.",
    },
    {
        question: "Do dashboard metrics count archived or deleted roles?",
        answer: "Archived and filled roles are included in historical metrics like time-to-fill and placement rate. They are excluded from active pipeline counts. Deleted roles are excluded from all metrics. The distinction ensures your historical performance data remains accurate even as roles move through their lifecycle.",
    },
    {
        question: "Can multiple team members see the same dashboard?",
        answer: "Each user sees their own role-based dashboard. A recruiter and a hiring manager looking at the same role will see different data presentations. Company admins see the organization-wide view. There is no shared dashboard URL, but exported snapshots can be shared with anyone.",
    },
    {
        question: "Does the dashboard work on mobile?",
        answer: "Yes. The dashboard is fully responsive. On mobile, widgets stack vertically and charts adapt to smaller screens. Quick actions are accessible from a floating action button. The mobile experience prioritizes the activity feed and quick actions since those are the most common mobile use cases.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Roles Feature Guide",
        description: "The roles you manage drive every metric on your dashboard. Understand role creation, status management, and pipeline optimization.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Applications Feature Guide",
        description: "Applications flow through the pipeline your dashboard tracks. Learn how submissions, reviews, and stage changes work.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/placements",
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Placements Feature Guide",
        description: "Placements are the endgame your dashboard measures. See how confirmed hires feed into your performance metrics.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-error" },
    teal: { bg: "bg-teal", border: "border-success", text: "text-success" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-secondary" },
};

// --- Page ---------------------------------------------------------------

export default function DashboardFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/dashboard")} id="docs-feature-guides-dashboard-jsonld" />
            <DashboardAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-16 h-16  border-4 border-teal opacity-0" />
                        <div className="memphis-shape absolute top-[40%] right-[9%] w-12 h-12  bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10  bg-coral opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[25%] w-14 h-14 rotate-12 bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[25%] right-[35%] w-16 h-6 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[58%] left-[35%] w-7 h-7 rotate-45 bg-yellow opacity-0" />
                        {/* Grid icon silhouette */}
                        <svg className="memphis-shape absolute top-[18%] left-[48%] opacity-0" width="32" height="32" viewBox="0 0 32 32">
                            <rect x="2" y="2" width="12" height="12" rx="1" className="fill-info" />
                            <rect x="18" y="2" width="12" height="12" rx="1" className="fill-info" opacity="0.6" />
                            <rect x="2" y="18" width="12" height="12" rx="1" className="fill-info" opacity="0.6" />
                            <rect x="18" y="18" width="12" height="12" rx="1" className="fill-info" opacity="0.3" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[48%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2  bg-teal" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[44%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-info">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-info">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-info">Dashboard</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                    <i className="fa-duotone fa-regular fa-gauge-high"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                {"Here's Your "}
                                <span className="relative inline-block">
                                    <span className="text-info">Command Center</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                YOUR DASHBOARD IS NOT A LANDING PAGE. It is the nerve center of your
                                entire hiring operation. Every widget, every metric, every quick action
                                exists for one reason -- to show you exactly where things stand and
                                what needs attention right now. Roles, applications, candidates,
                                placements, team activity -- it all converges here. This guide breaks
                                down every piece of the dashboard so you can read it like a pro and
                                act on what it tells you. If you only visit one page a day, make it
                                this one.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-info"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building text-info"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-info"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    DASHBOARD OVERVIEW -- What The Widgets Do
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Your Dashboard{" "}
                                    <span className="text-info">Shows You</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Four core widgets. Each one answers a different question about your
                                    hiring operation. Together they give you the full picture in under
                                    60 seconds.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {widgetCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-teal/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-teal">
                                            <i className={`${item.icon} text-lg text-dark`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE-SPECIFIC DASHBOARDS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Role Views
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Your Dashboard,{" "}
                                    <span className="text-warning">Your Role</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every role sees a different dashboard. Not because we are hiding
                                    data, but because different roles need different information at a
                                    glance. Here is what each role gets.
                                </p>
                            </div>

                            <div className="role-container space-y-6">
                                {roleWidgets.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`role-card border-4 border-${item.color}/30 bg-base-100 p-6 md:p-8 opacity-0`}
                                    >
                                        <div className="flex items-start gap-4 md:gap-6">
                                            <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${item.color}`}>
                                                <i className={`${item.icon} text-2xl text-${item.color}-content`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`md:hidden inline-flex items-center justify-center w-10 h-10 bg-${item.color}`}>
                                                        <i className={`${item.icon} text-lg text-${item.color}-content`}></i>
                                                    </span>
                                                    <div>
                                                        <span className={`text-xs font-bold uppercase tracking-wider text-${item.color}`}>{item.role}</span>
                                                        <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                            {item.headline}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <p className="text-base leading-relaxed text-base-content/70 mb-4">
                                                    {item.description}
                                                </p>
                                                <ul className="space-y-2">
                                                    {item.widgets.map((widget, wi) => (
                                                        <li key={wi} className="flex items-start gap-2 text-sm text-base-content/60">
                                                            <i className={`fa-duotone fa-regular fa-check text-${item.color} mt-0.5`}></i>
                                                            {widget}
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
                    KEY METRICS EXPLAINED
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    Metrics
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Key Metrics{" "}
                                    <span className="text-success">Decoded</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Numbers without context are just noise. Here is what each metric
                                    actually tells you and what to do when it moves in the wrong
                                    direction.
                                </p>
                            </div>

                            <div className="metric-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {metricsExplained.map((item, index) => (
                                    <div
                                        key={index}
                                        className="metric-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-teal">
                                            <i className={`${item.icon} text-lg text-success-content`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    FILTERING AND DATE RANGES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Filters
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Filter And{" "}
                                    <span className="text-error">Focus</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your dashboard can show everything or exactly one thing. Filters
                                    let you control the lens. Use them to cut through the noise and
                                    focus on what matters right now.
                                </p>
                            </div>

                            <div className="filter-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filterOptions.map((item, index) => (
                                    <div
                                        key={index}
                                        className="filter-card border-4 border-coral/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-coral">
                                            <i className={`${item.icon} text-xl text-error`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    REAL-TIME DATA AND REFRESH
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-dark">
                                    Live Data
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Real-Time Data{" "}
                                    <span className="text-secondary">And Refresh</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your dashboard is not a snapshot from this morning. It is a
                                    living view of your hiring operation that updates as events happen.
                                </p>
                            </div>

                            <div className="refresh-container space-y-6">
                                {refreshItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="refresh-card flex gap-6 border-4 border-purple/20 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center border-4 border-purple">
                                            <i className={`${item.icon} text-2xl text-secondary`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-10 h-10 border-4 border-purple">
                                                    <i className={`${item.icon} text-lg text-secondary`}></i>
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    EXPORTING DASHBOARD DATA
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Export
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Export Your{" "}
                                    <span className="text-warning">Data</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The dashboard is powerful on screen. But sometimes you need the
                                    data in a spreadsheet, a PDF, or an automated email. Here is how
                                    to get it out.
                                </p>
                            </div>

                            <div className="export-container grid grid-cols-1 md:grid-cols-3 gap-6">
                                {exportItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="export-card border-4 border-yellow/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-yellow">
                                            <i className={`${item.icon} text-lg text-dark`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best Practices For{" "}
                                    <span className="text-info">Dashboard Usage</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Six habits that turn the dashboard from a page you visit into
                                    a tool that drives decisions.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-teal/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-teal">
                                            <i className={`${item.icon} text-xl text-info`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COMMON QUESTIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    FAQ
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Common{" "}
                                    <span className="text-success">Questions</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The questions we hear most often about the dashboard. If your
                                    question is not here, reach out to support.
                                </p>
                            </div>

                            <div className="faq-container space-y-4">
                                {faqItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="faq-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <h3 className="font-black text-base uppercase tracking-wide mb-3 text-base-content">
                                            <i className="fa-duotone fa-regular fa-circle-question text-success mr-2"></i>
                                            {item.question}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70 ml-7">
                                            {item.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Dashboard not behaving? Check here first.
                                    These are the issues we see most often.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {troubleshootItems.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-coral/15 bg-base-100 p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-coral">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-dark"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content pt-1">
                                                {item.symptom}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-base-content/60">
                                                <span className="font-bold text-base-content/80 uppercase text-xs tracking-wider">Likely cause:</span>{" "}
                                                {item.cause}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                <span className="font-bold text-info uppercase text-xs tracking-wider">Fix:</span>{" "}
                                                {item.fix}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NEXT STEPS / RELATED
                   ══════════════════════════════════════════════════════════════ */}
                <section className="dashboard-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12  border-4 border-teal" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-teal" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6  bg-coral" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-info" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-teal text-dark">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-info">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your dashboard is wired up. Now learn the features that feed
                                    every metric and widget you just read about.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`group relative border-4 ${a.border} bg-base-100 transition-transform hover:-translate-y-1`}
                                        >
                                            <div className={`h-2 ${a.bg}`} />
                                            <div className="p-6">
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                    <i className={`${item.icon} text-lg text-white`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-base-content">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-base-content/70">
                                                    {item.description}
                                                </p>
                                                <div className="mt-6 pt-4 border-t-2 border-base-content/10 flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${a.text}`}>
                                                        Read Guide
                                                    </span>
                                                    <i className={`fa-solid fa-arrow-right text-sm ${a.text} transition-transform group-hover:translate-x-1`}></i>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
                                <Link
                                    href="/public/documentation-memphis/feature-guides"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-teal bg-teal text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book-open"></i>
                                    All Feature Guides
                                </Link>
                                <Link
                                    href="/public/documentation-memphis"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-base-content text-base-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    All Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </DashboardAnimator>
        </>
    );
}
