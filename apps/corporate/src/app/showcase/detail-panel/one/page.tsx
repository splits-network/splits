"use client";

import { useRef } from "react";
import { PanelSection } from "./panel-section";
import { RecruiterPanel } from "./panels/recruiter-panel";
import { CandidatePanel } from "./panels/candidate-panel";
import { CompanyPanel } from "./panels/company-panel";
import { RolePanel } from "./panels/role-panel";
import { ApplicationPanel } from "./panels/application-panel";
import { PlacementPanel } from "./panels/placement-panel";
import { FirmPanel } from "./panels/firm-panel";
import { MatchPanel } from "./panels/match-panel";
import { InvitationPanel } from "./panels/invitation-panel";
import { ReferralPanel } from "./panels/referral-panel";
import { useScrollReveal } from "@splits-network/basel-ui";

export default function DetailPanelShowcase() {
    const mainRef = useRef<HTMLElement>(null);

    useScrollReveal(mainRef);

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* Hero */}
            <section className="hero-section scroll-reveal fade-up relative bg-base-300 text-base-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative container mx-auto px-6 lg:px-12 max-w-4xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40 mb-4">
                        Showcase / Detail Panels
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-4">
                        Detail Panels
                    </h1>
                    <p className="text-lg text-base-content/60 max-w-2xl">
                        Standardized detail panels used across grid view
                        drawers, table row expansion, and split view detail
                        areas. Each panel follows the Basel design system with
                        dark header, stats strip, and tabbed content.
                    </p>
                </div>
            </section>

            {/* Panels */}
            <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <PanelSection
                    title="Recruiter"
                    description="Used in the recruiter grid drawer and split view. Shows firm, stats, specialties, and contact info."
                >
                    <RecruiterPanel />
                </PanelSection>

                <PanelSection
                    title="Candidate"
                    description="Candidate detail in grid drawers. Shows skills, experience, documents, and application history."
                >
                    <CandidatePanel />
                </PanelSection>

                <PanelSection
                    title="Company"
                    description="Company detail panel for the marketplace. Shows overview, perks, culture tags, and open roles."
                >
                    <CompanyPanel />
                </PanelSection>

                <PanelSection
                    title="Role / Job"
                    description="Job detail panel with requirements, skills, salary info, and recruiter activity timeline."
                >
                    <RolePanel />
                </PanelSection>

                <PanelSection
                    title="Application"
                    description="Application review panel showing candidate-job match, cover letter, AI analysis, and reviewer notes."
                >
                    <ApplicationPanel />
                </PanelSection>

                <PanelSection
                    title="Placement"
                    description="Placement detail with commission breakdown, candidate/company info, and milestone timeline."
                >
                    <PlacementPanel />
                </PanelSection>

                <PanelSection
                    title="Firm"
                    description="Recruiting firm detail showing team members, performance metrics, and partnership status."
                >
                    <FirmPanel />
                </PanelSection>

                <PanelSection
                    title="AI Match"
                    description="AI-generated match analysis between a candidate and job. Shows skill overlap, strengths, and concerns."
                >
                    <MatchPanel />
                </PanelSection>

                <PanelSection
                    title="Invitation"
                    description="Team invitation detail with message, recipient info, and delivery/response history."
                >
                    <InvitationPanel />
                </PanelSection>

                <PanelSection
                    title="Referral Code"
                    description="Referral code performance panel with usage statistics, conversion rates, and configuration."
                >
                    <ReferralPanel />
                </PanelSection>
            </div>
        </main>
    );
}
