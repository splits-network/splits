import type { Metadata } from "next";
import { IndustryTrendsContent } from "./industry-trends-content";

export const metadata: Metadata = {
    title: "Industry Trends",
    description: "Stay ahead with the latest hiring, salary, and market insights.",
};

export default function IndustryTrendsPage() {
    return <IndustryTrendsContent />;
}
