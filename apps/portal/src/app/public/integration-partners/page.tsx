import type { Metadata } from "next";
import { IntegrationContent } from "./integration-content";

export const metadata: Metadata = {
    title: "Integration Partners",
    description: "Discover integrations and partners powering Splits Network workflows.",
};

export default function IntegrationsPage() {
    return <IntegrationContent />;
}
