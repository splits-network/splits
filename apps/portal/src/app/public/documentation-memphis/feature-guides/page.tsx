import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { FeatureGuidesAnimator } from "./feature-guides-animator";

// ─── Guide data ──────────────────────────────────────────────────────────────

const guides = [
    {
        title: "Dashboard",
        href: "/public/documentation/feature-guides/dashboard",
        description: "Overview widgets and quick actions.",
        icon: "fa-duotone fa-regular fa-grid-2",
        accent: "coral",
    },
    {
        title: "Roles",
        href: "/public/documentation/feature-guides/roles",
        description: "Create, manage, and track role status.",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "teal",
    },
    {
        title: "Candidates",
        href: "/public/documentation/feature-guides/candidates",
        description: "Manage candidate profiles and sourcing data.",
        icon: "fa-duotone fa-regular fa-user-group",
        accent: "yellow",
    },
    {
        title: "Applications",
        href: "/public/documentation/feature-guides/applications",
        description: "Review applications and stage progress.",
        icon: "fa-duotone fa-regular fa-file-lines",
        accent: "purple",
    },
    {
        title: "Invitations",
        href: "/public/documentation/feature-guides/invitations",
        description: "Invite teammates and track status.",
        icon: "fa-duotone fa-regular fa-envelope-open-text",
        accent: "coral",
    },
    {
        title: "Messages",
        href: "/public/documentation/feature-guides/messages",
        description: "Collaborate in real time.",
        icon: "fa-duotone fa-regular fa-comments",
        accent: "teal",
    },
    {
        title: "Placements",
        href: "/public/documentation/feature-guides/placements",
        description: "Track hires, fees, and earnings.",
        icon: "fa-duotone fa-regular fa-handshake",
        accent: "yellow",
    },
    {
        title: "Profile",
        href: "/public/documentation/feature-guides/profile",
        description: "Update your profile and preferences.",
        icon: "fa-duotone fa-regular fa-id-card",
        accent: "purple",
    },
    {
        title: "Billing",
        href: "/public/documentation/feature-guides/billing",
        description: "Manage subscription and payments.",
        icon: "fa-duotone fa-regular fa-credit-card",
        accent: "coral",
    },
    {
        title: "Company Settings",
        href: "/public/documentation/feature-guides/company-settings",
        description: "Manage organization settings.",
        icon: "fa-duotone fa-regular fa-gear",
        accent: "teal",
    },
    {
        title: "Team Management",
        href: "/public/documentation/feature-guides/team-management",
        description: "Manage team roles and access.",
        icon: "fa-duotone fa-regular fa-users-gear",
        accent: "yellow",
    },
    {
        title: "Notifications",
        href: "/public/documentation/feature-guides/notifications",
        description: "Track updates and actions.",
        icon: "fa-duotone fa-regular fa-bell",
        accent: "purple",
    },
];

// ─── Accent helpers ──────────────────────────────────────────────────────────

const ACCENT_CYCLE = ["border-error", "border-success", "border-warning", "border-secondary"];
const STRIPE_CYCLE = ["bg-error", "bg-success", "bg-warning", "bg-secondary"];
const ICON_TEXT = ["text-error", "text-success", "text-warning", "text-secondary"];
const ICON_BORDER = ["border-error", "border-success", "border-warning", "border-secondary"];

