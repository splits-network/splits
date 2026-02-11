import type { Metadata } from "next";
import { IntegrationContent } from "./integration-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Integration Partners",
    description: "Discover integrations and partners powering Splits Network workflows.",
    ...buildCanonical("/public/integration-partners"),
};

export default function IntegrationsPage() {
    return <IntegrationContent />;
}