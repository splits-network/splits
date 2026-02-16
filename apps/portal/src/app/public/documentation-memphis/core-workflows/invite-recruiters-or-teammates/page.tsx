import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { InviteAnimator } from "./invite-animator";

export const metadata = getDocMetadata("core-workflows/invite-recruiters-or-teammates");

// ─── Data ────────────────────────────────────────────────────────────────────

const inviteTypes = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        title: "External Recruiters",
        description:
            "Independent recruiters or agency partners who work on your open roles for a split fee. They get access to assigned roles, can submit candidates, and track their placements. They do not see your internal team settings or billing.",
        accent: "error",
    },
    {
        icon: "fa-duotone fa-regular fa-people-group",
        title: "Internal Teammates",
        description:
            "Hiring managers, fellow admins, or internal recruiters who belong to your organization. They get role-appropriate access to everything your org manages -- roles, candidates, applications, and team settings based on their assigned role.",
        accent: "success",
    },
    {
        icon: "fa-duotone fa-regular fa-building-user",
        title: "Agency Team Members",
        description:
            "If you run a recruiting agency, invite your team members so they can collaborate on roles assigned to your agency. Each member gets their own login, activity tracking, and placement history.",
        accent: "warning",
    },
];

const steps = [
    {
        number: "01",
        title: "Open The Invitations Page",
        description:
            "Navigate to Invitations from the sidebar. This page shows all pending, accepted, and expired invitations for your organization. If you are inviting a recruiter to a specific role, you can also start from the Role detail page and use the Invite Recruiter action there.",
        tip: "Company Admins and Hiring Managers can access Invitations. Recruiters cannot send invites unless your org has granted them that permission.",
    },
    {
        number: "02",
        title: "Click Invite And Enter Details",
        description:
            "Hit the Invite button. Enter the person's email address. If you are inviting multiple people, you can add up to 25 email addresses in a single batch. Each address gets its own invitation with a unique acceptance link.",
        tip: "Double-check email addresses before sending. A typo means the invite goes nowhere and you will need to resend it.",
    },
    {
        number: "03",
        title: "Select The Role",
        description:
            "Choose the role that determines what the invitee can see and do. Recruiter gives access to assigned roles and candidate submission. Hiring Manager adds review and approval capabilities. Company Admin grants full organization access including billing and team management.",
        tip: "Start with the lowest role that covers what the person needs. You can always upgrade later, but downgrading requires careful review of what they have already accessed.",
    },
    {
        number: "04",
        title: "Assign To Specific Roles (Optional)",
        description:
            "For recruiter invites, you can pre-assign them to specific open roles during the invitation step. This means the moment they accept, they immediately see those roles in their dashboard and can start submitting candidates. Skip this if you want to assign roles later.",
        tip: "Pre-assigning roles reduces onboarding friction. The recruiter lands on their dashboard and sees work waiting for them instead of an empty screen.",
    },
    {
        number: "05",
        title: "Send And Confirm",
        description:
            "Send the invitation. The system dispatches an email with a unique acceptance link. The invitation appears in your Invitations list with a Pending status. You can track when it was sent, whether it has been opened, and when it expires.",
        tip: "Invitations expire after 7 days by default. If someone misses the window, resend from the Invitations page -- it generates a fresh link.",
    },
    {
        number: "06",
        title: "Verify Access After Acceptance",
        description:
            "When the invitee accepts, their status changes to Accepted and they appear in your Team page. Verify their role assignment is correct and that they can see the pages they need. If anything looks wrong, update their role from Team Management.",
        tip: "Ask new teammates to confirm they can see their Dashboard and assigned pages. A quick verification call prevents support tickets later.",
    },
];

