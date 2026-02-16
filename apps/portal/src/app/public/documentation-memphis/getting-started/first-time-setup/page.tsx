import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { FirstTimeAnimator } from "./first-time-animator";

export const metadata = getDocMetadata("getting-started/first-time-setup");

// ─── Data ────────────────────────────────────────────────────────────────────

const prerequisites = [
    {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Invitation Email",
        description:
            "An invitation from your company admin or recruiting team lead. Check your inbox and spam folder.",
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Organization Name",
        description:
            "The name of the company or recruiting agency you belong to. You will select this during setup.",
    },
    {
        icon: "fa-duotone fa-regular fa-id-badge",
        title: "Your Role",
        description:
            "Know whether you are joining as a Recruiter, Hiring Manager, or Company Admin. This determines your access.",
    },
];

const steps = [
    {
        number: "01",
        title: "Accept Your Invitation",
        description:
            "Open the invitation link from your email. This takes you to the Splits Network sign-up page with your organization pre-selected. If you already have an account, sign in with the same email address that received the invite.",
        tip: "Use the exact email address your organization invited. A different address creates a disconnected account.",
    },
    {
        number: "02",
        title: "Create Your Account",
        description:
            "Fill in your name and set a password, or sign up with Google or Microsoft SSO. Email verification is required before you can proceed. Check your inbox for a verification code and enter it when prompted.",
        tip: "SSO sign-up is fastest. If your company uses Google Workspace or Microsoft 365, use that option.",
    },
    {
        number: "03",
        title: "Link to Your Organization",
        description:
            "After verification, you will be prompted to join your organization. If your invitation included an org link, this happens automatically. Otherwise, search for your organization by name and request access. A company admin must approve your request.",
        tip: "If you cannot find your organization, ask your admin to resend the invitation with the direct org link.",
    },
    {
        number: "04",
        title: "Complete Your Profile",
        description:
            "Fill in the required profile fields: display name, phone number, and professional title. Recruiters should also add their specializations and preferred industries. This information appears on your public profile within the network.",
        tip: "You can update your profile later, but completing it now unlocks all platform features immediately.",
    },
    {
        number: "05",
        title: "Walk Through Onboarding",
        description:
            "The onboarding wizard walks you through key platform features based on your role. Recruiters see how to find roles and submit candidates. Hiring managers learn to review applications. Admins get an overview of settings and team management.",
        tip: "Do not skip onboarding. The wizard will keep reopening until all required steps are completed.",
    },
    {
        number: "06",
        title: "Verify Your Dashboard",
        description:
            "After onboarding, your Dashboard loads with role-specific widgets and navigation. Confirm you can see your organization name in the sidebar, your role badge in the header, and that the Roles and Candidates pages load without errors.",
        tip: "If your sidebar is empty or shows an error, your organization link may be incomplete. Contact your admin.",
    },
];

const configItems = [
    {
        icon: "fa-duotone fa-regular fa-bell",
        title: "Notification Preferences",
        description:
            "Choose which events trigger email notifications: new applications, stage changes, messages, and placement updates. Find this under Profile > Notifications.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-check",
        title: "Role Assignment",
        description:
            "Your role determines what you see and can do. Recruiters access roles and candidates. Hiring managers review applications. Admins manage everything. Role changes require a company admin.",
    },
    {
        icon: "fa-duotone fa-regular fa-palette",
        title: "Display Settings",
        description:
            "Set your preferred theme, timezone, and date format. These preferences persist across devices and sessions. Find this under Profile > Preferences.",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Team Visibility",
        description:
            "Admins can configure which team members recruiters can see and contact. This affects the recruiter directory and messaging availability. Find this under Company Settings > Team.",
    },
];

