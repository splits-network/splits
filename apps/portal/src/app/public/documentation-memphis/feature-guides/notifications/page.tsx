import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { NotificationsAnimator } from "./notifications-animator";

export const metadata = getDocMetadata("feature-guides/notifications");

// --- Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Unified Alert System",
        description:
            "Every event that matters surfaces through one notification system. Stage changes, new messages, assignment updates, placement milestones, billing events -- they all flow into a single, prioritized feed. You do not need to monitor five different pages to know what happened. The notification center is your command post. Open it. See everything. Act on what matters.",
    },
    {
        icon: "fa-duotone fa-regular fa-bolt",
        title: "Real-Time Delivery",
        description:
            "Notifications arrive the moment an event fires. A candidate moves to interview stage? You know instantly. A recruiter submits a candidate? The hiring manager sees it before they finish their coffee. There is no polling, no refresh cycle, no five-minute delay. Events push to your screen in real time over WebSocket connections. If the platform knows, you know.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Multi-Channel Reach",
        description:
            "Not everyone lives inside the platform. Notifications reach you where you are -- in-app alerts when you are active, email digests when you are away, and push notifications on mobile. The system adapts to your presence. If you are online, it does not spam your inbox. If you have been away for hours, it sends a summary email so nothing slips through.",
    },
    {
        icon: "fa-duotone fa-regular fa-sliders",
        title: "Granular Control",
        description:
            "You decide what reaches you and how. Toggle notification types individually. Set quiet hours. Choose email frequency -- instant, hourly digest, or daily summary. Mute specific roles or candidates when you need focused work time. The system does not decide what is important to you. You do. And you can change your mind at any time from Settings.",
    },
];

const notificationTypes = [
    {
        number: "01",
        title: "Pipeline Activity",
        description:
            "When a candidate moves between stages -- applied, screened, interviewed, offered, placed, or rejected -- every stakeholder on that role receives a notification. The alert includes the candidate name, the previous stage, the new stage, and who made the change. You can click directly into the candidate record from the notification to review details or take the next action.",
        detail:
            "Pipeline notifications are the heartbeat of the recruiting process. They keep recruiters, hiring managers, and company admins synchronized without requiring anyone to manually broadcast updates. When a hiring manager moves a candidate to the offer stage, the sourcing recruiter knows immediately. When an admin rejects a candidate, the hiring manager sees why.",
        tip: "If you manage multiple roles, pipeline notifications for high-priority roles will surface first. Use role-level muting for roles that are in early sourcing where you do not need real-time updates yet.",
    },
    {
        number: "02",
        title: "Message Alerts",
        description:
            "Every new message in a thread you participate in triggers a notification. The alert shows the sender name, the first line of the message, and the linked context -- whether it is a role, candidate, or general conversation. Clicking the notification opens the thread and scrolls to the new message automatically.",
        detail:
            "Message alerts are distinct from the Messages inbox. The inbox is where you go to read and respond. Notifications are what bring you there when something new arrives. If you are already viewing a thread when a new message appears, the notification is suppressed -- the system knows you are already engaged. Notifications only fire for threads you are not currently viewing.",
        tip: "If group threads get noisy, mute specific conversations from the thread menu. You will still see the thread in your inbox but it will not trigger push notifications or email alerts.",
    },
    {
        number: "03",
        title: "Assignment Updates",
        description:
            "When you are assigned to a new role, removed from an assignment, or when assignment terms change, the system notifies you immediately. Assignment notifications include the role title, the company name, the split fee terms, and a direct link to the assignment details. For recruiters, this is how you know when new work lands on your desk.",
        detail:
            "Assignment notifications also fire when deadlines change, when split terms are renegotiated, or when a role's requirements are updated by the hiring company. These are not just 'FYI' alerts -- they often require action. A changed deadline means you need to adjust your sourcing timeline. Updated requirements mean your current shortlist may need revision.",
        tip: "Assignment notifications are high priority by default. Do not mute them unless you are on vacation with proper coverage arranged. Missing an assignment update can mean missing a deadline.",
    },
    {
        number: "04",
        title: "Billing And Payout Events",
        description:
            "Invoice generation, payment received, payout initiated, payout completed, subscription changes, and failed payment retries all generate notifications. Billing notifications go to the user responsible for the financial action and to company admins. The alert includes the amount, the associated placement or subscription, and a link to the billing record.",
        detail:
            "Financial notifications are critical for cash flow visibility. When a placement fee is invoiced, the recruiter knows their work is moving toward payment. When a payout lands, they see it instantly. When a payment fails, the company admin can act before the account is flagged. These are not optional updates -- they are the financial pulse of your business on the platform.",
        tip: "Company admins should ensure billing notifications are routed to at least two people in the organization. If the primary billing contact is unavailable, a secondary recipient prevents missed payment issues.",
    },
    {
        number: "05",
        title: "System And Platform Alerts",
        description:
            "Scheduled maintenance windows, feature releases, security advisories, and account-level changes generate system notifications. These are platform-wide alerts that affect all users or specific user segments. They appear with a distinct visual treatment so they are not confused with activity-based notifications. System alerts cannot be muted -- they are essential operational information.",
        detail:
            "System notifications are rare by design. The platform does not bombard you with release notes or minor updates. System alerts fire for events that affect your workflow -- planned downtime, breaking changes to APIs you depend on, security incidents that require password resets, or compliance updates that affect data handling. When you see a system alert, read it.",
        tip: "System notifications are always marked as high priority and pinned to the top of your notification feed until dismissed. They will also trigger an email regardless of your digest preferences.",
    },
];

