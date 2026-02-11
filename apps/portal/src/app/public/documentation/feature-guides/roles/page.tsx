import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("feature-guides/roles");
export default function RolesGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Roles"
                description="Create, manage, and track role status and ownership."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Roles" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Roles define the hiring objectives, compensation structure, and submission rules that power the rest of the workflow. Keeping role data accurate keeps the pipeline healthy.
                </p>
                <p className="text-base text-base-content/70">
                    This guide details how to navigate the roles list, review role details, and manage status changes. It also explains how role ownership affects who can edit or publish updates.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when you need to manage role data, troubleshoot visibility issues, or review performance trends.
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
                    <div>Access to Roles in the portal.</div>
                    <div>Role details and compensation information.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Role list with status filters.</li>
                    <li>Role detail panel and editing.</li>
                    <li>Role trends and performance charts.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Roles list"
                        description="Roles grid or table view with status chips."
                        variant="desktop"
                        filename="docs-roles-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Role detail"
                        description="Role detail panel showing compensation and requirements."
                        variant="desktop"
                        filename="docs-roles-detail-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use view toggles to switch between grid and table.</div>
                    <div>Keep role status updated to avoid stale submissions.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot edit a role.
                        <br />
                        <strong>Likely cause:</strong> You are not the role owner or admin.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to update permissions.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Role status options are missing.
                        <br />
                        <strong>Likely cause:</strong> The role is locked by another workflow.
                        <br />
                        <strong>Fix:</strong> Contact support or check with the role owner.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/create-and-publish-a-role"
                        className="link link-hover"
                    >
                        Create And Publish A Role{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/feature-guides/applications"
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
                        <strong>Role status:</strong> Active, Paused, Filled, or Closed.
                    </div>
                </div>
            </section>
        </div>
    );
}

