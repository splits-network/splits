import { JsonLd } from "@splits-network/shared-ui";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import Link from "next/link";
import { CompanySettingsAnimator } from "./company-settings-animator";

export const metadata = getDocMetadata("feature-guides/company-settings");

export default function CompanySettingsMemphisGuidePage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("feature-guides/company-settings")}
                id="docs-feature-guides-company-settings-jsonld"
            />
            <CompanySettingsAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[40vh] flex items-center bg-dark overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-16 h-16 rounded-full border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[50%] right-[7%] w-10 h-10 bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[22%] w-12 h-12 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[25%] right-[20%] w-8 h-8 rounded-full bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[40%] right-[35%] w-6 h-6 border-4 border-cream/30 opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <nav className="hero-breadcrumb flex items-center gap-2 mb-6 opacity-0">
                                <Link
                                    href="/public/documentation-memphis"
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50 hover:text-coral transition-colors"
                                >
                                    Documentation
                                </Link>
                                <span className="text-cream/30">/</span>
                                <Link
                                    href="/public/documentation-memphis/feature-guides"
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50 hover:text-coral transition-colors"
                                >
                                    Feature Guides
                                </Link>
                                <span className="text-cream/30">/</span>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cream/70">
                                    Company Settings
                                </span>
                            </nav>

                            <h1 className="hero-headline text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-cream opacity-0">
                                HERE'S HOW YOU SET UP YOUR ORG
                            </h1>

                            <p className="hero-description text-lg md:text-xl text-cream/80 mb-8 opacity-0">
                                Company Settings is the control center for your organization. Branding, defaults, workflows, integrations, compliance -- everything that shapes how your team operates on the platform starts here. Get it right once and every role, every recruiter, every hire inherits a clean foundation.
                            </p>

                            <div className="hero-badges flex flex-wrap gap-2 opacity-0">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-coral text-coral">
                                    Company Admins
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-teal text-teal">
                                    Hiring Managers
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    OVERVIEW
                   ══════════════════════════════════════════════════════════ */}
                <section className="overview-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="overview-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark opacity-0">
                            WHY COMPANY SETTINGS MATTER
                        </h2>
                        <div className="overview-content space-y-4 opacity-0">
                            <p className="text-lg text-dark/80">
                                Company Settings define the identity and behavior of your organization across the entire Splits Network platform. Every role you publish, every recruiter who sees your listings, and every candidate who interacts with your brand is shaped by what you configure here.
                            </p>
                            <p className="text-lg text-dark/80">
                                Incomplete or outdated settings create friction. Roles show missing logos. Recruiters see inconsistent company names. Candidates get confused by conflicting information. A well-configured org profile eliminates these problems before they start.
                            </p>
                            <p className="text-lg text-dark/80">
                                <strong className="font-bold">Think of it this way:</strong> Company Settings is the difference between looking like a professional operation and looking like you signed up five minutes ago.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    ORGANIZATION PROFILE
                   ══════════════════════════════════════════════════════════ */}
                <section className="profile-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="profile-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            ORGANIZATION PROFILE
                        </h2>
                        <div className="profile-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                The organization profile is the public face of your company on Splits Network. This information appears on role listings, recruiter dashboards, candidate portals, and marketplace search results.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="profile-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-building mr-2 text-coral" />
                                        COMPANY NAME AND DETAILS
                                    </h3>
                                    <p className="text-dark/70">
                                        Your legal company name, display name, industry, and company size. The display name is what appears across the platform -- keep it clean, recognizable, and consistent with your brand. Industry and size help the AI matching engine connect you with the right recruiters and candidates.
                                    </p>
                                </div>
                                <div className="profile-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-location-dot mr-2 text-teal" />
                                        HEADQUARTERS AND LOCATIONS
                                    </h3>
                                    <p className="text-dark/70">
                                        Set your primary headquarters and any additional office locations. Location data powers geographic search filters, compliance region detection, and recruiter matching. If you're fully remote, set headquarters to your registration address and mark the company as remote-friendly.
                                    </p>
                                </div>
                                <div className="profile-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-globe mr-2 text-yellow" />
                                        WEBSITE AND SOCIAL LINKS
                                    </h3>
                                    <p className="text-dark/70">
                                        Your company website URL, LinkedIn page, and any other public links. These show up on your marketplace profile and role listings. Candidates and recruiters use them to verify your legitimacy. No website? You'll still look fine, but having one builds trust faster.
                                    </p>
                                </div>
                                <div className="profile-card p-6 border-4 border-purple bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-align-left mr-2 text-purple" />
                                        COMPANY DESCRIPTION
                                    </h3>
                                    <p className="text-dark/70">
                                        A clear, concise description of what your company does and why someone would want to work there. This appears on your marketplace profile and gets included in AI-generated role summaries. Write it like you're explaining your company to a candidate in 30 seconds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    BRANDING AND LOGO
                   ══════════════════════════════════════════════════════════ */}
                <section className="branding-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="branding-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            BRANDING AND LOGO
                        </h2>
                        <div className="branding-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Your brand is how recruiters and candidates recognize you at a glance. A missing logo or default avatar makes you look like a test account. A polished brand makes you look like a company worth working with.
                            </p>
                            <div className="space-y-4">
                                <div className="branding-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-image text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            COMPANY LOGO
                                        </h3>
                                        <p className="text-dark/70">
                                            Upload a square logo (minimum 256x256px, PNG or SVG recommended). This appears on role cards, marketplace listings, recruiter dashboards, and email notifications. Use your standard logo mark -- not a wordmark or full brand lockup. It needs to read well at small sizes.
                                        </p>
                                    </div>
                                </div>
                                <div className="branding-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-palette text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            BRAND COLORS
                                        </h3>
                                        <p className="text-dark/70">
                                            Set your primary brand color. This is used as an accent on your marketplace profile and role listings. Pick a color that contrasts well against both light and dark backgrounds. If unsure, stick with your logo's dominant color.
                                        </p>
                                    </div>
                                </div>
                                <div className="branding-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-yellow flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-panorama text-yellow" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            COVER IMAGE
                                        </h3>
                                        <p className="text-dark/70">
                                            An optional banner image for your marketplace profile page. Recommended size: 1200x400px. Use a photo of your office, team, or a branded graphic. This is not required, but it makes your profile page look finished rather than empty.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    DEFAULT ROLE SETTINGS
                   ══════════════════════════════════════════════════════════ */}
                <section className="defaults-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="defaults-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            DEFAULT ROLE SETTINGS
                        </h2>
                        <div className="defaults-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                Default role settings save your team from filling in the same fields every time they create a new role. Set once, inherit everywhere. Individual roles can always override these defaults, but the baseline should reflect your most common hiring pattern.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="defaults-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-percent mr-2 text-coral" />
                                        DEFAULT SPLIT FEE
                                    </h3>
                                    <p className="text-dark/70">
                                        The standard fee percentage offered to recruiters on new roles. This is the split that populates automatically when a hiring manager creates a role. Most companies start at 50/50 and adjust per role based on difficulty. Set it to whatever your team uses most often.
                                    </p>
                                </div>
                                <div className="defaults-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-clock mr-2 text-teal" />
                                        DEFAULT GUARANTEE PERIOD
                                    </h3>
                                    <p className="text-dark/70">
                                        The standard guarantee period (in days) for placements. If a candidate leaves within this window, the placement fee is refundable or replaceable. Industry standard is 90 days. Some companies use 30, 60, or 120 depending on seniority level. Set your default here.
                                    </p>
                                </div>
                                <div className="defaults-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-file-contract mr-2 text-yellow" />
                                        DEFAULT ROLE TYPE
                                    </h3>
                                    <p className="text-dark/70">
                                        Full-time, contract, contract-to-hire, or part-time. This pre-selects the employment type when creating new roles. If 90% of your roles are full-time permanent, set it here and skip the dropdown every time.
                                    </p>
                                </div>
                                <div className="defaults-card p-6 border-4 border-purple bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-eye mr-2 text-purple" />
                                        DEFAULT VISIBILITY
                                    </h3>
                                    <p className="text-dark/70">
                                        Control whether new roles default to marketplace-visible (any recruiter can see and apply) or network-only (only invited recruiters). Marketplace visibility gets more recruiter attention. Network-only gives you more control over who works your roles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    HIRING WORKFLOW DEFAULTS
                   ══════════════════════════════════════════════════════════ */}
                <section className="workflow-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="workflow-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            HIRING WORKFLOW DEFAULTS
                        </h2>
                        <div className="workflow-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Workflows define how candidates move through your hiring process. Setting defaults here means every new role starts with a consistent pipeline. No more reinventing stages every time someone posts a job.
                            </p>
                            <div className="space-y-4">
                                <div className="workflow-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-list-check mr-2 text-coral" />
                                        DEFAULT PIPELINE STAGES
                                    </h3>
                                    <p className="text-dark/70">
                                        Define the standard stages candidates pass through: Applied, Screening, Interview, Offer, Hired. Add custom stages like Technical Assessment, Panel Interview, or Reference Check. These stages pre-populate on every new role. Hiring managers can add or remove stages per role, but the defaults keep things consistent.
                                    </p>
                                </div>
                                <div className="workflow-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-robot mr-2 text-teal" />
                                        AUTO-ACTIONS
                                    </h3>
                                    <p className="text-dark/70">
                                        Configure automatic actions that trigger when candidates move between stages. Send a "thank you for applying" email when a candidate enters Screening. Notify the hiring manager when someone reaches Interview stage. Auto-reject candidates who've been in Applied for more than 14 days with no action. These automations keep your pipeline moving without manual babysitting.
                                    </p>
                                </div>
                                <div className="workflow-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-user-check mr-2 text-yellow" />
                                        APPROVAL REQUIREMENTS
                                    </h3>
                                    <p className="text-dark/70">
                                        Require manager approval before candidates advance past certain stages. Common pattern: anyone can move candidates through Screening and Interview, but Offer stage requires sign-off from a Company Admin. This prevents unauthorized offers while keeping the early pipeline fast.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    INTEGRATIONS
                   ══════════════════════════════════════════════════════════ */}
                <section className="integrations-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="integrations-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            INTEGRATION CONFIGURATION
                        </h2>
                        <div className="integrations-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                Integrations connect Splits Network to the tools your team already uses. Configure them once and data flows automatically between systems. No more copy-pasting between tabs.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="integrations-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-credit-card mr-2 text-coral" />
                                        STRIPE
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Connect your Stripe account for automated billing, subscription management, and recruiter payout processing. Required for marketplace participation and split-fee payments. One-time setup through OAuth.
                                    </p>
                                </div>
                                <div className="integrations-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-envelope mr-2 text-teal" />
                                        EMAIL
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Configure email notification preferences for the organization. Choose between platform-managed email (Resend) or custom SMTP for branded outbound messaging. Set reply-to addresses and email signatures that apply to all automated communications.
                                    </p>
                                </div>
                                <div className="integrations-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-webhook mr-2 text-yellow" />
                                        WEBHOOKS
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Set up outbound webhooks to push events (new applications, stage changes, placements) to external systems. Useful for syncing with your existing ATS, CRM, or internal tools. Each webhook can be filtered by event type.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PRIVACY AND COMPLIANCE
                   ══════════════════════════════════════════════════════════ */}
                <section className="compliance-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="compliance-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            PRIVACY AND COMPLIANCE
                        </h2>
                        <div className="compliance-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Recruiting involves sensitive personal data. Privacy and compliance settings ensure your organization handles candidate information responsibly and meets regulatory requirements. Get this wrong and you're not just losing trust -- you're risking legal exposure.
                            </p>
                            <div className="space-y-4">
                                <div className="compliance-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-shield-check text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            DATA PROCESSING AGREEMENT
                                        </h3>
                                        <p className="text-dark/70">
                                            Review and accept the platform data processing agreement (DPA). This covers how Splits Network processes candidate data on your behalf. Required for GDPR compliance if you operate in or hire from the EU. Available for download and countersigning from this section.
                                        </p>
                                    </div>
                                </div>
                                <div className="compliance-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-clock-rotate-left text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            DATA RETENTION POLICIES
                                        </h3>
                                        <p className="text-dark/70">
                                            Configure how long candidate data is retained after a role is closed or an application is rejected. Options range from 30 days to 24 months. Shorter retention periods reduce compliance risk. Longer periods let you resurface past candidates for future roles. Choose based on your legal team's guidance and local regulations.
                                        </p>
                                    </div>
                                </div>
                                <div className="compliance-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-yellow flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-user-lock text-yellow" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            CANDIDATE CONSENT
                                        </h3>
                                        <p className="text-dark/70">
                                            Enable or configure candidate consent flows. When enabled, candidates must explicitly consent to data processing before their application is visible to your team. Consent records are timestamped and auditable. Required in many jurisdictions and recommended everywhere.
                                        </p>
                                    </div>
                                </div>
                                <div className="compliance-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-purple flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-file-export text-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            DATA EXPORT AND DELETION
                                        </h3>
                                        <p className="text-dark/70">
                                            Handle data subject access requests (DSARs) directly from settings. Export all data associated with a candidate or delete it entirely. The platform generates a complete data package or confirms deletion with an audit trail. Required for GDPR and CCPA compliance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    COMPANY VISIBILITY
                   ══════════════════════════════════════════════════════════ */}
                <section className="visibility-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="visibility-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            COMPANY VISIBILITY SETTINGS
                        </h2>
                        <div className="visibility-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                Control how your organization appears across the Splits Network marketplace. Visibility settings determine who can find you, what they see, and how your roles are presented.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="visibility-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        MARKETPLACE LISTED
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Your company profile and open roles appear in marketplace search results. Any authenticated recruiter can discover your roles and submit candidates. Maximum exposure, maximum recruiter reach. Best for companies actively scaling.
                                    </p>
                                </div>
                                <div className="visibility-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        INVITE ONLY
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Your company appears in the marketplace directory, but roles are only visible to recruiters you specifically invite. Good for companies that want to be discoverable but prefer to curate their recruiter network before sharing opportunities.
                                    </p>
                                </div>
                                <div className="visibility-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        PRIVATE
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Your company does not appear in marketplace search. Only recruiters with a direct link or existing relationship can see your profile and roles. Useful for confidential hiring or stealth-mode companies that aren't ready for public visibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    SHARED TEAM DEFAULTS
                   ══════════════════════════════════════════════════════════ */}
                <section className="team-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="team-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            SHARED DEFAULTS FOR YOUR TEAM
                        </h2>
                        <div className="team-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                When your team grows, consistency matters more. Shared defaults ensure every hiring manager on your team starts from the same playbook. No more rogue role postings with incorrect split fees or missing company info.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="team-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-envelope-open-text mr-2 text-coral" />
                                        EMAIL TEMPLATES
                                    </h3>
                                    <p className="text-dark/70">
                                        Create shared email templates for common communications: candidate rejection, interview scheduling, offer letters, recruiter outreach. Templates use merge fields for candidate name, role title, and company details. Write them once, let your whole team use them.
                                    </p>
                                </div>
                                <div className="team-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-tags mr-2 text-teal" />
                                        STANDARD TAGS AND LABELS
                                    </h3>
                                    <p className="text-dark/70">
                                        Define organization-wide tags for roles, candidates, and applications. Tags like "Urgent," "Executive," "Remote," or "Referral" keep your data organized and searchable. Without standard tags, every hiring manager invents their own system and search becomes chaos.
                                    </p>
                                </div>
                                <div className="team-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-file-lines mr-2 text-yellow" />
                                        ROLE TEMPLATES
                                    </h3>
                                    <p className="text-dark/70">
                                        Save frequently-used role configurations as templates. A "Senior Engineer" template with pre-filled salary ranges, required skills, interview stages, and split fees lets a hiring manager publish a new role in under a minute. Build templates for your most common hiring patterns.
                                    </p>
                                </div>
                                <div className="team-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-sliders mr-2 text-purple" />
                                        NOTIFICATION DEFAULTS
                                    </h3>
                                    <p className="text-dark/70">
                                        Set the default notification preferences for new team members. When a new hiring manager joins your organization, they inherit these notification settings instead of getting hit with every notification type at once. They can customize later, but starting sensible is better than starting overwhelmed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════ */}
                <section className="practices-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="practices-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            DO THIS, NOT THAT
                        </h2>
                        <div className="practices-content space-y-8 opacity-0">
                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            COMPLETE YOUR PROFILE BEFORE PUBLISHING ROLES
                                        </h3>
                                        <p className="text-cream/70">
                                            Roles inherit company branding and defaults from your settings. If your logo is missing and your description is blank, every role you publish looks incomplete. Set up your org profile first, then start posting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            SET DEFAULTS TO YOUR MOST COMMON PATTERN
                                        </h3>
                                        <p className="text-cream/70">
                                            If 80% of your roles are full-time with a 50/50 split and 90-day guarantee, make those the defaults. Your team shouldn't be manually entering the same values on every role. Exceptions can override -- defaults handle the majority.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            REVIEW SETTINGS QUARTERLY
                                        </h3>
                                        <p className="text-cream/70">
                                            Your company grows. Your hiring patterns change. Your compliance requirements evolve. Schedule a quarterly review of Company Settings to make sure everything still reflects reality. Stale settings create stale processes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T GIVE EVERYONE ADMIN ACCESS
                                        </h3>
                                        <p className="text-cream/70">
                                            Company Settings control billing, integrations, and compliance. Limit admin access to people who actually need to change org-level configuration. Hiring managers need role-level permissions, not the keys to the kingdom.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T IGNORE DATA RETENTION SETTINGS
                                        </h3>
                                        <p className="text-cream/70">
                                            Leaving data retention on the longest setting "just in case" means you're holding candidate data longer than you need to. This increases your compliance surface area. Set a retention period that matches your actual re-engagement window and let the system clean up the rest.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════ */}
                <section className="trouble-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="trouble-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            COMMON ISSUES
                        </h2>
                        <div className="trouble-content space-y-6 opacity-0">
                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "I can't access Company Settings"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> You need Company Admin permissions. Hiring Managers have read-only access to some settings but cannot modify org-level configuration. Ask your Company Admin to either grant you admin access or make the changes for you.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "My logo isn't showing on role listings"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> The logo must be at least 256x256px in PNG or SVG format. JPEG works but may show compression artifacts at small sizes. After uploading, allow up to 5 minutes for the CDN cache to propagate. If it still doesn't appear, try a hard refresh or clear your browser cache.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Default settings aren't applying to new roles"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Defaults only apply to roles created after the settings change. Existing roles retain their original values. If a hiring manager is overriding defaults during role creation, those overrides take precedence. Verify the default values saved correctly in Company Settings.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Recruiters can't find our roles in the marketplace"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Your company visibility must be set to "Marketplace Listed" for roles to appear in search results. Individual roles must also have their visibility set to "marketplace" rather than "network-only." Check both the company-level and role-level visibility settings.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Stripe integration won't connect"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> You need Company Admin permissions and a verified Stripe account. The OAuth connection requires pop-ups to be enabled in your browser. If the connection fails mid-flow, start the process again from Company Settings. Do not try to connect from the Stripe dashboard directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    NEXT STEPS
                   ══════════════════════════════════════════════════════════ */}
                <section className="cta-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="cta-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-cream opacity-0">
                            ORG CONFIGURED? NOW GO HIRE.
                        </h2>
                        <p className="cta-description text-lg text-cream/80 mb-8 opacity-0">
                            Your company foundation is set. Time to build your team, post roles, and start filling positions.
                        </p>
                        <div className="cta-buttons flex flex-wrap gap-4 justify-center opacity-0">
                            <Link
                                href="/public/documentation-memphis/feature-guides/roles"
                                className="btn btn-coral btn-md"
                            >
                                Manage Roles
                            </Link>
                            <Link
                                href="/public/documentation-memphis/feature-guides/team-management"
                                className="btn btn-teal btn-md"
                            >
                                Team Management
                            </Link>
                            <Link
                                href="/public/documentation-memphis/roles-and-permissions/company-admin"
                                className="btn btn-yellow btn-md"
                            >
                                Admin Capabilities
                            </Link>
                        </div>
                    </div>
                </section>
            </CompanySettingsAnimator>
        </>
    );
}
