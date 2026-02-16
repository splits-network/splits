import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { MessagesAnimator } from "./messages-animator";

export const metadata = getDocMetadata("feature-guides/messages");

// --- Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Centralized Conversations",
        description:
            "Every conversation on Splits Network lives in one place. Messages is not a side feature bolted onto a dashboard. It is the communication backbone of the platform. When a recruiter and a hiring manager need to align on a candidate, they do it here. When a company admin needs to clarify role requirements, they do it here. One inbox. Every thread. No context scattered across email, Slack, and sticky notes.",
    },
    {
        icon: "fa-duotone fa-regular fa-link",
        title: "Contextual Threading",
        description:
            "Conversations are tied to the work they reference. A thread about a candidate links to that candidate's profile. A thread about a role links to the role listing. This is not generic chat -- it is purpose-built communication where every message carries the context of what it is about. When you open a thread, you see the conversation and the subject it references side by side.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Notifications",
        description:
            "Messages arrive instantly. You do not need to refresh the page, poll for updates, or wonder if something was sent. The system pushes notifications the moment a message lands. Unread indicators update in real time across every view in the portal. You always know when someone is waiting on your response.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Privacy By Design",
        description:
            "Messages respect organizational boundaries. Recruiters from one organization cannot read conversations from another. Hiring managers see only threads relevant to their roles. Company admins have oversight of all threads within their organization. The permission model mirrors your team structure so sensitive discussions stay where they belong.",
    },
];

const threadSteps = [
    {
        number: "01",
        title: "Navigate To Messages",
        description:
            "Open Messages from the sidebar navigation. The inbox displays all your active conversations sorted by most recent activity. Unread threads float to the top with a bold indicator showing the number of unread messages. The layout is split: conversation list on the left, message detail on the right.",
        detail:
            "On mobile, the layout collapses to a single-column view. Tap a conversation to open the detail view. Use the back arrow to return to the list. The experience is optimized for both desktop workflows and quick mobile check-ins.",
        tip: "Check Messages at least twice a day. Delayed responses slow down hiring pipelines and frustrate collaborators who are waiting on your input.",
    },
    {
        number: "02",
        title: "Start A New Conversation",
        description:
            "Click the New Conversation button to begin a thread. Select the participants from your organization and any connected external recruiters or hiring contacts. Choose the context -- a specific role, application, or candidate -- so the thread is automatically linked to the relevant record.",
        detail:
            "You can start a conversation with one person or multiple participants. Group threads are useful when a decision requires input from several team members -- for example, a hiring manager, the sourcing recruiter, and a company admin discussing offer terms. Every participant sees the full thread history from the moment they are added.",
        tip: "Always link a conversation to a role or candidate. Unlinked threads lose context fast and become impossible to find later when you need to reference the discussion.",
    },
    {
        number: "03",
        title: "Compose And Send Messages",
        description:
            "Type your message in the compose area at the bottom of the thread. Messages support plain text with basic formatting. Press Enter or click Send to deliver. Messages are delivered instantly to all thread participants and appear in their inbox with an unread indicator.",
        detail:
            "Keep messages focused and actionable. State what you need, provide context, and set a clear expectation for response. 'Can you review the candidate by Friday?' is better than 'Thoughts?' The more specific your message, the faster you get a useful response.",
        tip: "Write messages that can be understood without opening the linked record. Include the key detail -- candidate name, role title, stage -- so recipients can triage without clicking through.",
    },
    {
        number: "04",
        title: "Review Thread History",
        description:
            "Scroll through a conversation to see the full message history. Every message shows the sender's name, their role, a timestamp, and any attachments. The thread is ordered chronologically so you can trace the evolution of a discussion from start to finish.",
        detail:
            "Long threads accumulate naturally over the life of a role or placement. The system does not collapse or paginate threads by default -- you see the full history in one scroll. For particularly long conversations, use the search bar within the thread to find specific keywords or dates.",
        tip: "Before adding a new message to a long thread, scan the recent history. Someone may have already answered your question or provided the update you need.",
    },
    {
        number: "05",
        title: "Close Or Resolve Threads",
        description:
            "When a conversation has run its course -- the decision is made, the candidate was placed, or the role was filled -- mark the thread as resolved. Resolved threads move out of your active inbox but remain searchable and accessible in the archive. This keeps your inbox clean without losing history.",
        detail:
            "Any participant can resolve a thread. Resolving does not delete messages or remove the thread from other participants' archives. If new activity is needed later, anyone can reopen a resolved thread and it returns to the active inbox for all participants.",
        tip: "Resolve threads proactively. An inbox full of stale conversations makes it harder to spot the threads that actually need your attention right now.",
    },
];