const permissionLevels = [
    {
        role: "Recruiter",
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        canDo: [
            "View and work on assigned roles only",
            "Submit candidates to assigned roles",
            "Track their own applications and placements",
            "Message hiring managers and other assigned recruiters",
            "View their own placement earnings and payout history",
        ],
        cannotDo: [
            "Access unassigned roles",
            "View billing, subscription, or company settings",
            "Invite other users to the organization",
            "Modify team member roles or permissions",
            "See other recruiters' earnings or internal metrics",
        ],
        accent: "error",
    },
    {
        role: "Hiring Manager",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        canDo: [
            "Create and manage roles they own",
            "Review all applications for their roles",
            "Invite recruiters to their roles",
            "Send invitations to new teammates",
            "Access team management for their direct reports",
        ],
        cannotDo: [
            "Access billing or subscription management",
            "Modify company-wide settings or branding",
            "View recruiter payout details",
            "Delete other users' roles or applications",
        ],
        accent: "warning",
    },
    {
        role: "Company Admin",
        icon: "fa-duotone fa-regular fa-building-shield",
        canDo: [
            "Full access to every feature and page",
            "Manage billing, subscriptions, and payment methods",
            "Invite and remove any user at any role level",
            "Configure company settings, branding, and preferences",
            "View all analytics, metrics, and audit logs",
            "Override role assignments and permissions",
        ],
        cannotDo: [
            "Nothing is restricted -- full organizational control",
        ],
        accent: "success",
    },
];

const statusTypes = [
    {
        status: "Pending",
        icon: "fa-duotone fa-regular fa-clock",
        description: "The invitation has been sent but not yet accepted. The email is in the invitee's inbox (or spam folder). You can resend or revoke from this state.",
        action: "Resend the invitation if it has been more than 24 hours. Check with the invitee that they received it.",
        accent: "warning",
    },
    {
        status: "Accepted",
        icon: "fa-duotone fa-regular fa-circle-check",
        description: "The invitee clicked the link, created or linked their account, and now has access. They appear in your Team page with their assigned role.",
        action: "Verify their role and page access. Assign them to specific roles if you did not do so during the invite step.",
        accent: "success",
    },
    {
        status: "Expired",
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        description: "The invitation was not accepted within the expiration window (7 days by default). The link is now dead. The invitee cannot use it even if they find it later.",
        action: "Resend a fresh invitation. The old link is invalidated -- a new one is generated automatically.",
        accent: "error",
    },
    {
        status: "Revoked",
        icon: "fa-duotone fa-regular fa-ban",
        description: "You or another admin manually cancelled the invitation before it was accepted. This is useful when you sent an invite to the wrong person or changed your mind.",
        action: "If the invite was revoked by mistake, send a new one. Revoked invitations cannot be reactivated.",
        accent: "error",
    },
];

const bulkInviteSteps = [
    {
        title: "Prepare Your List",
        description: "Gather email addresses for everyone you want to invite. Group them by role -- all recruiters together, all hiring managers together. This lets you batch-send with the correct permissions in one pass.",
    },
    {
        title: "Use Batch Invite",
        description: "On the Invitations page, select Batch Invite. Paste or type up to 25 email addresses separated by commas or newlines. Select the role that applies to the entire batch. Every address in the batch gets the same role.",
    },
    {
        title: "Review Before Sending",
        description: "The system validates all addresses and flags duplicates or addresses that already have active invitations. Review the summary, remove any flagged entries, and confirm. Each valid address receives its own unique invitation link.",
    },
    {
        title: "Track Progress",
        description: "After sending, each invitation appears individually in your Invitations list. You can filter by Pending to see who has not accepted yet and resend to stragglers. Batch invites behave identically to individual invites after they are sent.",
    },
];

