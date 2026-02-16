import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { MarkHireAnimator } from "./mark-hire-animator";

export const metadata = getDocMetadata("core-workflows/mark-a-hire-and-track-placements");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Offer Accepted",
        description:
            "The candidate must have accepted the offer. The application should be at the Offer stage with confirmed acceptance from the candidate. You cannot mark a hire until both sides agree.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Salary & Terms Confirmed",
        description:
            "Final compensation details -- base salary, signing bonus, start date -- must be confirmed by the company. These numbers feed directly into fee calculations and recruiter earnings. Get them right the first time.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Permissions",
        description:
            "Only Company Admins and Hiring Managers can mark a hire. Recruiters can view placement details after the hire is recorded but cannot initiate the action themselves.",
    },
];

const hireSteps = [
    {
        number: "01",
        title: "Open The Application",
        description:
            "Navigate to the application detail view for the candidate who has accepted the offer. The application should be at the Offer stage. Verify the candidate name, role title, and submitting recruiter are correct -- these details carry forward into the placement record and cannot be changed after the fact.",
        tip: "Double-check the application before proceeding. The placement record inherits data from the application. Fixing mistakes after the hire is marked requires admin intervention.",
    },
    {
        number: "02",
        title: "Click Mark As Hired",
        description:
            "Open the Stage Actions dropdown and select Mark as Hired. This action is only available when the application is at the Offer stage. If you do not see it, confirm the application has been advanced through all prior stages -- Screen, Interview, and Offer -- in order. The system enforces the pipeline sequence.",
        tip: "If the button is greyed out, hover over it for a tooltip explaining what is missing. Common blockers: missing interview feedback, unsigned offer letter, or incomplete candidate profile.",
    },
    {
        number: "03",
        title: "Confirm Placement Details",
        description:
            "A confirmation dialog appears with pre-filled data from the offer stage. Review and confirm: base salary, start date, fee percentage, and any notes. The fee percentage is pulled from the job listing configuration but can be overridden here if the terms were renegotiated. The system calculates the placement fee and recruiter earnings in real-time as you adjust values.",
        tip: "If the fee percentage was negotiated differently than the job listing default, update it here. This is the last chance to set it correctly before the placement is created.",
    },
    {
        number: "04",
        title: "Review The Fee Breakdown",
        description:
            "Before confirming, the dialog shows a fee breakdown: total placement fee, platform share, recruiter earnings, and any split arrangements if multiple recruiters are involved. Read every line. This breakdown is what gets invoiced and what gets paid out. Once you confirm, these numbers are locked into the placement record.",
        tip: "If the fee breakdown looks wrong, cancel and check the job listing fee configuration first. Adjusting fees after a placement is created requires a billing admin override.",
    },
    {
        number: "05",
        title: "Confirm And Create Placement",
        description:
            "Click Confirm Hire. The system creates the placement record, updates the application status to Hired, notifies all parties -- the submitting recruiter, hiring team, and candidate -- and triggers fee calculations in the billing system. The placement appears immediately in the Placements section of the dashboard.",
        tip: "Watch for the success notification. If you do not see it, check the Placements list to verify the record was created. Network issues can occasionally delay the confirmation toast.",
    },
];

const feeBreakdown = [
    {
        icon: "fa-duotone fa-regular fa-sack-dollar",
        title: "Placement Fee",
        description:
            "The total fee charged to the hiring company. Calculated as the fee percentage multiplied by the candidate's base salary. For example, a 20% fee on a $120,000 salary yields a $24,000 placement fee. This is the gross revenue from the placement.",
        example: "20% of $120,000 = $24,000",
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Platform Share",
        description:
            "The portion retained by the Splits Network platform. This covers marketplace operations, payment processing, compliance, and support. The platform share percentage is defined in your organization's billing plan and is applied automatically.",
        example: "Platform 15% of $24,000 = $3,600",
    },
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        title: "Recruiter Earnings",
        description:
            "The net amount paid to the submitting recruiter after the platform share is deducted. If the placement involves a split fee arrangement -- where multiple recruiters contributed -- the recruiter earnings are divided according to the agreed split ratio.",
        example: "Recruiter gets $24,000 - $3,600 = $20,400",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-split-up-and-left",
        title: "Split Fee Arrangements",
        description:
            "When two recruiters collaborate on a placement -- one sourcing the candidate, the other managing the client relationship -- the recruiter earnings are divided by the split ratio defined on the assignment. A 60/40 split on $20,400 means $12,240 and $8,160 respectively.",
        example: "60/40 split: $12,240 / $8,160",
    },
];

