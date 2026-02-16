import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { RoleBasedAccessAnimator } from "./role-based-access-animator";

export const metadata = getDocMetadata("roles-and-permissions/role-based-access");

// ─── Data ────────────────────────────────────────────────────────────────────

const rbacOverview = [
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Permission Enforcement",
        description:
            "Every API call validates the requesting user's role before processing. You cannot see data you do not have permission for. You cannot edit records outside your scope. You cannot delete resources you do not own. The system checks first, acts second. Always.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-layer-group",
        title: "Role Hierarchy",
        description:
            "Company Admins see everything. Hiring Managers see their jobs and pipelines. Recruiters see their candidates and submissions. Team Members see what they need for visibility. Each role inherits specific capabilities -- no more, no less.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-filter-list",
        title: "Data Scoping",
        description:
            "Data visibility is filtered at the database query level based on your role and organizational context. If you query for candidates, you only get candidates in your scope. If you query for jobs, you only get jobs you are permitted to see. The filtering is automatic and cannot be bypassed.",
        accent: "purple",
    },
    {
        icon: "fa-duotone fa-regular fa-lock-keyhole",
        title: "Security Boundaries",
        description:
            "Role boundaries prevent cross-organization data leakage, unauthorized edits, and privilege escalation. A recruiter in Organization A cannot access jobs from Organization B. A Hiring Manager cannot modify billing settings. Each role operates within strict, enforced boundaries.",
        accent: "yellow",
    },
];

const roleCapabilities = [
    {
        role: "Company Admin",
        icon: "fa-duotone fa-regular fa-user-crown",
        description:
            "UNLIMITED ORGANIZATIONAL CONTROL. Company Admins manage team members, configure billing, access all jobs, view all candidates, modify company settings, integrate third-party services, and review audit logs. They operate without data scoping restrictions within their organization.",
        capabilities: [
            "View and edit all jobs across all companies",
            "Access all candidates and applications",
            "Invite, remove, and change roles for team members",
            "Manage billing, subscriptions, and payment methods",
            "Configure company settings and integrations",
            "Review full audit logs and activity history",
            "Approve or reject sensitive actions",
            "Access organization-wide analytics",
        ],
        dataScope: "Organization-wide -- all data across all companies within the org",
        accent: "coral",
    },
    {
        role: "Hiring Manager",
        icon: "fa-duotone fa-regular fa-user-tie",
        description:
            "PIPELINE OWNERSHIP. Hiring Managers create and manage jobs, review applications, move candidates through hiring stages, approve submissions, and collaborate with recruiters. They see candidates submitted to their jobs and can make hiring decisions. They cannot manage team members or billing.",
        capabilities: [
            "Create, edit, and close jobs",
            "Configure hiring stages and workflows",
            "Review applications and submissions",
            "Move candidates between stages",
            "Approve or reject candidate submissions",
            "Communicate with recruiters and candidates",
            "View job-specific analytics and metrics",
            "Assign jobs to recruiters",
        ],
        dataScope: "Company-scoped -- jobs and candidates for their assigned company",
        accent: "teal",
    },
    {
        role: "Recruiter",
        icon: "fa-duotone fa-regular fa-user-headset",
        description:
            "CANDIDATE OPERATIONS. Recruiters source candidates, create profiles, submit candidates to jobs, track application progress, and communicate with hiring teams. They see jobs they are assigned to and candidates they own. They cannot create jobs, change hiring stages, or access billing.",
        capabilities: [
            "Create and edit candidate profiles",
            "Submit candidates to assigned jobs",
            "Track application statuses",
            "View assigned jobs and their details",
            "Communicate with hiring managers",
            "Update candidate notes and tags",
            "View submission metrics",
            "Manage candidate documents",
        ],
        dataScope: "Self-scoped -- only candidates they created and jobs they are assigned to",
        accent: "purple",
    },
    {
        role: "Team Member",
        icon: "fa-duotone fa-regular fa-user",
        description:
            "READ-ONLY VISIBILITY. Team Members view dashboards, browse jobs, and see high-level pipeline metrics. They cannot create, edit, or delete records. This role is for stakeholders who need visibility without operational control.",
        capabilities: [
            "View dashboards and metrics",
            "Browse jobs (read-only)",
            "See candidate lists (limited details)",
            "View application statuses",
            "Access public documentation",
            "View team roster (no edits)",
        ],
        dataScope: "Company-scoped -- read-only access to their assigned company's data",
        accent: "yellow",
    },
];

