"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
    prefersReducedMotion,
} from "@/components/landing/shared/animation-utils";

gsap.registerPlugin(ScrollTrigger);

const benefits = [
    {
        icon: "fa-users",
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
        title: "Access Top Talent",
        description:
            "Connect with thousands of pre-qualified candidates actively seeking opportunities in your specialized industries.",
    },
    {
        icon: "fa-sack-dollar",
        iconColor: "text-secondary",
        bgColor: "bg-secondary/10",
        title: "Competitive Fees",
        description:
            "Earn industry-standard placement fees with transparent terms. Get paid quickly when your candidates are hired.",
    },
    {
        icon: "fa-chart-line",
        iconColor: "text-accent",
        bgColor: "bg-accent/10",
        title: "Powerful Tools",
        description:
            "Manage your pipeline, track placements, and communicate with candidates—all in one intuitive platform.",
    },
];

const howItWorksSteps = [
    {
        number: 1,
        color: "bg-primary",
        title: "Create Your Profile",
        description:
            "Sign up and showcase your expertise. Specify your industries, roles, and geographic focus. Complete verification to build trust with candidates.",
        features: [
            "Quick profile setup",
            "Highlight specializations",
            "Complete verification process",
            "Set your availability",
        ],
    },
    {
        number: 2,
        color: "bg-secondary",
        title: "Post Jobs & Find Candidates",
        description:
            "Create job postings for your client companies. Browse our talent pool and get matched with candidates based on your specialization.",
        features: [
            "Post unlimited job openings",
            "Receive qualified applications",
            "Search candidate database",
            "AI-powered candidate matching",
        ],
    },
    {
        number: 3,
        color: "bg-accent",
        title: "Make Placements & Get Paid",
        description:
            "Guide candidates through the hiring process. When they're hired, submit your placement and receive payment within days.",
        features: [
            "Track all placements in one dashboard",
            "Automated fee calculations",
            "Fast payment processing",
            "Build your success metrics",
        ],
    },
];

const features = [
    {
        icon: "fa-briefcase",
        iconColor: "text-primary",
        title: "Job Management",
        description:
            "Create, edit, and manage unlimited job postings with rich descriptions and requirements.",
    },
    {
        icon: "fa-user-check",
        iconColor: "text-secondary",
        title: "Candidate Tracking",
        description:
            "Track all candidate interactions, applications, and placement progress in real-time.",
    },
    {
        icon: "fa-comments",
        iconColor: "text-accent",
        title: "Direct Messaging",
        description:
            "Communicate directly with candidates through our secure messaging platform.",
    },
    {
        icon: "fa-file-invoice-dollar",
        iconColor: "text-success",
        title: "Payment Tracking",
        description:
            "Automated invoicing and payment tracking with transparent fee structures.",
    },
    {
        icon: "fa-chart-simple",
        iconColor: "text-info",
        title: "Analytics & Reports",
        description:
            "Track your performance with detailed analytics on placements, earnings, and more.",
    },
    {
        icon: "fa-mobile-screen",
        iconColor: "text-warning",
        title: "Mobile Access",
        description:
            "Manage your recruiting business on the go with our mobile-optimized platform.",
    },
];

const pricingPoints = [
    {
        title: "Free to Join",
        description: "No signup fees or monthly subscriptions",
    },
    {
        title: "Competitive Placement Fees",
        description:
            "Earn industry-standard percentages on successful placements",
    },
    {
        title: "Fast Payouts",
        description:
            "Receive payment within 5 business days of placement verification",
    },
    {
        title: "No Hidden Fees",
        description: "What you see is what you get—100% transparent",
    },
];

const testimonials = [
    {
        initials: "JD",
        name: "Jessica Davis",
        role: "Tech Recruiter",
        quote: "Splits Network has transformed my recruiting practice. The platform is intuitive, and I'm connecting with top candidates every day.",
    },
    {
        initials: "MR",
        name: "Michael Rodriguez",
        role: "Healthcare Recruiter",
        quote: "Best recruiting platform I've used. The tools are powerful, payments are fast, and candidates are high-quality.",
    },
    {
        initials: "SP",
        name: "Sarah Park",
        role: "Finance Recruiter",
        quote: "I've tripled my placements since joining Splits Network. The candidate quality and platform features are unmatched.",
    },
];

