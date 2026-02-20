import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata("getting-started/navigation-overview");
export default function NavigationOverviewPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("getting-started/navigation-overview")}
                id="docs-getting-started-navigation-overview-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Navigation Overview"
                    description="Learn how the sidebar and mobile dock map to your daily tasks so you can move between roles, candidates, and applications quickly."
                    roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Getting Started",
                            href: "/documentation/getting-started",
                        },
                        { label: "Navigation Overview" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        The portal navigation is role-aware, so different users
                        see different tools. This page explains the structure of
                        the sidebar and mobile dock so you can find work
                        quickly.
                    </p>
                    <p className="text-base text-base-content/70">
                        You will learn which sections hold core hiring
                        workflows, where settings live, and how to interpret
                        missing or disabled items. This reduces confusion when
                        you move between recruiter and company workflows.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this guide anytime your permissions change or you
                        switch organizations so you can re-orient without losing
                        momentum.
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
                            Assigned to at least one role in your organization.
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                        <li>
                            Use the sidebar to move between Management and
                            Settings.
                        </li>
                        <li>
                            Open Roles to create or manage job opportunities.
                        </li>
                        <li>
                            Open Candidates or Applications to track
                            submissions.
                        </li>
                        <li>
                            Use Messages for recruiter and company
                            conversations.
                        </li>
                        <li>
                            Check Notifications for updates and required
                            actions.
                        </li>
                    </ol>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">What Happens Next</h2>
                    <p className="text-base text-base-content/70">
                        Your navigation updates automatically when your role or
                        organization changes. Some items may appear or disappear
                        based on permissions.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Sidebar navigation"
                            description="Desktop view showing Management and Settings sections."
                            variant="desktop"
                            filename="docs-navigation-sidebar-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Mobile dock navigation"
                            description="Mobile dock with Roles, Candidates, Applications, Messages."
                            variant="mobile"
                            filename="docs-navigation-dock-mobile.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Use view toggles inside list pages to switch
                            layouts.
                        </div>
                        <div>
                            Unread message counts appear next to Messages in the
                            sidebar.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> A menu item is missing.
                            <br />
                            <strong>Likely cause:</strong> Your role does not
                            have access.
                            <br />
                            <strong>Fix:</strong> Ask a company admin to update
                            your permissions.
                        </div>
                        <div>
                            <strong>Symptom:</strong> The page opens but has no
                            data.
                            <br />
                            <strong>Likely cause:</strong> Filters or
                            permissions are limiting results.
                            <br />
                            <strong>Fix:</strong> Clear filters or confirm you
                            belong to the right organization.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/getting-started/first-time-setup"
                            className="link link-hover"
                        >
                            First-Time Setup
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/getting-started/what-is-splits-network"
                            className="link link-hover"
                        >
                            What Is Splits Network
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Reference</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            <strong>Management:</strong> The section that holds
                            Roles, Candidates, Applications, and Messages.
                        </div>
                        <div>
                            <strong>Settings:</strong> The section for Profile,
                            Billing, and Company Settings.
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
