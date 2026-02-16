import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { SubmitCandidateAnimator } from "./submit-candidate-animator";

export const metadata = getDocMetadata("core-workflows/submit-a-candidate");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-user-check",
        title: "Candidate Profile Complete",
        description:
            "The candidate must already exist in your Candidates list with at least a name, email, and resume attached. Incomplete profiles cannot be submitted. If you have not added the candidate yet, do that first.",
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Active Role Available",
        description:
            "The role you want to submit the candidate to must be published and accepting applications. Draft roles, paused roles, and filled roles will not appear in the submission flow. Check with the hiring company if a role seems missing.",
    },
    {
        icon: "fa-duotone fa-regular fa-network-wired",
        title: "Assignment To The Role",
        description:
            "You must be assigned to the role, either directly or through a network invitation. Recruiters cannot submit candidates to roles they are not connected to. If you are not assigned, request access from the company that owns the role.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Submission Notes Prepared",
        description:
            "Have your pitch ready: why this candidate is a fit, relevant experience highlights, salary alignment, and availability. Strong submission notes are the single biggest factor in whether a candidate gets reviewed quickly or sits in the queue.",
    },
];

const submissionSteps = [
    {
        number: "01",
        title: "Navigate To The Role",
        description:
            "Open the Roles page from the sidebar and find the role you want to submit a candidate to. You can search by title, company name, or filter by location and compensation range. Click the role to open its detail view.",
        detail:
            "The role detail view shows the full job description, requirements, compensation range, and the list of candidates already submitted. Review this information before submitting -- it helps you tailor your submission notes and avoid submitting candidates who clearly do not match.",
        tip: "Check the 'Already Submitted' count. If the role has many submissions already, your candidate needs to stand out. Invest extra time in your notes.",
    },
    {
        number: "02",
        title: "Click Submit Candidate",
        description:
            "Select the Submit Candidate button on the role detail page. This opens the submission form where you select a candidate and provide your supporting information. The button is only visible if you are assigned to the role.",
        detail:
            "If the Submit Candidate button is missing, you are either not assigned to this role or the role is no longer accepting submissions. Check your assignment status under My Roles or contact the company admin to request assignment.",
        tip: "You can also start a submission from the candidate's profile page. Navigate to the candidate, click Submit To Role, and select the target role. Both paths lead to the same form.",
    },
    {
        number: "03",
        title: "Select The Candidate",
        description:
            "Choose the candidate from your candidate list. The dropdown shows candidates you have added, with their name, email, and profile completion indicator. You can search by name or email to find the right person quickly.",
        detail:
            "Only candidates with complete required fields (name, email, resume) appear in the selection list. If a candidate is missing, go back to their profile and fill in the required fields. The system also warns you if the candidate has already been submitted to this role by you or another recruiter.",
        tip: "If you see a duplicate warning, stop. Submitting the same candidate twice wastes the hiring team's time and reflects poorly on your professionalism. Check the existing submission first.",
    },
    {
        number: "04",
        title: "Write Submission Notes",
        description:
            "This is the most important step. Write a clear, specific explanation of why this candidate is a strong fit for this role. Cover relevant experience, skills that match the requirements, cultural fit indicators, and anything the hiring manager should know upfront.",
        detail:
            "Submission notes are the recruiter's pitch. Hiring managers read these before they look at the resume. A strong note says: 'Jane has 8 years of React experience, led a team of 12 at her last company, and is targeting $150-170K base. She is actively interviewing and available to start in 2 weeks.' A weak note says: 'Good candidate, check her resume.' One gets reviewed in hours. The other sits for days.",
        tip: "Write submission notes in the third person. Address the hiring manager directly. Think of it as a brief cover letter you are writing on behalf of the candidate.",
    },
    {
        number: "05",
        title: "Add Salary Expectations",
        description:
            "Enter the candidate's salary expectations as a range (minimum and maximum). This field is required if the role has compensation requirements set. Even when optional, including salary expectations helps the hiring team evaluate fit quickly.",
        detail:
            "Be honest about salary expectations. Submitting a candidate at $120K when they actually want $160K wastes everyone's time. If the candidate's range does not overlap with the role's budget, have a conversation with the candidate first. If they are flexible, note that explicitly.",
        tip: "If the candidate is open to negotiation, write it in the notes: 'Candidate is targeting $150-170K but flexible for the right opportunity.' This gives the hiring team room to work.",
    },
    {
        number: "06",
        title: "Complete Pre-Screen Questions",
        description:
            "Some roles have pre-screen questions configured by the hiring company. These are required fields that must be answered before submission. Questions typically cover work authorization, willingness to relocate, specific certifications, or experience with required technologies.",
        detail:
            "Pre-screen questions are pass/fail gates. If the candidate does not meet the criteria, do not submit them. An honest 'No' on a pre-screen question is better than a submission that gets immediately declined. It damages your credibility when candidates fail pre-screen requirements that were clearly stated.",
        tip: "Review pre-screen questions before you talk to the candidate. Collect the answers during your initial phone screen so you have them ready when you submit.",
    },
    {
        number: "07",
        title: "Review And Submit",
        description:
            "Review everything one final time: candidate selection, submission notes, salary expectations, and pre-screen answers. The submission preview shows exactly what the hiring team will see. Once you are satisfied, click Submit.",
        detail:
            "Submission is immediate and irreversible. Once submitted, the application is created and the hiring team is notified. You cannot edit submission notes after the fact. If you made a mistake, you will need to contact the hiring team directly. Take the extra thirty seconds to proofread.",
        tip: "Read your submission notes out loud. If they sound generic or uninspired when spoken, rewrite them. The hiring manager will read dozens of submissions. Make yours the one that stands out.",
    },
];

