import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";


export const metadata = getDocMetadata("core-workflows/invite-recruiters-or-teammates");
export default function InviteRecruitersOrTeammatesPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("core-workflows/invite-recruiters-or-teammates")} id="docs-core-workflows-invite-recruiters-or-teammates-jsonld" />
            <div className="space-y-10">
            <DocPageHeader
                title="Invite Recruiters Or Teammates"
                description="Invite collaborators to your organization and assign the correct permissions."
                roles={["Company Admin", "Hiring Manager", "Recruiter"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Core Workflows", href: "/public/documentation/core-workflows" },
                    { label: "Invite Recruiters Or Teammates" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Invitations control who can access your organization and what they can manage. This workflow protects sensitive hiring data while enabling collaboration.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains how to send invites, assign the correct role, and verify that access is granted. It also clarifies what to do when invites are pending or expired.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when onboarding new recruiters or internal teammates to keep access consistent and auditable.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Company Admins</span>
                    <span className="badge badge-outline">Hiring Managers</span>
                    <span className="badge badge-outline">Recruiters</span>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Access to Team or Invitations pages.</div>
                    <div>Email address for the person you want to invite.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Steps</h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Open <strong>Invitations</strong> or <strong>Team</strong>.</li>
                    <li>Select <strong>Invite</strong> and enter the email address.</li>
                    <li>Choose the appropriate role (Recruiter, Hiring Manager, Company Admin).</li>
                    <li>Send the invitation and confirm the status is listed.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    The invitee receives an email and gains access after accepting.
                    Their navigation updates based on the role you assign.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Invitations list"
                        description="Invitations page with status and resend actions."
                        variant="desktop"
                        filename="docs-invite-teammate-list-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Team management"
                        description="Team page showing assigned roles."
                        variant="desktop"
                        filename="docs-invite-teammate-team-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Use Hiring Manager for review-only access.</div>
                    <div>Resend invitations if a teammate misses the email.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> An invitation never arrives.
                        <br />
                        <strong>Likely cause:</strong> Email filtered or typo in address.
                        <br />
                        <strong>Fix:</strong> Confirm the email and resend the invite.
                    </div>
                    <div>
                        <strong>Symptom:</strong> The invitee cannot see expected pages.
                        <br />
                        <strong>Likely cause:</strong> Role assigned incorrectly.
                        <br />
                        <strong>Fix:</strong> Update their role in Team or resend the invite.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/roles-and-permissions/role-based-access"
                        className="link link-hover"
                    >
                        Role-Based Access{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/roles-and-permissions/company-admin"
                        className="link link-hover"
                    >
                        Company Admin Capabilities{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Invitation:</strong> An email-based request to join an organization and receive permissions.
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
