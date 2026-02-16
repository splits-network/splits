import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { HiringManagerAnimator } from "./hiring-manager-animator";

export const metadata = getDocMetadata("roles-and-permissions/hiring-manager");

// ─── Data ────────────────────────────────────────────────────────────────────

const roleOverview = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Pipeline Ownership",
        description:
            "Hiring Managers own the job posting, the hiring pipeline, and the final hiring decision. They define requirements, review submissions from recruiters, move candidates through stages, and extend offers. The role is focused on finding the right talent for specific positions within their organization.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Recruiter Collaboration",
        description:
            "Hiring Managers work with internal and external recruiters who source and submit candidates. They provide feedback on submissions, approve or reject candidates at each stage, and communicate requirements clearly. This role does not source candidates directly -- that is the recruiter's job.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Candidate Evaluation",
        description:
            "Hiring Managers review candidate profiles, resumes, and recruiter pitches. They move candidates through interview stages, provide structured feedback, coordinate interviews with other team members, and ultimately decide who gets an offer. Evaluation is the core responsibility.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-exclamation",
        title: "Access Scope",
        description:
            "Hiring Managers see only candidates submitted to their jobs. They cannot browse the full candidate database, access other organizations' pipelines, or view recruiter compensation details. Their permissions are scoped to the roles they manage and the candidates actively in their pipeline.",
    },
];

const coreResponsibilities = [
    {
        number: "01",
        title: "Create And Manage Job Postings",
        description:
            "Hiring Managers create job postings with detailed requirements: title, description, skills, salary range, location, and work type. They set the pipeline stages (Screening, Interview, Offer, etc.) and define what information recruiters need to submit candidates. Jobs can be published publicly or kept private for targeted sourcing.",
        detail:
            "A well-defined job posting attracts better submissions. Include specific required skills, clear role expectations, and accurate salary ranges. Vague postings lead to irrelevant submissions and wasted review time.",
        tip: "The more specific your job posting, the better quality submissions you receive. Recruiters use your requirements to filter their candidate database.",
    },
    {
        number: "02",
        title: "Review Recruiter Submissions",
        description:
            "When a recruiter submits a candidate to your job, you receive a notification with the candidate profile, resume, and recruiter pitch. Review the submission and either approve it to the next stage, request more information, or reject it with feedback explaining why it is not a fit.",
        detail:
            "Submissions include everything the recruiter knows about the candidate: skills, experience, salary expectations, availability, and sourcing context. The recruiter pitch explains why they think the candidate is a match. Read both the resume and the pitch.",
        tip: "Fast feedback keeps the pipeline moving. Recruiters prioritize hiring managers who respond quickly and provide clear reasons for rejections.",
    },
    {
        number: "03",
        title: "Move Candidates Through Pipeline Stages",
        description:
            "Candidates progress through stages: Submitted, Screening, Phone Interview, Technical Interview, Final Interview, Offer, Hired, or Rejected. You control stage transitions. Move candidates forward when they pass a stage. Mark them as rejected with a reason if they are not a fit.",
        detail:
            "Each stage transition is logged and visible to the recruiter who submitted the candidate. Clear stage progression helps recruiters understand where their candidates stand and improves collaboration.",
        tip: "Use rejection reasons consistently. This helps recruiters learn what you are looking for and improves future submission quality.",
    },
    {
        number: "04",
        title: "Coordinate Interviews",
        description:
            "Schedule and coordinate interviews with candidates who reach interview stages. You can involve other team members (technical leads, department heads) as interviewers. Collect feedback from all interviewers before making a decision. The platform logs all interview activity.",
        detail:
            "Interview scheduling happens outside the platform, but feedback collection is built in. After each interview, log the outcome and any notes so you have a complete record when it is time to decide.",
        tip: "Structured interview feedback prevents bias and makes decision-making faster. Use consistent evaluation criteria across all candidates for the same role.",
    },
    {
        number: "05",
        title: "Extend And Manage Offers",
        description:
            "When you are ready to hire a candidate, move them to the Offer stage and define offer terms: salary, start date, benefits, and any special conditions. The system generates an offer record that is visible to the recruiter. If the candidate accepts, move them to Hired and the placement is recorded.",
        detail:
            "Offer records are tracked for compliance and reporting purposes. If a candidate rejects the offer, mark the reason so your organization can identify patterns (salary too low, timeline too slow, etc.).",
        tip: "Move quickly from decision to offer. Top candidates often have multiple offers and will accept the first strong one they receive.",
    },
    {
        number: "06",
        title: "Provide Feedback To Recruiters",
        description:
            "Feedback is how recruiters learn what you need. When you reject a candidate, explain why: skills mismatch, experience level wrong, salary expectation too high, location incompatible. When you advance a candidate, let the recruiter know what impressed you.",
        detail:
            "Good feedback creates a feedback loop. Recruiters who understand your preferences submit better candidates over time. Vague feedback like 'not a fit' does not help anyone.",
        tip: "Specific feedback builds stronger recruiter relationships. Recruiters remember hiring managers who communicate clearly and will prioritize your roles in the future.",
    },
    {
        number: "07",
        title: "Monitor Pipeline Health",
        description:
            "Track how many candidates are at each stage, how long candidates spend in each stage, and where drop-off happens. If your pipeline is stuck at Phone Interview, you may need to schedule interviews faster. If most candidates are rejected at Screening, your job requirements may be too broad.",
        detail:
            "The Dashboard provides pipeline metrics: time-to-hire, stage conversion rates, and submission volume. Use these metrics to identify bottlenecks and improve your hiring process.",
        tip: "Check your pipeline weekly. Long stage durations mean candidates are accepting offers elsewhere. Optimize for speed without sacrificing quality.",
    },
];

