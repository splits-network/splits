import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("feature-guides/applications");
export default function ApplicationsGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Applications"
                description="Track candidate submissions, review stages, and decision history."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Applications" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Applications are the operational record of candidate submissions and decisions. They capture stage history, notes, and documents in one place.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains how to interpret the applications list, review detail panels, and understand stage requirements. It also highlights where collaboration and approvals happen.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page to navigate application data, coordinate reviews, or resolve stage-related issues.
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
                    <div>Active role and submitted candidates.</div>
                    <div>Permissions to view applications.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Applications list with stage filters.</li>
                    <li>Application detail timeline.</li>
                    <li>Notes, documents, and feedback actions.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Applications list"
                        description="Applications list with stage and status filters."
                        variant="desktop"
                        filename="docs-applications-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Application detail"
                        description="Application detail view with timeline and actions."
                        variant="desktop"
                        filename="docs-applications-detail-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use notes to track decisions and next steps.</div>
                    <div>Check pre-screen answers before scheduling interviews.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot see application details.
                        <br />
                        <strong>Likely cause:</strong> The application is not assigned to your organization.
                        <br />
                        <strong>Fix:</strong> Confirm the role owner or ask a company admin.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Stage changes are locked.
                        <br />
                        <strong>Likely cause:</strong> Your role does not allow stage transitions.
                        <br />
                        <strong>Fix:</strong> Ask an admin or recruiter to update the stage.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/review-applications-and-move-stages"
                        className="link link-hover"
                    >
                        Review Applications And Move Stages{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/feature-guides/roles"
                        className="link link-hover"
                    >
                        Roles{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Application timeline:</strong> The history of stage changes and actions.
                    </div>
                </div>
            </section>
        </div>
    );
}