export function ForRecruitersContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Hero animation
    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;

            const badge = heroRef.current.querySelector(".hero-badge");
            const heading = heroRef.current.querySelector("h1");
            const description =
                heroRef.current.querySelector(".hero-description");
            const buttons = heroRef.current.querySelectorAll(".hero-btn");

            const tl = gsap.timeline();

            if (badge) {
                tl.fromTo(
                    badge,
                    { opacity: 0, y: -20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.bounce,
                    },
                );
            }
            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3",
                );
            }
            if (description) {
                tl.fromTo(
                    description,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3",
                );
            }
            if (buttons.length > 0) {
                tl.fromTo(
                    buttons,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.2",
                );
            }
        },
        { scope: heroRef },
    );

    // Benefits animation
    useGSAP(
        () => {
            if (!benefitsRef.current || prefersReducedMotion()) return;

            const heading =
                benefitsRef.current.querySelector(".section-heading");
            const cards = benefitsRef.current.querySelectorAll(".benefit-card");
            const icons = benefitsRef.current.querySelectorAll(".benefit-icon");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: benefitsRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }
            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3",
                );
            }
            if (icons.length > 0) {
                tl.fromTo(
                    icons,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.tight,
                    },
                    "-=0.5",
                );
            }
        },
        { scope: benefitsRef },
    );

    // How It Works animation
    useGSAP(
        () => {
            if (!howItWorksRef.current || prefersReducedMotion()) return;

            const heading =
                howItWorksRef.current.querySelector(".section-heading");
            const steps = howItWorksRef.current.querySelectorAll(".how-step");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: howItWorksRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }

            steps.forEach((step, index) => {
                const isEven = index % 2 === 1;
                const content = step.querySelector(".step-content");
                const card = step.querySelector(".step-card");
                const number = step.querySelector(".step-number");

                if (number) {
                    tl.fromTo(
                        number,
                        { scale: 0 },
                        {
                            scale: 1,
                            duration: duration.normal,
                            ease: easing.bounce,
                        },
                        index === 0 ? "-=0.2" : "-=0.5",
                    );
                }
                if (content) {
                    tl.fromTo(
                        content,
                        { opacity: 0, x: isEven ? -40 : 40 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: duration.normal,
                            ease: easing.smooth,
                        },
                        "-=0.4",
                    );
                }
                if (card) {
                    tl.fromTo(
                        card,
                        { opacity: 0, x: isEven ? 40 : -40 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: duration.normal,
                            ease: easing.smooth,
                        },
                        "-=0.5",
                    );
                }
            });
        },
        { scope: howItWorksRef },
    );

    // Features animation
    useGSAP(
        () => {
            if (!featuresRef.current || prefersReducedMotion()) return;

            const heading =
                featuresRef.current.querySelector(".section-heading");
            const cards = featuresRef.current.querySelectorAll(".feature-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }
            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: featuresRef },
    );

    // Pricing animation
    useGSAP(
        () => {
            if (!pricingRef.current || prefersReducedMotion()) return;

            const content =
                pricingRef.current.querySelector(".pricing-content");
            const card = pricingRef.current.querySelector(".pricing-card");
            const items = pricingRef.current.querySelectorAll(".pricing-item");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: pricingRef.current,
                    start: "top 80%",
                },
            });

            if (content) {
                tl.fromTo(
                    content,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }
            if (card) {
                tl.fromTo(
                    card,
                    { opacity: 0, scale: 0.95 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3",
                );
            }
            if (items.length > 0) {
                tl.fromTo(
                    items,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: pricingRef },
    );

    // Testimonials animation
    useGSAP(
        () => {
            if (!testimonialsRef.current || prefersReducedMotion()) return;

            const heading =
                testimonialsRef.current.querySelector(".section-heading");
            const cards =
                testimonialsRef.current.querySelectorAll(".testimonial-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: testimonialsRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            }
            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3",
                );
            }
        },
        { scope: testimonialsRef },
    );

    // CTA animation
    useGSAP(
        () => {
            if (!ctaRef.current || prefersReducedMotion()) return;

            const content = ctaRef.current.querySelector(".cta-content");

            gsap.fromTo(
                content,
                { opacity: 0, y: 30, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 85%",
                    },
                },
            );
        },
        { scope: ctaRef },
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="text-center mb-16 overflow-hidden"
            >
                <div className="hero-badge badge badge-primary badge-lg mb-4">
                    <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
                    For Recruiting Professionals
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    Build Your{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Recruiting Practice
                    </span>
                </h1>
                <p className="hero-description text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto">
                    Splits Network is the premier platform where recruiters
                    connect with top talent and build successful practices.
                    Access thousands of pre-qualified candidates and manage your
                    placements with powerful tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <a
                        href="https://splits.network"
                        className="hero-btn btn btn-primary btn-lg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                        Visit Splits Network
                    </a>
                    <Link
                        href="/how-it-works"
                        className="hero-btn btn btn-outline btn-lg"
                    >
                        <i className="fa-duotone fa-regular fa-circle-info mr-2"></i>
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Benefits Section */}
            <section
                ref={benefitsRef}
                className="mb-16 overflow-hidden"
                id="benefits"
            >
                <h2 className="section-heading text-4xl font-bold text-center mb-12">
                    Why Join Splits Network?
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="benefit-card card bg-base-100 shadow"
                        >
                            <div className="card-body">
                                <div
                                    className={`benefit-icon w-16 h-16 rounded-full ${benefit.bgColor} flex items-center justify-center mb-4`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${benefit.icon} text-3xl ${benefit.iconColor}`}
                                    ></i>
                                </div>
                                <h3 className="card-title">{benefit.title}</h3>
                                <p className="text-base-content/80">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section
                ref={howItWorksRef}
                className="mb-16 bg-base-200 -mx-4 px-4 py-12 overflow-hidden"
                id="how-it-works"
            >
                <div className="max-w-7xl mx-auto">
                    <h2 className="section-heading text-4xl font-bold text-center mb-12">
                        How It Works
                    </h2>
                    <div className="space-y-12">
                        {howItWorksSteps.map((step, index) => (
                            <div
                                key={step.number}
                                className="how-step grid md:grid-cols-2 gap-8 items-center"
                            >
                                <div
                                    className={`step-content ${index % 2 === 1 ? "order-2" : ""}`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className={`step-number w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white text-xl font-bold`}
                                        >
                                            {step.number}
                                        </div>
                                        <h3 className="text-2xl font-bold">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-lg text-base-content/80">
                                        {step.description}
                                    </p>
                                </div>
                                <div
                                    className={`step-card ${index % 2 === 1 ? "order-1" : ""}`}
                                >
                                    <div className="card bg-base-100 shadow">
                                        <div className="card-body">
                                            <ul className="space-y-2">
                                                {step.features.map(
                                                    (feature, fIndex) => (
                                                        <li
                                                            key={fIndex}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                                            <span className="text-sm">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="mb-16 overflow-hidden">
                <h2 className="section-heading text-4xl font-bold text-center mb-12">
                    Platform Features
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card card bg-base-100 shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="card-body">
                                <div className="flex items-center gap-3 mb-2">
                                    <i
                                        className={`fa-duotone fa-regular ${feature.icon} text-2xl ${feature.iconColor}`}
                                    ></i>
                                    <h3 className="card-title text-lg">
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-base-content/70">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section
                ref={pricingRef}
                className="mb-16 bg-base-200 -mx-4 px-4 py-12 overflow-hidden"
            >
                <div className="pricing-content max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-xl text-base-content/80 mb-8">
                        No upfront costs or monthly fees. You only pay when you
                        successfully place a candidate.
                    </p>
                    <div className="pricing-card card bg-base-100 shadow max-w-2xl mx-auto">
                        <div className="card-body">
                            <h3 className="text-3xl font-bold mb-4">
                                Performance-Based Model
                            </h3>
                            <div className="divider"></div>
                            <ul className="space-y-4 text-left">
                                {pricingPoints.map((point, index) => (
                                    <li
                                        key={index}
                                        className="pricing-item flex items-start gap-3"
                                    >
                                        <i className="fa-duotone fa-regular fa-check-circle text-success text-xl mt-1"></i>
                                        <div>
                                            <strong>{point.title}</strong>
                                            <p className="text-sm text-base-content/70">
                                                {point.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section ref={testimonialsRef} className="mb-16 overflow-hidden">
                <h2 className="section-heading text-4xl font-bold text-center mb-12">
                    What Splits Network Recruiters Say
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="testimonial-card card bg-base-100 shadow"
                        >
                            <div className="card-body">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className="fa-duotone fa-regular fa-star text-warning"
                                        ></i>
                                    ))}
                                </div>
                                <p className="text-base-content/80 italic mb-4">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="avatar avatar-placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-12">
                                            <span>{testimonial.initials}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-base-content/60">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="overflow-hidden">
                <div className="cta-content text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Grow Your Practice?
                    </h2>
                    <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
                        Join hundreds of successful recruiters who are building
                        thriving practices on Splits Network
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://splits.network"
                            className="btn btn-primary btn-lg"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fa-duotone fa-regular fa-rocket mr-2"></i>
                            Join Splits Network
                        </a>
                        <Link
                            href="/contact"
                            className="btn btn-outline btn-lg"
                        >
                            <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
