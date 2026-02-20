import type { Metadata } from "next";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { ResumeTipsClient } from "./resume-tips-client";

export const metadata: Metadata = {
    title: "Resume Tips - Applicant Network | Craft a Standout Resume",
    description:
        "Expert resume tips and strategies to craft a compelling resume that gets interviews. Learn formatting, quantifying achievements, and tailoring for each role.",
    keywords:
        "resume tips, resume writing, CV tips, resume formatting, job application, resume examples",
    openGraph: {
        title: "Resume Tips - Applicant Network | Craft a Standout Resume",
        description:
            "Expert resume tips and strategies to craft a compelling resume that gets interviews.",
        url: "https://applicant.network/resources/resume-tips",
    },
    ...buildCanonical("/resources/resume-tips"),
};

export default function ResumeTipsMemphisPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Resume Tips",
        description: "Craft a standout resume with proven tips and examples.",
        path: "/resources/resume-tips",
    });

    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <ResumeTipsClient />
        </>
    );
}
