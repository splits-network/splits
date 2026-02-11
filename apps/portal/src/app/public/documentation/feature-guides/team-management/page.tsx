import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("feature-guides/team-management");
export default function TeamManagementGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Team Management"
                description="Manage team members, roles, and access levels."
                roles={["Company Admin", "Hiring Manager"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Team Management" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Team Management controls who has access to your organization and what they can do. It is where permissions are set and maintained.
                </p>
                <p className="text-base text-base-content/70">
                    This guide describes the team list, role assignments, and common management actions like invites or updates. It helps you avoid misaligned access that can block workflows.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when adding new team members, adjusting roles, or auditing existing permissions.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Company Admins</span>
                    <span className="badge badge-outline">Hiring Managers</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Company admin or hiring manager permissions.</div>
                    <div>Active organization membership.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Team list with roles and status.</li>
                    <li>Role assignment and invite actions.</li>
                    <li>Member management and permissions.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Team management"
                        description="Team list with role assignments."
                        variant="desktop"
                        filename="docs-team-management-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Team management"
                        description="Mobile team list with role badges."
                        variant="mobile"
                        filename="docs-team-management-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Audit team roles quarterly to keep access correct.</div>
                    <div>Use invitations for new team members instead of sharing credentials.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot edit a team member.
                        <br />
                        <strong>Likely cause:</strong> You are not a company admin.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to make the change.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Team list is empty.
                        <br />
                        <strong>Likely cause:</strong> Organization is not linked or data failed to load.
                        <br />
                        <strong>Fix:</strong> Confirm organization settings or refresh.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/company-settings"
                        className="link link-hover"
                    >
                        Company Settings{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/roles-and-permissions/company-admin"
                        className="link link-hover"
                    >
                        Company Admin Capabilities{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Role assignment:</strong> The permission level granted to a user.
                    </div>
                </div>
            </section>
        </div>
    );
}

