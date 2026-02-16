import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { PlacementsAnimator } from "./placements-animator";

export const metadata = getDocMetadata("feature-guides/placements");

// --- Data ---------------------------------------------------------------

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-trophy",
        title: "The Finish Line",
        description:
            "A placement is the moment the deal closes. Candidate accepted the offer, start date is confirmed, and the placement record locks in every financial detail -- fee percentage, total fee amount, recruiter share, company share, and guarantee period. This is where sourcing, submissions, interviews, and negotiations become revenue. Every placement traces back through the entire pipeline, giving you a complete audit trail from first contact to signed offer.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Financial Source Of Truth",
        description:
            "Placement records are the single source of truth for all fee calculations on the platform. The salary, fee percentage, and split ratio are captured at the moment of placement creation and do not change unless explicitly amended. This means your earnings reports, payout calculations, and commission tracking all derive from placement data. If the placement record is wrong, everything downstream is wrong.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Architecture",
        description:
            "Splits Network exists because recruiting is a team sport. Placement records capture exactly how the fee divides between the recruiting side and the hiring side. The split ratio is defined on the role before any candidate is submitted, and it carries through to the placement. Both parties see their share, the math is transparent, and disputes are rare when the numbers are locked in from the start.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Guarantee Period Tracking",
        description:
            "Most placements include a guarantee period -- typically 30, 60, or 90 days -- during which the placement fee is contingent on the candidate remaining in the role. The platform tracks guarantee expiration dates automatically. If a candidate leaves during the guarantee period, the placement status updates and triggers the appropriate financial adjustments. No manual calendar reminders needed.",
    },
];

const creationSteps = [
    {
        number: "01",
        title: "Candidate Reaches Hired Stage",
        description:
            "A placement begins when an application moves to the Hired stage in the pipeline. This is not something you create from scratch -- it is generated from a successful hiring outcome. The hiring company or a platform admin marks the application as hired, which triggers the placement creation flow.",
        detail:
            "The application must have a valid candidate, a valid role, and a confirmed offer before it can move to Hired. If any of these are missing, the system blocks the stage transition and tells you what is needed. This prevents incomplete placements from entering the financial pipeline.",
        tip: "Do not rush to mark a candidate as hired before the offer is formally accepted. A premature placement record creates confusion and may need to be voided if the candidate declines.",
    },
    {
        number: "02",
        title: "Confirm Salary And Start Date",
        description:
            "When the Hired stage is triggered, you confirm the final negotiated salary and the candidate's start date. These two fields drive every financial calculation that follows. The salary determines the total fee. The start date determines when the guarantee period begins and when the fee becomes payable.",
        detail:
            "The system pre-fills the salary from the role's budget range if available, but you must confirm or override it with the actual offer amount. Some placements have signing bonuses or variable compensation -- only the base salary is used for fee calculations unless the role explicitly includes total compensation in the fee basis.",
        tip: "Double-check the salary figure before confirming. Once the placement is created, changing the salary requires an amendment that both parties must approve. Getting it right the first time saves everyone time and awkward conversations.",
    },
    {
        number: "03",
        title: "Review Fee Percentage And Split",
        description:
            "The fee percentage and split ratio are inherited from the role record. Before the placement is finalized, you see a summary showing the total fee amount (salary times fee percentage), the recruiter share, and the company share. This is your last chance to verify the numbers before they become the financial record of truth.",
        detail:
            "Fee percentages typically range from 15% to 25% of the candidate's first-year salary. The split ratio defines how that fee divides between the sourcing recruiter and the hiring company's side. A 50/50 split on a 20% fee for a $150,000 salary means $15,000 to each party. These numbers are displayed clearly on the confirmation screen.",
        tip: "If the fee percentage or split ratio looks wrong, do not confirm the placement. Go back to the role record and correct it there. Placement amendments are possible but create unnecessary overhead.",
    },
    {
        number: "04",
        title: "Set Guarantee Period",
        description:
            "Select the guarantee period that applies to this placement. The system defaults to the guarantee period defined on the role, but you can adjust it during placement creation if the offer terms include a different guarantee. Common options are 30, 60, and 90 days. The guarantee countdown starts on the candidate's start date, not the placement creation date.",
        detail:
            "The guarantee period protects the hiring company. If the candidate leaves or is terminated during the guarantee window, the placement fee may be partially or fully refundable depending on the terms. The platform tracks this automatically and updates the placement status when the guarantee expires successfully or when an early departure is reported.",
        tip: "Always confirm the guarantee terms with the hiring company before finalizing. Mismatched expectations about guarantee periods are one of the most common sources of placement disputes.",
    },
    {
        number: "05",
        title: "Finalize And Create The Placement",
        description:
            "Click Confirm to create the placement record. The system generates the placement with all financial details locked in, sends notifications to both the recruiter and the hiring company, and starts the guarantee period countdown. The placement immediately appears in both parties' Placements pages and in all relevant reports.",
        detail:
            "After creation, the placement enters Active status. Both parties receive an email confirmation with a summary of the placement details including candidate name, role title, salary, fee breakdown, and guarantee dates. The placement also appears in the dashboard metrics and updates lifetime earnings totals in real time.",
        tip: "Bookmark the placement detail page after creation. You will reference it during invoicing, payout tracking, and guarantee period monitoring. Having it one click away saves time.",
    },
];

