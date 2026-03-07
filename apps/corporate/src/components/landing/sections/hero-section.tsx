"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    return (
        <section
            ref={sectionRef}
            className="min-h-[90vh] relative overflow-hidden flex items-center"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative  py-20">
                <div className="max-w-5xl mx-auto text-center">
                    <h1
                        className="scroll-reveal fade-up text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
                    >
                        The Future of{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Recruiting
                        </span>
                    </h1>

                    <p
                        className="scroll-reveal fade-up text-xl md:text-2xl text-base-content/70 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        Employment Networks powers modern recruiting through two
                        innovative platforms—connecting recruiters, companies,
                        and candidates in one seamless ecosystem.
                    </p>

                    <div
                        className="scroll-reveal fade-up flex flex-col sm:flex-row gap-6 justify-center mb-12 stagger-children"
                    >
                        <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4">
                            <img
                                src="/splits.png"
                                alt="Splits Network"
                                className="h-8"
                            />
                            <div className="text-left">
                                <div className="font-semibold">
                                    Splits Network
                                </div>
                                <div className="text-sm text-base-content/60">
                                    For Recruiters & Companies
                                </div>
                            </div>
                        </div>
                        <div className="platform-badge flex items-center gap-3 bg-base-200 rounded-2xl px-6 py-4">
                            <img
                                src="/applicant.png"
                                alt="Applicant Network"
                                className="h-8"
                            />
                            <div className="text-left">
                                <div className="font-semibold">
                                    Applicant Network
                                </div>
                                <div className="text-sm text-base-content/60">
                                    For Job Seekers
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="scroll-reveal fade-up flex flex-col sm:flex-row gap-4 justify-center stagger-children"
                    >
                        <a
                            href="#for-recruiters"
                            onClick={(e) =>
                                handleSmoothScroll(e, "#for-recruiters")
                            }
                            className="btn btn-primary btn-lg gap-2 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-user-tie"></i>
                            I&apos;m a Recruiter
                        </a>
                        <a
                            href="#for-candidates"
                            onClick={(e) =>
                                handleSmoothScroll(e, "#for-candidates")
                            }
                            className="btn btn-secondary btn-lg gap-2 shadow-lg"
                        >
                            <i className="fa-duotone fa-regular fa-user"></i>
                            I&apos;m Looking for a Job
                        </a>
                        <a
                            href="#for-companies"
                            onClick={(e) =>
                                handleSmoothScroll(e, "#for-companies")
                            }
                            className="btn btn-outline btn-lg gap-2"
                        >
                            <i className="fa-duotone fa-regular fa-building"></i>
                            I&apos;m Hiring
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
