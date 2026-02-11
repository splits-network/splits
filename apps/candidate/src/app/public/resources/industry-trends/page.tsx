import type { Metadata } from "next";
import { IndustryTrendsContent } from "./industry-trends-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Industry Trends",
    description: "Stay ahead with the latest hiring, salary, and market insights.",
    openGraph: {
        title: "Industry Trends",
        description: "Stay ahead with the latest hiring, salary, and market insights.",
        url: "https://applicant.network/public/resources/industry-trends",
    },
    ...buildCanonical("/public/resources/industry-trends"),
};

export default function IndustryTrendsPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Industry Trends",
        description: "Stay ahead with the latest hiring, salary, and market insights.",
        path: "/public/resources/industry-trends",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <IndustryTrendsContent />
        </>
    );
}