const feeTrackingItems = [
    {
        icon: "fa-duotone fa-regular fa-percent",
        title: "Fee Percentage",
        description:
            "The fee percentage is set on the role before candidates are submitted. It represents the total recruiting fee as a percentage of the candidate's first-year base salary. Standard percentages range from 15% to 25% depending on the role level, industry, and market conditions. This percentage is locked into the placement record at creation and drives all downstream calculations.",
    },
    {
        icon: "fa-duotone fa-regular fa-calculator",
        title: "Total Fee Calculation",
        description:
            "Total fee equals base salary multiplied by fee percentage. A $150,000 salary at 20% produces a $30,000 total fee. This is the gross amount before the split. The platform calculates this automatically and displays it on the placement detail page, in reports, and in payout summaries. There is no manual math required -- and no room for calculation errors.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-split-up-and-left",
        title: "Split Ratio",
        description:
            "The split ratio defines how the total fee divides between the recruiting side and the hiring company's side. Common ratios are 50/50, 60/40, and 70/30. The ratio is defined on the role and carries through to the placement. Both parties see the same numbers. Transparency in the split eliminates most fee disputes before they start.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
        title: "Invoice Generation",
        description:
            "Once a placement is created, the platform can generate invoice data based on the fee breakdown. The hiring company sees the total fee they owe. The recruiter sees the share they will receive. Invoice timing depends on the billing terms -- some organizations invoice at placement creation, others invoice after the guarantee period expires.",
    },
];

const earningsBreakdown = [
    {
        number: "01",
        name: "Gross Placement Fee",
        description:
            "The total fee amount before any splits or deductions. This is the headline number -- salary times fee percentage. For a $160,000 placement at 20%, the gross fee is $32,000. This is what the hiring company pays in total for the successful hire. It appears on the placement record, in aggregate reports, and in marketplace analytics.",
        who: "Visible to all parties",
        color: "warning",
    },
    {
        number: "02",
        name: "Recruiter Share",
        description:
            "The portion of the gross fee that goes to the sourcing recruiter. If the split is 50/50 on a $32,000 fee, the recruiter share is $16,000. This is the number that matters most to recruiters -- it represents their actual earnings from the placement. Recruiter share is tracked individually and rolls up into lifetime earnings, monthly earnings, and per-role earnings reports.",
        who: "Visible to recruiter and platform admins",
        color: "success",
    },
    {
        number: "03",
        name: "Company Share",
        description:
            "The portion of the gross fee retained by the hiring company's side or the platform. On a 50/50 split, this equals the recruiter share. On a 60/40 split favoring the recruiter, the company share is smaller. This amount covers the hiring company's internal recruitment costs, platform fees, or whatever the billing arrangement specifies.",
        who: "Visible to company admins and platform admins",
        color: "info",
    },
    {
        number: "04",
        name: "Platform Fee (If Applicable)",
        description:
            "Some billing configurations include a platform fee that is deducted before or after the split. This covers marketplace infrastructure, payment processing, and support. Platform fees are configured at the organization level and are visible in the placement detail breakdown. Not all organizations use platform fees -- it depends on the billing plan.",
        who: "Visible to platform admins",
        color: "secondary",
    },
];

