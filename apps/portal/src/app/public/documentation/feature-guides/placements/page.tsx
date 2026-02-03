import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function PlacementsGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Placements"
                description="Track hires, fees, and recruiter earnings."
                roles={["Recruiter", "Platform Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Placements" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Placements summarize successful hires and fee distribution.
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
                    <div>At least one hired application.</div>
                    <div>Recruiter access to Placements.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Placement list with fee and share data.</li>
                    <li>Placement status and guarantee period details.</li>
                    <li>Earnings summaries and filters.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Placements list"
                        description="Placements list with salary and fee columns."
                        variant="desktop"
                        filename="docs-placements-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Placements overview"
                        description="Placement summary widgets and filters."
                        variant="desktop"
                        filename="docs-placements-overview-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Confirm fee percentage aligns with the role record.</div>
                    <div>Use filters to view placements by time period.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> Placement data looks incorrect.
                        <br />
                        <strong>Likely cause:</strong> Salary or fee values were updated after hire.
                        <br />
                        <strong>Fix:</strong> Confirm the application details and contact support if needed.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I cannot access Placements.
                        <br />
                        <strong>Likely cause:</strong> Your role does not include placements access.
                        <br />
                        <strong>Fix:</strong> Ask an admin to confirm recruiter permissions.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/mark-a-hire-and-track-placements"
                        className="link link-hover"
                    >
                        Mark A Hire And Track Placements{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/feature-guides/roles"
                        className="link link-hover"
                    >
                        Roles{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Recruiter share:</strong> The portion of the placement fee paid to the recruiter.
                    </div>
                </div>
            </section>
        </div>
    );
}
