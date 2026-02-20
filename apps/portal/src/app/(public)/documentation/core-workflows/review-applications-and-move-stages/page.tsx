import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata(
    "core-workflows/review-applications-and-move-stages",
);
export default function ReviewApplicationsAndMoveStagesPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd(
                    "core-workflows/review-applications-and-move-stages",
                )}
                id="docs-core-workflows-review-applications-and-move-stages-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Review Applications And Move Stages"
                    description="Review applications, add notes, and move candidates through the hiring stages."
                    roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Core Workflows",
                            href: "/documentation/core-workflows",
                        },
                        { label: "Review Applications And Move Stages" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        Applications track the candidate's journey from
                        submission to hire or decline. Stage changes coordinate
                        who needs to act next and what data becomes visible.
                    </p>
                    <p className="text-base text-base-content/70">
                        This guide explains how to review application details,
                        add notes, and move stages responsibly. It also
                        clarifies what information is required before advancing
                        or rejecting.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this page when you are reviewing candidates,
                        coordinating interviews, or documenting decisions.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Who This Is For</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="badge badge-outline">Recruiters</span>
                        <span className="badge badge-outline">
                            Hiring Managers
                        </span>
                        <span className="badge badge-outline">
                            Company Admins
                        </span>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Prerequisites</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Access to Applications and an assigned role or
                            candidate.
                        </div>
                        <div>
                            Required feedback or notes ready for the next stage.
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                        <li>
                            Open <strong>Applications</strong> and select a
                            candidate.
                        </li>
                        <li>
                            Review the application timeline, notes, and
                            documents.
                        </li>
                        <li>Add feedback or upload required documents.</li>
                        <li>
                            Use stage actions to move the candidate forward or
                            decline.
                        </li>
                    </ol>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">What Happens Next</h2>
                    <p className="text-base text-base-content/70">
                        Stage changes update the timeline and notify
                        collaborators. Some stages unlock additional candidate
                        details or actions.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Application detail"
                            description="Application detail view with stage actions and notes."
                            variant="desktop"
                            filename="docs-review-application-detail-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Application timeline"
                            description="Timeline panel showing stage history."
                            variant="desktop"
                            filename="docs-review-application-timeline-desktop.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Use notes to document decisions and next steps.
                        </div>
                        <div>Confirm stage ownership before advancing.</div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> I cannot move a stage.
                            <br />
                            <strong>Likely cause:</strong> Stage actions are
                            restricted or required data is missing.
                            <br />
                            <strong>Fix:</strong> Add required notes or ask an
                            admin to move the stage.
                        </div>
                        <div>
                            <strong>Symptom:</strong> Candidate details are
                            hidden.
                            <br />
                            <strong>Likely cause:</strong> The application has
                            not reached the required stage.
                            <br />
                            <strong>Fix:</strong> Move to the correct review
                            stage or request access.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/core-workflows/mark-a-hire-and-track-placements"
                            className="link link-hover"
                        >
                            Mark A Hire And Track Placements{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/core-workflows/submit-a-candidate"
                            className="link link-hover"
                        >
                            Submit A Candidate{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Reference</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            <strong>Stage:</strong> The step in the application
                            workflow (screen, interview, offer, hired).
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
