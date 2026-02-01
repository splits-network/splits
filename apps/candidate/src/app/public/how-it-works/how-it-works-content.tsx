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

const processSteps = [
    {
        number: 1,
        color: "bg-primary",
        title: "Create Your Profile",
        description: "Sign up for free and build your professional profile. Upload your resume, add your skills, experience, and career preferences. Tell us what you're looking for in your next role.",
        icon: "fa-user-circle",
        iconColor: "text-primary",
        features: [
            "Quick 5-minute profile setup",
            "Import your resume automatically",
            "Set your job preferences and requirements",
            "100% private until you apply",
        ],
    },
    {
        number: 2,
        color: "bg-secondary",
        title: "Browse & Apply",
        description: "Explore thousands of opportunities from top companies. When you find a role you love, apply with one click. Our expert recruiters specialize in those specific roles and industries.",
        icon: "fa-magnifying-glass-plus",
        iconColor: "text-secondary",
        features: [
            "Advanced search filters by industry, location, and more",
            "See recruiter profiles and specializations",
            "One-click applications with your profile",
            "Matched with specialized recruiters automatically",
        ],
    },
    {
        number: 3,
        color: "bg-accent",
        title: "Get Hired",
        description: "Your dedicated recruiter will guide you through the entire hiring process. They'll advocate for you, provide interview prep, negotiate on your behalf, and celebrate when you land the job.",
        icon: "fa-trophy",
        iconColor: "text-accent",
        features: [
            "Real-time application tracking and updates",
            "Expert interview preparation and coaching",
            "Salary negotiation support",
            "Direct communication with your recruiter",
        ],
    },
];

const keyFeatures = [
    { icon: "fa-shield-halved", iconColor: "text-primary", bgColor: "bg-primary/10", title: "100% Free", description: "No hidden fees. Ever. Candidates never pay to use our platform." },
    { icon: "fa-user-tie", iconColor: "text-secondary", bgColor: "bg-secondary/10", title: "Expert Recruiters", description: "Work with specialized recruiters who know your industry inside out." },
    { icon: "fa-chart-line", iconColor: "text-accent", bgColor: "bg-accent/10", title: "Track Progress", description: "See exactly where you are in the hiring process at all times." },
    { icon: "fa-comments", iconColor: "text-success", bgColor: "bg-success/10", title: "Direct Communication", description: "Message your recruiter directly through our platform anytime." },
];

const faqItems = [
    { question: "Is Applicant Network really free for candidates?", answer: "Yes! Applicant Network is 100% free for all job seekers. You'll never pay a fee to create a profile, browse jobs, apply, or work with recruiters. Recruiters pay a fee only when they successfully place a candidate." },
    { question: "How do recruiters get paid?", answer: "Recruiters earn a placement fee from the hiring company when you're successfully hired. This means they're motivated to find you the best possible match and support you throughout the process." },
    { question: "Can I apply to multiple jobs at once?", answer: "Absolutely! Apply to as many positions as you'd like. Each application is reviewed by a specialized recruiter who will reach out if you're a good fit for the role." },
    { question: "What if I don't hear back from a recruiter?", answer: "You'll receive status updates on your applications through your dashboard. If a recruiter doesn't reach out within a few days, it usually means the role isn't the right match, but you can always apply to other opportunities." },
    { question: "Is my information private and secure?", answer: "Your privacy is our top priority. Your profile is private until you apply to a job. We use industry-standard encryption and never share your information without your explicit permission." },
];

