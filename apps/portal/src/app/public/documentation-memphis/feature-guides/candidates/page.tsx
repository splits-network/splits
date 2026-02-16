import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { CandidatesAnimator } from "./candidates-animator";

export const metadata = getDocMetadata("feature-guides/candidates");

// ─── Data ────────────────────────────────────────────────────────────────────

const overviewCards = [
    {
        icon: "fa-duotone fa-regular fa-database",
        title: "Central Talent Database",
        description:
            "Every candidate you source, import, or receive lives in one place. The Candidates page is your single source of truth for talent data. No spreadsheets. No scattered notes. One searchable, filterable database that every recruiter on your team can access based on their permissions.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Verification Pipeline",
        description:
            "Candidates move through verification statuses -- Unverified, Pending, Verified, Rejected -- that tell you and the hiring team exactly where each profile stands. Verified candidates get submitted faster and reviewed with more confidence. The status is visible everywhere the candidate appears.",
    },
    {
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "AI-Powered Matching",
        description:
            "Skills, location preferences, salary expectations, and work history feed the matching engine. The more complete a candidate's profile, the better the system matches them to open roles. Incomplete profiles get left behind. Complete profiles surface automatically when new roles are published.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Document Management",
        description:
            "Resumes, cover letters, portfolios, and certifications attach directly to candidate profiles. Every document is versioned so you always know which is current. When you submit a candidate, you choose which documents to include. No more emailing files back and forth.",
    },
];

const profileCreationSteps = [
    {
        number: "01",
        title: "Navigate To Candidates",
        description:
            "Open the Candidates page from the sidebar navigation. This is your central hub for all candidate data. The page shows a filterable, searchable list with status badges, verification indicators, source tags, and last-activity timestamps. It defaults to showing your most recently added candidates first.",
        detail:
            "You can filter by verification status (unverified, pending, verified, rejected), by source (manual, import, referral), by skills, by location, and by date range. The search bar supports name and email lookups. Combine filters to narrow down exactly who you are looking for.",
        tip: "Bookmark the Candidates page. You will use it every day alongside Roles. These are the two most-visited pages on the platform.",
    },
    {
        number: "02",
        title: "Click Add Candidate",
        description:
            "Select the Add Candidate button in the top-right corner of the page. This opens the candidate creation form with all fields visible on a single page. Required fields are marked with an asterisk and the form validates in real time as you type.",
        detail:
            "The form is not a multi-step wizard. Every field is visible at once so you can fill them in any order. If you leave the page before saving, unsaved data is lost. The system does not auto-save drafts for candidate profiles.",
        tip: "Open the form, fill in what you know, save immediately. You can always come back and add more detail later. A saved incomplete profile is better than a lost complete one.",
    },
    {
        number: "03",
        title: "Enter Contact Information",
        description:
            "Fill in the candidate's full name, email address, and phone number. These are the three required fields. The email is used for deduplication -- the system checks for existing candidates with the same email in real time and warns you if a match is found.",
        detail:
            "Use the candidate's professional email, not a personal one. This is what gets matched during deduplication, what the hiring team sees on submissions, and what the system uses for any automated notifications. Accuracy here prevents downstream problems everywhere.",
        tip: "If the system shows a duplicate warning, stop and check the existing profile first. Creating duplicates causes confusion during submissions and pollutes your data.",
    },
    {
        number: "04",
        title: "Add Skills And Preferences",
        description:
            "Enter the candidate's key skills as tags, preferred locations (including Remote), desired role type (full-time, contract, part-time), and salary expectations as a range. These fields power the AI matching engine that connects candidates to roles automatically.",
        detail:
            "Skills are entered as tags using industry-standard terms. Start typing and select from auto-complete suggestions to use canonical names the matching engine recognizes. 'React' works. 'Good at frontend stuff' does not. Location preferences support multiple entries. Salary expectations are stored as a min-max range.",
        tip: "Ask candidates directly about their preferences. Do not guess. Inaccurate preferences lead to bad matches and wasted review time for everyone in the pipeline.",
    },
    {
        number: "05",
        title: "Attach Resume And Documents",
        description:
            "Upload the candidate's resume and any supporting documents. Accepted formats are PDF, DOCX, and DOC. Maximum file size is 10 MB per document. You can attach multiple files and the system versions each upload.",
        detail:
            "The resume is the most important attachment. It is what hiring managers review first during submissions. If you have both a formatted version and a raw version, upload both. Always include a PDF -- it renders consistently across every device and browser.",
        tip: "Always attach a PDF version. DOCX files sometimes lose formatting depending on the viewer. PDFs are universally reliable.",
    },
    {
        number: "06",
        title: "Capture Sourcing Notes",
        description:
            "Document where you found the candidate, how you connected, their current job search status, availability, and consent information. Sourcing notes are free-form text that travels with the candidate record and is visible to your team.",
        detail:
            "Good sourcing notes sound like this: 'Referred by Jane Doe at TechCorp. Actively looking, prefers remote, available to start in 30 days. Agreed to be submitted for mid-senior React roles.' This context saves time for anyone who reviews or works with the profile later.",
        tip: "Always document consent. Did the candidate agree to be submitted for roles? Did they agree to share their resume? This protects your organization legally and builds trust with candidates.",
    },
    {
        number: "07",
        title: "Save And Review",
        description:
            "Click Save to create the candidate record. The system returns you to the candidate's detail page where you can verify everything. Check three things: the name and email are correct, the resume uploaded successfully, and the sourcing notes are captured.",
        detail:
            "After saving, the candidate appears in your Candidates list and is available for submissions (once verification requirements are met). If you notice an error, click Edit immediately. Incorrect emails cause deduplication failures. Incorrect names cause confusion during submissions.",
        tip: "Do not leave mistakes for later. Fix them now. The cost of correcting an error increases the further it gets into the pipeline.",
    },
];

