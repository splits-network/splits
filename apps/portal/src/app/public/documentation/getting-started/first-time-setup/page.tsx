import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function FirstTimeSetupPage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="First-Time Setup"
                description="Get access, connect to your organization, and complete onboarding so you can start working on roles and candidates."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Getting Started", href: "/public/documentation/getting-started" },
                    { label: "First-Time Setup" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    This guide helps you confirm account access, link to the right
                    organization, and finish onboarding so your dashboard and workflow
                    pages load correctly.
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
                    <div>Invitation email or sign-up access.</div>
                    <div>Organization or recruiting team name.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Steps</h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Open your invitation or sign-in to your account.</li>
                    <li>Confirm your email and complete any required profile fields.</li>
                    <li>Join the correct organization when prompted.</li>
                    <li>Complete onboarding steps for your role.</li>
                    <li>Verify that Dashboard and Roles load without errors.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    Once onboarding is complete, your navigation updates based on your
                    role, and you can begin creating roles or reviewing candidates.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Invitation acceptance"
                        description="Accept invitation screen with organization name visible."
                        variant="desktop"
                        filename="docs-first-time-invitation-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Invitation acceptance"
                        description="Mobile view of invitation or sign-in flow."
                        variant="mobile"
                        filename="docs-first-time-invitation-mobile.png"
                    />
                    <ScreenshotPlaceholder
                        title="Onboarding prompt"
                        description="First onboarding step showing required fields."
                        variant="desktop"
                        filename="docs-first-time-onboarding-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Onboarding prompt"
                        description="Mobile onboarding step with progress indicator."
                        variant="mobile"
                        filename="docs-first-time-onboarding-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use the same email address your organization invited.</div>
                    <div>Ask a company admin to resend the invitation if it expired.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I cannot access the portal after sign-in.
                        <br />
                        <strong>Likely cause:</strong> Your invitation is missing or expired.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to resend the invite.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I do not see my company name.
                        <br />
                        <strong>Likely cause:</strong> Your account is not linked to an organization.
                        <br />
                        <strong>Fix:</strong> Contact a company admin to link you or open a support request.
                    </div>
                    <div>
                        <strong>Symptom:</strong> The onboarding wizard keeps reopening.
                        <br />
                        <strong>Likely cause:</strong> Required steps were not completed.
                        <br />
                        <strong>Fix:</strong> Complete all required fields and save.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2">
                    <a
                        href="/public/documentation/getting-started/navigation-overview"
                        className="link link-hover"
                    >
                        Navigation Overview
                    </a>
                    <a
                        href="/public/documentation/getting-started/what-is-splits-network"
                        className="link link-hover"
                    >
                        What Is Splits Network
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Organization:</strong> The company or recruiting team you
                        belong to in Splits Network.
                    </div>
                    <div>
                        <strong>Onboarding:</strong> The setup flow that captures your
                        role and required profile information.
                    </div>
                </div>
            </section>
        </div>
    );
}

