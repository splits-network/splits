import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function CompanyAdminCapabilitiesPage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Company Admin Capabilities"
                description="What company admins can see and manage across organization settings, team access, and billing."
                roles={["Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Roles & Permissions", href: "/public/documentation/roles-and-permissions" },
                    { label: "Company Admin Capabilities" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Company admins manage organization settings, team access, and
                    operational workflows. This page summarizes what is available and
                    where to configure it.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Company Admins</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Company admin role assigned to your account.</div>
                    <div>Organization linked in your profile.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Capabilities</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Manage company settings and team members.</li>
                    <li>Invite hiring managers and recruiters.</li>
                    <li>Review roles, applications, and messaging activity.</li>
                    <li>Manage billing and subscription details.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Company settings"
                        description="Settings page with company profile fields."
                        variant="desktop"
                        filename="docs-company-admin-settings-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Team management"
                        description="Team members list with role assignments."
                        variant="desktop"
                        filename="docs-company-admin-team-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use Team to keep role assignments current.</div>
                    <div>Confirm billing ownership before changing plans.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot access Company Settings.
                        <br />
                        <strong>Likely cause:</strong> You are not assigned as company admin.
                        <br />
                        <strong>Fix:</strong> Ask an existing company admin to update your role.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Team members cannot see roles.
                        <br />
                        <strong>Likely cause:</strong> Their role permissions are limited.
                        <br />
                        <strong>Fix:</strong> Update their role in Team or re-invite them.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/roles-and-permissions/role-based-access"
                        className="link link-hover"
                    >
                        Role-Based Access{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/roles-and-permissions/hiring-manager"
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
                        <strong>Company Admin:</strong> A user with permissions to manage settings, billing, and team access.
                    </div>
                    <div>
                        <strong>Team:</strong> The list of users associated with your organization.
                    </div>
                </div>
            </section>
        </div>
    );
}
