import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { IntegrationsAnimator } from "./integrations-animator";

export const metadata = getDocMetadata("integrations");

// ─── Data ────────────────────────────────────────────────────────────────────

const plannedIntegrations = [
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        title: "ATS Platforms",
        description:
            "Sync roles, candidates, and applications with popular applicant tracking systems.",
        accent: "coral",
    },
    {
        icon: "fa-duotone fa-regular fa-calendar-check",
        title: "Calendar & Scheduling",
        description:
            "Automate interview scheduling and availability coordination across teams.",
        accent: "teal",
    },
    {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Email & Messaging",
        description:
            "Connect email providers and messaging tools for unified recruiter communication.",
        accent: "yellow",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-pie",
        title: "Analytics & Reporting",
        description:
            "Push placement and pipeline data to BI tools for custom dashboards and insights.",
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

export default function IntegrationsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("integrations")} id="docs-integrations-jsonld" />
            <IntegrationsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="integrations-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-20 h-20 rounded-full border-[5px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[55%] right-[10%] w-16 h-16 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[16%] left-[20%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[24%] w-14 h-14 rotate-12 bg-secondary opacity-0" />
                        <div className="memphis-shape absolute bottom-[30%] right-[35%] w-20 h-8 -rotate-6 border-[4px] border-error opacity-0" />
                        <svg className="memphis-shape absolute top-[18%] left-[44%] opacity-0" width="40" height="35" viewBox="0 0 50 43">
                            <polygon points="25,0 50,43 0,43" className="fill-warning" transform="rotate(-10 25 21.5)" />
                        </svg>
                        <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="24" height="24" viewBox="0 0 30 30">
                            <line x1="15" y1="3" x2="15" y2="27" className="stroke-success" strokeWidth="4" strokeLinecap="round" />
                            <line x1="3" y1="15" x2="27" y2="15" className="stroke-success" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <ul className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
                                    <li>
                                        <Link
                                            href="/public/documentation-memphis"
                                            className="transition-colors hover:text-base-content"
                                        >
                                            Documentation
                                        </Link>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-chevron-right text-[0.5rem]" />
                                    </li>
                                    <li className="text-base-content/70">Integrations</li>
                                </ul>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-warning text-warning-content">
                                    <i className="fa-duotone fa-regular fa-plug" />
                                    Integrations
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Integrations
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 opacity-0">
                                Integration documentation is coming soon. Check back for
                                setup guides, API references, and troubleshooting for
                                connecting your tools with Splits Network.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    COMING SOON CARD
                   ══════════════════════════════════════════════════════════════ */}
                <section className="integrations-content py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="coming-soon-card relative p-8 md:p-12 border-4 border-warning bg-base-100 opacity-0">
                                <div className="absolute top-0 right-0 w-10 h-10 bg-warning" />

                                <div className="flex items-start gap-6">
                                    <div className="hidden md:flex w-16 h-16 flex-shrink-0 items-center justify-center border-4 border-warning">
                                        <i className="fa-duotone fa-regular fa-plug text-3xl text-warning" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-base-content">
                                                Coming Soon
                                            </h2>
                                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] bg-warning text-warning-content">
                                                In Progress
                                            </span>
                                        </div>
                                        <p className="text-base leading-relaxed text-base-content/70 mb-6">
                                            We are building integration guides for popular ATS
                                            platforms, scheduling tools, email providers, and
                                            analytics pipelines. Documentation will cover setup,
                                            authentication, webhooks, and troubleshooting for each
                                            supported integration.
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-base-content/40">
                                            <i className="fa-duotone fa-regular fa-clock" />
                                            Documentation in development
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PLANNED INTEGRATIONS
                   ══════════════════════════════════════════════════════════════ */}
                <section className="planned-section py-20 overflow-hidden bg-base-200">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="planned-heading text-center mb-12 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-error text-error-content">
                                    Planned
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    What&apos;s{" "}
                                    <span className="text-error">Coming</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {plannedIntegrations.map((item, index) => {
                                    const a = accentStyles[item.accent];
                                    return (
                                        <div
                                            key={index}
                                            className={`planned-card relative p-6 md:p-8 border-4 ${a.border} bg-base-100 opacity-0`}
                                        >
                                            <div className={`absolute top-0 right-0 w-8 h-8 ${a.bg}`} />
                                            <div className={`w-12 h-12 flex items-center justify-center mb-4 border-4 ${a.border}`}>
                                                <i className={`${item.icon} text-xl ${a.text}`} />
                                            </div>
                                            <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-base-content">
                                                {item.title}
                                            </h3>
                                            <p className="text-base leading-relaxed text-base-content/75">
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
                    BACK LINK
                   ══════════════════════════════════════════════════════════════ */}
                <section className="py-16 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="back-link max-w-4xl mx-auto text-center opacity-0">
                            <Link
                                href="/public/documentation-memphis"
                                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-base-content text-base-content transition-transform hover:-translate-y-1"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />
                                Back To Documentation
                            </Link>
                        </div>
                    </div>
                </section>
            </IntegrationsAnimator>
        </>
    );
}