const verificationStatuses = [
    {
        number: "01",
        name: "Unverified",
        description:
            "The default state for every new candidate. The profile exists but has not been reviewed for accuracy or completeness. Unverified candidates can be submitted to roles, but hiring teams see the unverified badge and may prioritize verified candidates first. Think of this as a yellow light -- proceed with caution.",
        who: "Set automatically on creation",
        color: "warning",
    },
    {
        number: "02",
        name: "Pending",
        description:
            "The candidate's profile has been submitted for verification review. This means someone has flagged it for a quality check -- contact information accuracy, resume validity, skills alignment. Pending profiles are in the queue and will be moved to Verified or Rejected after review.",
        who: "Recruiter or Admin initiates review",
        color: "info",
    },
    {
        number: "03",
        name: "Verified",
        description:
            "The candidate's profile has passed quality review. Contact information is confirmed, resume is current, skills are accurately tagged, and sourcing notes are documented. Verified candidates get priority treatment in the matching engine and are more likely to advance through hiring stages quickly.",
        who: "Admin or designated reviewer approves",
        color: "success",
    },
    {
        number: "04",
        name: "Rejected",
        description:
            "The profile did not pass verification. Common reasons include invalid contact information, outdated resume, suspected duplicate, or insufficient data quality. Rejected candidates can be edited and re-submitted for verification after the issues are corrected.",
        who: "Admin or reviewer marks with reason",
        color: "error",
    },
];

const sourcingContextItems = [
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Source Channel",
        description:
            "Record how you found the candidate: LinkedIn outreach, job board response, referral from a colleague, networking event, inbound application, or cold call. Source channel data helps your organization understand which sourcing methods produce the best candidates and optimize recruitment spend.",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Relationship Context",
        description:
            "Document the nature of your relationship with the candidate. Are they a warm referral, a passive candidate you cold-sourced, or someone who applied directly? Did you meet them at a conference? Have you placed them before? This context helps other recruiters understand the candidate's engagement level.",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Last Contact Date",
        description:
            "When did you last speak with this candidate? A candidate you talked to yesterday is in a different state than one you last contacted six months ago. Keeping this current prevents awkward cold outreach to candidates who think they have an active relationship with your team.",
    },
    {
        icon: "fa-duotone fa-regular fa-signature",
        title: "Consent And Authorization",
        description:
            "Document whether the candidate has agreed to be submitted for roles, share their resume with hiring companies, and be contacted about opportunities. Consent is not optional -- it is a legal and ethical requirement. Candidates who are submitted without their knowledge damage trust and can create liability.",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        title: "Availability Timeline",
        description:
            "When can the candidate start a new role? Are they immediately available, on a two-week notice period, or not looking to move for three months? Availability directly impacts which roles are a fit. Submitting an unavailable candidate wastes review time for everyone.",
    },
    {
        icon: "fa-duotone fa-regular fa-comment-dots",
        title: "Candidate Preferences",
        description:
            "Beyond salary and location, capture the candidate's preferences about company size, industry, team structure, management style, remote vs in-office, travel requirements, and role scope. These soft preferences often determine whether a candidate accepts an offer or walks away.",
    },
];

