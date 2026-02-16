import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { InvitationsAnimator } from "./invitations-animator";

export const metadata = getDocMetadata("feature-guides/invitations");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-envelope-open-text",
        title: "Controlled Access Entry",
        description:
            "Invitations are the only way new people join your organization on Splits Network. No self-registration. No shared links. Every person who enters your workspace was deliberately chosen by someone with authority to bring them in. This is not a limitation -- it is a security boundary. You control who sees your candidates, your jobs, and your billing data.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Recruiter Invitations",
        description:
            "Bring external recruiters into your network to work split-fee roles. When you invite a recruiter, they get scoped access to the jobs you assign them -- nothing more. They cannot browse your full pipeline, see other recruiters' candidates, or access your company settings. They see what you show them.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Teammate Invitations",
        description:
            "Add hiring managers, company admins, and internal team members to your organization. Teammates get role-based access that matches their job function. A hiring manager sees their pipelines. An admin sees everything. A team member gets read-only visibility. The role you assign at invite time sets the stage.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Audit Trail From Day One",
        description:
            "Every invitation generates a record: who sent it, when it was sent, what role was assigned, and whether it was accepted, declined, or expired. This trail starts before the person even joins. Compliance teams love this. Security teams love this more. No one enters your organization without a paper trail.",
    },
];

const invitationTypes = [
    {
        number: "01",
        title: "Recruiter Invitation",
        description:
            "Recruiter invitations bring external recruiting partners into your split-fee network. The invited recruiter joins with a scoped Recruiter role that gives them access to assigned jobs, candidate submission capabilities, and communication channels -- but nothing else. They cannot see your internal team, your billing, or jobs they are not assigned to.",
        detail:
            "Recruiter invitations are the foundation of the split-fee marketplace. Each invitation establishes a formal relationship between your organization and an external recruiter. The recruiter maintains their own identity across the platform and can work with multiple organizations simultaneously, but within your org they only see what you expose to them.",
        tip: "Send recruiter invitations only after you have a specific role or set of roles in mind for them. Inviting a recruiter without a job assignment means they sit in your roster doing nothing, and you lose the momentum of initial engagement.",
    },
    {
        number: "02",
        title: "Teammate Invitation",
        description:
            "Teammate invitations add internal team members to your organization. These are your hiring managers, admins, coordinators, and anyone else who needs direct access to your workspace. The role you assign determines their permission set from the moment they accept.",
        detail:
            "Unlike recruiter invitations, teammate invitations create full organizational members. They appear in your team roster, consume a seat in your subscription plan, and have access patterns defined entirely by their assigned role. Company Admins can invite other admins. Hiring managers and team members need an admin to invite them.",
        tip: "Before inviting a teammate, confirm their email address and intended role with them directly. A two-minute conversation prevents the invitation-to-wrong-email problem that accounts for the majority of invitation-related support tickets.",
    },
    {
        number: "03",
        title: "Bulk Invitation",
        description:
            "When you need to onboard an entire team at once, bulk invitations let you send multiple invites in a single operation. Upload a list of email addresses with their intended roles, review the summary, and send them all. Each person still gets an individual invitation with a unique link.",
        detail:
            "Bulk invitations are most useful during initial platform setup when you are bringing your whole organization online, or when onboarding a new department. Each invitation in a bulk send is independent -- if one fails due to an invalid email, the rest still go through. You can track each one individually after sending.",
        tip: "Prepare your email list in advance. Clean it. Remove duplicates. Verify addresses. A bulk send with five bad emails creates five failed invitations that clutter your pending list and require manual cleanup.",
    },
];

