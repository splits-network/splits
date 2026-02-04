import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function MessagesGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Messages"
                description="Centralized conversations with recruiters and company collaborators."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Messages" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Messages provide a shared space for recruiter and company communication. They keep decisions and timing aligned across teams.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains how to navigate conversations, interpret unread indicators, and connect messages to roles and applications. It also clarifies when to use messages versus notes.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page to manage collaboration, track conversation history, or troubleshoot missing threads.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Recruiters</span>
                    <span className="badge badge-outline">Hiring Managers</span>
                    <span className="badge badge-outline">Company Admins</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Access to Messages in the portal.</div>
                    <div>Active role or application to discuss.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Conversation list with unread indicators.</li>
                    <li>Message detail panel with history.</li>
                    <li>Conversation actions and context links.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Messages inbox"
                        description="Conversation list and message detail view."
                        variant="desktop"
                        filename="docs-messages-inbox-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Messages mobile"
                        description="Mobile message view showing conversation details."
                        variant="mobile"
                        filename="docs-messages-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use messages for time-sensitive updates.</div>
                    <div>Keep key decisions documented in application notes.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> Unread count seems wrong.
                        <br />
                        <strong>Likely cause:</strong> Sync delay or cached view.
                        <br />
                        <strong>Fix:</strong> Refresh the page to update counts.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I cannot find a conversation.
                        <br />
                        <strong>Likely cause:</strong> You are not assigned to the role or application.
                        <br />
                        <strong>Fix:</strong> Ask a teammate to add you or start a new thread.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/notifications"
                        className="link link-hover"
                    >
                        Notifications{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/core-workflows/communicate-with-recruiters-and-candidates"
                        className="link link-hover"
                    >
                        Communicate With Recruiters And Candidates{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Conversation:</strong> A thread of messages tied to a role or application.
                    </div>
                </div>
            </section>
        </div>
    );
}