const permissionMatrix = [
    {
        module: "Jobs",
        companyAdmin: "Create, Edit, Delete, Publish, Close",
        hiringManager: "Create, Edit, Delete, Publish, Close (own company)",
        recruiter: "View (assigned jobs only)",
        teamMember: "View (read-only)",
    },
    {
        module: "Candidates",
        companyAdmin: "Create, Edit, Delete, View All",
        hiringManager: "View (submitted to own jobs)",
        recruiter: "Create, Edit (own candidates), View All",
        teamMember: "View (limited details)",
    },
    {
        module: "Applications",
        companyAdmin: "View All, Change Stages, Approve/Reject",
        hiringManager: "View (own jobs), Change Stages, Approve/Reject",
        recruiter: "View (own submissions), Add Notes",
        teamMember: "View (status only)",
    },
    {
        module: "Team Members",
        companyAdmin: "Invite, Remove, Change Roles",
        hiringManager: "View Roster",
        recruiter: "View Roster",
        teamMember: "View Roster",
    },
    {
        module: "Billing",
        companyAdmin: "View Invoices, Manage Payment, Change Plan",
        hiringManager: "No Access",
        recruiter: "No Access",
        teamMember: "No Access",
    },
    {
        module: "Company Settings",
        companyAdmin: "Full Access",
        hiringManager: "No Access",
        recruiter: "No Access",
        teamMember: "No Access",
    },
    {
        module: "Analytics",
        companyAdmin: "Org-Wide Metrics",
        hiringManager: "Own Jobs Metrics",
        recruiter: "Own Submissions Metrics",
        teamMember: "Dashboard View Only",
    },
    {
        module: "Messages",
        companyAdmin: "View All, Send All",
        hiringManager: "View Own, Send to Assigned",
        recruiter: "View Own, Send to Assigned",
        teamMember: "View Public",
    },
];

const dataScoping = [
    {
        scenario: "Company Admin Queries Candidates",
        description:
            "The system returns ALL candidates across ALL companies within their organization. No filtering applied. The admin sees the full dataset for organizational oversight and cross-company analytics.",
        sqlLogic: "WHERE organization_id IN (admin's org IDs)",
        example: "Admin in Org A sees candidates from Company 1, Company 2, Company 3 (all owned by Org A).",
    },
    {
        scenario: "Hiring Manager Queries Jobs",
        description:
            "The system returns ONLY jobs for the companies the Hiring Manager is assigned to. They cannot see jobs from other companies within the same organization unless explicitly assigned.",
        sqlLogic: "WHERE company_id IN (manager's company IDs)",
        example: "Manager assigned to Company 1 sees only Company 1 jobs. Company 2 jobs are invisible.",
    },
    {
        scenario: "Recruiter Queries Candidates",
        description:
            "The system returns ONLY candidates the recruiter created. Even if another recruiter in the same company submits a candidate, the first recruiter cannot see it unless the candidate is submitted to a job they are assigned to.",
        sqlLogic: "WHERE created_by_id = recruiter's identity user ID OR (application exists for assigned job)",
        example: "Recruiter A sees only candidates they created, plus candidates submitted to jobs they are assigned to by other recruiters.",
    },
    {
        scenario: "Team Member Browses Applications",
        description:
            "The system returns application records for jobs in their assigned company, but sensitive candidate details are redacted. They see application status, stage, and job title -- not candidate contact info or salary expectations.",
        sqlLogic: "WHERE job.company_id IN (member's company IDs) -- redact sensitive fields",
        example: "Team Member sees 'Application for Senior Engineer' at 'Interview Stage' but cannot see candidate email or phone.",
    },
    {
        scenario: "Cross-Organization Query Attempt",
        description:
            "A user from Organization A attempts to query data from Organization B. The access context resolver finds no matching organization ID. The query returns zero results. No error, no leak -- just empty.",
        sqlLogic: "WHERE organization_id IN (user's org IDs) -- returns [] for Org B user querying Org A",
        example: "Recruiter in Org A queries candidates. System checks org context, finds Org A only. Org B candidates never hit the query.",
    },
];