const onboardingTips = [
    {
        icon: "fa-duotone fa-regular fa-hand-wave",
        title: "Send A Welcome Message",
        description:
            "After a teammate accepts, send them a direct message through the platform. Introduce yourself, point them to the roles they should focus on, and let them know who to ask if they get stuck. This turns a cold onboard into a warm one.",
    },
    {
        icon: "fa-duotone fa-regular fa-route",
        title: "Pre-Assign Roles",
        description:
            "Do not make new recruiters hunt for work. Assign them to specific roles before or during the invite so their Dashboard shows immediate action items. An empty Dashboard on day one kills momentum.",
    },
    {
        icon: "fa-duotone fa-regular fa-book-open",
        title: "Share Documentation",
        description:
            "Link new users to the First-Time Setup guide and Navigation Overview. These pages walk them through account verification, profile completion, and finding their way around the platform without hand-holding.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Set Up A Check-In",
        description:
            "Schedule a brief check-in 48 hours after their first login. Ask if they can see their assigned roles, submit candidates, and access messages. Most access issues surface in the first two days.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Monitor Early Activity",
        description:
            "Use the Analytics dashboard to track new user activity. If someone accepted their invite three days ago and has zero submissions, reach out. They may be stuck or confused about the workflow.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Audit Permissions Quarterly",
        description:
            "Set a reminder to review your Team page every quarter. Remove users who are no longer active, downgrade roles that were over-provisioned, and ensure no orphaned accounts have admin access.",
    },
];

const bestPractices = [
    {
        title: "One Role Per Person, One Purpose Per Role",
        description: "Do not give someone Company Admin access because it is easier. Match the role to what they actually do. Recruiters recruit. Managers review. Admins administrate. Clean role assignments mean clean audit trails.",
    },
    {
        title: "Revoke Before You Forget",
        description: "When a recruiter finishes a contract or a teammate leaves the company, revoke their access the same day. Orphaned accounts with active permissions are a security risk you do not need.",
    },
    {
        title: "Use Invitations, Not Workarounds",
        description: "Always use the platform invitation system. Do not share login credentials, bypass the invite flow, or manually add users to the database. The invitation system creates an audit trail and ensures proper role assignment.",
    },
    {
        title: "Communicate The Role Before Sending",
        description: "Tell people what role they will receive and what it means before you send the invite. A recruiter who expects admin access and gets recruiter access will immediately file a support request. Set expectations first.",
    },
    {
        title: "Batch By Role, Not By Convenience",
        description: "When doing bulk invites, group by role. Sending 20 people the same invite with different intended roles means 19 of them will have the wrong permissions. Take the extra minute to batch correctly.",
    },
];

