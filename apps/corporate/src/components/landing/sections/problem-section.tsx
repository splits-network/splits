"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const recruiterPains = [
    {
        icon: "fa-duotone fa-regular fa-puzzle-piece-simple",
        text: "Fragmented tools that don't talk to each other",
    },
    {
        icon: "fa-duotone fa-regular fa-file-spreadsheet",
        text: "Spreadsheet chaos for split-fee tracking",
    },
    {
        icon: "fa-duotone fa-regular fa-clock",
        text: "Hours wasted on admin instead of recruiting",
    },
];

const candidatePains = [
    {
        icon: "fa-duotone fa-regular fa-ghost",
        text: "Ghosted after interviews with no feedback",
    },
    {
        icon: "fa-duotone fa-regular fa-circle-xmark",
        text: "Applications vanish into black holes",
    },
    {
        icon: "fa-duotone fa-regular fa-shuffle",
        text: "Duplicate listings across dozens of boards",
    },
];

const companyPains = [
    {
        icon: "fa-duotone fa-regular fa-file-contract",
        text: "Managing dozens of recruiter contracts",
    },
    {
        icon: "fa-duotone fa-regular fa-eye-slash",
        text: "No visibility into recruiter activity",
    },
    {
        icon: "fa-duotone fa-regular fa-money-bill-wave",
        text: "Surprise fees and unclear terms",
    },
];

export function ProblemSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading animation
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    },
                },
            );

            // Columns stagger in
            const columns = columnsRef.current?.querySelectorAll(".pain-column");
            if (columns) {
                gsap.fromTo(
                    columns,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.loose,
                        scrollTrigger: {
                            trigger: columnsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }

            // Pain items within each column
            const painItems = columnsRef.current?.querySelectorAll(".pain-item");
            if (painItems) {
                gsap.fromTo(
                    painItems,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        delay: 0.3,
                        scrollTrigger: {
                            trigger: columnsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: sectionRef },
    );

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-neutral text-neutral-content overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div
                    ref={headingRef}
                    className="text-center mb-16 opacity-0 max-w-3xl mx-auto"
                >
                    <p className="text-sm uppercase tracking-wider opacity-60 mb-3">
                        The Industry Problem
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Recruiting is{" "}
                        <span className="text-error">broken</span> for everyone
                    </h2>
                    <p className="text-lg opacity-70">
                        Whether you&apos;re hiring, recruiting, or job
                        searching—the current system fails you.
                    </p>
                </div>

                <div
                    ref={columnsRef}
                    className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {/* Recruiters Column */}
                    <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user-tie text-xl text-primary"></i>
                            </div>
                            <h3 className="font-bold text-xl">For Recruiters</h3>
                        </div>
                        <div className="space-y-4">
                            {recruiterPains.map((pain, index) => (
                                <div
                                    key={index}
                                    className="pain-item flex items-start gap-3 opacity-0"
                                >
                                    <i
                                        className={`${pain.icon} text-error mt-1`}
                                    ></i>
                                    <span className="text-sm opacity-80">
                                        {pain.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Candidates Column */}
                    <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-xl text-secondary"></i>
                            </div>
                            <h3 className="font-bold text-xl">For Candidates</h3>
                        </div>
                        <div className="space-y-4">
                            {candidatePains.map((pain, index) => (
                                <div
                                    key={index}
                                    className="pain-item flex items-start gap-3 opacity-0"
                                >
                                    <i
                                        className={`${pain.icon} text-error mt-1`}
                                    ></i>
                                    <span className="text-sm opacity-80">
                                        {pain.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Companies Column */}
                    <div className="pain-column bg-base-100/5 rounded-2xl p-6 border border-base-100/10 opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-building text-xl text-accent"></i>
                            </div>
                            <h3 className="font-bold text-xl">For Companies</h3>
                        </div>
                        <div className="space-y-4">
                            {companyPains.map((pain, index) => (
                                <div
                                    key={index}
                                    className="pain-item flex items-start gap-3 opacity-0"
                                >
                                    <i
                                        className={`${pain.icon} text-error mt-1`}
                                    ></i>
                                    <span className="text-sm opacity-80">
                                        {pain.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
