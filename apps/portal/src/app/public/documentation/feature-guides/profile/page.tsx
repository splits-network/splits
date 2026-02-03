import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";

export default function ProfileGuidePage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="Profile"
                description="Update your profile details, preferences, and visibility."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Profile" },
                ]}
                lastUpdated="February 3, 2026"
            />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Your profile controls your contact info, notification preferences,
                    and marketplace visibility.
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
                    <div>Signed in and able to access Profile.</div>
                    <div>Profile details ready to update.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Personal information and contact details.</li>
                    <li>Marketplace visibility settings (if available).</li>
                    <li>Notification preferences.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Profile settings"
                        description="Profile form with contact details."
                        variant="desktop"
                        filename="docs-profile-settings-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Profile preferences"
                        description="Marketplace or notification preferences section."
                        variant="desktop"
                        filename="docs-profile-preferences-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Keep contact info current for recruiter collaboration.</div>
                    <div>Review visibility settings if you join the marketplace.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> Profile changes do not save.
                        <br />
                        <strong>Likely cause:</strong> Required fields are missing.
                        <br />
                        <strong>Fix:</strong> Complete all required fields and save again.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I cannot see marketplace settings.
                        <br />
                        <strong>Likely cause:</strong> Marketplace is not enabled for your account.
                        <br />
                        <strong>Fix:</strong> Contact support or your admin to enable it.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/notifications"
                        className="link link-hover"
                    >
                        Notifications{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/feature-guides/billing"
                        className="link link-hover"
                    >
                        Billing{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Marketplace visibility:</strong> Controls whether recruiters can view your public profile.
                    </div>
                </div>
            </section>
        </div>
    );
}