const placementDetails = [
    {
        icon: "fa-duotone fa-regular fa-user",
        title: "Candidate Information",
        description:
            "The hired candidate's name, contact details, and professional profile. This data is pulled from the candidate record and is read-only on the placement. If the candidate's details need updating, update the candidate profile -- changes will reflect on the placement automatically.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Role & Company",
        description:
            "The job title, hiring company, department, and location. These come from the original job listing. The placement preserves a snapshot of the role at the time of hire so that historical records remain accurate even if the job listing is later modified.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Compensation",
        description:
            "Base salary, signing bonus (if any), and total compensation package. These figures drive all fee calculations. The compensation is recorded in the currency specified on the job listing. Currency conversion, if applicable, is handled at invoice time.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Start Date & Onboarding",
        description:
            "The candidate's confirmed start date. The system uses this date to begin tracking the guarantee period. If the candidate's start date changes, update it on the placement record -- the guarantee countdown will adjust automatically.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        title: "Fee Configuration",
        description:
            "The fee percentage, calculated placement fee, platform share, and recruiter earnings. These values are locked when the placement is created. Any adjustments after creation require a billing admin override and are logged in the audit trail.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock-rotate-left",
        title: "Audit Trail",
        description:
            "A timestamped log of every action taken on the placement: creation, status changes, fee adjustments, payout events, and notes. The audit trail is immutable and provides a complete compliance record for the placement lifecycle.",
    },
];

const placementStatuses = [
    {
        number: "01",
        name: "Active",
        description: "The placement is confirmed and the candidate is either approaching their start date or has started working. The guarantee period clock is ticking. Fees have been calculated and invoicing may be in progress.",
        who: "Created automatically when the hire is confirmed",
        color: "success",
    },
    {
        number: "02",
        name: "In Guarantee",
        description: "The candidate has started and is within the guarantee window -- typically 30, 60, or 90 days depending on the agreement. If the candidate leaves or is terminated during this period, the placement fee may be partially or fully refunded.",
        who: "System transitions based on start date and guarantee terms",
        color: "warning",
    },
    {
        number: "03",
        name: "Completed",
        description: "The guarantee period has passed without incident. The placement is finalized, all fees are confirmed, and payouts are processed or scheduled. This is the terminal success state. No further action is required.",
        who: "System transitions when guarantee period expires cleanly",
        color: "success",
    },
    {
        number: "04",
        name: "Guarantee Triggered",
        description: "The candidate left or was terminated during the guarantee period. The fee arrangement is under review. Depending on the guarantee terms, this may result in a partial refund, a replacement candidate obligation, or a reduced fee.",
        who: "Admin initiates when a guarantee claim is made",
        color: "error",
    },
    {
        number: "05",
        name: "Cancelled",
        description: "The placement was cancelled before the candidate started -- for example, if the offer was rescinded or the candidate withdrew after being marked as hired. No fees are charged. The placement record is preserved for historical reference.",
        who: "Admin or Hiring Manager cancels with documented reason",
        color: "error",
    },
];

