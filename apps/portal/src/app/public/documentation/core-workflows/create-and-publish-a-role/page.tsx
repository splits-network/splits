import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";


export const metadata = getDocMetadata("core-workflows/create-and-publish-a-role");
export default function CreateAndPublishRolePage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/create-and-publish-a-role")} id="docs-core-workflows-create-and-publish-a-role-jsonld" />
            <div className="space-y-10">
            <DocPageHeader
                title="Create And Publish A Role"
                description="Set up a role with compensation, requirements, and visibility so recruiters can submit candidates."
                roles={["Recruiter", "Company Admin", "Hiring Manager"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Core Workflows", href: "/public/documentation/core-workflows" },
                    { label: "Create And Publish A Role" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Creating a role establishes the hiring objective, compensation structure, and expectations for submissions. It is the foundation for every downstream workflow in the platform.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains how to enter role details in a way that supports recruiter alignment and candidate quality. It also clarifies which fields control visibility, fees, and guarantees.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when opening a new role, updating an existing role, or troubleshooting why a role is not visible to recruiters.
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
                    <div>Access to Roles with create permissions.</div>
                    <div>Compensation details and requirements from the hiring team.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Steps</h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Open <strong>Roles</strong> and select <strong>Add Role</strong>.</li>
                    <li>Enter the role title, location, and key requirements.</li>
                    <li>Complete compensation details (salary range, fee percentage, guarantee period).</li>
                    <li>Choose employment type and visibility options.</li>
                    <li>Save the role and confirm it appears as <strong>Active</strong>.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    The role becomes visible to eligible recruiters. Candidates can be
                    submitted, and applications start tracking against the role.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Add role modal"
                        description="Role wizard step showing compensation details."
                        variant="desktop"
                        filename="docs-create-role-compensation-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Role list"
                        description="Roles page showing Active status and actions."
                        variant="desktop"
                        filename="docs-create-role-list-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use clear salary ranges to improve candidate matching.</div>
                    <div>Confirm fee percentage and guarantee period with finance teams.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot create a role.
                        <br />
                        <strong>Likely cause:</strong> Your role lacks permission or no organization is linked.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to grant access or confirm organization setup.
                    </div>
                    <div>
                        <strong>Symptom:</strong> The role is not visible to recruiters.
                        <br />
                        <strong>Likely cause:</strong> The role is paused or missing required fields.
                        <br />
                        <strong>Fix:</strong> Verify status is Active and required fields are complete.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/submit-a-candidate"
                        className="link link-hover"
                    >
                        Submit A Candidate{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/core-workflows/review-applications-and-move-stages"
                        className="link link-hover"
                    >
                        Review Applications And Move Stages{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Guarantee period:</strong> The number of days a placement is covered after hire.
                    </div>
                    <div>
                        <strong>Fee percentage:</strong> The percentage applied to salary to calculate the placement fee.
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
