import type { Metadata } from "next";
import { AboutContent } from "./about-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About Splits Network",
    description:
        "Learn how Splits Network powers collaborative recruiting and split placements, aligning recruiters and companies with transparent workflows and shared outcomes.",
    openGraph: {
        title: "About Splits Network",
        description:
            "Learn how Splits Network powers collaborative recruiting and split placements, aligning recruiters and companies with transparent workflows and shared outcomes.",
        url: "https://splits.network/public/about",
    },
    ...buildCanonical("/public/about"),
};

export default function AboutPage() {
    return <AboutContent />;
}