const skillsGuidance = [
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Use Canonical Tag Names",
        description:
            "Start typing in the skills field and select from auto-complete suggestions. The system normalizes variations ('ReactJS', 'React.js', 'React') to a single canonical tag. This ensures consistent matching regardless of how the skill was entered. Free-text tags that do not match the library still work but may not connect to role requirements.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Be Specific, Not Vague",
        description:
            "Tags like 'engineering' or 'management' are too broad to produce meaningful matches. Use specific, measurable skills: 'Python', 'AWS Lambda', 'Series A Fundraising', 'Enterprise Sales', 'React Native', 'PostgreSQL'. The more precise your tags, the more accurate your role matches.",
    },
    {
        icon: "fa-duotone fa-regular fa-layer-group",
        title: "Cover Multiple Dimensions",
        description:
            "Tag technical skills, soft skills, industry expertise, and certifications. A well-tagged profile includes 'TypeScript, Node.js, PostgreSQL, Team Leadership, Agile, AWS Certified Solutions Architect'. This multi-dimensional tagging helps the matching engine surface the candidate for roles that value different combinations of skills.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Keep Tags Current",
        description:
            "Skills evolve. A candidate who learned Kubernetes since their last profile update is now eligible for a different set of roles. When you learn about new skills during a check-in call, update the tags immediately. Stale skill tags cause missed opportunities that neither you nor the candidate will ever see.",
    },
];

const documentTypes = [
    {
        icon: "fa-duotone fa-regular fa-file-pdf",
        title: "Resume (PDF)",
        description: "The primary document for every candidate. Always attach a PDF version. It renders consistently across all devices and is what hiring managers receive during submissions.",
        priority: "critical",
    },
    {
        icon: "fa-duotone fa-regular fa-file-word",
        title: "Resume (DOCX)",
        description: "Some ATS systems prefer editable formats. Upload the DOCX alongside the PDF so you have both options available when submitting to different companies.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-file-certificate",
        title: "Certifications",
        description: "Professional certifications (AWS, PMP, CPA, etc.) that validate claimed skills. Attach scans or digital copies. These add credibility during the review process.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-palette",
        title: "Portfolio Or Work Samples",
        description: "Design portfolios, writing samples, code repositories, or case studies that demonstrate the candidate's work quality. Especially important for creative and technical roles.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-file-pen",
        title: "Cover Letter Template",
        description: "A base cover letter the candidate has prepared. Some hiring companies request cover letters with submissions. Having one ready speeds up the submission process.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-file-shield",
        title: "References",
        description: "Professional reference documents or reference contact lists. Not always needed upfront, but having them ready prevents delays when a company requests references late in the process.",
        priority: "medium",
    },
];

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: "bg-error", text: "text-error", label: "Must Have" },
    high: { bg: "bg-warning", text: "text-warning", label: "Should Have" },
    medium: { bg: "bg-success", text: "text-success", label: "Nice To Have" },
};

const searchFilters = [
    {
        icon: "fa-duotone fa-regular fa-input-text",
        title: "Name And Email Search",
        description:
            "The search bar at the top of the Candidates page supports free-text search across candidate names and email addresses. Type any part of a name or email to find matches instantly. The search is case-insensitive and updates results as you type.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Verification Status Filter",
        description:
            "Filter candidates by their verification status: Unverified, Pending, Verified, or Rejected. Use this to focus on candidates who are submission-ready (Verified) or to find profiles that need attention (Unverified, Rejected).",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Skills Filter",
        description:
            "Filter by one or more skill tags to find candidates with specific qualifications. The filter uses AND logic by default -- candidates must have all selected skills. This is how you find your React + TypeScript + AWS candidate when a role demands that specific combination.",
    },
    {
        icon: "fa-duotone fa-regular fa-location-dot",
        title: "Location Filter",
        description:
            "Filter by current location or preferred work locations. Supports city, state, and Remote as filter values. Use this when sourcing for location-specific roles or when a candidate insists on a particular geography.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrow-down-short-wide",
        title: "Sort Options",
        description:
            "Sort candidates by date added (newest first, oldest first), by name (alphabetical), or by last activity. Default sort is newest first. Switch to last-activity sort when you want to find candidates you have not touched recently.",
    },
    {
        icon: "fa-duotone fa-regular fa-filter-circle-xmark",
        title: "Clear All Filters",
        description:
            "One-click filter reset that removes all active filters and search terms, returning you to the full candidate list. Use this when your current filter combination returns zero results and you want to start fresh.",
    },
];

