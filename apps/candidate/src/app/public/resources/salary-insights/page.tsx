import type { Metadata } from "next";
import { SalaryInsightsContent } from "./salary-insights-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Salary Insights",
    description: "Explore salary benchmarks, compensation trends, and market insights.",
    ...buildCanonical("/public/resources/salary-insights"),
};

export default function SalaryInsightsPage() {
    return <SalaryInsightsContent />;
}