import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";
import { pricingFaqs } from "./pricing-faq-data";
import { buildCanonical } from "@/lib/seo";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
    openGraph: {
        title: "Pricing",
        description:
            "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
        url: "https://splits.network/public/pricing",
    },
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
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Splits Network Pricing",
        description:
            "Pricing plans for recruiters using Splits Network, including Starter, Pro, and Partner tiers.",
        brand: {
            "@type": "Organization",
            name: "Splits Network",
        },
        offers: {
            "@type": "AggregateOffer",
            lowPrice: "0",
            highPrice: "249",
            priceCurrency: "USD",
            offerCount: "3",
        },
        url: "https://splits.network/public/pricing",
    };

    return (
        <>
            <JsonLd data={faqJsonLd} id="portal-pricing-faq-jsonld" />
            <JsonLd data={productJsonLd} id="portal-pricing-product-jsonld" />
            <PricingContent />
        </>
    );
}