const matchingSteps = [
    {
        number: "01",
        title: "Profile Completeness Drives Matching",
        description:
            "The matching engine scores candidate profiles based on data completeness. Candidates with filled-in skills, location preferences, salary expectations, and a current resume score higher and appear in more match results. Incomplete profiles are invisible to the matching engine.",
        detail:
            "A profile with name, email, and resume scores about 40%. Add skills and location to reach 70%. Add salary expectations, sourcing notes, and availability to hit 90%+. The difference between 40% and 90% is the difference between zero matches and appearing in every relevant role's suggestion list.",
    },
    {
        number: "02",
        title: "Skills Drive Primary Matching",
        description:
            "The engine compares candidate skill tags against role requirements. Candidates with more overlapping skills rank higher in match results. This is why canonical tag names matter -- 'React' and 'ReactJS' need to resolve to the same skill for the match to count.",
        detail:
            "The engine also considers skill adjacency. A candidate tagged with 'React' gets partial credit for roles requiring 'Next.js' because the skills are related. But do not rely on adjacency alone -- always tag the actual skills the candidate has.",
    },
    {
        number: "03",
        title: "Location And Salary Filter Matches",
        description:
            "After skills, the engine filters by location compatibility and salary range overlap. A candidate in Austin who prefers Austin or Remote will match roles in Austin and remote roles. A candidate expecting $150-170K will not match a role budgeted at $100-120K.",
        detail:
            "These are hard filters, not soft suggestions. If the salary ranges do not overlap at all, the candidate will not appear in match results for that role. This is why accurate salary expectations matter -- wrong numbers mean missed opportunities.",
    },
    {
        number: "04",
        title: "Match Suggestions Appear On Role Pages",
        description:
            "When a role is published, the system generates a ranked list of matching candidates. Recruiters see this list on the role detail page as suggested candidates. Click a suggestion to review the candidate's profile, then submit directly if they are a fit.",
        detail:
            "Match suggestions update as candidate profiles are edited. If you add new skills to a candidate, they may appear as a suggestion for roles they previously did not match. This is another reason to keep profiles current.",
    },
];