const sendingSteps = [
    {
        number: "01",
        title: "Navigate To Invitations",
        description:
            "Open Company Settings from the sidebar, then select the Team or Invitations tab. The invitations view shows your pending, accepted, and expired invitations in a filterable list. The Invite button sits in the top-right corner, visible to anyone with invitation permissions.",
        detail:
            "Company Admins always see the full invitation interface. Hiring Managers may see a limited view depending on your organization's settings. Recruiters and Team Members do not have access to the invitation interface -- they cannot invite anyone.",
        tip: "If you manage invitations frequently, bookmark the direct URL. It saves three clicks every time.",
    },
    {
        number: "02",
        title: "Enter The Invitee Details",
        description:
            "Click Invite Member. A modal opens with fields for the email address and role assignment. Type the email, select the role from the dropdown, and optionally add a personal message. The form validates the email in real time and warns you if that address already has a pending or active invitation.",
        detail:
            "The personal message field is optional but powerful. A generic invitation email gets ignored. An invitation that says 'Hey Sarah, we have three senior engineering roles I want you to work on -- accept this and I will assign you immediately' gets accepted within the hour.",
        tip: "Double-check the email domain. Invitations to personal email addresses when you meant to use a work address create identity mismatches that are annoying to fix later.",
    },
    {
        number: "03",
        title: "Assign The Role",
        description:
            "Select the appropriate role: Company Admin, Hiring Manager, Recruiter, or Team Member. The role dropdown shows a brief description of each role's capabilities so you can confirm your selection. The role takes effect the moment the invitee accepts.",
        detail:
            "You can change the role after acceptance, but the initial assignment sets expectations. Someone invited as a Recruiter who later needs Hiring Manager access will wonder why they could not do certain things on their first day. Start with the right role when possible.",
        tip: "When in doubt, assign the lower role. Upgrading permissions later is a two-click operation. Cleaning up after someone had too much access is a different kind of project.",
    },
    {
        number: "04",
        title: "Send And Confirm",
        description:
            "Click Send. The system dispatches an email with a unique invitation link. The invitation appears immediately in your pending list with a timestamp and the assigned role. The link is valid for 7 days. You will see the status update in real time when the invitee accepts.",
        detail:
            "The invitation email comes from Splits Network's verified domain. It includes your organization name, the role being offered, and the personal message if you wrote one. The invitee clicks the link, signs in or creates a Clerk account, and lands in your organization.",
        tip: "Send a direct message to the person right after sending the invitation. 'Check your email for a Splits Network invite' takes five seconds and doubles your acceptance rate.",
    },
];

const lifecycleItems = [
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Pending",
        description:
            "The invitation has been sent but not yet accepted. It sits in your pending list with the send date, assigned role, and recipient email visible. Pending invitations do not consume a seat in your subscription. They remain pending until the invitee acts or the 7-day window expires.",
        status: "pending",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-check",
        title: "Accepted",
        description:
            "The invitee clicked the link, authenticated, and joined your organization. They now appear in your team roster with the assigned role, an active status, and their join date. The invitation record moves to the accepted list for audit purposes. A seat is now consumed.",
        status: "accepted",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        title: "Declined",
        description:
            "The invitee explicitly declined the invitation. This is rare but it happens. The invitation moves to the declined list. No seat is consumed. You can send a new invitation to the same address if circumstances change, but respect the decline -- reach out and ask first.",
        status: "declined",
    },
    {
        icon: "fa-duotone fa-regular fa-hourglass-end",
        title: "Expired",
        description:
            "Seven days passed without action. The invitation link is dead. The record moves to the expired list. You can resend with one click, which generates a fresh link with a new 7-day window. Most expired invitations are not rejections -- they are lost emails and busy people.",
        status: "expired",
    },
    {
        icon: "fa-duotone fa-regular fa-ban",
        title: "Revoked",
        description:
            "You cancelled the invitation before it was accepted. The link is immediately invalidated. If the invitee tries to use it, they see an error message. Revoked invitations appear in the historical list. Use this when you sent an invitation to the wrong person or with the wrong role.",
        status: "revoked",
    },
];

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow", text: "text-warning" },
    accepted: { bg: "bg-teal", text: "text-success" },
    declined: { bg: "bg-coral", text: "text-error" },
    expired: { bg: "bg-base-content/40", text: "text-base-content/60" },
    revoked: { bg: "bg-purple", text: "text-secondary" },
};