const securityBoundaries = [
    {
        icon: "fa-duotone fa-regular fa-building-lock",
        title: "Organization Isolation",
        description:
            "Organizations are the top-level security boundary. Users in Org A cannot see, edit, or interact with data from Org B under any circumstances. The access context resolver enforces this at query time -- if your org ID is not in the dataset, the dataset does not exist for you.",
        priority: "critical",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase-arrow-right",
        title: "Company Scoping",
        description:
            "Companies are subdivisions within organizations. Hiring Managers and Team Members are scoped to specific companies. A manager for Company 1 cannot edit jobs for Company 2, even if both companies belong to the same parent organization. This prevents cross-company data mixing.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-user-lock",
        title: "Self-Ownership For Recruiters",
        description:
            "Recruiters operate under self-ownership rules. They can only edit candidates they created. They cannot modify another recruiter's candidate, even within the same company. This prevents accidental or malicious overwrites of sourced candidate data.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "Sensitive Field Redaction",
        description:
            "Team Members and other limited-access roles receive redacted data. Salary expectations, contact details, and internal notes are stripped from responses at the API layer. The data exists in the database but is filtered before reaching the frontend.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-file-shield",
        title: "Audit Trail Enforcement",
        description:
            "Every create, update, delete action is logged with the identity user ID. Audit logs are immutable and can only be viewed by Company Admins. This creates accountability and enables compliance reviews for sensitive data handling.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-ban",
        title: "No Privilege Escalation",
        description:
            "Roles cannot be self-assigned. Only Company Admins can change roles, and role changes are logged. A recruiter cannot promote themselves to Hiring Manager. A Hiring Manager cannot grant themselves Company Admin access. Role changes require an actor with higher privileges.",
        priority: "critical",
    },
];

const commonScenarios = [
    {
        number: "01",
        title: "Recruiter Submits Candidate To Job",
        flow: [
            "Recruiter creates candidate profile (scoped to recruiter)",
            "Recruiter queries available jobs (returns only jobs they are assigned to)",
            "Recruiter selects job and submits candidate",
            "System validates: recruiter owns candidate AND is assigned to job",
            "Application created, Hiring Manager notified",
            "Candidate now visible to Hiring Manager (through application link)",
        ],
        permissions: "Recruiter: create candidate, create application. Hiring Manager: view application, change stage.",
    },
    {
        number: "02",
        title: "Hiring Manager Reviews Applications",
        flow: [
            "Hiring Manager navigates to job pipeline",
            "System queries applications WHERE job.company_id IN (manager's company IDs)",
            "Manager sees all applications for their jobs (all recruiters)",
            "Manager reviews candidate details submitted by multiple recruiters",
            "Manager moves candidate to 'Interview' stage",
            "System logs action with manager's identity ID",
        ],
        permissions: "Hiring Manager: view applications (own jobs), change stages, add notes.",
    },
    {
        number: "03",
        title: "Company Admin Audits Team Activity",
        flow: [
            "Admin navigates to Audit Logs (Company Admin only)",
            "System queries audit_events WHERE organization_id = admin's org",
            "Admin sees all actions: invitations sent, roles changed, candidates created, jobs published",
            "Admin filters to 'role_changed' events for compliance review",
            "Admin exports audit log for quarterly security report",
        ],
        permissions: "Company Admin: view audit logs (org-wide), export data.",
    },
    {
        number: "04",
        title: "Team Member Views Dashboard",
        flow: [
            "Team Member logs in, lands on dashboard",
            "System queries metrics WHERE company_id IN (member's company IDs)",
            "Dashboard renders: job count, application count, open positions",
            "Member clicks 'View Candidates' -- sees redacted list (names only, no contact info)",
            "Member attempts to edit candidate -- button does not render (role check)",
        ],
        permissions: "Team Member: view dashboards, view jobs (read-only), view candidates (redacted).",
    },
];

