import Link from "next/link";

export default function DocumentationIndexPage() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <h1 className="text-3xl font-semibold">Documentation</h1>
                <p className="text-base text-base-content/70 max-w-3xl">
                    Practical guidance for recruiters, hiring managers, and company
                    admins using Splits Network. Start with Getting Started or
                    jump straight to a feature guide.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Getting Started</h2>
                    <Link
                        href="/public/documentation/getting-started"
                        className="link link-hover text-sm"
                    >
                        View all
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/public/documentation/getting-started/what-is-splits-network"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">What Is Splits Network</h3>
                            <p className="text-sm text-base-content/70">
                                Purpose, who it is for, and how the platform fits
                                into your hiring workflow.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/public/documentation/getting-started/first-time-setup"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">First-Time Setup</h3>
                            <p className="text-sm text-base-content/70">
                                Account access, organization linking, and onboarding
                                steps.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/public/documentation/getting-started/navigation-overview"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">Navigation Overview</h3>
                            <p className="text-sm text-base-content/70">
                                How the sidebar and mobile dock map to your day-to-day
                                tasks.
                            </p>
                        </div>
                    </Link>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Feature Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/public/documentation/feature-guides"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">Feature Guides</h3>
                            <p className="text-sm text-base-content/70">
                                Explore every core feature area in the portal.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/public/documentation/feature-guides/roles"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">Roles</h3>
                            <p className="text-sm text-base-content/70">
                                Create, manage, and track role status.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/public/documentation/feature-guides/applications"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h3 className="card-title">Applications</h3>
                            <p className="text-sm text-base-content/70">
                                Review applications and stage progress.
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
                                    Connect ATS and workflow tools. Documentation is
                                    coming soon.
                                </p>
                            </div>
                            <span className="badge badge-outline">Coming soon</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

