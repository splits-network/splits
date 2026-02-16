import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { ApplicationsAnimator } from "./applications-animator";

export const metadata = getDocMetadata("feature-guides/applications");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewPoints = [
    {
        icon: "fa-duotone fa-regular fa-layer-group",
        title: "Single Source Of Truth",
        description:
            "Every candidate submission lives in one place. Stage history, reviewer notes, attached documents, and decision outcomes are all captured on the application record. No spreadsheets. No side channels. One application, one timeline, one audit trail.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-spin",
        title: "Pipeline-Driven Workflow",
        description:
            "Applications move through a defined pipeline: Submitted, Screen, Interview, Offer, Hired, or Declined. Stages are sequential and enforced. Every transition is logged with who made the change, when, and why. You cannot skip stages.",
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Role-Based Visibility",
        description:
            "What you see depends on who you are. Recruiters see applications they submitted. Hiring managers see applications for their roles. Company admins see everything. Permissions are automatic -- no configuration required.",
    },
];

const reviewSteps = [
    {
        number: "01",
        title: "Open The Application",
        description:
            "Navigate to Applications from the sidebar. The list shows every application you have access to, sorted by most recent activity. Use the stage filter to focus your queue. Click any row to open the detail view.",
        tip: "Bookmark filtered views. If you review Screen-stage applications every morning, save that filtered URL for one-click access.",
    },
    {
        number: "02",
        title: "Read The Submission Notes",
        description:
            "The recruiter wrote submission notes explaining why this candidate fits the role. Start here. These notes are the recruiter's pitch -- they highlight relevant experience, salary expectations, availability, and anything else the hiring team should know upfront.",
        tip: "Submission notes are locked after submission. They represent the recruiter's original rationale and cannot be edited retroactively.",
    },
    {
        number: "03",
        title: "Review Candidate Materials",
        description:
            "Open the candidate's resume, portfolio, or any attached documents. Cross-reference their work history and skills against the role requirements. Check their profile for contact details, location, and professional summary. Build your assessment before reading what others have said.",
        tip: "Open the role details in a new tab so you can compare requirements side-by-side with the candidate profile.",
    },
    {
        number: "04",
        title: "Write Your Assessment",
        description:
            "Use the Notes panel to record your evaluation. Be specific: state which requirements the candidate meets, which they do not, and flag any concerns. If you interviewed the candidate, summarize the conversation, their strengths, and red flags. Notes are visible to all collaborators.",
        tip: "Write notes as if someone else will make the final decision based on them. Clear, attributed feedback accelerates hiring.",
    },
    {
        number: "05",
        title: "Make The Stage Decision",
        description:
            "Use the Stage Actions dropdown to advance or decline. Select the target stage. Some transitions require a note -- the system prompts you. Confirm. The timeline updates immediately, all collaborators are notified, and the application moves forward.",
        tip: "You cannot skip stages. Moving from Screen to Offer requires passing through Interview. The only exception is Decline, which works from any stage.",
    },
];

const stageDefinitions = [
    {
        number: "01",
        name: "Submitted",
        description: "The candidate has been submitted to the role by a recruiter. The application is now visible to the hiring team. No review action has been taken.",
        who: "Recruiter submits, Hiring Manager receives",
        color: "info",
    },
    {
        number: "02",
        name: "Screen",
        description: "The hiring team is evaluating the candidate's profile, resume, and submission notes. This is the first gate. Candidates who pass move to Interview.",
        who: "Hiring Manager or Company Admin reviews",
        color: "warning",
    },
    {
        number: "03",
        name: "Interview",
        description: "The candidate has passed screening and is in the interview process. Feedback from each interview round should be attached as notes on the application.",
        who: "Hiring Manager coordinates, Recruiter informed",
        color: "secondary",
    },
    {
        number: "04",
        name: "Offer",
        description: "An offer is being prepared or has been extended. Compensation details, start dates, and offer terms are finalized at this stage.",
        who: "Company Admin or Hiring Manager extends",
        color: "success",
    },
    {
        number: "05",
        name: "Hired",
        description: "The candidate accepted the offer. The application is complete. A placement record is created automatically, triggering fee calculations and recruiter payouts.",
        who: "System generates placement, all parties notified",
        color: "success",
    },
    {
        number: "06",
        name: "Declined",
        description: "The candidate did not advance. A rejection reason is recorded. The candidate remains in the system and can be resubmitted to other roles in the future.",
        who: "Any reviewer with stage permissions",
        color: "error",
    },
];

