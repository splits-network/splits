import type { Metadata } from "next";
import { CareerGuidesContent } from "./career-guides-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Career Guides",
    description: "Actionable career guides to help you grow, switch roles, and negotiate offers.",
    openGraph: {
        title: "Career Guides",
        description: "Actionable career guides to help you grow, switch roles, and negotiate offers.",
        url: "https://applicant.network/public/resources/career-guides",
    },
    ...buildCanonical("/public/resources/career-guides"),
};

export default function CareerGuidesPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Career Guides",
        description: "Actionable career guides to help you grow, switch roles, and negotiate offers.",
        path: "/public/resources/career-guides",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <CareerGuidesContent />
        </>
    );
}
