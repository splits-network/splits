import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { CreateRoleAnimator } from "./create-role-animator";

export const metadata = getDocMetadata("core-workflows/create-and-publish-a-role");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Create Permission",
        description:
            "Your account must have the Recruiter, Hiring Manager, or Company Admin role with role-creation permissions enabled. If the Add Role button is missing, ask your admin to check your access.",
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Linked Organization",
        description:
            "Your account must be linked to an organization. Roles belong to organizations, not individuals. Without an org link, the system has nowhere to attach the role.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Compensation Details",
        description:
            "Have salary range, fee percentage, and guarantee period ready before you start. These fields are required and control how recruiter payouts are calculated.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Job Requirements",
        description:
            "Prepare the role title, location, employment type, and key qualifications. Clear requirements improve recruiter submissions and candidate matching accuracy.",
    },
];

const steps = [
    {
        number: "01",
        title: "Open The Roles Page",
        description:
            "Navigate to Roles from the sidebar. This is your central hub for all open, paused, and closed positions. The page shows a filterable list of every role in your organization.",
        detail:
            "If you are a recruiter, you will see roles you have been assigned to. Hiring managers see roles tied to their department. Company admins see everything.",
        tip: "Bookmark the Roles page. You will use it daily.",
    },
    {
        number: "02",
        title: "Click Add Role",
        description:
            "Select the Add Role button in the top-right corner of the Roles page. This opens the role creation wizard, a multi-step form that walks you through every required field.",
        detail:
            "The wizard saves your progress between steps. If you leave mid-way, your draft is preserved and you can resume where you left off. Drafts are visible only to you until published.",
        tip: "Do not worry about getting everything perfect on the first pass. You can edit every field after creation.",
    },
    {
        number: "03",
        title: "Enter Role Basics",
        description:
            "Fill in the role title, department, location (city, state, remote/hybrid/onsite), and employment type (full-time, part-time, contract). The title is what recruiters see first in the marketplace.",
        detail:
            "Use a clear, industry-standard title. Avoid internal jargon or abbreviations. 'Senior Software Engineer' works. 'SSE L4 - Platform' does not. Recruiters filter by title, so clarity drives submissions.",
        tip: "If the role supports remote work, set the location to 'Remote' and add the preferred timezone in the description.",
    },
    {
        number: "04",
        title: "Define Compensation",
        description:
            "Set the salary range (minimum and maximum), fee percentage, and guarantee period in days. The fee percentage is applied to the final salary to calculate the recruiter placement fee.",
        detail:
            "The guarantee period defines how many days after hire the placement is covered. If the candidate leaves within this window, the fee may be refunded or prorated depending on your agreement. Standard guarantee periods are 30, 60, or 90 days.",
        tip: "Confirm fee percentage and guarantee period with your finance team before publishing. Changing these after recruiters have submitted candidates creates confusion.",
    },
    {
        number: "05",
        title: "Write The Job Description",
        description:
            "Add a detailed description covering responsibilities, qualifications, benefits, and any unique aspects of the role. This is the primary content recruiters share with candidates to assess fit.",
        detail:
            "Structure your description with clear sections: About the Role, Responsibilities, Requirements (must-have vs. nice-to-have), and Benefits. Use bullet points for scanability. Avoid walls of text.",
        tip: "Include the 3-5 non-negotiable requirements at the top. Recruiters use these to pre-screen candidates before submitting.",
    },
    {
        number: "06",
        title: "Set Visibility And Recruiter Access",
        description:
            "Choose who can see and submit candidates to this role. Options include: all recruiters in the marketplace, only assigned recruiters, or only internal team members.",
        detail:
            "Public visibility means any recruiter on the platform can find and submit to your role. Restricted visibility limits submissions to recruiters you have explicitly assigned. Use restricted mode for confidential searches or when you already have preferred recruiters.",
        tip: "Start with restricted visibility for sensitive roles, then widen access if you need more candidate flow.",
    },
    {
        number: "07",
        title: "Review And Publish",
        description:
            "The final step shows a summary of everything you entered. Review each section for accuracy. When you are satisfied, click Publish to make the role live. The status changes to Active.",
        detail:
            "Publishing triggers notifications to eligible recruiters based on your visibility settings. Once published, the role appears in the recruiter marketplace within seconds. You can pause or close the role at any time from the Roles page.",
        tip: "Double-check the fee percentage and salary range one last time. These are the numbers recruiters see first and use to decide whether to work on your role.",
    },
];

