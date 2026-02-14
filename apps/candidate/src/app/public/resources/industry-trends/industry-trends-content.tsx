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

const trends = [
    {
        title: "Remote Work Revolution",
        description:
            "Remote and hybrid work models continue to dominate, with 74% of companies offering flexible work arrangements.",
        icon: "house-laptop",
        color: "primary",
        impact: "High",
        growth: "+45%",
    },
    {
        title: "AI & Automation",
        description:
            "AI integration across industries is creating new roles while transforming existing ones. Demand for AI skills up 200%.",
        icon: "robot",
        color: "secondary",
        impact: "Very High",
        growth: "+200%",
    },
    {
        title: "Skills-Based Hiring",
        description:
            "Companies prioritizing skills over degrees, focusing on practical abilities and project portfolios.",
        icon: "graduation-cap",
        color: "accent",
        impact: "High",
        growth: "+60%",
    },
    {
        title: "Mental Health Focus",
        description:
            "Companies investing in employee well-being programs, mental health support, and work-life balance initiatives.",
        icon: "heart-pulse",
        color: "success",
        impact: "Medium",
        growth: "+35%",
    },
    {
        title: "Gig Economy Growth",
        description:
            "Rise of contract and freelance work, with 36% of workers participating in the gig economy.",
        icon: "handshake",
        color: "warning",
        impact: "High",
        growth: "+28%",
    },
    {
        title: "Diversity & Inclusion",
        description:
            "Increased focus on diverse hiring practices and inclusive workplace cultures across all industries.",
        icon: "users",
        color: "info",
        impact: "High",
        growth: "+52%",
    },
];

const sectors = [
    {
        name: "Technology",
        growth: "Strong",
        hotRoles: ["AI Engineer", "Cloud Architect", "Data Scientist"],
        icon: "laptop-code",
        color: "primary",
    },
    {
        name: "Healthcare",
        growth: "Very Strong",
        hotRoles: [
            "Nurse Practitioner",
            "Health Informatics",
            "Telehealth Specialist",
        ],
        icon: "briefcase-medical",
        color: "error",
    },
    {
        name: "Green Energy",
        growth: "Explosive",
        hotRoles: [
            "Solar Engineer",
            "Sustainability Consultant",
            "EV Technician",
        ],
        icon: "leaf",
        color: "success",
    },
    {
        name: "E-commerce",
        growth: "Strong",
        hotRoles: ["UX Designer", "Digital Marketing", "Supply Chain Manager"],
        icon: "cart-shopping",
        color: "warning",
    },
];

const skills = [
    { name: "AI/Machine Learning", demand: 95, icon: "brain" },
    { name: "Cloud Computing", demand: 90, icon: "cloud" },
    { name: "Cybersecurity", demand: 88, icon: "shield-halved" },
    { name: "Data Analysis", demand: 85, icon: "chart-line" },
    { name: "Digital Marketing", demand: 80, icon: "bullhorn" },
    { name: "Project Management", demand: 75, icon: "list-check" },
];

const takeaways = [
    "Invest in continuous learning and skill development to stay competitive",
    "Focus on building both technical and soft skills for career resilience",
    "Consider emerging fields and industries with strong growth potential",
    "Embrace flexibility and adaptability as core career competencies",
];