const placementStatuses = [
    {
        icon: "fa-duotone fa-regular fa-circle-play",
        title: "Active",
        description: "The placement is live. The candidate has started or is approaching their start date. The guarantee period is counting down. Fees are pending or in process. This is the default status for a newly created placement and the one you want to see for as long as possible.",
        priority: "active",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-check",
        title: "Guaranteed",
        description: "The guarantee period has expired and the candidate is still in the role. The placement is now fully earned. Fees that were held pending guarantee completion are released for payout. This is the goal state -- a guaranteed placement means the deal is done and the money is locked in.",
        priority: "guaranteed",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Pending Start",
        description: "The placement is created but the candidate has not yet started. The start date is in the future. Guarantee period has not begun. This status is common for placements with a two-week or one-month notice period gap between offer acceptance and first day.",
        priority: "pending",
    },
    {
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
        title: "At Risk",
        description: "Something has flagged this placement for attention. The candidate may have reported dissatisfaction, the hiring company may have raised concerns, or there are signs the placement might not survive the guarantee period. At Risk is an early warning status that triggers manual review.",
        priority: "risk",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        title: "Fallen Off",
        description: "The candidate left the role during the guarantee period. This triggers the guarantee clause -- fees may be partially or fully refundable depending on the terms. Fallen Off placements require resolution: replacement search, fee adjustment, or dispute resolution. This is the status nobody wants to see.",
        priority: "fallen",
    },
    {
        icon: "fa-duotone fa-regular fa-ban",
        title: "Voided",
        description: "The placement was created in error or the offer was rescinded before the candidate started. Voided placements are excluded from all financial calculations and reports. They remain in the system for audit trail purposes but carry zero financial weight. Only platform admins can void a placement.",
        priority: "voided",
    },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-success", text: "text-success", label: "Active" },
    guaranteed: { bg: "bg-info", text: "text-info", label: "Complete" },
    pending: { bg: "bg-warning", text: "text-warning", label: "Waiting" },
    risk: { bg: "bg-error", text: "text-error", label: "Attention" },
    fallen: { bg: "bg-error", text: "text-error", label: "Failed" },
    voided: { bg: "bg-base-content/30", text: "text-base-content/50", label: "Removed" },
};

const verificationItems = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        title: "Cross-Reference Offer Details",
        description:
            "Before finalizing a placement, verify that the salary on the placement matches the actual offer letter. Compare the fee percentage against the original role terms. Check that the split ratio has not been altered since the role was published. These three numbers -- salary, fee percentage, split ratio -- determine every financial outcome. One wrong digit cascades through the entire pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-check",
        title: "Confirm Candidate Start",
        description:
            "A placement is not truly active until the candidate shows up on day one. Follow up with the hiring company on or immediately after the start date to confirm the candidate has begun work. Update the placement from Pending Start to Active once confirmed. This prevents ghost placements where a candidate accepted but never actually started.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Monitor Guarantee Milestones",
        description:
            "Check in at the 30-day, 60-day, and 90-day marks depending on the guarantee period. A brief check-in with both the candidate and the hiring company surfaces problems early. If a candidate is struggling or unhappy, you have a window to intervene before the placement falls off. Proactive monitoring protects your earnings.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-signature",
        title: "Document Everything",
        description:
            "Keep records of offer acceptance confirmations, start date confirmations, check-in notes, and any communications about the placement. If a dispute arises months later, your documentation is the evidence. The platform stores placement activity logs automatically, but personal notes about conversations and context add the detail that logs miss.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Set Up Notifications",
        description:
            "Enable placement notifications so you receive alerts for guarantee period milestones, status changes, and any flags raised by the hiring company. The platform sends automated notifications for major events, but you can configure additional reminders for personal follow-ups. Passive monitoring catches issues that active checking misses.",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Reconcile Against Invoices",
        description:
            "When invoices are generated, compare them against the placement record. The invoice amount should exactly match the placement fee breakdown. If there is a discrepancy, investigate before the invoice is sent. Catching errors at the reconciliation stage is far easier than unwinding them after payment has been processed.",
    },
];

