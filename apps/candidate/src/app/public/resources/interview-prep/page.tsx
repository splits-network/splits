import type { Metadata } from "next";
import { InterviewPrepContent } from "./interview-prep-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Interview Prep",
    description: "Prepare for interviews with expert tips, questions, and strategies.",
    openGraph: {
        title: "Interview Prep",
        description: "Prepare for interviews with expert tips, questions, and strategies.",
        url: "https://applicant.network/public/resources/interview-prep",
    },
    ...buildCanonical("/public/resources/interview-prep"),
};

export default function InterviewPrepPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Interview Prep",
        description: "Prepare for interviews with expert tips, questions, and strategies.",
        path: "/public/resources/interview-prep",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <InterviewPrepContent />
        </>
    );
}
