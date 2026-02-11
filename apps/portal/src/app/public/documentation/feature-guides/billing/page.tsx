import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata, getDocJsonLd } from "../../seo";
import { JsonLd } from "@splits-network/shared-ui";


export const metadata = getDocMetadata("feature-guides/billing");
export default function BillingGuidePage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides/billing")} id="docs-feature-guides-billing-jsonld" />
            <div className="space-y-10">
            <DocPageHeader
                title="Billing"
                description="Manage subscription details and payment methods."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    { label: "Feature Guides", href: "/public/documentation/feature-guides" },
                    { label: "Billing" },
                ]}
                lastUpdated="February 3, 2026"
            />

                        <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Billing centralizes subscription status, invoices, and payment methods. It is the source of truth for plan details and renewal timing.
                </p>
                <p className="text-base text-base-content/70">
                    This guide explains where to view plan information, update payment methods, and download invoices. It also clarifies common issues that can block billing updates.
                </p>
                <p className="text-base text-base-content/70">
                    Use this page when managing subscriptions, reconciling invoices, or troubleshooting payment problems.
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
                    <div>Signed in with access to Billing.</div>
                    <div>Active subscription or trial.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Key Areas</h2>
                <ul className="list-disc list-inside space-y-2 text-base text-base-content/70">
                    <li>Current plan and renewal date.</li>
                    <li>Payment method management.</li>
                    <li>Invoices and billing history.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Screenshot Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Billing overview"
                        description="Billing page showing plan and payment method."
                        variant="desktop"
                        filename="docs-billing-overview-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Billing history"
                        description="Invoices list with download actions."
                        variant="desktop"
                        filename="docs-billing-history-desktop.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Keep billing contacts updated to avoid missed invoices.</div>
                    <div>Review plan limits before upgrading.</div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> Payment method fails to update.
                        <br />
                        <strong>Likely cause:</strong> Card validation error.
                        <br />
                        <strong>Fix:</strong> Retry with a different payment method.
                    </div>
                    <div>
                        <strong>Symptom:</strong> Billing page is blank.
                        <br />
                        <strong>Likely cause:</strong> Subscription data failed to load.
                        <br />
                        <strong>Fix:</strong> Refresh the page or contact support.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/feature-guides/profile"
                        className="link link-hover"
                    >
                        Profile{" "}
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
                        <strong>Subscription:</strong> The plan that governs access and billing terms.
                    </div>
                </div>
            </section>
            </div>
        </>
    );
}
