import type { Metadata } from "next";
import { SalaryInsightsContent } from "./salary-insights-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Salary Insights",
    description: "Explore salary benchmarks, compensation trends, and market insights.",
    openGraph: {
        title: "Salary Insights",
        description: "Explore salary benchmarks, compensation trends, and market insights.",
        url: "https://applicant.network/public/resources/salary-insights",
    },
    ...buildCanonical("/public/resources/salary-insights"),
};

export default function SalaryInsightsPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Salary Insights",
        description: "Explore salary benchmarks, compensation trends, and market insights.",
        path: "/public/resources/salary-insights",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <SalaryInsightsContent />
        </>
    );
}