const notificationItems = [
    {
        number: "01",
        name: "Unread Indicators",
        description:
            "Every unread conversation shows a bold count badge next to the thread title. The Messages icon in the sidebar displays the total unread count across all threads. These indicators update in real time -- the moment you open a thread and scroll to the bottom, the unread count clears. No manual 'mark as read' required.",
        who: "Automatic on message receipt",
        color: "info",
    },
    {
        number: "02",
        name: "Push Notifications",
        description:
            "When a new message arrives and you are not actively viewing the thread, the system sends a push notification. Notifications include the sender name, the first line of the message, and the linked context (role or candidate). Click the notification to jump directly to the thread. Notifications respect your do-not-disturb settings.",
        who: "Triggered on new message delivery",
        color: "warning",
    },
    {
        number: "03",
        name: "Email Digests",
        description:
            "If you have unread messages that have gone unanswered for more than a configurable time window, the system sends an email digest summarizing the waiting threads. This catches messages that slip through when you are away from the platform. Email digests include direct links back to each thread.",
        who: "Configurable in notification settings",
        color: "success",
    },
    {
        number: "04",
        name: "Read Receipts",
        description:
            "When a participant opens and reads your message, a subtle read indicator appears below the message. This is not about surveillance -- it is about knowing whether your counterpart has seen your update. If a message has been read but not responded to, you know the ball is in their court. If it has not been read, a follow-up nudge is appropriate.",
        who: "Automatic on message view",
        color: "error",
    },
];

const featureItems = [
    {
        icon: "fa-duotone fa-regular fa-at",
        title: "@ Mentions And Tagging",
        description:
            "Type @ followed by a name to mention a specific participant in a group thread. Mentions trigger a highlighted notification for that person, ensuring they see the message even if the thread is busy. Use mentions when a message requires action from a specific person in a multi-participant conversation. The mentioned person's name is highlighted in the message body so it stands out visually.",
    },
    {
        icon: "fa-duotone fa-regular fa-paperclip",
        title: "File Attachments",
        description:
            "Attach files directly to messages. Resumes, offer letters, job descriptions, reference documents, and screenshots can all be shared inline. Accepted formats include PDF, DOCX, DOC, PNG, JPG, and common image types. Maximum file size is 10 MB per attachment. Attachments are stored securely and accessible to all thread participants. Click an attachment to preview or download.",
    },
    {
        icon: "fa-duotone fa-regular fa-reply",
        title: "Inline Replies",
        description:
            "Reply to a specific message within a thread to keep conversations organized. Inline replies quote the original message and nest the response beneath it, making it clear which point you are addressing. This is critical in busy threads where multiple topics are discussed simultaneously. Without inline replies, group threads become a wall of disconnected statements.",
    },
    {
        icon: "fa-duotone fa-regular fa-thumbtack",
        title: "Pinned Messages",
        description:
            "Pin important messages to the top of a thread. Pinned messages stay visible regardless of how far the conversation scrolls. Use this for decisions, deadlines, meeting links, or any message that participants need to reference repeatedly. Any thread participant can pin or unpin messages. Limit pins to truly important content -- if everything is pinned, nothing is.",
    },
    {
        icon: "fa-duotone fa-regular fa-face-smile",
        title: "Message Reactions",
        description:
            "React to messages with quick emoji responses. Reactions are lightweight acknowledgments that do not clutter the thread with 'Got it' or 'Thanks' messages. A thumbs-up on a status update tells the sender you have seen it without adding noise to the conversation. Reactions are visible to all thread participants.",
    },
    {
        icon: "fa-duotone fa-regular fa-keyboard",
        title: "Typing Indicators",
        description:
            "When another participant is composing a message, a typing indicator appears at the bottom of the thread. This prevents the awkward situation where two people send messages simultaneously about different things. If you see someone typing, wait a moment before sending your own message to keep the conversation flow natural.",
    },
];

