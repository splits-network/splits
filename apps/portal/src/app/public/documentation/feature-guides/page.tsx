import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../seo";
import { JsonLd } from "@splits-network/shared-ui";

const guides = [
    {
        title: "Dashboard",
        href: "/public/documentation/feature-guides/dashboard",
        description: "Overview widgets and quick actions.",
    },
    {
        title: "Roles",
        href: "/public/documentation/feature-guides/roles",
        description: "Create, manage, and track role status.",
    },
    {
        title: "Candidates",
        href: "/public/documentation/feature-guides/candidates",
        description: "Manage candidate profiles and sourcing data.",
    },
    {
        title: "Applications",
        href: "/public/documentation/feature-guides/applications",
        description: "Review applications and stage progress.",
    },
    {
        title: "Invitations",
        href: "/public/documentation/feature-guides/invitations",
        description: "Invite teammates and track status.",
    },
    {
        title: "Messages",
        href: "/public/documentation/feature-guides/messages",
        description: "Collaborate in real time.",
    },
    {
        title: "Placements",
        href: "/public/documentation/feature-guides/placements",
        description: "Track hires, fees, and earnings.",
    },
    {
        title: "Profile",
        href: "/public/documentation/feature-guides/profile",
        description: "Update your profile and preferences.",
    },
    {
        title: "Billing",
        href: "/public/documentation/feature-guides/billing",
        description: "Manage subscription and payments.",
    },
    {
        title: "Company Settings",
        href: "/public/documentation/feature-guides/company-settings",
        description: "Manage organization settings.",
    },
    {
        title: "Team Management",
        href: "/public/documentation/feature-guides/team-management",
        description: "Manage team roles and access.",
    },
    {
        title: "Notifications",
        href: "/public/documentation/feature-guides/notifications",
        description: "Track updates and actions.",
    },
];


export const metadata = getDocMetadata("feature-guides");
export default function FeatureGuidesIndexPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("feature-guides")} id="docs-feature-guides-jsonld" />
            <div className="space-y-8">
            <div className="space-y-3">
                <nav className="text-sm breadcrumbs">
                    <ul>
                        <li>
                            <Link href="/public/documentation">Documentation</Link>
                        </li>
                        <li>Feature Guides</li>
                    </ul>
                </nav>
                <h1 className="text-3xl font-semibold">Feature Guides</h1>
                <p className="text-base text-base-content/70 max-w-3xl">
                    Feature-specific documentation for every major area of the
                    platform.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((guide) => (
                    <Link
                        key={guide.href}
                        href={guide.href}
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h2 className="card-title">{guide.title}</h2>
                            <p className="text-sm text-base-content/70">
                                {guide.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            </div>
        </>
    );
}
