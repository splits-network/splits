import type { Metadata } from "next";
import { ForRecruitersContent } from "./for-recruiters-content";

export const metadata: Metadata = {
    title: "For Recruiters",
    description:
        "Join thousands of recruiters earning more through collaborative placements on Splits Network. Transparent fees, flexible tiers, and unlimited earning potential.",
};

export default function ForRecruitersPage() {
    return <ForRecruitersContent />;
}
