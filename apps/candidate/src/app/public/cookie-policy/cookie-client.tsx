"use client";

import Link from "next/link";
import { LegalAnimator } from "../_shared/legal-animator";

const LAST_UPDATED = "January 24, 2026";

const TOC_SECTIONS = [
    { id: "what-are", label: "What Are Cookies?", icon: "fa-cookie" },
    { id: "how-we-use", label: "How We Use Cookies", icon: "fa-gears" },
    { id: "types", label: "Types of Cookies", icon: "fa-list" },
    { id: "third-party", label: "Third-Party Cookies", icon: "fa-handshake" },
    { id: "management", label: "Cookie Management", icon: "fa-sliders" },
    { id: "consent", label: "Your Consent", icon: "fa-check-circle" },
    { id: "tracking", label: "Do Not Track", icon: "fa-ban" },
    { id: "updates", label: "Updates", icon: "fa-refresh" },
];

export default function CookieMemphisClient() {
    return (
        <LegalAnimator>
            <div className="bg-dark text-white">
                {/* HERO SECTION */}
                <section className="relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className="memphis-shape absolute top-[10%] left-[8%] w-24 h-24 rounded-full border-4 border-yellow" />
                        <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-purple" />
                        <div className="memphis-shape absolute bottom-[15%] left-[18%] w-12 h-12 bg-coral" />
                        <div className="memphis-shape absolute top-[25%] right-[25%] w-16 h-16 rotate-12 bg-teal" />
                        <div className="memphis-shape absolute bottom-[35%] right-[35%] w-24 h-10 -rotate-6 border-4 border-yellow" />
                        <div className="memphis-shape absolute top-[45%] left-[30%] w-10 h-10 rotate-45 bg-yellow" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="hero-badge mb-6 opacity-0">
                                <span className="inline-block px-6 py-2 bg-yellow border-4 border-yellow text-dark text-[10px] font-black uppercase tracking-[0.2em]">
                                    <i className="fa-duotone fa-regular fa-cookie mr-2 text-[9px]"></i>
                                    Cookies & Tracking
                                </span>
                            </div>

                            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] mb-6 opacity-0">
                                <span className="block text-white">COOKIE</span>
                                <span className="block text-yellow">POLICY</span>
                            </h1>

                            <p className="hero-subtitle text-lg md:text-xl text-white/70 font-bold mb-8 max-w-2xl mx-auto opacity-0">
                                How we use cookies and tracking technologies
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
                                <div className="w-12 h-12 flex items-center justify-center bg-yellow border-4 border-yellow">
                                    <i className="fa-duotone fa-regular fa-list text-dark text-xl"></i>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                                    Quick Navigation
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                {TOC_SECTIONS.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="flex items-center gap-3 px-4 py-3 border-2 border-dark/20 hover:border-yellow hover:bg-yellow/10 transition-all group"
                                    >
                                        <i className={`fa-duotone fa-regular fa-${section.icon} text-yellow text-sm group-hover:scale-110 transition-transform`}></i>
                                        <span className="text-sm font-bold">{section.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Key Section */}
                        <section id="what-are" className="content-section mb-16 opacity-0">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 flex items-center justify-center bg-yellow/20 border-4 border-yellow">
                                    <i className="fa-duotone fa-regular fa-cookie text-yellow text-xl"></i>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                    <span className="text-yellow">1.</span> What Are Cookies?
                                </h2>
                            </div>

                            <div className="section-card bg-white border-4 border-dark/30 p-6 mb-6 opacity-0">
                                <p className="text-sm font-bold leading-relaxed text-dark/80">
                                    Cookies are small text files placed on your device when you visit websites. They store information about your preferences, settings, and activity to enhance your experience.
                                </p>
                            </div>

                            <div className="section-card bg-white border-4 border-yellow/50 p-6 opacity-0">
                                <h3 className="font-black text-lg uppercase tracking-[0.12em] mb-4 text-dark flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-fingerprint text-yellow"></i>
                                    Similar Technologies
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { name: "Web Beacons", desc: "Track page visits" },
                                        { name: "Local Storage", desc: "Store data client-side" },
                                        { name: "Session Storage", desc: "Temporary session data" },
                                        { name: "Fingerprinting", desc: "Device identification" },
                                    ].map((tech, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-cream">
                                            <i className="fa-duotone fa-regular fa-circle-dot text-yellow flex-shrink-0 text-sm mt-1"></i>
                                            <div>
                                                <strong className="text-sm font-black">{tech.name}</strong>
                                                <p className="text-xs font-bold text-dark/70">{tech.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Cookie Types Section */}
                        <section id="types" className="content-section mb-16 opacity-0">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 flex items-center justify-center bg-coral/20 border-4 border-coral">
                                    <i className="fa-duotone fa-regular fa-list text-coral text-xl"></i>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                    <span className="text-coral">3.</span> Types of Cookies
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { type: "Essential", desc: "Required for platform functionality", color: "coral", icon: "fa-bolt" },
                                    { type: "Analytics", desc: "Help us improve the service", color: "teal", icon: "fa-chart-line" },
                                    { type: "Functional", desc: "Remember your preferences", color: "purple", icon: "fa-sliders" },
                                    { type: "Marketing", desc: "Deliver relevant ads", color: "yellow", icon: "fa-bullhorn" },
                                ].map((cookie, idx) => (
                                    <div key={idx} className={`section-card bg-white border-4 border-${cookie.color} p-6 opacity-0`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <i className={`fa-duotone fa-regular fa-${cookie.icon} text-${cookie.color} text-xl`}></i>
                                            <h3 className={`font-black text-lg uppercase tracking-[0.12em] text-${cookie.color}`}>{cookie.type}</h3>
                                        </div>
                                        <p className="text-xs font-bold text-dark/70">{cookie.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section className="content-section mt-20 pt-12 border-t-4 border-dark/20 opacity-0">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 flex items-center justify-center bg-purple/20 border-4 border-purple">
                                    <i className="fa-duotone fa-regular fa-envelope text-purple text-xl"></i>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                    Questions? <span className="text-purple">Contact Us</span>
                                </h2>
                            </div>

                            <div className="section-card bg-white border-4 border-yellow p-6 opacity-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <i className="fa-duotone fa-regular fa-headset text-yellow text-xl"></i>
                                    <h3 className="font-black text-lg uppercase tracking-[0.12em]">Support Team</h3>
                                </div>
                                <a href="mailto:support@applicant.network" className="text-yellow font-black text-lg hover:underline block mb-2">
                                    support@applicant.network
                                </a>
                                <p className="text-xs font-bold text-dark/50">We're here to help with your cookie preferences</p>
                            </div>
                        </section>

                        {/* Footer Links */}
                        <div className="text-center mt-16 pt-12 border-t-4 border-dark/20">
                            <p className="text-sm font-bold text-dark/50 mb-6">
                                Last updated: <span className="text-dark">{LAST_UPDATED}</span>
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link href="/public/terms-of-service" className="text-sm font-black uppercase tracking-wider text-coral hover:underline">
                                    Terms of Service
                                </Link>
                                <Link href="/public/privacy-policy" className="text-sm font-black uppercase tracking-wider text-teal hover:underline">
                                    Privacy Policy
                                </Link>
                                <Link href="/" className="text-sm font-black uppercase tracking-wider text-purple hover:underline">
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
