import Link from "next/link";
import { JsonLd } from "@splits-network/shared-ui";
import { getDocMetadata, getDocJsonLd } from "./seo";

export const metadata = getDocMetadata("index");
export default function DocumentationIndexPage() {
    const docsIndexJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Splits Network Documentation",
        url: "https://splits.network/documentation",
        hasPart: [
            "https://splits.network/documentation/getting-started",
            "https://splits.network/documentation/roles-and-permissions",
            "https://splits.network/documentation/core-workflows",
            "https://splits.network/documentation/feature-guides",
        ].map((url) => ({
            "@type": "WebPage",
            url,
        })),
    };

    return (
        <>
            <JsonLd
                data={getDocJsonLd("index")}
                id="docs-index-breadcrumbs-jsonld"
            />
            <div className="space-y-10">
                <JsonLd data={docsIndexJsonLd} id="docs-index-jsonld" />
                <section className="space-y-3">
                    <h1 className="text-3xl font-semibold">Documentation</h1>
                    <p className="text-base text-base-content/70 max-w-3xl">
                        Practical guidance for recruiters, hiring managers, and
                        company admins using Splits Network. Start with Getting
                        Started or jump straight to a feature guide.
                    </p>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Getting Started
                        </h2>
                        <Link
                            href="/documentation/getting-started"
                            className="link link-hover text-sm"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/documentation/getting-started/what-is-splits-network"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">
                                    What Is Splits Network
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    Purpose, who it is for, and how the platform
                                    fits into your hiring workflow.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/getting-started/first-time-setup"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">First-Time Setup</h3>
                                <p className="text-sm text-base-content/70">
                                    Account access, organization linking, and
                                    onboarding steps.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/getting-started/navigation-overview"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">
                                    Navigation Overview
                                </h3>
                                <p className="text-sm text-base-content/70">
                                    How the sidebar and mobile dock map to your
                                    day-to-day tasks.
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Feature Guides</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/documentation/feature-guides"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Feature Guides</h3>
                                <p className="text-sm text-base-content/70">
                                    Explore every core feature area in the
                                    portal with role-based guidance and
                                    troubleshooting.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/roles"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Roles</h3>
                                <p className="text-sm text-base-content/70">
                                    Create roles, manage requirements, and
                                    control status changes across the pipeline.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/applications"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Applications</h3>
                                <p className="text-sm text-base-content/70">
                                    Review submissions, manage stages, and track
                                    decision history with notes and documents.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/candidates"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Candidates</h3>
                                <p className="text-sm text-base-content/70">
                                    Maintain candidate profiles, verification
                                    status, and sourcing context.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/messages"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Messages</h3>
                                <p className="text-sm text-base-content/70">
                                    Coordinate with recruiters and company teams
                                    in one conversation hub.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/placements"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Placements</h3>
                                <p className="text-sm text-base-content/70">
                                    Track successful hires, fees, and recruiter
                                    earnings details.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/profile"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Profile</h3>
                                <p className="text-sm text-base-content/70">
                                    Manage personal info, preferences, and
                                    visibility settings.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/billing"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Billing</h3>
                                <p className="text-sm text-base-content/70">
                                    Review subscription plans, invoices, and
                                    payment methods.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/company-settings"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Company Settings</h3>
                                <p className="text-sm text-base-content/70">
                                    Update organization profile and shared
                                    defaults.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/team-management"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Team Management</h3>
                                <p className="text-sm text-base-content/70">
                                    Assign roles, manage access, and invite
                                    teammates.
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/documentation/feature-guides/notifications"
                            className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <h3 className="card-title">Notifications</h3>
                                <p className="text-sm text-base-content/70">
                                    Track alerts, action items, and activity
                                    updates.
                                </p>
                            </div>
                        </Link>
                    </div>
                    <div className="card bg-base-200 border border-base-300 mt-4">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="card-title">Integrations</h3>
                                    <p className="text-sm text-base-content/70">
                                        Connect ATS and workflow tools.
                                        Documentation is coming soon.
                                    </p>
                                </div>
                                <span className="badge badge-outline">
                                    Coming soon
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
