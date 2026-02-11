import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("feature-guides/candidates");
export default function CandidatesGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Candidates"
                description="Manage candidate profiles, verification status, and sourcing data."
                roles={["Recruiter", "Platform Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Candidates" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Candidate profiles capture sourcing details, verification status, and notes that support submissions. Clean data improves hiring decisions and reduces friction.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains how to work with candidate lists and detail views, including marketplace visibility where applicable. It also clarifies how verification status impacts submission readiness.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when updating candidate information, preparing submissions, or troubleshooting missing or masked data.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Recruiters</span>
                    <span className="badge badge-outline">Platform Admins</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Recruiter access to Candidates.</div>
                    <div>Candidate contact details.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Candidate list with verification status.</li>
                    <li>Candidate detail view and notes.</li>
                    <li>Marketplace browse mode (if enabled).</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Candidates list"
                        description="Candidate list with verification badges."
                        variant="desktop"
                        filename="docs-candidates-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Candidate detail"
                        description="Candidate detail view with profile info and notes."
                        variant="desktop"
                        filename="docs-candidates-detail-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Verify candidate data before submitting.</div>
                    <div>Use notes to capture sourcing context.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot edit a candidate.
                        <br />
                        <strong>Likely cause:</strong> Candidate is owned by another recruiter.
                        <br />
                        <strong>Fix:</strong> Confirm permissions or request access.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Candidates are missing from the list.
                        <br />
                        <strong>Likely cause:</strong> Filters or visibility settings are applied.
                        <br />
                        <strong>Fix:</strong> Clear filters or switch view modes.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/add-or-import-candidates"
                        className="link link-hover"
                    >
                        Add Or Import Candidates{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/core-workflows/submit-a-candidate"
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
                        <strong>Verification status:</strong> The state of candidate review (unverified, pending, verified, rejected).
                    </div>
                </div>
            </section>
        </div>
    );
}