const reportingItems = [
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Lifetime Earnings Dashboard",
        description:
            "Your Placements page includes a lifetime earnings summary at the top. This shows total placements, total gross fees, total recruiter earnings, and average fee per placement. These metrics update in real time as new placements are created and existing placements move through their lifecycle. Use this to track your performance trajectory over months and years.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-bar",
        title: "Monthly And Quarterly Breakdowns",
        description:
            "Filter placements by date range to see monthly or quarterly performance. How many placements did you close last month? What was your average fee? Which roles produced the highest fees? These breakdowns help you understand your revenue patterns, identify seasonal trends, and forecast future earnings with actual data instead of guesswork.",
    },
    {
        icon: "fa-duotone fa-regular fa-ranking-star",
        title: "Role And Client Analysis",
        description:
            "Group placements by role type or hiring company to see which clients and job categories generate the most revenue. If 60% of your earnings come from senior engineering roles at three companies, that tells you where to focus your sourcing effort. Data-driven prioritization outperforms gut feel every time.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Guarantee Success Rate",
        description:
            "Track what percentage of your placements survive the guarantee period. A high guarantee success rate is a quality signal -- it means your candidates are well-matched and well-prepared. A low rate suggests issues with candidate qualification, expectation setting, or role fit analysis. This metric is visible to hiring companies and affects your marketplace reputation.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Export And External Reporting",
        description:
            "Export placement data as CSV for use in external accounting systems, tax preparation, or business analysis tools. Exports include all financial fields, dates, statuses, and party information. For organizations with complex reporting needs, the export function provides the raw data to build any custom report or analysis.",
    },
    {
        icon: "fa-duotone fa-regular fa-gauge-high",
        title: "Pipeline Velocity Metrics",
        description:
            "Measure how long it takes from candidate submission to placement creation. This pipeline velocity metric reveals bottlenecks in the hiring process. If your average time-to-placement is increasing, something in the middle of the funnel is slowing down. Use this data to have informed conversations with hiring companies about process efficiency.",
    },
];

const disputeSteps = [
    {
        number: "01",
        title: "Identify The Discrepancy",
        description:
            "Disputes start when the numbers do not match expectations. The fee amount seems wrong, the split ratio does not match the original agreement, the guarantee period was supposed to be different, or a party believes the placement should be voided. The first step is always to identify exactly what is disputed -- not in general terms, but with specific numbers and specific references to the original role terms.",
        detail:
            "Open the placement detail page and compare every field against the role record and the offer letter. Most disputes resolve at this stage because the data is right and one party misremembered the terms. When the data is wrong, you have a specific error to correct.",
    },
    {
        number: "02",
        title: "Gather Supporting Documentation",
        description:
            "Pull together the offer letter, the role record showing original fee terms, any email confirmations about the split, and the placement activity log. The platform records every change to a placement with timestamps and user attribution. This audit trail is your evidence base. The party with better documentation wins disputes faster.",
        detail:
            "If verbal agreements were made that differ from what is recorded in the system, note them but understand that the system record is the default source of truth. This is why documenting everything at the time of agreement is critical -- not after a dispute arises.",
    },
    {
        number: "03",
        title: "Raise The Dispute",
        description:
            "Contact the other party directly or use the platform's dispute mechanism to formally flag the issue. A dispute puts the placement into a review state where financial processing is paused until resolution. Both parties receive notification and can submit their position with supporting documents.",
        detail:
            "Be specific in your dispute filing. 'The fee seems wrong' is not actionable. 'The placement shows a 50/50 split but the role record specifies 60/40 in our favor, confirmed by email on January 15th' is actionable. Specificity accelerates resolution.",
    },
    {
        number: "04",
        title: "Resolution And Amendment",
        description:
            "Disputes resolve through agreement between the parties or through platform admin intervention. If both parties agree on the correction, an amendment is created that updates the placement record with the corrected values. Both parties sign off on the amendment. If agreement cannot be reached, platform admins review the evidence and make a determination based on the documented terms.",
        detail:
            "Amendments create a new version of the placement record while preserving the original for audit purposes. The financial pipeline recalculates based on the amended values. All reports and payouts update to reflect the correction. The goal is always accuracy -- getting the placement record to match reality.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Verify Before You Confirm",
        description:
            "The five minutes you spend verifying salary, fee percentage, and split ratio before confirming a placement saves hours of amendment and dispute resolution later. Triple-check the numbers. Compare against the role record. Compare against the offer letter. Only click Confirm when every number is right.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-clock",
        title: "Track Guarantee Periods Actively",
        description:
            "Do not rely solely on automated notifications. Set personal reminders for guarantee milestones. Check in with the candidate and the hiring company at regular intervals. A placement that falls off in the last week of a guarantee period because nobody was paying attention is a failure of process, not circumstance.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Communicate Fee Terms Early",
        description:
            "Fee percentage, split ratio, and guarantee terms should be crystal clear before any candidate is submitted. If a recruiter and hiring company disagree about the split after a placement is made, both parties wasted time. Lock in financial terms during role creation, not during placement creation.",
    },
    {
        icon: "fa-duotone fa-regular fa-note-sticky",
        title: "Document Every Conversation",
        description:
            "When you discuss placement terms, salary adjustments, start date changes, or guarantee modifications on a call, follow up with a written summary. The platform records system actions automatically, but verbal agreements need manual documentation to be enforceable.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Review Your Metrics Monthly",
        description:
            "Placements are how you earn on the platform. Reviewing your placement metrics monthly -- total placements, average fee, guarantee success rate, time-to-placement -- gives you the data to optimize your approach. If your numbers are trending down, you can course-correct before it affects your pipeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Treat Amendments As Exceptions",
        description:
            "Amendments exist for genuine errors and changed circumstances. If you find yourself amending placements regularly, something upstream is broken -- unclear role terms, rushed placement creation, or miscommunication about offer details. Fix the root cause. Amendments should be rare.",
    },
];

