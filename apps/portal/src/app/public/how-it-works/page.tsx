import type { Metadata } from "next";
import { HowItWorksContent } from "./how-it-works-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "How It Works",
    description:
        "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
    openGraph: {
        title: "How It Works",
        description:
            "See how Splits Network connects recruiters and companies for split placements, from role setup and submissions through interviews, hires, and payout tracking.",
        url: "https://splits.network/public/how-it-works",
    },
    ...buildCanonical("/public/how-it-works"),
};

export default function HowItWorksPage() {
    return <HowItWorksContent />;
}
