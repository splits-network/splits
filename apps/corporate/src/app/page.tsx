import type { Metadata } from "next";
import { CTASection } from "@/components/landing/sections/cta-section";
import { EcosystemSection } from "@/components/landing/sections/ecosystem-section";
import { FAQSection } from "@/components/landing/sections/faq-section";
import { ForCandidatesSection } from "@/components/landing/sections/for-candidates-section";
import { ForCompaniesSection } from "@/components/landing/sections/for-companies-section";
import { ForRecruitersSection } from "@/components/landing/sections/for-recruiters-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { MetricsSection } from "@/components/landing/sections/metrics-section";
import { ProblemSection } from "@/components/landing/sections/problem-section";
import { SolutionSection } from "@/components/landing/sections/solution-section";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Modern Recruiting & Candidate Experience | Employment Networks",
    description:
        "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates. Two platforms, one connected ecosystem for transparent recruiting.",
};

export default function HomePage() {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Employment Networks - Modern Recruiting & Candidate Experience",
        url: "https://employment-networks.com",
        description:
            "Employment Networks powers Splits Network for recruiters and Applicant Network for candidates.",
        isPartOf: {
            "@type": "WebSite",
            name: "Employment Networks",
            url: "https://employment-networks.com",
        },
    };

    return (
        <>
            <JsonLd data={homeJsonLd} id="employment-home-jsonld" />
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <ForRecruitersSection />
            <ForCandidatesSection />
            <ForCompaniesSection />
            <EcosystemSection />
            <MetricsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}
