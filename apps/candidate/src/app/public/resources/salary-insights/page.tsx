import type { Metadata } from "next";
import { SalaryInsightsContent } from "./salary-insights-content";

export const metadata: Metadata = {
    title: "Salary Insights",
    description: "Explore salary benchmarks, compensation trends, and market insights.",
};

export default function SalaryInsightsPage() {
    return <SalaryInsightsContent />;
}
