import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { ReviewAppsAnimator } from "./review-apps-animator";

export const metadata = getDocMetadata("core-workflows/review-applications-and-move-stages");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Application Access",
        description:
            "You must have access to the Applications page. Recruiters see applications they submitted. Hiring managers and admins see applications for roles they own or manage.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-check",
        title: "Assigned Role or Candidate",
        description:
            "You need an active application to review. Candidates must have been submitted to a role before they appear in the application pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-pen-to-square",
        title: "Feedback Ready",
        description:
            "Before moving a candidate to the next stage, have your notes, interview feedback, or decision rationale prepared. Some stages require written feedback before advancing.",
    },
];

const pipelineStages = [
    {
        number: "01",
        name: "Submitted",
        description: "The candidate has been submitted to the role. The application is visible to the hiring team. No action has been taken yet.",
        who: "Recruiter submits, Hiring Manager receives",
        color: "info",
    },
    {
        number: "02",
        name: "Screen",
        description: "The hiring team is reviewing the candidate's profile, resume, and submission notes. This is the first evaluation gate.",
        who: "Hiring Manager or Company Admin reviews",
        color: "warning",
    },
    {
        number: "03",
        name: "Interview",
        description: "The candidate has passed screening and is scheduled for or has completed interviews. Interview feedback should be attached to the application.",
        who: "Hiring Manager coordinates, Recruiter informed",
        color: "secondary",
    },
    {
        number: "04",
        name: "Offer",
        description: "The candidate has received or is being prepared for an offer. Compensation details and start dates are finalized at this stage.",
        who: "Company Admin or Hiring Manager extends",
        color: "success",
    },
    {
        number: "05",
        name: "Hired",
        description: "The candidate has accepted the offer. The application is complete and a placement record is created automatically.",
        who: "System generates placement, all parties notified",
        color: "success",
    },
    {
        number: "06",
        name: "Declined",
        description: "The candidate did not advance. A rejection reason should be recorded. The candidate can be resubmitted to other roles.",
        who: "Any reviewer with stage permissions",
        color: "error",
    },
];

const reviewSteps = [
    {
        number: "01",
        title: "Open Applications",
        description:
            "Navigate to the Applications page from the sidebar. You will see all applications you have access to, sorted by most recent activity. Use the status filter to focus on applications that need your attention -- filter by 'Screen' or 'Interview' to see what is waiting for review.",
        tip: "Bookmark filtered views. If you review Screen-stage applications daily, bookmark that filtered URL so you land directly on your queue.",
    },
    {
        number: "02",
        title: "Select An Application",
        description:
            "Click on any application row to open the detail view. The detail view shows the candidate's profile, submission notes from the recruiter, attached documents, the full stage timeline, and all notes left by collaborators. Everything you need to make a decision is here.",
        tip: "Use Split view to review applications without leaving the list. The detail panel opens on the right while the list stays visible on the left.",
    },
    {
        number: "03",
        title: "Review Candidate Materials",
        description:
            "Read the recruiter's submission notes first -- they explain why this candidate was submitted. Then review the candidate's resume, portfolio, or any attached documents. Check the candidate's profile for work history, skills, and contact details. Compare against the role requirements.",
        tip: "Open the role details in a new tab if you need to cross-reference requirements while reviewing the candidate.",
    },
    {
        number: "04",
        title: "Add Notes And Feedback",
        description:
            "Use the Notes panel to record your assessment. Notes are visible to all collaborators on this application. Be specific: mention which requirements the candidate meets, which they do not, and any concerns. If you conducted an interview, summarize key points, candidate strengths, and areas of concern.",
        tip: "Write notes as if someone else will make the final decision based on them. Clear, specific feedback accelerates the hiring process.",
    },
    {
        number: "05",
        title: "Upload Or Review Documents",
        description:
            "Attach interview scorecards, reference check results, or any supporting documents to the application. Documents are versioned and timestamped. You can also review documents that the recruiter or other collaborators have already uploaded. All documents remain attached throughout the application lifecycle.",
        tip: "Name documents descriptively. 'Interview-Scorecard-Round2-2026-02.pdf' is far more useful than 'document.pdf' when you are reviewing ten applications.",
    },
    {
        number: "06",
        title: "Move The Stage",
        description:
            "When you are ready to advance or reject the candidate, use the Stage Actions dropdown. Select the target stage. Some transitions require a note -- the system will prompt you if one is needed. Confirm the stage change. The timeline updates immediately and all collaborators are notified of the transition.",
        tip: "You cannot skip stages. The pipeline enforces order. If you need to move from Screen directly to Offer, you must pass through Interview first.",
    },
];

