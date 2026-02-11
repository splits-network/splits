import Link from "next/link";
import { getDocMetadata, getDocJsonLd } from "../seo";
import { JsonLd } from "@splits-network/shared-ui";


export const metadata = getDocMetadata("integrations");
export default function IntegrationsPage() {
    return (
        <>
            <JsonLd data={getDocJsonLd("integrations")} id="docs-integrations-jsonld" />
            <div className="space-y-6">
            <nav className="text-sm breadcrumbs">
                <ul>
                    <li>
                        <Link href="/public/documentation">Documentation</Link>
                    </li>
                    <li>Integrations</li>
                </ul>
            </nav>
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold">Integrations</h1>
                            <p className="text-base text-base-content/70">
                                Integration documentation is coming soon. Check back for
                                setup guides and troubleshooting.
                            </p>
                        </div>
                        <span className="badge badge-outline">Coming soon</span>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}
