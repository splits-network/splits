"use client";

import Link from "next/link";
import { HubAnimator } from "../_shared/hub-animator";

// Memphis accent cycling
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

const guides = [
    {
        title: "How to Switch Careers Successfully",
        description:
            "A comprehensive guide to transitioning into a new career path with confidence.",
        category: "Career Change",
        readTime: "8 min read",
        icon: "fa-arrows-turn-right",
        href: "/public/resources/career-guides/switch-careers-memphis",
    },
    {
        title: "Building Your Professional Network",
        description:
            "Learn strategies to grow and maintain meaningful professional connections.",
        category: "Networking",
        readTime: "6 min read",
        icon: "fa-users",
        href: "/public/resources/career-guides/networking-memphis",
    },
    {
        title: "Remote Work Best Practices",
        description:
            "Tips for staying productive and maintaining work-life balance while remote.",
        category: "Remote Work",
        readTime: "7 min read",
        icon: "fa-house-laptop",
        href: "/public/resources/career-guides/remote-work-memphis",
    },
    {
        title: "Negotiating Your Job Offer",
        description:
            "Master the art of salary and benefits negotiation with confidence.",
        category: "Compensation",
        readTime: "10 min read",
        icon: "fa-handshake",
        href: "/public/resources/career-guides/negotiating-offers-memphis",
    },
    {
        title: "First 90 Days in a New Role",
        description:
            "Set yourself up for success in your new position from day one.",
        category: "Career Growth",
        readTime: "9 min read",
        icon: "fa-rocket",
        href: "/public/resources/career-guides/first-90-days-memphis",
    },
    {
        title: "Personal Branding Essentials",
        description:
            "Build and promote your professional brand across multiple platforms.",
        category: "Personal Brand",
        readTime: "8 min read",
        icon: "fa-badge-check",
        href: "/public/resources/career-guides/personal-branding-memphis",
    },
];

export function CareerGuidesClient() {
    return (
        <HubAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[12%] left-[6%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[18%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[22%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[35%] right-[35%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                </div>

                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
                                <i className="fa-duotone fa-regular fa-book"></i>
                                Resources
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
                            Career{" "}
                            <span className="text-teal">Guides</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed opacity-0 text-white/70">
                            Expert advice and actionable strategies to advance your
                            career at every stage. From switching roles to negotiating
                            offers — we've got you covered.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                GUIDES GRID
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {guides.map((guide, idx) => {
                                const accent = accentAt(idx);

                                return (
                                    <Link
                                        key={idx}
                                        href={guide.href}
                                        className={`hub-card relative p-6 border-4 border-${accent} bg-white opacity-0 transition-transform hover:scale-[1.02]`}
                                    >
                                        {/* Corner accent */}
                                        <div
                                            className={`absolute top-0 right-0 w-12 h-12 bg-${accent}`}
                                        />

                                        <div className="relative">
                                            {/* Icon */}
                                            <div
                                                className={`w-16 h-16 flex items-center justify-center bg-${accent} mb-4`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${guide.icon} text-2xl ${accent === "yellow" || accent === "teal" ? "text-dark" : "text-white"}`}
                                                ></i>
                                            </div>

                                            {/* Category badge */}
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider bg-${accent}/10 text-${accent === "yellow" ? "dark" : accent} mb-3`}
                                            >
                                                {guide.category}
                                            </span>

                                            {/* Title */}
                                            <h2 className="text-xl font-black uppercase tracking-tight text-dark mb-3">
                                                {guide.title}
                                            </h2>

                                            {/* Description */}
                                            <p className="text-sm leading-relaxed text-dark/70 mb-4">
                                                {guide.description}
                                            </p>

                                            {/* Read time */}
                                            <div className="flex items-center justify-between pt-4 border-t-2 border-dark/10">
                                                <span className="text-xs font-bold uppercase tracking-wider text-dark/40">
                                                    <i className="fa-duotone fa-regular fa-clock"></i>{" "}
                                                    {guide.readTime}
                                                </span>
                                                <i
                                                    className={`fa-duotone fa-regular fa-arrow-right text-${accent}`}
                                                ></i>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CTA SECTION
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-dark">
                <div className="container mx-auto px-4">
                    <div className="cta-card max-w-3xl mx-auto text-center relative p-8 md:p-12 border-4 border-purple bg-white opacity-0">
                        {/* Corner accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple" />

                        <div className="relative">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark mb-4">
                                Ready to Take the{" "}
                                <span className="text-purple">Next Step?</span>
                            </h2>
                            <p className="text-base leading-relaxed text-dark/70 mb-6">
                                Browse thousands of opportunities from top companies
                                and start applying with confidence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/public/jobs"
                                    className="btn btn-purple btn-lg uppercase tracking-wider"
                                >
                                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                                    Explore Jobs
                                </Link>
                                <Link
                                    href="/public/resources"
                                    className="btn btn-outline-dark btn-lg uppercase tracking-wider"
                                >
                                    <i className="fa-duotone fa-regular fa-book"></i>
                                    More Resources
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HubAnimator>
    );
}