const requiredInfo = [
    { field: "Candidate Selection", description: "The candidate to submit. Must have a complete profile with name, email, and resume.", required: true },
    { field: "Submission Notes", description: "Your pitch explaining why this candidate is a strong fit for this specific role.", required: true },
    { field: "Salary Expectations", description: "The candidate's expected compensation range. Required when the role has a compensation gate.", required: true },
    { field: "Pre-Screen Answers", description: "Answers to any pre-screen questions configured by the hiring company.", required: true },
    { field: "Availability", description: "When the candidate could start. Helps with pipeline planning.", required: false },
    { field: "Referral Source", description: "How you sourced the candidate. Useful for company analytics and recruiter attribution.", required: false },
    { field: "Additional Documents", description: "Cover letters, portfolios, certifications, or other supporting files beyond the resume.", required: false },
    { field: "Preferred Interview Times", description: "Windows when the candidate is available for interviews. Speeds up scheduling.", required: false },
];

const statusTimeline = [
    {
        number: "01",
        name: "Submitted",
        description: "Your submission has been received. The application is now visible to the hiring team. You will see this status immediately after clicking Submit. No action is needed from you at this point.",
        who: "Recruiter submits, Hiring Manager receives notification",
        color: "info",
    },
    {
        number: "02",
        name: "Under Screen",
        description: "The hiring team is actively reviewing the candidate's profile, your submission notes, and the attached resume. This is the first evaluation gate. Average time in this stage varies by company, but healthy pipelines move through in 24-48 hours.",
        who: "Hiring Manager or Company Admin reviews",
        color: "warning",
    },
    {
        number: "03",
        name: "Interview",
        description: "The candidate has passed screening and is being scheduled for interviews. You may be asked to coordinate scheduling. Keep the candidate informed and responsive.",
        who: "Hiring Manager coordinates, Recruiter facilitates",
        color: "secondary",
    },
    {
        number: "04",
        name: "Offer",
        description: "An offer is being prepared or has been extended. Compensation, start date, and terms are finalized. You may play a role in negotiations between the candidate and the company.",
        who: "Company extends, Recruiter may facilitate negotiations",
        color: "success",
    },
    {
        number: "05",
        name: "Hired",
        description: "The candidate accepted the offer. A placement record is created automatically. Commission and fee tracking begins. Congratulations -- this is what it is all about.",
        who: "System creates placement, all parties notified",
        color: "success",
    },
    {
        number: "06",
        name: "Declined",
        description: "The candidate did not advance. A rejection reason is recorded and visible to you. Review the feedback to understand what the hiring team was looking for. Use it to improve future submissions.",
        who: "Hiring team decides, Recruiter receives feedback",
        color: "error",
    },
];