const bulkManagementItems = [
    {
        icon: "fa-duotone fa-regular fa-filter",
        title: "Filter And Sort",
        description:
            "Filter your invitation list by status: pending, accepted, declined, expired, or revoked. Sort by date sent, role assigned, or recipient name. When you have dozens of invitations across different statuses, filters turn a wall of data into actionable information.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Batch Resend",
        description:
            "Select multiple expired invitations and resend them in one action. Each generates a fresh 7-day link. This is particularly useful after a large onboarding push where several invitees missed the deadline. One click, all resent, new timers started.",
    },
    {
        icon: "fa-duotone fa-regular fa-trash-can",
        title: "Batch Revoke",
        description:
            "Select multiple pending invitations and revoke them simultaneously. All selected links are invalidated immediately. Use this when plans change -- a role got cancelled, a recruiter relationship ended, or you need to start fresh with different role assignments.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-export",
        title: "Export Invitation History",
        description:
            "Download your complete invitation history as a CSV. Every invitation ever sent, with timestamps, statuses, roles, and recipient emails. Compliance teams need this for audits. Finance teams need it for seat reconciliation. Keep your records clean and exportable.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Expiration Alerts",
        description:
            "Get notified before invitations expire. The system sends a reminder at the 5-day mark for pending invitations. This gives you a two-day window to follow up with the invitee or decide to let the invitation lapse. Proactive follow-up is the difference between a 60% and 90% acceptance rate.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-simple",
        title: "Invitation Analytics",
        description:
            "Track your invitation metrics: acceptance rate, average time to accept, most common decline reasons, and expiration frequency. These numbers tell you whether your onboarding process is working or whether invitations are falling into a black hole of unopened emails.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Invite With Purpose",
        description:
            "Every invitation should have a clear reason. You are not collecting users -- you are adding people who have specific work to do on the platform. Before you click invite, answer this: what will this person do on their first day? If you do not have an answer, you are not ready to invite them.",
    },
    {
        icon: "fa-duotone fa-regular fa-message",
        title: "Personalize The Invitation",
        description:
            "Use the personal message field. Generic invitations get ignored. Personalized ones create context and urgency. Tell the person why they are being invited, what roles or candidates are waiting for them, and what you need from them. Make the invitation feel like an assignment, not a suggestion.",
    },
    {
        icon: "fa-duotone fa-regular fa-phone",
        title: "Follow Up Immediately",
        description:
            "Send the invitation and then message the person directly. Email, Slack, phone call -- whatever channel they actually check. 'I just sent you a Splits Network invite, check your email' is the single highest-ROI sentence in onboarding. Most expired invitations could have been accepted if someone had just followed up.",
    },
    {
        icon: "fa-duotone fa-regular fa-list-check",
        title: "Verify After Acceptance",
        description:
            "When someone accepts, check three things: their name is correct in the roster, their role is what you intended, and they can access their workspace. This takes thirty seconds. Skipping it means discovering on day three that they have the wrong role and have been unable to work.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar",
        title: "Clean Up Weekly",
        description:
            "Review your pending invitations every week. Resend expired ones that still matter. Revoke ones that no longer apply. A cluttered invitation list makes it hard to track who is actually joining versus who was invited six months ago and never responded. Keep the list current.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Least Privilege From The Start",
        description:
            "Assign the minimum role that lets the person do their job. A recruiter does not need admin access to submit candidates. A hiring manager does not need billing visibility to review applications. Start low. Upgrade when there is a specific, documented need. Never when there is a vague 'just in case.'",
    },
];

