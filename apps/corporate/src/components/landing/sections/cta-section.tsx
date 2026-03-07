"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="py-24 bg-gradient-to-br from-primary to-secondary text-white overflow-hidden relative"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative ">
                <div
                    className="scroll-reveal fade-up text-center mb-12 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Ready to transform how you recruit?
                    </h2>
                    <p className="text-xl opacity-90">
                        Join the ecosystem that&apos;s making recruiting work
                        for everyone
                    </p>
                </div>

                <div
                    className="scroll-reveal fade-up grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 stagger-children"
                >
                    {/* Recruiters Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Recruiters</div>
                                <div className="text-xs opacity-70">
                                    Splits Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Join a collaborative marketplace with curated roles
                            and transparent splits.
                        </p>
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full transition-transform hover:scale-105"
                        >
                            Join Network
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>

                    {/* Companies Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Companies</div>
                                <div className="text-xs opacity-70">
                                    Splits Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Access a network of recruiters with full pipeline
                            visibility and pay-on-hire.
                        </p>
                        <a
                            href="https://splits.network/sign-up"
                            className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 w-full transition-transform hover:scale-105"
                        >
                            Post a Role
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>

                    {/* Candidates Card */}
                    <div className="cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-xl"></i>
                            </div>
                            <div>
                                <div className="font-bold">Candidates</div>
                                <div className="text-xs opacity-70">
                                    Applicant Network
                                </div>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mb-6">
                            Get matched with expert recruiters and never get
                            ghosted again. Free forever.
                        </p>
                        <a
                            href="https://applicant.network/sign-up"
                            className="btn btn-sm bg-white text-secondary hover:bg-white/90 border-0 w-full transition-transform hover:scale-105"
                        >
                            Create Profile
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div className="scroll-reveal fade-in text-center">
                    <p className="text-sm opacity-70 mb-4">
                        Questions? Reach out to us directly.
                    </p>
                    <a
                        href="mailto:hello@employment-networks.com"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        hello@employment-networks.com
                    </a>
                </div>
            </div>
        </section>
    );
}
