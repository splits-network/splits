import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ComparisonSection } from "@/components/landing/sections/comparison-section";
import { CTASection } from "@/components/landing/sections/cta-section";
import { FAQSection } from "@/components/landing/sections/faq-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { ForCompaniesSection } from "@/components/landing/sections/for-companies-section";
import { ForRecruitersSection } from "@/components/landing/sections/for-recruiters-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works-section";
import { MetricsSection } from "@/components/landing/sections/metrics-section";
import { MoneyFlowSection } from "@/components/landing/sections/money-flow-section";
import { ProblemSection } from "@/components/landing/sections/problem-section";
import { SolutionBridgeSection } from "@/components/landing/sections/solution-bridge-section";
import type { Metadata } from "next";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Recruiting Marketplace for Split Placements",
    description:
        "Collaborate with recruiters, share roles, and split fees on Splits Network.",
};

export default async function HomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Splits Network - Recruiting Marketplace",
        url: "https://splits.network",
        description:
            "Collaborate with recruiters, share roles, and split fees on Splits Network.",
        isPartOf: {
            "@type": "WebSite",
            name: "Splits Network",
            url: "https://splits.network",
        },
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="splits-home-jsonld" />
            <Header />
            <HeroSection />
            <ProblemSection />
            <SolutionBridgeSection />
            <HowItWorksSection />
            <ForRecruitersSection />
            <ForCompaniesSection />
            <MoneyFlowSection />
            <FeaturesSection />
            <ComparisonSection />
            <MetricsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}
