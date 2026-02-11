import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";


export const metadata = getDocMetadata("core-workflows/mark-a-hire-and-track-placements");
export default function MarkHireAndTrackPlacementsPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/mark-a-hire-and-track-placements")} id="docs-core-workflows-mark-a-hire-and-track-placements-jsonld" />
            <div className="space-y-10">
            <DocPageHeader
                title="Mark A Hire And Track Placements"
                description="Finalize a hire and ensure placements capture fee and earnings details."
                roles={["Recruiter", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Core Workflows", href: "/public/documentation/core-workflows" },
                    { label: "Mark A Hire And Track Placements" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Marking a hire closes the application workflow and creates a placement record. This record powers fee calculations, recruiter earnings, and guarantee tracking.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains when to mark a hire, what data is captured, and how the placement appears in reporting. It also clarifies how salary and fee details affect downstream calculations.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when a hire is confirmed and you need to finalize the placement record accurately.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Recruiters</span>
                    <span className="badge badge-outline">Company Admins</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Application has reached the offer stage.</div>
                    <div>Hire details confirmed by the company.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Steps</h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Open the application detail view.</li>
                    <li>Select the action to mark the candidate as <strong>Hired</strong>.</li>
                    <li>Confirm salary and placement details if prompted.</li>
                    <li>Verify the placement appears in <strong>Placements</strong>.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    A placement record is created with fee calculations and recruiter
                    shares. Placement status may continue to track guarantee periods.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Mark hired action"
                        description="Application stage action to mark the candidate as hired."
                        variant="desktop"
                        filename="docs-mark-hire-action-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Placements list"
                        description="Placements list showing new hire details."
                        variant="desktop"
                        filename="docs-mark-hire-placements-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Confirm salary details before marking hired.</div>
                    <div>Use placements to track guarantee timelines.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> The hire action is unavailable.
                        <br />
                        <strong>Likely cause:</strong> The application is not at the required stage.
                        <br />
                        <strong>Fix:</strong> Move the application to Offer before marking hired.
                    </div>
                    <div>
                        <strong>Symptom:</strong> The placement does not appear.
                        <br />
                        <strong>Likely cause:</strong> The action did not complete or data is missing.
                        <br />
                        <strong>Fix:</strong> Refresh the page or contact support.
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
                        href="/public/documentation/roles-and-permissions/recruiter"
                        className="link link-hover"
                    >
                        Recruiter Capabilities{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Placement:</strong> The record created after a hire to track fees and payouts.
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
