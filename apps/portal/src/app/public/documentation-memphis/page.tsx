import Link from "next/link";
import { JsonLd } from "@splits-network/shared-ui";
import { getDocMetadata, getDocJsonLd } from "../documentation/seo";
import { DocsAnimator } from "./docs-animator";

export const metadata = getDocMetadata("index");

// ─── Section data ────────────────────────────────────────────────────────────

const ACCENT_CYCLE = ["border-coral", "border-teal", "border-yellow", "border-purple"];
const STRIPE_CYCLE = ["bg-coral", "bg-teal", "bg-yellow", "bg-purple"];

const gettingStartedLinks = [
    {
        href: "/public/documentation/getting-started/what-is-splits-network",
        title: "What Is Splits Network",
        description:
            "Purpose, who it is for, and how the platform fits into your hiring workflow.",
        icon: "fa-duotone fa-regular fa-circle-info",
    },
    {
        href: "/public/documentation/getting-started/first-time-setup",
        title: "First-Time Setup",
        description:
            "Account access, organization linking, and onboarding steps.",
        icon: "fa-duotone fa-regular fa-rocket",
    },
    {
        href: "/public/documentation/getting-started/navigation-overview",
        title: "Navigation Overview",
        description:
            "How the sidebar and mobile dock map to your day-to-day tasks.",
        icon: "fa-duotone fa-regular fa-compass",
    },
];

