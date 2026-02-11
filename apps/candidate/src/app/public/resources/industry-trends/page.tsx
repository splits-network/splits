import type { Metadata } from "next";
import { IndustryTrendsContent } from "./industry-trends-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Industry Trends",
    description: "Stay ahead with the latest hiring, salary, and market insights.",
    ...buildCanonical("/public/resources/industry-trends"),
};

export default function IndustryTrendsPage() {
    return <IndustryTrendsContent />;
}