const preferenceItems = [
    {
        icon: "fa-duotone fa-regular fa-toggle-on",
        title: "Per-Category Toggles",
        description:
            "Each notification category -- pipeline, messages, assignments, billing, system -- has its own on/off toggle for each channel: in-app, email, and push. Want pipeline alerts in-app but not via email? Toggle it. Need billing notifications via email but not push? Set it. Every combination is supported. The default configuration sends everything everywhere. Customize from there.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Quiet Hours",
        description:
            "Set daily quiet hours when in-app and push notifications are suppressed. During quiet hours, notifications still accumulate in your feed -- they just do not interrupt you. When quiet hours end, your feed shows everything that happened while you were away, sorted by priority. Email digests respect quiet hours too -- they batch until the window closes.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-clock",
        title: "Email Digest Frequency",
        description:
            "Choose how often the platform sends email summaries: real-time (every notification gets its own email), hourly (batched summary every hour), daily (one email at end of day), or off (no emails). Real-time works for low-volume users. Daily digest works for users who check the platform frequently and do not need email redundancy.",
    },
    {
        icon: "fa-duotone fa-regular fa-volume-slash",
        title: "Role-Level Muting",
        description:
            "Mute notifications for specific roles without affecting your global settings. When you mute a role, you stop receiving pipeline and assignment notifications for that role. Messages are still delivered because they may contain direct requests. Muting is temporary -- unmute at any time from the role detail page or from Settings.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-group",
        title: "Thread-Level Muting",
        description:
            "Mute individual message threads that have become noisy. Muted threads do not trigger push or email notifications. The thread still appears in your Messages inbox with an unread count, but it does not interrupt your workflow. Useful for group threads where you are included for visibility but do not need real-time alerts.",
    },
    {
        icon: "fa-duotone fa-regular fa-mobile",
        title: "Device-Specific Settings",
        description:
            "Configure notification behavior differently per device. You might want push notifications on your phone but not on your desktop where you have the platform open all day. Device settings are independent -- changing your phone configuration does not affect your laptop. Each device is registered separately in Settings.",
    },
];

const managingItems = [
    {
        number: "01",
        name: "Read And Unread Status",
        description:
            "Notifications start as unread and are marked as read when you click them. The unread count in your navigation bar reflects total unread notifications across all categories. You can mark individual notifications as read without clicking through to the linked record -- useful for quick triage when you want to acknowledge but not act immediately.",
        who: "Automatic on click, manual via menu",
        color: "warning",
    },
    {
        number: "02",
        name: "Bulk Actions",
        description:
            "Select multiple notifications and mark them all as read, or dismiss them in bulk. Bulk actions are essential when you return from time away and find dozens of accumulated alerts. Rather than clicking through each one, select the category, select all, and mark as read. Then focus on the handful that still need attention.",
        who: "Available in notification center toolbar",
        color: "info",
    },
    {
        number: "03",
        name: "Priority Indicators",
        description:
            "Notifications carry priority levels: critical (red), high (orange), normal (blue), and low (gray). Priority is assigned automatically based on the event type and your role. A failed payment is always critical. A new message in a group thread is normal. A system maintenance reminder is low. Priority indicators help you triage without reading every alert.",
        who: "Automatic based on event type",
        color: "error",
    },
    {
        number: "04",
        name: "Action Items",
        description:
            "Some notifications include direct action buttons -- 'Review Candidate', 'Approve Payout', 'Respond to Message', 'Update Assignment'. These inline actions let you complete tasks without navigating to a separate page. Action items reduce the friction between knowing something happened and doing something about it. One click from notification to resolution.",
        who: "Attached to actionable events",
        color: "success",
    },
];

