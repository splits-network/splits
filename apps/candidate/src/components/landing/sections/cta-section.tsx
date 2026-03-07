"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
import { AuthenticatedCTAWrapper } from "@/components/authenticated-cta-wrapper";

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <AuthenticatedCTAWrapper>
            <section
                ref={sectionRef}
                className="py-24 bg-primary text-primary-content overflow-hidden relative"
            >
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative ">
                    <div className="scroll-reveal fade-up max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Ready to Take the{" "}
                            <span className="text-secondary">Next Step?</span>
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                            Join thousands of candidates who are finding better
                            opportunities with expert recruiter support
                        </p>
                    </div>

                    <div className="scroll-reveal fade-up stagger-children flex flex-col sm:flex-row gap-4 justify-center mb-10">
                        <Link
                            href="/sign-up"
                            className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 shadow-lg transition-transform duration-200 hover:scale-105"
                        >
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Create Free Account
                        </Link>
                        <Link
                            href="/jobs"
                            className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary transition-transform duration-200 hover:scale-105"
                        >
                            <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                            Browse Jobs First
                        </Link>
                    </div>

                    <div className="scroll-reveal fade-in text-sm max-w-xl mx-auto text-primary-content/70">
                        <div className="flex items-center justify-center gap-6 flex-wrap">
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                No credit card required
                            </span>
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                Takes less than 2 minutes
                            </span>
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-check text-secondary"></i>
                                Free forever
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedCTAWrapper>
    );
}