const searchFilters = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass",
        title: "Full-Text Search",
        description:
            "Search across all your conversations by keyword. The search indexes message content, sender names, and linked record titles. Type any term and results appear instantly, showing the matching message with surrounding context so you can identify the right thread without opening each one.",
    },
    {
        icon: "fa-duotone fa-regular fa-user",
        title: "Filter By Participant",
        description:
            "Narrow your inbox to conversations with a specific person. This is useful when you need to find a thread with a particular recruiter or hiring manager but cannot remember the topic. Select their name from the participant filter and only threads that include them appear.",
    },
    {
        icon: "fa-duotone fa-regular fa-link",
        title: "Filter By Context",
        description:
            "Filter threads by their linked record type -- roles, candidates, applications, or general. This separates role-specific discussions from candidate-specific discussions and surfaces exactly the category of conversation you need. Combine with participant filters for precise results.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Filter By Date Range",
        description:
            "Limit search results to a specific time period. Useful when you know approximately when a conversation happened but not the exact participants or keywords. Date range filters work alongside text search and participant filters.",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-check",
        title: "Filter By Status",
        description:
            "Toggle between active conversations, resolved threads, and all threads. By default, your inbox shows active conversations only. Switch to resolved to find closed discussions. Switch to all to search everything regardless of status.",
    },
    {
        icon: "fa-duotone fa-regular fa-star",
        title: "Starred Conversations",
        description:
            "Star important conversations so they are always easy to find. Starred threads appear in a dedicated filter view, separate from your main inbox. Use stars for threads you reference frequently -- active negotiations, key candidate discussions, or ongoing role collaborations.",
    },
];

const archiveItems = [
    {
        icon: "fa-duotone fa-regular fa-box-archive",
        title: "Automatic Archiving",
        description: "Threads linked to filled roles or placed candidates are automatically moved to the archive after a configurable inactivity period. This keeps your inbox focused on active work without requiring you to manually clean up old threads. Archived conversations are fully searchable and can be reopened at any time.",
    },
    {
        icon: "fa-duotone fa-regular fa-hand",
        title: "Manual Archive",
        description: "Archive any conversation manually when you are done with it but it does not meet the criteria for automatic resolution. Manual archiving moves the thread out of your active inbox immediately. Other participants are not affected -- the thread stays active in their inbox until they archive it too.",
    },
    {
        icon: "fa-duotone fa-regular fa-rotate-left",
        title: "Restore From Archive",
        description: "Accidentally archived a thread? Restore it with one click. The thread returns to your active inbox exactly where it was, with full history intact. Restoring a thread does not notify other participants or change the thread's status for anyone else.",
    },
    {
        icon: "fa-duotone fa-regular fa-hard-drive",
        title: "Long-Term Retention",
        description: "Archived conversations are retained indefinitely for compliance and audit purposes. Even if a role is deleted or a candidate is removed, the message history is preserved in the archive. Company admins can access archived threads for any team member within their organization.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Export Conversation History",
        description: "Company admins can export conversation threads for compliance audits, legal holds, or internal reviews. Exports include all messages, timestamps, sender information, and attachment metadata. Export format is structured for easy review and archival.",
    },
];

