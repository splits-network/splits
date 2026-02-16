"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
    fadeUp,
    scaleIn,
} from "@/components/landing/shared/animation-utils";
import { RTICalculator } from "@/components/calculator";
import { DynamicPricingSection } from "@/components/pricing";
import Link from "next/link";
import { pricingFaqs } from "./pricing-faq-data";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const faqs = pricingFaqs;

export function PricingContent() {
    const heroRef = useRef<HTMLElement>(null);
    const pricingCardsRef = useRef<HTMLElement>(null);
    const companiesRef = useRef<HTMLElement>(null);
    const calculatorRef = useRef<HTMLElement>(null);
    const comparisonRef = useRef<HTMLElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const faqRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const faqContentRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Hero animations - NO scrollTrigger since it's visible on page load
    useGSAP(
        () => {
            if (!heroRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = heroRef.current.querySelector(".hero-content");
            gsap.fromTo(
                content,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.hero,
                    ease: easing.smooth,
                }
            );
        },
        { scope: heroRef }
    );

    // Pricing cards section animations
    useGSAP(
        () => {
            if (!pricingCardsRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Cards stagger in
            const cards = pricingCardsRef.current.querySelectorAll(
                ".pricing-card, [class*='card bg-']"
            );
            if (cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                        stagger: stagger.normal,
                        scrollTrigger: {
                            trigger: pricingCardsRef.current,
                            start: "top 80%",
                        },
                    }
                );
            }

            // Billing toggle fade in
            const toggle = pricingCardsRef.current.querySelector(".tabs");
            if (toggle) {
                gsap.fromTo(
                    toggle,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        scrollTrigger: {
                            trigger: pricingCardsRef.current,
                            start: "top 85%",
                        },
                    }
                );
            }
        },
        { scope: pricingCardsRef }
    );

    // Companies section animations
    useGSAP(
        () => {
            if (!companiesRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = companiesRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: companiesRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Card scale in
            const card = companiesRef.current.querySelector(".companies-card");
            if (card) {
                gsap.fromTo(card, scaleIn.from, {
                    ...scaleIn.to,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: companiesRef.current,
                        start: "top 75%",
                    },
                });
            }

            // Feature list items pop in
            const listItems = companiesRef.current.querySelectorAll("li");
            if (listItems.length > 0) {
                gsap.fromTo(
                    listItems,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        delay: 0.4,
                        scrollTrigger: {
                            trigger: companiesRef.current,
                            start: "top 70%",
                        },
                    }
                );
            }
        },
        { scope: companiesRef }
    );

    // Calculator section animations
    useGSAP(
        () => {
            if (!calculatorRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const heading = calculatorRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: calculatorRef.current,
                        start: "top 80%",
                    },
                });
            }
        },
        { scope: calculatorRef }
    );

    // Comparison table animations
    useGSAP(
        () => {
            if (!comparisonRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = comparisonRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: comparisonRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Table rows stagger in
            const tableRows = tableRef.current?.querySelectorAll("tbody tr");
            if (tableRows && tableRows.length > 0) {
                gsap.fromTo(
                    tableRows,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: comparisonRef.current,
                            start: "top 75%",
                        },
                    }
                );
            }
        },
        { scope: comparisonRef }
    );

    // FAQ section animations
    useGSAP(
        () => {
            if (!faqRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = faqRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: faqRef.current,
                        start: "top 80%",
                    },
                });
            }

            // FAQ items stagger in
            const faqItems = faqRef.current.querySelectorAll(".faq-item");
            if (faqItems.length > 0) {
                gsap.fromTo(
                    faqItems,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: faqRef.current,
                            start: "top 75%",
                        },
                    }
                );
            }
        },
        { scope: faqRef }
    );

    // CTA section animations
    useGSAP(
        () => {
            if (!ctaRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = ctaRef.current.querySelector(".cta-content");
            if (content) {
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.hero,
                        ease: easing.smooth,
                        scrollTrigger: {
                            trigger: ctaRef.current,
                            start: "top 80%",
                        },
                    }
                );
            }
        },
        { scope: ctaRef }
    );

    const toggleFaq = (index: number) => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // Close currently open item
        if (openFaqIndex !== null && openFaqIndex !== index) {
            const currentContent = faqContentRefs.current[openFaqIndex];
            if (currentContent) {
                if (prefersReducedMotion) {
                    currentContent.style.height = "0px";
                    currentContent.style.opacity = "0";
                } else {
                    gsap.to(currentContent, {
                        height: 0,
                        opacity: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                    });
                }
            }
        }

        // Toggle clicked item
        const content = faqContentRefs.current[index];
        if (content) {
            if (openFaqIndex === index) {
                // Close
                if (prefersReducedMotion) {
                    content.style.height = "0px";
                    content.style.opacity = "0";
                } else {
                    gsap.to(content, {
                        height: 0,
                        opacity: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                    });
                }
                setOpenFaqIndex(null);
            } else {
                // Open
                if (prefersReducedMotion) {
                    content.style.height = "auto";
                    content.style.opacity = "1";
                } else {
                    gsap.set(content, { height: "auto", opacity: 1 });
                    const autoHeight = content.offsetHeight;
                    gsap.fromTo(
                        content,
                        { height: 0, opacity: 0 },
                        {
                            height: autoHeight,
                            opacity: 1,
                            duration: duration.fast,
                            ease: easing.smooth,
                        }
                    );
                }
                setOpenFaqIndex(index);
            }
        }
    };

    // Button hover animation
    const handleButtonHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    const handleButtonLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
        });
    };

    return (
        <>
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="hero bg-secondary text-secondary-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Choose the plan that fits your recruiting business. Higher
                            tiers unlock better payout bonuses and priority access to
                            roles.
                        </p>
                    </div>
                </div>
            </section>

            {/* Dynamic Pricing Cards Section */}
            <section ref={pricingCardsRef} className="overflow-hidden">
                <DynamicPricingSection
                    showBillingToggle={true}
                    defaultAnnual={false}
                    variant="default"
                    selectable={false}
                />
            </section>

            {/* For Companies Pricing */}
            <section ref={companiesRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            <i className="fa-duotone fa-regular fa-building text-secondary"></i>{" "}
                            For Companies
                        </h2>
                        <p className="text-lg text-base-content/70">
                            Post roles for free, pay only on successful hires
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="companies-card card bg-base-100 shadow opacity-0">
                            <div className="card-body">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4">
                                            Free to Post
                                        </h3>
                                        <p className="text-base-content/70 mb-6">
                                            Companies pay nothing to post roles and access
                                            our network of specialized recruiters.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-2 opacity-0">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>Unlimited role postings</span>
                                            </li>
                                            <li className="flex items-start gap-2 opacity-0">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>Access to recruiter network</span>
                                            </li>
                                            <li className="flex items-start gap-2 opacity-0">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>Full ATS pipeline visibility</span>
                                            </li>
                                            <li className="flex items-start gap-2 opacity-0">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>Candidate management tools</span>
                                            </li>
                                            <li className="flex items-start gap-2 opacity-0">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>Communication & notifications</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4">
                                            Pay on Hire
                                        </h3>
                                        <p className="text-base-content/70 mb-6">
                                            Only pay when you successfully hire a candidate.
                                            Set your fee percentage upfront.
                                        </p>
                                        <div className="card bg-secondary text-secondary-content shadow mb-4">
                                            <div className="card-body p-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold mb-2">
                                                        15-25%
                                                    </div>
                                                    <div className="text-sm opacity-90">
                                                        Typical placement fee range
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-base-content/60">
                                            Example: For a $120,000 salary with 20% fee =
                                            $24,000 placement fee. The platform takes a
                                            small percentage, and the recruiter receives
                                            the majority.
                                        </p>
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <div className="text-center">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-secondary btn-lg"
                                        onMouseEnter={handleButtonHover}
                                        onMouseLeave={handleButtonLeave}
                                    >
                                        <i className="fa-duotone fa-regular fa-building"></i>
                                        Post Your First Role
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RTI Calculator Section */}
            <section ref={calculatorRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-4xl font-bold mb-4">
                            <i className="fa-duotone fa-regular fa-calculator text-primary"></i>{" "}
                            Calculate Your Earnings
                        </h2>
                        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                            See exactly how much you&apos;ll earn on a placement across
                            subscription tiers. Higher tiers mean more of the fee goes
                            directly to you.
                        </p>
                    </div>
                    <div className="max-w-6xl mx-auto">
                        <RTICalculator animate />
                    </div>
                </div>
            </section>

            {/* Pricing Comparison Table */}
            <section ref={comparisonRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
                        <p className="text-lg text-base-content/70">
                            See what&apos;s included in each plan
                        </p>
                    </div>
                    <div className="overflow-x-auto max-w-6xl mx-auto">
                        <table ref={tableRef} className="table table-lg">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th className="text-center">Starter</th>
                                    <th className="text-center bg-primary/10">Pro</th>
                                    <th className="text-center">Partner</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="opacity-0">
                                    <td>Monthly Price</td>
                                    <td className="text-center font-bold">Free</td>
                                    <td className="text-center bg-primary/10 font-bold">
                                        $99
                                    </td>
                                    <td className="text-center font-bold">$249</td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Payout Bonuses</td>
                                    <td className="text-center">Base</td>
                                    <td className="text-center bg-primary/10 font-medium">
                                        Higher
                                    </td>
                                    <td className="text-center font-bold">Maximum</td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Access to Open Roles</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Unlimited Submissions</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Full ATS Workflow</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Priority Role Access</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Exclusive Early Access</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Performance Analytics</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Advanced Reporting</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>API Access</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Team Management</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>White-Label Options</td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center bg-primary/10">
                                        <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                    </td>
                                    <td className="text-center">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                    </td>
                                </tr>
                                <tr className="opacity-0">
                                    <td>Support Level</td>
                                    <td className="text-center">Email</td>
                                    <td className="text-center bg-primary/10">
                                        Priority Email
                                    </td>
                                    <td className="text-center">Account Manager</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section - GSAP Accordion */}
            <section ref={faqRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading text-center mb-12 opacity-0">
                        <h2 className="text-3xl font-bold mb-4">Pricing FAQs</h2>
                    </div>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="faq-item bg-base-200 rounded-xl overflow-hidden shadow-sm opacity-0"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-base-300 transition-colors"
                                >
                                    <span className="text-xl font-medium pr-4">
                                        {faq.question}
                                    </span>
                                    <i
                                        className={`fa-duotone fa-regular fa-plus text-lg text-primary transition-transform duration-300 flex-shrink-0 ${openFaqIndex === index ? "rotate-45" : ""}`}
                                    ></i>
                                </button>
                                <div
                                    ref={(el) => {
                                        faqContentRefs.current[index] = el;
                                    }}
                                    className="overflow-hidden"
                                    style={{
                                        height: index === 0 ? "auto" : 0,
                                        opacity: index === 0 ? 1 : 0,
                                    }}
                                >
                                    <div className="px-6 pb-6 text-base-content/70">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                ref={ctaRef}
                className="py-20 bg-primary text-primary-content overflow-hidden"
            >
                <div className="container mx-auto px-4 text-center">
                    <div className="cta-content opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Start Making Placements?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join Splits Network today and start building your recruiting
                            business with transparent, fair participation in split
                            placements.
                        </p>
                        <Link
                            href="/sign-up"
                            className="btn btn-lg btn-neutral"
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            Get Started Free
                        </Link>
                        <p className="mt-6 text-sm opacity-75">
                            No credit card required for Starter • Upgrade anytime
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
