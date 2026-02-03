import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function NotificationsGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Notifications"
                description="Track updates, action items, and system alerts."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Notifications" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Notifications highlight new activity and link directly to the
                    relevant work.
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
                    <div>Signed in to the portal.</div>
                    <div>Active roles or applications generating updates.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Notification list with priority indicators.</li>
                    <li>Action links to relevant pages.</li>
                    <li>Read/unread management.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Notifications list"
                        description="Notifications page with action links."
                        variant="desktop"
                        filename="docs-notifications-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Notification detail"
                        description="Notification detail view with action URL."
                        variant="desktop"
                        filename="docs-notifications-detail-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use notification actions to jump directly to pending tasks.</div>
                    <div>Clear old notifications to keep the list focused.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> Notifications are missing.
                        <br />
                        <strong>Likely cause:</strong> Filters or read status hides them.
                        <br />
                        <strong>Fix:</strong> Adjust filters or refresh the page.
                    </div>
                    <div>
                        <strong>Symptom:</strong> A notification link fails.
                        <br />
                        <strong>Likely cause:</strong> The underlying record was removed or permissions changed.
                        <br />
                        <strong>Fix:</strong> Confirm access or contact support.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/messages"
                        className="link link-hover"
                    >
                        Messages{" "}
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
                        <strong>Priority:</strong> The urgency level assigned to a notification.
                    </div>
                </div>
            </section>
        </div>
    );
}