const notesBestPractices = [
    {
        icon: "fa-duotone fa-regular fa-pen-fancy",
        title: "Be Specific, Not Vague",
        description:
            "\"Strong candidate\" tells nobody anything. \"8 years of React experience, led a team of 6, salary expectation aligns with budget, available in 2 weeks\" gives the next reviewer everything they need. Specificity is respect for your colleagues' time.",
    },
    {
        icon: "fa-duotone fa-regular fa-eye",
        title: "Check Visibility Before Posting",
        description:
            "Notes have a visibility toggle. Internal notes are visible only to your organization. Shared notes are visible to the submitting recruiter. Before you post, confirm which audience you are writing for. Internal feedback about compensation strategy should never be shared externally.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        title: "Notes Are Permanent",
        description:
            "Once posted, notes cannot be deleted. They form the compliance and audit record for the application. Write with the understanding that these notes may be reviewed during audits, disputes, or legal proceedings. Professional, factual, attribution-based.",
    },
    {
        icon: "fa-duotone fa-regular fa-at",
        title: "Tag Collaborators",
        description:
            "When your note requires action from a specific person, tag them. Tagged collaborators receive a notification. This is how you coordinate multi-stage reviews, hand off between interviewers, and escalate concerns without switching to a separate messaging tool.",
    },
];

const documentGuidance = [
    {
        icon: "fa-duotone fa-regular fa-file-arrow-up",
        title: "Upload With Purpose",
        description:
            "Attach resumes, cover letters, interview scorecards, reference check results, and offer letters. Every document is versioned and timestamped. Name files descriptively -- \"Interview-Scorecard-Round2-Feb2026.pdf\" beats \"document.pdf\" when you are reviewing twenty applications.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Access Is Inherited",
        description:
            "Document visibility follows application access rules. If you can see the application, you can see its documents. Recruiters see documents on applications they submitted. Hiring managers see documents for their roles. Admins see everything.",
    },
    {
        icon: "fa-duotone fa-regular fa-timeline",
        title: "Documents Persist Across Stages",
        description:
            "Documents uploaded at the Screen stage are still visible at the Offer stage. Nothing gets lost during stage transitions. The full document history travels with the application from submission to final decision.",
    },
];

const roleAccessData = [
    {
        role: "Recruiter",
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        accent: "error",
        sees: "Applications they submitted across all roles",
        canDo: [
            "View application status and stage",
            "Read shared notes and documents",
            "Add submission notes at time of submission",
            "Upload supporting documents",
            "Receive notifications on stage changes",
        ],
        cannotDo: "Move stages, add internal notes, or access applications submitted by other recruiters",
    },
    {
        role: "Hiring Manager",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        accent: "success",
        sees: "All applications for roles they manage",
        canDo: [
            "Review candidate materials and profiles",
            "Add internal and shared notes",
            "Upload and review documents",
            "Move applications between stages",
            "Decline candidates with recorded reasons",
        ],
        cannotDo: "View applications for roles they do not manage, or access billing and payout data",
    },
    {
        role: "Company Admin",
        icon: "fa-duotone fa-regular fa-building-shield",
        accent: "warning",
        sees: "Every application across the entire organization",
        canDo: [
            "Everything a Hiring Manager can do",
            "Override stage transitions",
            "Access audit logs and compliance records",
            "Export application data",
            "Manage stage permissions and ownership",
        ],
        cannotDo: "N/A -- full access to all application features",
    },
];

