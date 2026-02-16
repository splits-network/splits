import { JsonLd } from "@splits-network/shared-ui";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import Link from "next/link";
import { RolesAnimator } from "./roles-animator";

export const metadata = getDocMetadata("feature-guides/roles");

export default function RolesMemphisGuidePage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("feature-guides/roles")}
                id="docs-feature-guides-roles-jsonld"
            />
            <RolesAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[40vh] flex items-center bg-dark overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[15%] left-[8%] w-16 h-16 rounded-full border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[60%] right-[10%] w-12 h-12 bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[20%] left-[15%] w-10 h-10 bg-yellow opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <nav className="breadcrumb flex items-center gap-2 mb-6 opacity-0">
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
                                    Roles
                                </span>
                            </nav>

                            <h1 className="hero-headline text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-cream opacity-0">
                                MANAGE ROLES LIKE A PRO
                            </h1>

                            <p className="hero-description text-lg md:text-xl text-cream/80 mb-8 opacity-0">
                                Create, manage, and track roles across your entire hiring pipeline. From draft to filled, here's how you control the hiring process.
                            </p>

                            <div className="hero-badges flex flex-wrap gap-2 opacity-0">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-coral text-coral">
                                    Recruiters
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-teal text-teal">
                                    Hiring Managers
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-yellow text-yellow">
                                    Company Admins
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PURPOSE
                   ══════════════════════════════════════════════════════════ */}
                <section className="content-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="section-headline text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark opacity-0">
                            WHAT ROLES DO
                        </h2>
                        <div className="section-content space-y-4 opacity-0">
                            <p className="text-lg text-dark/80">
                                Roles are the foundation of your hiring workflow. They define what you're hiring for, who can see it, what the compensation looks like, and how submissions flow through your pipeline.
                            </p>
                            <p className="text-lg text-dark/80">
                                Every role has a status (Draft, Open, Closed, Filled) that controls visibility and workflow. Every role has an owner who controls edits and publishing. Every role connects to applications, candidates, and eventually placements.
                            </p>
                            <p className="text-lg text-dark/80">
                                <strong className="font-bold">Bottom line:</strong> Keep your roles clean and your pipeline stays healthy.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    ROLE STATUS PIPELINE
                   ══════════════════════════════════════════════════════════ */}
                <section className="content-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="section-headline text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            THE STATUS PIPELINE
                        </h2>
                        <div className="section-content grid md:grid-cols-2 gap-6 opacity-0">
                            <div className="card-item p-6 border-4 border-coral bg-cream">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                    DRAFT
                                </h3>
                                <p className="text-dark/70">
                                    Work in progress. Not visible to recruiters or the network. Use this to prep roles before launch. Only the owner and admins can see drafts.
                                </p>
                            </div>
                            <div className="card-item p-6 border-4 border-teal bg-cream">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                    OPEN
                                </h3>
                                <p className="text-dark/70">
                                    Live and accepting submissions. Visible to your network based on permissions. This is where the action happens. Most roles spend most of their time here.
                                </p>
                            </div>
                            <div className="card-item p-6 border-4 border-yellow bg-cream">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                    CLOSED
                                </h3>
                                <p className="text-dark/70">
                                    No longer accepting new submissions. Existing applications can still move through stages. Use this when you're reviewing final candidates.
                                </p>
                            </div>
                            <div className="card-item p-6 border-4 border-purple bg-cream">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                    FILLED
                                </h3>
                                <p className="text-dark/70">
                                    Hiring complete. A candidate was hired and a placement was recorded. This role is archived from active lists.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    KEY FEATURES
                   ══════════════════════════════════════════════════════════ */}
                <section className="content-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="section-headline text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            WHAT YOU CAN DO
                        </h2>
                        <div className="section-content space-y-6 opacity-0">
                            <div className="feature-item">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                    <i className="fa-duotone fa-regular fa-plus-circle mr-2 text-coral" />
                                    CREATE ROLES
                                </h3>
                                <p className="text-dark/70 mb-2">
                                    Build new roles with job descriptions, requirements, compensation ranges, and submission rules. Start in Draft, refine, then publish to Open.
                                </p>
                            </div>

                            <div className="feature-item">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                    <i className="fa-duotone fa-regular fa-filter mr-2 text-teal" />
                                    SEARCH AND FILTER
                                </h3>
                                <p className="text-dark/70 mb-2">
                                    Filter by status, owner, department, location, remote policy, and more. Search by title or keywords. Save your filters for quick access.
                                </p>
                            </div>

                            <div className="feature-item">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                    <i className="fa-duotone fa-regular fa-chart-line mr-2 text-yellow" />
                                    TRACK PERFORMANCE
                                </h3>
                                <p className="text-dark/70 mb-2">
                                    See application counts, submission quality, time-to-fill, and conversion rates. Identify bottlenecks and optimize your pipeline.
                                </p>
                            </div>

                            <div className="feature-item">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                    <i className="fa-duotone fa-regular fa-users mr-2 text-purple" />
                                    MANAGE PERMISSIONS
                                </h3>
                                <p className="text-dark/70 mb-2">
                                    Control who sees and submits to each role. Set visibility by network tier, company relationship, or individual recruiter. Assign owners and collaborators.
                                </p>
                            </div>

                            <div className="feature-item">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                    <i className="fa-duotone fa-regular fa-arrows-rotate mr-2 text-coral" />
                                    BULK OPERATIONS
                                </h3>
                                <p className="text-dark/70">
                                    Update status, owner, or visibility for multiple roles at once. Export role data for reporting. Close stale roles in one action.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════ */}
                <section className="content-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="section-headline text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            DO THIS, NOT THAT
                        </h2>
                        <div className="section-content space-y-8 opacity-0">
                            <div className="practice-item">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            WRITE CLEAR JOB DESCRIPTIONS
                                        </h3>
                                        <p className="text-cream/70">
                                            Be specific about requirements, responsibilities, and compensation. Vague roles get low-quality submissions. Clear roles get great candidates.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-item">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            UPDATE STATUS PROMPTLY
                                        </h3>
                                        <p className="text-cream/70">
                                            When you stop accepting submissions, close the role. When you make a hire, mark it filled. Don't leave Open roles abandoned. It wastes recruiter time.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-item">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T DUPLICATE ROLES
                                        </h3>
                                        <p className="text-cream/70">
                                            One role per unique position. If you're hiring multiple people for the same role, increase the headcount field. Don't create 3 separate "Software Engineer" roles.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-item">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T IGNORE STALE ROLES
                                        </h3>
                                        <p className="text-cream/70">
                                            Review your Open roles monthly. Close anything that's been open &gt;90 days without activity. Stale roles hurt your network reputation.
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
                <section className="content-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="section-headline text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            COMMON ISSUES
                        </h2>
                        <div className="section-content space-y-6 opacity-0">
                            <div className="trouble-item p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Recruiters can't see my role"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Role status is Open, visibility settings include the recruiter's network tier, and role isn't restricted to specific recruiters only.
                                </p>
                            </div>

                            <div className="trouble-item p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "I can't edit this role"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> You're either the owner or a Company Admin. Only owners and admins can edit roles. If you need access, ask the current owner to transfer ownership.
                                </p>
                            </div>

                            <div className="trouble-item p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Role won't move to Filled"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Fix:</strong> You can't manually set a role to Filled. You must create a Placement record first. The role auto-fills when a placement is confirmed.
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
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-cream opacity-0">
                            READY TO SHIP?
                        </h2>
                        <p className="text-lg text-cream/80 mb-8 opacity-0">
                            Check out these related guides to complete your workflow.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center opacity-0">
                            <Link
                                href="/public/documentation-memphis/core-workflows/create-and-publish-a-role"
                                className="btn btn-coral btn-md"
                            >
                                Create a Role
                            </Link>
                            <Link
                                href="/public/documentation-memphis/feature-guides/applications"
                                className="btn btn-teal btn-md"
                            >
                                Review Applications
                            </Link>
                            <Link
                                href="/public/documentation-memphis/feature-guides/placements"
                                className="btn btn-yellow btn-md"
                            >
                                Track Placements
                            </Link>
                        </div>
                    </div>
                </section>
            </RolesAnimator>
        </>
    );
}
