import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network.",
};

export default function PricingPage() {
    return <PricingContent />;
}