const complianceItems = [
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Audit Trail",
        description:
            "Every action on a placement is logged with timestamps and user attribution: creation, status changes, amendments, dispute filings, and resolutions. This audit trail is immutable and available to platform admins. For organizations in regulated industries, this logging satisfies compliance requirements for financial record-keeping and transaction transparency.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        title: "Fee Agreement Documentation",
        description:
            "The role record that defines fee terms serves as the documented agreement between recruiter and hiring company. When a placement is created, the fee terms are inherited from this role record, creating a clear chain of documentation from agreement to financial outcome. Keep role records accurate and complete -- they are your contracts.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "Financial Data Access Controls",
        description:
            "Not everyone sees the same placement financial data. Recruiters see their placements and earnings. Company admins see placements for their organization. Platform admins see everything. Sensitive fields like exact fee amounts and split ratios are restricted based on role. This prevents inappropriate data exposure while maintaining transparency for authorized parties.",
    },
    {
        icon: "fa-duotone fa-regular fa-database",
        title: "Data Retention",
        description:
            "Placement records are retained indefinitely for financial and compliance purposes. Even voided placements remain in the system with their complete history. This retention policy ensures that historical financial data is always available for audits, tax purposes, and dispute resolution regardless of how much time has passed.",
    },
    {
        icon: "fa-duotone fa-regular fa-print",
        title: "Printable Placement Summaries",
        description:
            "Each placement detail page includes a print-friendly view that generates a clean summary with all relevant financial details, party information, dates, and status history. Use this for physical records, client communications, or attachment to external invoicing systems. The printed summary includes a unique placement ID for cross-referencing.",
    },
    {
        icon: "fa-duotone fa-regular fa-gavel",
        title: "Dispute Resolution Records",
        description:
            "When disputes are filed and resolved, the entire process is documented: original filing, evidence submitted by each party, communications, and final resolution with the amended terms. This dispute record is permanently linked to the placement and provides a complete narrative of how and why the placement terms were modified.",
    },
];

