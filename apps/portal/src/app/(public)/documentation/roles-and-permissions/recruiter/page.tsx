import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata("roles-and-permissions/recruiter");
export default function RecruiterCapabilitiesPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("roles-and-permissions/recruiter")}
                id="docs-roles-and-permissions-recruiter-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Recruiter Capabilities"
                    description="What recruiters can see and do across roles, candidates, applications, and placements."
                    roles={["Recruiter"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Roles & Permissions",
                            href: "/documentation/roles-and-permissions",
                        },
                        { label: "Recruiter Capabilities" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        Recruiters drive sourcing and submissions, so their view
                        of the platform centers on candidates, roles, and
                        applications. This page outlines what recruiters can
                        access and why.
                    </p>
                    <p className="text-base text-base-content/70">
                        It clarifies which pages are available, what actions are
                        expected, and how recruiter work connects to company
                        review stages. If you are onboarding new recruiters,
                        this is the best reference to set expectations.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this guide to confirm permissions, understand
                        limitations, and avoid workflow gaps when collaborating
                        with company teams.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Who This Is For</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="badge badge-outline">Recruiters</span>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Prerequisites</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>Recruiter role assigned in your organization.</div>
                        <div>Access to at least one active role.</div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Key Capabilities</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                        <li>Browse and manage roles.</li>
                        <li>Add and manage candidates.</li>
                        <li>Submit candidates and track applications.</li>
                        <li>Collaborate via Messages.</li>
                        <li>View placements and earnings (if applicable).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Recruiter dashboard"
                            description="Dashboard widgets showing roles, invitations, and recent activity."
                            variant="desktop"
                            filename="docs-recruiter-dashboard-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Recruiter dashboard"
                            description="Mobile dashboard with dock navigation visible."
                            variant="mobile"
                            filename="docs-recruiter-dashboard-mobile.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Use the Roles page to track ownership and status
                            changes.
                        </div>
                        <div>
                            Keep application notes updated for transparent
                            handoffs.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> I cannot see Candidates.
                            <br />
                            <strong>Likely cause:</strong> Candidate access is
                            restricted for your role or organization.
                            <br />
                            <strong>Fix:</strong> Ask a company admin to confirm
                            recruiter permissions.
                        </div>
                        <div>
                            <strong>Symptom:</strong> I cannot submit a
                            candidate.
                            <br />
                            <strong>Likely cause:</strong> The role is paused or
                            closed.
                            <br />
                            <strong>Fix:</strong> Confirm role status in Roles
                            or contact the role owner.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/roles-and-permissions/role-based-access"
                            className="link link-hover"
                        >
                            Role-Based Access{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/roles-and-permissions/company-admin"
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
                            <strong>Recruiter:</strong> A user who sources and
                            submits candidates to roles.
                        </div>
                        <div>
                            <strong>Placement:</strong> A successful hire
                            tracked for fee and earnings.
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
