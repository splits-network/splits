import type { Metadata } from "next";
import { UpdatesContent } from "./updates-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Product Updates",
    description: "Latest releases and improvements across the Splits Network platform, including workflow enhancements, integrations, and product fixes.",
    openGraph: {
        title: "Product Updates",
        description: "Latest releases and improvements across the Splits Network platform, including workflow enhancements, integrations, and product fixes.",
        url: "https://splits.network/public/updates",
    },
    ...buildCanonical("/public/updates"),
};

export default function UpdatesPage() {
    return <UpdatesContent />;
}
