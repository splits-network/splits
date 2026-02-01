import type { Metadata } from "next";
import { FeaturesContent } from "./features-content";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore the tools and workflows that power split placements on Splits Network.",
};

export default function FeaturesPage() {
    return <FeaturesContent />;
}