const troubleshootItems = [
    {
        symptom: "Fee amount on the placement does not match what I expected",
        cause: "The salary or fee percentage on the role record was different from what you assumed, or the salary was updated after the initial agreement.",
        fix: "Open the placement detail page and compare the salary and fee percentage against the role record. If the role record is wrong, raise a dispute with the specific discrepancy. If the role record is correct but your expectation was different, review the original agreement communications.",
    },
    {
        symptom: "I cannot create a placement for a hired candidate",
        cause: "The application is missing required fields (salary, start date), or you do not have placement-creation permissions for this role.",
        fix: "Check that the application has a confirmed salary and start date. Verify your role permissions under Company Settings. If the fields are complete and you have the right permissions, contact your Company Admin to investigate.",
    },
    {
        symptom: "Placement status is stuck on Pending Start",
        cause: "Nobody has confirmed that the candidate actually started work on the scheduled date.",
        fix: "Contact the hiring company to confirm the candidate started. Update the placement status to Active once confirmed. If the candidate did not start, update accordingly -- the placement may need to be voided.",
    },
    {
        symptom: "Guarantee period dates look wrong",
        cause: "The guarantee countdown starts from the candidate's start date, not the placement creation date. If the start date was entered incorrectly, the guarantee dates will be wrong.",
        fix: "Check the start date on the placement. If it is incorrect, submit an amendment to correct it. The guarantee dates will recalculate automatically once the start date is updated.",
    },
    {
        symptom: "My earnings are not showing in reports",
        cause: "The placement may be in a status that excludes it from earnings calculations (Voided, or still in dispute), or the date range filter on the report does not include the placement date.",
        fix: "Check the placement status. Voided and disputed placements are excluded from earnings totals. Adjust the date range filter on your reports. If the placement is Active or Guaranteed and still missing, contact support.",
    },
    {
        symptom: "The split ratio on my placement is wrong",
        cause: "The split was inherited from the role record, which may have been set incorrectly, or it was changed after you agreed to the original terms.",
        fix: "Compare the placement split against the role record. If the role record shows the correct split and the placement does not match, contact support. If the role record itself is wrong, raise a dispute with documentation of the original agreed terms.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/mark-a-hire-and-track-placements",
        icon: "fa-duotone fa-regular fa-flag-checkered",
        title: "Mark A Hire And Track Placements",
        description: "Step-by-step workflow for moving a candidate to hired and creating the placement record.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/feature-guides/roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Roles Feature Guide",
        description: "Understand the role records where fee terms, split ratios, and guarantee periods originate.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/applications",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Applications Feature Guide",
        description: "The pipeline that connects candidate submissions to placement outcomes.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// --- Page ---------------------------------------------------------------

export default function PlacementsFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/placements")} id="docs-feature-guides-placements-jsonld" />
            <PlacementsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-success opacity-0" />
                        {/* Trophy silhouette */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="32" height="32" viewBox="0 0 32 32">
                            <path d="M8,4 L24,4 L22,16 Q16,22 10,16 Z" fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                            <line x1="16" y1="20" x2="16" y2="26" className="stroke-success" strokeWidth="3" />
                            <line x1="10" y1="26" x2="22" y2="26" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-success" />
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
                                    <span className="text-success">Placements</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-trophy"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Track The{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">Win</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                HERE IS HOW YOU TRACK THE WIN. A placement is the finish line
                                of every recruiting engagement. Candidate accepted, start date
                                confirmed, fees locked in. This guide covers everything about
                                placements: creating them, tracking fees, understanding your
                                earnings breakdown, monitoring guarantee periods, resolving
                                disputes, and building a data-driven view of your placement
                                performance. If you recruit on Splits Network, this is where
                                the money lives.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-success"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-success"></i>
                                    Platform Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PLACEMENTS OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Placements{" "}
                                    <span className="text-success">Are For</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A placement is not just a status change. It is the financial
                                    event that converts your recruiting work into revenue. Every
                                    number on your earnings report traces back to a placement
                                    record.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-success/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-success">
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
                    CREATING PLACEMENT RECORDS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Create A{" "}
                                    <span className="text-warning">Placement Record</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Five steps from hired candidate to a complete, financially
                                    locked placement record. Get the numbers right the first
                                    time and everything downstream works automatically.
                                </p>
                            </div>

                            <div className="creation-container space-y-6">
                                {creationSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="creation-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-warning">
                                            <span className="text-2xl font-black text-warning-content">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-warning text-warning-content text-sm font-black">
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
                                            <div className="flex items-start gap-2 px-4 py-3 bg-warning/10 border-l-4 border-warning">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-warning mt-0.5"></i>
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
                    FEE TRACKING AND CALCULATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Fees
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Fee Tracking{" "}
                                    <span className="text-error">And Calculation</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every dollar on the platform traces back to fee calculations
                                    defined on roles and locked into placements. Here is how
                                    the math works and where to verify it.
                                </p>
                            </div>

                            <div className="fee-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {feeTrackingItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="fee-card border-4 border-error/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-error">
                                            <i className={`${item.icon} text-lg text-error-content`}></i>
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

                            {/* Fee calculation example callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-calculator text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Example Calculation
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Candidate salary: $150,000. Fee percentage: 20%.
                                            Total fee: $30,000. Split ratio: 60/40 (recruiter
                                            favored). Recruiter share: $18,000. Company share:
                                            $12,000. These numbers are calculated automatically
                                            and displayed on the placement detail page before
                                            you confirm.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    RECRUITER EARNINGS BREAKDOWN
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Earnings
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Recruiter Earnings{" "}
                                    <span className="text-success">Breakdown</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every placement generates a layered earnings breakdown.
                                    Here is what each layer means and who can see it.
                                </p>
                            </div>

                            <div className="earnings-container space-y-4">
                                {earningsBreakdown.map((item) => (
                                    <div
                                        key={item.number}
                                        className={`earnings-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0`}
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
                                                <i className="fa-duotone fa-regular fa-eye text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {item.who}
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
                    PLACEMENT STATUS AND ONBOARDING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Status
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Start Dates And{" "}
                                    <span className="text-warning">Onboarding Status</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Placements move through a lifecycle from creation to
                                    guarantee completion. Each status tells you exactly
                                    where the placement stands financially and operationally.
                                </p>
                            </div>

                            <div className="status-container space-y-4">
                                {placementStatuses.map((item, index) => {
                                    const s = statusColors[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="status-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${s.bg}`}>
                                                <i className={`${item.icon} text-lg text-white`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                        {item.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${s.bg} text-white`}>
                                                        {s.label}
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

                            {/* Guarantee callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-shield-check text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Guarantee Period Is Your Safety Net
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            The guarantee period protects both parties. Hiring
                                            companies get assurance that the candidate will stick.
                                            Recruiters get a clear timeline for when their earnings
                                            are fully locked in. Once the guarantee expires with
                                            the candidate still in the role, the placement moves
                                            to Guaranteed and the fee is final. Monitor it
                                            actively -- do not let a placement fall off because
                                            you were not paying attention.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PLACEMENT VERIFICATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Verification
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Placement{" "}
                                    <span className="text-secondary">Verification</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Trust but verify. These practices ensure every placement
                                    record is accurate, every fee is correct, and every
                                    guarantee period is properly monitored.
                                </p>
                            </div>

                            <div className="verify-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {verificationItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="verify-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                    REPORTING AND ANALYTICS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Analytics
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Reporting And{" "}
                                    <span className="text-success">Analytics</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Placements are not just financial records. They are data
                                    points that tell you where your business is strong, where
                                    it is weak, and where to focus next.
                                </p>
                            </div>

                            <div className="reporting-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reportingItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="reporting-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-success">
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
                    DISPUTES AND ADJUSTMENTS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Disputes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Disputes And{" "}
                                    <span className="text-error">Adjustments</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    When the numbers do not match, here is how you fix them.
                                    Disputes are rare when terms are clear upfront, but the
                                    process exists for when they are needed.
                                </p>
                            </div>

                            <div className="dispute-container space-y-6">
                                {disputeSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="dispute-card flex gap-6 border-4 border-error/20 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
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
                                            <p className="text-sm leading-relaxed text-base-content/50">
                                                {step.detail}
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
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Best Practices For{" "}
                                    <span className="text-warning">Tracking Placements</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between recruiters who earn consistently
                                    and those who lose money to disputes and fallen placements
                                    comes down to these six habits.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-warning">
                                            <i className={`${item.icon} text-xl text-warning`}></i>
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
                    COMPLIANCE AND DOCUMENTATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Compliance
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Compliance And{" "}
                                    <span className="text-secondary">Documentation</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Placement records are financial documents. The platform
                                    provides audit trails, access controls, and retention
                                    policies that keep your organization compliant.
                                </p>
                            </div>

                            <div className="compliance-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {complianceItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="compliance-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                                    Hit a wall with placements? Check here first.
                                    These are the issues we see most often.
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
                <section className="placements-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-success" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-warning" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
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
                                    Your placement is tracked. Here are the workflows
                                    that connect to placement management.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-success bg-success text-success-content transition-transform hover:-translate-y-1"
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
            </PlacementsAnimator>
        </>
    );
}