const privacyPractices = [
    {
        icon: "fa-duotone fa-regular fa-building-lock",
        title: "Organization Boundaries",
        description:
            "Messages are siloed by organization. Users from one company cannot access or search conversations from another company. Cross-organization communication happens only through explicitly created threads between connected parties -- for example, a recruiter and a hiring manager from different organizations working on the same role.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-lock",
        title: "Role-Based Visibility",
        description:
            "Not everyone sees the same threads. Recruiters see conversations they participate in. Hiring managers see threads linked to their roles. Company admins have oversight of all threads within their organization. This layered visibility prevents information leaks and keeps conversations relevant to each user's responsibilities.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "End-To-End Security",
        description:
            "Messages are encrypted in transit and at rest. The platform uses industry-standard TLS for data in transit and AES-256 encryption for stored messages. Attachments follow the same security model. Your conversations are protected from the moment you type them to the moment they are read.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Audit Trail",
        description:
            "Every message action is logged: who sent it, who read it, when attachments were downloaded, when threads were archived or restored. Company admins can review audit logs for compliance purposes. This is critical for organizations in regulated industries where communication records must be preserved and reviewable.",
    },
    {
        icon: "fa-duotone fa-regular fa-gavel",
        title: "Data Retention Policies",
        description:
            "Organizations can configure retention policies for message data. Set minimum retention periods for compliance, maximum retention periods for data minimization, or leave the defaults for indefinite retention. Retention policies apply to messages, attachments, and metadata uniformly.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-minus",
        title: "Participant Removal",
        description:
            "Thread creators and company admins can remove participants from a conversation. Removed participants lose access to the thread and its history. They are not notified of new messages after removal. Use this when someone changes roles, leaves the organization, or was added to a thread by mistake.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Be Direct And Specific",
        description:
            "State what you need in the first sentence. 'Can you confirm the candidate's salary expectation by Thursday?' gets a faster response than 'Hey, wanted to check in about that candidate we discussed.' Recruiting moves fast. Vague messages create delays. Say exactly what you need and when you need it.",
    },
    {
        icon: "fa-duotone fa-regular fa-link",
        title: "Always Link Context",
        description:
            "Every conversation should be tied to a role, candidate, or application. Unlinked threads become orphaned discussions that are impossible to find six weeks later when someone asks 'What did we decide about that candidate?' Linked threads are searchable, filterable, and automatically archived with their parent records.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Respond Within 24 Hours",
        description:
            "In recruiting, 24 hours is the maximum acceptable response time for non-urgent messages. For time-sensitive matters -- interview scheduling, offer discussions, candidate availability -- aim for same-day responses. Slow communication kills deals. Candidates lose interest. Hiring managers lose patience. Respond promptly.",
    },
    {
        icon: "fa-duotone fa-regular fa-broom",
        title: "Keep Your Inbox Clean",
        description:
            "Archive resolved conversations. Star the ones you reference daily. Use filters to focus on what matters right now. An inbox with fifty active threads is not a sign of productivity -- it is a sign that old conversations are not being closed. Clean inboxes lead to faster response times and fewer missed messages.",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Right-Size Your Threads",
        description:
            "Not every message needs to go to everyone. Start threads with only the people who need to be involved. Add participants later if the conversation scope expands. Threads with too many participants become noisy and participants start ignoring them. Three to five people is the sweet spot for productive threads.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Use Notes For Decisions",
        description:
            "Messages are for real-time communication. Application notes and candidate notes are for permanent decisions and observations. When a message thread produces a decision -- 'We are moving the candidate to the final round' -- document that decision in the appropriate notes field so it is preserved outside the conversation.",
    },
];