export function IndustryTrendsContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const trendsRef = useRef<HTMLDivElement>(null);
    const sectorsRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const takeawaysRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Hero animation
    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;
            const icon = heroRef.current.querySelector(".hero-icon");
            const heading = heroRef.current.querySelector("h1");
            const description =
                heroRef.current.querySelector(".hero-description");

            const tl = gsap.timeline();
            if (icon)
                tl.fromTo(
                    icon,
                    { opacity: 0, scale: 0 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.bounce,
                    },
                );
            if (heading)
                tl.fromTo(
                    heading,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                    "-=0.4",
                );
            if (description)
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
        },
        { scope: heroRef },
    );

    // Trends animation
    useGSAP(
        () => {
            if (!trendsRef.current || prefersReducedMotion()) return;
            const heading = trendsRef.current.querySelector(".section-heading");
            const cards = trendsRef.current.querySelectorAll(".trend-card");
            const icons = trendsRef.current.querySelectorAll(".trend-icon");

            const tl = gsap.timeline({
                scrollTrigger: { trigger: trendsRef.current, start: "top 80%" },
            });
            if (heading)
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
            if (cards.length > 0)
                tl.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
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
            if (icons.length > 0)
                tl.fromTo(
                    icons,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: duration.fast,
                        ease: easing.bounce,
                        stagger: stagger.tight,
                    },
                    "-=0.6",
                );
        },
        { scope: trendsRef },
    );

    // Sectors animation
    useGSAP(
        () => {
            if (!sectorsRef.current || prefersReducedMotion()) return;
            const heading =
                sectorsRef.current.querySelector(".section-heading");
            const cards = sectorsRef.current.querySelectorAll(".sector-card");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectorsRef.current,
                    start: "top 80%",
                },
            });
            if (heading)
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
            if (cards.length > 0)
                tl.fromTo(
                    cards,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                    },
                    "-=0.3",
                );
        },
        { scope: sectorsRef },
    );

    // Skills animation
    useGSAP(
        () => {
            if (!skillsRef.current || prefersReducedMotion()) return;
            const heading = skillsRef.current.querySelector(".section-heading");
            const card = skillsRef.current.querySelector(".skills-card");
            const bars = skillsRef.current.querySelectorAll(".skill-bar");

            const tl = gsap.timeline({
                scrollTrigger: { trigger: skillsRef.current, start: "top 80%" },
            });
            if (heading)
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
            if (card)
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
            if (bars.length > 0)
                tl.fromTo(
                    bars,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                    },
                    "-=0.3",
                );
        },
        { scope: skillsRef },
    );

    // Takeaways animation
    useGSAP(
        () => {
            if (!takeawaysRef.current || prefersReducedMotion()) return;
            const card = takeawaysRef.current.querySelector(".takeaways-card");
            const items =
                takeawaysRef.current.querySelectorAll(".takeaway-item");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: takeawaysRef.current,
                    start: "top 80%",
                },
            });
            if (card)
                tl.fromTo(
                    card,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: duration.normal,
                        ease: easing.smooth,
                    },
                );
            if (items.length > 0)
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
        },
        { scope: takeawaysRef },
    );

    // CTA animation
    useGSAP(
        () => {
            if (!ctaRef.current || prefersReducedMotion()) return;
            const card = ctaRef.current.querySelector(".cta-card");
            gsap.fromTo(
                card,
                { opacity: 0, y: 30, scale: 0.95 },
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
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div
                ref={heroRef}
                className="bg-gradient-to-br from-accent to-secondary text-white py-16 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <i className="hero-icon fa-duotone fa-regular fa-display-chart-up text-3xl"></i>
                            <h1 className="text-4xl font-bold">
                                Industry Trends
                            </h1>
                        </div>
                        <p className="hero-description text-xl opacity-90">
                            Stay ahead of the curve with insights into the
                            evolving job market and emerging opportunities.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Major Trends */}
                <div ref={trendsRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">
                        Major Trends Shaping 2025
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trends.map((trend, index) => (
                            <div
                                key={index}
                                className="trend-card card bg-base-100 shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="card-body">
                                    <div
                                        className={`trend-icon w-14 h-14 rounded-full bg-${trend.color}/20 flex items-center justify-center mb-4`}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular fa-${trend.icon} text-${trend.color} text-2xl`}
                                        ></i>
                                    </div>
                                    <h3 className="card-title text-xl mb-2">
                                        {trend.title}
                                    </h3>
                                    <p className="text-sm text-base-content/70 flex-grow">
                                        {trend.description}
                                    </p>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-base-300">
                                        <div className="badge badge-outline">
                                            {trend.impact} Impact
                                        </div>
                                        <div className="badge badge-success">
                                            {trend.growth}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hot Sectors */}
                <div ref={sectorsRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">
                        Fastest Growing Sectors
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sectors.map((sector, index) => (
                            <div
                                key={index}
                                className="sector-card card bg-base-100 shadow"
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className={`w-16 h-16 rounded-full bg-${sector.color}/20 flex items-center justify-center`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-${sector.icon} text-${sector.color} text-3xl`}
                                            ></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold">
                                                {sector.name}
                                            </h3>
                                            <div className="badge badge-success">
                                                {sector.growth} Growth
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">
                                            Hot Roles:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {sector.hotRoles.map((role, i) => (
                                                <span
                                                    key={i}
                                                    className="badge badge-outline"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In-Demand Skills */}
                <div ref={skillsRef} className="mb-16 overflow-hidden">
                    <h2 className="section-heading text-3xl font-bold mb-8">
                        Most In-Demand Skills
                    </h2>
                    <div className="skills-card card bg-base-100 shadow">
                        <div className="card-body">
                            <div className="space-y-6">
                                {skills.map((skill, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <i
                                                    className={`fa-duotone fa-regular fa-${skill.icon} text-primary text-xl`}
                                                ></i>
                                                <span className="font-semibold">
                                                    {skill.name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-base-content/60">
                                                {skill.demand}% demand
                                            </span>
                                        </div>
                                        <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="skill-bar bg-gradient-to-r from-primary to-secondary h-3 rounded-full origin-left"
                                                style={{
                                                    width: `${skill.demand}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Takeaways */}
                <div ref={takeawaysRef} className="mb-16 overflow-hidden">
                    <div className="takeaways-card card bg-gradient-to-br from-primary to-secondary text-primary-content shadow">
                        <div className="card-body">
                            <h3 className="card-title text-2xl mb-4">
                                <i className="fa-duotone fa-regular fa-lightbulb"></i>
                                Key Takeaways
                            </h3>
                            <ul className="space-y-3">
                                {takeaways.map((item, index) => (
                                    <li
                                        key={index}
                                        className="takeaway-item flex items-start gap-3"
                                    >
                                        <i className="fa-duotone fa-regular fa-check-circle text-xl mt-0.5"></i>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div ref={ctaRef} className="text-center overflow-hidden">
                    <div className="cta-card card bg-base-100 shadow max-w-2xl mx-auto">
                        <div className="card-body">
                            <h2 className="card-title text-2xl justify-center mb-2">
                                Find opportunities in growing industries
                            </h2>
                            <p className="mb-4 text-base-content/70">
                                Explore jobs in the sectors and roles that are
                                shaping the future of work.
                            </p>
                            <div className="flex gap-2 justify-center">
                                <a
                                    href="/public/jobs"
                                    className="btn btn-primary"
                                >
                                    Browse Jobs{" "}
                                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                                </a>
                                <a
                                    href="/resources/salary-insights"
                                    className="btn btn-outline"
                                >
                                    Salary Insights
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
