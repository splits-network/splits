import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function HiringManagerCapabilitiesPage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Hiring Manager Capabilities"
                description="What hiring managers can see and do while reviewing applications and collaborating with recruiters."
                roles={["Hiring Manager"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Roles & Permissions", href: "/public/documentation/roles-and-permissions" },
                    { label: "Hiring Manager Capabilities" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Hiring managers focus on reviewing candidates, giving feedback, and
                    keeping roles moving through the pipeline. This page clarifies
                    access points and responsibilities.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Hiring Managers</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Hiring manager role assigned by a company admin.</div>
                    <div>Access to at least one role or hiring team.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Capabilities</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Review applications and candidate details.</li>
                    <li>Provide feedback and move stages when permitted.</li>
                    <li>Communicate with recruiters via Messages.</li>
                    <li>View role status and pipeline activity.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Hiring manager applications"
                        description="Applications list with stage status and filters."
                        variant="desktop"
                        filename="docs-hiring-manager-applications-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Hiring manager applications"
                        description="Mobile applications list with filters or stage chips."
                        variant="mobile"
                        filename="docs-hiring-manager-applications-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use notes to document decisions and next steps.</div>
                    <div>Check Messages for recruiter follow-ups and clarifications.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot move an application stage.
                        <br />
                        <strong>Likely cause:</strong> Stage transitions are restricted to specific roles.
                        <br />
                        <strong>Fix:</strong> Ask a company admin or recruiter to update the stage.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Candidate details are masked.
                        <br />
                        <strong>Likely cause:</strong> The application is not yet accepted for full review.
                        <br />
                        <strong>Fix:</strong> Move the application to the appropriate stage or request access.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/roles-and-permissions/company-admin"
                        className="link link-hover"
                    >
                        Company Admin Capabilities{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/roles-and-permissions/role-based-access"
                        className="link link-hover"
                    >
                        Role-Based Access{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Hiring Manager:</strong> A company user responsible for reviewing candidates and making hiring decisions.
                    </div>
                    <div>
                        <strong>Stage:</strong> The current step of an application in the hiring workflow.
                    </div>
                </div>
            </section>
        </div>
    );
}
