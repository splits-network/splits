import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";
import { JsonLd } from "@splits-network/shared-ui";
import { pricingFaqs } from "./pricing-faq-data";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network.",
    ...buildCanonical("/public/pricing"),
};

export default function PricingPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pricingFaqs.map((faq) => ({
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
            <JsonLd data={faqJsonLd} id="portal-pricing-faq-jsonld" />
            <PricingContent />
        </>
    );
}
