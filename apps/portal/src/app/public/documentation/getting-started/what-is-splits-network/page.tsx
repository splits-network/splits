import { DocPageHeader } from "../../components/doc-page-header";
import { ScreenshotPlaceholder } from "../../components/screenshot-placeholder";
import { getDocMetadata } from "../../seo";


export const metadata = getDocMetadata("getting-started/what-is-splits-network");
export default function WhatIsSplitsNetworkPage() {
    return (
        <div className="space-y-10">
            <DocPageHeader
                title="What Is Splits Network"
                description="A collaborative recruiting platform that keeps recruiters, hiring managers, and company admins aligned on roles, candidates, and placements."
                roles={["Recruiter", "Hiring Manager", "Company Admin"]}
                breadcrumbs={[
                    { label: "Documentation", href: "/public/documentation" },
                    {
                        label: "Getting Started",
                        href: "/public/documentation/getting-started",
                    },
                    { label: "What Is Splits Network" },
                ]}
                lastUpdated="February 3, 2026"
            />

                                    <section className="space-y-4">
                <h2 className="text-xl font-semibold">Purpose</h2>
                <p className="text-base text-base-content/70">
                    Splits Network is built to align recruiters, hiring managers, and company admins around the same hiring workflow. It keeps role details, submissions, and decisions in one place so handoffs are clear.
                </p>
                <p className="text-base text-base-content/70">
                    This page explains the platform at a high level so you can understand why each feature exists and how it connects to your daily work. It is the best starting point if you are new or need a fast refresher.
                </p>
                <p className="text-base text-base-content/70">
                    Use the links below to move into setup and navigation, then dive into the workflows that match your responsibilities. The goal is to help you move from context to action without guessing.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Who This Is For</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Recruiters</span>
                    <span className="badge badge-outline">Hiring Managers</span>
                    <span className="badge badge-outline">Company Admins</span>
                </div>
                <p className="text-base text-base-content/70">
                    If you work on roles, candidate submissions, or hiring
                    decisions, this documentation helps you understand what to
                    do, where to do it, and what to expect next.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Prerequisites</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>Active Splits Network account.</div>
                    <div>Assigned to an organization or recruiting team.</div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">
                    How To Use This Documentation
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-base text-base-content/70">
                    <li>Start with First-Time Setup if you are new.</li>
                    <li>
                        Review Navigation Overview to learn where work lives.
                    </li>
                    <li>
                        Jump to the feature guide for the task you need to
                        finish.
                    </li>
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">What Happens Next</h2>
                <p className="text-base text-base-content/70">
                    After onboarding, you can post or manage roles, submit
                    candidates, review applications, and track placements based
                    on your role and organization permissions.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">
                    Screenshot Placeholders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScreenshotPlaceholder
                        title="Platform overview"
                        description="Dashboard view showing the sidebar and key management sections."
                        variant="desktop"
                        filename="docs-what-is-dashboard-desktop.png"
                    />
                    <ScreenshotPlaceholder
                        title="Platform overview"
                        description="Mobile dock view with primary navigation items visible."
                        variant="mobile"
                        filename="docs-what-is-dashboard-mobile.png"
                    />
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tips</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        Use Roles and Applications as the core workflow hub.
                    </div>
                    <div>
                        Messages and Notifications keep collaboration visible.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <div className="space-y-3 text-base text-base-content/70">
                    <div>
                        <strong>Symptom:</strong> I do not know what role I am.
                        <br />
                        <strong>Likely cause:</strong> Your organization admin
                        has not clarified permissions.
                        <br />
                        <strong>Fix:</strong> Ask a company admin to confirm
                        your role or check Profile for role badges.
                    </div>
                    <div>
                        <strong>Symptom:</strong> I cannot see Roles or
                        Applications.
                        <br />
                        <strong>Likely cause:</strong> Your role does not
                        include that feature.
                        <br />
                        <strong>Fix:</strong> Request access from a company
                        admin.
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Related Pages</h2>
                <div className="space-y-2 space-x-4">
                    <a
                        href="/public/documentation/getting-started/first-time-setup"
                        className="link link-hover"
                    >
                        First-Time Setup{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                    <a
                        href="/public/documentation/getting-started/navigation-overview"
                        className="link link-hover"
                    >
                        Navigation Overview{" "}
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-info" />
                    </a>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Reference</h2>
                <div className="space-y-2 text-base text-base-content/70">
                    <div>
                        <strong>Role:</strong> The permission set that controls
                        what you can see and do in the portal.
                    </div>
                    <div>
                        <strong>Placement:</strong> A successful hire tied to a
                        role and candidate, used to track fees and earnings.
                    </div>
                </div>
            </section>
        </div>
    );
}


