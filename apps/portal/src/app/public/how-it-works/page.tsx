import type { Metadata } from "next";
import { HowItWorksContent } from "./how-it-works-content";

export const metadata: Metadata = {
    title: "How It Works",
    description:
        "See how Splits Network connects recruiters and companies for split placements.",
};

export default function HowItWorksPage() {
    return <HowItWorksContent />;
}