const collaborationTips = [
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Use Notes, Not Messages",
        description:
            "Application notes are the collaboration surface for hiring decisions. Unlike chat messages, notes are permanent, timestamped, and attached to the specific application. When you discuss a candidate, do it in the notes. The record stays with the application forever.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Lean On Notifications",
        description:
            "Every stage change, new note, and document upload triggers a notification to relevant collaborators. You do not need to manually alert people that something happened. The system handles it. Focus on the work, not the coordination.",
    },
    {
        icon: "fa-duotone fa-regular fa-people-arrows",
        title: "Hand Off Between Interviewers",
        description:
            "For multi-round interviews, each interviewer should add their feedback as a note after their round. Tag the next interviewer in your note so they get a notification and can see what was covered. This creates a clear chain of custody through the interview process.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter-list",
        title: "Share Filtered Views",
        description:
            "Application filters are URL-based. When you want a colleague to see the same filtered view you are looking at, copy the URL and send it. They will land on the exact same filter configuration. Useful for weekly pipeline reviews and status meetings.",
    },
];

const bestPractices = [
    {
        title: "Review Within 48 Hours",
        description: "Candidates lose interest fast. Recruiters lose trust faster. Set a target: review every new submission within 48 hours. A fast no is better than a slow maybe. Speed signals that you take the pipeline seriously.",
        icon: "fa-duotone fa-regular fa-clock",
    },
    {
        title: "Decline With A Reason",
        description: "Never decline without recording why. The reason helps recruiters calibrate future submissions. It protects your organization during compliance audits. And it respects the effort the recruiter put into the submission.",
        icon: "fa-duotone fa-regular fa-message-exclamation",
    },
    {
        title: "Check The Timeline First",
        description: "Before acting on an application, read the timeline. Another reviewer may have flagged a concern, added feedback, or already scheduled an interview. Acting without context leads to duplicate work and miscommunication.",
        icon: "fa-duotone fa-regular fa-timeline",
    },
    {
        title: "Name Documents Clearly",
        description: "\"Resume-JaneDoe-SeniorEng.pdf\" is useful. \"document(3).pdf\" is not. When you are reviewing twenty applications, descriptive filenames save minutes per review. Multiply that across a quarter and the time savings are substantial.",
        icon: "fa-duotone fa-regular fa-file-pen",
    },
    {
        title: "Use Bulk Actions For Batch Decisions",
        description: "After a screening session, use bulk advance to move all passing candidates forward at once. After a role is filled, use bulk decline to close remaining applications. One action instead of fifty clicks.",
        icon: "fa-duotone fa-regular fa-forward",
    },
    {
        title: "Separate Internal From Shared Notes",
        description: "Compensation strategy, concerns about culture fit, and internal deliberations belong in internal notes. Feedback the recruiter should see -- like what additional information you need -- belongs in shared notes. Get this wrong and you create trust problems.",
        icon: "fa-duotone fa-regular fa-lock",
    },
];