const requiredFields = [
    { field: "Role Title", description: "The public-facing name of the position.", required: true },
    { field: "Location", description: "City, state, or Remote. Controls recruiter marketplace filters.", required: true },
    { field: "Employment Type", description: "Full-time, part-time, or contract.", required: true },
    { field: "Salary Range", description: "Minimum and maximum annual compensation.", required: true },
    { field: "Fee Percentage", description: "Percentage of salary paid as recruiter fee on placement.", required: true },
    { field: "Guarantee Period", description: "Days after hire the placement is guaranteed.", required: true },
    { field: "Job Description", description: "Detailed role overview, responsibilities, and requirements.", required: true },
    { field: "Department", description: "Internal department or team the role belongs to.", required: false },
    { field: "Visibility", description: "Public marketplace or restricted to assigned recruiters.", required: false },
    { field: "Skills / Tags", description: "Keywords for AI matching and recruiter search.", required: false },
    { field: "Hiring Manager", description: "The person who reviews and approves submissions.", required: false },
    { field: "Target Start Date", description: "When the ideal candidate would begin.", required: false },
];

const statusExplanations = [
    {
        status: "Draft",
        color: "bg-base-content/20",
        textColor: "text-base-content/60",
        description: "The role has been started but not published. Only visible to the creator. No recruiters can see it.",
    },
    {
        status: "Active",
        color: "bg-success",
        textColor: "text-success",
        description: "The role is live and visible to recruiters based on your visibility settings. Submissions are open.",
    },
    {
        status: "Paused",
        color: "bg-warning",
        textColor: "text-warning",
        description: "The role is temporarily hidden from the marketplace. Existing submissions remain, but no new ones are accepted.",
    },
    {
        status: "Closed",
        color: "bg-error",
        textColor: "text-error",
        description: "The role is filled or cancelled. Permanently removed from the marketplace. Historical data is preserved.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Be Specific About Requirements",
        description:
            "Separate must-have qualifications from nice-to-haves. Recruiters use your requirements to screen candidates. Vague requirements lead to poor submissions and wasted review time.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Use Realistic Salary Ranges",
        description:
            "Narrow ranges attract better-matched candidates. A range of $80K-$120K tells recruiters you know the level. A range of $60K-$200K tells them you do not.",
    },
    {
        icon: "fa-duotone fa-regular fa-pen-to-square",
        title: "Write For Recruiters, Not HR",
        description:
            "Recruiters pitch your role to candidates. Give them language they can use: what makes the role compelling, what the team culture is like, and what growth looks like.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        title: "Keep Roles Updated",
        description:
            "If requirements change, update the role immediately. Stale listings generate misaligned submissions. Pause the role while you make significant changes to avoid confusion.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Start Narrow, Then Widen",
        description:
            "Launch with restricted visibility to your preferred recruiters. If submissions are slow after a week, open the role to the full marketplace. This controls quality while testing demand.",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Add Skills And Tags",
        description:
            "Tags power the AI matching engine. More tags mean better candidate-role fit scores. Use industry-standard skill names that recruiters and candidates recognize.",
    },
];

const commonMistakes = [
    {
        mistake: "Publishing without a fee percentage",
        consequence: "Recruiters skip roles with missing fee information. No fee means no incentive to submit candidates.",
        fix: "Always set a competitive fee percentage before publishing. Industry standard is 15-25% of annual salary.",
    },
    {
        mistake: "Using internal titles nobody recognizes",
        consequence: "Recruiters cannot find your role through search or filters. Candidates do not understand the position.",
        fix: "Use market-standard job titles. Map internal levels to recognizable titles (e.g., 'IC3' becomes 'Senior Engineer').",
    },
    {
        mistake: "Setting the salary range too wide",
        consequence: "You receive candidates across wildly different experience levels. Review time increases, conversion drops.",
        fix: "Keep the range within 20-30% of the midpoint. If you genuinely have two levels open, create two separate roles.",
    },
    {
        mistake: "Forgetting to set visibility",
        consequence: "The role defaults to your organization's default setting, which may be more open or restricted than intended.",
        fix: "Explicitly choose visibility on every role. Do not rely on defaults for confidential or high-priority positions.",
    },
    {
        mistake: "Never updating the job description",
        consequence: "Requirements drift as the hiring team refines what they want. Recruiters submit against outdated criteria.",
        fix: "Review and update the description every two weeks for active roles. Pause the role if a major pivot is happening.",
    },
];

