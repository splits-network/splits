import type { Metadata } from "next";
import { CTASection } from "@/components/landing/sections/cta-section";
import { FAQSection } from "@/components/landing/sections/faq-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works-section";
import { MetricsSection } from "@/components/landing/sections/metrics-section";
import { ProblemSection } from "@/components/landing/sections/problem-section";
import { SolutionBridgeSection } from "@/components/landing/sections/solution-bridge-section";

export const metadata: Metadata = {
    title: "Find Your Next Career Opportunity",
    description:
        "Browse thousands of roles and connect with expert recruiters on Applicant Network.",
};

export default async function CandidateHomePage() {
    return (
        <>
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
