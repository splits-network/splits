import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata("feature-guides/dashboard");
export default function DashboardGuidePage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("feature-guides/dashboard")}
                id="docs-feature-guides-dashboard-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Dashboard"
                    description="Quick view of roles, invitations, and activity based on your role."
                    roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Feature Guides",
                            href: "/documentation/feature-guides",
                        },
                        { label: "Dashboard" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        The dashboard provides a role-based snapshot of your
                        hiring activity. It helps you prioritize work without
                        drilling into every page.
                    </p>
                    <p className="text-base text-base-content/70">
                        This guide explains what the main widgets represent and
                        how they connect to roles, applications, and placements.
                        It also highlights quick actions that save time.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this page to interpret dashboard metrics,
                        troubleshoot missing data, or onboard new users to the
                        portal's overview view.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Who This Is For</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="badge badge-outline">Recruiters</span>
                        <span className="badge badge-outline">
                            Hiring Managers
                        </span>
                        <span className="badge badge-outline">
                            Company Admins
                        </span>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Prerequisites</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>Signed in to the portal.</div>
                        <div>
                            At least one role or application in the system.
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Key Areas</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                        <li>Role and application trends.</li>
                        <li>Recent messages and notifications.</li>
                        <li>Quick actions for common tasks.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Dashboard overview"
                            description="Dashboard widgets and quick action panel."
                            variant="desktop"
                            filename="docs-dashboard-overview-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Dashboard overview"
                            description="Mobile dashboard with quick actions."
                            variant="mobile"
                            filename="docs-dashboard-overview-mobile.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Use widgets to jump directly to high-priority work.
                        </div>
                        <div>
                            Check notifications to stay ahead of pending
                            actions.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> Dashboard shows empty
                            data.
                            <br />
                            <strong>Likely cause:</strong> No roles or
                            applications exist yet.
                            <br />
                            <strong>Fix:</strong> Create a role or submit a
                            candidate to populate metrics.
                        </div>
                        <div>
                            <strong>Symptom:</strong> Widgets seem inaccurate.
                            <br />
                            <strong>Likely cause:</strong> Filters or time
                            ranges are applied.
                            <br />
                            <strong>Fix:</strong> Adjust time period filters or
                            refresh the page.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/feature-guides/roles"
                            className="link link-hover"
                        >
                            Roles{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/feature-guides/applications"
                            className="link link-hover"
                        >
                            Applications{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Reference</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            <strong>Widget:</strong> A dashboard panel that
                            summarizes a specific metric or action.
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