const troubleshootItems = [
    {
        symptom: "Invitation email never arrived",
        cause: "The email landed in spam, the address was mistyped, or the recipient's mail server blocked it.",
        fix: "Ask the invitee to check spam and junk folders. Whitelist the Splits Network sending domain. If the email is not found, cancel the pending invitation, verify the address, and resend. You can also share the invitation link directly.",
    },
    {
        symptom: "Invitation link says it is invalid or expired",
        cause: "The 7-day expiration window passed, or the invitation was revoked by an admin.",
        fix: "Check the invitation status in your pending list. If expired, resend it to generate a fresh link. If revoked, you will need to create a new invitation from scratch. Expired links cannot be reactivated.",
    },
    {
        symptom: "Invitee accepted but has the wrong role",
        cause: "The wrong role was selected during invitation, or the role needs were reassessed after acceptance.",
        fix: "Go to Team Settings, find the member, and change their role. The change takes effect on their next login. Ask them to log out and back in to pick up the new permissions immediately.",
    },
    {
        symptom: "Cannot send invitations -- button is disabled or missing",
        cause: "Your account does not have invitation permissions, or your organization has hit its seat limit.",
        fix: "Only Company Admins can send invitations by default. Check your role in Team Settings. If you are an admin but the button is disabled, check Billing for seat availability. You may need to upgrade your plan or remove inactive members.",
    },
    {
        symptom: "Invitee created a duplicate account",
        cause: "They signed up with a different email than the one the invitation was sent to. Clerk treated it as a new identity.",
        fix: "Have the invitee sign out, then sign back in using the email address the invitation was sent to. If they already created data under the duplicate account, contact support to merge the identities. Prevention: always confirm the email address before sending.",
    },
    {
        symptom: "Pending invitations are not showing in the list",
        cause: "A filter is hiding them, or the invitations were sent from a different admin account.",
        fix: "Clear all filters on the invitation list and check the All status view. Company Admins see all invitations regardless of who sent them. If you are a Hiring Manager with limited visibility, ask a Company Admin to check.",
    },
    {
        symptom: "Resent invitation still shows old date",
        cause: "Resending creates a new invitation record. The old one moves to expired. You may be looking at the old record.",
        fix: "Sort the invitation list by date sent, newest first. The resent invitation will appear as a new entry with today's date. The original expired invitation remains in the history for audit purposes.",
    },
    {
        symptom: "Invitation was accepted but the person does not appear in the roster",
        cause: "The acceptance process may not have completed. The invitee might have closed the browser during account creation.",
        fix: "Ask the invitee to try the invitation link again. If it shows as already used, have them sign in directly at the Splits Network login page. If they still do not appear, the invitation may need to be revoked and reissued.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/team-management",
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Team Management",
        description: "Invitations are the entry point. Team Management is where you control roles, permissions, and seat allocation after people join.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Roles And Jobs",
        description: "Once your recruiters and teammates are onboard, assign them to roles and start building your hiring pipeline.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/messages",
        icon: "fa-duotone fa-regular fa-comments",
        title: "Team Messaging",
        description: "Keep your newly onboarded team aligned with contextual, record-attached communication that replaces scattered emails.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-error" },
    teal: { bg: "bg-teal", border: "border-success", text: "text-success" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InvitationsFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/invitations")} id="docs-feature-guides-invitations-jsonld" />
            <InvitationsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16  border-4 border-success opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12  bg-yellow opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10  bg-coral opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-coral opacity-0" />
                        {/* Envelope icons */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="32" height="24" viewBox="0 0 32 24">
                            <rect x="1" y="1" width="30" height="22" rx="2" fill="none" className="stroke-success" strokeWidth="3" />
                            <polyline points="1,1 16,14 31,1" fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <svg className="memphis-shape absolute bottom-[35%] right-[18%] opacity-0" width="28" height="20" viewBox="0 0 32 24">
                            <rect x="1" y="1" width="30" height="22" rx="2" fill="none" className="stroke-warning" strokeWidth="3" />
                            <polyline points="1,1 16,14 31,1" fill="none" className="stroke-warning" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2  bg-teal" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-warning" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-success">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-success">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-success">Invitations</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-success-content">
                                    <i className="fa-duotone fa-regular fa-envelope-open-text"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Control Who{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">Gets In</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-teal" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                INVITATIONS ARE YOUR FRONT DOOR. Every recruiter, every hiring
                                manager, every admin -- they all enter through an invitation you
                                chose to send. This is not a sign-up page. It is a deliberate act.
                                You decide who joins, what role they get, and when they start. Get
                                invitations right and onboarding is seamless. Get them wrong and you
                                spend your time cleaning up access problems instead of making placements.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-success"></i>
                                    Company Admin
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-success"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-handshake text-success"></i>
                                    Recruiter
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Invitations{" "}
                                    <span className="text-success">Do</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Invitations are not just emails with links. They are the access
                                    control mechanism that determines who enters your organization,
                                    what role they occupy, and what data they can see from the moment
                                    they arrive.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-success/30 bg-base-100 p-6 opacity-0"
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
                    INVITATION TYPES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Types
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Invitation{" "}
                                    <span className="text-warning">Types</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Not all invitations are the same. Each type serves a different
                                    purpose, creates a different relationship, and grants a different
                                    level of access. Know the difference before you send.
                                </p>
                            </div>

                            <div className="type-container space-y-6">
                                {invitationTypes.map((item, index) => (
                                    <div
                                        key={index}
                                        className="type-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-yellow">
                                            <span className="text-2xl font-black text-dark">
                                                {item.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-yellow text-dark text-sm font-black">
                                                    {item.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {item.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-base-content/50 mb-4">
                                                {item.detail}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-yellow/10 border-l-4 border-yellow">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-warning mt-0.5"></i>
                                                <p className="text-sm text-base-content/60">
                                                    {item.tip}
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
                    SENDING INVITATIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Send An{" "}
                                    <span className="text-success">Invitation</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Four steps from intent to invitation. The process is deliberately
                                    simple so you spend time choosing the right people, not wrestling
                                    with the interface.
                                </p>
                            </div>

                            <div className="step-container space-y-6">
                                {sendingSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-teal">
                                            <span className="text-2xl font-black text-success-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-teal text-success-content text-sm font-black">
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
                                            <div className="flex items-start gap-2 px-4 py-3 bg-teal/10 border-l-4 border-success">
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
                    INVITATION LIFECYCLE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Lifecycle
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Invitation{" "}
                                    <span className="text-error">Lifecycle</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every invitation moves through a defined set of states. Understanding
                                    these states helps you track onboarding progress and take action
                                    when things stall.
                                </p>
                            </div>

                            <div className="lifecycle-container space-y-4">
                                {lifecycleItems.map((item, index) => {
                                    const colors = statusColors[item.status];
                                    return (
                                        <div
                                            key={index}
                                            className="lifecycle-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${colors.bg}`}>
                                                <i className={`${item.icon} text-lg text-white`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                        {item.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${colors.bg} text-white`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-base-content/60">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Lifecycle callout */}
                            <div className="mt-8 p-6 border-4 border-yellow bg-yellow/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow">
                                        <i className="fa-duotone fa-regular fa-clock text-dark"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            The 7-Day Window Is Deliberate
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Invitations expire after 7 days for security. A link that lives
                                            forever is a link that can be forwarded, shared, and used by
                                            someone it was not intended for. The expiration forces timely
                                            action and ensures that the person accepting is doing so while
                                            the invitation is still relevant. If they miss the window, resend.
                                            It takes one click.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BULK MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-dark">
                                    Management
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Bulk Invitation{" "}
                                    <span className="text-secondary">Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    When you are managing dozens or hundreds of invitations, individual
                                    actions do not scale. These tools let you operate on invitations
                                    in bulk without losing visibility into individual statuses.
                                </p>
                            </div>

                            <div className="bulk-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bulkManagementItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bulk-card border-4 border-purple/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-purple">
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
                                    Onboarding{" "}
                                    <span className="text-success">Best Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Sending invitations is easy. Onboarding people effectively takes
                                    intention. These practices turn a technical process into a smooth
                                    experience that sets new team members up for immediate productivity.
                                </p>
                            </div>

                            <div className="practice-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    Invitation issues are almost always email delivery, expiration,
                                    or permission problems. Check here before opening a support ticket.
                                    The fix is usually one click away.
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
                <section className="invitations-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12  border-4 border-success" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-yellow" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6  bg-coral" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-success" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-teal text-success-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-success">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your invitations are sent and your team is assembling. Now
                                    manage their roles, assign them to jobs, and get the pipeline
                                    moving.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-success bg-teal text-success-content transition-transform hover:-translate-y-1"
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
            </InvitationsAnimator>
        </>
    );
}
