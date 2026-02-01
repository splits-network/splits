"use client";

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

const tips = [
    { title: "Research the Company", description: "Understand the company's mission, products, culture, and recent news before your interview.", icon: "magnifying-glass", color: "primary" },
    { title: "Practice Common Questions", description: "Prepare thoughtful answers to behavioral and technical questions using the STAR method.", icon: "comments", color: "secondary" },
    { title: "Prepare Questions to Ask", description: "Have 3-5 insightful questions ready to ask about the role, team, and company.", icon: "circle-question", color: "accent" },
    { title: "Dress Appropriately", description: "Choose professional attire that matches the company culture and role.", icon: "user-tie", color: "info" },
    { title: "Test Your Tech Setup", description: "For virtual interviews, test your camera, microphone, and internet connection ahead of time.", icon: "video", color: "warning" },
    { title: "Follow Up Professionally", description: "Send a thank-you email within 24 hours expressing gratitude and reiterating interest.", icon: "envelope", color: "success" },
];

const commonQuestions = [
    "Tell me about yourself",
    "Why are you interested in this role?",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenge you faced and how you overcame it",
    "Where do you see yourself in 5 years?",
    "Why should we hire you?",
    "Tell me about a time you worked in a team",
    "How do you handle stress and pressure?",
];

const starMethod = [
    { letter: "S", title: "Situation", description: "Describe the context or background" },
    { letter: "T", title: "Task", description: "Explain your responsibility or goal" },
    { letter: "A", title: "Action", description: "Detail the steps you took" },
    { letter: "R", title: "Result", description: "Share the outcomes and impact" },
];

