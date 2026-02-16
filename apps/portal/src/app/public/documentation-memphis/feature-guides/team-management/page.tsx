import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { TeamMgmtAnimator } from "./team-mgmt-animator";

export const metadata = getDocMetadata("feature-guides/team-management");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Centralized Team Roster",
        description:
            "Every person in your organization lives in one list. Names, roles, statuses, last-active timestamps, invitation dates -- all visible at a glance. No guessing who has access. No digging through email threads to figure out who joined when. One roster. One truth.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-shield",
        title: "Role-Based Access Control",
        description:
            "Each team member gets a role. Each role unlocks specific capabilities. Company Admins manage everything. Hiring Managers own their pipelines. Recruiters work candidates and submissions. The role defines what they see, what they edit, and what stays locked. Permissions are not suggestions -- they are walls.",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope-open-text",
        title: "Invitation Workflow",
        description:
            "New team members join through a formal invitation flow. You send an invite, they accept, they land in the roster with the role you assigned. No shared logins. No forwarded passwords. Every person gets their own identity, their own audit trail, and their own permission set.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Activity And Status Tracking",
        description:
            "See who is active, who is idle, and who has not logged in for weeks. Activity indicators help you identify disengaged team members, spot onboarding issues early, and make informed decisions about seat allocation. Dead seats cost money. Active seats generate revenue.",
    },
];

const inviteSteps = [
    {
        number: "01",
        title: "Open Team Settings",
        description:
            "Navigate to Company Settings from the sidebar, then select the Team tab. This is the control center for all team member operations. The page shows your current roster with role badges, status indicators, and the invite button in the top-right corner.",
        detail:
            "Only Company Admins see the full Team tab with invite capabilities. Hiring Managers can view the roster but cannot invite new members or change roles. If you do not see the Team tab, your role does not include team management permissions.",
        tip: "Bookmark the Team Settings page if you manage team members regularly. It is three clicks from the dashboard otherwise.",
    },
    {
        number: "02",
        title: "Click Invite Member",
        description:
            "Select the Invite Member button. A modal opens with fields for the new member's email address and their assigned role. The form validates the email format in real time and checks for duplicate invitations before you send.",
        detail:
            "You can invite one person at a time. Each invite is tied to a specific email address and a specific role. If you need to invite multiple people, you will repeat this process for each one. There is no bulk invite -- this is deliberate, because each person's role assignment deserves individual attention.",
        tip: "Double-check the email address before sending. Invitations sent to the wrong address cannot be recalled. You can cancel an unclaimed invitation and send a new one, but it creates noise.",
    },
    {
        number: "03",
        title: "Assign A Role",
        description:
            "Select the role from the dropdown. Company Admin, Hiring Manager, Recruiter, or Team Member. The role determines what the new member can access from day one. Choose based on what they need to do, not what they might eventually need.",
        detail:
            "Roles can be changed after the person joins. Start with the minimum role that lets them do their job. Escalating permissions later is easy. Revoking permissions after someone has accessed sensitive data is a different conversation entirely.",
        tip: "When in doubt, assign the lower role. A Recruiter who needs Hiring Manager access for one task can request a temporary upgrade. A Hiring Manager who never needed that level of access is a security liability you created on day one.",
    },
    {
        number: "04",
        title: "Send The Invitation",
        description:
            "Click Send. The system dispatches an email to the specified address with a unique invitation link. The link is valid for 7 days. The invitee clicks the link, creates their account (or signs in with an existing Clerk account), and lands in your organization with the assigned role.",
        detail:
            "Pending invitations appear in the roster with a Pending badge. You can see who has been invited but has not yet accepted. If 7 days pass without acceptance, the invitation expires. You can resend it or cancel it from the roster view.",
        tip: "Follow up with the person directly. Email invitations get lost in spam folders, missed in crowded inboxes, and forgotten by busy people. A quick message saying 'I sent you an invite to Splits Network, check your email' doubles your acceptance rate.",
    },
    {
        number: "05",
        title: "Verify They Landed Correctly",
        description:
            "After the new member accepts, check the roster to confirm their name, email, and role are correct. Verify they can access what they need by asking them to log in and navigate to their primary workspace. This takes thirty seconds and prevents hours of confusion later.",
        detail:
            "Common post-invite issues: the person signed up with a different email than the one invited (creates a duplicate identity), or the role was set incorrectly and they cannot access their workspace. Catching these on day one is trivial. Catching them after a week of blocked work is expensive.",
        tip: "Make it part of your onboarding checklist. Invite, verify, confirm access. Three steps, two minutes, zero downstream problems.",
    },
];

