import type { Metadata } from "next";
import { CTASection } from "@/components/landing/sections/cta-section";
import { FAQSection } from "@/components/landing/sections/faq-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works-section";
import { MetricsSection } from "@/components/landing/sections/metrics-section";
import { ProblemSection } from "@/components/landing/sections/problem-section";
import { SolutionBridgeSection } from "@/components/landing/sections/solution-bridge-section";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Find Your Next Career Opportunity",
    description:
        "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
};

export default async function CandidateHomePage() {
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
            url: process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network",
        },
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="applicant-home-jsonld" />
            <HeroSection />
            <ProblemSection />
            <SolutionBridgeSection />
            <HowItWorksSection />
            <FeaturesSection />
            <MetricsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}
