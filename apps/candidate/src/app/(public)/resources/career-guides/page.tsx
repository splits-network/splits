import type { Metadata } from "next";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { CareerGuidesClient } from "./career-guides-client";

export const metadata: Metadata = {
    title: "Career Guides - Applicant Network | Expert Career Development Resources",
    description:
        "Actionable career guides to help you grow, switch roles, and negotiate offers. Expert advice for every stage of your career journey.",
    keywords:
        "career guides, career development, job search, career change, networking, salary negotiation",
    openGraph: {
        title: "Career Guides - Applicant Network | Expert Career Development Resources",
        description:
            "Actionable career guides to help you grow, switch roles, and negotiate offers. Expert advice for every stage of your career journey.",
        url: "https://applicant.network/resources/career-guides",
    },
    ...buildCanonical("/resources/career-guides"),
};

export default function CareerGuidesMemphisPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Career Guides",
        description:
            "Actionable career guides to help you grow, switch roles, and negotiate offers.",
        path: "/resources/career-guides",
    });

    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <CareerGuidesClient />
        </>
    );
}
