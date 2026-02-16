import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { RecruiterAnimator } from "./recruiter-animator";

export const metadata = getDocMetadata("roles-and-permissions/recruiter");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewPoints = [
    {
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Candidate Sourcing Authority",
        description:
            "You create candidate profiles, upload resumes, and maintain sourcing notes. Every candidate you add becomes part of your searchable talent pool. Quality profiles lead to quality placements.",
    },
    {
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submission Control",
        description:
            "You decide which candidates get submitted to which roles. You write the submission pitch. You attach the materials. Once submitted, the application enters the hiring team's review queue and you track progress in real time.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Earnings Visibility",
        description:
            "You see your placement metrics, fee splits, and payout status. When a candidate you submitted gets hired, the system calculates your split automatically. No guessing. No delays. Transparent from submission to payment.",
    },
];

const sourcingSteps = [
    {
        number: "01",
        title: "Find The Candidate",
        description:
            "Source from LinkedIn, referrals, job boards, or your existing network. The platform does not care where you find them. What matters is that you capture complete, accurate profile information.",
        tip: "Track your sourcing channels in the candidate notes. This helps you analyze which sources produce the most placements.",
    },
    {
        number: "02",
        title: "Create The Profile",
        description:
            "Navigate to Candidates and click Add Candidate. Fill in name, email, phone, and attach their resume. Add skills, location preferences, and salary expectations. The more complete the profile, the better the AI matching suggestions.",
        tip: "Use the bulk import feature if you are onboarding 10+ candidates at once. Save the manual form for one-off additions.",
    },
    {
        number: "03",
        title: "Capture Sourcing Context",
        description:
            "Document where you found the candidate, when you connected, their job search status, and consent for submissions. This context protects you legally and helps other recruiters in your org avoid duplicate outreach.",
        tip: "Always record consent explicitly. A note like \"Agreed to submission for remote engineering roles, discussed via phone 2/15/26\" covers you if questions arise later.",
    },
    {
        number: "04",
        title: "Keep Profiles Updated",
        description:
            "When you learn new information about a candidate, update their profile immediately. New skills, changed salary expectations, or updated availability all affect matching accuracy. Stale profiles waste your time and the hiring team's time.",
        tip: "Set a quarterly reminder to review your top candidates and refresh their profiles. Job markets move fast.",
    },
];

const submissionWorkflow = [
    {
        number: "01",
        title: "Review The Role Requirements",
        description:
            "Open the role detail page. Read the job description, required skills, salary range, and location. Understand what the hiring team is optimizing for. A recruiter who submits candidates that do not match requirements loses credibility fast.",
        tip: "Check the role's submission guidelines if provided. Some hiring managers add specific instructions about what they want in the submission notes.",
    },
    {
        number: "02",
        title: "Search Your Talent Pool",
        description:
            "Use the Candidates page filters to narrow by skills, location, and availability. The AI matching engine suggests candidates based on role fit. Review suggestions but trust your judgment. You know the nuances better than the algorithm.",
        tip: "Sort candidates by last activity date to surface people you have recently spoken with. Engaged candidates convert faster than cold profiles.",
    },
    {
        number: "03",
        title: "Draft Submission Notes",
        description:
            "Write a clear, specific pitch explaining why this candidate fits. Highlight relevant experience, call out salary alignment, mention availability, and flag any concerns upfront. Submission notes are locked after you submit -- they become the official record.",
        tip: "Structure your notes: Summary (1-2 sentences), Relevant Experience (3-4 bullets), Logistics (salary, location, start date). Hiring managers skim. Make it easy.",
    },
    {
        number: "04",
        title: "Attach Final Materials",
        description:
            "Upload the candidate's current resume and any supporting documents like portfolios or reference letters. The hiring team reviews these first. Make sure everything is current, correctly named, and formatted as a PDF.",
        tip: "Double-check the resume for typos and formatting issues before attaching. A messy resume reflects poorly on you, not just the candidate.",
    },
    {
        number: "05",
        title: "Submit And Track",
        description:
            "Click Submit. The application enters the hiring team's queue. You receive notifications when the stage changes, when notes are added, and when a decision is made. Track all your submissions from the Applications page.",
        tip: "Follow up if you do not see activity within 48 hours. A quick message to the hiring manager shows you are engaged and helps keep the pipeline moving.",
    },
];

