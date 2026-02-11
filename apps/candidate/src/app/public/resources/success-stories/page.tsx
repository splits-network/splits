import type { Metadata } from "next";
import { SuccessStoriesContent } from "./success-stories-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Success Stories",
    description: "Read real stories from candidates who landed roles through Applicant Network.",
    openGraph: {
        title: "Success Stories",
        description: "Read real stories from candidates who landed roles through Applicant Network.",
        url: "https://applicant.network/public/resources/success-stories",
    },
    ...buildCanonical("/public/resources/success-stories"),
};

export default function SuccessStoriesPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Success Stories",
        description: "Read real stories from candidates who landed roles through Applicant Network.",
        path: "/public/resources/success-stories",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <SuccessStoriesContent />
        </>
    );
}
