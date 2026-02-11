import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";

const accessMatrix = [
    {
        area: "Roles",
        recruiter: true,
        hiringManager: true,
        companyAdmin: true,
        notes: "All roles can view Roles; creation may be limited by org rules.",
    },
    {
        area: "Candidates",
        recruiter: true,
        hiringManager: false,
        companyAdmin: false,
        notes: "Recruiters manage candidates; company users view via applications.",
    },
    {
        area: "Applications",
        recruiter: true,
        hiringManager: true,
        companyAdmin: true,
        notes: "All roles can view assigned applications; stage changes vary.",
    },
    {
        area: "Messages",
        recruiter: true,
        hiringManager: true,
        companyAdmin: true,
        notes: "Messaging is shared across recruiter and company users.",
    },
    {
        area: "Placements",
        recruiter: true,
        hiringManager: false,
        companyAdmin: false,
        notes: "Recruiters track earnings; company users typically do not.",
    },
    {
        area: "Company Settings",
        recruiter: false,
        hiringManager: true,
        companyAdmin: true,
        notes: "Company settings are limited to company roles.",
    },
    {
        area: "Team",
        recruiter: false,
        hiringManager: true,
        companyAdmin: true,
        notes: "Team management requires company role permissions.",
    },
    {
        area: "Billing",
        recruiter: true,
        hiringManager: true,
        companyAdmin: true,
        notes: "Billing access is available for authenticated users; scope may vary.",
    },
];


export const metadata = getDocMetadata("roles-and-permissions/role-based-access");
export default function RoleBasedAccessPage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Role-Based Access"
                description="How permissions are determined and why navigation changes based on your role."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Roles & Permissions", href: "/public/documentation/roles-and-permissions" },
                    { label: "Role-Based Access" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Role-based access controls what each user can see and do in the portal. This page explains why navigation changes and how permissions map to workflows.
                </p>
                <p className="text-base text-base-content/70">
                    It provides a practical access matrix so you can quickly identify which role owns a task or page. This reduces confusion when teams collaborate across recruiting and hiring functions.
                </p>
                <p className="text-base text-base-content/70">
                    Use this guide when assigning roles or troubleshooting missing pages to avoid unnecessary delays.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Access Overview</h2>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th className="text-center">Recruiter</th>
                                <th className="text-center">Hiring Manager</th>
                                <th className="text-center">Company Admin</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessMatrix.map((row) => (
                                <tr key={row.area}>
                                    <td className="font-medium">{row.area}</td>
                                    <td className="text-center">
                                        {row.recruiter ? "Yes" : "No"}
                                    </td>
                                    <td className="text-center">
                                        {row.hiringManager ? "Yes" : "No"}
                                    </td>
                                    <td className="text-center">
                                        {row.companyAdmin ? "Yes" : "No"}
                                    </td>
                                    <td className="text-sm text-base-content/70">
                                        {row.notes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Role-based navigation"
                        description="Sidebar showing role-specific sections for a company user."
                        variant="desktop"
                        filename="docs-role-based-nav-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Role-based navigation"
                        description="Mobile dock with limited items based on role."
                        variant="mobile"
                        filename="docs-role-based-nav-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Role changes update the navigation automatically.</div>
                    <div>Ask a company admin to confirm your role if items are missing.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I see fewer pages than a teammate.
                        <br />
                        <strong>Likely cause:</strong> Your role permissions are different.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to review your role assignment.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I should have access but do not.
                        <br />
                        <strong>Likely cause:</strong> You are linked to the wrong organization.
                        <br />
                        <strong>Fix:</strong> Confirm your organization in Profile or contact support.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/roles-and-permissions/recruiter"
                        className="link link-hover"
                    >
                        Recruiter Capabilities{" "}
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
                        <strong>Role-based access:</strong> Permissions assigned to your account that control what pages and actions are available.
                    </div>
                </div>
            </section>
        </div>
    );
}