const submissionApproval = [
    {
        number: "01",
        title: "Receive Submission Notification",
        description:
            "When a recruiter submits a candidate to your job, you receive an email notification and an in-app notification. The notification includes the candidate name, recruiter name, and a link to the submission detail page.",
        who: "System sends automatically on submission",
    },
    {
        number: "02",
        title: "Review Candidate Profile",
        description:
            "Open the submission to view the candidate's full profile: resume, skills, work history, salary expectations, location preferences, and any documents the recruiter attached. Read the recruiter pitch -- this explains why the recruiter believes the candidate is a match.",
        who: "You review within 24-48 hours",
    },
    {
        number: "03",
        title: "Decide: Advance, Request Info, Or Reject",
        description:
            "If the candidate looks promising, advance them to the next stage (typically Screening or Phone Interview). If you need more information, send a message to the recruiter asking specific questions. If the candidate is not a fit, reject with a clear reason.",
        who: "You make the decision",
    },
    {
        number: "04",
        title: "Provide Feedback",
        description:
            "Whether you advance or reject, provide feedback. For advancements: what impressed you. For rejections: what did not match (skills, experience, salary, location). This feedback helps the recruiter improve future submissions.",
        who: "You write feedback in the submission form",
    },
];

const candidateEvaluation = [
    {
        icon: "fa-duotone fa-regular fa-file-magnifying-glass",
        title: "Resume And Profile Review",
        description:
            "Start with the resume and candidate profile. Verify that claimed skills match your requirements, that work history shows relevant experience, and that education and certifications align with the role. Look for red flags: gaps in employment, frequent job changes, or skill mismatches.",
    },
    {
        icon: "fa-duotone fa-regular fa-scale-balanced",
        title: "Consistency Across Candidates",
        description:
            "Evaluate all candidates for the same role using the same criteria. Bias creeps in when you ask different questions or weigh different factors for different candidates. Structured evaluation keeps the process fair and defensible.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list-check",
        title: "Interview Feedback Collection",
        description:
            "After each interview round, collect structured feedback from all interviewers. Use a consistent scorecard: technical skills, communication, culture fit, role alignment. Aggregate scores help you compare candidates objectively.",
    },
    {
        icon: "fa-duotone fa-regular fa-stopwatch",
        title: "Move Fast On Strong Candidates",
        description:
            "Top candidates do not stay on the market long. When you find someone who meets or exceeds your requirements, move them through the pipeline quickly. Delays cost you hires -- strong candidates accept other offers while you deliberate.",
    },
    {
        icon: "fa-duotone fa-regular fa-message-lines",
        title: "Communicate Timeline Clearly",
        description:
            "Set expectations with candidates about your timeline: when they will hear back, how many interview rounds to expect, and when you plan to make a decision. Uncertainty drives candidates away. Clear communication keeps them engaged.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake-simple",
        title: "Involve Team Members Appropriately",
        description:
            "For senior roles or specialized positions, involve relevant team members in the interview process. A technical lead can assess technical depth better than you can. A department head can evaluate strategic fit. Use your team's expertise.",
    },
];