const roleDefinitions = [
    {
        number: "01",
        name: "Company Admin",
        description:
            "Full organizational control. Company Admins manage team members, billing, company settings, integrations, and every configuration surface. They can invite and remove members, change roles, view audit logs, and access all data across every module. This is the highest permission level and should be assigned to a small number of trusted individuals.",
        capabilities: "Team management, billing, settings, all data access, audit logs, integrations",
        color: "error",
    },
    {
        number: "02",
        name: "Hiring Manager",
        description:
            "Pipeline ownership. Hiring Managers control jobs, review applications, move candidates through stages, approve submissions, and manage the hiring workflow. They see candidate data relevant to their roles and can collaborate with recruiters on submissions. They cannot manage team members, billing, or system settings.",
        capabilities: "Job management, application review, stage progression, submission approval",
        color: "warning",
    },
    {
        number: "03",
        name: "Recruiter",
        description:
            "Candidate and submission operations. Recruiters create and manage candidate profiles, submit candidates to roles, track application statuses, and communicate with the team. They see the data they need to source, qualify, and submit talent. They cannot create jobs, change hiring stages, or manage organizational settings.",
        capabilities: "Candidate management, submissions, profile creation, sourcing, communication",
        color: "success",
    },
    {
        number: "04",
        name: "Team Member",
        description:
            "Read-oriented access. Team Members can view dashboards, browse candidates, and see job listings relevant to their work. They cannot create or edit records, submit candidates, or change any configurations. This role is for stakeholders who need visibility into the pipeline without the ability to modify it.",
        capabilities: "Dashboard viewing, read-only browsing, basic reporting",
        color: "info",
    },
];

const permissionAreas = [
    {
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Team Member Management",
        description:
            "Inviting new members, removing existing ones, and changing role assignments. Only Company Admins can perform these actions. This is the most sensitive permission area because it controls who has access to your entire organization's data. One wrong role assignment can expose confidential candidate information or billing details to the wrong person.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Job And Pipeline Access",
        description:
            "Creating jobs, editing requirements, managing hiring stages, and configuring pipeline workflows. Hiring Managers and Company Admins have full job management access. Recruiters can view jobs and submit candidates but cannot modify the job itself or its pipeline stages. Team Members see job listings in read-only mode.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-group",
        title: "Candidate Data Access",
        description:
            "Viewing, creating, and editing candidate profiles. Recruiters own their candidates and can edit any profile they created. Company Admins see all candidates across the organization. Hiring Managers see candidates submitted to their jobs. Sensitive fields like salary expectations can be restricted at the role level.",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Billing And Subscription",
        description:
            "Viewing invoices, managing payment methods, changing subscription plans, and allocating seats. Exclusively available to Company Admins. No other role can see billing information. This prevents accidental plan changes and keeps financial data compartmentalized to the people responsible for it.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Analytics And Reporting",
        description:
            "Accessing dashboards, viewing performance metrics, and generating reports. Company Admins see organization-wide analytics. Hiring Managers see metrics for their jobs and pipelines. Recruiters see their own submission and placement metrics. The data each role sees is scoped to their operational context.",
    },
    {
        icon: "fa-duotone fa-regular fa-gear",
        title: "System Configuration",
        description:
            "Modifying company settings, managing integrations, configuring notification preferences, and setting organization-level defaults. Company Admin only. System configuration changes affect every member of the organization, so they are gated behind the highest permission level.",
    },
];

