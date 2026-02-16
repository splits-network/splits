import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { CompanyAdminAnimator } from "./company-admin-animator";

export const metadata = getDocMetadata("roles-and-permissions/company-admin");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-building-shield",
        title: "Organizational Authority",
        description:
            "Company Admins are the highest permission tier. You control who gets in, what they can access, and when they leave. Every setting, every integration, every billing decision flows through this role. If it affects the entire organization, you own it.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Team Management",
        description:
            "Invite members, assign roles, remove access. The team roster is your domain. You decide who becomes a Hiring Manager, who stays a Recruiter, and who needs to be offboarded. Individual accounts mean individual accountability, and you are the gatekeeper.",
    },
    {
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Billing And Subscriptions",
        description:
            "Manage payment methods, view invoices, upgrade or downgrade plans, and allocate seats. Billing is Company Admin-only. No other role sees subscription details, seat counts, or payment history. You own the budget and the burn rate.",
    },
    {
        icon: "fa-duotone fa-regular fa-database",
        title: "Cross-Module Data Access",
        description:
            "Company Admins see everything. All jobs, all candidates, all applications, all placements. You are not limited by ownership or assignment. If it exists in the system, you can view it, edit it, or delete it. This is full organizational visibility.",
    },
];

const capabilityGroups = [
    {
        title: "Team Control",
        icon: "fa-duotone fa-regular fa-user-plus",
        items: [
            "Invite new team members with assigned roles",
            "Remove members and revoke all access",
            "Change any member's role at any time",
            "View pending invitations and cancel them",
            "Track member activity and last login timestamps",
            "Access complete audit logs for team changes",
        ],
        accent: "coral",
    },
    {
        title: "Billing Management",
        icon: "fa-duotone fa-regular fa-receipt",
        items: [
            "View all invoices and payment history",
            "Update payment methods and billing details",
            "Upgrade or downgrade subscription plans",
            "Monitor seat utilization and costs",
            "Manage seat allocation across the organization",
            "Download billing statements for accounting",
        ],
        accent: "yellow",
    },
    {
        title: "Company Settings",
        icon: "fa-duotone fa-regular fa-building-columns",
        items: [
            "Edit company profile and branding",
            "Configure organization-wide defaults",
            "Manage notification preferences for the org",
            "Set hiring pipeline templates",
            "Define candidate field visibility rules",
            "Control external job board syndication",
        ],
        accent: "teal",
    },
    {
        title: "Integration Management",
        icon: "fa-duotone fa-regular fa-plug",
        items: [
            "Connect and disconnect third-party integrations",
            "Configure API keys and webhooks",
            "Manage data sync schedules",
            "View integration logs and errors",
            "Set up SSO and authentication providers",
            "Control external system permissions",
        ],
        accent: "purple",
    },
    {
        title: "Data And Operations",
        icon: "fa-duotone fa-regular fa-chart-mixed",
        items: [
            "Access all jobs regardless of ownership",
            "View all candidates across the organization",
            "Review all applications and placements",
            "Generate organization-wide analytics reports",
            "Export bulk data for compliance or migration",
            "Manage data retention and deletion policies",
        ],
        accent: "coral",
    },
    {
        title: "Security And Compliance",
        icon: "fa-duotone fa-regular fa-shield-check",
        items: [
            "Enforce two-factor authentication requirements",
            "Review audit logs for all member actions",
            "Manage session timeouts and security policies",
            "Control IP restrictions and access rules",
            "Handle data subject access requests (GDPR)",
            "Configure backup and disaster recovery settings",
        ],
        accent: "yellow",
    },
];

const accentStyles: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    yellow: { bg: "bg-yellow", border: "border-yellow", text: "text-yellow" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
};

const delegationPractices = [
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Start With Least Privilege",
        description:
            "Every team member should get the minimum role required to do their job. A recruiter who only sources candidates does not need Hiring Manager permissions. A VP who needs pipeline visibility does not need Company Admin access. Start low and escalate only when justified.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Co-Admin Pairing",
        description:
            "Avoid single points of failure. Assign Company Admin to at least two trusted individuals. If one admin leaves, is unavailable, or locks themselves out, the other can maintain continuity. This is not about trust -- it is about operational resilience.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Document Admin Actions",
        description:
            "Keep an internal log of major admin actions: who was invited, why a role was changed, when an integration was added. Audit logs show what happened. Your internal documentation shows why. Future admins will thank you when they inherit the account.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-lock",
        title: "Limit Admin Count",
        description:
            "Company Admin should be reserved for 2-4 people maximum. More admins means more risk surface, more audit noise, and more potential for conflicting configuration changes. If someone needs admin-level access for one task, do it for them rather than promoting them.",
    },
    {
        icon: "fa-duotone fa-regular fa-rotate",
        title: "Quarterly Access Review",
        description:
            "Every quarter, review the list of Company Admins. Confirm each person still needs the role. Remove admins who have moved to other teams, left the company, or no longer require that level of access. Stale admin accounts are security liabilities.",
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Train New Admins",
        description:
            "When you promote someone to Company Admin, walk them through what they can do and what they should avoid. Five minutes of onboarding prevents accidental billing changes, incorrect role assignments, and support tickets from confused teammates.",
    },
];