const trackingCapabilities = [
    {
        icon: "fa-duotone fa-regular fa-list-check",
        title: "Application Status Dashboard",
        color: "coral",
        description:
            "The Applications page shows every candidate you have submitted, their current stage, last activity, and which hiring manager owns the review. Filter by stage, role, or date range to focus your follow-ups.",
    },
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Real-Time Stage Notifications",
        color: "teal",
        description:
            "When a hiring manager advances, declines, or adds notes to one of your applications, you get notified immediately. No need to check manually. The system tells you when something changes.",
    },
    {
        icon: "fa-duotone fa-regular fa-message-lines",
        title: "Shared Notes Access",
        color: "yellow",
        description:
            "You can read notes that hiring managers mark as shared. This gives you feedback on what worked and what did not. Internal notes (strategy, compensation discussions) stay hidden from you, which is correct.",
    },
    {
        icon: "fa-duotone fa-regular fa-timeline",
        title: "Full Application Timeline",
        color: "purple",
        description:
            "Every application has a timeline showing all stage changes, who made them, and when. You see the full history from submission to hire or decline. This transparency builds trust and helps you calibrate future submissions.",
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    yellow: { bg: "bg-yellow", border: "border-yellow", text: "text-yellow" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
};

const documentManagement = [
    {
        icon: "fa-duotone fa-regular fa-file-arrow-up",
        title: "Upload At Submission",
        description:
            "Attach resumes, portfolios, and cover letters when you submit the candidate. These documents travel with the application through every stage. Hiring managers review them during screening and interviews.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-pdf",
        title: "Always Use PDF Format",
        description:
            "PDFs render consistently across all devices and browsers. DOCX files sometimes lose formatting. Convert to PDF before uploading. If you only have a DOCX, upload both versions and mark the PDF as primary.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-pen",
        title: "Name Files Descriptively",
        description:
            "Use clear filenames: \"Resume-JaneDoe-SeniorEngineer-Feb2026.pdf\" beats \"document.pdf\". When a hiring manager reviews 20 applications, good filenames save time and reduce confusion.",
    },
    {
        icon: "fa-duotone fa-regular fa-folder-open",
        title: "Track Document Versions",
        description:
            "If a candidate updates their resume after you submit them, upload the new version. The system keeps all versions and timestamps each. Hiring managers can compare versions if they need to verify changes.",
    },
];

const searchCapabilities = [
    {
        title: "Keyword Search",
        description: "Search by name, email, or skill tags. The search indexes all text fields including sourcing notes. Use quotes for exact matches: \"React Developer\" finds that phrase, React Developer finds either word.",
        icon: "fa-duotone fa-regular fa-magnifying-glass",
    },
    {
        title: "Skill-Based Filtering",
        description: "Filter candidates by skill tags. Select multiple skills to narrow results. The filter uses AND logic: selecting React + TypeScript shows only candidates tagged with both. Use this to find exact-match profiles for roles.",
        icon: "fa-duotone fa-regular fa-tags",
    },
    {
        title: "Location And Remote Preferences",
        description: "Filter by current location, preferred locations, or remote willingness. Location data is normalized so \"Austin, TX\" and \"Austin, Texas\" return the same results. Remote-willing candidates appear in all location searches.",
        icon: "fa-duotone fa-regular fa-location-dot",
    },
    {
        title: "Salary Range Matching",
        description: "Set a min and max salary to filter candidates whose expectations fall within that range. This prevents wasting time submitting candidates with misaligned compensation expectations.",
        icon: "fa-duotone fa-regular fa-money-check-dollar",
    },
    {
        title: "Availability Status",
        description: "Filter by immediate availability, 2-week notice, 30-day notice, or passive (not actively looking). Use this when a hiring manager needs someone to start quickly or when timing is flexible.",
        icon: "fa-duotone fa-regular fa-calendar-check",
    },
    {
        title: "AI Matching Suggestions",
        description: "When viewing a role, the system suggests candidates based on skill overlap, location fit, salary alignment, and profile completeness. Review suggestions but trust your judgment. The AI is a tool, not a decision-maker.",
        icon: "fa-duotone fa-regular fa-sparkles",
    },
];

const earningsTracking = [
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Real-Time Placement Metrics",
        color: "coral",
        description:
            "Your dashboard shows submissions this month, active applications by stage, placements this quarter, and total earnings year-to-date. Metrics update in real time as applications advance.",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        title: "Fee Split Transparency",
        color: "teal",
        description:
            "When a candidate you submitted gets hired, the system calculates your fee split automatically based on the role's fee structure and your agreement. You see the gross fee, your percentage, and your net payout.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-days",
        title: "Payout Schedule Visibility",
        color: "yellow",
        description:
            "Payouts are processed on a defined schedule (typically net-30 or net-60 depending on your contract). You see pending payouts, scheduled payment dates, and completed payments with transaction IDs.",
    },
    {
        icon: "fa-duotone fa-regular fa-receipt",
        title: "Placement History And Reporting",
        color: "purple",
        description:
            "Export your placement history as a CSV for tax reporting or personal tracking. The export includes candidate name, role, hire date, fee split, and payout date. All data matches the official financial records.",
    },
];

