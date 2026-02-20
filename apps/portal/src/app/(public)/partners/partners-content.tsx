"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
    fadeUp,
    scaleIn,
    popIn,
} from "@/components/landing/shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const partnerTypes = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiting Firms",
        description:
            "White-label solutions, team management, and revenue sharing opportunities for established recruiting organizations.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Technology Partners",
        description:
            "Integrate your tools with our platform through our API, create custom workflows, and reach our growing user base.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Associations",
        description:
            "Special pricing for members, co-branded experiences, and collaboration on industry education and best practices.",
        color: "accent",
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Revenue Opportunities",
        color: "success",
        items: [
            "Revenue sharing on referrals",
            "White-label licensing opportunities",
            "Co-marketing initiatives",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Technical Support",
        color: "info",
        items: [
            "Priority API access and support",
            "Dedicated integration assistance",
            "Custom development opportunities",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Marketing & Visibility",
        color: "primary",
        items: [
            "Featured in partner directory",
            "Co-branded content opportunities",
            "Joint webinars and events",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Training & Resources",
        color: "secondary",
        items: [
            "Partner onboarding program",
            "Sales and marketing materials",
            "Ongoing education and updates",
        ],
    },
];

const partnershipOpportunities = [
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Recruiting Firm Partners",
        description:
            "Perfect for established recruiting firms who want to offer split placement capabilities to their recruiters while maintaining their brand",
        color: "primary",
        features: [
            {
                title: "White-Label Platform",
                description: "Custom branding and domain for your recruiting network",
            },
            {
                title: "Team Management",
                description: "Manage multiple recruiters under your organization",
            },
            {
                title: "Revenue Share",
                description: "Earn from your recruiters' platform subscriptions",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-laptop-code",
        title: "Technology Integration Partners",
        description:
            "For software vendors who want to integrate their solutions with Splits Network and reach our growing user base.",
        color: "secondary",
        features: [
            {
                title: "API Access",
                description: "Full API documentation and integration support",
            },
            {
                title: "Marketplace Listing",
                description: "Featured placement in our integrations directory",
            },
            {
                title: "Technical Support",
                description: "Dedicated support for integration development",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Industry Association Partners",
        description:
            "For recruiting associations who want to provide value-added services to their members and promote best practices in split placements.",
        color: "accent",
        features: [
            {
                title: "Member Benefits",
                description: "Special pricing and features for association members",
            },
            {
                title: "Co-Branded Experience",
                description: "Association branding and customized onboarding",
            },
            {
                title: "Education Programs",
                description: "Joint training and certification opportunities",
            },
        ],
    },
];

const processSteps = [
    {
        number: 1,
        title: "Submit Application",
        description:
            "Fill out our partner application form and tell us about your organization and partnership goals.",
        color: "primary",
    },
    {
        number: 2,
        title: "Discovery Call",
        description:
            "Meet with our partnerships team to discuss opportunities and alignment.",
        color: "secondary",
    },
    {
        number: 3,
        title: "Agreement & Onboarding",
        description:
            "Sign partnership agreement and complete onboarding with dedicated support.",
        color: "accent",
    },
    {
        number: 4,
        title: "Launch Partnership",
        description:
            "Go live with co-marketing, technical integration, or white-label deployment.",
        isSuccess: true,
    },
];

export function PartnersContent() {
    const heroRef = useRef<HTMLElement>(null);
    const overviewRef = useRef<HTMLElement>(null);
    const benefitsRef = useRef<HTMLElement>(null);
    const opportunitiesRef = useRef<HTMLElement>(null);
    const currentPartnersRef = useRef<HTMLElement>(null);
    const processRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    // Hero animations
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

    // Overview section animations
    useGSAP(
        () => {
            if (!overviewRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = overviewRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: overviewRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Cards stagger in
            const cards = overviewRef.current.querySelectorAll(".partner-type-card");
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
                        trigger: overviewRef.current,
                        start: "top 75%",
                    },
                }
            );

            // Icons pop
            const icons = overviewRef.current.querySelectorAll(".type-icon");
            gsap.fromTo(icons, popIn.from, {
                ...popIn.to,
                stagger: stagger.normal,
                delay: 0.2,
                scrollTrigger: {
                    trigger: overviewRef.current,
                    start: "top 75%",
                },
            });
        },
        { scope: overviewRef }
    );

    // Benefits section animations
    useGSAP(
        () => {
            if (!benefitsRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = benefitsRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Benefit cards stagger in
            const cards = benefitsRef.current.querySelectorAll(".benefit-card");
            gsap.fromTo(
                cards,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    stagger: stagger.normal,
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: "top 75%",
                    },
                }
            );

            // List items stagger
            const listItems = benefitsRef.current.querySelectorAll(".benefit-item");
            gsap.fromTo(
                listItems,
                { opacity: 0, x: -15 },
                {
                    opacity: 1,
                    x: 0,
                    duration: duration.fast,
                    ease: easing.smooth,
                    stagger: stagger.tight,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: "top 70%",
                    },
                }
            );
        },
        { scope: benefitsRef }
    );

    // Opportunities section animations
    useGSAP(
        () => {
            if (!opportunitiesRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading =
                opportunitiesRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: opportunitiesRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Opportunity cards slide in
            const cards =
                opportunitiesRef.current.querySelectorAll(".opportunity-card");
            cards.forEach((card, index) => {
                const fromX = index % 2 === 0 ? -50 : 50;
                gsap.fromTo(
                    card,
                    { opacity: 0, x: fromX },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                        },
                    }
                );
            });

            // Feature boxes stagger in
            const features =
                opportunitiesRef.current.querySelectorAll(".feature-box");
            features.forEach((feature) => {
                gsap.fromTo(
                    feature,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        scrollTrigger: {
                            trigger: feature.closest(".opportunity-card"),
                            start: "top 80%",
                        },
                    }
                );
            });
        },
        { scope: opportunitiesRef }
    );

    // Current partners section animations
    useGSAP(
        () => {
            if (!currentPartnersRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content =
                currentPartnersRef.current.querySelector(".partners-content");
            if (content) {
                gsap.fromTo(content, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: currentPartnersRef.current,
                        start: "top 80%",
                    },
                });
            }

            const alert = currentPartnersRef.current.querySelector(".alert");
            if (alert) {
                gsap.fromTo(alert, scaleIn.from, {
                    ...scaleIn.to,
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: currentPartnersRef.current,
                        start: "top 80%",
                    },
                });
            }
        },
        { scope: currentPartnersRef }
    );

    // Process section animations
    useGSAP(
        () => {
            if (!processRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade up
            const heading = processRef.current.querySelector(".section-heading");
            if (heading) {
                gsap.fromTo(heading, fadeUp.from, {
                    ...fadeUp.to,
                    scrollTrigger: {
                        trigger: processRef.current,
                        start: "top 80%",
                    },
                });
            }

            // Step cards slide in from left
            const cards = processRef.current.querySelectorAll(".step-card");
            cards.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        delay: index * stagger.normal,
                        scrollTrigger: {
                            trigger: processRef.current,
                            start: "top 75%",
                        },
                    }
                );
            });

            // Number badges pop
            const numbers = processRef.current.querySelectorAll(".step-number");
            gsap.fromTo(
                numbers,
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: duration.normal,
                    ease: easing.bounce,
                    stagger: stagger.normal,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: processRef.current,
                        start: "top 75%",
                    },
                }
            );
        },
        { scope: processRef }
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

    // Hover handlers for cards
    const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: -8,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            duration: 0.3,
            ease: "power2.out",
        });
        const icon = e.currentTarget.querySelector(".type-icon, .card-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1.15,
                rotation: 5,
                duration: 0.3,
                ease: "back.out(1.4)",
            });
        }
    };

    const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            y: 0,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            duration: 0.3,
            ease: "power2.out",
        });
        const icon = e.currentTarget.querySelector(".type-icon, .card-icon");
        if (icon) {
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    };

    // Hover handlers for CTA buttons
    const handleButtonEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
                className="hero bg-gradient-to-r from-secondary to-accent text-secondary-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">Partner With Us</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Join our partner ecosystem and help build the future of
                            collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Partner Program Overview */}
            <section ref={overviewRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="section-heading max-w-5xl mx-auto text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Why Partner With Splits Network?
                        </h2>
                        <p className="text-lg text-base-content/70 max-w-3xl mx-auto">
                            We're building more than a platform—we're creating an
                            ecosystem. Whether you're a recruiting firm, technology
                            provider, or industry association, there's a place for you in
                            our partner network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {partnerTypes.map((type, index) => (
                            <div
                                key={index}
                                className="partner-type-card card bg-base-200 shadow cursor-pointer opacity-0"
                                onMouseEnter={handleCardEnter}
                                onMouseLeave={handleCardLeave}
                            >
                                <div className="card-body text-center">
                                    <div
                                        className={`type-icon w-16 h-16 rounded-full bg-${type.color}/20 flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <i
                                            className={`${type.icon} text-${type.color} text-2xl`}
                                        ></i>
                                    </div>
                                    <h3 className="card-title justify-center text-xl mb-3">
                                        {type.title}
                                    </h3>
                                    <p className="text-base-content/70 text-sm">
                                        {type.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Benefits */}
            <section ref={benefitsRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center opacity-0">
                            Partner Benefits
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="benefit-card card bg-base-100 shadow opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title">
                                            <i
                                                className={`card-icon ${benefit.icon} text-${benefit.color}`}
                                            ></i>
                                            {benefit.title}
                                        </h3>
                                        <ul className="space-y-2 mt-4">
                                            {benefit.items.map((item, itemIndex) => (
                                                <li
                                                    key={itemIndex}
                                                    className="benefit-item flex items-start gap-2 opacity-0"
                                                >
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Opportunities */}
            <section
                ref={opportunitiesRef}
                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center opacity-0">
                            Partnership Opportunities
                        </h2>

                        <div className="space-y-8">
                            {partnershipOpportunities.map((opp, index) => (
                                <div
                                    key={index}
                                    className="opportunity-card card bg-base-200 shadow opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-2xl mb-4">
                                            <i className={`${opp.icon} text-${opp.color}`}></i>
                                            {opp.title}
                                        </h3>
                                        <p className="text-base-content/70 mb-4">
                                            {opp.description}
                                        </p>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {opp.features.map((feature, featureIndex) => (
                                                <div
                                                    key={featureIndex}
                                                    className="feature-box bg-base-100 p-4 rounded-lg opacity-0"
                                                >
                                                    <div className="font-bold mb-2">
                                                        {feature.title}
                                                    </div>
                                                    <p className="text-sm text-base-content/60">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Partners */}
            <section
                ref={currentPartnersRef}
                className="py-20 bg-neutral text-neutral-content overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="partners-content max-w-5xl mx-auto text-center opacity-0">
                        <h2 className="text-4xl font-bold mb-6">Our Partners</h2>
                        <p className="text-lg opacity-80 mb-12">
                            Growing our ecosystem with industry-leading organizations
                        </p>
                        <div className="alert alert-info opacity-0">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <span>
                                We're actively building our partner network. Be among our
                                founding partners and help shape the future of
                                collaborative recruiting.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Process */}
            <section ref={processRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center opacity-0">
                            How to Become a Partner
                        </h2>
                        <div className="space-y-6">
                            {processSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`step-card card shadow opacity-0 ${
                                        step.isSuccess
                                            ? "bg-success text-success-content"
                                            : "bg-base-200"
                                    }`}
                                >
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`step-number w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    step.isSuccess
                                                        ? "bg-success-content/20"
                                                        : `bg-${step.color}/20`
                                                }`}
                                            >
                                                <span
                                                    className={`text-xl font-bold ${
                                                        step.isSuccess ? "" : `text-${step.color}`
                                                    }`}
                                                >
                                                    {step.number}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">
                                                    {step.title}
                                                </h3>
                                                <p
                                                    className={
                                                        step.isSuccess
                                                            ? "opacity-90"
                                                            : "text-base-content/70"
                                                    }
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            Ready to Partner With Us?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join our partner ecosystem and help shape the future of
                            collaborative recruiting.
                        </p>
                        <a
                            href="mailto:partnerships@splits.network"
                            className="btn btn-lg btn-neutral"
                            onMouseEnter={handleButtonEnter}
                            onMouseLeave={handleButtonLeave}
                        >
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            Contact Partnerships Team
                        </a>
                        <p className="mt-6 text-sm opacity-75">
                            Questions? Email us at partnerships@splits.network
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