const troubleshootItems = [
    {
        symptom: "The Add Role button is missing",
        cause: "Your account does not have role-creation permissions, or you are not linked to an organization.",
        fix: "Ask a Company Admin to verify your role assignment and organization membership under Company Settings > Team.",
    },
    {
        symptom: "The role is not visible to recruiters after publishing",
        cause: "The role status may be Draft or Paused instead of Active. Or visibility is set to restricted with no recruiters assigned.",
        fix: "Check the status on the Roles page. Confirm it shows Active. If using restricted visibility, assign at least one recruiter.",
    },
    {
        symptom: "Recruiters say the fee information is missing",
        cause: "The fee percentage or guarantee period fields were left empty or set to zero.",
        fix: "Edit the role and fill in both compensation fields. Save and confirm the values appear in the role detail view.",
    },
    {
        symptom: "Draft role disappeared from the list",
        cause: "The Roles page filter may exclude drafts by default. Drafts are only visible to the creator.",
        fix: "Clear all filters or select the Draft status filter. If the draft is still missing, it may have been deleted by an admin.",
    },
    {
        symptom: "Cannot change the fee percentage after publishing",
        cause: "Some organizations lock compensation fields after the first submission is received to protect recruiter agreements.",
        fix: "Contact your Company Admin to unlock the field, or create a new role with the updated terms and close the original.",
    },
    {
        symptom: "AI matching scores are low for all submissions",
        cause: "The role is missing skills, tags, or has a vague job description that the matching engine cannot parse effectively.",
        fix: "Add 5-10 specific skill tags. Rewrite the description with clear requirements. Scores recalculate on the next submission.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-route",
        title: "All Core Workflows",
        description: "Browse all seven step-by-step guides from role creation to placement.",
        accent: "coral",
    },
    {
        href: "/public/documentation/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Once your role is live, learn how recruiters submit candidates to it.",
        accent: "teal",
    },
    {
        href: "/public/documentation/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Learn how to review submissions, add notes, and advance candidates through stages.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreateAndPublishRoleMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/create-and-publish-a-role")} id="docs-core-workflows-create-and-publish-a-role-jsonld" />
            <CreateRoleAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="create-role-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-18 h-18 rounded-full border-[5px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[9%] w-14 h-14 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[16%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[26%] w-12 h-12 rotate-12 bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[26%] right-[36%] w-18 h-7 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[40%] left-[30%] w-7 h-7 rotate-45 bg-warning opacity-0" />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[46%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-error" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[66%] left-[40%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
                                    <li>
                                        <Link href="/public/documentation-memphis" className="transition-colors hover:text-base-content">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li>
                                        <Link href="/public/documentation-memphis/core-workflows" className="transition-colors hover:text-base-content">
                                            Core Workflows
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li className="text-base-content">Create And Publish A Role</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-error text-error-content">
                                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                                    Workflow Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Create And{" "}
                                <span className="relative inline-block">
                                    <span className="text-error">Publish A Role</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-error" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-2xl mb-6 opacity-0">
                                HERE IS HOW YOU SHIP A ROLE. Define compensation, set requirements,
                                choose who can see it, and publish. Every downstream workflow starts here.
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
                <section className="prereq-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="prereq-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Before You Begin
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What You{" "}
                                    <span className="text-warning">Need</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Make sure you have these four things ready before opening the role wizard.
                                    Missing any of them will block you from publishing.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {prerequisites.map((item, index) => (
                                    <div
                                        key={index}
                                        className="prereq-card border-4 border-warning/30 bg-base-100 p-6 opacity-0"
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
                    STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="steps-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="steps-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The{" "}
                                    <span className="text-error">Creation</span>{" "}
                                    Process
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Seven steps from blank form to live role. Most users complete this in under ten minutes.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="step-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        {/* Step number */}
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-error">
                                            <span className="text-2xl font-black text-error-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-error text-error-content text-sm font-black">
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
                                            <div className="flex items-start gap-2 px-4 py-3 bg-error/10 border-l-4 border-error">
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
                    REQUIRED vs OPTIONAL FIELDS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="fields-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="fields-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Field Reference
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Required vs{" "}
                                    <span className="text-secondary">Optional</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every field in the role wizard. Required fields must be completed before you can publish.
                                    Optional fields improve recruiter matching and candidate quality.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {requiredFields.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`field-row flex items-start gap-4 p-4 border-4 opacity-0 ${
                                            item.required
                                                ? "border-error/20 bg-error/5"
                                                : "border-base-content/10 bg-base-100"
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${
                                            item.required ? "bg-error" : "bg-base-content/20"
                                        }`}>
                                            <i className={`fa-solid ${
                                                item.required ? "fa-asterisk" : "fa-plus"
                                            } text-xs ${
                                                item.required ? "text-error-content" : "text-base-content/60"
                                            }`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                    {item.field}
                                                </h3>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                                                    item.required
                                                        ? "bg-error text-error-content"
                                                        : "bg-base-content/10 text-base-content/50"
                                                }`}>
                                                    {item.required ? "Required" : "Optional"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-base-content/60">
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
                    ROLE STATUS MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="status-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="status-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Lifecycle
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Role{" "}
                                    <span className="text-success">Statuses</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every role moves through these four states. Understanding them helps you manage
                                    visibility and recruiter expectations.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {statusExplanations.map((item, index) => (
                                    <div
                                        key={index}
                                        className="status-card border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-4 h-4 rounded-full ${item.color}`} />
                                            <h3 className={`font-black text-lg uppercase tracking-wide ${item.textColor}`}>
                                                {item.status}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Status flow diagram */}
                            <div className="status-flow mt-10 flex items-center justify-center gap-3 flex-wrap opacity-0">
                                <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-base-content/20 text-base-content/60">
                                    Draft
                                </span>
                                <i className="fa-solid fa-arrow-right text-base-content/30"></i>
                                <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-success text-success-content">
                                    Active
                                </span>
                                <i className="fa-solid fa-arrows-left-right text-base-content/30"></i>
                                <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-warning text-warning-content">
                                    Paused
                                </span>
                                <i className="fa-solid fa-arrow-right text-base-content/30"></i>
                                <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-error text-error-content">
                                    Closed
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="practices-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="practices-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Best Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Write Roles That{" "}
                                    <span className="text-error">Actually Work</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between a role that attracts quality candidates and one that sits
                                    empty comes down to how you write it. Follow these six rules.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-error/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-error">
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
                    COMMON MISTAKES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="mistakes-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="mistakes-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Watch Out
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Common{" "}
                                    <span className="text-warning">Mistakes</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    These are the errors we see most often. Each one is easy to avoid once you know what to look for.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {commonMistakes.map((item, index) => (
                                    <div
                                        key={index}
                                        className="mistake-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-warning">
                                                <i className="fa-duotone fa-regular fa-xmark text-sm text-warning-content"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content pt-1">
                                                {item.mistake}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-base-content/60">
                                                <span className="font-bold text-base-content/80 uppercase text-xs tracking-wider">What happens:</span>{" "}
                                                {item.consequence}
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
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="trouble-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="trouble-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Troubleshooting
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Something{" "}
                                    <span className="text-error">Not Working?</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    If you hit a wall during role creation or after publishing, check here first.
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
                    REFERENCE — Glossary
                   ══════════════════════════════════════════════════════════════ */}
                <section className="reference-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="reference-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Reference
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Key{" "}
                                    <span className="text-secondary">Terms</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="ref-card border-4 border-secondary/20 bg-base-100 p-5 opacity-0">
                                    <h3 className="font-black text-sm uppercase tracking-wide text-secondary mb-1">Guarantee Period</h3>
                                    <p className="text-sm text-base-content/70">
                                        The number of days after hire during which the placement is covered. If the candidate leaves within this window, the recruiter fee may be refunded or prorated.
                                    </p>
                                </div>
                                <div className="ref-card border-4 border-secondary/20 bg-base-100 p-5 opacity-0">
                                    <h3 className="font-black text-sm uppercase tracking-wide text-secondary mb-1">Fee Percentage</h3>
                                    <p className="text-sm text-base-content/70">
                                        The percentage of the candidate's annual salary paid to the recruiter upon successful placement. Industry standard ranges from 15% to 25%.
                                    </p>
                                </div>
                                <div className="ref-card border-4 border-secondary/20 bg-base-100 p-5 opacity-0">
                                    <h3 className="font-black text-sm uppercase tracking-wide text-secondary mb-1">Visibility Setting</h3>
                                    <p className="text-sm text-base-content/70">
                                        Controls which recruiters can see and submit candidates to the role. Public makes it available to all marketplace recruiters. Restricted limits it to assigned recruiters only.
                                    </p>
                                </div>
                                <div className="ref-card border-4 border-secondary/20 bg-base-100 p-5 opacity-0">
                                    <h3 className="font-black text-sm uppercase tracking-wide text-secondary mb-1">Split Fee</h3>
                                    <p className="text-sm text-base-content/70">
                                        When two or more recruiters collaborate on a placement, the fee is divided according to a pre-agreed split ratio. The platform tracks and calculates these automatically.
                                    </p>
                                </div>
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
                                    Role Is Live
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What{" "}
                                    <span className="text-success">Comes Next</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your role is published and recruiters can see it. Here is where to go from here.
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
            </CreateRoleAnimator>
        </>
    );
}
