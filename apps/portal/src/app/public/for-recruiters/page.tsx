import type { Metadata } from "next";
import { ForRecruitersContent } from "./for-recruiters-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "For Recruiters",
    description:
        "Join thousands of recruiters earning more through collaborative placements on Splits Network. Transparent fees, flexible tiers, and unlimited earning potential.",
    openGraph: {
        title: "For Recruiters",
        description:
            "Join thousands of recruiters earning more through collaborative placements on Splits Network. Transparent fees, flexible tiers, and unlimited earning potential.",
        url: "https://splits.network/public/for-recruiters",
    },
    ...buildCanonical("/public/for-recruiters"),
};

export default function ForRecruitersPage() {
    return <ForRecruitersContent />;
}
