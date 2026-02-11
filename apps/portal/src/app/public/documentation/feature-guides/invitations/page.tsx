import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("feature-guides/invitations");
export default function InvitationsGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Invitations"
                description="Invite teammates and track invitation status."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Invitations" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Invitations are how new teammates and collaborators gain access to your organization. They govern roles, permissions, and visibility.
                </p>
                <p className="text-base text-base-content/70">
                    This guide outlines the invitations list, status tracking, and resend or revoke actions. It helps you ensure the right people have the right access.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when onboarding new users or resolving access delays caused by pending invites.
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
                    <div>Access to Invitations or Team.</div>
                    <div>Email addresses for invitees.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Invitation list with status tracking.</li>
                    <li>Resend or revoke invitation actions.</li>
                    <li>Role assignment at invite time.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Invitations list"
                        description="Invitation list with status and actions."
                        variant="desktop"
                        filename="docs-invitations-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Invite modal"
                        description="Invite teammate form with role selection."
                        variant="desktop"
                        filename="docs-invitations-modal-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Assign the correct role during invitation.</div>
                    <div>Resend invites if they expire.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> An invite shows pending for too long.
                        <br />
                        <strong>Likely cause:</strong> The invitee has not accepted.
                        <br />
                        <strong>Fix:</strong> Resend the invitation or confirm their email.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I cannot send invites.
                        <br />
                        <strong>Likely cause:</strong> Your role lacks permission.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to grant access.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/core-workflows/invite-recruiters-or-teammates"
                        className="link link-hover"
                    >
                        Invite Recruiters Or Teammates{" "}
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
                        <strong>Invitation status:</strong> Pending, accepted, declined, or expired.
                    </div>
                </div>
            </section>
        </div>
    );
}

