import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { CommunicateAnimator } from "./communicate-animator";

export const metadata = getDocMetadata("core-workflows/communicate-with-recruiters-and-candidates");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Messages Access",
        description:
            "You need access to the Messages section in the sidebar. Every user with a platform account has messaging enabled by default. If you cannot see Messages, contact your organization admin to verify your permissions.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Active Roles Or Applications",
        description:
            "Conversations are contextual. You need at least one active role, application, or placement to have something to discuss. Messages without context are less effective than messages tied to a specific candidate or role.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Notifications Enabled",
        description:
            "Enable browser and email notifications so you do not miss time-sensitive messages. Notification preferences are in Settings. Without them, you are relying on manually checking your inbox, which is unreliable at scale.",
    },
];

const messagingOverview = [
    {
        number: "01",
        name: "Real-Time Messaging",
        description: "Messages arrive instantly via WebSocket. No page refresh needed. When someone sends you a message, it appears in your inbox within seconds. Unread counts update in the sidebar in real time. This is the primary coordination channel for day-to-day recruiting operations.",
        who: "All platform users",
        color: "info",
    },
    {
        number: "02",
        name: "Contextual Conversations",
        description: "Every conversation is tied to a context: a role, a candidate, an application, or a placement. This means messages live where the work lives. When you open a conversation, you see the full history alongside the relevant candidate or role details. No more hunting through email threads to find that one piece of feedback.",
        who: "Recruiters, Hiring Managers, Admins",
        color: "secondary",
    },
    {
        number: "03",
        name: "Notification System",
        description: "Notifications are the push layer on top of messages. They alert you to actions that need your attention: new messages, stage changes, mentions, application updates. Notifications link directly to the item that triggered them. Click a notification and you land exactly where you need to be.",
        who: "All platform users",
        color: "warning",
    },
    {
        number: "04",
        name: "Application Notes",
        description: "Notes are the permanent record. Messages are for coordination. Notes are for decisions. When you make a judgment about a candidate, write it as a note on the application, not a message. Notes persist across stage changes and form the audit trail. Messages are ephemeral context. Notes are the historical record.",
        who: "Reviewers, Hiring Managers, Admins",
        color: "success",
    },
];

const conversationSteps = [
    {
        number: "01",
        title: "Open Messages",
        description:
            "Navigate to Messages from the sidebar. You will see your conversation list on the left and a detail panel on the right. Conversations are sorted by most recent activity. Unread conversations appear at the top with a bold title and an unread count badge. If you have no conversations yet, the panel will prompt you to start one.",
        tip: "Pin frequently accessed conversations. Pinned conversations stay at the top of your list regardless of activity, making it easy to track your most important threads.",
    },
    {
        number: "02",
        title: "Start A New Conversation",
        description:
            "Click the New Message button. Select the context: a role, a candidate, or an application. Then select participants. The platform automatically suggests relevant collaborators based on the context you chose -- the recruiter who submitted the candidate, the hiring manager for the role, team members with access. You can add or remove participants at any time.",
        tip: "Start conversations from the application detail view. When you are reviewing a candidate and want to discuss them, the New Message button on that page pre-fills the context and suggests the right participants.",
    },
    {
        number: "03",
        title: "Write And Send Messages",
        description:
            "Type your message in the compose area. Messages support rich text formatting, including bold, italic, and bullet lists. Press Enter to send, or Shift+Enter for a new line. Messages are delivered instantly to all participants. You can see delivery status and read receipts in the thread.",
        tip: "Keep messages focused on one topic per thread. If the conversation shifts to a different candidate or role, start a new conversation with the appropriate context instead of mixing topics.",
    },
    {
        number: "04",
        title: "Review Thread History",
        description:
            "Scroll up in any conversation to see the full history. Every message is timestamped and attributed to the sender. If participants were added later, they can see messages from before they joined. The thread history is the complete record of coordination for that context. Nothing is deleted.",
        tip: "Use the search bar within a conversation to find specific messages. Type a keyword and the thread highlights matching messages, making it easy to find past decisions or shared information.",
    },
    {
        number: "05",
        title: "Attach Files And Documents",
        description:
            "Click the attachment icon to upload files directly into a conversation. Supported formats include PDF, images, Word documents, and spreadsheets. Attachments are stored securely and remain accessible to all conversation participants. Use this for sharing resumes, interview scorecards, offer letters, or any document that needs immediate attention from collaborators.",
        tip: "For documents that should be part of the permanent application record, upload them to the Application Documents section instead. Conversation attachments are for quick sharing. Application documents are for the audit trail.",
    },
    {
        number: "06",
        title: "Manage Notifications",
        description:
            "Open the Notifications panel from the bell icon in the top navigation. Each notification shows what happened, who triggered it, and when. Click any notification to jump directly to the relevant item. Mark notifications as read individually or clear all at once. Configure notification preferences in Settings to control which events trigger alerts and whether they arrive in-app, by email, or both.",
        tip: "Set quiet hours for email notifications if you work across time zones. In-app notifications still accumulate, but your inbox stays clean during off hours.",
    },
];

