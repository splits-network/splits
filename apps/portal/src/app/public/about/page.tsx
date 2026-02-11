import type { Metadata } from "next";
import { AboutContent } from "./about-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About Splits Network",
    description:
        "Learn how Splits Network powers collaborative recruiting and split placements.",
    ...buildCanonical("/public/about"),
};

export default function AboutPage() {
    return <AboutContent />;
}