const privacyPractices = [
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        title: "Visibility Controls",
        description:
            "Candidate profiles are visible only to recruiters within the same organization by default. Cross-organization visibility is controlled by marketplace settings. If marketplace mode is disabled, your candidates are private to your team. Hiring companies only see candidate data when a formal submission is made.",
    },
    {
        icon: "fa-duotone fa-regular fa-lock",
        title: "Data Access Permissions",
        description:
            "Not all team members see the same candidate data. Company Admins have full access. Recruiters see candidates they own or that are shared with them. Team Members may have read-only access depending on their role configuration. Sensitive fields like salary expectations can be restricted.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-shield",
        title: "Consent Management",
        description:
            "Track consent status in sourcing notes for every candidate. Document what they agreed to: resume sharing, role submissions, contact from hiring companies. If a candidate withdraws consent, update their profile immediately and stop all submission activity.",
    },
    {
        icon: "fa-duotone fa-regular fa-trash-can",
        title: "Data Retention And Deletion",
        description:
            "Candidate profiles can be archived or deleted. Archiving removes the candidate from active lists but preserves the record for compliance purposes. Deletion permanently removes all candidate data. Both actions are available to Company Admins and respect any active submissions in progress.",
    },
    {
        icon: "fa-duotone fa-regular fa-download",
        title: "Data Export",
        description:
            "Company Admins can export candidate data for compliance audits, reporting, or migration purposes. Exports include all profile fields, document metadata, and activity history. Actual documents must be downloaded separately. Export format is CSV for structured data.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Audit Trail",
        description:
            "Every action on a candidate profile is logged: who created it, who edited it, when documents were uploaded, when submissions were made, and when verification status changed. This audit trail is available to Company Admins and is critical for compliance in regulated industries.",
    },
];

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Complete Profiles Win",
        description:
            "Candidates with complete profiles get submitted faster, match better, and advance further. Fill in every field you can. A profile with skills, location, salary, resume, and notes is five times more useful than one with just a name and email. Completeness is not optional -- it is competitive advantage.",
    },
    {
        icon: "fa-duotone fa-regular fa-spell-check",
        title: "Accuracy Over Speed",
        description:
            "A misspelled name follows the candidate through every submission, email, and report. A wrong email breaks deduplication and communication. Triple-check names and emails before saving. These are the two hardest fields to fix after the fact because they propagate everywhere.",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Tag Aggressively",
        description:
            "More skill tags means more match opportunities. Use the auto-complete suggestions to stay within the canonical tag library. Aim for at least five to eight tags per candidate. Include technical skills, soft skills, industry expertise, and certifications. Under-tagged profiles are invisible to the matching engine.",
    },
    {
        icon: "fa-duotone fa-regular fa-note-sticky",
        title: "Document Everything",
        description:
            "Sourcing notes are the institutional memory of your candidate relationship. When you move on and another recruiter picks up the candidate, they should know exactly where things stand. Source, consent, availability, preferences, last conversation -- all of it goes in the notes.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Refresh Regularly",
        description:
            "Candidate situations change. Skills evolve. Salary expectations shift. Location preferences update. Set a cadence to review and update your candidate profiles -- monthly for active candidates, quarterly for passive ones. Stale profiles lead to mismatched submissions.",
    },
    {
        icon: "fa-duotone fa-regular fa-clone",
        title: "Prevent Duplicates",
        description:
            "Always search before creating. If the system shows a duplicate warning during creation, check the existing profile instead of forcing a new one. Duplicate candidates cause confusion during submissions, pollute analytics, and create conflicting records that are painful to merge later.",
    },
];