const detailPanels = [
    {
        icon: "fa-duotone fa-regular fa-user",
        title: "Candidate Profile",
        description:
            "Name, contact details, current role, location, skills, and professional summary. This section pulls from the candidate's master profile, so updates to the profile reflect here automatically.",
    },
    {
        icon: "fa-duotone fa-regular fa-memo",
        title: "Submission Notes",
        description:
            "The recruiter's notes explaining why this candidate is a fit for the role. These notes were written at submission time and cannot be edited after the fact. They are the recruiter's pitch.",
    },
    {
        icon: "fa-duotone fa-regular fa-timeline",
        title: "Stage Timeline",
        description:
            "A chronological record of every stage transition, who made the change, and when. Notes attached to stage changes appear inline. This is the audit trail for the entire application lifecycle.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Documents",
        description:
            "All files attached to the application: resumes, cover letters, scorecards, reference checks. Documents can be uploaded by any collaborator with access. Each document shows who uploaded it and when.",
    },
    {
        icon: "fa-duotone fa-regular fa-sticky-note",
        title: "Notes & Feedback",
        description:
            "Collaborative notes from all reviewers. Each note is timestamped and attributed to the author. Notes persist across stage changes and form the decision record for this application.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Role Context",
        description:
            "A summary of the role this candidate was submitted to: title, compensation range, key requirements, and location. This gives reviewers context without navigating away from the application.",
    },
];

const bulkActions = [
    {
        icon: "fa-duotone fa-regular fa-forward",
        title: "Bulk Stage Advance",
        description:
            "Select multiple applications and advance them to the next stage simultaneously. Useful after a screening session where you have reviewed a batch and want to move all passing candidates forward at once.",
        note: "Bulk advances still require notes if the target stage mandates them. You will be prompted once, and the note applies to all selected applications.",
    },
    {
        icon: "fa-duotone fa-regular fa-xmark-large",
        title: "Bulk Decline",
        description:
            "Select applications that will not advance and decline them in one action. A rejection reason is required. Choose from standard reasons or write a custom one. The same reason applies to all selected applications.",
        note: "Declined candidates are not deleted. They remain in the system and can be resubmitted to other roles later.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter",
        title: "Filter And Sort",
        description:
            "Use server-side filters to narrow the application list before taking action. Filter by stage, role, recruiter, date range, or candidate name. Sort by submission date, last activity, or stage. Filters persist until you clear them.",
        note: "Filters are URL-based. Share a filtered URL with a colleague so they see the same view.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Export Applications",
        description:
            "Export filtered application data to CSV for offline review or reporting. The export includes candidate name, role, current stage, submission date, and last activity date. Useful for weekly pipeline reviews.",
        note: "Exports respect your role permissions. Recruiters only export their own submissions. Admins export everything.",
    },
];

const bestPractices = [
    {
        title: "Review Within 48 Hours",
        description: "Candidates lose interest when applications sit in Screen for days. Set a target: review within 48 hours of submission. Fast reviews keep your pipeline moving and signal to recruiters that you take their submissions seriously.",
        icon: "fa-duotone fa-regular fa-clock",
    },
    {
        title: "Write Notes That Stand Alone",
        description: "Your notes should make sense to someone who was not in the room. State what you observed, what the candidate said, and your recommendation. Avoid shorthand. Future reviewers and legal compliance both depend on clear documentation.",
        icon: "fa-duotone fa-regular fa-pen-fancy",
    },
    {
        title: "Decline With A Reason",
        description: "Never decline without recording why. The rejection reason helps recruiters understand what you are looking for and submit better candidates next time. It also protects your organization during compliance audits.",
        icon: "fa-duotone fa-regular fa-message-exclamation",
    },
    {
        title: "Use Stage Ownership",
        description: "Each stage can have a designated owner. The owner is responsible for reviewing and advancing candidates at that stage. If you are not the owner, add notes and feedback but let the owner make the stage transition.",
        icon: "fa-duotone fa-regular fa-shield-check",
    },
    {
        title: "Check The Timeline Before Acting",
        description: "Before making a stage change, read the timeline. Another reviewer may have already added feedback or flagged a concern. Acting without reading the full context leads to miscommunication and duplicate effort.",
        icon: "fa-duotone fa-regular fa-timeline",
    },
    {
        title: "Coordinate On Multi-Stage Interviews",
        description: "For roles with multiple interview rounds, use notes to coordinate who interviews for what. Tag the interviewer in your note so they receive a notification. After each round, the interviewer should add their feedback before the next round is scheduled.",
        icon: "fa-duotone fa-regular fa-people-arrows",
    },
];

