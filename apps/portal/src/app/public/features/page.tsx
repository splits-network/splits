import type { Metadata } from "next";
import { FeaturesContent } from "./features-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
    openGraph: {
        title: "Features",
        description:
            "Explore the tools and workflows that power split placements on Splits Network, from role setup and submissions to messaging, placements, and payout tracking.",
        url: "https://splits.network/public/features",
    },
    ...buildCanonical("/public/features"),
};

export default function FeaturesPage() {
    return <FeaturesContent />;
}
