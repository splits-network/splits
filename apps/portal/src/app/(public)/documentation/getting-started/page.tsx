import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata = getDocMetadata("getting-started");
export default function GettingStartedIndexPage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("getting-started")}
                id="docs-getting-started-jsonld"
            />
            <div className="space-y-8">
                <div className="space-y-3">
                    <nav className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href="/documentation">Documentation</Link>
                            </li>
                            <li>Getting Started</li>
                        </ul>
                    </nav>
                    <h1 className="text-3xl font-semibold">Getting Started</h1>
                    <p className="text-base text-base-content/70 max-w-3xl">
                        Start here if you are new to Splits Network or want a
                        fast refresher on how the platform works.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/documentation/getting-started/what-is-splits-network"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h2 className="card-title">
                                What Is Splits Network
                            </h2>
                            <p className="text-sm text-base-content/70">
                                Purpose, audience, and where Splits Network fits
                                in a hiring workflow.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/documentation/getting-started/first-time-setup"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h2 className="card-title">First-Time Setup</h2>
                            <p className="text-sm text-base-content/70">
                                Account access, organization setup, and
                                onboarding steps.
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/documentation/getting-started/navigation-overview"
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h2 className="card-title">Navigation Overview</h2>
                            <p className="text-sm text-base-content/70">
                                How to find roles, candidates, applications, and
                                settings.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
