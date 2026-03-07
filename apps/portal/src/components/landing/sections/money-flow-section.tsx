"use client";

import { useRef } from "react";
import { useScrollReveal, useAnimatedCounter } from "@splits-network/basel-ui";

const exampleBreakdown = [
    { value: 120000, label: "Candidate Salary", color: "text-primary", prefix: "$" },
    { value: 24000, label: "Placement Fee (20%)", color: "text-secondary", prefix: "$" },
    { value: 18000, label: "Recruiter Share (75%)", color: "text-accent", prefix: "$" },
];

export function MoneyFlowSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    const salaryRef = useAnimatedCounter(120000, { prefix: "$", duration: 1500 });
    const feeRef = useAnimatedCounter(24000, { prefix: "$", duration: 1500 });
    const shareRef = useAnimatedCounter(18000, { prefix: "$", duration: 1500 });

    return (
        <section ref={sectionRef} className="py-24 bg-base-100 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div className="scroll-reveal fade-up text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Follow the money
                    </h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        See exactly where every dollar goes. Clear terms, no
                        surprise clawbacks.
                    </p>
                </div>

                {/* Flow Diagram */}
                <div className="max-w-5xl mx-auto mb-16">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 stagger-children-loose">
                        {/* Company Card */}
                        <div className="scroll-reveal scale-in card bg-primary text-primary-content shadow-xl w-full lg:w-56">
                            <div className="card-body items-center text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                    <i className="fa-duotone fa-regular fa-building text-3xl"></i>
                                </div>
                                <h3 className="card-title text-lg">Company</h3>
                                <p className="text-sm opacity-80">
                                    Pays placement fee
                                </p>
                            </div>
                        </div>

                        {/* Arrow 1 */}
                        <div className="hidden lg:flex items-center justify-center w-20">
                            <svg className="w-full h-8" viewBox="0 0 80 32">
                                <path
                                    d="M0 16 L60 16 L50 6 M60 16 L50 26"
                                    fill="none"
                                    stroke="oklch(var(--color-primary))"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="lg:hidden flex items-center justify-center h-12">
                            <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-primary"></i>
                        </div>

                        {/* Platform Card */}
                        <div className="scroll-reveal scale-in card bg-secondary text-secondary-content shadow-xl w-full lg:w-56">
                            <div className="card-body items-center text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                    <i className="fa-duotone fa-regular fa-handshake text-3xl"></i>
                                </div>
                                <h3 className="card-title text-lg">
                                    Splits Network
                                </h3>
                                <p className="text-sm opacity-80">
                                    Platform share (25%)
                                </p>
                            </div>
                        </div>

                        {/* Arrow 2 */}
                        <div className="hidden lg:flex items-center justify-center w-20">
                            <svg className="w-full h-8" viewBox="0 0 80 32">
                                <path
                                    d="M0 16 L60 16 L50 6 M60 16 L50 26"
                                    fill="none"
                                    stroke="oklch(var(--color-secondary))"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="lg:hidden flex items-center justify-center h-12">
                            <i className="fa-duotone fa-regular fa-arrow-down text-3xl text-secondary"></i>
                        </div>

                        {/* Recruiter Card */}
                        <div className="scroll-reveal scale-in card bg-accent text-accent-content shadow-xl w-full lg:w-56">
                            <div className="card-body items-center text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                    <i className="fa-duotone fa-regular fa-user-tie text-3xl"></i>
                                </div>
                                <h3 className="card-title text-lg">
                                    Recruiter
                                </h3>
                                <p className="text-sm opacity-80">
                                    Recruiter share (75%)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Example Breakdown */}
                <div className="scroll-reveal fade-up max-w-4xl mx-auto">
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h3 className="text-xl font-bold text-center mb-6">
                                Example Placement
                            </h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        <span ref={salaryRef}>$0</span>
                                    </div>
                                    <div className="text-sm text-base-content/70">
                                        {exampleBreakdown[0].label}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-secondary mb-2">
                                        <span ref={feeRef}>$0</span>
                                    </div>
                                    <div className="text-sm text-base-content/70">
                                        {exampleBreakdown[1].label}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-accent mb-2">
                                        <span ref={shareRef}>$0</span>
                                    </div>
                                    <div className="text-sm text-base-content/70">
                                        {exampleBreakdown[2].label}
                                    </div>
                                </div>
                            </div>
                            <div className="divider my-4"></div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-base-content/60">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                    <span>Platform share: $6,000 (25%)</span>
                                </div>
                                <div className="hidden sm:block">•</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                                    <span>
                                        Recruiter receives: $18,000 (75%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