const securityGuidelines = [
    {
        number: "01",
        title: "Require Two-Factor Authentication",
        description:
            "Company Admins must enable 2FA on their accounts. Non-negotiable. A compromised admin password with 2FA is an inconvenience. A compromised admin password without 2FA is a full organizational breach. Enforce it for yourself and for all other admins.",
        priority: "critical",
    },
    {
        number: "02",
        title: "Use Strong, Unique Passwords",
        description:
            "Company Admin accounts should have unique passwords that are not reused across other services. Use a password manager. A leaked password from an unrelated service should not become a gateway to your entire recruiting operation.",
        priority: "critical",
    },
    {
        number: "03",
        title: "Monitor Audit Logs Regularly",
        description:
            "Check the audit log weekly for unexpected admin actions: role changes you did not authorize, invitations you did not send, integrations you did not enable. Early detection of unauthorized activity is the difference between a minor incident and a catastrophic breach.",
        priority: "high",
    },
    {
        number: "04",
        title: "Immediate Offboarding",
        description:
            "When an admin leaves the organization, remove their access immediately. Do not wait for the end of the day, the end of the week, or the transition period to wrap up. Remove them from the roster the moment they are no longer an employee.",
        priority: "critical",
    },
    {
        number: "05",
        title: "Separate Personal And Work Accounts",
        description:
            "Company Admins should use their work email address for their admin account, not a personal email. When someone leaves, their work email is deactivated. Personal emails live forever and can be accessed long after employment ends.",
        priority: "high",
    },
    {
        number: "06",
        title: "Review Integration Permissions",
        description:
            "Every integration connected to Splits Network has access to your data. Review active integrations quarterly. Disconnect integrations that are no longer used. Audit what data each integration can read, write, or export. Integrations are third-party risk surfaces.",
        priority: "medium",
    },
];

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: "bg-coral", text: "text-coral", label: "Critical" },
    high: { bg: "bg-yellow", text: "text-yellow", label: "Important" },
    medium: { bg: "bg-teal", text: "text-teal", label: "Good Practice" },
};

const commonIssues = [
    {
        symptom: "I cannot access the Team or Billing tabs",
        cause: "Your account does not have Company Admin permissions. Only Company Admins can access these sections.",
        fix: "Ask an existing Company Admin to verify your role. If you should have admin access, they can change your role from Team Settings. If there are no active admins, contact support for account recovery assistance.",
    },
    {
        symptom: "I invited a member but they cannot access anything",
        cause: "The assigned role was incorrect, or the invitation was accepted with a different email address than the one invited.",
        fix: "Check the member's role in Team Settings. Verify the email address they used to accept matches the invitation. If the role is wrong, change it. If the email differs, remove the incorrect account and resend the invitation.",
    },
    {
        symptom: "Billing charges increased unexpectedly",
        cause: "Additional seats were added beyond your plan's included count, triggering prorated billing.",
        fix: "Review recent team additions under Team Settings. Each seat beyond the plan limit is billed separately. If the additions were unintentional, remove the members and contact support to request a credit for the prorated charges.",
    },
    {
        symptom: "I removed a member but they still have access",
        cause: "The removal was not saved, or they have accounts in multiple organizations.",
        fix: "Verify the member is gone from the Team Settings roster. If they are still listed, remove them again and confirm the save. If they are logging into a different organization, that is expected -- each org manages its own membership.",
    },
    {
        symptom: "Integration is not syncing data",
        cause: "API credentials expired, webhook URLs changed, or the integration was disconnected.",
        fix: "Go to Company Settings → Integrations. Check the status indicator for the integration. Re-authenticate if needed, verify webhook URLs, and check the integration logs for specific error messages.",
    },
    {
        symptom: "Team member cannot see jobs they should access",
        cause: "Their role does not include job visibility, or the jobs are restricted by ownership.",
        fix: "Verify the member's role. Hiring Managers see jobs they own. Recruiters see jobs they are assigned to. Company Admins see all jobs. If the role is correct, check job-level permissions to ensure the member is assigned.",
    },
    {
        symptom: "Cannot change another admin's role",
        cause: "Company Admins cannot demote themselves or other admins if it would leave zero admins in the organization.",
        fix: "Ensure at least one other Company Admin exists before demoting someone. If you are trying to remove the last admin, you must first promote another member to Company Admin, then demote the original.",
    },
    {
        symptom: "Audit log shows actions I did not perform",
        cause: "Another admin performed the actions, or your account was compromised.",
        fix: "Verify with other admins to confirm who took the actions. If no one claims responsibility, immediately change your password, enable 2FA, and review all recent account activity. Contact support if you suspect unauthorized access.",
    },
];

