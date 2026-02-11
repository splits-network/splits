import type { Metadata } from "next";
import { ResumeTipsContent } from "./resume-tips-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Resume Tips",
    description: "Craft a standout resume with proven tips and examples.",
    openGraph: {
        title: "Resume Tips",
        description: "Craft a standout resume with proven tips and examples.",
        url: "https://applicant.network/public/resources/resume-tips",
    },
    ...buildCanonical("/public/resources/resume-tips"),
};

export default function ResumeTipsPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Resume Tips",
        description: "Craft a standout resume with proven tips and examples.",
        path: "/public/resources/resume-tips",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <ResumeTipsContent />
        </>
    );
}