export function HowItWorksContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Hero animation - no scroll trigger (visible on load)
    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;

            const badge = heroRef.current.querySelector(".hero-badge");
            const heading = heroRef.current.querySelector("h1");
            const description = heroRef.current.querySelector(".hero-description");

            const tl = gsap.timeline();

            if (badge) {
                tl.fromTo(
                    badge,
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.bounce }
                );
            }

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
                    "-=0.3"
                );
            }

            if (description) {
                tl.fromTo(
                    description,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
                    "-=0.3"
                );
            }
        },
        { scope: heroRef }
    );

    // Process Steps animation
    useGSAP(
        () => {
            if (!stepsRef.current || prefersReducedMotion()) return;

            const steps = stepsRef.current.querySelectorAll(".process-step");

            steps.forEach((step, index) => {
                const numberBadge = step.querySelector(".step-number");
                const content = step.querySelector(".step-content");
                const card = step.querySelector(".step-card");
                const features = step.querySelectorAll(".step-feature");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: step,
                        start: "top 80%",
                    },
                });

                // Alternate slide direction based on step position
                const isEven = index % 2 === 1;

                if (numberBadge) {
                    tl.fromTo(
                        numberBadge,
                        { scale: 0 },
                        { scale: 1, duration: duration.normal, ease: easing.bounce }
                    );
                }

                if (content) {
                    tl.fromTo(
                        content,
                        { opacity: 0, x: isEven ? 40 : -40 },
                        { opacity: 1, x: 0, duration: duration.normal, ease: easing.smooth },
                        "-=0.4"
                    );
                }

                if (card) {
                    tl.fromTo(
                        card,
                        { opacity: 0, x: isEven ? -40 : 40, scale: 0.95 },
                        { opacity: 1, x: 0, scale: 1, duration: duration.normal, ease: easing.smooth },
                        "-=0.5"
                    );
                }

                if (features.length > 0) {
                    tl.fromTo(
                        features,
                        { opacity: 0, x: -20 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: duration.fast,
                            ease: easing.smooth,
                            stagger: stagger.tight,
                        },
                        "-=0.3"
                    );
                }
            });
        },
        { scope: stepsRef }
    );

    // Key Features animation
    useGSAP(
        () => {
            if (!featuresRef.current || prefersReducedMotion()) return;

            const heading = featuresRef.current.querySelector(".section-heading");
            const cards = featuresRef.current.querySelectorAll(".feature-card");
            const icons = featuresRef.current.querySelectorAll(".feature-icon");

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
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth }
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
                    "-=0.3"
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
                    "-=0.5"
                );
            }
        },
        { scope: featuresRef }
    );

    // FAQ animation
    useGSAP(
        () => {
            if (!faqRef.current || prefersReducedMotion()) return;

            const heading = faqRef.current.querySelector(".section-heading");
            const items = faqRef.current.querySelectorAll(".faq-item");
            const cta = faqRef.current.querySelector(".faq-cta");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: faqRef.current,
                    start: "top 80%",
                },
            });

            if (heading) {
                tl.fromTo(
                    heading,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth }
                );
            }

            if (items.length > 0) {
                tl.fromTo(
                    items,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3"
                );
            }

            if (cta) {
                tl.fromTo(
                    cta,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth },
                    "-=0.2"
                );
            }
        },
        { scope: faqRef }
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
                }
            );
        },
        { scope: ctaRef }
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Hero Section */}
            <section ref={heroRef} className="text-center mb-16 overflow-hidden">
                <div className="hero-badge badge badge-primary badge-lg mb-4">
                    <i className="fa-duotone fa-regular fa-route mr-2"></i>
                    Your Path to Success
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">It Works</span>
                </h1>
                <p className="hero-description text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto">
                    Finding your dream job is easier than you think. Follow our simple 3-step process to connect with expert recruiters and land the perfect opportunity.
                </p>
            </section>

            {/* Process Steps */}
            <section ref={stepsRef} className="mb-16 overflow-hidden">
                <div className="space-y-16">
                    {processSteps.map((step, index) => (
                        <div key={step.number} className="process-step grid md:grid-cols-2 gap-12 items-center">
                            <div className={`step-content ${index % 2 === 0 ? "order-2 md:order-1" : ""}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`step-number w-16 h-16 rounded-full ${step.color} flex items-center justify-center text-white text-2xl font-bold`}>
                                        {step.number}
                                    </div>
                                    <h2 className="text-4xl font-bold">{step.title}</h2>
                                </div>
                                <p className="text-lg text-base-content/80 mb-6">
                                    {step.description}
                                </p>
                                <ul className="space-y-3">
                                    {step.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="step-feature flex items-start gap-3">
                                            <i className="fa-duotone fa-regular fa-check-circle text-success text-xl mt-1"></i>
                                            <span className="text-base-content/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={index % 2 === 0 ? "order-1 md:order-2" : ""}>
                                <div className="step-card card bg-base-200 shadow">
                                    <div className="card-body">
                                        <div className="text-center py-8">
                                            <i className={`fa-duotone fa-regular ${step.icon} text-9xl ${step.iconColor} opacity-20`}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Key Features */}
            <section ref={featuresRef} className="mb-16 bg-base-200 -mx-4 px-4 py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <h2 className="section-heading text-4xl font-bold text-center mb-12">What Makes Us Different</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {keyFeatures.map((feature, index) => (
                            <div key={index} className="feature-card card bg-base-100 shadow">
                                <div className="card-body text-center">
                                    <div className={`feature-icon w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4`}>
                                        <i className={`fa-duotone fa-regular ${feature.icon} text-3xl ${feature.iconColor}`}></i>
                                    </div>
                                    <h3 className="card-title justify-center text-lg">{feature.title}</h3>
                                    <p className="text-sm text-base-content/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section ref={faqRef} className="mb-16 overflow-hidden">
                <h2 className="section-heading text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqItems.map((faq, index) => (
                        <div key={index} className="faq-item collapse collapse-plus bg-base-200">
                            <input type="radio" name="faq-accordion" defaultChecked={index === 0} />
                            <div className="collapse-title text-xl font-medium">
                                {faq.question}
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/80">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="faq-cta text-center mt-8">
                    <Link href="/help" className="btn btn-outline">
                        <i className="fa-duotone fa-regular fa-circle-question mr-2"></i>
                        Visit Help Center
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="overflow-hidden">
                <div className="cta-content text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
                        Join thousands of candidates who are finding their dream jobs with Applicant Network today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up" className="btn btn-primary btn-lg">
                            <i className="fa-duotone fa-regular fa-user-plus mr-2"></i>
                            Create Free Account
                        </Link>
                        <Link href="/public/jobs" className="btn btn-outline btn-lg">
                            <i className="fa-duotone fa-regular fa-magnifying-glass mr-2"></i>
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