const workflows = [
    {
        number: "01",
        title: "Onboarding A New Team Member",
        steps: [
            "Verify the person's role requirements (Recruiter, Hiring Manager, Team Member)",
            "Navigate to Company Settings → Team tab",
            "Click Invite Member, enter email and assign role",
            "Send invitation and follow up directly to ensure acceptance",
            "After acceptance, verify they landed in the roster with correct role",
            "Walk them through their workspace and role-specific features",
        ],
        tip: "Document the role assignment decision in your internal onboarding records. Six months later, when someone asks why this person is a Hiring Manager, you will have the answer.",
    },
    {
        number: "02",
        title: "Offboarding A Departing Team Member",
        steps: [
            "On the day of departure, go to Team Settings",
            "Locate the member in the roster",
            "Click Remove and confirm the action",
            "Verify the member is gone from the roster",
            "Reassign their owned jobs and candidates to active members",
            "Document the removal in your internal offboarding log",
        ],
        tip: "Do this immediately. A departing employee with active platform access is a data exposure risk. Offboarding can wait for equipment returns and exit interviews. Account removal cannot.",
    },
    {
        number: "03",
        title: "Upgrading A Subscription Plan",
        steps: [
            "Navigate to Company Settings → Billing tab",
            "Review current plan details and seat utilization",
            "Click Change Plan and select the new tier",
            "Review the prorated billing adjustment",
            "Confirm the plan change",
            "Verify the new seat count and features are active",
        ],
        tip: "Upgrade just before you need the additional seats, not months in advance. Paying for unused seats is wasted budget. Conversely, do not wait until you are blocked -- plan one billing cycle ahead.",
    },
    {
        number: "04",
        title: "Connecting A New Integration",
        steps: [
            "Go to Company Settings → Integrations tab",
            "Find the integration you want to connect",
            "Click Connect and follow the OAuth flow",
            "Grant the requested permissions",
            "Configure sync settings and data mapping",
            "Test the integration with a small data sample before enabling org-wide",
        ],
        tip: "Read the integration's permission requests carefully. Some integrations ask for more data access than they need. Only grant what is required for the integration to function.",
    },
    {
        number: "05",
        title: "Changing A Member's Role",
        steps: [
            "Navigate to Company Settings → Team tab",
            "Locate the member in the roster",
            "Click the role dropdown next to their name",
            "Select the new role",
            "Confirm the change",
            "Notify the member that their role changed and they need to log out and back in",
        ],
        tip: "Role changes take effect on the next login. Ask the member to refresh their session immediately after you make the change. This prevents confusion about why their permissions have not updated.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/feature-guides/team-management",
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Team Management Guide",
        description: "Deep dive into inviting members, managing roles, and maintaining your team roster.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/billing",
        icon: "fa-duotone fa-regular fa-credit-card",
        title: "Billing And Subscriptions",
        description: "Understand subscription plans, seat management, and billing workflows.",
        accent: "yellow",
    },
    {
        href: "/public/documentation-memphis/feature-guides/company-settings",
        icon: "fa-duotone fa-regular fa-gear",
        title: "Company Settings",
        description: "Configure organization-wide settings, integrations, and defaults.",
        accent: "teal",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CompanyAdminMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("roles-and-permissions/company-admin")} id="docs-company-admin-jsonld" />
            <CompanyAdminAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-4 border-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-coral opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-4 border-teal opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-coral opacity-0" />
                        {/* Shield icon */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="36" height="36" viewBox="0 0 24 24">
                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"
                                fill="none" className="stroke-yellow" strokeWidth="2" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[35%] right-[18%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-purple" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-teal" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-yellow">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/roles-and-permissions" className="text-base-content/50 transition-colors hover:text-yellow">
                                        Roles &amp; Permissions
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-yellow">Company Admin</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-yellow text-dark">
                                    <i className="fa-duotone fa-regular fa-building-shield"></i>
                                    Role Documentation
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Company Admin:{" "}
                                <span className="relative inline-block">
                                    <span className="text-yellow">Full Control</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-yellow" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                HERE IS WHAT YOU CONTROL. Company Admin is the highest permission tier.
                                You manage the team, the billing, the settings, and every configuration
                                that affects the entire organization. This role is not a badge -- it is
                                a responsibility. Use it deliberately.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-shield-check text-yellow"></i>
                                    Highest Permissions
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-eye text-yellow"></i>
                                    Full Visibility
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Company Admins{" "}
                                    <span className="text-yellow">Control</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Company Admin is organizational authority. You decide who has access,
                                    how money is spent, and what systems connect to your data.
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
                    CAPABILITIES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-cream">
                                    Capabilities
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What You Can{" "}
                                    <span className="text-teal">Do</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Company Admin permissions span every functional area of the platform.
                                    Here is the complete list of what you control.
                                </p>
                            </div>

                            <div className="capability-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {capabilityGroups.map((group, index) => {
                                    const a = accentStyles[group.accent];
                                    return (
                                        <div
                                            key={index}
                                            className="capability-card border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                                <i className={`${group.icon} text-xl ${a.text}`}></i>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide mb-4 text-base-content">
                                                {group.title}
                                            </h3>
                                            <ul className="space-y-2">
                                                {group.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-base-content/70">
                                                        <i className={`fa-solid fa-check mt-1 text-xs ${a.text}`}></i>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COMMON WORKFLOWS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                    Workflows
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Common Admin{" "}
                                    <span className="text-coral">Workflows</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    These are the most frequent admin tasks. Each one follows a specific
                                    sequence. Learn these and you handle 90% of admin operations.
                                </p>
                            </div>

                            <div className="workflow-container space-y-6">
                                {workflows.map((workflow, index) => (
                                    <div
                                        key={index}
                                        className="workflow-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-coral">
                                            <span className="text-2xl font-black text-cream">
                                                {workflow.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-coral text-cream text-sm font-black">
                                                    {workflow.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {workflow.title}
                                                </h3>
                                            </div>
                                            <ol className="space-y-1.5 mb-4">
                                                {workflow.steps.map((step, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-base-content/70">
                                                        <span className="font-bold text-coral mt-0.5">{idx + 1}.</span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-coral/10 border-l-4 border-coral">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-coral mt-0.5"></i>
                                                <p className="text-sm text-base-content/60">
                                                    {workflow.tip}
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
                    DELEGATION PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Best Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Delegation And{" "}
                                    <span className="text-purple">Responsibility</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Company Admin is powerful. Use it responsibly. These practices help
                                    you delegate safely, maintain accountability, and avoid common mistakes.
                                </p>
                            </div>

                            <div className="delegation-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {delegationPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="delegation-card border-4 border-purple/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-purple">
                                            <i className={`${item.icon} text-xl text-purple`}></i>
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
                    SECURITY GUIDELINES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                    Security
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Security{" "}
                                    <span className="text-coral">Guidelines</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Company Admin accounts are high-value targets. Protect yours with
                                    these security practices. One compromised admin account can expose
                                    the entire organization.
                                </p>
                            </div>

                            <div className="security-container space-y-4">
                                {securityGuidelines.map((item, index) => {
                                    const p = priorityColors[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="security-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${p.bg}`}>
                                                <span className="text-lg font-black text-dark">
                                                    {item.number}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                        {item.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${p.bg} text-dark`}>
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

                            {/* Security callout */}
                            <div className="mt-8 p-6 border-4 border-coral bg-coral/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-coral">
                                        <i className="fa-duotone fa-regular fa-shield-check text-cream"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Security Is Not Optional
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            You are responsible for candidate data, employee information, and
                                            billing details. A security incident is not just a technical problem --
                                            it is a legal, reputational, and financial liability. Treat admin
                                            account security as a core responsibility, not an IT checkbox.
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Common admin issues and how to fix them. Check here before opening
                                    a support ticket.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {commonIssues.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-yellow/15 bg-base-100 p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-yellow">
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
                                                <span className="font-bold text-teal uppercase text-xs tracking-wider">Fix:</span>{" "}
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
                <section className="admin-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-4 border-yellow" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-teal" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-coral" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-purple" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-yellow text-dark">
                                    Keep Learning
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    Related{" "}
                                    <span className="text-yellow">Guides</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Now that you understand Company Admin capabilities, explore the
                                    specific features and workflows you control.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentStyles[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`group relative border-4 ${a.border} bg-base-100 transition-transform hover:-translate-y-1`}
                                        >
                                            <div className={`h-2 ${a.bg}`} />
                                            <div className="p-6">
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                    <i className={`${item.icon} text-lg text-dark`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-base-content">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-base-content/70">
                                                    {item.description}
                                                </p>
                                                <div className="mt-6 pt-4 border-t-4 border-base-content/10 flex items-center justify-between">
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
                                    href="/public/documentation-memphis/roles-and-permissions"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-yellow bg-yellow text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-shield-keyhole"></i>
                                    All Roles
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
            </CompanyAdminAnimator>
        </>
    );
}