const troubleshootItems = [
    {
        symptom: "Cannot access the portal after sign-in",
        cause: "Your invitation is missing, expired, or you signed in with a different email.",
        fix: "Ask a company admin to resend the invite to the email address you used to sign up. Check that you are signing in with the correct email.",
    },
    {
        symptom: "Organization name does not appear",
        cause: "Your account is not linked to an organization, or the link request is pending admin approval.",
        fix: "Contact your company admin to confirm your membership. They can link you directly from Company Settings > Team.",
    },
    {
        symptom: "Onboarding wizard keeps reopening",
        cause: "One or more required fields were left blank, or a required step was skipped.",
        fix: "Complete every field marked with an asterisk. Save each step before moving to the next. The wizard tracks completion server-side.",
    },
    {
        symptom: "Sidebar navigation is missing items",
        cause: "Your role does not have access to those sections, or your role assignment is incomplete.",
        fix: "Check your role badge in the header. If it says 'Pending', ask your admin to finalize your role assignment.",
    },
    {
        symptom: "Dashboard shows no data",
        cause: "Your organization has no roles, candidates, or applications yet. The dashboard reflects live data.",
        fix: "This is expected for brand-new organizations. Create your first role or invite recruiters to start generating activity.",
    },
];

const nextSteps = [
    {
        href: "/public/documentation-memphis/getting-started",
        icon: "fa-duotone fa-regular fa-compass",
        title: "Navigation Overview",
        description: "Learn how the sidebar and mobile dock map to your daily tasks.",
        accent: "teal",
    },
    {
        href: "/public/documentation-memphis/core-workflows",
        icon: "fa-duotone fa-regular fa-route",
        title: "Core Workflows",
        description: "Step-by-step guides for creating roles, submitting candidates, and more.",
        accent: "coral",
    },
    {
        href: "/public/documentation-memphis/roles-and-permissions",
        icon: "fa-duotone fa-regular fa-shield-keyhole",
        title: "Roles & Permissions",
        description: "Understand what each role can see and do across the platform.",
        accent: "purple",
    },
];

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FirstTimeSetupMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("getting-started/first-time-setup")} id="docs-first-time-setup-jsonld" />
            <FirstTimeAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="fts-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[7%] w-18 h-18 rounded-full border-[5px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[48%] right-[11%] w-14 h-14 rounded-full bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[22%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[20%] right-[28%] w-12 h-12 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[38%] w-18 h-7 -rotate-6 border-[4px] border-success opacity-0" />
                        <div className="memphis-shape absolute top-[42%] left-[32%] w-7 h-7 rotate-45 bg-success opacity-0" />
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[22%] right-[48%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[42%] opacity-0" width="72" height="20" viewBox="0 0 72 20">
                            <polyline points="0,16 9,4 18,16 27,4 36,16 45,4 54,16 63,4 72,16"
                                fill="none" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
                                    <li>
                                        <Link href="/public/documentation" className="transition-colors hover:text-base-content">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li>
                                        <Link href="/public/documentation-memphis/getting-started" className="transition-colors hover:text-base-content">
                                            Getting Started
                                        </Link>
                                    </li>
                                    <li><i className="fa-solid fa-chevron-right text-[0.5rem]"></i></li>
                                    <li className="text-base-content">First-Time Setup</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-gear"></i>
                                    Setup Guide
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                First-Time{" "}
                                <span className="relative inline-block">
                                    <span className="text-success">Setup</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-success" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-2xl mb-6 opacity-0">
                                HERE IS HOW TO GET STARTED. Get access, connect to your organization,
                                and complete onboarding so you can start working on roles and candidates
                                within minutes.
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    Step By Step
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    The{" "}
                                    <span className="text-success">Setup</span>{" "}
                                    Process
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Follow these six steps in order. Most users complete setup in under five minutes.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, index) => (
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
                    INITIAL CONFIGURATION
                   ══════════════════════════════════════════════════════════════ */}
                <section className="config-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="config-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-secondary text-secondary-content">
                                    Configuration
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Initial{" "}
                                    <span className="text-secondary">Settings</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    These settings are optional but recommended. Configure them now to avoid surprises later.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {configItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="config-card border-4 border-secondary/20 bg-base-100 p-6 opacity-0"
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
                                    Common{" "}
                                    <span className="text-error">Issues</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    If something goes wrong during setup, check here first.
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
                                    You Are Ready
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What{" "}
                                    <span className="text-success">Comes Next</span>
                                </h2>
                                <p className="mt-4 text-base text-base-content/60 max-w-2xl mx-auto">
                                    Setup is done. Pick where you want to go from here.
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
            </FirstTimeAnimator>
        </>
    );
}