const roleChangeImpacts = [
    {
        change: "Recruiter → Hiring Manager",
        immediate: "Loses self-scoped candidate access, gains company-scoped job management.",
        dataVisibility: "Can now see ALL candidates submitted to company jobs (not just own candidates).",
        capabilities: "Can create jobs, configure stages, approve submissions. Cannot edit unassigned candidates.",
        auditLog: "Previous candidate creations remain attributed to original recruiter identity.",
    },
    {
        change: "Hiring Manager → Company Admin",
        immediate: "Loses company scope, gains org-wide access.",
        dataVisibility: "Can now see ALL jobs, candidates, applications across ALL companies in org.",
        capabilities: "Can invite members, manage billing, configure settings, view audit logs.",
        auditLog: "Previous job creations remain attributed to original manager identity.",
    },
    {
        change: "Company Admin → Team Member",
        immediate: "Loses all edit/create/delete capabilities, gains read-only access.",
        dataVisibility: "Loses org-wide access, scoped to assigned company. Loses billing visibility entirely.",
        capabilities: "Can only view dashboards and browse records. Cannot invite, edit, or delete.",
        auditLog: "Previous admin actions remain logged. Demotion event logged.",
    },
    {
        change: "Team Member → Recruiter",
        immediate: "Gains candidate creation and submission capabilities.",
        dataVisibility: "Can now see assigned jobs (not just browse all jobs). Can create candidates.",
        capabilities: "Can create candidates, submit to jobs, track applications. Cannot create jobs.",
        auditLog: "Promotion event logged. Future actions logged as recruiter.",
    },
];