const troubleshootItems = [
    {
        symptom: "Invitation email never arrives",
        cause: "The email was caught by spam filters, the address was mistyped, or the recipient's mail server rejected it.",
        fix: "Ask the invitee to check spam and junk folders. Verify the email address on the Invitations page. Resend the invite. If it still fails, try an alternate email address.",
    },
    {
        symptom: "Invitee accepted but cannot see any pages",
        cause: "Their role assignment is missing or incomplete. The acceptance linked their account but the role was not applied correctly.",
        fix: "Go to Team Management and check their role. If it says Pending or is blank, assign the correct role manually. The invitee should refresh their browser after you make the change.",
    },
    {
        symptom: "Invitation shows Expired even though it was sent yesterday",
        cause: "The system clock or timezone difference caused the expiration to trigger early, or the invitation was revoked manually by another admin.",
        fix: "Check the invitation details for the exact expiration timestamp. If another admin revoked it, coordinate with them. Resend a fresh invitation.",
    },
    {
        symptom: "Recruiter accepted but cannot see assigned roles",
        cause: "The role assignments were not saved during the invitation step, or the assignments were made before the invite was accepted and did not propagate.",
        fix: "Go to the Role detail page and manually assign the recruiter. Alternatively, use Team Management to verify their assignment list and re-add any missing roles.",
    },
    {
        symptom: "Batch invite sent to wrong group with wrong role",
        cause: "The role selection applies to all addresses in the batch. If you mixed recruiter and manager emails in one batch, everyone got the same role.",
        fix: "Revoke all incorrect invitations immediately. Re-invite with the correct role-per-batch grouping. Notify anyone who already accepted so they know their role will be updated.",
    },
    {
        symptom: "Former teammate still has access after leaving",
        cause: "Their invitation was accepted and their account is still active. Revoking the original invitation does not remove an already-accepted user.",
        fix: "Go to Team Management and remove the user from your organization. This revokes all access immediately. If they need limited access later, send a fresh invite with the appropriate role.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-route",
        title: "Core Workflows",
        description: "See all available workflows including creating roles, submitting candidates, and managing placements.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/roles-and-permissions",
        icon: "fa-duotone fa-regular fa-shield-keyhole",
        title: "Roles & Permissions",
        description: "Deep dive into what each role can see and do across every page of the platform.",
        accent: "purple",
    },
    {
        href: "/public/documentation-memphis/getting-started/first-time-setup",
        icon: "fa-duotone fa-regular fa-gear",
        title: "First-Time Setup",
        description: "Share this with new invitees so they know how to accept, verify, and complete onboarding.",
        accent: "teal",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InviteRecruitersOrTeammatesMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/invite-recruiters-or-teammates")} id="docs-invite-recruiters-jsonld" />
            <InviteAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="invite-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[8%] w-16 h-16 rounded-full border-[4px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[12%] w-12 h-12 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[30%] w-14 h-14 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[25%] right-[42%] w-16 h-6 -rotate-6 border-[3px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[35%] w-6 h-6 rotate-45 bg-error opacity-0" />
                        {/* Envelope SVG */}
                        <svg className="memphis-shape absolute top-[18%] left-[48%] opacity-0" width="40" height="32" viewBox="0 0 40 32">
                            <rect x="2" y="6" width="36" height="24" rx="2" fill="none" className="stroke-success" strokeWidth="3" />
                            <polyline points="2,6 20,20 38,6" fill="none" className="stroke-success" strokeWidth="3" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[52%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-warning" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[45%] opacity-0" width="68" height="18" viewBox="0 0 68 18">
                            <polyline points="0,14 8,4 16,14 24,4 32,14 40,4 48,14 56,4 68,14"
                                fill="none" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-error">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/core-workflows" className="text-base-content/50 transition-colors hover:text-error">
                                        Core Workflows
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-error">Invite Recruiters Or Teammates</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-error text-error-content">
                                    <i className="fa-duotone fa-regular fa-envelope-open-text"></i>
                                    Core Workflow
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Invite Recruiters{" "}
                                <span className="relative inline-block">
                                    <span className="text-error">Or Teammates</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-error" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-2xl mb-6 opacity-0">
                                YOUR TEAM IS YOUR LEVERAGE. Bring recruiters onto your roles, add hiring
                                managers to review pipelines, and build the organization that scales your
                                recruiting operation beyond what one person can handle.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-success"></i>
                                    Company Admin
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-clipboard-check text-warning"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-error"></i>
                                    Recruiter
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    INVITATION TYPES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="types-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="types-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Who To Invite
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Types Of{" "}
                                    <span className="text-error">Invitations</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Not every invite is the same. The person you are bringing in determines
                                    what role they get and what they can access. Here are the three categories.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {inviteTypes.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`type-card border-4 border-${item.accent}/30 bg-base-100 p-6 opacity-0`}
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center mb-4 bg-${item.accent}`}>
                                            <i className={`${item.icon} text-lg text-${item.accent}-content`}></i>
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
                    STEP-BY-STEP PROCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="steps-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="steps-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The Invitation{" "}
                                    <span className="text-success">Process</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Six steps from clicking Invite to verifying access. The whole thing takes under two minutes.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
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
                    PERMISSION LEVELS & ROLE ASSIGNMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="permissions-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="permissions-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Access Control
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Permission{" "}
                                    <span className="text-warning">Levels</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every invitation assigns a role. That role controls everything the person
                                    can see, do, and modify. Choose carefully -- this is your access control layer.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {permissionLevels.map((level) => (
                                    <div key={level.role} className={`permission-card border-4 border-${level.accent} bg-base-100 opacity-0`}>
                                        <div className={`flex items-center gap-3 px-6 py-4 bg-${level.accent} text-${level.accent}-content`}>
                                            <i className={`${level.icon} text-lg`}></i>
                                            <h3 className="font-black text-base uppercase tracking-wide">
                                                {level.role}
                                            </h3>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-success mb-2">
                                                    <i className="fa-duotone fa-regular fa-check mr-1"></i> Can Do
                                                </div>
                                                <ul className="space-y-1">
                                                    {level.canDo.map((item) => (
                                                        <li key={item} className="text-xs text-base-content/70 flex items-start gap-2">
                                                            <i className="fa-duotone fa-regular fa-check text-success text-[10px] mt-0.5"></i>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-error mb-2">
                                                    <i className="fa-duotone fa-regular fa-xmark mr-1"></i> Cannot Do
                                                </div>
                                                <ul className="space-y-1">
                                                    {level.cannotDo.map((item) => (
                                                        <li key={item} className="text-xs text-base-content/50 flex items-start gap-2">
                                                            <i className="fa-duotone fa-regular fa-xmark text-error text-[10px] mt-0.5"></i>
                                                            <span>{item}</span>
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
                    INVITATION MANAGEMENT (STATUS TRACKING)
                   ══════════════════════════════════════════════════════════════ */}
                <section className="status-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="status-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Lifecycle
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Invitation{" "}
                                    <span className="text-secondary">Status</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every invitation moves through a lifecycle. Know what each status means
                                    and what to do at each stage.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {statusTypes.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`status-card border-4 border-${item.accent}/20 bg-base-100 p-6 opacity-0`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center bg-${item.accent}`}>
                                                <i className={`${item.icon} text-${item.accent}-content`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                                    {item.status}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-base-content/70 mb-3">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-start gap-2 px-4 py-2 bg-base-200/50 border-l-4 border-success">
                                                    <i className="fa-duotone fa-regular fa-arrow-right text-success mt-0.5 text-xs"></i>
                                                    <p className="text-sm text-base-content/60">
                                                        {item.action}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BULK INVITES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="bulk-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="bulk-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Scale
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Bulk{" "}
                                    <span className="text-error">Invites</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Inviting people one at a time works. Inviting them in batches works faster.
                                    Here is how to onboard an entire team in one pass.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bulkInviteSteps.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bulk-card border-4 border-error/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-error">
                                                <span className="text-sm font-black text-error-content">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70 pl-11">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ONBOARDING NEW USERS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="onboarding-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="onboarding-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    After The Invite
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Onboarding{" "}
                                    <span className="text-success">New Users</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Sending the invite is step one. Making sure the person is productive on day one
                                    is the part that actually matters. Here is how to close the loop.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {onboardingTips.map((item, index) => (
                                    <div
                                        key={index}
                                        className="onboarding-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-success">
                                            <i className={`${item.icon} text-xl text-success`}></i>
                                        </div>
                                        <h3 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
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
                    BEST PRACTICES FOR TEAM BUILDING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="practices-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="practices-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Do It Right
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best{" "}
                                    <span className="text-warning">Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Invitations are easy. Building a well-organized team with clean permissions takes intention.
                                    Follow these rules and your org stays manageable at any size.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card flex items-start gap-4 p-6 border-4 border-warning/15 bg-base-100 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning">
                                            <span className="text-sm font-black text-warning-content">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-base-content/70">
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
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="trouble-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="trouble-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Troubleshooting
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Common{" "}
                                    <span className="text-error">Issues</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Invitations are straightforward until something goes wrong. Here are the
                                    issues that actually come up and how to fix them fast.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {troubleshootItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="trouble-card border-4 border-error/15 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-error">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-error-content"></i>
                                            </div>
                                            <h3 className="font-black text-sm uppercase tracking-wide text-base-content pt-1">
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
                    NEXT STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="next-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="next-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What{" "}
                                    <span className="text-success">Comes Next</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your team is in place. Now put them to work.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`next-card group relative border-4 ${a.border} bg-base-100 transition-transform hover:-translate-y-1 opacity-0`}
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
                        </div>
                    </div>
                </section>
            </InviteAnimator>
        </>
    );
}
