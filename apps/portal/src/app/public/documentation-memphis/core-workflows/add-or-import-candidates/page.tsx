import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { AddCandidatesAnimator } from "./add-candidates-animator";

export const metadata = getDocMetadata("core-workflows/add-or-import-candidates");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Recruiter Permissions",
        description:
            "Your account must have the Recruiter role with candidate-creation permissions enabled. If the Add Candidate button is missing, ask your admin to verify your access under Company Settings > Team.",
    },
    {
        icon: "fa-duotone fa-regular fa-address-book",
        title: "Contact Details Ready",
        description:
            "Have the candidate's full name, email address, and phone number prepared. At minimum you need a name and one contact method. Everything else can be added later, but these are required to save.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Resume Or Profile Data",
        description:
            "A resume, LinkedIn profile URL, or equivalent work history to attach. Candidates without any work history documentation are harder to submit and less likely to advance through review stages.",
    },
    {
        icon: "fa-duotone fa-regular fa-clipboard-list",
        title: "Sourcing Context",
        description:
            "Know where you found this candidate and any relevant sourcing notes. This context helps other team members understand the relationship and avoids duplicate outreach from different recruiters.",
    },
];

const manualSteps = [
    {
        number: "01",
        title: "Open The Candidates Page",
        description:
            "Navigate to Candidates from the sidebar. This is your central hub for every candidate you have sourced, imported, or been assigned. The page shows a filterable, searchable list with status badges, verification indicators, and last-activity timestamps.",
        detail:
            "You can filter by status (active, archived, submitted), by source (manual, import, referral), and by date range. Use the search bar for quick lookups by name or email. The list defaults to your most recently added candidates first.",
        tip: "Bookmark the Candidates page. Along with Roles, you will use it every single day.",
    },
    {
        number: "02",
        title: "Click Add Candidate",
        description:
            "Select the Add Candidate button in the top-right corner of the Candidates page. This opens the candidate creation form where you enter all profile information. The form validates required fields in real time and prevents saving until minimums are met.",
        detail:
            "The form is a single-page layout, not a multi-step wizard. All fields are visible at once so you can fill them in any order. Required fields are marked with an asterisk. If you leave the page before saving, your unsaved data is lost.",
        tip: "Open the form, fill in what you have, and save immediately. You can always edit the candidate later to add more detail.",
    },
    {
        number: "03",
        title: "Enter Contact Information",
        description:
            "Fill in the candidate's full name, email address, and phone number. The email field is used for deduplication, so accuracy matters. If the candidate has multiple emails, use their primary professional email.",
        detail:
            "The system checks for existing candidates with the same email address in real time. If a match is found, you will see a warning with a link to the existing profile. This prevents duplicate records and keeps your data clean from the start.",
        tip: "Use the candidate's professional email, not a personal one. This is what gets matched during deduplication and is what hiring managers see on submissions.",
    },
    {
        number: "04",
        title: "Add Role Preferences And Skills",
        description:
            "Enter the candidate's desired role type, preferred locations, salary expectations, and key skills. These fields power the AI matching engine. The more accurate they are, the better the system can suggest role-candidate fits.",
        detail:
            "Skills are entered as tags. Use industry-standard terms that map to real job requirements. 'React' works. 'Good at frontend stuff' does not. Location preferences support multiple entries, including Remote. Salary expectations are stored as a range.",
        tip: "Ask candidates directly about their preferences rather than guessing. Inaccurate preferences lead to mismatched submissions and wasted review time for everyone.",
    },
    {
        number: "05",
        title: "Capture Sourcing Notes",
        description:
            "Add notes about where you found the candidate, how you connected, any relevant context about their job search status, and consent information. This is free-form text that travels with the candidate record.",
        detail:
            "Sourcing notes are visible to other recruiters in your organization who work with this candidate. Use them to document the relationship: 'Referred by Jane Doe, actively looking, prefers remote, available to start in 30 days.' This context saves time for anyone who reviews the profile later.",
        tip: "Always document consent status. Did the candidate agree to be submitted for roles? Did they agree to share their resume? This protects your organization and builds trust.",
    },
    {
        number: "06",
        title: "Attach Resume And Documents",
        description:
            "Upload the candidate's resume and any supporting documents. Accepted formats include PDF, DOCX, and DOC. File size limit is 10 MB per document. You can attach multiple files.",
        detail:
            "The resume is the single most important attachment. It is what hiring managers review first during the submission process. If you have a formatted version and a raw version, upload both. The system stores all versions and lets you choose which to include in submissions.",
        tip: "Always attach a PDF version of the resume. PDFs render consistently across all devices and browsers. DOCX files sometimes lose formatting.",
    },
    {
        number: "07",
        title: "Save And Verify",
        description:
            "Click Save to create the candidate record. After saving, the system returns you to the candidate's detail page where you can verify everything looks correct. The candidate now appears in your Candidates list and is available for submissions.",
        detail:
            "After saving, check three things: (1) the name and email are spelled correctly, (2) the resume uploaded successfully and is viewable, and (3) the sourcing notes are captured. These are the fields that matter most for downstream workflows.",
        tip: "If you notice a mistake, click Edit immediately. Do not leave it for later. Incorrect emails cause deduplication failures and incorrect names create confusion during submissions.",
    },
];