const messageFeatures = [
    {
        icon: "fa-duotone fa-regular fa-at",
        title: "@ Mentions",
        description:
            "Type @ followed by a name to mention a specific participant. Mentioned users receive a highlighted notification that stands out from regular message alerts. Use mentions when you need a specific person to see and respond to a message. Mentioning someone who is not in the conversation will prompt you to add them.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        title: "Conversation Search",
        description:
            "Search across all your conversations from the Messages page. The search indexes message content, participant names, and context labels. Results show matching messages with highlighted keywords and the conversation they belong to. Click a result to jump directly to that message in the thread.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter",
        title: "Filters And Organization",
        description:
            "Filter conversations by context type (role, candidate, application), by participant, or by unread status. Filters help you focus when your inbox is busy. Combined with pinning, filters give you full control over what you see first and what can wait.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        title: "Read Receipts And Presence",
        description:
            "See when your message has been delivered and read. Presence indicators show which participants are currently online. This helps you gauge whether to wait for a response or follow up through another channel. Presence is updated in real time.",
    },
    {
        icon: "fa-duotone fa-regular fa-paperclip",
        title: "File Attachments",
        description:
            "Share files directly in conversations. Drag and drop or use the attach button. Files are stored securely in the platform and accessible to all conversation participants. Supported formats include PDF, images, Word, Excel, and plain text. File size limit is displayed in the upload dialog.",
    },
    {
        icon: "fa-duotone fa-regular fa-link",
        title: "Deep Links From Notifications",
        description:
            "Every notification contains a deep link to the exact item that triggered it. A notification about a new message takes you to that message in the thread. A notification about a stage change takes you to the application. No hunting, no guessing. Click and you are there.",
    },
];

const communicationChannels = [
    {
        icon: "fa-duotone fa-regular fa-message-lines",
        title: "Messages",
        description:
            "The primary coordination tool. Use messages for scheduling, questions, updates, and real-time discussion about candidates, roles, and applications. Messages are contextual, searchable, and persistent.",
        when: "Day-to-day coordination, scheduling, quick questions, sharing files.",
        note: "Messages are visible to all conversation participants. Be mindful of who is in the thread before sharing sensitive information.",
    },
    {
        icon: "fa-duotone fa-regular fa-sticky-note",
        title: "Application Notes",
        description:
            "The permanent record. Use notes to document decisions, interview feedback, assessment results, and rejection reasons. Notes live on the application and persist through every stage transition.",
        when: "Recording decisions, interview feedback, compliance-sensitive documentation.",
        note: "Notes have visibility controls. Internal notes are visible only to your organization. Shared notes are visible to the submitting recruiter.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Notifications",
        description:
            "The alert system. Notifications push important events to you: new messages, stage changes, mentions, assignment updates. They link directly to the relevant item. Notifications are not a conversation channel -- they are a pointer to where action is needed.",
        when: "Staying informed about events across all your roles and applications.",
        note: "Configure notification preferences to avoid alert fatigue. Not every event needs an email notification.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Email Notifications",
        description:
            "Email extends notifications beyond the platform. When you are not logged in, email ensures critical updates still reach you. Email notifications contain a summary and a link back to the platform. They are a safety net, not a primary workflow.",
        when: "Offline or away from the platform, urgent updates that cannot wait.",
        note: "Email notifications respect quiet hours. Configure your schedule in Settings to control when emails are delivered.",
    },
];