const historyItems = [
    {
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        title: "Full Notification History",
        description: "Every notification you have ever received is preserved in your notification history. Scroll back days, weeks, or months to find that alert you vaguely remember. The history is searchable by keyword, filterable by category, and sortable by date or priority. Nothing is permanently deleted from your notification history unless you explicitly clear it.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter",
        title: "History Filters",
        description: "Filter your notification history by type (pipeline, messages, assignments, billing, system), by date range, by read/unread status, or by priority level. Combining filters lets you answer questions like 'Show me all critical billing notifications from last month' or 'Show me unread assignment updates from this week' instantly.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        title: "Search Notifications",
        description: "Full-text search across your notification history. Type a candidate name, role title, dollar amount, or any keyword. Results appear instantly with the matching notification highlighted in context. Search spans the full text of the notification, including linked record titles and action descriptions.",
    },
    {
        icon: "fa-duotone fa-regular fa-trash-can",
        title: "Clear And Dismiss",
        description: "Clear old notifications to keep your feed focused. Clearing removes notifications from your active feed but preserves them in history. Dismiss individual notifications you have handled. Dismissing is a soft action -- the notification moves to the dismissed section where it remains accessible but no longer clutters your primary view.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-export",
        title: "Export Notification Log",
        description: "Company admins can export notification logs for audit and compliance purposes. Exports include the notification type, timestamp, recipient, linked record, and action taken. Export formats support CSV and JSON for integration with external reporting tools. Useful for tracking response times and ensuring SLA compliance.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Configure Before You Launch",
        description:
            "Set your notification preferences during onboarding, not after you are buried in alerts. The default configuration sends everything via every channel. That works for the first day. By day three, you will be overwhelmed. Spend five minutes in Settings right now. Decide which categories need real-time alerts and which can wait for a daily digest.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell-slash",
        title: "Use Muting Strategically",
        description:
            "Muting is not admitting defeat. It is noise management. Mute roles that are in early pipeline stages where daily updates do not change your actions. Mute group threads where you are CC'd for awareness. Unmute when things heat up -- when a role moves to interview stage, when a thread becomes decision-critical. Muting and unmuting is a one-click operation.",
    },
    {
        icon: "fa-duotone fa-regular fa-inbox",
        title: "Triage Daily",
        description:
            "Treat your notification feed like email. Open it at least once a day. Scan for critical and high-priority items first. Act on anything that takes less than two minutes. Flag or star items that need deeper attention. Dismiss everything you have handled. A clean notification feed at the end of each day means nothing is falling through the cracks.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Set Quiet Hours",
        description:
            "Recruiting does not stop at 5 PM, but your notifications should. Set quiet hours that match your non-working hours. Notifications still accumulate -- they just do not buzz your phone at midnight. When you start work the next morning, everything is waiting in order. This protects your focus and prevents notification fatigue from creeping in outside business hours.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope-open",
        title: "Match Email Frequency To Usage",
        description:
            "If you check the platform five times a day, you do not need real-time email notifications -- use hourly or daily digests. If you only check the platform once a day, real-time emails are your lifeline. Match the email frequency to how often you open the portal. The goal is zero missed alerts with minimum inbox noise.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Review Settings Monthly",
        description:
            "Your notification needs change as your workload changes. At the start of a quarter, you might manage three roles. By mid-quarter, you might manage twelve. The settings that worked for three roles will drown you at twelve. Review your notification preferences monthly and adjust muting, digest frequency, and category toggles based on your current volume.",
    },
];

