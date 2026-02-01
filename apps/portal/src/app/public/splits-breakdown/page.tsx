import type { Metadata } from "next";
import { SplitsBreakdownContent } from "./splits-breakdown-content";

export const metadata: Metadata = {
    title: "Splits Breakdown",
    description:
        "Understand how placement fees are split between recruiters on Splits Network. Transparent pricing and processes for collaborative recruiting.",
};

export default function SplitsBreakdownPage() {
    return <SplitsBreakdownContent />;
}