const bestPractices = [
    {
        title: "Messages For Coordination, Notes For Decisions",
        description: "This is the foundational rule. Messages are for scheduling interviews, asking clarifying questions, sharing updates, and real-time discussion. Notes are for documenting why you advanced or declined a candidate, what happened in an interview, and any formal assessment. Mixing these creates confusion -- decisions buried in chat threads are lost decisions.",
        icon: "fa-duotone fa-regular fa-split",
    },
    {
        title: "Respond Within 24 Hours",
        description: "Recruiting is time-sensitive. A 48-hour silence on a candidate question can cost you the hire. Set a personal SLA: respond to all messages within 24 hours, even if the response is 'I need more time to review.' Acknowledging receipt keeps the process moving and builds trust with collaborators.",
        icon: "fa-duotone fa-regular fa-clock",
    },
    {
        title: "One Topic Per Conversation",
        description: "Conversations are contextual for a reason. If you start discussing a different candidate in a thread about Candidate A, that discussion becomes invisible to anyone searching for Candidate B later. Start a new conversation with the correct context. It takes ten seconds and saves hours of confusion.",
        icon: "fa-duotone fa-regular fa-layer-group",
    },
    {
        title: "Use Mentions For Accountability",
        description: "When you need a specific person to act, mention them. An unmentioned message in a group thread is a suggestion. A mentioned message is a request. Mentions trigger highlighted notifications that stand out from regular alerts. Use them deliberately and they become a reliable escalation tool.",
        icon: "fa-duotone fa-regular fa-at",
    },
    {
        title: "Archive Completed Conversations",
        description: "Once a hire is made or an application is closed, archive the related conversations. Archived conversations are still searchable but no longer clutter your inbox. Regular archiving keeps your active conversation list manageable and focused on work that needs attention now.",
        icon: "fa-duotone fa-regular fa-box-archive",
    },
    {
        title: "Review Notifications Daily",
        description: "Treat your notification panel like a task queue. Each notification represents something that happened. Some require action, some are informational. Sweep through your notifications at least once daily, handle what needs handling, and clear the rest. Unread notification counts that climb into the hundreds help nobody.",
        icon: "fa-duotone fa-regular fa-bell-on",
    },
];

const complianceItems = [
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Visibility Controls",
        description:
            "Messages are visible to all conversation participants. Application notes have configurable visibility: internal (your organization only) or shared (visible to the submitting recruiter). Before writing anything sensitive, check who can see it. Misrouted feedback creates legal risk and damages recruiter relationships.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "Data Retention",
        description:
            "All messages and notes are retained for the life of the account. They form part of the compliance record for each application. Deletion is not available for individual messages because the audit trail must remain intact. If you need to correct a factual error, add a follow-up message with the correction rather than attempting to edit or delete.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Protected Information",
        description:
            "Never share candidate personal information (social security numbers, date of birth, medical information) in messages or notes. The platform is designed for professional recruiting communication. Sensitive personal data should be handled through your organization's secure HR systems, not through in-platform messaging.",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Fair Documentation",
        description:
            "Notes and messages form a discoverable record. Write as though anything you document could be reviewed during a compliance audit or legal proceeding. Focus on job-related qualifications, skills, experience, and interview performance. Avoid commentary on protected characteristics. Professional, specific, job-relevant feedback protects everyone.",
    },
];