const candidateFields = [
    { field: "Full Name", description: "The candidate's first and last name as they want to be addressed.", required: true },
    { field: "Email Address", description: "Primary professional email. Used for deduplication and communication.", required: true },
    { field: "Phone Number", description: "Direct phone number for recruiter outreach and scheduling.", required: true },
    { field: "Resume", description: "PDF or DOCX of the candidate's work history and qualifications.", required: true },
    { field: "Location", description: "Current city and state, or Remote. Used for role matching.", required: false },
    { field: "Desired Role Type", description: "Full-time, contract, or part-time preference.", required: false },
    { field: "Salary Expectations", description: "Expected compensation range. Helps filter role matches.", required: false },
    { field: "Skills / Tags", description: "Keyword tags for AI matching. Use industry-standard terms.", required: false },
    { field: "LinkedIn URL", description: "Link to the candidate's LinkedIn profile for verification.", required: false },
    { field: "Sourcing Notes", description: "How you found the candidate, relationship context, consent status.", required: false },
    { field: "Availability", description: "When the candidate could start a new role.", required: false },
    { field: "Preferred Locations", description: "Cities, states, or Remote where the candidate wants to work.", required: false },
];

const importSteps = [
    {
        number: "01",
        icon: "fa-duotone fa-regular fa-file-csv",
        title: "Prepare Your CSV File",
        description:
            "Structure your data in a CSV file with one candidate per row. Required columns are full_name, email, and phone. Optional columns include location, skills, linkedin_url, notes, desired_role_type, salary_min, salary_max, and availability.",
        detail:
            "Download the template from the Import page to see the exact column names and format. The template includes example rows to guide your data entry. Column order does not matter as long as headers match the expected names exactly.",
    },
    {
        number: "02",
        icon: "fa-duotone fa-regular fa-upload",
        title: "Upload The File",
        description:
            "Navigate to Candidates and select Import Candidates. Choose your CSV file. The system reads the headers and shows a column-mapping preview so you can verify that your data aligns with the expected fields before processing.",
        detail:
            "Supported file formats are CSV and TSV. Maximum file size is 5 MB. For larger datasets, split your file into batches of 500 candidates or fewer. The importer processes each batch independently.",
    },
    {
        number: "03",
        icon: "fa-duotone fa-regular fa-magnifying-glass-chart",
        title: "Review The Validation Report",
        description:
            "Before any records are created, the system validates every row. It checks for required fields, email format, duplicate detection against existing candidates, and data type validation. A summary report shows valid rows, warnings, and errors.",
        detail:
            "Rows with errors (missing name, invalid email format) are flagged red and will be skipped. Rows with warnings (possible duplicate, missing optional fields) are flagged yellow and can be imported or skipped at your discretion. Green rows are clean and ready.",
    },
    {
        number: "04",
        icon: "fa-duotone fa-regular fa-check-double",
        title: "Confirm And Import",
        description:
            "After reviewing the validation report, select which rows to import. You can import all valid rows, deselect specific warnings, or fix errors in the CSV and re-upload. Click Confirm Import to create the candidate records.",
        detail:
            "The import runs as a background job. For large files, this can take a few minutes. You will see a progress indicator and receive a notification when the import completes. Each imported candidate gets a 'Bulk Import' source tag automatically.",
    },
];

