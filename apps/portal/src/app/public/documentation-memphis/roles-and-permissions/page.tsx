import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { RolesPermissionsAnimator } from "./roles-permissions-animator";

export const metadata = getDocMetadata("roles-and-permissions");

// ─── Data ────────────────────────────────────────────────────────────────────

const roleCards = [
    {
        href: "/public/documentation/roles-and-permissions/recruiter",
        icon: "fa-duotone fa-regular fa-magnifying-glass-dollar",
        title: "Recruiter Capabilities",
        description:
            "What recruiters can access across roles, candidates, applications, and placements.",
        accent: "coral",
    },
    {
        href: "/public/documentation/roles-and-permissions/hiring-manager",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        title: "Hiring Manager Capabilities",
        description:
            "Review applications, collaborate with recruiters, and manage company workflows.",
        accent: "teal",
    },
    {
        href: "/public/documentation/roles-and-permissions/company-admin",
        icon: "fa-duotone fa-regular fa-building-shield",
        title: "Company Admin Capabilities",
        description:
            "Manage settings, teams, and permissions across the organization.",
        accent: "yellow",
    },
    {
        href: "/public/documentation/roles-and-permissions/role-based-access",
        icon: "fa-duotone fa-regular fa-lock-keyhole",
        title: "Role-Based Access",
        description:
            "How access is determined and why navigation changes by role.",
        accent: "purple",
    },
];

// ─── Accent helpers ──────────────────────────────────────────────────────────

const accentStyles: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    yellow: { bg: "bg-warning", border: "border-warning", text: "text-warning" },
    purple: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RolesAndPermissionsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("roles-and-permissions")} id="docs-roles-and-permissions-jsonld" />
            <RolesPermissionsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="rp-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-20 h-20 rounded-full border-[5px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[45%] right-[10%] w-16 h-16 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[16%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[24%] w-14 h-14 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[34%] w-20 h-8 -rotate-6 border-[4px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[40%] left-[30%] w-8 h-8 rotate-45 bg-error opacity-0" />
                        {/* Triangle */}
                        <svg className="memphis-shape absolute top-[18%] left-[44%] opacity-0" width="44" height="38" viewBox="0 0 44 38">
                            <polygon points="22,0 44,38 0,38" className="fill-warning" transform="rotate(-8 22 19)" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[20%] right-[44%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-success" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[65%] left-[40%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
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
                                    <li className="text-base-content">Roles &amp; Permissions</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-secondary text-secondary-content">
                                    <i className="fa-duotone fa-regular fa-shield-keyhole"></i>
                                    Access Control
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Roles &amp;{" "}
                                <span className="relative inline-block">
                                    <span className="text-secondary">Permissions</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-secondary" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 opacity-0">
                                Understand what each role can see and do in Splits Network,
                                and how permissions affect workflows.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ROLE CARDS — 2x2 Grid
                   ══════════════════════════════════════════════════════════════ */}
                <section className="rp-cards py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="cards-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Choose A Role
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Explore{" "}
                                    <span className="text-error">Capabilities</span>
                                </h2>
                            </div>

                            <div className="cards-grid grid md:grid-cols-2 gap-6">
                                {roleCards.map((card, index) => {
                                    const a = accentStyles[card.accent];
                                    return (
                                        <Link
                                            key={index}
                                            href={card.href}
                                            className={`role-card group relative p-6 md:p-8 border-4 ${a.border} bg-base-100 opacity-0 transition-transform hover:-translate-y-1`}
                                        >
                                            <div className={`absolute top-0 right-0 w-10 h-10 ${a.bg}`} />
                                            <div className={`w-14 h-14 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                                <i className={`${card.icon} text-2xl ${a.text}`}></i>
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-base-content">
                                                {card.title}
                                            </h3>
                                            <p className="text-base leading-relaxed text-base-content/75 mb-4">
                                                {card.description}
                                            </p>
                                            <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] ${a.text}`}>
                                                Read Guide
                                                <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </RolesPermissionsAnimator>
        </>
    );
}