const bestPractices = [
    {
        title: "Confirm Before You Click",
        description: "Verify salary, start date, and fee percentage with the hiring manager before marking the hire. The placement record is created immediately and changing locked fields requires admin intervention. A two-minute check saves a two-day correction process.",
        icon: "fa-duotone fa-regular fa-clipboard-check",
    },
    {
        title: "Record Accurate Compensation",
        description: "The placement fee is calculated from the salary you enter. If you enter the wrong number, the invoice goes out wrong, the recruiter gets paid wrong, and someone has an uncomfortable conversation. Enter the exact offer letter amount.",
        icon: "fa-duotone fa-regular fa-calculator",
    },
    {
        title: "Set The Start Date Immediately",
        description: "The guarantee period begins from the start date. If you leave it blank or incorrect, guarantee tracking does not work properly. Even if the start date might change, enter the best-known date and update it later if needed.",
        icon: "fa-duotone fa-regular fa-calendar-pen",
    },
    {
        title: "Review Split Arrangements First",
        description: "If the placement involves a fee split between recruiters, verify the split ratio on the assignment before marking the hire. The split ratio is applied automatically during placement creation. Changing it afterward is possible but requires both parties to agree.",
        icon: "fa-duotone fa-regular fa-handshake-angle",
    },
    {
        title: "Monitor Guarantee Periods",
        description: "Set a calendar reminder for the guarantee expiration date. If a candidate leaves during the guarantee window and you do not flag it, the system will automatically mark the placement as Completed when the period ends. Proactive monitoring protects your organization.",
        icon: "fa-duotone fa-regular fa-bell",
    },
    {
        title: "Use Placements For Reporting",
        description: "The Placements page is your source of truth for hiring metrics: time-to-fill, fee revenue, recruiter performance, and guarantee outcomes. Use filters and exports to generate the reports your leadership team needs. Do not rebuild this data in spreadsheets.",
        icon: "fa-duotone fa-regular fa-chart-mixed",
    },
];