const accessScope = [
    {
        what: "Your Own Candidates",
        description: "You see candidates you created. You cannot see candidates added by other recruiters unless they share them with you explicitly.",
        access: "full",
    },
    {
        what: "Your Own Applications",
        description: "You see applications for candidates you submitted. You cannot see applications submitted by other recruiters.",
        access: "full",
    },
    {
        what: "Open Roles",
        description: "You see all published roles that are actively accepting submissions. You cannot see draft roles or closed roles unless you previously submitted to them.",
        access: "full",
    },
    {
        what: "Shared Notes On Applications",
        description: "You see notes that hiring managers mark as shared. You cannot see internal notes, which contain hiring strategy and compensation discussions.",
        access: "partial",
    },
    {
        what: "Your Earnings And Splits",
        description: "You see your own placement metrics and payout history. You cannot see other recruiters' earnings or the company's total fee revenue.",
        access: "full",
    },
    {
        what: "Company Settings And Team",
        description: "You cannot access company settings, billing, or team management. You see only your own profile and account details.",
        access: "none",
    },
];

const accessColors: Record<string, { bg: string; text: string; label: string }> = {
    full: { bg: "bg-teal", text: "text-teal", label: "Full Access" },
    partial: { bg: "bg-yellow", text: "text-yellow", label: "Partial Access" },
    none: { bg: "bg-coral", text: "text-coral", label: "No Access" },
};

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Quality Over Quantity",
        description:
            "One perfectly matched candidate beats ten mediocre submissions. Hiring managers remember recruiters who waste their time with bad fits. Build a reputation for precision. Your submission-to-hire ratio matters more than volume.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Communicate Proactively",
        description:
            "If a candidate's situation changes after submission (accepted another offer, changed salary expectations, extended notice period), tell the hiring manager immediately. Surprises damage trust. Transparency builds long-term relationships.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Keep Profiles Complete",
        description:
            "Incomplete candidate profiles signal laziness. If you do not have a resume, get one before adding the candidate. If you do not know their salary expectations, ask before creating the profile. Half-finished records waste everyone's time.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Document Consent Clearly",
        description:
            "Always note when and how a candidate agreed to be submitted. A simple line like \"Consented to submission for remote SWE roles, discussed via phone 2/15/26\" protects you legally and builds trust with hiring teams.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Follow Up On Stalled Applications",
        description:
            "If an application sits in Screen for more than a week without movement, reach out to the hiring manager. A quick message shows you are engaged and helps keep the pipeline moving. Silent pipelines lead to lost placements.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Treat Rejections As Learning",
        description:
            "When a hiring manager declines one of your submissions, read their reason carefully. Use that feedback to calibrate your next submission. Recruiters who learn from rejections see their conversion rates climb over time.",
    },
];