const troubleshootItems = [
    {
        symptom: "Messages are not updating in real time",
        cause: "WebSocket connection may have dropped due to network interruption or browser inactivity.",
        fix: "Refresh the page. If messages still do not update, check your internet connection. The platform will automatically reconnect when connectivity is restored. If the problem persists, clear browser cache and reload.",
    },
    {
        symptom: "I cannot see a conversation I was previously in",
        cause: "You may have been removed from the conversation, or the conversation was archived.",
        fix: "Check the Archived section of your Messages. If the conversation is not there, ask a collaborator to re-add you. Only conversation creators and admins can manage participants.",
    },
    {
        symptom: "Notifications are not arriving",
        cause: "Notification preferences may be turned off, or browser notification permissions are blocked.",
        fix: "Go to Settings and verify that your notification preferences are enabled for the event types you expect. Check your browser settings to ensure notifications are allowed for the platform. For email notifications, check your spam folder.",
    },
    {
        symptom: "I cannot start a new conversation",
        cause: "The New Message button requires a context selection. If no roles or applications exist, there is nothing to attach the conversation to.",
        fix: "Ensure you have at least one active role or application. If you do, verify that you have the correct permissions to initiate conversations. Reach out to your organization admin if the button remains disabled.",
    },
    {
        symptom: "File attachments fail to upload",
        cause: "The file may exceed the size limit, or the file type is not supported.",
        fix: "Check the file size against the displayed limit in the upload dialog. Verify the file type is in the supported formats list (PDF, images, Word, Excel, plain text). If both are correct, try a different browser or clear your cache.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Learn how to evaluate candidates and move them through pipeline stages.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/invite-recruiters-or-teammates",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Invite Recruiters",
        description: "Add recruiters and teammates to your organization and assign roles.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows/create-and-publish-a-role",
        icon: "fa-duotone fa-regular fa-megaphone",
        title: "Create A Role",
        description: "Set up a new role, define requirements, and publish it to the network.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommunicateWithRecruitersMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/communicate-with-recruiters-and-candidates")} id="docs-communicate-jsonld" />
            <CommunicateAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-16 h-16 rounded-full border-[4px] border-info opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[10%] w-14 h-14 rounded-full bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[26%] w-12 h-12 rotate-12 bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[3px] border-info opacity-0" />
                        <div className="memphis-shape absolute top-[58%] left-[34%] w-6 h-6 rotate-45 bg-secondary opacity-0" />
                        {/* Speech bubble SVG */}
                        <svg className="memphis-shape absolute top-[14%] left-[44%] opacity-0" width="36" height="32" viewBox="0 0 36 32">
                            <rect x="2" y="2" width="32" height="22" rx="3" fill="none" className="stroke-info" strokeWidth="3" />
                            <polygon points="10,24 16,24 12,31" className="fill-info" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[52%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-info" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[48%] opacity-0" width="70" height="20" viewBox="0 0 70 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 70,16"
                                fill="none" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
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
                                    <Link href="/public/documentation-memphis/core-workflows" className="text-base-content/50 transition-colors hover:text-info">
                                        Core Workflows
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-info">Communicate</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-info text-info-content">
                                    <i className="fa-duotone fa-regular fa-comments"></i>
                                    Workflow 06
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Communicate With{" "}
                                <span className="relative inline-block">
                                    <span className="text-info">Recruiters & Candidates</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-info" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                Recruiting is a coordination sport. Messages, notifications, and notes
                                are the tools that keep everyone aligned. This guide covers everything:
                                starting conversations, managing threads, using mentions, attaching files,
                                searching history, and the practices that prevent missed updates and
                                duplicated effort.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-error"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-clipboard-check text-success"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PREREQUISITES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Before You Begin
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What You{" "}
                                    <span className="text-warning">Need</span>
                                </h2>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-3 gap-6">
                                {prerequisites.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-warning/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-warning">
                                            <i className={`${item.icon} text-lg text-warning-content`}></i>
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
                    MESSAGING SYSTEM OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-info text-info-content">
                                    System
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Messaging{" "}
                                    <span className="text-info">Overview</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The platform has four communication layers. Each serves a different
                                    purpose. Understanding when to use which one is the difference between
                                    a tight process and a chaotic one.
                                </p>
                            </div>

                            <div className="steps-container space-y-4">
                                {messagingOverview.map((item) => (
                                    <div
                                        key={item.number}
                                        className="step-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        {/* Number */}
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
                                                <i className="fa-duotone fa-regular fa-user-group text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {item.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Key distinction callout */}
                            <div className="mt-8 p-6 border-4 border-info bg-info/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-info">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-info-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            The Core Distinction
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Messages are for coordination. Notes are for documentation.
                                            If someone could make a hiring decision based on what you wrote,
                                            it belongs in a note on the application. If you are scheduling
                                            a call, asking a question, or sharing an update, it belongs in
                                            a message. Getting this right keeps your audit trail clean and
                                            your conversations focused.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    STEP-BY-STEP: CONVERSATIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Starting{" "}
                                    <span className="text-success">Conversations</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Follow these steps to start, manage, and get the most out of
                                    conversations. The process is the same for recruiters, hiring managers,
                                    and admins -- what changes is who you can see and message.
                                </p>
                            </div>

                            <div className="steps-container space-y-6">
                                {conversationSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        {/* Step number */}
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-success">
                                            <span className="text-2xl font-black text-success-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-success text-success-content text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-4">
                                                {step.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-success/10 border-l-4 border-success">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-success mt-0.5"></i>
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
                    MESSAGE FEATURES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Features
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Message{" "}
                                    <span className="text-secondary">Features</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Beyond basic messaging, the platform provides tools that make
                                    conversations more effective. Mentions, search, filters, and
                                    attachments turn messaging from a chat box into a coordination system.
                                </p>
                            </div>

                            <div className="features-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {messageFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="feature-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-secondary">
                                            <i className={`${feature.icon} text-xl text-secondary`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COMMUNICATION CHANNELS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Channels
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    When To Use{" "}
                                    <span className="text-error">What</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Four channels, four purposes. This breakdown tells you exactly
                                    which tool to reach for in every situation so you stop asking
                                    yourself &quot;should I message or note this?&quot;
                                </p>
                            </div>

                            <div className="channels-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {communicationChannels.map((channel, index) => (
                                    <div
                                        key={index}
                                        className="channel-card border-4 border-error/25 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-error">
                                                <i className={`${channel.icon} text-error-content`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                                {channel.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70 mb-3">
                                            {channel.description}
                                        </p>
                                        <div className="px-3 py-2 bg-base-200 border-l-4 border-base-content/20 mb-3">
                                            <p className="text-xs text-base-content/50">
                                                <span className="font-bold uppercase tracking-wider text-base-content/70">Use when:</span>{" "}
                                                {channel.when}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2 px-3 py-2 bg-error/10 border-l-4 border-error">
                                            <i className="fa-duotone fa-regular fa-circle-info text-error mt-0.5 text-xs"></i>
                                            <p className="text-xs text-base-content/50">
                                                {channel.note}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best{" "}
                                    <span className="text-success">Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Communication tools are only as good as the habits behind them.
                                    These six practices separate teams that coordinate well from
                                    teams that drown in noise.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bestPractices.map((practice, index) => (
                                    <div
                                        key={index}
                                        className="practice-card flex items-start gap-4 p-5 border-2 border-base-content/10 bg-base-100 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                            <i className={`${practice.icon} text-success-content`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide mb-1 text-base-content">
                                                {practice.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {practice.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PRIVACY & COMPLIANCE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Compliance
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Privacy &{" "}
                                    <span className="text-warning">Compliance</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Everything you write on the platform is a record. Messages,
                                    notes, and notifications form a discoverable audit trail. These
                                    guidelines keep you professional and protected.
                                </p>
                            </div>

                            <div className="compliance-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {complianceItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="compliance-card border-4 border-warning/25 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 flex items-center justify-center border-4 border-warning">
                                                <i className={`${item.icon} text-warning`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Compliance callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Write Like It Will Be Audited
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Because it might be. Every message and note is retained and can
                                            be surfaced during compliance reviews or legal proceedings. Stick
                                            to job-related qualifications, professional assessments, and
                                            factual observations. If you would not want it read aloud in a
                                            courtroom, do not write it. This is not paranoia -- it is professionalism.
                                        </p>
                                    </div>
                                </div>
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Something not working as expected? Check here first.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {troubleshootItems.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-error/15 bg-base-100 p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-error">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-error-content"></i>
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
                <section className="communicate-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-info" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-secondary" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-warning" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-info" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-info text-info-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-info">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    You know how to communicate effectively on the platform.
                                    Here are the workflows that connect to this one.
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
                                    href="/public/documentation-memphis/core-workflows"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-info bg-info text-info-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-route"></i>
                                    All Core Workflows
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
            </CommunicateAnimator>
        </>
    );
}
