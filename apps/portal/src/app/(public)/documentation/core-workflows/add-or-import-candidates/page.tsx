import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata(
    "core-workflows/add-or-import-candidates",
);
export default function AddOrImportCandidatesPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("core-workflows/add-or-import-candidates")}
                id="docs-core-workflows-add-or-import-candidates-jsonld"
            />
            <div className="space-y-10">
                <DocPageHeader
                    title="Add Or Import Candidates"
                    description="Create candidate profiles and capture sourcing details so submissions stay organized."
                    roles={["Recruiter"]}
                    breadcrumbs={[
                        { label: "Documentation", href: "/documentation" },
                        {
                            label: "Core Workflows",
                            href: "/documentation/core-workflows",
                        },
                        { label: "Add Or Import Candidates" },
                    ]}
                    lastUpdated="February 3, 2026"
                />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Purpose</h2>
                    <p className="text-base text-base-content/70">
                        Candidate profiles are the source of truth for
                        submissions, notes, and verification status. Accurate
                        profiles improve decision quality and reduce
                        back-and-forth.
                    </p>
                    <p className="text-base text-base-content/70">
                        This guide explains how to add candidates, capture
                        sourcing context, and ensure required fields are
                        complete. It also calls out what information is useful
                        before submitting.
                    </p>
                    <p className="text-base text-base-content/70">
                        Use this workflow whenever you source a new candidate or
                        need to update an existing profile before submission.
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
                        <div>Recruiter access to Candidates.</div>
                        <div>
                            Candidate contact details and resume or profile
                            data.
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                        <li>
                            Open <strong>Candidates</strong> and select{" "}
                            <strong>Add Candidate</strong>.
                        </li>
                        <li>
                            Enter contact info, role preferences, and sourcing
                            notes.
                        </li>
                        <li>
                            Attach resume or supporting documents if available.
                        </li>
                        <li>
                            Save the candidate and confirm they appear in your
                            list.
                        </li>
                    </ol>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">What Happens Next</h2>
                    <p className="text-base text-base-content/70">
                        The candidate becomes available for submissions.
                        Verification status and relationship tracking may apply.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Screenshot Placeholders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScreenshotPlaceholder
                            title="Add candidate form"
                            description="Candidate creation form with contact fields."
                            variant="desktop"
                            filename="docs-add-candidate-form-desktop.png"
                        />
                        <ScreenshotPlaceholder
                            title="Candidates list"
                            description="Candidate list with status and verification badges."
                            variant="desktop"
                            filename="docs-add-candidate-list-desktop.png"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Tips</h2>
                    <div className="space-y-2 text-base text-base-content/70">
                        <div>
                            Keep candidate profiles updated before submission.
                        </div>
                        <div>
                            Use notes to capture sourcing context or consent
                            status.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Troubleshooting</h2>
                    <div className="space-y-3 text-base text-base-content/70">
                        <div>
                            <strong>Symptom:</strong> I cannot add a candidate.
                            <br />
                            <strong>Likely cause:</strong> Missing recruiter
                            permissions.
                            <br />
                            <strong>Fix:</strong> Ask a company admin to confirm
                            your recruiter role.
                        </div>
                        <div>
                            <strong>Symptom:</strong> Candidate details are
                            incomplete.
                            <br />
                            <strong>Likely cause:</strong> Required fields were
                            skipped.
                            <br />
                            <strong>Fix:</strong> Edit the candidate to complete
                            required fields.
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Related Pages</h2>
                    <div className="space-y-2 space-x-4">
                        <a
                            href="/documentation/core-workflows/submit-a-candidate"
                            className="link link-hover"
                        >
                            Submit A Candidate{" "}
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                        </a>
                        <a
                            href="/documentation/roles-and-permissions/recruiter"
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
                            <strong>Verification status:</strong> Indicates
                            whether a candidate is confirmed and eligible for
                            submissions.
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