const troubleshootItems = [
    {
        symptom: "I am not receiving any notifications",
        cause: "Notifications are disabled globally in settings, browser notifications are blocked, or your account session expired.",
        fix: "Go to Settings > Notifications and verify that at least one channel (in-app, email, push) is enabled for each category you need. Check your browser's notification permissions for the portal domain. Sign out and sign back in to refresh your session.",
    },
    {
        symptom: "Email notifications are not arriving",
        cause: "Email digest frequency is set to 'off', the email address on your account is incorrect, or emails are being caught by spam filters.",
        fix: "Check Settings > Notifications > Email Digest Frequency and ensure it is not set to 'off'. Verify your email address under Profile settings. Check your spam/junk folder and whitelist the portal's sending domain.",
    },
    {
        symptom: "Notifications arrive late or in batches",
        cause: "Your email digest frequency is set to hourly or daily, causing notifications to batch rather than deliver in real time.",
        fix: "If you need instant email alerts, switch your digest frequency to 'real-time'. For in-app notifications, ensure your browser tab is active and your internet connection is stable. WebSocket connections require a stable network.",
    },
    {
        symptom: "Notification count badge does not clear after reading",
        cause: "Browser cache is stale, the notification was not fully loaded when clicked, or a new notification arrived between clicking and the page loading.",
        fix: "Refresh the page to force a sync. If the badge persists, open the notification center and manually mark all as read. Clear your browser cache if the issue continues across sessions.",
    },
    {
        symptom: "I stopped receiving notifications for a specific role",
        cause: "You muted that role's notifications, you were removed from the assignment, or the role was closed.",
        fix: "Check if the role is muted in Settings > Muted Roles or on the role detail page. Verify your assignment status -- if you were removed from the role, notifications stop automatically. Check if the role is still active.",
    },
    {
        symptom: "Notification links lead to a 'not found' page",
        cause: "The linked record was deleted, your permissions changed since the notification was sent, or the record was moved to a different state that restricts your access.",
        fix: "The record may have been removed or your role may no longer have access. Contact your company admin to verify the record exists and that your permissions are correct. If the record was legitimately deleted, the notification is now orphaned -- dismiss it.",
    },
    {
        symptom: "I am getting too many notifications and it is overwhelming",
        cause: "Default settings send all notification types via all channels. As your activity volume increases, this becomes unsustainable without customization.",
        fix: "Go to Settings > Notifications and audit each category. Disable email for categories you check in-app. Set quiet hours for after-work periods. Mute low-priority roles. Switch email digest to daily for non-urgent categories. The goal is signal, not noise.",
    },
    {
        symptom: "Push notifications work on one device but not another",
        cause: "Each device has independent notification permissions. The second device may have push notifications blocked at the browser or OS level.",
        fix: "On the affected device, check the browser's notification permissions for the portal URL. On mobile, check the app notification settings in your device's system settings. Each device must independently grant notification access.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/messages",
        icon: "fa-duotone fa-regular fa-comments",
        title: "Messages",
        description: "Deep dive into the messaging system that generates many of your notifications.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Applications",
        description: "Understand pipeline stages and the application events that trigger notifications.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/billing",
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Billing",
        description: "Learn about billing events, payouts, and the financial notifications they generate.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-dark" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-dark" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-dark" },
};

// --- Page ────────────────────────────────────────────────────────────────────