const troubleshootItems = [
    {
        symptom: "I cannot find a candidate in the list",
        cause: "Active filters or search terms are hiding the record, or the candidate was archived.",
        fix: "Clear all filters and search terms. Check the archived candidates view. If the candidate was deleted, they cannot be recovered -- contact your Company Admin.",
    },
    {
        symptom: "The Add Candidate button is missing",
        cause: "Your account does not have candidate-creation permissions, or you are not linked to an organization.",
        fix: "Ask a Company Admin to verify your role assignment and organization membership under Company Settings > Team. Recruiters need explicit candidate-creation permissions.",
    },
    {
        symptom: "Duplicate candidate warning during creation",
        cause: "A candidate with the same email address already exists in your organization.",
        fix: "Click the link in the warning to view the existing profile. If it is the same person, edit the existing record instead. If the email was entered incorrectly, correct it and try again.",
    },
    {
        symptom: "Resume upload fails",
        cause: "File exceeds 10 MB, uses an unsupported format, or network connection dropped.",
        fix: "Verify the file is PDF, DOCX, or DOC and under 10 MB. Compress images in the PDF if it is large. Try uploading again on a stable connection.",
    },
    {
        symptom: "Verification status is stuck on Pending",
        cause: "No reviewer has processed the verification request yet, or the reviewer queue is backed up.",
        fix: "Contact your Company Admin to check the verification queue. If you have admin access, review and process pending verifications under the Verification tab.",
    },
    {
        symptom: "Skills tags are not matching to roles",
        cause: "Tags do not match the standardized skill library, or they are misspelled.",
        fix: "Edit the candidate and re-enter skills using the auto-complete suggestions. Canonical tags that the matching engine recognizes appear in the dropdown as you type.",
    },
    {
        symptom: "Candidate does not appear in submission dropdown",
        cause: "The candidate's profile is missing required fields (name, email, or resume).",
        fix: "Open the candidate's profile and complete all required fields. Save, then return to the submission form. The candidate should now appear in the selection list.",
    },
    {
        symptom: "Candidate data seems incomplete after an import",
        cause: "Optional CSV columns were left empty or column headers did not match the expected format.",
        fix: "Edit the candidate profile manually to fill in missing fields. For future imports, use the CSV template from the Import page and fill in as many columns as possible.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows/add-or-import-candidates",
        icon: "fa-duotone fa-regular fa-user-plus",
        title: "Add Or Import Candidates",
        description: "Step-by-step guide to creating candidates manually or importing from CSV.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Your candidate is ready. Learn how to submit them to open roles with a strong pitch.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows/review-applications-and-move-stages",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Review Applications",
        description: "Understand what happens after submission. How candidates move through the hiring pipeline.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CandidatesFeatureGuideMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/candidates")} id="docs-feature-guides-candidates-jsonld" />
            <CandidatesAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-warning opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-error opacity-0" />
                        {/* User silhouette */}
                        <svg className="memphis-shape absolute top-[15%] left-[45%] opacity-0" width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="10" r="6" fill="none" className="stroke-warning" strokeWidth="3" />
                            <path d="M4,30 Q4,20 16,20 Q28,20 28,30" fill="none" className="stroke-warning" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[50%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-warning" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-warning">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <Link href="/public/documentation-memphis/feature-guides" className="text-base-content/50 transition-colors hover:text-warning">
                                        Feature Guides
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-warning">Candidates</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-warning text-warning-content">
                                    <i className="fa-duotone fa-regular fa-user-group"></i>
                                    Feature Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Build Your{" "}
                                <span className="relative inline-block">
                                    <span className="text-warning">Talent Database</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-warning" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl mb-6 opacity-0">
                                HERE IS HOW YOU BUILD YOUR TALENT DATABASE. Candidate profiles are the
                                foundation of everything on Splits Network. Every submission starts
                                with a profile. Every placement traces back to a profile. The quality
                                of your candidate data determines the quality of your placements.
                                This guide covers everything: creation, verification, skills tagging,
                                document management, search, matching, privacy, and best practices.
                            </p>

                            <div className="hero-roles flex flex-wrap gap-2 opacity-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass-dollar text-warning"></i>
                                    Recruiter
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-base-content/20 text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-building-shield text-warning"></i>
                                    Platform Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CANDIDATE PROFILES OVERVIEW
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Overview
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What Candidates{" "}
                                    <span className="text-warning">Are For</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A candidate profile is not a contact card. It is a living document
                                    that powers matching, submissions, verification, and placement
                                    tracking across the entire platform.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {overviewCards.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-warning/30 bg-base-100 p-6 opacity-0"
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
                    PROFILE CREATION AND MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Create A{" "}
                                    <span className="text-success">Candidate Profile</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Seven steps from blank form to a complete, submission-ready
                                    candidate profile. Most users finish in under five minutes.
                                </p>
                            </div>

                            <div className="profile-container space-y-6">
                                {profileCreationSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="profile-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 md:p-8 opacity-0"
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
                    VERIFICATION STATUS AND PROCESS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Verification
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Verification{" "}
                                    <span className="text-error">Status Pipeline</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every candidate moves through a verification pipeline. The status
                                    tells the entire platform how trustworthy and submission-ready
                                    the profile is. Verified candidates get priority everywhere.
                                </p>
                            </div>

                            <div className="verification-container space-y-4">
                                {verificationStatuses.map((status) => (
                                    <div
                                        key={status.number}
                                        className="verification-card flex gap-6 border-4 border-base-content/10 bg-base-100 p-6 opacity-0"
                                    >
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
                                                <i className="fa-duotone fa-regular fa-user-group text-base-content/40 mt-0.5 text-xs"></i>
                                                <p className="text-sm text-base-content/50">
                                                    {status.who}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Verification callout */}
                            <div className="mt-8 p-6 border-4 border-success bg-success/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success">
                                        <i className="fa-duotone fa-regular fa-shield-check text-success-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            Verification Is Not Required For Submission
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            You can submit unverified candidates to roles. However,
                                            hiring teams see the verification badge and often
                                            prioritize verified candidates. Investing time in
                                            verification pays off in faster reviews and higher
                                            acceptance rates. Treat verification as a quality signal,
                                            not a gate.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SOURCING CONTEXT AND ATTRIBUTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Sourcing
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Sourcing Context{" "}
                                    <span className="text-secondary">And Attribution</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Where a candidate came from matters. Sourcing context prevents
                                    duplicate outreach, documents consent, and helps your organization
                                    understand which channels produce the best talent.
                                </p>
                            </div>

                            <div className="overview-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sourcingContextItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="overview-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                    SKILLS AND QUALIFICATIONS TRACKING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Skills
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Skills And{" "}
                                    <span className="text-success">Qualifications</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Skill tags are the primary input for the AI matching engine.
                                    Tag accurately, tag completely, and your candidates will
                                    surface for the right roles automatically.
                                </p>
                            </div>

                            <div className="skills-container grid grid-cols-1 md:grid-cols-2 gap-6">
                                {skillsGuidance.map((item, index) => (
                                    <div
                                        key={index}
                                        className="skill-card border-4 border-success/20 bg-base-100 p-6 opacity-0"
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
                    DOCUMENT MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Documents
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Document{" "}
                                    <span className="text-error">Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Every document attached to a candidate profile is versioned,
                                    searchable, and available for inclusion in submissions. Keep
                                    documents current and organized.
                                </p>
                            </div>

                            <div className="docs-container space-y-4">
                                {documentTypes.map((item, index) => {
                                    const p = priorityColors[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="doc-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${p.bg}`}>
                                                <i className={`${item.icon} text-lg text-white`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-base-content">
                                                        {item.title}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${p.bg} text-white`}>
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

                            {/* Document tips callout */}
                            <div className="mt-8 p-6 border-4 border-error bg-error/5">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-error">
                                        <i className="fa-duotone fa-regular fa-file-check text-error-content"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-wide mb-2 text-base-content">
                                            File Requirements
                                        </h4>
                                        <p className="text-sm text-base-content/70 leading-relaxed">
                                            Accepted formats: PDF, DOCX, DOC. Maximum file size: 10 MB
                                            per document. Multiple files can be attached to a single
                                            profile. The system stores all versions and lets you choose
                                            which to include when submitting to roles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    SEARCH AND FILTERING CANDIDATES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Search
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Find The{" "}
                                    <span className="text-warning">Right Candidate</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your candidate database grows fast. Search and filter tools
                                    help you find exactly who you need in seconds, not minutes.
                                </p>
                            </div>

                            <div className="search-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchFilters.map((item, index) => (
                                    <div
                                        key={index}
                                        className="search-card border-4 border-warning/20 bg-base-100 p-6 opacity-0"
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
                    CANDIDATE MATCHING TO ROLES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-300 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Matching
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    How Candidates{" "}
                                    <span className="text-success">Match To Roles</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The matching engine connects candidates to roles automatically.
                                    Better profile data means better matches. Here is how it works.
                                </p>
                            </div>

                            <div className="match-container space-y-6">
                                {matchingSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="match-card flex gap-6 border-4 border-success/20 bg-base-100 p-6 md:p-8 opacity-0"
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
                    PRIVACY AND DATA MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="content-section py-20 overflow-hidden bg-base-100 opacity-0">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Privacy
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Privacy And{" "}
                                    <span className="text-secondary">Data Management</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Candidate data is sensitive. The platform provides visibility
                                    controls, consent tracking, audit trails, and data management
                                    tools to keep your organization compliant.
                                </p>
                            </div>

                            <div className="privacy-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {privacyPractices.map((item, index) => (
                                    <div
                                        key={index}
                                        className="privacy-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                                    Best Practices For{" "}
                                    <span className="text-success">Your Database</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between a recruiter with a strong candidate
                                    database and one who constantly struggles to find matches
                                    comes down to these six habits.
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
                                    Hit a wall with candidate profiles? Check here first.
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
                <section className="candidates-cta relative py-20 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[10%] right-[8%] w-12 h-12 rounded-full border-3 border-warning" />
                        <div className="absolute bottom-[20%] left-[8%] w-8 h-8 rotate-45 bg-success" />
                        <div className="absolute top-[50%] left-[5%] w-6 h-6 rounded-full bg-error" />
                        <svg className="absolute bottom-[30%] right-[15%]" width="50" height="16" viewBox="0 0 50 16">
                            <polyline points="0,12 7,4 14,12 21,4 28,12 35,4 42,12 50,4"
                                fill="none" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content max-w-5xl mx-auto opacity-0">
                            <div className="text-center mb-12">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-warning text-warning-content">
                                    Keep Going
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                    What Comes{" "}
                                    <span className="text-warning">Next</span>
                                </h2>
                                <p className="text-lg mb-10 text-base-content/70 max-w-2xl mx-auto">
                                    Your talent database is built. Here are the workflows
                                    that connect to candidate management.
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
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-warning bg-warning text-warning-content transition-transform hover:-translate-y-1"
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
            </CandidatesAnimator>
        </>
    );
}