const roleGuidance = [
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        title: "For Recruiters",
        items: [
            "You own the submission process. Your notes, your pitch, your reputation.",
            "Read the full role description before submitting. Match against requirements, not just job title.",
            "One strong submission beats five mediocre ones. Quality over volume, always.",
            "Follow up on submissions that sit in Screen for more than 48 hours. A polite check-in shows engagement.",
            "Track your submission-to-interview ratio. If it is below 30%, your targeting needs work.",
            "Ask the hiring company what they value most. Some care about culture fit. Others want pure technical skill. Tailor your notes.",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-building-shield",
        title: "For Company Reviewers",
        items: [
            "Review submissions within 48 hours. Slow reviews push good candidates to other opportunities.",
            "When declining, provide specific feedback. 'Not a fit' tells the recruiter nothing. 'Needs 5+ years React and candidate has 2' helps them submit better candidates next time.",
            "If a candidate is close but not quite right, say so. 'Strong profile but we need someone with AWS certification' is actionable.",
            "Use pre-screen questions to filter early. If work authorization is non-negotiable, make it a required pre-screen question so unqualified candidates never reach your queue.",
            "Communicate role changes promptly. If requirements shift, salary changes, or the role is paused, update the listing immediately so recruiters stop wasting effort.",
        ],
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Match Before You Submit",
        description:
            "Read the full role description. Compare it against the candidate's profile. If you cannot articulate three specific ways the candidate matches the requirements, do not submit. A targeted submission is worth ten generic ones.",
    },
    {
        icon: "fa-duotone fa-regular fa-pen-fancy",
        title: "Write Notes That Sell",
        description:
            "Submission notes are your sales pitch. Lead with the strongest qualification. Mention specific numbers: years of experience, team size managed, revenue generated. End with availability and salary alignment. Make the hiring manager want to read the resume.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Submit Early, Not Late",
        description:
            "Roles receive the most attention in their first week. Submit your best candidates within the first few days of a role going live. Late submissions compete against candidates who are already in the interview stage.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Prep The Candidate First",
        description:
            "Never submit a candidate who does not know they are being submitted. Confirm their interest in the specific role, verify their salary expectations, and ensure their resume is current. Surprised candidates make bad impressions in interviews.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-check",
        title: "Verify Everything Before Submitting",
        description:
            "Check the candidate's email, phone, and resume one more time. Is the resume current? Is the email correct? Are the salary expectations accurate? Errors in submissions cannot be corrected after the fact. Thirty seconds of verification saves hours of damage control.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line",
        title: "Track And Learn",
        description:
            "Monitor what happens to your submissions. Which ones advance to interviews? Which get declined? What feedback do you receive? Use this data to calibrate your targeting. The best recruiters have high submission-to-interview ratios because they learn from every outcome.",
    },
];

const rejectionReasons = [
    {
        reason: "Does Not Meet Minimum Requirements",
        description: "The candidate lacks a fundamental qualification stated in the role description -- years of experience, required certification, specific technology expertise, or education level.",
        prevention: "Compare the candidate's profile against every requirement before submitting. If there is a gap, address it in your notes: 'Candidate has 3 years Python instead of the requested 5, but has compensating experience in X.' Acknowledge gaps instead of ignoring them.",
    },
    {
        reason: "Salary Mismatch",
        description: "The candidate's compensation expectations exceed the role's budget with no room for negotiation. The hiring team cannot make the numbers work.",
        prevention: "Verify the role's compensation range and compare it against the candidate's expectations before submitting. If there is a gap, discuss flexibility with the candidate first. Only submit if the ranges overlap or the candidate has confirmed willingness to negotiate.",
    },
    {
        reason: "Duplicate Submission",
        description: "The candidate has already been submitted to this role by another recruiter. The hiring team will not review duplicate submissions.",
        prevention: "The system warns you about duplicates during submission. Pay attention to these warnings. If you see the candidate was already submitted, do not proceed. Contact the hiring company if you believe your submission has unique context.",
    },
    {
        reason: "Incomplete Submission",
        description: "The submission was missing critical information: no notes, no salary expectations on a role that requires them, or unanswered pre-screen questions.",
        prevention: "Fill in every field. Write substantive notes. Answer all pre-screen questions. Treat optional fields as required. Complete submissions get reviewed faster and more favorably.",
    },
    {
        reason: "Poor Role Fit",
        description: "The candidate has the right skills on paper but the wrong context: wrong industry experience, wrong seniority level, or wrong cultural indicators for the company.",
        prevention: "Understand what the company actually wants beyond the job description. A company hiring for a startup environment needs a different profile than a Fortune 500. Talk to the hiring manager if the role description is ambiguous. Context matters as much as skills.",
    },
    {
        reason: "Candidate Not Responsive",
        description: "The hiring team tried to contact the candidate for screening or interviews but received no response after multiple attempts.",
        prevention: "Confirm the candidate's interest and availability before submitting. Tell them to expect outreach from the hiring company. Give them the company name and approximate timeline so they know what to look for in their inbox.",
    },
];

