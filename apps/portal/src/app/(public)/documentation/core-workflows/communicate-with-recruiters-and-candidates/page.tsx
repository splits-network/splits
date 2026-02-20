import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata(
    "core-workflows/communicate-with-recruiters-and-candidates",
);
export default function CommunicateWithRecruitersAndCandidatesPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd(
                    "core-workflows/communicate-with-recruiters-and-candidates",
                )}
                id="docs-core-workflows-communicate-with-recruiters-and-candidates-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Communicate With Recruiters And Candidates"
                    description="Use Messages and Notifications to coordinate feedback, updates, and next steps."
                    roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Core Workflows",
                            href: "/documentation/core-workflows",
                        },
                        { label: "Communicate With Recruiters And Candidates" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        Communication keeps recruiting and hiring teams aligned
                        on timing, feedback, and decisions. Messages and
                        notifications are the primary tools for that
                        coordination.
                    </p>
                    <p className="text-base text-base-content/70">
                        This guide clarifies when to use messages versus notes,
                        where to find conversation history, and how
                        notifications link to actions. It helps reduce missed
                        updates and duplicated effort.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this workflow when coordinating interviews,
                        feedback, or changes to role requirements.
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
                        <div>Access to Messages and Notifications.</div>
                        <div>Active roles or applications to discuss.</div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                        <li>
                            Open <strong>Messages</strong> from the sidebar.
                        </li>
                        <li>
                            Select a conversation or start a new one if
                            available.
                        </li>
                        <li>
                            Share updates, questions, or next steps with
                            collaborators.
                        </li>
                        <li>Use notifications to track required actions.</li>
                    </ol>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">What Happens Next</h2>
                    <p className="text-base text-base-content/70">
                        Messages update in real time and unread counts appear in
                        the sidebar. Notifications can link directly to the item
                        that needs attention.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Messages inbox"
                            description="Messages view showing conversation list and detail panel."
                            variant="desktop"
                            filename="docs-messages-inbox-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Notifications"
                            description="Notification panel with unread items and actions."
                            variant="desktop"
                            filename="docs-notifications-panel-desktop.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Keep key decisions documented in application notes.
                        </div>
                        <div>
                            Use messages for coordination and timing updates.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> Messages are not updating.
                            <br />
                            <strong>Likely cause:</strong> Connection or refresh
                            issue.
                            <br />
                            <strong>Fix:</strong> Refresh the page and check
                            unread counts.
                        </div>
                        <div>
                            <strong>Symptom:</strong> I do not see a
                            conversation.
                            <br />
                            <strong>Likely cause:</strong> You are not added to
                            that application or role.
                            <br />
                            <strong>Fix:</strong> Ask a teammate to add you or
                            share access.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/core-workflows/review-applications-and-move-stages"
                            className="link link-hover"
                        >
                            Review Applications And Move Stages{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/roles-and-permissions/hiring-manager"
                            className="link link-hover"
                        >
                            Hiring Manager Capabilities{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Reference</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            <strong>Notification:</strong> An in-app alert that
                            links to an action or update.
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