const featureGuideLinks = [
    {
        href: "/public/documentation/feature-guides",
        title: "Feature Guides",
        description:
            "Explore every core feature area in the portal with role-based guidance and troubleshooting.",
        icon: "fa-duotone fa-regular fa-book-open",
    },
    {
        href: "/public/documentation/feature-guides/roles",
        title: "Roles",
        description:
            "Create roles, manage requirements, and control status changes across the pipeline.",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        href: "/public/documentation/feature-guides/applications",
        title: "Applications",
        description:
            "Review submissions, manage stages, and track decision history with notes and documents.",
        icon: "fa-duotone fa-regular fa-file-lines",
    },
    {
        href: "/public/documentation/feature-guides/candidates",
        title: "Candidates",
        description:
            "Maintain candidate profiles, verification status, and sourcing context.",
        icon: "fa-duotone fa-regular fa-users",
    },
    {
        href: "/public/documentation/feature-guides/messages",
        title: "Messages",
        description:
            "Coordinate with recruiters and company teams in one conversation hub.",
        icon: "fa-duotone fa-regular fa-comments",
    },
    {
        href: "/public/documentation/feature-guides/placements",
        title: "Placements",
        description:
            "Track successful hires, fees, and recruiter earnings details.",
        icon: "fa-duotone fa-regular fa-handshake",
    },
    {
        href: "/public/documentation/feature-guides/profile",
        title: "Profile",
        description:
            "Manage personal info, preferences, and visibility settings.",
        icon: "fa-duotone fa-regular fa-user",
    },
    {
        href: "/public/documentation/feature-guides/billing",
        title: "Billing",
        description:
            "Review subscription plans, invoices, and payment methods.",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    {
        href: "/public/documentation/feature-guides/company-settings",
        title: "Company Settings",
        description: "Update organization profile and shared defaults.",
        icon: "fa-duotone fa-regular fa-gear",
    },
    {
        href: "/public/documentation/feature-guides/team-management",
        title: "Team Management",
        description: "Assign roles, manage access, and invite teammates.",
        icon: "fa-duotone fa-regular fa-people-group",
    },
    {
        href: "/public/documentation/feature-guides/notifications",
        title: "Notifications",
        description: "Track alerts, action items, and activity updates.",
        icon: "fa-duotone fa-regular fa-bell",
    },
];

const coreWorkflowLinks = [
    {
        href: "/public/documentation/core-workflows/create-and-publish-a-role",
        title: "Create &amp; Publish A Role",
        description:
            "Set up a role with compensation, requirements, and visibility so recruiters can submit candidates.",
        icon: "fa-duotone fa-regular fa-plus-circle",
    },
    {
        href: "/public/documentation/core-workflows/invite-recruiters-or-teammates",
        title: "Invite Recruiters Or Teammates",
        description:
            "Invite collaborators to your organization and assign the correct permissions.",
        icon: "fa-duotone fa-regular fa-user-plus",
    },
    {
        href: "/public/documentation/core-workflows/submit-a-candidate",
        title: "Submit A Candidate",
        description:
            "Submit a candidate to a role and track the application through review stages.",
        icon: "fa-duotone fa-regular fa-paper-plane",
    },
];

const rolesPermissionLinks = [
    {
        href: "/public/documentation/roles-and-permissions/recruiter",
        title: "Recruiter",
        description:
            "What recruiters can see and do across roles, candidates, applications, and placements.",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    {
        href: "/public/documentation/roles-and-permissions/hiring-manager",
        title: "Hiring Manager",
        description:
            "What hiring managers can see and do while reviewing applications and collaborating with recruiters.",
        icon: "fa-duotone fa-regular fa-clipboard-user",
    },
    {
        href: "/public/documentation/roles-and-permissions/company-admin",
        title: "Company Admin",
        description:
            "What company admins can see and manage across organization settings, team access, and billing.",
        icon: "fa-duotone fa-regular fa-shield-halved",
    },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DocumentationMemphisPage() {
    const docsIndexJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Splits Network Documentation",
        url: "https://splits.network/public/documentation",
        hasPart: [
            "https://splits.network/public/documentation/getting-started",
            "https://splits.network/public/documentation/roles-and-permissions",
            "https://splits.network/public/documentation/core-workflows",
            "https://splits.network/public/documentation/feature-guides",
        ].map((url) => ({
            "@type": "WebPage",
            url,
        })),
    };

    return (
        <DocsAnimator>
            <JsonLd data={getDocJsonLd("index")} id="docs-index-breadcrumbs-jsonld" />
            <JsonLd data={docsIndexJsonLd} id="docs-index-jsonld" />

            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="docs-hero relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[14%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[18%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[28%] right-[32%] w-20 h-8 -rotate-6 border-[3px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[42%] left-[24%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    {/* Triangle */}
                    <div className="memphis-shape absolute top-[16%] left-[46%] opacity-0"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "22px solid transparent",
                            borderRight: "22px solid transparent",
                            borderBottom: "38px solid",
                            borderBottomColor: "oklch(var(--color-yellow))",
                            transform: "rotate(-12deg)",
                        }} />
                    {/* Dots */}
                    <div className="memphis-shape absolute bottom-[18%] right-[44%] opacity-0">
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-teal" />
                            ))}
                        </div>
                    </div>
                    {/* Zigzag */}
                    <svg className="memphis-shape absolute top-[68%] left-[36%] opacity-0" width="90" height="25" viewBox="0 0 90 25">
                        <polyline points="0,20 11,5 22,20 33,5 44,20 55,5 66,20 77,5 90,20"
                            fill="none" className="stroke-purple" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    {/* Plus sign */}
                    <svg className="memphis-shape absolute top-[62%] left-[7%] opacity-0" width="28" height="28" viewBox="0 0 28 28">
                        <line x1="14" y1="3" x2="14" y2="25" className="stroke-yellow" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="3" y1="14" x2="25" y2="14" className="stroke-yellow" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-8 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-book"></i>
                                Knowledge Base
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-white opacity-0">
                            Docu&shy;men&shy;ta&shy;tion
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed text-white/70 max-w-2xl mx-auto opacity-0">
                            Practical guidance for recruiters, hiring managers, and company
                            admins using Splits Network. Start with Getting Started or
                            jump straight to a feature guide.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                GETTING STARTED
               ══════════════════════════════════════════════════════════════ */}
            <section className="getting-started-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="section-heading flex items-center justify-between mb-10 opacity-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-coral">
                                    <i className="fa-duotone fa-regular fa-flag text-white"></i>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-dark">
                                    Getting{" "}
                                    <span className="text-coral">Started</span>
                                </h2>
                            </div>
                            <Link
                                href="/public/documentation/getting-started"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border-4 border-dark text-dark transition-transform hover:-translate-y-0.5"
                            >
                                View all
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {gettingStartedLinks.map((item, index) => (
                                <Link key={index} href={item.href}
                                    className={`doc-card relative border-4 ${ACCENT_CYCLE[index % 4]} bg-white transition-transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer opacity-0`}>
                                    {/* Top color stripe */}
                                    <div className={`h-2 ${STRIPE_CYCLE[index % 4]}`} />

                                    <div className="p-6">
                                        <div className={`w-10 h-10 flex items-center justify-center mb-4 ${STRIPE_CYCLE[index % 4]}`}>
                                            <i className={`${item.icon} text-white text-sm`}></i>
                                        </div>

                                        <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-dark">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-dark/10">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                                                Read guide
                                            </span>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-[10px] text-coral"></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FEATURE GUIDES
               ══════════════════════════════════════════════════════════════ */}
            <section className="feature-guides-section py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="section-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-teal text-dark">
                                Deep Dives
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Feature{" "}
                                <span className="text-teal">Guides</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featureGuideLinks.map((item, index) => (
                                <Link key={index} href={item.href}
                                    className={`doc-card relative border-4 ${ACCENT_CYCLE[index % 4]} bg-cream transition-transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer opacity-0`}>
                                    {/* Top color stripe */}
                                    <div className={`h-2 ${STRIPE_CYCLE[index % 4]}`} />

                                    <div className="p-6">
                                        <div className={`w-10 h-10 flex items-center justify-center mb-4 ${STRIPE_CYCLE[index % 4]}`}>
                                            <i className={`${item.icon} text-sm ${index % 4 === 2 ? "text-dark" : "text-white"}`}></i>
                                        </div>

                                        <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-2 text-dark">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-dark/10">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${["text-coral", "text-teal", "text-yellow", "text-purple"][index % 4]}`}>
                                                Read guide
                                            </span>
                                            <i className={`fa-duotone fa-regular fa-arrow-right text-[10px] ${["text-coral", "text-teal", "text-yellow", "text-purple"][index % 4]}`}></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Integrations - Coming Soon */}
                        <div className="integrations-card mt-8 border-4 border-dark/20 bg-cream p-6 opacity-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center border-4 border-purple">
                                        <i className="fa-duotone fa-regular fa-plug text-purple"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight text-dark">
                                            Integrations
                                        </h3>
                                        <p className="text-sm text-dark/60">
                                            Connect ATS and workflow tools. Documentation is coming soon.
                                        </p>
                                    </div>
                                </div>
                                <span className="px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-purple text-purple">
                                    Coming soon
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CORE WORKFLOWS
               ══════════════════════════════════════════════════════════════ */}
            <section className="workflows-section py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="section-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                                Step By Step
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
                                Core{" "}
                                <span className="text-yellow">Workflows</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {coreWorkflowLinks.map((item, index) => (
                                <Link key={index} href={item.href}
                                    className={`doc-card relative border-4 ${ACCENT_CYCLE[(index + 2) % 4]} bg-white transition-transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer opacity-0`}>
                                    {/* Top color stripe */}
                                    <div className={`h-2 ${STRIPE_CYCLE[(index + 2) % 4]}`} />

                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`w-8 h-8 flex items-center justify-center text-sm font-black ${STRIPE_CYCLE[(index + 2) % 4]} ${(index + 2) % 4 === 2 ? "text-dark" : "text-white"}`}>
                                                {index + 1}
                                            </span>
                                            <div className={`w-10 h-10 flex items-center justify-center border-4 ${ACCENT_CYCLE[(index + 2) % 4]}`}>
                                                <i className={`${item.icon} text-sm ${["text-coral", "text-teal", "text-yellow", "text-purple"][(index + 2) % 4]}`}></i>
                                            </div>
                                        </div>

                                        <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-2 text-dark">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed text-dark/70">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-dark/10">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${["text-coral", "text-teal", "text-yellow", "text-purple"][(index + 2) % 4]}`}>
                                                Follow guide
                                            </span>
                                            <i className={`fa-duotone fa-regular fa-arrow-right text-[10px] ${["text-coral", "text-teal", "text-yellow", "text-purple"][(index + 2) % 4]}`}></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ROLES & PERMISSIONS
               ══════════════════════════════════════════════════════════════ */}
            <section className="permissions-section py-20 overflow-hidden bg-dark">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="section-heading text-center mb-12 opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-purple text-white">
                                Access Control
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                                Roles &amp;{" "}
                                <span className="text-purple">Permissions</span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {rolesPermissionLinks.map((item, index) => (
                                <Link key={index} href={item.href}
                                    className={`doc-card relative border-4 ${ACCENT_CYCLE[(index + 3) % 4]} bg-white/[0.03] transition-transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer opacity-0`}>
                                    {/* Top color stripe */}
                                    <div className={`h-2 ${STRIPE_CYCLE[(index + 3) % 4]}`} />

                                    <div className="p-6">
                                        <div className={`w-12 h-12 flex items-center justify-center mb-4 ${STRIPE_CYCLE[(index + 3) % 4]}`}>
                                            <i className={`${item.icon} text-lg ${(index + 3) % 4 === 2 ? "text-dark" : "text-white"}`}></i>
                                        </div>

                                        <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-white">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed text-white/60">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-white/10">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${["text-coral", "text-teal", "text-yellow", "text-purple"][(index + 3) % 4]}`}>
                                                View capabilities
                                            </span>
                                            <i className={`fa-duotone fa-regular fa-arrow-right text-[10px] ${["text-coral", "text-teal", "text-yellow", "text-purple"][(index + 3) % 4]}`}></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link href="/public/documentation/roles-and-permissions"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border-4 border-purple text-purple transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-shield-halved"></i>
                                Full Permissions Guide
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA — Help & Support
               ══════════════════════════════════════════════════════════════ */}
            <section className="docs-cta py-20 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="cta-content max-w-3xl mx-auto text-center opacity-0">
                        <div className="border-4 border-coral p-8 md:p-12 bg-white relative">
                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-10 h-10 bg-coral" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-coral" />

                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-circle-question mr-2"></i>
                                Need Help?
                            </span>

                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-dark">
                                Can&apos;t Find{" "}
                                <span className="text-coral">What You Need?</span>
                            </h2>

                            <p className="text-base leading-relaxed mb-8 text-dark/70 max-w-xl mx-auto">
                                Our team is ready to help. Reach out with questions about
                                the platform, your account, or anything else.
                            </p>

                            <a href="mailto:help@splits.network"
                                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider border-4 border-dark bg-dark text-yellow transition-transform hover:-translate-y-1">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                help@splits.network
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </DocsAnimator>
    );
}