const accessScope = [
    {
        icon: "fa-duotone fa-regular fa-check",
        title: "What Hiring Managers CAN Do",
        items: [
            "Create, edit, and publish job postings",
            "Review candidates submitted to their jobs",
            "Move candidates through pipeline stages",
            "Reject candidates with feedback",
            "Extend offers to candidates",
            "Coordinate interviews and collect feedback",
            "View pipeline metrics for their jobs",
            "Message recruiters about submissions",
            "Download candidate resumes and documents",
            "Mark placements as hired",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-xmark",
        title: "What Hiring Managers CANNOT Do",
        items: [
            "Browse the full candidate database",
            "See candidates not submitted to their jobs",
            "Access other organizations' pipelines",
            "View recruiter compensation or fee splits",
            "Edit or delete other users' job postings",
            "Approve or reject other hiring managers' candidates",
            "Modify organization billing settings",
            "Create or remove user accounts",
            "Export organization-wide data",
            "Access platform admin functions",
        ],
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-sparkles",
        title: "Write Specific Job Descriptions",
        description:
            "Clear requirements attract better submissions. List required skills, years of experience, education requirements, and any must-have qualifications. Avoid vague language. 'Expert in cloud infrastructure' is not specific. 'AWS Solutions Architect certification, 5+ years managing production Kubernetes clusters' is.",
    },
    {
        icon: "fa-duotone fa-regular fa-stopwatch",
        title: "Respond To Submissions Within 48 Hours",
        description:
            "Speed matters. Recruiters prioritize hiring managers who respond quickly. Candidates lose interest when they do not hear back. Set a rule: review submissions within 48 hours. If you need more time, send a quick acknowledgment and set a timeline.",
    },
    {
        icon: "fa-duotone fa-regular fa-message-check",
        title: "Give Specific Rejection Feedback",
        description:
            "Generic rejections like 'not a fit' do not help recruiters improve. Explain the mismatch: 'Candidate has only 2 years of React experience, we need 5+' or 'Salary expectation of $180K exceeds our $120-140K budget.' Specificity builds trust and improves future submissions.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-days",
        title: "Keep Interview Pipelines Moving",
        description:
            "Do not let candidates sit in a stage for weeks. If someone passes Phone Interview, schedule Technical Interview within a week. If they pass Technical, schedule Final within a few days. Long gaps signal disorganization and cost you candidates.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Build Relationships With Strong Recruiters",
        description:
            "When a recruiter submits great candidates consistently, acknowledge it. Send positive feedback when a candidate performs well in interviews. Recruiters remember hiring managers who treat them as partners, not vendors, and will bring their best candidates to you first.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Review Pipeline Metrics Regularly",
        description:
            "Check your Dashboard weekly to see where candidates are getting stuck. If most candidates are rejected at Screening, your job requirements may be misaligned with what recruiters are finding. If Technical Interview is a bottleneck, schedule more interview slots.",
    },
];

const troubleshootItems = [
    {
        symptom: "Not receiving submission notifications",
        cause: "Notification settings are disabled, or emails are going to spam.",
        fix: "Check Notifications settings under your profile. Verify your email address is correct. Add noreply@splitsnetwork.com to your email contacts to prevent spam filtering.",
    },
    {
        symptom: "Cannot move candidate to next stage",
        cause: "Required fields are missing, or the candidate is already at a terminal stage (Hired or Rejected).",
        fix: "Verify the candidate is not already marked Hired or Rejected. Check that all required fields for the next stage are filled in. If blocked, contact your Platform Admin.",
    },
    {
        symptom: "Cannot see submitted candidates",
        cause: "Candidates are submitted to a different job, or your account does not have Hiring Manager permissions for this job.",
        fix: "Verify you are viewing the correct job posting. Check with your Platform Admin to confirm you are assigned as Hiring Manager for this role.",
    },
    {
        symptom: "Recruiter is not responding to feedback",
        cause: "Messages are not being sent, or the recruiter has disabled notifications.",
        fix: "Verify the message was sent successfully -- check your Sent Messages. If messages are being delivered but not answered, escalate to your Platform Admin or contact the recruiter directly via email.",
    },
    {
        symptom: "Pipeline metrics look wrong",
        cause: "Data refresh delay, or stage transitions were logged incorrectly.",
        fix: "Metrics refresh every 15 minutes. Wait and check again. If numbers are still incorrect, contact Platform Support with the specific job ID and metric that looks wrong.",
    },
    {
        symptom: "Cannot extend an offer",
        cause: "Candidate has not reached Offer stage, or required offer fields are missing.",
        fix: "Move the candidate to Offer stage first. Fill in all required offer fields: salary, start date, and offer terms. If fields are disabled, check with your Platform Admin -- your role may not have offer-creation permissions.",
    },
    {
        symptom: "Candidate profile is incomplete",
        cause: "Recruiter submitted an incomplete profile, or documents failed to upload.",
        fix: "Message the recruiter and request the missing information or documents. Do not advance the candidate until the profile is complete -- incomplete profiles lead to poor interview outcomes.",
    },
    {
        symptom: "Job posting is not visible to recruiters",
        cause: "Job is saved as draft, or visibility is set to private.",
        fix: "Edit the job posting and verify Status is set to Published. Check that Visibility is set to Public if you want external recruiters to see it. Save and confirm the job appears in the public job list.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/post-a-job",
        icon: "fa-duotone fa-regular fa-briefcase-arrow-right",
        title: "Post A Job",
        description: "Learn how to create a job posting that attracts high-quality recruiter submissions.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Step-by-step guide to evaluating candidates and moving them through your pipeline.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/feature-guides/placements",
        icon: "fa-duotone fa-regular fa-handshake-angle",
        title: "Manage Placements",
        description: "Understand how placements are tracked after you hire a candidate.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-coral", border: "border-coral", text: "text-coral" },
    teal: { bg: "bg-teal", border: "border-teal", text: "text-teal" },
    purple: { bg: "bg-purple", border: "border-purple", text: "text-purple" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HiringManagerRoleMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("roles-and-permissions/hiring-manager")} id="docs-roles-hiring-manager-jsonld" />
            <HiringManagerAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-cream">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-16 h-16 rounded-full border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[38%] right-[10%] w-14 h-14 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[22%] left-[18%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[25%] right-[32%] w-10 h-10 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[42%] w-16 h-6 -rotate-6 border-4 border-teal opacity-0" />
                        <div className="memphis-shape absolute top-[60%] left-[28%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                        {/* Briefcase icon */}
                        <svg className="memphis-shape absolute top-[18%] left-[50%] opacity-0" width="36" height="36" viewBox="0 0 36 36">
                            <rect x="6" y="12" width="24" height="16" fill="none" className="stroke-coral" strokeWidth="3" />
                            <rect x="12" y="6" width="12" height="6" fill="none" className="stroke-coral" strokeWidth="3" />
                            <line x1="18" y1="20" x2="18" y2="20" className="stroke-coral" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[18%] right-[48%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-purple" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[70%] left-[38%] opacity-0" width="64" height="18" viewBox="0 0 64 18">
                            <polyline points="0,14 8,4 16,14 24,4 32,14 40,4 48,14 56,4 64,14"
                                fill="none" className="stroke-teal" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-dark/50 transition-colors hover:text-coral">
                                        Documentation
                                    </Link>
                                    <span className="text-dark/30">/</span>
                                    <Link href="/public/documentation-memphis/roles-and-permissions" className="text-dark/50 transition-colors hover:text-coral">
                                        Roles And Permissions
                                    </Link>
                                    <span className="text-dark/30">/</span>
                                    <span className="text-coral">Hiring Manager</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-cream">
                                    <i className="fa-duotone fa-regular fa-user-tie"></i>
                                    Role Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-dark opacity-0">
                                HERE IS YOUR{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">PIPELINE</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-coral" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-dark/70 max-w-3xl mb-6 opacity-0">
                                The Hiring Manager role is built for one purpose: find the right talent
                                for your open positions. You own the job posting, control the pipeline,
                                evaluate candidates, and make the final hiring decision. Recruiters
                                source and submit candidates. You review, interview, and hire. This
                                guide covers everything you need to manage your hiring pipeline
                                effectively.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-dark/20 text-dark/60">
                                    <i className="fa-duotone fa-regular fa-user-tie text-coral"></i>
                                    Hiring Manager
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-4 border-dark/20 text-dark/60">
                                    <i className="fa-duotone fa-regular fa-building text-coral"></i>
                                    Company Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    What Hiring Managers{" "}
                                    <span className="text-coral">Do</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    The Hiring Manager role is scoped to job ownership, candidate
                                    evaluation, and pipeline management. You control the hiring
                                    process for your roles from posting to placement.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roleOverview.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-coral/30 bg-cream p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 bg-coral">
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
                    CORE RESPONSIBILITIES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-cream">
                                    Responsibilities
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Core{" "}
                                    <span className="text-teal">Responsibilities</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Seven key responsibilities define the Hiring Manager role.
                                    Master these and you will run an efficient, high-quality
                                    hiring pipeline.
                                </p>
                            </div>

                            <div className="responsibilities-container space-y-6">
                                {coreResponsibilities.map((item, index) => (
                                    <div
                                        key={index}
                                        className="responsibility-card flex gap-6 border-4 border-dark/10 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-teal">
                                            <span className="text-2xl font-black text-cream">
                                                {item.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-teal text-cream text-sm font-black">
                                                    {item.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-dark/70 mb-3">
                                                {item.description}
                                            </p>
                                            <p className="text-sm leading-relaxed text-dark/50 mb-4">
                                                {item.detail}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-3 bg-teal/10 border-l-4 border-teal">
                                                <i className="fa-duotone fa-regular fa-lightbulb text-teal mt-0.5"></i>
                                                <p className="text-sm text-dark/60">
                                                    {item.tip}
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
                    SUBMISSION APPROVAL WORKFLOW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Workflow
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Submission Approval{" "}
                                    <span className="text-purple">Workflow</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    When a recruiter submits a candidate to your job, this is
                                    the workflow you follow to review and decide.
                                </p>
                            </div>

                            <div className="submission-container space-y-4">
                                {submissionApproval.map((step) => (
                                    <div
                                        key={step.number}
                                        className="submission-card flex gap-6 border-4 border-dark/10 bg-cream p-6 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-purple">
                                            <span className="text-2xl font-black text-cream">
                                                {step.number}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="md:hidden inline-flex items-center justify-center w-8 h-8 bg-purple text-cream text-sm font-black">
                                                    {step.number}
                                                </span>
                                                <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-dark/70 mb-3">
                                                {step.description}
                                            </p>
                                            <div className="flex items-start gap-2 px-4 py-2 bg-dark/5 border-l-4 border-dark/20">
                                                <i className="fa-duotone fa-regular fa-user-group text-dark/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-dark/50">
                                                    {step.who}
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
                    CANDIDATE EVALUATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                    Evaluation
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Candidate{" "}
                                    <span className="text-coral">Evaluation</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Effective candidate evaluation is structured, consistent,
                                    and fast. These practices help you identify top talent
                                    without wasting time on poor fits.
                                </p>
                            </div>

                            <div className="evaluation-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {candidateEvaluation.map((item, index) => (
                                    <div
                                        key={index}
                                        className="evaluation-card border-4 border-yellow/30 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-yellow">
                                            <i className={`${item.icon} text-xl text-yellow`}></i>
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
                    ACCESS SCOPE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-coral text-cream">
                                    Permissions
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Access Scope And{" "}
                                    <span className="text-coral">Limitations</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Hiring Managers have focused permissions. You can manage
                                    your jobs and candidates, but you cannot access
                                    organization-wide settings or other users' pipelines.
                                </p>
                            </div>

                            <div className="access-container grid grid-cols-1 md:grid-cols-2 gap-8">
                                {accessScope.map((section, index) => (
                                    <div
                                        key={index}
                                        className="access-card border-4 border-coral/20 bg-cream p-6 opacity-0"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-coral">
                                                <i className={`${section.icon} text-lg text-cream`}></i>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide text-dark">
                                                {section.title}
                                            </h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {section.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-dark/70">
                                                    <i className="fa-solid fa-circle text-[6px] text-coral mt-1.5 flex-shrink-0"></i>
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
                <section className="content-section py-20 overflow-hidden bg-cream opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-cream">
                                    Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Best Practices For{" "}
                                    <span className="text-teal">Pipeline Management</span>
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    The difference between a hiring manager who closes roles
                                    quickly and one who struggles with empty pipelines comes
                                    down to these six habits.
                                </p>
                            </div>

                            <div className="practices-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bestPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="practice-card border-4 border-teal/20 bg-base-100 p-6 opacity-0"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-4 border-4 border-teal">
                                            <i className={`${item.icon} text-xl text-teal`}></i>
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
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-14">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-cream">
                                    Fixes
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                    Trouble&shy;shooting
                                </h2>
                                <p className="mt-4 text-base text-dark/60 max-w-2xl mx-auto">
                                    Hit a wall managing your pipeline? Check here first.
                                    These are the issues we see most often.
                                </p>
                            </div>

                            <div className="trouble-container space-y-4">
                                {troubleshootItems.map((item, idx) => (
                                    <div key={idx} className="trouble-card border-4 border-purple/15 bg-cream p-6 opacity-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple">
                                                <i className="fa-duotone fa-regular fa-triangle-exclamation text-sm text-cream"></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide text-dark pt-1">
                                                {item.symptom}
                                            </h3>
                                        </div>
                                        <div className="ml-11 space-y-2">
                                            <p className="text-sm text-dark/60">
                                                <span className="font-bold text-dark/80 uppercase text-xs tracking-wider">Likely cause:</span>{" "}
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
                <section className="hiring-manager-cta relative py-20 overflow-hidden bg-cream">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-4 border-coral" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-teal" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-purple" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-coral" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-cream">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-dark">
                                    What Comes{" "}
                                    <span className="text-coral">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-dark/70 max-w-2xl mx-auto">
                                    You understand the Hiring Manager role. Here are the
                                    workflows that connect to your responsibilities.
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
                                                    <i className={`${item.icon} text-lg text-cream`}></i>
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

                            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
                                <Link
                                    href="/public/documentation-memphis/roles-and-permissions"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-coral bg-coral text-cream transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-users"></i>
                                    All Roles
                                </Link>
                                <Link
                                    href="/public/documentation-memphis"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-dark text-dark transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    All Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </HiringManagerAnimator>
        </>
    );
}