const troubleshootItems = [
    {
        symptom: "I cannot move a candidate to the next stage",
        cause: "Stage actions are restricted to the stage owner, or required data (like a note) is missing.",
        fix: "Check if the stage has a designated owner. If you are not the owner, ask them to advance. If you are the owner, look for a required-note prompt in the stage action modal.",
    },
    {
        symptom: "Candidate details are hidden or incomplete",
        cause: "The application has not reached the stage where those details are revealed, or your role does not have access.",
        fix: "Contact details and full profiles are often gated behind the Screen or Interview stage. Advance the application to the correct stage. If you still cannot see details, ask an admin to check your role permissions.",
    },
    {
        symptom: "Notes I added are not visible to the recruiter",
        cause: "Some note types are internal-only and not visible to external recruiters.",
        fix: "When adding a note, check the visibility toggle. 'Internal' notes are only visible to your organization. 'Shared' notes are visible to the submitting recruiter as well.",
    },
    {
        symptom: "Bulk actions are greyed out",
        cause: "You have selected applications across different stages, or you do not have permission for bulk operations.",
        fix: "Bulk stage advances require all selected applications to be in the same stage. Deselect any mismatched applications. If the button is still greyed out, your role may not have bulk action permissions.",
    },
    {
        symptom: "The stage timeline shows a gap or missing entry",
        cause: "A stage change was made by an admin using an override, or the system processed a bulk action.",
        fix: "Admin overrides and bulk actions are logged but may appear differently in the timeline. Check the audit log under the application's advanced details for the complete history.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Mark A Hire",
        description: "Learn how to finalize a hire and create a placement record.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Step-by-step guide for submitting candidates to open roles.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-comments",
        title: "Communicate With Team",
        description: "Use Messages and Notifications to coordinate with recruiters.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ReviewApplicationsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/review-applications-and-move-stages")} id="docs-review-apps-jsonld" />
            <ReviewAppsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[6%] w-16 h-16 rounded-full border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[10%] w-14 h-14 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[26%] w-12 h-12 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[3px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[58%] left-[34%] w-6 h-6 rotate-45 bg-error opacity-0" />
                        {/* Clipboard SVG */}
                        <svg className="memphis-shape absolute top-[14%] left-[44%] opacity-0" width="32" height="38" viewBox="0 0 32 38">
                            <rect x="2" y="6" width="28" height="30" rx="2" fill="none" className="stroke-success" strokeWidth="3" />
                            <rect x="10" y="2" width="12" height="8" rx="2" className="fill-success" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[52%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[48%] opacity-0" width="70" height="20" viewBox="0 0 70 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 70,16"
                                fill="none" className="stroke-error" strokeWidth="2.5" strokeLinecap="round" />
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
                                    <Link href="/public/documentation-memphis/core-workflows" className="text-base-content/50 transition-colors hover:text-success">
                                        Core Workflows
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-success">Review Applications</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-clipboard-check"></i>
                                    Workflow 05
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Review Applications{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">& Move Stages</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                Applications are the backbone of your hiring pipeline. Every candidate
                                submission flows through stages, collects feedback, and ends in a hire
                                or a decline. This guide covers everything: reviewing materials, writing
                                notes, moving stages, bulk operations, and the practices that keep your
                                pipeline fast and fair.
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {prerequisites.map((item, index) => (
                                    <div
                                        key={index}
                                        className="detail-card border-4 border-warning/30 bg-base-100 p-6 opacity-0"
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
                    THE STAGE PIPELINE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Pipeline
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The Stage{" "}
                                    <span className="text-error">Pipeline</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every application moves through a defined pipeline. Stages are
                                    sequential -- you cannot skip them. Each stage has a purpose, an
                                    owner, and specific actions that unlock when you arrive.
                                </p>
                            </div>

                            <div className="pipeline-container space-y-4">
                                {pipelineStages.map((stage) => (
                                    <div
                                        key={stage.number}
                                        className="pipeline-stage flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        {/* Stage number */}
                                        <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${stage.color}`}>
                                            <span className={`text-2xl font-black text-${stage.color}-content`}>
                                                {stage.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 bg-${stage.color} text-${stage.color}-content text-sm font-black`}>
                                                    {stage.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {stage.name}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {stage.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-base-200 border-l-4 border-base-content/20">
                                                <i className="fa-duotone fa-regular fa-user-group text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {stage.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pipeline callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Stages Are Sequential
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            You cannot skip stages. Moving from Submitted to Offer requires
                                            passing through Screen and Interview first. This ensures every
                                            candidate receives consistent evaluation and that the audit trail
                                            is complete. The only exception is Declined, which can be applied
                                            from any stage.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    STEP-BY-STEP REVIEW PROCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The Review{" "}
                                    <span className="text-success">Process</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Follow these steps for each application you review. The process
                                    is the same regardless of your role -- what changes is which
                                    applications you see and which stage actions you have permission to take.
                                </p>
                            </div>

                            <div className="steps-container space-y-6">
                                {reviewSteps.map((step, index) => (
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
                    THE APPLICATION DETAIL VIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Detail View
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What You{" "}
                                    <span className="text-secondary">See</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The application detail view is where decisions happen. Here is
                                    every panel and what it contains. Familiarize yourself with
                                    these before your first review.
                                </p>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {detailPanels.map((panel, index) => (
                                    <div
                                        key={index}
                                        className="detail-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-secondary">
                                            <i className={`${panel.icon} text-xl text-secondary`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                            {panel.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-base-content/70">
                                            {panel.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    BULK ACTIONS & FILTERING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Efficiency
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Bulk Actions &{" "}
                                    <span className="text-warning">Filtering</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    When you are reviewing ten or fifty applications, one at a time
                                    is slow. Use bulk actions and smart filtering to move through
                                    your queue efficiently.
                                </p>
                            </div>

                            <div className="bulk-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bulkActions.map((action, index) => (
                                    <div
                                        key={index}
                                        className="bulk-card border-4 border-warning/25 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-warning">
                                                <i className={`${action.icon} text-warning-content`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                                {action.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70 mb-3">
                                            {action.description}
                                        </p>
                                        <div className="flex items-start gap-2 px-3 py-2 bg-warning/10 border-l-4 border-warning">
                                            <i className="fa-duotone fa-regular fa-circle-info text-warning mt-0.5 text-xs"></i>
                                            <p className="text-xs text-base-content/50">
                                                {action.note}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    REJECTION WORKFLOWS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Decline
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Rejection{" "}
                                    <span className="text-error">Workflows</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Declining a candidate is not the end of the story. Done well,
                                    rejections build trust with recruiters and protect your
                                    organization. Done poorly, they damage relationships and
                                    create compliance risk.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* When to decline */}
                                <div className="border-4 border-error/20 bg-base-100 p-6 md:p-8">
                                    <h3 className="font-black text-lg uppercase tracking-wide text-base-content mb-4">
                                        When To Decline
                                    </h3>
                                    <ul className="space-y-3 text-base text-base-content/70 leading-relaxed">
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 text-sm"></i>
                                            <span>The candidate does not meet the minimum qualifications for the role after a thorough review of their profile and resume.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 text-sm"></i>
                                            <span>The candidate performed poorly in interviews and the interview panel recommends against advancement.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 text-sm"></i>
                                            <span>The role has been filled and remaining applications need to be closed out.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 text-sm"></i>
                                            <span>The candidate has withdrawn or is no longer responsive after multiple contact attempts.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* How to decline */}
                                <div className="border-4 border-error/20 bg-base-100 p-6 md:p-8">
                                    <h3 className="font-black text-lg uppercase tracking-wide text-base-content mb-4">
                                        How To Decline
                                    </h3>
                                    <ol className="space-y-3 text-base text-base-content/70 leading-relaxed">
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-error text-error-content text-xs font-black">1</span>
                                            <span>Open the application and click the <strong>Stage Actions</strong> dropdown.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-error text-error-content text-xs font-black">2</span>
                                            <span>Select <strong>Decline</strong>. This option is available from any stage.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-error text-error-content text-xs font-black">3</span>
                                            <span>Choose a rejection reason from the dropdown. Options include: does not meet requirements, failed interview, position filled, candidate withdrew, and other.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-error text-error-content text-xs font-black">4</span>
                                            <span>Add a note explaining the decision. This is required. The note is visible to all collaborators and forms part of the compliance record.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-error text-error-content text-xs font-black">5</span>
                                            <span>Confirm the decline. The recruiter is notified and the application moves to the Declined stage. The candidate remains in the system for future consideration.</span>
                                        </li>
                                    </ol>
                                </div>

                                {/* After declining */}
                                <div className="p-6 border-4 border-success bg-success/5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                            <i className="fa-duotone fa-regular fa-rotate text-success-content"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                                After A Decline
                                            </h4>
                                            <p className="text-sm text-base-content/70 leading-relaxed">
                                                Declined candidates are not lost. They remain in your candidate
                                                database and can be resubmitted to different roles in the future.
                                                The decline reason and notes carry forward, giving future
                                                reviewers context about previous evaluations. Think of a decline
                                                as &quot;not this role, not right now&quot; rather than &quot;never.&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best{" "}
                                    <span className="text-success">Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Speed and quality are not enemies. These practices keep your
                                    pipeline fast, fair, and well-documented.
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
                <section className="review-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-success" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-error" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-warning" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-success" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-success text-success-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-success">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    You know how to review applications and move stages. Here are
                                    the workflows that connect to this one.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-success bg-success text-success-content transition-transform hover:-translate-y-1"
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
            </ReviewAppsAnimator>
        </>
    );
}