const troubleshootItems = [
    {
        symptom: "The Mark as Hired button is not visible",
        cause: "The application is not at the Offer stage, or your role does not have permission to mark hires.",
        fix: "Verify the application has been advanced through all stages to Offer. If it is at Offer and you still cannot see the button, ask an admin to check your role permissions. Only Company Admins and Hiring Managers can mark hires.",
    },
    {
        symptom: "The fee breakdown shows unexpected numbers",
        cause: "The fee percentage on the job listing was changed, or the salary entered in the confirmation dialog does not match the offer.",
        fix: "Cancel the confirmation dialog and check the job listing fee configuration. Compare the salary in the dialog against the actual offer letter. If the job listing fee was recently changed, the new percentage applies. Contact a billing admin if the numbers still look wrong.",
    },
    {
        symptom: "The placement was created but the recruiter was not notified",
        cause: "The recruiter's notification preferences may be set to suppress placement notifications, or there was a delivery delay.",
        fix: "Check the placement record to confirm it was created successfully. If it exists, the notification was queued. Delivery delays of up to a few minutes are normal. If the recruiter still has not received it after 15 minutes, ask them to check their notification settings and spam folder.",
    },
    {
        symptom: "I need to change the salary or fee after the placement was created",
        cause: "Placement fee fields are locked after creation to prevent unauthorized changes.",
        fix: "Contact a billing admin. They can create a fee adjustment on the placement record. All adjustments are logged in the audit trail with the reason for the change and who authorized it.",
    },
    {
        symptom: "The guarantee period does not match what was agreed",
        cause: "The guarantee period is inherited from the job listing configuration at the time the placement is created.",
        fix: "If the guarantee terms were negotiated differently than the job listing default, a billing admin can adjust the guarantee period on the placement record. This must be done before the guarantee window closes.",
    },
    {
        symptom: "A candidate left during the guarantee period but the status has not changed",
        cause: "Guarantee status changes are not automatic -- someone must report the departure.",
        fix: "Navigate to the placement record and report the guarantee event. Include the departure date and reason. The system will recalculate fee obligations based on the guarantee terms. Notify the recruiter and billing team.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Learn how to review candidates and move them through stages.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/create-and-publish-a-role",
        icon: "fa-duotone fa-regular fa-megaphone",
        title: "Create A Role",
        description: "Step-by-step guide for creating job listings and publishing to the network.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows/invite-recruiters-or-teammates",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Invite Recruiters",
        description: "Bring recruiters and teammates into your organization.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MarkHireAndTrackPlacementsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/mark-a-hire-and-track-placements")} id="docs-mark-hire-jsonld" />
            <MarkHireAnimator>
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
                        {/* Trophy SVG */}
                        <svg className="memphis-shape absolute top-[14%] left-[44%] opacity-0" width="36" height="38" viewBox="0 0 36 38">
                            <path d="M8 4h20v14c0 6-4 10-10 10s-10-4-10-10V4z" fill="none" className="stroke-success" strokeWidth="3" />
                            <rect x="14" y="28" width="8" height="4" className="fill-success" />
                            <rect x="10" y="32" width="16" height="3" rx="1" className="fill-success" />
                            <path d="M8 8H3c0 6 3 8 5 9" fill="none" className="stroke-warning" strokeWidth="2" />
                            <path d="M28 8h5c0 6-3 8-5 9" fill="none" className="stroke-warning" strokeWidth="2" />
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
                                    <span className="text-success">Mark A Hire</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-trophy"></i>
                                    Workflow 06
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Mark A Hire{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">& Track Placements</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                HERE IS HOW YOU CLOSE THE DEAL. Marking a hire transforms an
                                application into a placement record -- the financial backbone
                                of every split-fee arrangement. This guide covers the entire
                                lifecycle: confirming the hire, locking in fees, tracking
                                guarantee periods, and everything that happens between the
                                handshake and the final payout.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Company Admin
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-clipboard-check text-success"></i>
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
                    STEP-BY-STEP: MARKING THE HIRE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Marking The{" "}
                                    <span className="text-success">Hire</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Five steps from offer acceptance to placement record. Each
                                    step matters -- the data you enter here drives invoicing,
                                    payouts, and guarantee tracking for the entire placement lifecycle.
                                </p>
                            </div>

                            <div className="steps-container space-y-6">
                                {hireSteps.map((step, index) => (
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
                    FEE CALCULATION & EARNINGS BREAKDOWN
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    The Money
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Fee Calculation &{" "}
                                    <span className="text-error">Earnings</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    This is where it gets real. Every placement generates a fee,
                                    and that fee flows through a calculation chain: gross fee,
                                    platform share, recruiter earnings, and split arrangements.
                                    Understand how the math works so you are never surprised
                                    by a payout.
                                </p>
                            </div>

                            <div className="fee-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {feeBreakdown.map((item, index) => (
                                    <div
                                        key={index}
                                        className="fee-card border-4 border-error/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 flex items-center justify-center bg-error">
                                                <i className={`${item.icon} text-lg text-error-content`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-base-content/70 mb-4">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-error/10 border-l-4 border-error">
                                            <i className="fa-duotone fa-regular fa-calculator text-error text-xs"></i>
                                            <p className="text-sm font-bold text-base-content/70">
                                                {item.example}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Fee flow callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-arrow-progress text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            The Fee Flow
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Salary enters the system. The fee percentage converts it into
                                            a placement fee. The platform takes its share. What remains goes
                                            to the recruiter -- or gets split between recruiters if the
                                            arrangement is a split fee. Every number in this chain is
                                            recorded on the placement record and visible in reporting.
                                            Nothing is hidden. Nothing is estimated. Every cent is accounted for.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PLACEMENT DETAILS & METADATA
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Anatomy
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Inside A{" "}
                                    <span className="text-secondary">Placement</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A placement record is not just a confirmation that someone got
                                    hired. It is a financial instrument, an audit record, and a
                                    relationship snapshot all in one. Here is what it contains.
                                </p>
                            </div>

                            <div className="details-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {placementDetails.map((panel, index) => (
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
                    PLACEMENT STATUS LIFECYCLE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Lifecycle
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Placement{" "}
                                    <span className="text-warning">Statuses</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A placement moves through statuses from creation to completion.
                                    Each status reflects where the placement stands in its financial
                                    and operational lifecycle. Understanding these statuses helps
                                    you manage guarantees and anticipate payouts.
                                </p>
                            </div>

                            <div className="status-container space-y-4">
                                {placementStatuses.map((status) => (
                                    <div
                                        key={status.number}
                                        className="status-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
                                        {/* Status number */}
                                        <div className={`hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-${status.color}`}>
                                            <span className={`text-2xl font-black text-${status.color}-content`}>
                                                {status.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`md:hidden inline-flex items-center justify-center w-8 h-8 bg-${status.color} text-${status.color}-content text-sm font-black`}>
                                                    {status.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                    {status.name}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-base-content/70 mb-3">
                                                {status.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-base-200 border-l-4 border-base-content/20">
                                                <i className="fa-duotone fa-regular fa-rotate text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {status.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Guarantee callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Guarantee Periods Are Serious
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            If a candidate departs during the guarantee window, the
                                            financial consequences are significant: partial or full fee
                                            refunds, replacement obligations, or renegotiated terms.
                                            Monitor your active placements. Do not wait for the system
                                            to tell you something went wrong -- by that point, the
                                            guarantee window may have closed and your options are limited.
                                        </p>
                                    </div>
                                </div>
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
                                    Placements are where the money lives. Get these habits right
                                    and you will avoid fee disputes, delayed payouts, and
                                    guarantee headaches.
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
                    REPORTING & ANALYTICS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Analytics
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Reporting &{" "}
                                    <span className="text-secondary">Metrics</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Placements feed your analytics. Every hire, fee, and guarantee
                                    outcome is captured and available for reporting. Here is what
                                    you can measure and where to find it.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Key metrics */}
                                <div className="border-4 border-secondary/20 bg-base-100 p-6 md:p-8">
                                    <h3 className="font-black text-lg uppercase tracking-wide text-base-content mb-6">
                                        Key Placement Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-timer text-secondary mt-1 text-sm"></i>
                                            <div>
                                                <span className="font-bold text-sm text-base-content">Time-to-Fill</span>
                                                <p className="text-sm text-base-content/60">Days from role publication to hire confirmation. Tracks hiring velocity by role, department, and recruiter.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-sack-dollar text-secondary mt-1 text-sm"></i>
                                            <div>
                                                <span className="font-bold text-sm text-base-content">Total Fee Revenue</span>
                                                <p className="text-sm text-base-content/60">Aggregate placement fees over a period. Filter by recruiter, company, role type, or date range.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-percent text-secondary mt-1 text-sm"></i>
                                            <div>
                                                <span className="font-bold text-sm text-base-content">Guarantee Success Rate</span>
                                                <p className="text-sm text-base-content/60">Percentage of placements that complete the guarantee period without incident. A low rate signals quality or fit issues.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-ranking-star text-secondary mt-1 text-sm"></i>
                                            <div>
                                                <span className="font-bold text-sm text-base-content">Recruiter Performance</span>
                                                <p className="text-sm text-base-content/60">Placements per recruiter, average fee, and guarantee outcomes. Identifies your most productive and reliable partners.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Where to find reports */}
                                <div className="border-4 border-secondary/20 bg-base-100 p-6 md:p-8">
                                    <h3 className="font-black text-lg uppercase tracking-wide text-base-content mb-4">
                                        Where To Find Reports
                                    </h3>
                                    <ul className="space-y-3 text-base text-base-content/70 leading-relaxed">
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-table-columns text-secondary mt-1 text-sm"></i>
                                            <span><strong>Dashboard</strong> -- The main dashboard shows placement count, total revenue, and guarantee status at a glance. Widgets update in real-time as placements are created and statuses change.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-list-check text-secondary mt-1 text-sm"></i>
                                            <span><strong>Placements Page</strong> -- The full list of placements with filters for status, date range, recruiter, and company. Use the export button to download CSV data for offline analysis or executive reporting.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-chart-pie text-secondary mt-1 text-sm"></i>
                                            <span><strong>Analytics Section</strong> -- Deep-dive charts and trend analysis. Compare periods, drill down into recruiter performance, and visualize fee revenue over time. All data comes from placement records.</span>
                                        </li>
                                    </ul>
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
                                    Something off with your placement? Check here before
                                    escalating. Most issues have a straightforward fix.
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
                <section className="mark-hire-cta relative py-20 overflow-hidden bg-base-100">
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
                                    The hire is marked. The placement is live. Here are the
                                    workflows that connect to this one -- review applications,
                                    create new roles, and grow your recruiter network.
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
            </MarkHireAnimator>
        </>
    );
}
