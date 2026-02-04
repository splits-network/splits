import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function CompanySettingsGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Company Settings"
                description="Manage organization profile, settings, and shared preferences."
                roles={["Company Admin", "Hiring Manager"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Company Settings" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Company Settings store the organization profile and shared defaults that appear across roles and applications. Accurate settings help maintain consistent branding and data.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains where to update company information, what fields are used elsewhere in the platform, and how changes affect role listings. It also notes typical permission limits.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when updating company details or troubleshooting why roles show outdated information.
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
                    <div>Company admin or hiring manager access.</div>
                    <div>Organization details to update.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Company name, logo, and profile info.</li>
                    <li>Organization identifiers and defaults.</li>
                    <li>Shared settings affecting roles and workflows.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Company settings"
                        description="Company settings form with profile fields."
                        variant="desktop"
                        filename="docs-company-settings-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Company settings"
                        description="Mobile company settings form."
                        variant="mobile"
                        filename="docs-company-settings-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Keep company branding consistent across roles.</div>
                    <div>Update settings before publishing new roles.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot access Company Settings.
                        <br />
                        <strong>Likely cause:</strong> Your role lacks permissions.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to grant access.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Changes do not appear in roles.
                        <br />
                        <strong>Likely cause:</strong> Data is cached or missing required fields.
                        <br />
                        <strong>Fix:</strong> Refresh the page and confirm required fields are saved.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/team-management"
                        className="link link-hover"
                    >
                        Team Management{" "}
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
                        <strong>Organization profile:</strong> The shared company details visible across the portal.
                    </div>
                </div>
            </section>
        </div>
    );
}

