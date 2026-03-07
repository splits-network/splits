"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "@splits-network/basel-ui";
import { AuthenticatedCTAWrapper } from "@/components/auth/authenticated-cta-wrapper";

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    return (
        <AuthenticatedCTAWrapper>
            <section
                ref={sectionRef}
                id="pricing"
                className="py-24 bg-neutral text-neutral-content overflow-hidden relative"
            >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative ">
                    <div className="scroll-reveal fade-up">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Your next split placement
                            <br />
                            <span className="text-primary">
                                could close next week
                            </span>
                        </h2>
                        <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
                            Stop juggling spreadsheets and email threads. Give
                            your split placements a proper home.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 stagger-children">
                        <Link
                            href="/sign-up"
                            className="scroll-reveal scale-in btn btn-lg btn-primary shadow-lg hover:scale-105 transition-transform duration-200"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Join as a Recruiter
                        </Link>
                        <Link
                            href="/sign-up"
                            className="scroll-reveal scale-in btn btn-lg btn-secondary shadow-lg hover:scale-105 transition-transform duration-200"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>

                    <p className="scroll-reveal fade-in text-sm max-w-xl mx-auto text-neutral-content/60">
                        Join recruiters and companies building transparent
                        partnerships on Splits Network.
                    </p>
                </div>
            </section>
        </AuthenticatedCTAWrapper>
    );
}