const troubleshootItems = [
    {
        symptom: "I am not receiving message notifications",
        cause: "Notification settings are disabled, browser notifications are blocked, or email digest preferences are turned off.",
        fix: "Check your notification preferences under Settings > Notifications. Ensure browser push notifications are allowed for the portal domain. Verify your email address is correct for digest delivery.",
    },
    {
        symptom: "Unread count seems wrong or does not clear",
        cause: "Sync delay between browser sessions, cached view from a previous session, or a message arrived while the thread was open but scrolled above the viewport.",
        fix: "Refresh the page to force a sync. Scroll to the bottom of the thread to trigger the read receipt. If the issue persists across page refreshes, clear your browser cache.",
    },
    {
        symptom: "I cannot find a conversation I know exists",
        cause: "The thread was archived, resolved, or you are filtering by a status that excludes it. Alternatively, you were removed from the thread.",
        fix: "Switch the status filter to 'All' to include resolved and archived threads. Use full-text search with a keyword you remember from the conversation. If you still cannot find it, ask a company admin to verify your thread membership.",
    },
    {
        symptom: "File attachment upload fails",
        cause: "File exceeds the 10 MB limit, uses an unsupported format, or the network connection dropped during upload.",
        fix: "Verify the file is under 10 MB and is a supported format (PDF, DOCX, DOC, PNG, JPG). Compress large files before uploading. Try again on a stable connection.",
    },
    {
        symptom: "I cannot start a new conversation with an external contact",
        cause: "The external contact's organization is not connected to yours on the platform, or the contact does not have a portal account.",
        fix: "Verify the contact has an active account on Splits Network. Check that your organizations are connected through an active role or marketplace relationship. Contact your company admin if the connection needs to be established.",
    },
    {
        symptom: "@ mentions are not triggering notifications for the mentioned person",
        cause: "The mentioned person's notification settings may have mentions disabled, or their name was typed manually instead of selected from the autocomplete dropdown.",
        fix: "Ensure you select the person's name from the @ mention autocomplete dropdown rather than typing it manually. Ask the mentioned person to check their notification settings under Settings > Notifications.",
    },
    {
        symptom: "Messages appear out of order in a thread",
        cause: "Clock drift between your device and the server, or messages were sent while offline and synced later with original timestamps.",
        fix: "Refresh the page to re-sort messages by server timestamp. If the issue persists, check that your device clock is set to automatic. Messages always sort by server-received time after a refresh.",
    },
    {
        symptom: "I was removed from a thread and need access again",
        cause: "A thread creator or company admin removed you from the conversation.",
        fix: "Ask the thread creator or a company admin to re-add you to the conversation. Removed participants can only regain access through an explicit re-invitation.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/notifications",
        icon: "fa-duotone fa-regular fa-bell",
        title: "Notifications",
        description: "Understand how the notification system works across the entire platform, not just messages.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/communicate-with-recruiters-and-candidates",
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Communication Workflows",
        description: "End-to-end workflows for recruiter and hiring manager collaboration through the platform.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Applications",
        description: "See how message threads connect to application reviews and candidate pipeline progression.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// --- Page ────────────────────────────────────────────────────────────────────

export default function MessagesFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/messages")} id="docs-feature-guides-messages-jsonld" />
            <MessagesAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-info opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-info opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-error opacity-0" />
                        {/* Chat bubble silhouette */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="36" height="32" viewBox="0 0 36 32">
                            <path d="M4,4 H28 Q32,4 32,8 V20 Q32,24 28,24 H12 L6,30 V24 H4 Q0,24 0,20 V8 Q0,4 4,4 Z" fill="none" className="stroke-info" strokeWidth="3" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-info" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
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
                                    <span className="text-info">Messages</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-info text-info-content">
                                    <i className="fa-duotone fa-regular fa-comments"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Your Conversations.{" "}
                                <span className="relative inline-block">
                                    <span className="text-info">One Inbox.</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-info" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                RECRUITING RUNS ON COMMUNICATION. Every placement, every submission,
                                every stage change involves a conversation between people who need to
                                align. Messages is where that alignment happens. Centralized, threaded,
                                contextual, and fast. No more hunting through email chains or wondering
                                if someone got your update. This guide covers every aspect of the
                                messaging system -- from sending your first message to managing
                                conversations at scale.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-info"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building text-info"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-info"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    MESSAGING SYSTEM OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-info text-info-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    How Messages{" "}
                                    <span className="text-info">Work</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Messages is not email. It is not Slack. It is purpose-built
                                    communication for recruiting workflows where every thread
                                    carries the context of the work it supports.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-info/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-info">
                                            <i className={`${item.icon} text-lg text-info-content`}></i>
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
                    CONVERSATION THREADS AND CONTEXT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Conversation{" "}
                                    <span className="text-success">Threads</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    From opening the inbox to resolving a thread. Five steps
                                    that cover the full lifecycle of a conversation on the platform.
                                </p>
                            </div>

                            <div className="thread-container space-y-6">
                                {threadSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="thread-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
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
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {step.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-base-content/50 mb-4">
                                                {step.detail}
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
                    NOTIFICATIONS AND READ RECEIPTS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Notifications
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Stay In{" "}
                                    <span className="text-warning">The Loop</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Messages that sit unread slow down pipelines. The notification
                                    system ensures nothing falls through the cracks -- whether
                                    you are on the platform, on your phone, or checking email.
                                </p>
                            </div>

                            <div className="notification-container space-y-4">
                                {notificationItems.map((item) => (
                                    <div
                                        key={item.number}
                                        className="notification-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
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

                            {/* Notification callout */}
                            <div className="mt-8 p-6 border-4 border-warning bg-warning/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning">
                                        <i className="fa-duotone fa-regular fa-volume-high text-warning-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Notification Fatigue Is Real
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Customize your notification preferences to match your
                                            workflow. If you check the platform regularly, you may
                                            not need email digests. If you are frequently away, email
                                            digests become critical. Find the balance that keeps you
                                            informed without overwhelming your attention. Settings are
                                            under Settings &gt; Notifications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    MENTIONS, ATTACHMENTS, AND FEATURES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Features
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Beyond{" "}
                                    <span className="text-secondary">Plain Text</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Messages are more than text boxes. Mentions, attachments,
                                    reactions, pins, and inline replies keep conversations organized
                                    and actionable even in busy, multi-participant threads.
                                </p>
                            </div>

                            <div className="feature-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featureItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="feature-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-secondary">
                                            <i className={`${item.icon} text-xl text-secondary`}></i>
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
                    SEARCH AND FILTERING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-info text-info-content">
                                    Search
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Find Any{" "}
                                    <span className="text-info">Conversation</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your inbox grows with every active role and candidate.
                                    Search and filter tools help you find the right thread
                                    in seconds, whether it happened yesterday or six months ago.
                                </p>
                            </div>

                            <div className="search-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchFilters.map((item, index) => (
                                    <div
                                        key={index}
                                        className="search-card border-4 border-info/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-info">
                                            <i className={`${item.icon} text-lg text-info-content`}></i>
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
                    CONVERSATION ARCHIVING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Archive
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Conversation{" "}
                                    <span className="text-error">Archiving</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Finished conversations do not need to clutter your inbox.
                                    The archive keeps everything searchable and accessible
                                    without burying the threads that still need your attention.
                                </p>
                            </div>

                            <div className="archive-container space-y-4">
                                {archiveItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="archive-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                            <i className={`${item.icon} text-lg text-error-content`}></i>
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

                            {/* Archive callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Archive Is Not Delete
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Archiving removes a conversation from your active view
                                            but does not delete any messages, attachments, or
                                            history. Everything is preserved and searchable. If you
                                            need to permanently delete a conversation for compliance
                                            reasons, contact your company admin -- deletion is an
                                            admin-only action and is irreversible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PRIVACY AND COMPLIANCE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Privacy
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Privacy And{" "}
                                    <span className="text-secondary">Compliance</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Recruiting conversations contain sensitive information --
                                    salary negotiations, candidate evaluations, hiring decisions.
                                    The platform protects this data at every layer.
                                </p>
                            </div>

                            <div className="privacy-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {privacyPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="privacy-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-secondary">
                                            <i className={`${item.icon} text-lg text-secondary-content`}></i>
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
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Communicate{" "}
                                    <span className="text-success">Like A Pro</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between teams that close placements fast and
                                    teams that lose candidates to slow pipelines often comes down
                                    to how they communicate. These six habits separate the best
                                    from the rest.
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Something not working in Messages? Check here first.
                                    These are the issues we see most often and how to fix them.
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
                <section className="messages-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-info" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-success" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
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
                                    Your messaging workflow is set. Here are the features
                                    and workflows that connect to communication on the platform.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-info bg-info text-info-content transition-transform hover:-translate-y-1"
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
            </MessagesAnimator>
        </>
    );
}
