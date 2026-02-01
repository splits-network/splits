import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
    title: "About Splits Network",
    description:
        "Learn how Splits Network powers collaborative recruiting and split placements.",
};

export default function AboutPage() {
    return <AboutContent />;
}
