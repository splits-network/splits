import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../../documentation/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { WorkflowsAnimator } from "./workflows-animator";

// ─── Data ────────────────────────────────────────────────────────────────────

const workflows = [
    {
        number: "01",
        title: "Create And Publish A Role",
        href: "/public/documentation/core-workflows/create-and-publish-a-role",
        description:
            "Define compensation, requirements, and publish the role.",
        icon: "fa-duotone fa-regular fa-briefcase",
        accent: "coral",
    },
    {
        number: "02",
        title: "Invite Recruiters Or Teammates",
        href: "/public/documentation/core-workflows/invite-recruiters-or-teammates",
        description:
            "Add collaborators and control access from the Team or Invitations pages.",
        icon: "fa-duotone fa-regular fa-user-plus",
        accent: "teal",
    },
    {
        number: "03",
        title: "Add Or Import Candidates",
        href: "/public/documentation/core-workflows/add-or-import-candidates",
        description:
            "Create candidate profiles and manage sourcing details.",
        icon: "fa-duotone fa-regular fa-users",
        accent: "yellow",
    },
    {
        number: "04",
        title: "Submit A Candidate",
        href: "/public/documentation/core-workflows/submit-a-candidate",
        description:
            "Submit candidates to roles and track submissions.",
        icon: "fa-duotone fa-regular fa-paper-plane",
        accent: "coral",
    },
    {
        number: "05",
        title: "Review Applications And Move Stages",
        href: "/public/documentation/core-workflows/review-applications-and-move-stages",
        description:
            "Review applications, add notes, and move stages forward.",
        icon: "fa-duotone fa-regular fa-clipboard-check",
        accent: "teal",
    },
    {
        number: "06",
        title: "Mark A Hire And Track Placements",
        href: "/public/documentation/core-workflows/mark-a-hire-and-track-placements",
        description:
            "Finalize hires and confirm placement tracking.",
        icon: "fa-duotone fa-regular fa-trophy",
        accent: "yellow",
    },
    {
        number: "07",
        title: "Communicate With Recruiters And Candidates",
        href: "/public/documentation/core-workflows/communicate-with-recruiters-and-candidates",
        description:
            "Use Messages and Notifications for collaboration.",
        icon: "fa-duotone fa-regular fa-comments",
        accent: "coral",
    },
];

// ─── Accent helpers ──────────────────────────────────────────────────────────