const validationRules = [
    {
        icon: "fa-duotone fa-regular fa-at",
        title: "Email Format Validation",
        color: "error",
        description:
            "Every email address is checked against RFC 5322 format. Invalid formats (missing @, double dots, trailing spaces) are rejected. The system also normalizes casing to prevent duplicates caused by 'John@email.com' vs 'john@email.com'.",
    },
    {
        icon: "fa-duotone fa-regular fa-clone",
        title: "Duplicate Detection",
        color: "warning",
        description:
            "The system matches candidates by email address. If a candidate with the same email already exists in your organization, you will see a warning with a link to the existing record. For imports, duplicates are flagged in the validation report and can be skipped or merged.",
    },
    {
        icon: "fa-duotone fa-regular fa-input-text",
        title: "Required Field Enforcement",
        color: "error",
        description:
            "Full name, email, and phone are required for manual creation. For imports, full_name and email are required per row. Records missing required fields cannot be saved or imported. The form highlights missing fields in real time.",
    },
    {
        icon: "fa-duotone fa-regular fa-phone",
        title: "Phone Number Formatting",
        color: "success",
        description:
            "Phone numbers are normalized on save. The system accepts multiple formats (555-123-4567, (555) 123-4567, +1 555 123 4567) and stores them in a consistent format. International numbers are supported with country codes.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-check",
        title: "File Type Validation",
        color: "success",
        description:
            "Resume uploads are restricted to PDF, DOCX, and DOC formats. Maximum file size is 10 MB per document. Files that exceed the limit or use unsupported formats are rejected with a clear error message before upload begins.",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Skills Tag Normalization",
        color: "secondary",
        description:
            "Skill tags are normalized to a standard library when possible. 'ReactJS', 'React.js', and 'React' all map to the same canonical tag. This ensures consistent matching across candidates and roles regardless of how the skill was entered.",
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    error: { bg: "bg-error", border: "border-error", text: "text-error" },
    warning: { bg: "bg-warning", border: "border-warning", text: "text-warning" },
    success: { bg: "bg-success", border: "border-success", text: "text-success" },
    secondary: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

const bestPractices = [
    {
        icon: "fa-duotone fa-regular fa-bullseye",
        title: "Complete Profiles Win",
        description:
            "Candidates with complete profiles (resume, skills, preferences, notes) get submitted faster and reviewed more favorably. Hiring managers trust complete data. Incomplete profiles raise questions and create friction in the review process.",
    },
    {
        icon: "fa-duotone fa-regular fa-spell-check",
        title: "Spell Check Names And Emails",
        description:
            "A misspelled name follows the candidate through every submission, email, and report. A wrong email breaks deduplication and communication. Triple-check both before saving. These are the two hardest fields to fix after the fact.",
    },
    {
        icon: "fa-duotone fa-regular fa-file-pdf",
        title: "Always Attach A PDF Resume",
        description:
            "PDF is the universal format. It renders the same everywhere. DOCX files sometimes break formatting on different devices. If you only have a DOCX, convert it to PDF and upload both. The PDF is what gets sent to hiring managers.",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Use Specific Skill Tags",
        description:
            "Vague tags like 'engineering' or 'management' do not help the matching engine. Use specific, measurable skills: 'Python', 'AWS Lambda', 'Series A Fundraising', 'Enterprise Sales'. More tags and more specificity means better role matches.",
    },
    {
        icon: "fa-duotone fa-regular fa-note-sticky",
        title: "Document Sourcing Context",
        description:
            "Always note how you found the candidate, when you last spoke, and their current job search status. This context prevents duplicate outreach, helps other recruiters understand the relationship, and provides legal documentation of consent.",
    },
    {
        icon: "fa-duotone fa-regular fa-arrows-rotate",
        title: "Keep Profiles Current",
        description:
            "Candidate situations change. Update profiles when you learn new information: new skills, changed location preferences, updated salary expectations, or a new resume version. Stale profiles lead to mismatched submissions and wasted effort.",
    },
];

const completionChecklist = [
    {
        icon: "fa-duotone fa-regular fa-circle-check",
        title: "Contact Information Complete",
        description: "Full name, professional email, and phone number verified and correctly spelled.",
        priority: "critical",
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        title: "Resume Attached",
        description: "Current PDF resume uploaded. Ideally less than six months old with accurate work history.",
        priority: "critical",
    },
    {
        icon: "fa-duotone fa-regular fa-tags",
        title: "Skills Tagged",
        description: "Five or more specific skill tags added using industry-standard terminology.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-location-dot",
        title: "Location Preferences Set",
        description: "Current location and preferred work locations (including Remote if applicable) specified.",
        priority: "high",
    },
    {
        icon: "fa-duotone fa-regular fa-money-check-dollar",
        title: "Salary Expectations Captured",
        description: "Minimum and maximum compensation expectations recorded. This filters role matches.",
        priority: "medium",
    },
    {
        icon: "fa-duotone fa-regular fa-note-sticky",
        title: "Sourcing Notes Added",
        description: "Source, relationship context, consent status, and availability documented.",
        priority: "medium",
    },
];

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: "bg-error", text: "text-error", label: "Must Have" },
    high: { bg: "bg-warning", text: "text-warning", label: "Should Have" },
    medium: { bg: "bg-success", text: "text-success", label: "Nice To Have" },
};

