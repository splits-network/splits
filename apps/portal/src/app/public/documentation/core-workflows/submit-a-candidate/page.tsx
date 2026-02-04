import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function SubmitCandidatePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Submit A Candidate"
                description="Submit a candidate to a role and track the application through review stages."
                roles={["Recruiter"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Core Workflows", href: "/public/documentation/core-workflows" },
                    { label: "Submit A Candidate" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Submitting a candidate creates an application and starts the formal review process. It signals to company teams that a candidate is ready for evaluation.
                </p>
                <p className="text-base text-base-content/70">
                    This guide walks through the submission steps and highlights the information that improves review outcomes, such as notes and salary expectations. It also explains where the application appears after submission.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when you are preparing to move a candidate into the pipeline or troubleshooting submission issues.
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
                    <div>Candidate profile completed.</div>
                    <div>Active role to submit against.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Steps</h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Open the role and select <strong>Submit Candidate</strong>.</li>
                    <li>Choose the candidate from your list.</li>
                    <li>Add notes, salary expectations, or pre-screen answers.</li>
                    <li>Submit and confirm the application appears in Applications.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    The application enters the review pipeline. Status updates and
                    feedback appear in the application timeline.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Submit candidate"
                        description="Submission modal or workflow from a role detail view."
                        variant="desktop"
                        filename="docs-submit-candidate-modal-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Applications list"
                        description="Applications list showing new submission status."
                        variant="desktop"
                        filename="docs-submit-candidate-applications-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Include salary expectations if required by the role.</div>
                    <div>Double-check contact details before submitting.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> The submit button is disabled.
                        <br />
                        <strong>Likely cause:</strong> Required fields or pre-screen answers are missing.
                        <br />
                        <strong>Fix:</strong> Complete required fields and try again.
                    </div>
                    <div>
                        <strong>Symptom:</strong> The application is not visible.
                        <br />
                        <strong>Likely cause:</strong> Filters or view mode hide the record.
                        <br />
                        <strong>Fix:</strong> Clear filters or switch to the list view.
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
                        href="/public/documentation/core-workflows/add-or-import-candidates"
                        className="link link-hover"
                    >
                        Add Or Import Candidates{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Application:</strong> The record created when a candidate is submitted to a role.
                    </div>
                </div>
            </section>
        </div>
    );
}