const troubleshootItems = [
    {
        symptom: "The Submit Candidate button is disabled or missing",
        cause: "You are not assigned to this role, the role is no longer accepting submissions, or required pre-screen fields are incomplete.",
        fix: "Check your assignment status under My Roles. If you are assigned but the button is still missing, the role may be paused or filled. Contact the company admin to verify the role's status.",
    },
    {
        symptom: "The candidate does not appear in the selection dropdown",
        cause: "The candidate's profile is incomplete. Required fields (name, email, resume) must be filled before the candidate is eligible for submission.",
        fix: "Open the candidate's profile and check for missing required fields. Complete them, save the profile, then return to the submission form. The candidate should now appear.",
    },
    {
        symptom: "I see a duplicate submission warning",
        cause: "Another recruiter has already submitted this candidate to the same role, or you have already submitted them yourself.",
        fix: "Do not submit again. The duplicate warning protects everyone. If you have unique context that the other submission does not cover, reach out to the hiring team directly through Messages.",
    },
    {
        symptom: "The application is not visible after I submitted",
        cause: "Filters on the Applications page are hiding the record, or you are looking at the wrong role's application list.",
        fix: "Clear all filters on the Applications page. Sort by date descending. Your submission should appear at the top. If it is still missing, check the submission confirmation notification in your activity feed.",
    },
    {
        symptom: "I submitted but the status has not changed for days",
        cause: "The hiring team has not reviewed the submission yet. High-volume roles can have long review queues.",
        fix: "Wait 48 hours, then send a follow-up message through the platform's Messages feature. Ask politely if there is any update or if additional information would help. Do not spam -- one follow-up is professional, three is not.",
    },
    {
        symptom: "Pre-screen questions were not shown during submission",
        cause: "The role does not have pre-screen questions configured, or the questions were added after you started the submission form.",
        fix: "If questions exist but were not shown, close the form and reopen it. The form loads questions when it opens. If questions were added after your submission, the hiring team may reach out for answers separately.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Understand what happens after your submission. How hiring teams review and advance candidates.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/add-or-import-candidates",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Add Candidates",
        description: "Need to build your talent pool first? Start here to add candidates manually or import from CSV.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows/mark-a-hire-and-track-placements",
        icon: "fa-duotone fa-regular fa-trophy",
        title: "Mark A Hire",
        description: "When your candidate gets the offer. Learn how placements are finalized and commissions tracked.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SubmitCandidateMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/submit-a-candidate")} id="docs-core-workflows-submit-a-candidate-jsonld" />
            <SubmitCandidateAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[6%] w-14 h-14 rounded-full border-[5px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[40%] right-[9%] w-12 h-12 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[20%] w-8 h-8 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[30%] w-12 h-12 rotate-12 bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[26%] right-[40%] w-16 h-5 -rotate-6 border-[4px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[35%] w-6 h-6 rotate-45 bg-warning opacity-0" />
                        {/* Paper plane SVG */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="36" height="30" viewBox="0 0 36 30">
                            <polygon points="2,15 34,2 22,15 34,28" fill="none" className="stroke-success" strokeWidth="3" strokeLinejoin="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[52%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="70" height="18" viewBox="0 0 70 18">
                            <polyline points="0,14 9,4 18,14 27,4 36,14 45,4 54,14 63,4 70,14"
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
                                    <span className="text-success">Submit A Candidate</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                    Workflow Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Submit{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">Winning Candidates</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                HERE IS HOW YOU SUBMIT WINNING CANDIDATES. A submission is not a resume
                                drop. It is a targeted pitch to a hiring team. The quality of your
                                submission notes, the accuracy of your salary data, and the
                                completeness of your pre-screen answers determine whether your candidate
                                gets reviewed in hours or ignored for days. This guide covers the entire
                                process, from selecting the right role to tracking the outcome.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-success"></i>
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
                                    <span className="text-warning">Need Ready</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Gather these four things before you open the submission form.
                                    Missing any of them means you will hit a wall mid-submission.
                                </p>
                            </div>

                            <div className="prereq-container grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    STEP-BY-STEP SUBMISSION PROCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The Submission{" "}
                                    <span className="text-success">Process</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Seven steps from role selection to confirmed submission. Each
                                    step matters. Rushing through any of them reduces your chances
                                    of getting the candidate reviewed quickly.
                                </p>
                            </div>

                            <div className="steps-container space-y-6">
                                {submissionSteps.map((step, index) => (
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
                    REQUIRED vs OPTIONAL INFORMATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Submission Data
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Required vs{" "}
                                    <span className="text-secondary">Optional</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every piece of information you include in a submission. Required
                                    fields block submission if empty. Optional fields make your
                                    submission stronger.
                                </p>
                            </div>

                            <div className="info-container space-y-3">
                                {requiredInfo.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`info-row flex items-start gap-4 p-4 border-4 opacity-0 ${
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
                    STATUS TRACKING AFTER SUBMISSION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Pipeline
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Track Your{" "}
                                    <span className="text-error">Submission</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    After you click Submit, the application enters the hiring pipeline.
                                    Here is every stage it can move through, what it means for you, and
                                    who drives the decision at each point.
                                </p>
                            </div>

                            <div className="status-container space-y-4">
                                {statusTimeline.map((stage) => (
                                    <div
                                        key={stage.number}
                                        className="status-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
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

                            {/* Tracking callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-bell text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            You Get Notified At Every Stage
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Every time your submission changes stage, you receive a
                                            notification. Stage changes, feedback notes, and final decisions
                                            all appear in your activity feed and trigger email notifications
                                            if you have them enabled. You never have to guess where your
                                            candidate stands.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE-SPECIFIC GUIDANCE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    By Role
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Guidance For{" "}
                                    <span className="text-secondary">Your Role</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Submissions look different depending on which side of the table
                                    you are on. Here is what matters most for each role.
                                </p>
                            </div>

                            <div className="role-container grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {roleGuidance.map((role, index) => (
                                    <div
                                        key={index}
                                        className="role-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-12 h-12 flex items-center justify-center bg-secondary">
                                                <i className={`${role.icon} text-lg text-secondary-content`}></i>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide text-base-content">
                                                {role.title}
                                            </h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {role.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-base-content/70">
                                                    <i className="fa-duotone fa-regular fa-diamond text-secondary mt-1 text-[10px]"></i>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Submissions That{" "}
                                    <span className="text-success">Win</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between a submission that gets an interview and
                                    one that gets declined comes down to preparation and
                                    presentation. Follow these six practices.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
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
                    COMMON REJECTION REASONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Avoid These
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Common Rejection{" "}
                                    <span className="text-error">Reasons</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    These are the top reasons submissions get declined. Every one
                                    of them is preventable. Learn them. Avoid them. Submit smarter.
                                </p>
                            </div>

                            <div className="rejection-container space-y-4">
                                {rejectionReasons.map((item, index) => (
                                    <div
                                        key={index}
                                        className="rejection-card border-4 border-error/15 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-error">
                                                <span className="text-xs font-black text-error-content">{String(index + 1).padStart(2, "0")}</span>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-base-content pt-1">
                                                {item.reason}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-3">
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {item.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-success/10 border-l-4 border-success">
                                                <i className="fa-duotone fa-regular fa-shield-check text-success mt-0.5"></i>
                                                <div>
                                                    <span className="font-bold text-success uppercase text-xs tracking-wider">How to prevent:</span>
                                                    <p className="text-sm text-base-content/60 mt-1">
                                                        {item.prevention}
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
                                    Hit a wall during submission? Check here first.
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
                <section className="submit-cta relative py-20 overflow-hidden bg-base-100">
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
                                    Your candidate is submitted. Here are the workflows that
                                    connect to this one -- from review to hire.
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
            </SubmitCandidateAnimator>
        </>
    );
}
