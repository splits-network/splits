"use client";

import Link from "next/link";
import { LegalAnimator } from "../_shared/legal-animator";

const LAST_UPDATED = "January 24, 2026";

const TOC_SECTIONS = [
    { id: "overview", label: "Overview", icon: "fa-eye" },
    {
        id: "information-we-collect",
        label: "Information We Collect",
        icon: "fa-database",
    },
    { id: "how-we-use", label: "How We Use Information", icon: "fa-gears" },
    {
        id: "information-sharing",
        label: "Information Sharing",
        icon: "fa-share-nodes",
    },
    { id: "data-security", label: "Data Security", icon: "fa-shield-halved" },
    { id: "data-retention", label: "Data Retention", icon: "fa-clock" },
    { id: "your-rights", label: "Your Privacy Rights", icon: "fa-user-shield" },
    { id: "cookies", label: "Cookies & Tracking", icon: "fa-cookie" },
    { id: "third-party", label: "Third-Party Services", icon: "fa-handshake" },
    { id: "international", label: "International Transfers", icon: "fa-globe" },
    { id: "children", label: "Children's Privacy", icon: "fa-child" },
    { id: "california", label: "California Rights", icon: "fa-landmark-flag" },
    { id: "gdpr", label: "GDPR Rights", icon: "fa-gavel" },
    { id: "changes", label: "Changes to Policy", icon: "fa-refresh" },
    { id: "contact", label: "Contact Us", icon: "fa-envelope" },
];

export default function PrivacyMemphisClient() {
    return (
        <LegalAnimator>
            <div className="bg-dark text-white">
                {/* HERO SECTION */}
                <section className="relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="memphis-shape absolute top-[10%] left-[8%] w-24 h-24 rounded-full border-4 border-teal" />
                        <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-coral" />
                        <div className="memphis-shape absolute bottom-[15%] left-[18%] w-12 h-12 bg-purple" />
                        <div className="memphis-shape absolute top-[25%] right-[25%] w-16 h-16 rotate-12 bg-yellow" />
                        <div className="memphis-shape absolute bottom-[35%] right-[35%] w-24 h-10 -rotate-6 border-4 border-teal" />
                        <div className="memphis-shape absolute top-[45%] left-[30%] w-10 h-10 rotate-45 bg-teal" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="hero-badge mb-6 opacity-0">
                                <span className="inline-block px-6 py-2 bg-teal border-4 border-teal text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                    <i className="fa-duotone fa-regular fa-shield-halved mr-2 text-[9px]"></i>
                                    Privacy & Data Protection
                                </span>
                            </div>

                            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] mb-6 opacity-0">
                                <span className="block text-white">
                                    PRIVACY
                                </span>
                                <span className="block text-teal">POLICY</span>
                            </h1>

                            <p className="hero-subtitle text-lg md:text-xl text-white/70 font-bold mb-8 max-w-2xl mx-auto opacity-0">
                                How we collect, use, and protect your
                                information
                            </p>

                            <p className="hero-date text-sm font-bold text-white/50 opacity-0">
                                <i className="fa-duotone fa-regular fa-calendar mr-2 text-[10px]"></i>
                                Last updated: {LAST_UPDATED}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CONTENT SECTION */}
                <section className="py-20 bg-cream text-dark">
                    <div className="container mx-auto px-4 max-w-5xl">
                        {/* Table of Contents */}
                        <div className="toc-card bg-white border-4 border-dark p-8 mb-16 opacity-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 flex items-center justify-center bg-teal border-4 border-teal">
                                    <i className="fa-duotone fa-regular fa-list text-white text-xl"></i>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                                    Quick Navigation
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {TOC_SECTIONS.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="flex items-center gap-3 px-4 py-3 border-2 border-dark/20 hover:border-teal hover:bg-teal/10 transition-all group"
                                    >
                                        <i
                                            className={`fa-duotone fa-regular fa-${section.icon} text-teal text-sm group-hover:scale-110 transition-transform`}
                                        ></i>
                                        <span className="text-sm font-bold">
                                            {section.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Key sections */}
                        <section
                            id="overview"
                            className="content-section mb-16 opacity-0"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 flex items-center justify-center bg-teal/20 border-4 border-teal">
                                    <i className="fa-duotone fa-regular fa-eye text-teal text-xl"></i>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                    <span className="text-teal">1.</span>{" "}
                                    Overview
                                </h2>
                            </div>

                            <div className="section-card bg-white border-4 border-dark/30 p-6 mb-4 opacity-0">
                                <p className="text-sm font-bold leading-relaxed text-dark/80 mb-4">
                                    At Applicant Network, we take your privacy
                                    seriously. This Privacy Policy explains how
                                    we collect, use, disclose, and safeguard
                                    your information when you visit our
                                    platform.
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        "We use your data to provide and improve our service",
                                        "We never sell your personal information",
                                        "We comply with GDPR and CCPA regulations",
                                        "You have control over your data",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <i className="fa-duotone fa-regular fa-check text-teal text-sm mt-1 flex-shrink-0"></i>
                                            <span className="text-xs font-bold text-dark/70">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section
                            id="contact"
                            className="content-section mt-20 pt-12 border-t-4 border-dark/20 opacity-0"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 flex items-center justify-center bg-purple/20 border-4 border-purple">
                                    <i className="fa-duotone fa-regular fa-envelope text-purple text-xl"></i>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                    Contact{" "}
                                    <span className="text-purple">Us</span>
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="section-card bg-white border-4 border-teal p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <i className="fa-duotone fa-regular fa-shield-halved text-teal text-xl"></i>
                                        <h3 className="font-black text-lg uppercase tracking-[0.12em]">
                                            Privacy Officer
                                        </h3>
                                    </div>
                                    <a
                                        href="mailto:privacy@applicant.network"
                                        className="text-teal font-black text-lg hover:underline block mb-2"
                                    >
                                        privacy@applicant.network
                                    </a>
                                    <p className="text-xs font-bold text-dark/50">
                                        Response within 5 business days
                                    </p>
                                </div>

                                <div className="section-card bg-white border-4 border-coral p-6 opacity-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <i className="fa-duotone fa-regular fa-headset text-coral text-xl"></i>
                                        <h3 className="font-black text-lg uppercase tracking-[0.12em]">
                                            Support
                                        </h3>
                                    </div>
                                    <a
                                        href="mailto:support@applicant.network"
                                        className="text-coral font-black text-lg hover:underline block mb-2"
                                    >
                                        support@applicant.network
                                    </a>
                                    <p className="text-xs font-bold text-dark/50">
                                        Response within 2 business days
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Footer Links */}
                        <div className="text-center mt-16 pt-12 border-t-4 border-dark/20">
                            <p className="text-sm font-bold text-dark/50 mb-6">
                                Last updated:{" "}
                                <span className="text-dark">
                                    {LAST_UPDATED}
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link
                                    href="/terms-of-service"
                                    className="text-sm font-black uppercase tracking-wider text-coral hover:underline"
                                >
                                    Terms of Service
                                </Link>
                                <Link
                                    href="/cookie-policy"
                                    className="text-sm font-black uppercase tracking-wider text-yellow hover:underline"
                                >
                                    Cookie Policy
                                </Link>
                                <Link
                                    href="/"
                                    className="text-sm font-black uppercase tracking-wider text-purple hover:underline"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </LegalAnimator>
    );
}