const troubleshootItems = [
    {
        symptom: "I cannot see application details",
        cause: "The application belongs to a role you do not manage, or you are a recruiter viewing an application submitted by someone else.",
        fix: "Confirm you have the correct role assignment. Recruiters only see their own submissions. Ask a company admin to verify your access if the application should be visible to you.",
    },
    {
        symptom: "Stage changes are locked",
        cause: "Your role does not have permission to transition this stage, or a required note has not been provided.",
        fix: "Check if the stage has a designated owner who is not you. If you are the owner, look for a required-note prompt in the stage action modal. If neither applies, ask a company admin to review stage permissions.",
    },
    {
        symptom: "Notes are not visible to the recruiter",
        cause: "The note was posted with Internal visibility, which is hidden from external recruiters.",
        fix: "When adding a note, check the visibility toggle. Internal notes stay within your organization. Shared notes are visible to the submitting recruiter. You cannot change visibility after posting.",
    },
    {
        symptom: "Bulk actions are greyed out",
        cause: "The selected applications are in different stages, or your role does not have bulk action permissions.",
        fix: "Bulk stage advances require all selected applications to be in the same stage. Deselect mismatched applications. If the button remains greyed out, your role may lack bulk permissions.",
    },
    {
        symptom: "Documents I uploaded are missing",
        cause: "The upload may have failed silently due to file size limits or unsupported format.",
        fix: "Check file size (max 25MB) and format (PDF, DOCX, PNG, JPG supported). Re-upload the document. If the issue persists, check your network connection and try again.",
    },
    {
        symptom: "The timeline shows a gap or unexpected entry",
        cause: "An admin used a stage override, or the system processed a bulk action that compressed multiple transitions.",
        fix: "Check the audit log under the application's advanced details for the complete, uncompressed history. Admin overrides and bulk actions are logged but may appear differently in the simplified timeline.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Workflow",
        description: "Step-by-step walkthrough of reviewing applications and moving stages.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit Candidates",
        description: "How to submit candidates to open roles with effective notes.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows/mark-a-hire-and-track-placements",
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Mark A Hire",
        description: "Finalize a hire and track the resulting placement and fees.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

const ROLE_ACCENTS: Record<string, { bg: string; border: string; text: string; borderLight: string }> = {
    error: { bg: "bg-error", border: "border-error", text: "text-error", borderLight: "border-error/25" },
    success: { bg: "bg-success", border: "border-success", text: "text-success", borderLight: "border-success/25" },
    warning: { bg: "bg-warning", border: "border-warning", text: "text-warning", borderLight: "border-warning/25" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApplicationsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/applications")} id="docs-applications-jsonld" />
            <ApplicationsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[8%] left-[5%] w-16 h-16 rounded-full border-[4px] border-secondary opacity-0" />
                        <div className="memphis-shape absolute top-[48%] right-[8%] w-14 h-14 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[16%] left-[22%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[24%] w-12 h-12 rotate-12 bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[36%] w-16 h-6 -rotate-6 border-[3px] border-secondary opacity-0" />
                        <div className="memphis-shape absolute top-[60%] left-[36%] w-6 h-6 rotate-45 bg-secondary opacity-0" />
                        {/* File-lines SVG */}
                        <svg className="memphis-shape absolute top-[15%] left-[42%] opacity-0" width="30" height="36" viewBox="0 0 30 36">
                            <rect x="2" y="2" width="26" height="32" rx="2" fill="none" className="stroke-secondary" strokeWidth="3" />
                            <line x1="8" y1="12" x2="22" y2="12" className="stroke-secondary" strokeWidth="2" />
                            <line x1="8" y1="18" x2="22" y2="18" className="stroke-secondary" strokeWidth="2" />
                            <line x1="8" y1="24" x2="16" y2="24" className="stroke-secondary" strokeWidth="2" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[72%] left-[46%] opacity-0" width="70" height="20" viewBox="0 0 70 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 70,16"
                                fill="none" className="stroke-error" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-secondary">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-secondary">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-secondary">Applications</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-secondary text-secondary-content">
                                    <i className="fa-duotone fa-regular fa-file-lines"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Appli&shy;cations
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                Applications are where hiring decisions live. Every candidate
                                submission flows through a stage pipeline, collects notes and
                                documents from reviewers, and ends in a hire or a decline. This
                                guide covers the entire lifecycle -- from submission to final
                                decision -- and the tools you use to manage it.
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
                    OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Applications{" "}
                                    <span className="text-secondary">Do</span>
                                </h2>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-3 gap-6">
                                {overviewPoints.map((item, index) => (
                                    <div
                                        key={index}
                                        className="detail-card border-4 border-secondary/30 bg-base-100 p-6 opacity-0"
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
                    THE REVIEW PROCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
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
                                    The same five steps apply whether you are reviewing your first
                                    application or your five hundredth. What changes is speed and
                                    pattern recognition -- the process stays constant.
                                </p>
                            </div>

                            <div className="steps-container space-y-6">
                                {reviewSteps.map((step, index) => (
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
                    STAGE PIPELINE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Pipeline
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Stage{" "}
                                    <span className="text-error">Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every application moves through a defined pipeline. Stages are
                                    sequential -- you cannot skip them. Each stage has a purpose, an
                                    owner, and actions that unlock when the application arrives.
                                </p>
                            </div>

                            <div className="stages-container space-y-4">
                                {stageDefinitions.map((stage) => (
                                    <div
                                        key={stage.number}
                                        className="stage-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
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

                            {/* Stage callout */}
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
                                            passing through Screen and Interview first. This ensures consistent
                                            evaluation and a complete audit trail. The only exception is
                                            Declined, which can be applied from any stage.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    NOTES & FEEDBACK
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Feedback
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Notes &{" "}
                                    <span className="text-warning">Feedback</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Notes are how your team communicates about candidates. They are
                                    permanent, attributed, and form the decision record for every
                                    application. Get the notes right and hiring decisions become
                                    transparent and defensible.
                                </p>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {notesBestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="detail-card border-4 border-warning/25 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-warning">
                                                <i className={`${item.icon} text-warning-content`}></i>
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
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    DOCUMENTS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Attachments
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Document{" "}
                                    <span className="text-secondary">Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Resumes, scorecards, reference checks, offer letters -- every file
                                    that matters to a hiring decision belongs on the application. Attached
                                    once, accessible forever.
                                </p>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-3 gap-6">
                                {documentGuidance.map((item, index) => (
                                    <div
                                        key={index}
                                        className="detail-card border-4 border-secondary/25 bg-base-100 p-6 opacity-0"
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
                    ROLE-BASED ACCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Access
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Role-Based{" "}
                                    <span className="text-error">Access</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    What you see and what you can do depends on your role. There is
                                    no configuration required -- permissions are automatic based on
                                    your relationship to the role and the application.
                                </p>
                            </div>

                            <div className="roles-container grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {roleAccessData.map((role, index) => {
                                    const a = ROLE_ACCENTS[role.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`role-card border-4 ${a.borderLight} bg-base-100 p-6 opacity-0`}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-12 h-12 flex items-center justify-center ${a.bg}`}>
                                                    <i className={`${role.icon} text-lg text-white`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {role.role}
                                                </h3>
                                            </div>

                                            <div className="mb-4">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${a.text} mb-1`}>
                                                    Sees
                                                </p>
                                                <p className="text-sm text-base-content/70">{role.sees}</p>
                                            </div>

                                            <div className="mb-4">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${a.text} mb-2`}>
                                                    Can Do
                                                </p>
                                                <ul className="space-y-1.5">
                                                    {role.canDo.map((action, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-base-content/70">
                                                            <i className={`fa-duotone fa-regular fa-check ${a.text} mt-0.5 text-xs`}></i>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className={`px-3 py-2 border-l-4 ${a.border} bg-base-200`}>
                                                <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-1">
                                                    Cannot Do
                                                </p>
                                                <p className="text-xs text-base-content/50">
                                                    {role.cannotDo}
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
                    COLLABORATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Teamwork
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Collaboration{" "}
                                    <span className="text-success">Patterns</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Hiring is a team sport. Applications are designed for multi-person
                                    review. Here is how to coordinate without stepping on each other.
                                </p>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {collaborationTips.map((item, index) => (
                                    <div
                                        key={index}
                                        className="detail-card flex items-start gap-4 p-5 border-4 border-success/20 bg-base-100 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                            <i className={`${item.icon} text-success-content`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide mb-1 text-base-content">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
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
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best{" "}
                                    <span className="text-warning">Practices</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between a fast pipeline and a slow one is not
                                    tools -- it is habits. These six practices separate teams that
                                    hire well from teams that struggle.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bestPractices.map((practice, index) => (
                                    <div
                                        key={index}
                                        className="practice-card flex items-start gap-4 p-5 border-2 border-base-content/10 bg-base-100 opacity-0"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning">
                                            <i className={`${practice.icon} text-warning-content`}></i>
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
                                    Something not working? Check here before filing a support request.
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
                <section className="apps-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-secondary" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-error" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-warning" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-secondary text-secondary-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    Related{" "}
                                    <span className="text-secondary">Guides</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Applications connect to everything. Here are the workflows and
                                    guides that pick up where this one leaves off.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-secondary bg-secondary text-secondary-content transition-transform hover:-translate-y-1"
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
            </ApplicationsAnimator>
        </>
    );
}