const accentStyles: Record<string, { bg: string; border: string; text: string }> = {
    coral: { bg: "bg-error", border: "border-error", text: "text-error" },
    teal: { bg: "bg-success", border: "border-success", text: "text-success" },
    yellow: { bg: "bg-warning", border: "border-warning", text: "text-warning" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = getDocMetadata("core-workflows");

export default function CoreWorkflowsMemphisPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows")} id="docs-core-workflows-jsonld" />
            <WorkflowsAnimator>
                {/* ══════════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════════ */}
                <section className="workflows-hero relative min-h-[50vh] overflow-hidden flex items-center bg-base-300">
                    {/* Memphis decorations */}
                    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-[5px] border-error opacity-0" />
                        <div className="memphis-shape absolute top-[50%] right-[8%] w-16 h-16 rounded-full bg-success opacity-0" />
                        <div className="memphis-shape absolute bottom-[14%] left-[18%] w-10 h-10 rounded-full bg-warning opacity-0" />
                        <div className="memphis-shape absolute top-[22%] right-[20%] w-14 h-14 rotate-12 bg-error opacity-0" />
                        <div className="memphis-shape absolute bottom-[28%] right-[32%] w-20 h-8 -rotate-6 border-[4px] border-warning opacity-0" />
                        <div className="memphis-shape absolute top-[38%] left-[30%] w-8 h-8 rotate-45 bg-success opacity-0" />
                        {/* Triangle */}
                        <svg className="memphis-shape absolute top-[16%] left-[42%] opacity-0" width="40" height="35" viewBox="0 0 40 35">
                            <polygon points="20,0 40,35 0,35" className="fill-warning" transform="rotate(-10 20 17.5)" />
                        </svg>
                        {/* Dots */}
                        <div className="memphis-shape absolute bottom-[18%] right-[42%] opacity-0">
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-error" />
                                ))}
                            </div>
                        </div>
                        {/* Zigzag */}
                        <svg className="memphis-shape absolute top-[68%] left-[38%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                            <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20"
                                fill="none" className="stroke-success" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-16">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="hero-breadcrumb mb-8 opacity-0">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
                                    <Link href="/public/documentation-memphis" className="text-base-content/50 transition-colors hover:text-error">
                                        Documentation
                                    </Link>
                                    <span className="text-base-content/30">/</span>
                                    <span className="text-error">Core Workflows</span>
                                </div>
                            </nav>

                            {/* Badge */}
                            <div className="hero-badge mb-8 opacity-0">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-error text-error-content">
                                    <i className="fa-duotone fa-regular fa-route"></i>
                                    Step-By-Step Guides
                                </span>
                            </div>

                            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-base-content opacity-0">
                                Core{" "}
                                <span className="relative inline-block">
                                    <span className="text-error">Workflows</span>
                                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-error" />
                                </span>
                            </h1>

                            <p className="hero-subtext text-lg md:text-xl leading-relaxed text-base-content/70 max-w-3xl opacity-0">
                                Step-by-step guides for the most common tasks across Splits
                                Network. Follow each workflow from start to finish.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    WORKFLOW CARDS — 2-Column Grid
                   ══════════════════════════════════════════════════════════════ */}
                <section className="workflows-grid-section py-20 overflow-hidden bg-base-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid-heading text-center mb-14 opacity-0">
                                <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-success text-success-content">
                                    7 Workflows
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-base-content">
                                    Pick A{" "}
                                    <span className="text-success">Workflow</span>
                                </h2>
                            </div>

                            <div className="workflows-grid grid md:grid-cols-2 gap-6">
                                {workflows.map((workflow) => {
                                    const a = accentStyles[workflow.accent];
                                    return (
                                        <Link
                                            key={workflow.href}
                                            href={workflow.href}
                                            className={`workflow-card group relative p-6 md:p-8 border-4 ${a.border} bg-base-100 transition-transform hover:-translate-y-1 opacity-0`}
                                        >
                                            {/* Corner accent block */}
                                            <div className={`absolute top-0 right-0 w-10 h-10 ${a.bg}`} />

                                            <div className="flex items-start gap-5">
                                                {/* Step number */}
                                                <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center border-4 ${a.border} ${a.bg}`}>
                                                    <span className="text-2xl font-black text-base-100">
                                                        {workflow.number}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <i className={`${workflow.icon} text-lg ${a.text}`}></i>
                                                        <h3 className="font-black text-base uppercase tracking-wide text-base-content">
                                                            {workflow.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-base-content/70">
                                                        {workflow.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Arrow indicator */}
                                            <div className={`absolute bottom-4 right-4 ${a.text} transition-transform group-hover:translate-x-1`}>
                                                <i className="fa-duotone fa-regular fa-arrow-right text-sm"></i>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    PULL QUOTE
                   ══════════════════════════════════════════════════════════════ */}
                <section className="py-16 overflow-hidden bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-warning opacity-0">
                            <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-warning">
                                &ldquo;
                            </div>
                            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-base-content">
                                The fastest way to learn a platform is to walk through
                                a real workflow. These seven guides cover everything
                                from your first role to your first placement.
                            </p>
                            <div className="mt-6 pt-4 border-t-[3px] border-warning">
                                <span className="text-sm font-bold uppercase tracking-wider text-warning">
                                    -- Splits Network Documentation
                                </span>
                            </div>
                            <div className="absolute top-0 right-0 w-10 h-10 bg-warning" />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    CTA — Back to docs
                   ══════════════════════════════════════════════════════════════ */}
                <section className="workflows-cta relative py-20 overflow-hidden bg-base-100">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[12%] right-[6%] w-14 h-14 rounded-full border-4 border-error" />
                        <div className="absolute bottom-[18%] left-[10%] w-10 h-10 rotate-45 bg-success" />
                        <div className="absolute top-[45%] left-[4%] w-8 h-8 rounded-full bg-warning" />
                        <svg className="absolute bottom-[25%] right-[18%]" width="60" height="20" viewBox="0 0 60 20">
                            <polyline points="0,16 8,4 16,16 24,4 32,16 40,4 48,16 56,4 60,16"
                                fill="none" className="stroke-error" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                            <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-6 bg-success text-success-content">
                                Explore More
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-[1] text-base-content">
                                Need More{" "}
                                <span className="text-success">Detail?</span>
                            </h2>
                            <p className="text-lg mb-10 text-base-content/70">
                                Check out our Getting Started guide for platform basics,
                                or dive into Feature Guides for in-depth documentation
                                on every area of the platform.
                            </p>

                            <div className="cta-buttons flex flex-wrap items-center justify-center gap-4 opacity-0">
                                <Link
                                    href="/public/documentation-memphis"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-error bg-error text-error-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    All Documentation
                                </Link>
                                <Link
                                    href="/public/documentation/getting-started"
                                    className="inline-flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-wider border-4 border-base-content text-base-content transition-transform hover:-translate-y-1"
                                >
                                    <i className="fa-duotone fa-regular fa-rocket"></i>
                                    Getting Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </WorkflowsAnimator>
        </>
    );
}