const accentIndex: Record<string, number> = {
    coral: 0,
    teal: 1,
    yellow: 2,
    purple: 3,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = getDocMetadata("feature-guides");

export default function FeatureGuidesMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides")} id="docs-feature-guides-jsonld" />
            <FeatureGuidesAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[6%] w-20 h-20 rounded-full border-[5px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[50%] right-[10%] w-16 h-16 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[14%] left-[18%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[20%] w-14 h-14 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[30%] w-20 h-8 -rotate-6 border-[4px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[40%] left-[28%] w-8 h-8 rotate-45 bg-error opacity-0" />
                        {/* Triangle */}
                        <svg className="memphis-shape absolute top-[18%] left-[42%] opacity-0" width="40" height="35" viewBox="0 0 40 35">
                            <polygon points="20,0 40,35 0,35" className="fill-warning" transform="rotate(-10 20 17.5)" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[42%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[40%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
                                fill="none" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <div className="hero-badge mb-8 opacity-0">
                                <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 mb-6">
                                    <Link href="/public/documentation-memphis" className="transition-colors hover:text-base-content">
                                        Documentation
                                    </Link>
                                    <span>/</span>
                                    <span className="text-base-content">Feature Guides</span>
                                </nav>
                                <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-error text-error-content">
                                    <i className="fa-duotone fa-regular fa-book-open"></i>
                                    Reference Library
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Feature{" "}
                                <span className="relative inline-block">
                                    <span className="text-error">Guides</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-error" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-2xl opacity-0">
                                Feature-specific documentation for every major area of the
                                platform. Pick a guide and dive in.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    GUIDE CARDS GRID
                   ══════════════════════════════════════════════════════════════ */}
                <section className="guides-grid-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {guides.map((guide) => {
                                    const idx = accentIndex[guide.accent];
                                    return (
                                        <Link
                                            key={guide.href}
                                            href={guide.href}
                                            className={`guide-card relative border-4 ${ACCENT_CYCLE[idx]} bg-base-100 transition-transform hover:-translate-y-1 cursor-pointer opacity-0`}
                                        >
                                            {/* Top color stripe */}
                                            <div className={`h-2 ${STRIPE_CYCLE[idx]}`} />

                                            <div className="p-6">
                                                {/* Icon box */}
                                                <div className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${ICON_BORDER[idx]}`}>
                                                    <i className={`${guide.icon} text-xl ${ICON_TEXT[idx]}`}></i>
                                                </div>

                                                <h2 className="font-black text-lg uppercase tracking-tight leading-tight mb-3 text-base-content">
                                                    {guide.title}
                                                </h2>

                                                <p className="text-sm leading-relaxed text-base-content/70">
                                                    {guide.description}
                                                </p>

                                                <div className="mt-4 pt-4 border-t-2 border-base-content/10 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                                                        Feature Guide
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${ICON_TEXT[idx]}`}>
                                                        Read Guide
                                                        <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CTA
                   ══════════════════════════════════════════════════════════════ */}
                <section className="guides-cta relative py-24 overflow-hidden bg-base-300">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[12%] right-[6%] w-16 h-16 rounded-full border-4 border-error" />
                        <div className="absolute bottom-[18%] left-[10%] w-12 h-12 rotate-45 bg-success" />
                        <div className="absolute top-[45%] left-[4%] w-10 h-10 rounded-full bg-warning" />
                        <svg className="absolute bottom-[25%] right-[18%]" width="70" height="25" viewBox="0 0 70 25">
                            <polyline points="0,20 9,5 18,20 27,5 36,20 45,5 54,20 63,5 70,20"
                                fill="none" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center mb-12 opacity-0 max-w-4xl mx-auto">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-error text-error-content">
                                Get Started
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                Ready To{" "}
                                <span className="text-error">Explore</span>?
                            </h2>
                            <p className="text-lg mb-10 text-base-content/70">
                                Whether you are a recruiter, hiring manager, or company admin,
                                there is a guide for your workflow.
                            </p>
                        </div>

                        <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                            {/* Getting Started */}
                            <Link href="/public/documentation/getting-started"
                                className="cta-card p-6 border-4 border-error text-center bg-base-300/50 opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-error">
                                    <i className="fa-duotone fa-regular fa-rocket text-xl text-error-content"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                    Getting Started
                                </h3>
                                <p className="text-xs mb-5 text-base-content/60">
                                    New to the platform? Start here
                                </p>
                                <span className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-error border-error text-error-content">
                                    Begin Setup
                                </span>
                            </Link>

                            {/* Core Workflows */}
                            <Link href="/public/documentation/core-workflows"
                                className="cta-card p-6 border-4 border-warning text-center bg-base-300/50 opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-warning">
                                    <i className="fa-duotone fa-regular fa-diagram-project text-xl text-warning-content"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                    Core Workflows
                                </h3>
                                <p className="text-xs mb-5 text-base-content/60">
                                    Step-by-step task guides
                                </p>
                                <span className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-warning border-warning text-warning-content">
                                    View Workflows
                                </span>
                            </Link>

                            {/* Roles & Permissions */}
                            <Link href="/public/documentation/roles-and-permissions"
                                className="cta-card p-6 border-4 border-success text-center bg-base-300/50 opacity-0">
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-success">
                                    <i className="fa-duotone fa-regular fa-shield-halved text-xl text-success-content"></i>
                                </div>
                                <h3 className="font-black text-base uppercase mb-2 text-base-content">
                                    Roles &amp; Permissions
                                </h3>
                                <p className="text-xs mb-5 text-base-content/60">
                                    Understand access levels
                                </p>
                                <span className="block w-full py-3 font-bold uppercase tracking-wider border-4 text-center text-sm transition-transform hover:-translate-y-1 bg-success border-success text-success-content">
                                    Learn More
                                </span>
                            </Link>
                        </div>

                        <div className="cta-footer text-center opacity-0">
                            <p className="text-sm mb-3 text-base-content/50">
                                Need help with something specific?
                            </p>
                            <a href="mailto:help@splits.network"
                                className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-warning">
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                help@splits.network
                            </a>
                        </div>
                    </div>
                </section>
            </FeatureGuidesAnimator>
        </>
    );
}
