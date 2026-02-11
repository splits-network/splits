import type { Metadata } from "next";
import { IntegrationContent } from "./integration-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Integration Partners",
    description: "Discover integrations and partners powering Splits Network workflows, from ATS connections to reporting and collaboration tools.",
    openGraph: {
        title: "Integration Partners",
        description: "Discover integrations and partners powering Splits Network workflows, from ATS connections to reporting and collaboration tools.",
        url: "https://splits.network/public/integration-partners",
    },
    ...buildCanonical("/public/integration-partners"),
};

export default function IntegrationsPage() {
    return <IntegrationContent />;
}