const seatManagementItems = [
    {
        icon: "fa-duotone fa-regular fa-chair",
        title: "What Is A Seat",
        description:
            "A seat is a licensed slot in your subscription plan. Each active team member occupies one seat. Pending invitations do not consume seats until accepted. Deactivated members release their seats back to the pool. Your plan defines a maximum number of seats, and adding members beyond that limit requires a plan upgrade.",
        priority: "critical",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-plus",
        title: "Adding Seats",
        description:
            "When you hit your seat limit, the Invite Member button shows a warning. You can either upgrade your plan for more seats or remove inactive members to free up existing ones. Seat additions on paid plans are prorated -- you pay for the remaining billing cycle, not the full period.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-minus",
        title: "Removing Members And Freeing Seats",
        description:
            "Removing a team member immediately frees their seat. Their data -- submissions, notes, activity history -- remains in the system but is reassigned to the organization. The person loses all access instantly. There is no grace period. Remove someone and they are out.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Billing Impact",
        description:
            "Seats directly affect your monthly bill. More active seats means a higher subscription cost. Review your roster monthly and remove members who are no longer active. Paying for seats that nobody uses is the most common source of billing waste on the platform.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Seat Utilization Dashboard",
        description:
            "Company Admins can see seat utilization metrics: how many seats are in use, how many are available, which members are active versus idle, and when seats were last used. This data informs decisions about plan sizing and helps justify upgrades or downgrades during budget reviews.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Seat Transfers",
        description:
            "You cannot transfer a seat from one person to another directly. Instead, remove the departing member (frees the seat) and invite the replacement (consumes the seat). The process takes two minutes and ensures a clean audit trail with no identity overlap.",
        priority: "medium",
    },
];

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: "bg-error", text: "text-error", label: "Must Know" },
    high: { bg: "bg-warning", text: "text-warning", label: "Important" },
    medium: { bg: "bg-success", text: "text-success", label: "Good To Know" },
};

const collaborationPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Define Roles Before You Invite",
        description:
            "Decide what each person needs to do before you bring them onto the platform. Map their job function to a platform role. A recruiter who needs to source and submit? Recruiter role. A VP who needs pipeline visibility? Team Member role. Role-first thinking prevents the most common team management mistakes.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Pair Recruiters With Hiring Managers",
        description:
            "The platform works best when recruiters and hiring managers operate as a unit. Recruiters source and submit. Hiring managers review and advance. Establish these pairs early so submission routing, communication, and stage progression flow naturally. Ad-hoc assignments create confusion and duplicate work.",
    },
    {
        icon: "fa-duotone fa-regular fa-message",
        title: "Use Platform Messaging, Not Email",
        description:
            "Keep team communication on the platform where it is contextual, searchable, and attached to the records it references. An email about a candidate submission gets lost in a thread. A platform message on the submission record stays there forever and is visible to anyone who needs the context.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Audit Roles Quarterly",
        description:
            "People change jobs. Responsibilities shift. Someone who was a Hiring Manager last quarter might now be in a different department entirely. Review the roster every quarter: remove people who left, adjust roles for those who moved, and confirm that permissions still align with actual responsibilities.",
    },
    {
        icon: "fa-duotone fa-regular fa-lightbulb",
        title: "Onboard With Intention",
        description:
            "When a new team member joins, walk them through the platform. Show them where to find their workspace, how to navigate their role-specific views, and where to get help. Five minutes of onboarding prevents five days of confusion and support tickets.",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Document Team Norms",
        description:
            "Write down how your team uses the platform. Which naming conventions do you follow for candidates? How do you tag submissions? When do you move candidates between stages? Team norms written down are followed. Team norms in someone's head are forgotten the moment that person goes on vacation.",
    },
];

const securityPractices = [
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "Principle Of Least Privilege",
        description:
            "Give every team member the minimum access they need to do their job. Start low, upgrade when needed, and document the reason for every escalation. This is not bureaucracy -- it is the single most effective way to prevent data exposure. Most security incidents in team tools come from over-provisioned accounts, not from sophisticated attacks.",
    },
    {
        icon: "fa-duotone fa-regular fa-key",
        title: "Individual Accounts Only",
        description:
            "Every team member gets their own account with their own credentials. Never share login credentials between people. Shared accounts destroy accountability -- you cannot audit actions, attribute changes, or revoke access for one person without affecting everyone who shares the credential.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Audit Trail Awareness",
        description:
            "Every action on the platform is logged: who invited whom, who changed which role, who removed which member, and when. Company Admins can review these logs for compliance audits, incident investigations, and general governance. The audit trail is automatic and cannot be edited or deleted.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-xmark",
        title: "Immediate Offboarding",
        description:
            "When someone leaves your organization, remove them from the platform immediately. Do not wait for the end of the week, the end of the billing cycle, or the next team meeting. A departed employee with active platform access is a data exposure incident waiting to happen. Remove them the same day they leave.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Two-Factor Authentication",
        description:
            "Require two-factor authentication for all team members, especially Company Admins. Clerk, the authentication provider, supports TOTP and passkey-based 2FA. A compromised password with 2FA enabled is an inconvenience. A compromised password without 2FA is a data breach.",
    },
    {
        icon: "fa-duotone fa-regular fa-rotate",
        title: "Regular Access Reviews",
        description:
            "Schedule periodic reviews of who has access to what. Compare the roster against your HR records. Verify that roles match current job functions. Identify and remove orphaned accounts. This is not optional for organizations handling sensitive candidate data -- it is the baseline for responsible data stewardship.",
    },
];