const troubleshootItems = [
    {
        symptom: "The Add Candidate button is missing",
        cause: "Your account does not have recruiter permissions, or you are not linked to an organization.",
        fix: "Ask a Company Admin to verify your role assignment and organization membership under Company Settings > Team.",
    },
    {
        symptom: "Duplicate candidate warning during creation",
        cause: "A candidate with the same email address already exists in your organization.",
        fix: "Click the link in the warning to view the existing profile. If it is the same person, edit the existing record instead of creating a new one. If the email was entered incorrectly, correct it and try again.",
    },
    {
        symptom: "Resume upload fails",
        cause: "The file exceeds 10 MB, uses an unsupported format, or the network connection dropped during upload.",
        fix: "Verify the file is PDF, DOCX, or DOC and under 10 MB. If the file is large, compress images in the PDF. Try uploading again on a stable connection.",
    },
    {
        symptom: "CSV import shows all rows as errors",
        cause: "Column headers do not match the expected format. Common issues include extra spaces in headers, different column names, or a file encoding problem.",
        fix: "Download the import template from the Import page and copy your data into it. Make sure headers match exactly: full_name, email, phone. Save as UTF-8 CSV.",
    },
    {
        symptom: "Import says complete but candidates are missing",
        cause: "Rows with errors or duplicates were automatically skipped. The import summary shows a count of skipped rows.",
        fix: "Review the import summary report. Download the error log to see which rows were skipped and why. Fix the issues in your CSV and re-import only the failed rows.",
    },
    {
        symptom: "Candidate details are incomplete after saving",
        cause: "Optional fields were left empty during creation. The save succeeded because only required fields are enforced.",
        fix: "Edit the candidate profile and complete the missing fields. Pay special attention to skills, location, and salary expectations, as these power AI matching.",
    },
    {
        symptom: "Skills tags are not matching to roles",
        cause: "The tags you entered do not match the standardized skill library. Vague or misspelled tags cannot be matched.",
        fix: "Edit the candidate and re-enter skills. Start typing and select from the auto-complete suggestions to ensure you use canonical tag names that the matching engine recognizes.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-route",
        title: "All Core Workflows",
        description: "Browse all step-by-step guides from role creation to placement.",
        accent: "coral",
    },
    {
        href: "/public/documentation/core-workflows/submit-a-candidate",
        icon: "fa-duotone fa-regular fa-paper-plane",
        title: "Submit A Candidate",
        description: "Your candidate is ready. Learn how to submit them to open roles.",
        accent: "teal",
    },
    {
        href: "/public/documentation/core-workflows/create-and-publish-a-role",
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "Create And Publish A Role",
        description: "Need a role to submit candidates to? Start here to create and publish one.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AddOrImportCandidatesMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/add-or-import-candidates")} id="docs-core-workflows-add-or-import-candidates-jsonld" />
            <AddCandidatesAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="add-candidates-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-[5px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[42%] right-[8%] w-12 h-12 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-14 h-14 rotate-12 bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-16 h-6 -rotate-6 border-[4px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[55%] left-[32%] w-7 h-7 rotate-45 bg-warning opacity-0" />
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
                                fill="none" className="stroke-error" strokeWidth="3" strokeLinecap="round" />
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
                                    <li className="text-base-content">Add Or Import Candidates</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Workflow Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Build Your{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">Talent Pool</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-2xl mb-6 opacity-0">
                                HERE IS HOW YOU BUILD YOUR TALENT POOL. Add candidates one at a time or import
                                hundreds from a CSV. Complete profiles, accurate data, zero duplicates. Every
                                submission starts with a candidate record that is worth submitting.
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
                                    Gather these four things before you open the candidate form.
                                    Having them ready means you create a complete, submission-ready profile in one pass.
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
                    MANUAL CREATION STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="steps-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="steps-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Manual Creation
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Add A{" "}
                                    <span className="text-success">Single Candidate</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Seven steps from blank form to a complete, submission-ready candidate profile.
                                    Most users complete this in under five minutes.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {manualSteps.map((step, index) => (
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
                                    Every field on the candidate form. Required fields must be filled to save.
                                    Optional fields improve matching accuracy and submission quality.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {candidateFields.map((item, index) => (
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
                    BULK IMPORT
                   ══════════════════════════════════════════════════════════════ */}
                <section className="import-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="import-heading text-center mb-16 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Bulk Import
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Import{" "}
                                    <span className="text-error">Hundreds At Once</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Migrating from another system or onboarding a large candidate database?
                                    The CSV importer handles it. Four steps from file to fully loaded talent pool.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {importSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="import-card flex gap-6 border-4 border-error/20 bg-base-100 p-6 md:p-8 opacity-0"
                                    >
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center bg-error">
                                            <i className={`${step.icon} text-xl text-error-content`}></i>
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

                            {/* CSV Format Reference */}
                            <div className="import-card mt-8 border-4 border-error/20 bg-base-100 p-6 md:p-8 opacity-0">
                                <h3 className="font-black text-lg uppercase tracking-wide text-base-content mb-4">
                                    <i className="fa-duotone fa-regular fa-table-cells text-error mr-2"></i>
                                    CSV Column Reference
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-base-content/10">
                                                <th className="text-left py-2 pr-4 font-black uppercase tracking-wider text-xs text-base-content/60">Column</th>
                                                <th className="text-left py-2 pr-4 font-black uppercase tracking-wider text-xs text-base-content/60">Required</th>
                                                <th className="text-left py-2 font-black uppercase tracking-wider text-xs text-base-content/60">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-base-content/70">
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">full_name</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-error text-error-content">Yes</span></td>
                                                <td className="py-2">Jane Smith</td>
                                            </tr>
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">email</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-error text-error-content">Yes</span></td>
                                                <td className="py-2">jane@example.com</td>
                                            </tr>
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">phone</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-base-content/10 text-base-content/50">No</span></td>
                                                <td className="py-2">555-123-4567</td>
                                            </tr>
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">location</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-base-content/10 text-base-content/50">No</span></td>
                                                <td className="py-2">Austin, TX</td>
                                            </tr>
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">skills</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-base-content/10 text-base-content/50">No</span></td>
                                                <td className="py-2">React, TypeScript, AWS</td>
                                            </tr>
                                            <tr className="border-b border-base-content/5">
                                                <td className="py-2 pr-4 font-mono text-xs">linkedin_url</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-base-content/10 text-base-content/50">No</span></td>
                                                <td className="py-2">linkedin.com/in/janesmith</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-xs">notes</td>
                                                <td className="py-2 pr-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-base-content/10 text-base-content/50">No</span></td>
                                                <td className="py-2">Referred by John, actively looking</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    VALIDATION & DUPLICATE DETECTION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="validation-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="validation-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-warning text-warning-content">
                                    Data Quality
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Validation And{" "}
                                    <span className="text-warning">Duplicate Detection</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The system validates your data at every entry point. Here is what it checks
                                    and how it keeps your candidate database clean.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {validationRules.map((item, index) => {
                                    const c = colorMap[item.color];
                                    return (
                                        <div
                                            key={index}
                                            className={`validation-card border-4 ${c.border}/20 bg-base-100 p-6 opacity-0`}
                                        >
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 ${c.bg}`}>
                                                <i className={`${item.icon} text-lg text-white`}></i>
                                            </div>
                                            <h3 className="font-black text-base uppercase tracking-wide mb-2 text-base-content">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-base-content/70">
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
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════════ */}
                <section className="practices-section py-20 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="practices-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Best Practices
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Data Quality That{" "}
                                    <span className="text-success">Actually Matters</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    The difference between a candidate who gets submitted and one who sits in
                                    your database forever comes down to profile quality. Follow these six rules.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    PROFILE COMPLETION CHECKLIST
                   ══════════════════════════════════════════════════════════════ */}
                <section className="completion-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="completion-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Completeness
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Profile{" "}
                                    <span className="text-secondary">Completion Checklist</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    A candidate profile is only as good as its data. Use this checklist to
                                    ensure every profile is submission-ready before you move on.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {completionChecklist.map((item, index) => {
                                    const p = priorityColors[item.priority];
                                    return (
                                        <div
                                            key={index}
                                            className="completion-card flex items-start gap-4 border-4 border-base-content/10 bg-base-100 p-5 opacity-0"
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
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════════ */}
                <section className="trouble-section py-20 overflow-hidden bg-base-300">
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
                                    If you hit a wall adding or importing candidates, check here first.
                                    These are the issues we see most often.
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
                    NEXT STEPS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="next-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="next-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Candidates Ready
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What{" "}
                                    <span className="text-success">Comes Next</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Your talent pool is built. Here is where to go from here.
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
            </AddCandidatesAnimator>
        </>
    );
}