const troubleshooting = [
    {
        symptom: "I cannot see jobs that I know exist",
        cause: "Your role is scoped to specific companies or jobs. The jobs you are looking for are outside your permission scope.",
        fix: "Ask a Company Admin to verify your role and company assignments. If you are a Recruiter, ask to be assigned to the jobs. If you are a Hiring Manager, confirm your company_id matches the jobs' company_id.",
    },
    {
        symptom: "I cannot edit a candidate another recruiter created",
        cause: "Recruiters operate under self-ownership. You can only edit candidates you created.",
        fix: "Ask the candidate's creator to make the edit, or ask a Company Admin to reassign the candidate to you. Alternatively, if the candidate is submitted to a job you are assigned to, you can add notes via the application record.",
    },
    {
        symptom: "Billing page shows 'Access Denied'",
        cause: "Only Company Admins can view billing information. Your role does not include billing permissions.",
        fix: "Request a Company Admin to review billing on your behalf, or ask for a role change if you need ongoing billing access.",
    },
    {
        symptom: "Role change did not take effect immediately",
        cause: "Permission changes propagate on the next login. Your session still holds the old role token.",
        fix: "Log out and log back in. The new role will be reflected in your session token and permissions will update.",
    },
    {
        symptom: "I can see candidates but cannot view sensitive fields",
        cause: "Your role (Team Member) receives redacted data. Sensitive fields are stripped at the API layer.",
        fix: "Request a role upgrade to Recruiter or Hiring Manager if you need access to full candidate details. Justify the request based on your job function.",
    },
    {
        symptom: "API returns empty array for query I expect to have results",
        cause: "The access context scoping filtered out all results. The data exists but is outside your permission scope.",
        fix: "Verify your organization_id and company_id assignments with a Company Admin. Confirm the data you are querying belongs to your assigned org/company.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Principle Of Least Privilege",
        description:
            "Assign the minimum role required for each person's job function. Start low, escalate when justified. A recruiter who occasionally needs to view a job does not need Hiring Manager access -- assign them to that specific job instead.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Regular Permission Audits",
        description:
            "Review roles quarterly. Verify that each team member's role still aligns with their current responsibilities. Remove team members who no longer work on hiring. Downgrade roles for people whose job function changed.",
    },
    {
        icon: "fa-duotone fa-regular fa-messages-question",
        title: "Document Role Decisions",
        description:
            "Keep a record of why each person has their assigned role. When someone requests a role change, document the justification. This creates accountability and helps explain permission decisions during audits or compliance reviews.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-graduate",
        title: "Educate Team On Scoping",
        description:
            "Make sure team members understand what they can and cannot see. A recruiter who does not understand self-ownership will be confused when they cannot edit another recruiter's candidate. Five minutes of role onboarding prevents hours of support tickets.",
    },
    {
        icon: "fa-duotone fa-regular fa-list-timeline",
        title: "Use Audit Logs For Accountability",
        description:
            "When something goes wrong -- a candidate was deleted, a job was closed unexpectedly -- check the audit log. Every action is attributed to an identity user. The log tells you who did what and when. Use it.",
    },
    {
        icon: "fa-duotone fa-regular fa-rotate",
        title: "Plan For Role Transitions",
        description:
            "When someone's role changes, communicate the impact. A Hiring Manager promoted to Company Admin needs to know they now see org-wide data. A Recruiter demoted to Team Member needs to know they lost edit access. Surprise permission changes cause confusion.",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
    yellow: { bg: "bg-yellow", border: "border-yellow", text: "text-yellow" },
};

const priorityMap: Record<string, { bg: string; label: string }> = {
    critical: { bg: "bg-coral", label: "Critical" },
    high: { bg: "bg-yellow", label: "High" },
    medium: { bg: "bg-teal", label: "Medium" },
};

const nextSteps = [
    {
        href: "/public/documentation-memphis/roles-and-permissions/company-admin",
        icon: "fa-duotone fa-regular fa-user-crown",
        title: "Company Admin Role",
        description: "Deep dive into Company Admin capabilities, permissions, and responsibilities.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/roles-and-permissions/hiring-manager",
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Hiring Manager Role",
        description: "Understand the Hiring Manager role, job management, and pipeline control.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/roles-and-permissions/recruiter",
        icon: "fa-duotone fa-regular fa-user-headset",
        title: "Recruiter Role",
        description: "Learn about recruiter permissions, candidate ownership, and submission workflows.",
        accent: "purple",
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RoleBasedAccessMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("roles-and-permissions/role-based-access")} id="docs-rbac-jsonld" />
            <RoleBasedAccessAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-20 h-20 border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[35%] right-[10%] w-16 h-16 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[18%] w-12 h-12 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute top-[18%] right-[25%] w-14 h-14 rotate-12 border-4 border-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[40%] w-10 h-10 -rotate-6 bg-coral opacity-0" />
                        <div className="memphis-shape absolute top-[60%] left-[35%] w-8 h-8 rotate-45 border-4 border-yellow opacity-0" />
                        {/* Lock icons */}
                        <svg className="memphis-shape absolute top-[20%] left-[50%] opacity-0" width="36" height="36" viewBox="0 0 24 24">
                            <rect x="5" y="11" width="14" height="10" rx="1" fill="none" className="stroke-coral" strokeWidth="2" />
                            <path d="M8,11 L8,7 C8,4.79 9.79,3 12,3 C14.21,3 16,4.79 16,7 L16,11" fill="none" className="stroke-coral" strokeWidth="2" />
                        </svg>
                        <svg className="memphis-shape absolute bottom-[25%] right-[12%] opacity-0" width="32" height="32" viewBox="0 0 24 24">
                            <rect x="5" y="11" width="14" height="10" rx="1" fill="none" className="stroke-teal" strokeWidth="2" />
                            <path d="M8,11 L8,7 C8,4.79 9.79,3 12,3 C14.21,3 16,4.79 16,7 L16,11" fill="none" className="stroke-teal" strokeWidth="2" />
                        </svg>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[40%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
                                fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-cream/50 transition-colors hover:text-coral">
                                        Documentation
                                    </Link>
                                    <span className="text-cream/30">/</span>
                                    <Link href="/public/documentation-memphis/roles-and-permissions" className="text-cream/50 transition-colors hover:text-coral">
                                        Roles And Permissions
                                    </Link>
                                    <span className="text-cream/30">/</span>
                                    <span className="text-coral">Role-Based Access</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-dark">
                                    <i className="fa-duotone fa-regular fa-shield-check"></i>
                                    Security
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                                HERE&apos;S WHO{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">SEES WHAT</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-cream/70 max-w-3xl mb-6 opacity-0">
                                ROLE-BASED ACCESS CONTROL IS NOT A SUGGESTION. It is a security layer that
                                enforces who can see, create, edit, and delete data across the platform.
                                Your role defines your permissions. Your permissions define your data scope.
                                Your data scope defines what you can do. This page explains how the entire
                                system works, what each role can access, and why you cannot bypass it.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-cream/20 text-cream/60">
                                    <i className="fa-duotone fa-regular fa-user-crown text-coral"></i>
                                    Company Admin
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-cream/20 text-cream/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-teal"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-cream/20 text-cream/60">
                                    <i className="fa-duotone fa-regular fa-user-headset text-purple"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-cream/20 text-cream/60">
                                    <i className="fa-duotone fa-regular fa-user text-yellow"></i>
                                    Team Member
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    RBAC OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Foundation
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    How RBAC{" "}
                                    <span className="text-coral">Works</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Role-Based Access Control enforces security at every layer -- from
                                    API routes to database queries to frontend UI rendering. Here is
                                    what that means in practice.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rbacOverview.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`overview-card border-4 ${a.border} bg-cream p-6 opacity-0`}
                                        >
                                            <div className={`w-14 h-14 flex items-center justify-center mb-4 ${a.bg}`}>
                                                <i className={`${item.icon} text-xl text-dark`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide mb-2 text-dark">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-dark/70">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE CAPABILITIES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-dark opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Capabilities
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    What Each Role{" "}
                                    <span className="text-teal">Can Do</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Each role unlocks a specific set of capabilities. This is the
                                    complete breakdown of what each role can access and operate.
                                </p>
                            </div>

                            <div className="role-container space-y-8">
                                {roleCapabilities.map((role, index) => {
                                    const a = accentMap[role.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`role-card border-4 ${a.border} bg-dark p-6 md:p-8 opacity-0`}
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center ${a.bg}`}>
                                                    <i className={`${role.icon} text-2xl text-dark`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-black text-xl uppercase tracking-wide text-cream mb-2">
                                                        {role.role}
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-cream/70">
                                                        {role.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="font-bold text-xs uppercase tracking-wider text-cream/50 mb-2">
                                                    Capabilities
                                                </h4>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {role.capabilities.map((cap, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-cream/80">
                                                            <i className={`fa-solid fa-circle-check ${a.text} mt-0.5 text-xs`}></i>
                                                            <span>{cap}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className={`px-4 py-3 bg-cream/5 border-l-4 ${a.border}`}>
                                                <p className="text-xs font-bold uppercase tracking-wider text-cream/50 mb-1">
                                                    Data Scope
                                                </p>
                                                <p className="text-sm text-cream/70">
                                                    {role.dataScope}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PERMISSION MATRIX
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-dark">
                                    Matrix
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Permission{" "}
                                    <span className="text-purple">Breakdown</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    This table shows exactly what each role can do in each module.
                                    Use this as the reference when assigning roles or debugging access issues.
                                </p>
                            </div>

                            <div className="matrix-container overflow-x-auto opacity-0">
                                <table className="w-full border-4 border-dark">
                                    <thead>
                                        <tr className="bg-dark">
                                            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-cream border-4 border-dark">
                                                Module
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-coral border-4 border-dark">
                                                Company Admin
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-teal border-4 border-dark">
                                                Hiring Manager
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-purple border-4 border-dark">
                                                Recruiter
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-yellow border-4 border-dark">
                                                Team Member
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissionMatrix.map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? "bg-cream" : "bg-cream/50"}>
                                                <td className="px-4 py-3 text-sm font-bold text-dark border-4 border-dark">
                                                    {row.module}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-dark/70 border-4 border-dark">
                                                    {row.companyAdmin}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-dark/70 border-4 border-dark">
                                                    {row.hiringManager}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-dark/70 border-4 border-dark">
                                                    {row.recruiter}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-dark/70 border-4 border-dark">
                                                    {row.teamMember}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    DATA SCOPING EXAMPLES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-dark opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Scoping
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Data{" "}
                                    <span className="text-yellow">Scoping Logic</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Data scoping happens at the database query level. Here is exactly
                                    how the system filters data based on your role and context.
                                </p>
                            </div>

                            <div className="scope-container space-y-6">
                                {dataScoping.map((item, index) => (
                                    <div
                                        key={index}
                                        className="scope-card border-4 border-yellow bg-dark p-6 opacity-0"
                                    >
                                        <h3 className="font-black text-base uppercase tracking-wide mb-3 text-yellow">
                                            {item.scenario}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-cream/70 mb-3">
                                            {item.description}
                                        </p>
                                        <div className="px-4 py-3 bg-cream/5 border-l-4 border-yellow mb-3">
                                            <p className="text-xs font-mono text-cream/60">
                                                {item.sqlLogic}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-lightbulb text-yellow mt-0.5 text-xs"></i>
                                            <p className="text-xs text-cream/50">
                                                <span className="font-bold uppercase tracking-wider">Example:</span> {item.example}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SECURITY BOUNDARIES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Boundaries
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Security{" "}
                                    <span className="text-coral">Enforcement</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    These are the hard security boundaries that prevent unauthorized
                                    access, data leakage, and privilege escalation.
                                </p>
                            </div>

                            <div className="boundary-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {securityBoundaries.map((item, index) => {
                                    const p = priorityMap[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="boundary-card border-4 border-dark bg-cream p-6 opacity-0"
                                        >
                                            <div className="flex items-start gap-2 mb-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-dark">
                                                    <i className={`${item.icon} text-lg text-coral`}></i>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${p.bg} text-dark`}>
                                                    {p.label}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide mb-2 text-dark">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-dark/70">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COMMON SCENARIOS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-dark opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Workflows
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Common{" "}
                                    <span className="text-teal">Permission Scenarios</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    See how permissions work in real workflows. These scenarios show
                                    role interactions and scoping in action.
                                </p>
                            </div>

                            <div className="scenario-container space-y-6">
                                {commonScenarios.map((scenario) => (
                                    <div
                                        key={scenario.number}
                                        className="scenario-card flex gap-6 border-4 border-cream/10 bg-dark p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-teal">
                                            <span className="text-2xl font-black text-dark">
                                                {scenario.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-teal text-dark text-sm font-black">
                                                    {scenario.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-cream">
                                                    {scenario.title}
                                                </h3>
                                            </div>
                                            <ol className="space-y-2 mb-4">
                                                {scenario.flow.map((step, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-cream/70">
                                                        <span className="font-bold text-teal">{i + 1}.</span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                            <div className="px-4 py-3 bg-cream/5 border-l-4 border-teal">
                                                <p className="text-xs font-bold uppercase tracking-wider text-cream/50 mb-1">
                                                    Permissions Used
                                                </p>
                                                <p className="text-sm text-cream/70">
                                                    {scenario.permissions}
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
                    ROLE CHANGE IMPACTS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-dark">
                                    Transitions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Role Change{" "}
                                    <span className="text-purple">Impacts</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    When a role changes, permissions change. Here is what happens
                                    immediately, what data visibility shifts, and what audit trails persist.
                                </p>
                            </div>

                            <div className="impact-container space-y-4">
                                {roleChangeImpacts.map((impact, index) => (
                                    <div
                                        key={index}
                                        className="impact-card border-4 border-purple bg-cream p-6 opacity-0"
                                    >
                                        <h3 className="font-black text-base uppercase tracking-wide mb-4 text-dark">
                                            {impact.change}
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                                    Immediate Effect
                                                </p>
                                                <p className="text-sm text-dark/70">{impact.immediate}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                                    Data Visibility
                                                </p>
                                                <p className="text-sm text-dark/70">{impact.dataVisibility}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                                    Capabilities
                                                </p>
                                                <p className="text-sm text-dark/70">{impact.capabilities}</p>
                                            </div>
                                            <div className="px-4 py-3 bg-dark/5 border-l-4 border-purple">
                                                <p className="text-xs font-bold uppercase tracking-wider text-dark/50 mb-1">
                                                    Audit Log
                                                </p>
                                                <p className="text-sm text-dark/70">{impact.auditLog}</p>
                                            </div>
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
                <section className="content-section py-20 overflow-hidden bg-dark opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Permission{" "}
                                    <span className="text-yellow">Best Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Managing permissions correctly prevents security incidents, data
                                    leaks, and compliance failures. Follow these practices.
                                </p>
                            </div>

                            <div className="practice-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-yellow bg-dark p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-yellow">
                                            <i className={`${item.icon} text-lg text-dark`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-cream">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-cream/70">
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
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Access{" "}
                                    <span className="text-coral">Troubleshooting</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Permission issues are almost always role or scoping problems.
                                    Check here before opening a support ticket.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {troubleshooting.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-coral/20 bg-cream p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-coral">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-dark"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-dark pt-1">
                                                {item.symptom}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-dark/60">
                                                <span className="font-bold text-dark/80 uppercase text-xs tracking-wider">Cause:</span>{" "}
                                                {item.cause}
                                            </p>
                                            <p className="text-sm text-dark/70">
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
                <section className="rbac-cta relative py-20 overflow-hidden bg-dark">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 border-4 border-coral" />
                        <div className="absolute bottom-[20%] left-[8%] w-10 h-10 rotate-45 bg-teal" />
                        <div className="absolute top-[50%] left-[5%] w-8 h-8 rounded-full bg-yellow" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="60" height="20" viewBox="0 0 60 20">
                            <polyline points="0,16 8,4 16,16 24,4 32,16 40,4 48,16 56,4"
                                fill="none" className="stroke-purple" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-dark">
                                    Related
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-cream">
                                    Dive Into{" "}
                                    <span className="text-coral">Specific Roles</span>
                                </h2>
                                <p className="text-lg mb-10 text-cream/70 max-w-2xl mx-auto">
                                    You understand the system. Now learn the specifics of each role.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`group relative border-4 ${a.border} bg-dark transition-transform hover:-translate-y-1`}
                                        >
                                            <div className={`h-2 ${a.bg}`} />
                                            <div className="p-6">
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                    <i className={`${item.icon} text-lg text-dark`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-cream">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-cream/70">
                                                    {item.description}
                                                </p>
                                                <div className="mt-6 pt-4 border-t-4 border-cream/10 flex items-center justify-between">
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-coral bg-coral text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-shield-halved"></i>
                                    All Role Docs
                                </Link>
                                <Link
                                    href="/public/documentation-memphis"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-cream text-cream transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    All Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </RoleBasedAccessAnimator>
        </>
    );
}
