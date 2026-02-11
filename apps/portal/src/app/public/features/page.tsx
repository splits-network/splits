import type { Metadata } from "next";
import { FeaturesContent } from "./features-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore the tools and workflows that power split placements on Splits Network.",
    ...buildCanonical("/public/features"),
};

export default function FeaturesPage() {
    return <FeaturesContent />;
}