export function InterviewPrepContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const tipsRef = useRef<HTMLDivElement>(null);
    const questionsRef = useRef<HTMLDivElement>(null);
    const starRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Hero animation
    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;
            const icon = heroRef.current.querySelector(".hero-icon");
            const heading = heroRef.current.querySelector("h1");
            const description = heroRef.current.querySelector(".hero-description");

            const tl = gsap.timeline();
            if (icon) tl.fromTo(icon, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: duration.normal, ease: easing.bounce });
            if (heading) tl.fromTo(heading, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: duration.normal, ease: easing.smooth }, "-=0.4");
            if (description) tl.fromTo(description, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth }, "-=0.3");
        },
        { scope: heroRef }
    );

    // Tips animation
    useGSAP(
        () => {
            if (!tipsRef.current || prefersReducedMotion()) return;
            const heading = tipsRef.current.querySelector(".section-heading");
            const cards = tipsRef.current.querySelectorAll(".tip-card");
            const icons = tipsRef.current.querySelectorAll(".tip-icon");

            const tl = gsap.timeline({ scrollTrigger: { trigger: tipsRef.current, start: "top 80%" } });
            if (heading) tl.fromTo(heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth });
            if (cards.length > 0) tl.fromTo(cards, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: duration.normal, ease: easing.smooth, stagger: stagger.normal }, "-=0.3");
            if (icons.length > 0) tl.fromTo(icons, { scale: 0 }, { scale: 1, duration: duration.fast, ease: easing.bounce, stagger: stagger.tight }, "-=0.6");
        },
        { scope: tipsRef }
    );

    // Questions animation
    useGSAP(
        () => {
            if (!questionsRef.current || prefersReducedMotion()) return;
            const heading = questionsRef.current.querySelector(".section-heading");
            const card = questionsRef.current.querySelector(".questions-card");
            const items = questionsRef.current.querySelectorAll(".question-item");

            const tl = gsap.timeline({ scrollTrigger: { trigger: questionsRef.current, start: "top 80%" } });
            if (heading) tl.fromTo(heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth });
            if (card) tl.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: duration.normal, ease: easing.smooth }, "-=0.3");
            if (items.length > 0) tl.fromTo(items, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: duration.fast, ease: easing.smooth, stagger: stagger.tight }, "-=0.3");
        },
        { scope: questionsRef }
    );

    // STAR Method animation
    useGSAP(
        () => {
            if (!starRef.current || prefersReducedMotion()) return;
            const heading = starRef.current.querySelector(".section-heading");
            const card = starRef.current.querySelector(".star-card");
            const items = starRef.current.querySelectorAll(".star-item");

            const tl = gsap.timeline({ scrollTrigger: { trigger: starRef.current, start: "top 80%" } });
            if (heading) tl.fromTo(heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: duration.normal, ease: easing.smooth });
            if (card) tl.fromTo(card, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: duration.normal, ease: easing.smooth }, "-=0.3");
            if (items.length > 0) tl.fromTo(items, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: duration.normal, ease: easing.bounce, stagger: stagger.normal }, "-=0.3");
        },
        { scope: starRef }
    );

    // CTA animation
    useGSAP(
        () => {
            if (!ctaRef.current || prefersReducedMotion()) return;
            const card = ctaRef.current.querySelector(".cta-card");
            gsap.fromTo(card, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: duration.normal, ease: easing.smooth, scrollTrigger: { trigger: ctaRef.current, start: "top 85%" } });
        },
        { scope: ctaRef }
    );

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div ref={heroRef} className="bg-gradient-to-br from-secondary to-accent text-white py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <i className="hero-icon fa-duotone fa-regular fa-user-tie text-3xl"></i>
                            <h1 className="text-4xl font-bold">Interview Preparation</h1>
                        </div>
                        <p className="hero-description text-xl opacity-90">
                            Everything you need to ace your next interview and land your dream job.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Essential Tips */}
                <div ref={tipsRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">Essential Interview Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tips.map((tip, index) => (
                            <div key={index} className="tip-card card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className={`tip-icon w-14 h-14 rounded-full bg-${tip.color}/20 flex items-center justify-center mb-4`}>
                                        <i className={`fa-duotone fa-regular fa-${tip.icon} text-${tip.color} text-2xl`}></i>
                                    </div>
                                    <h3 className="card-title text-xl mb-2">{tip.title}</h3>
                                    <p className="text-base-content/70">{tip.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Common Questions */}
                <div ref={questionsRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">Common Interview Questions</h2>
                    <div className="questions-card card bg-base-100 shadow">
                        <div className="card-body">
                            <p className="mb-4 text-base-content/70">
                                Practice answering these frequently asked questions to feel confident and prepared:
                            </p>
                            <ul className="space-y-3">
                                {commonQuestions.map((question, index) => (
                                    <li key={index} className="question-item flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg transition-colors">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success text-lg mt-0.5"></i>
                                        <span className="font-medium">{question}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* STAR Method */}
                <div ref={starRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">The STAR Method</h2>
                    <div className="star-card card bg-gradient-to-br from-primary to-secondary text-primary-content shadow">
                        <div className="card-body">
                            <p className="text-lg mb-6">
                                Use the STAR method to structure your answers to behavioral questions:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {starMethod.map((item, index) => (
                                    <div key={index} className="star-item bg-base-100/10 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <i className={`fa-duotone fa-regular fa-${item.letter.toLowerCase()} text-2xl`}></i>
                                            <h3 className="text-xl font-bold">{item.title}</h3>
                                        </div>
                                        <p>{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div ref={ctaRef} className="text-center overflow-hidden">
                    <div className="cta-card card bg-base-100 shadow max-w-2xl mx-auto">
                        <div className="card-body">
                            <h2 className="card-title text-2xl justify-center mb-2">
                                Ready to put your skills to work?
                            </h2>
                            <p className="mb-4 text-base-content/70">
                                Start applying to opportunities that match your experience and career goals.
                            </p>
                            <div className="flex gap-2 justify-center">
                                <a href="/public/jobs" className="btn btn-primary">
                                    Browse Jobs <i className="fa-duotone fa-regular fa-briefcase"></i>
                                </a>
                                <a href="/resources/career-guides" className="btn btn-outline">
                                    More Resources
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
