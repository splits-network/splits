import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { buildCanonical } from "@/lib/seo";
import { candidateFaqs } from "@/components/landing/sections/faq-data";
import PageMemphisClient from "./landing-client";

export const metadata: Metadata = {
    title: "Find Your Next Career Opportunity",
    description:
        "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
    openGraph: {
        title: "Find Your Next Career Opportunity",
        description:
            "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
    },
    ...buildCanonical(""),
};

export default async function PageMemphis() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Applicant Network - Find Your Next Career Opportunity",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        description:
            "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
        isPartOf: {
            "@type": "WebSite",
            name: "Applicant Network",
            url:
                process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        },
    };
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: candidateFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="applicant-home-jsonld" />
            <JsonLd data={faqJsonLd} id="applicant-home-faq-jsonld" />
            <PageMemphisClient faqs={candidateFaqs} />
        </>
    );
}