const troubleshootItems = [
    {
        symptom: "I cannot see a candidate I added yesterday",
        cause: "The candidate may have been archived, or you may be viewing a filtered list that excludes them.",
        fix: "Clear all filters on the Candidates page. Check the Archived filter toggle. If the candidate still does not appear, they may have been deleted by an admin. Ask your organization admin to verify.",
    },
    {
        symptom: "The Submit button is greyed out",
        cause: "The role is closed, paused, or you have already submitted this candidate to this role.",
        fix: "Check the role status on the role detail page. If the role is closed, you cannot submit. If you previously submitted this candidate, the system prevents duplicate submissions. Find a different role or candidate.",
    },
    {
        symptom: "My earnings dashboard shows zero placements but I know I had a hire",
        cause: "Placements are created when a hiring manager marks an application as Hired. If your application is still in the Offer stage, no placement exists yet.",
        fix: "Check the application status. If the stage is Hired, the placement should appear within a few minutes. If it does not, contact support with the application ID.",
    },
    {
        symptom: "I cannot edit a candidate profile after submission",
        cause: "Submission notes are locked after you submit to prevent retroactive changes. The candidate profile itself can still be edited.",
        fix: "Navigate to the candidate's profile page (not the application page). You can update their skills, resume, and sourcing notes. The submission notes on the application remain locked.",
    },
    {
        symptom: "AI matching suggestions are not relevant",
        cause: "The candidate profiles in your pool lack complete skill tags, location data, or salary expectations. The AI needs complete data to match accurately.",
        fix: "Review your candidate profiles and fill in missing fields. Add at least 5 skill tags per candidate, set location preferences, and record salary expectations. AI accuracy improves with data quality.",
    },
    {
        symptom: "Upload fails for a candidate resume",
        cause: "The file exceeds 10MB, uses an unsupported format, or the network connection dropped during upload.",
        fix: "Verify the file is PDF, DOCX, or DOC and under 10MB. If the PDF is large, compress images. Try uploading again on a stable connection. If the issue persists, convert the file to PDF and retry.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/add-or-import-candidates",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Add Or Import Candidates",
        description: "Learn how to create candidate profiles and import from CSV.",
        accent: "coral",
    },
    {
        href: "/public/documentation/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Step-by-step guide to submitting candidates to open roles.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/applications",
        icon: "fa-duotone fa-regular fa-list-check",
        title: "Applications Feature Guide",
        description: "Deep dive into tracking and managing your submitted applications.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RecruiterMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("roles-and-permissions/recruiter")} id="docs-roles-permissions-recruiter-jsonld" />
            <RecruiterAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="recruiter-hero relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 border-4 border-teal opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 bg-coral opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 border-4 border-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 bg-teal opacity-0" />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-coral" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-yellow" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-cream/50">
                                    <li>
                                        <Link href="/public/documentation-memphis" className="transition-colors hover:text-cream">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li>
                                        <Link href="/public/documentation-memphis/roles-and-permissions" className="transition-colors hover:text-cream">
                                            Roles And Permissions
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li className="text-cream">Recruiter</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar"></i>
                                    Role Documentation
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                                HERE IS HOW YOU{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">SOURCE AND SUBMIT</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-cream/70 max-w-2xl mb-6 opacity-0">
                                As a Recruiter, you control candidate sourcing, submissions, and placement tracking.
                                You build the talent pool. You write the pitch. You earn when candidates get hired.
                                Here is every capability, every limitation, and every best practice.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-cream/20 text-cream/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-coral"></i>
                                    Recruiter
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="overview-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="overview-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Core Capabilities
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    What You{" "}
                                    <span className="text-purple">Can Do</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    The Recruiter role gives you full control over candidate sourcing and submissions.
                                    Here are your three core capabilities.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {overviewPoints.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-dark/10 bg-cream p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-purple">
                                            <i className={`${item.icon} text-lg text-cream`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-dark">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CANDIDATE SOURCING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="sourcing-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="sourcing-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Candidate Sourcing
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Build Your{" "}
                                    <span className="text-coral">Talent Pool</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Every placement starts with a candidate profile. Here is how you source,
                                    create, and maintain profiles that lead to successful submissions.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {sourcingSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="sourcing-card flex gap-6 border-4 border-cream/10 bg-dark p-6 md:p-8 opacity-0"
                                    >
                                        {/* Step number */}
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-coral">
                                            <span className="text-2xl font-black text-dark">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-coral text-dark text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-cream">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-cream/70 mb-4">
                                                {step.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-teal/10 border-l-4 border-teal">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-teal mt-0.5"></i>
                                                <p className="text-sm text-cream/60">
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
                    SUBMISSION WORKFLOW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="submission-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="submission-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Submission Workflow
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    From Candidate To{" "}
                                    <span className="text-teal">Application</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    You have a candidate. You found a matching role. Here is the five-step
                                    process from search to submission.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {submissionWorkflow.map((step, index) => (
                                    <div
                                        key={index}
                                        className="submission-card flex gap-6 border-4 border-dark/10 bg-cream p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-teal">
                                            <span className="text-2xl font-black text-dark">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-teal text-dark text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-dark/70 mb-4">
                                                {step.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-teal/10 border-l-4 border-teal">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-teal mt-0.5"></i>
                                                <p className="text-sm text-dark/60">
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
                    APPLICATION TRACKING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="tracking-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="tracking-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Application Tracking
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Track Every{" "}
                                    <span className="text-yellow">Submission</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Once you submit a candidate, you track their progress in real time.
                                    Here is what visibility you have.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {trackingCapabilities.map((item, index) => {
                                    const c = colorMap[item.color];
                                    return (
                                        <div
                                            key={index}
                                            className={`tracking-card border-4 ${c.border}/20 bg-dark p-6 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${c.bg}`}>
                                                <i className={`${item.icon} text-lg text-dark`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide mb-2 text-cream">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-cream/70">
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
                    DOCUMENT MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="documents-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="documents-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Document Management
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Resumes And{" "}
                                    <span className="text-purple">Attachments</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Every submission includes documents. Here is how to manage them correctly.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {documentManagement.map((item, index) => (
                                    <div
                                        key={index}
                                        className="documents-card border-4 border-dark/10 bg-cream p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-purple">
                                            <i className={`${item.icon} text-xl text-purple`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-dark">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SEARCH AND FILTERING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="search-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="search-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Search And Filtering
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Find The{" "}
                                    <span className="text-coral">Right Candidate</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    You have a talent pool. Now you need to search it efficiently. Here are
                                    six ways to filter candidates and find matches.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {searchCapabilities.map((item, index) => (
                                    <div
                                        key={index}
                                        className="search-card border-4 border-cream/10 bg-dark p-6 opacity-0"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-coral">
                                                <i className={`${item.icon} text-lg text-dark`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-base uppercase tracking-wide mb-2 text-cream">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-cream/70">
                                                    {item.description}
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
                    EARNINGS TRACKING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="earnings-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="earnings-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Earnings Tracking
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Placement Metrics And{" "}
                                    <span className="text-teal">Payouts</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    When your submissions turn into hires, you earn. Here is how to track
                                    placements, splits, and payouts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {earningsTracking.map((item, index) => {
                                    const c = colorMap[item.color];
                                    return (
                                        <div
                                            key={index}
                                            className={`earnings-card border-4 ${c.border}/20 bg-cream p-6 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${c.bg}`}>
                                                <i className={`${item.icon} text-lg text-dark`}></i>
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
                    ACCESS SCOPE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="access-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="access-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Access Scope
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    What You Can And{" "}
                                    <span className="text-yellow">Cannot See</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    Recruiters have scoped access. You see your own work and the data you
                                    need to do your job. Here is the breakdown.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {accessScope.map((item, index) => {
                                    const a = accessColors[item.access];
                                    return (
                                        <div
                                            key={index}
                                            className={`access-card flex items-start gap-4 p-5 border-4 border-cream/10 bg-dark opacity-0`}
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${a.bg}`}>
                                                <i className={`fa-solid ${
                                                    item.access === 'full' ? 'fa-check' :
                                                    item.access === 'partial' ? 'fa-minus' :
                                                    'fa-xmark'
                                                } text-dark text-lg`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-cream">
                                                        {item.what}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${a.bg} text-dark`}>
                                                        {a.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-cream/60">
                                                    {item.description}
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
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="practices-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="practices-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Best Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    How To Be A{" "}
                                    <span className="text-purple">Great Recruiter</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    These six practices separate recruiters who get repeat business from
                                    recruiters who get ghosted. Follow them.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-purple/20 bg-cream p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-purple">
                                            <i className={`${item.icon} text-xl text-purple`}></i>
                                        </div>
                                        <h3 className="font-black text-base uppercase tracking-wide mb-2 text-dark">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-dark/70">
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
                <section className="trouble-section py-20 overflow-hidden bg-dark">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="trouble-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-dark">
                                    Troubleshooting
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-cream">
                                    Common{" "}
                                    <span className="text-coral">Recruiter Issues</span>
                                </h2>
                                <p className="mt-4 text-base text-cream/60 max-w-2xl mx-auto">
                                    If something is not working, check here first. These are the issues
                                    recruiters hit most often.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {troubleshootItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="trouble-card border-4 border-coral/15 bg-dark p-6 opacity-0"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-coral">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-dark"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-cream pt-1">
                                                {item.symptom}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-cream/60">
                                                <span className="font-bold text-cream/80 uppercase text-xs tracking-wider">Likely cause:</span>{" "}
                                                {item.cause}
                                            </p>
                                            <p className="text-sm text-cream/70">
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
                    NEXT STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="next-section py-20 overflow-hidden bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="next-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                    Next Steps
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Where To{" "}
                                    <span className="text-teal">Go From Here</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    You understand the Recruiter role. Now learn how to use the platform.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nextSteps.map((item, index) => {
                                    const a = accentMap[item.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`next-card group relative border-4 ${a.border} bg-cream transition-transform hover:-translate-y-1 opacity-0`}
                                        >
                                            <div className={`h-2 ${a.bg}`} />
                                            <div className="p-6">
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${a.bg}`}>
                                                    <i className={`${item.icon} text-lg text-dark`}></i>
                                                </div>
                                                <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-dark">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-relaxed text-dark/70">
                                                    {item.description}
                                                </p>
                                                <div className="mt-6 pt-4 border-t-4 border-dark/10 flex items-center justify-between">
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
            </RecruiterAnimator>
        </>
    );
}
