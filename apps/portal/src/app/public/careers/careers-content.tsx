"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
} from "@/components/landing/shared/animation-utils";

gsap.registerPlugin(ScrollTrigger);

const whyJoin = [
    {
        icon: "fa-rocket",
        iconColor: "text-primary",
        bgColor: "bg-primary/20",
        title: "Impact",
        description: "Build products that directly improve how thousands of recruiters and companies work together.",
    },
    {
        icon: "fa-users",
        iconColor: "text-secondary",
        bgColor: "bg-secondary/20",
        title: "Culture",
        description: "Collaborative, transparent environment where your ideas and contributions matter.",
    },
    {
        icon: "fa-chart-line",
        iconColor: "text-accent",
        bgColor: "bg-accent/20",
        title: "Growth",
        description: "Join early and grow with the company. Opportunities to learn and lead.",
    },
];

const hiringAreas = [
    { icon: "fa-code", iconColor: "text-primary", title: "Engineering", description: "Full-stack engineers, backend specialists, DevOps, mobile developers" },
    { icon: "fa-palette", iconColor: "text-secondary", title: "Design", description: "Product designers, UX researchers, brand designers" },
    { icon: "fa-box", iconColor: "text-accent", title: "Product", description: "Product managers, product analysts, technical writers" },
    { icon: "fa-chart-line", iconColor: "text-success", title: "Go-to-Market", description: "Sales, marketing, customer success, partnerships" },
    { icon: "fa-headset", iconColor: "text-info", title: "Support", description: "Customer support specialists, community managers" },
    { icon: "fa-briefcase", iconColor: "text-warning", title: "Operations", description: "Finance, HR, legal, operations managers" },
];

const values = [
    { icon: "fa-lightbulb", iconColor: "text-primary", title: "Ownership & Initiative", description: "We value team members who take ownership of problems and drive solutions forward." },
    { icon: "fa-comments", iconColor: "text-secondary", title: "Clear Communication", description: "We communicate openly, directly, and respectfully. Remote work requires great communication." },
    { icon: "fa-user-group", iconColor: "text-accent", title: "Customer Empathy", description: "Understand our users deeply. Build for their success, not just features on a roadmap." },
    { icon: "fa-graduation-cap", iconColor: "text-success", title: "Continuous Learning", description: "Stay curious, keep learning, and help others grow. We invest in development." },
];

export function CareersContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const comingSoonRef = useRef<HTMLDivElement>(null);
    const whyRef = useRef<HTMLDivElement>(null);
    const areasRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Hero animation - no scroll trigger (visible on load)
    useGSAP(
        () => {
            if (!heroRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = heroRef.current.querySelector(".hero-content");
            if (content) {
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
            }
        },
        { scope: heroRef }
    );

    // Coming Soon animation
    useGSAP(
        () => {
            if (!comingSoonRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const icon = comingSoonRef.current.querySelector(".coming-soon-icon");
            const content = comingSoonRef.current.querySelector(".coming-soon-content");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: comingSoonRef.current,
                    start: "top 85%",
                },
            });

            if (icon) {
                tl.fromTo(
                    icon,
                    { scale: 0, y: 20 },
                    {
                        scale: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.bounce,
                    }
                );
            }

            if (content) {
                tl.fromTo(
                    content,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.3"
                );
            }
        },
        { scope: comingSoonRef }
    );

    // Why Join animation
    useGSAP(
        () => {
            if (!whyRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const heading = whyRef.current.querySelector(".section-heading");
            const cards = whyRef.current.querySelectorAll(".why-card");
            const icons = whyRef.current.querySelectorAll(".card-icon");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: whyRef.current,
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
                    }
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
        { scope: whyRef }
    );

    // Hiring Areas animation
    useGSAP(
        () => {
            if (!areasRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const heading = areasRef.current.querySelector(".section-heading");
            const cards = areasRef.current.querySelectorAll(".area-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: areasRef.current,
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
                    }
                );
            }

            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3"
                );
            }
        },
        { scope: areasRef }
    );

    // Values animation
    useGSAP(
        () => {
            if (!valuesRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const heading = valuesRef.current.querySelector(".section-heading");
            const cards = valuesRef.current.querySelectorAll(".value-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: valuesRef.current,
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
                    }
                );
            }

            if (cards.length > 0) {
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3"
                );
            }
        },
        { scope: valuesRef }
    );

    // CTA animation
    useGSAP(
        () => {
            if (!ctaRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            if (prefersReducedMotion) return;

            const content = ctaRef.current.querySelector(".cta-content");

            gsap.fromTo(
                content,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
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
        <>
            {/* Hero Section */}
            <section ref={heroRef} className="hero bg-gradient-to-r from-success to-info text-success-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Careers at Splits Network
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Join us in building the future of collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Coming Soon Message */}
            <section ref={comingSoonRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-12">
                            <i className="coming-soon-icon fa-duotone fa-regular fa-rocket text-8xl text-primary opacity-20"></i>
                        </div>
                        <div className="coming-soon-content">
                            <h2 className="text-4xl font-bold mb-6">Careers Page Coming Soon</h2>
                            <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
                                We're building something special at Splits Network, and we'll be looking for talented
                                individuals to join our team. Check back soon for open positions!
                            </p>
                            <div className="alert alert-info max-w-2xl mx-auto mb-8">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <span>
                                    Want to be notified when we start hiring? Send your resume and areas of interest
                                    to careers@splits.network
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Work With Us */}
            <section ref={whyRef} className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">Why Splits Network?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {whyJoin.map((item, index) => (
                                <div key={index} className="why-card card bg-base-100 shadow">
                                    <div className="card-body text-center">
                                        <div className={`card-icon w-16 h-16 rounded-full ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                                            <i className={`fa-duotone fa-regular ${item.icon} ${item.iconColor} text-2xl`}></i>
                                        </div>
                                        <h3 className="card-title justify-center text-xl mb-3">{item.title}</h3>
                                        <p className="text-base-content/70">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Areas We're Building */}
            <section ref={areasRef} className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">Areas We'll Be Hiring</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {hiringAreas.map((area, index) => (
                                <div key={index} className="area-card card bg-base-200 shadow">
                                    <div className="card-body">
                                        <h3 className="card-title">
                                            <i className={`fa-duotone fa-regular ${area.icon} ${area.iconColor}`}></i>
                                            {area.title}
                                        </h3>
                                        <p className="text-sm text-base-content/70 mt-2">
                                            {area.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section ref={valuesRef} className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="section-heading text-4xl font-bold mb-12 text-center">What We Value</h2>
                        <div className="space-y-6">
                            {values.map((value, index) => (
                                <div key={index} className="value-card card bg-base-100 text-base-content shadow">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <i className={`fa-duotone fa-regular ${value.icon} ${value.iconColor} text-2xl mt-1`}></i>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                                                <p className="text-base-content/70">
                                                    {value.description}
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
            <section ref={ctaRef} className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="cta-content container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Interested in Joining?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Send your resume and tell us what excites you about Splits
                    </p>
                    <a href="mailto:careers@splits.network" className="btn btn-lg btn-neutral">
                        <i className="fa-duotone fa-regular fa-envelope"></i>
                        Email careers@splits.network
                    </a>
                    <p className="mt-6 text-sm opacity-75">
                        We'll reach out when relevant positions open up
                    </p>
                </div>
            </section>
        </>
    );
}