const troubleshootItems = [
    {
        symptom: "I cannot invite a new team member",
        cause: "Your account does not have Company Admin permissions, or you have reached your plan's seat limit.",
        fix: "Ask a Company Admin to verify your role. If you are an admin, check seat availability under Billing. Either upgrade the plan or remove inactive members to free seats.",
    },
    {
        symptom: "A team member cannot access their workspace",
        cause: "Their assigned role does not include the permissions they need, or their invitation was accepted with a different email address.",
        fix: "Check the member's role in Team Settings. If the role is correct, verify the email address matches their Clerk account. Adjust the role or resend the invitation to the correct email.",
    },
    {
        symptom: "Invitation email never arrived",
        cause: "The email went to spam, the address was mistyped, or the recipient's mail server blocked it.",
        fix: "Ask the invitee to check spam and junk folders. If nothing is found, cancel the pending invitation and resend to a verified email address. Alternatively, share the direct invitation link.",
    },
    {
        symptom: "I removed a member but they can still log in",
        cause: "The removal was not saved, or the member has accounts in multiple organizations.",
        fix: "Verify the removal in Team Settings -- the member should no longer appear in the roster. If they are logging into a different organization, that is expected. Each organization manages its own membership independently.",
    },
    {
        symptom: "Role change is not taking effect",
        cause: "The member needs to refresh their session for new permissions to propagate.",
        fix: "Ask the team member to log out and log back in. Permission changes are applied on the next authentication event. If the issue persists, verify the role was saved successfully in Team Settings.",
    },
    {
        symptom: "I cannot see the Team tab in settings",
        cause: "Your role does not include team management visibility. Only Company Admins have full access to the Team tab.",
        fix: "Ask a Company Admin to check your role assignment. If you need team management access, request a role upgrade with a clear justification for the elevated permissions.",
    },
    {
        symptom: "Billing increased unexpectedly after adding members",
        cause: "New seats were added beyond your plan's included count, triggering prorated billing.",
        fix: "Check the Billing page for seat-related charges. Each seat beyond the plan limit is billed separately. If the increase is not expected, review recent team additions and remove any that were added in error.",
    },
    {
        symptom: "Pending invitation expired and the person cannot join",
        cause: "Invitations expire after 7 days if not accepted.",
        fix: "Cancel the expired invitation from the roster and send a new one. Follow up with the person directly to ensure they accept within the 7-day window this time.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Roles And Job Management",
        description: "Learn how your team members interact with jobs, pipelines, and the hiring workflow once they are onboard.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Your team is set up. Now learn the end-to-end workflow for submitting candidates to open roles.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/messages",
        icon: "fa-duotone fa-regular fa-comments",
        title: "Team Messaging",
        description: "Keep your team aligned with contextual, record-attached communication that replaces scattered email threads.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamManagementFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/team-management")} id="docs-feature-guides-team-management-jsonld" />
            <TeamMgmtAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-warning opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-error opacity-0" />
                        {/* People silhouettes */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="10" r="6" fill="none" className="stroke-warning" strokeWidth="3" />
                            <path d="M4,30 Q4,20 16,20 Q28,20 28,30" fill="none" className="stroke-warning" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <svg className="memphis-shape absolute bottom-[35%] right-[18%] opacity-0" width="28" height="28" viewBox="0 0 32 32">
                            <circle cx="16" cy="10" r="6" fill="none" className="stroke-success" strokeWidth="3" />
                            <path d="M4,30 Q4,20 16,20 Q28,20 28,30" fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-warning" />
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
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-warning">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-warning">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-warning">Team Management</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-warning text-warning-content">
                                    <i className="fa-duotone fa-regular fa-users-gear"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Control Who{" "}
                                <span className="relative inline-block">
                                    <span className="text-warning">Has Access</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-warning" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                YOUR TEAM IS YOUR PLATFORM. Every recruiter, every hiring manager,
                                every admin -- they all need the right access to do their jobs without
                                tripping over each other. Team Management is where you decide who gets
                                in, what they can touch, and when they need to leave. Get this right
                                and everything downstream works. Get it wrong and you spend your time
                                fixing permissions instead of making placements.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Company Admin
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-warning"></i>
                                    Hiring Manager
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TEAM OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Team Management{" "}
                                    <span className="text-warning">Does</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Team Management is not just a settings page. It is the permission
                                    layer that controls who can see, create, edit, and delete data
                                    across your entire organization.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
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
                    ADDING AND INVITING TEAM MEMBERS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Invite A{" "}
                                    <span className="text-success">Team Member</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Five steps from empty seat to an active, permissioned team member.
                                    The entire process takes under three minutes if you know the
                                    person's email and their intended role.
                                </p>
                            </div>

                            <div className="invite-container space-y-6">
                                {inviteSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="invite-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
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
                    ROLE ASSIGNMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Roles
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Role{" "}
                                    <span className="text-error">Assignment</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every team member gets exactly one role. That role defines their
                                    entire permission set. Choose deliberately. The wrong role is
                                    either a blocker or a liability.
                                </p>
                            </div>

                            <div className="role-container space-y-4">
                                {roleDefinitions.map((role) => (
                                    <div
                                        key={role.number}
                                        className="role-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${role.color}`}>
                                            <span className={`text-2xl font-black text-${role.color}-content`}>
                                                {role.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 bg-${role.color} text-${role.color}-content text-sm font-black`}>
                                                    {role.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {role.name}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {role.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-base-200 border-l-4 border-base-content/20">
                                                <i className="fa-duotone fa-regular fa-key text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {role.capabilities}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Role assignment callout */}
                            <div className="mt-8 p-6 border-4 border-warning bg-warning/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Roles Can Be Changed After Assignment
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            You are not locked in. Company Admins can change any team
                                            member's role at any time from Team Settings. The change
                                            takes effect on the member's next login. Start conservative
                                            and escalate as needed. That said, frequent role changes
                                            signal a planning problem -- decide upfront whenever possible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PERMISSION MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Permissions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Permission{" "}
                                    <span className="text-secondary">Areas</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Permissions are grouped into functional areas. Each role unlocks
                                    a specific combination of these areas. Understanding what each
                                    area controls helps you assign the right role the first time.
                                </p>
                            </div>

                            <div className="perm-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {permissionAreas.map((item, index) => (
                                    <div
                                        key={index}
                                        className="perm-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                    SEAT MANAGEMENT AND BILLING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Seats
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Seat Management{" "}
                                    <span className="text-error">And Billing</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Seats cost money. Every active member occupies one. Understanding
                                    how seats work prevents billing surprises and helps you optimize
                                    your subscription spend.
                                </p>
                            </div>

                            <div className="seat-container space-y-4">
                                {seatManagementItems.map((item, index) => {
                                    const p = priorityColors[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="seat-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${p.bg}`}>
                                                <i className={`${item.icon} text-lg text-white`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                        {item.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${p.bg} text-white`}>
                                                        {p.label}
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

                            {/* Seat management callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-piggy-bank text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Monthly Seat Audit Saves Money
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Set a calendar reminder to review your team roster on the
                                            first of every month. Remove members who have not logged in
                                            for 30 days. Downgrade roles where access is no longer needed.
                                            Organizations that do this consistently save 15-20% on their
                                            annual subscription costs compared to those that never audit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COLLABORATION BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Collaboration{" "}
                                    <span className="text-success">Best Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A well-managed team is more than correct permissions. It is how
                                    people work together, communicate, and maintain shared standards.
                                    These practices separate functional teams from high-performing ones.
                                </p>
                            </div>

                            <div className="collab-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collaborationPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="collab-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
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
                    SECURITY AND ACCESS CONTROL
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Security
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Security And{" "}
                                    <span className="text-secondary">Access Control</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    You are managing access to candidate data, billing information,
                                    and hiring pipelines. Security is not a feature -- it is a
                                    responsibility. These practices protect your organization and
                                    the people whose data you handle.
                                </p>
                            </div>

                            <div className="security-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {securityPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="security-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                                    Team management issues are almost always permission or invitation
                                    problems. Check here first before opening a support ticket.
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
                <section className="team-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-warning" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-success" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-warning text-warning-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-warning">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your team is set up and permissioned. Now put them to work
                                    with the workflows that drive placements and revenue.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-warning bg-warning text-warning-content transition-transform hover:-translate-y-1"
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
            </TeamMgmtAnimator>
        </>
    );
}