export default function NotificationsFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/notifications")} id="docs-feature-guides-notifications-jsonld" />
            <NotificationsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-14 h-14  border-4 border-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[38%] right-[10%] w-10 h-10  bg-coral opacity-0" />
                        <div className="memphis-shape absolute bottom-[20%] left-[18%] w-8 h-8  bg-teal opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[30%] w-12 h-12 rotate-12 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[42%] w-14 h-5 -rotate-6 border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[58%] left-[35%] w-6 h-6 rotate-45 bg-teal opacity-0" />
                        {/* Bell silhouette */}
                        <svg className="memphis-shape absolute top-[16%] left-[48%] opacity-0" width="32" height="36" viewBox="0 0 32 36">
                            <path d="M16,2 C16,2 6,6 6,16 L6,24 L2,28 L30,28 L26,24 L26,16 C26,6 16,2 16,2 Z" fill="none" className="stroke-warning" strokeWidth="3" />
                            <circle cx="16" cy="33" r="3" fill="none" className="stroke-warning" strokeWidth="2" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[24%] right-[55%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2  bg-yellow" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-error" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-warning">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-warning">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-warning">Notifications</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-yellow text-dark">
                                    <i className="fa-duotone fa-regular fa-bell"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Never Miss{" "}
                                <span className="relative inline-block">
                                    <span className="text-warning">A Beat.</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-yellow" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                RECRUITING IS A TIMING GAME. The best candidate goes to the fastest
                                team. The best offer goes to the most responsive hiring manager. The
                                notification system is how you stay ahead of every event that matters --
                                pipeline changes, new messages, assignment updates, billing milestones,
                                and system alerts. All of it, delivered the moment it happens, through
                                the channels you choose. This guide covers every notification type, every
                                preference setting, and every strategy for staying informed without
                                drowning in noise.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-warning"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building text-warning"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NOTIFICATION SYSTEM OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    How Notifications{" "}
                                    <span className="text-warning">Work</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The notification system is event-driven. Every meaningful action
                                    on the platform generates an event. Events are evaluated against
                                    your preferences. Matching events become notifications. Simple.
                                    Predictable. Under your control.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-yellow/30 bg-base-100 p-6 opacity-0"
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
                    NOTIFICATION TYPES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Types
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Triggers{" "}
                                    <span className="text-error">Alerts</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Five categories of events generate notifications. Each category
                                    has its own priority logic, delivery rules, and configuration
                                    options. Know what fires and why so you can tune your settings
                                    with confidence.
                                </p>
                            </div>

                            <div className="type-container space-y-6">
                                {notificationTypes.map((step, index) => (
                                    <div
                                        key={index}
                                        className="type-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-coral">
                                            <span className="text-2xl font-black text-dark">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-coral text-dark text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {step.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-base-content/50 mb-4">
                                                {step.detail}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-coral/10 border-l-4 border-coral">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-error mt-0.5"></i>
                                                <p className="text-sm text-base-content/60">
                                                    {step.tip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PREFERENCES AND SETTINGS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Settings
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Your{" "}
                                    <span className="text-info">Preferences</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Notifications should work for you, not against you. Every
                                    setting exists because someone asked for it. Configure once,
                                    adjust as your workload evolves.
                                </p>
                            </div>

                            <div className="preference-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {preferenceItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="preference-card border-4 border-teal/20 bg-base-100 p-6 opacity-0"
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

                            {/* Settings callout */}
                            <div className="mt-8 p-6 border-4 border-teal bg-teal/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-teal">
                                        <i className="fa-duotone fa-regular fa-gear text-dark"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Where To Find Settings
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            All notification preferences live under Settings &gt; Notifications
                                            in the portal sidebar. Changes take effect immediately -- no
                                            save button, no page refresh required. Your preferences sync
                                            across all devices. Change it on your laptop, it applies on
                                            your phone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    MANAGING NOTIFICATIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    Managing
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Stay{" "}
                                    <span className="text-success">Organized</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Receiving notifications is half the equation. Managing them --
                                    triaging, acting, clearing -- is what separates productive
                                    users from overwhelmed ones.
                                </p>
                            </div>

                            <div className="managing-container space-y-4">
                                {managingItems.map((item) => (
                                    <div
                                        key={item.number}
                                        className="managing-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${item.color}`}>
                                            <span className={`text-2xl font-black text-${item.color}-content`}>
                                                {item.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 bg-${item.color} text-${item.color}-content text-sm font-black`}>
                                                    {item.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {item.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-base-200 border-l-4 border-base-content/20">
                                                <i className="fa-duotone fa-regular fa-gear text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {item.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NOTIFICATION HISTORY AND ARCHIVE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-dark">
                                    History
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Notification{" "}
                                    <span className="text-secondary">Archive</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every notification is preserved. Search back through days,
                                    weeks, or months to find the alert you need. Nothing
                                    disappears unless you explicitly clear it.
                                </p>
                            </div>

                            <div className="history-container space-y-4">
                                {historyItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="history-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple">
                                            <i className={`${item.icon} text-lg text-dark`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-sm uppercase tracking-wide mb-1 text-base-content">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-base-content/60">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* History callout */}
                            <div className="mt-8 p-6 border-4 border-purple bg-purple/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple">
                                        <i className="fa-duotone fa-regular fa-database text-dark"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Retention Policy
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Notification history is retained indefinitely by default.
                                            Company admins can configure retention policies to
                                            automatically purge notifications older than a specified
                                            period. Cleared notifications are permanently removed --
                                            they cannot be restored. Configure retention carefully.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Master Your{" "}
                                    <span className="text-success">Signal</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between teams that close fast and teams that
                                    lose candidates to silence comes down to notification hygiene.
                                    These six habits keep you responsive without burning out.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-success">
                                            <i className={`${item.icon} text-xl text-success`}></i>
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
                                    Notifications not behaving? These are the most common issues
                                    and how to resolve them. Check here before contacting support.
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
                                                <span className="font-bold text-success uppercase text-xs tracking-wider">Fix:</span>{" "}
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
                <section className="notifications-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12  border-4 border-yellow" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-coral" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6  bg-teal" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-yellow text-dark">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-warning">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your notification system is configured. Now explore the features
                                    and workflows that generate the events you are tracking.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-yellow bg-yellow text-dark transition-transform hover:-translate-y-1"
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
            </NotificationsAnimator>
        </>
    );
}
