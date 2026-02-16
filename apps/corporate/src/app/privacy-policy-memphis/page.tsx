import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PrivacyAnimator } from "./privacy-animator";

export const metadata: Metadata = {
    title: "Privacy Policy | Employment Networks",
    description:
        "Learn how Employment Networks protects your privacy and handles your personal data in compliance with GDPR and CCPA.",
    ...buildCanonical("/privacy-policy-memphis"),
};

export default function PrivacyPolicyMemphisPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <PrivacyAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[6%] w-24 h-24 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[10%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[22%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[30%] w-24 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[40%] left-[25%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    <svg className="memphis-shape absolute top-[65%] left-[8%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="text-yellow" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="text-yellow" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-shield-check"></i>
                            Legal
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Privacy{" "}
                            <span className="text-coral">Policy</span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl leading-relaxed mb-6 text-white/70 max-w-2xl mx-auto opacity-0">
                            How we protect and respect your personal data
                        </p>

                        <p className="hero-date text-sm font-bold uppercase tracking-wider text-white/40 opacity-0">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                TABLE OF CONTENTS
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-12 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-toc border-4 border-teal bg-cream p-8 opacity-0">
                        <h2 className="text-xl font-black uppercase tracking-wide text-dark mb-6">Quick <span className="text-teal">Navigation</span></h2>
                        <ul className="grid md:grid-cols-2 gap-3">
                            {[
                                { n: "1", id: "overview", label: "Overview" },
                                { n: "2", id: "information-collection", label: "Information Collection" },
                                { n: "3", id: "how-we-use", label: "How We Use" },
                                { n: "4", id: "information-sharing", label: "Information Sharing" },
                                { n: "5", id: "data-security", label: "Data Security" },
                                { n: "6", id: "your-rights", label: "Your Rights" },
                                { n: "7", id: "third-party", label: "Third-Party Services" },
                                { n: "8", id: "contact", label: "Contact Us" },
                            ].map((item) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`} className="text-sm font-bold text-dark/70 hover:text-coral transition-colors flex items-center gap-2">
                                        <span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">{item.n}</span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Section 1 — Overview ── */}
            <section id="overview" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-coral">Overview</span></h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            Employment Networks (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the Splits and Applicant platforms. We&apos;re committed to protecting your privacy and ensuring transparent handling of your personal data.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Your data is treated with utmost care and respect</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We comply with GDPR, CCPA, and other privacy regulations</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>You have full control over your personal information</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Section 2 — Information Collection ── */}
            <section id="information-collection" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Information We <span className="text-teal">Collect</span></h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">You Provide</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Contact information</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Account details</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Communications</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Business information</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Automatically</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>IP address</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Browser type</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Device info</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Usage analytics</li>
                                </ul>
                            </div>
                            <div className="border-4 border-purple bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Third Parties</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Service providers</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Analytics partners</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Payment processors</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Auth platforms</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 3 — How We Use ── */}
            <section id="how-we-use" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">How We <span className="text-yellow">Use</span> Your Information</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6"><h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">Service Delivery</h3><p className="text-sm text-dark/70">Provide and improve our platforms</p></div>
                            <div className="border-4 border-teal bg-white p-6"><h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">Analytics</h3><p className="text-sm text-dark/70">Understand usage and optimize</p></div>
                            <div className="border-4 border-purple bg-white p-6"><h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">Communications</h3><p className="text-sm text-dark/70">Send updates and notifications</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4 — Information Sharing ── */}
            <section id="information-sharing" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Information <span className="text-purple">Sharing</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We share information only when necessary:</p>
                        <div className="space-y-3 mb-6">
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="px-2 py-0.5 bg-coral text-white text-xs font-bold uppercase flex-shrink-0">Service Providers</span><p className="text-sm text-dark/70">Tools and services to operate our platforms</p></div>
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="px-2 py-0.5 bg-teal text-dark text-xs font-bold uppercase flex-shrink-0">Legal Requirements</span><p className="text-sm text-dark/70">When required by law or legal process</p></div>
                            <div className="border-4 border-purple bg-white p-4 flex items-start gap-3"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase flex-shrink-0">Platform Partners</span><p className="text-sm text-dark/70">Integrated services for better functionality</p></div>
                        </div>
                        <div className="border-4 border-teal bg-teal/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">We never sell your data</p>
                            <p className="text-sm text-dark/70">Your information is never sold to third parties for marketing purposes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5 — Data Security ── */}
            <section id="data-security" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Data <span className="text-coral">Security</span></h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-teal p-4"><p className="font-bold text-sm text-dark">Encryption</p><p className="text-xs text-dark/60">TLS/SSL encryption in transit</p></div>
                            <div className="border-4 border-coral p-4"><p className="font-bold text-sm text-dark">Access Control</p><p className="text-xs text-dark/60">Role-based permission system</p></div>
                            <div className="border-4 border-purple p-4"><p className="font-bold text-sm text-dark">Infrastructure</p><p className="text-xs text-dark/60">Secure cloud hosting</p></div>
                            <div className="border-4 border-yellow p-4"><p className="font-bold text-sm text-dark">Monitoring</p><p className="text-xs text-dark/60">24/7 security monitoring</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 6 — Your Rights ── */}
            <section id="your-rights" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Your Privacy <span className="text-teal">Rights</span></h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-coral p-5"><p className="font-bold text-sm text-dark">Access</p><p className="text-xs text-dark/60">Request a copy of your personal data</p></div>
                            <div className="border-4 border-teal p-5"><p className="font-bold text-sm text-dark">Correction</p><p className="text-xs text-dark/60">Update inaccurate information</p></div>
                            <div className="border-4 border-purple p-5"><p className="font-bold text-sm text-dark">Deletion</p><p className="text-xs text-dark/60">Request deletion of your data</p></div>
                            <div className="border-4 border-yellow p-5"><p className="font-bold text-sm text-dark">Objection</p><p className="text-xs text-dark/60">Object to data processing</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 7 — Third-Party Services ── */}
            <section id="third-party" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Third-Party <span className="text-yellow">Services</span></h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-4 border-teal bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-teal flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-lock text-dark text-lg"></i></div><div><p className="font-bold text-sm text-dark">Clerk</p><p className="text-xs text-dark/60">Authentication and user management</p></div></div>
                            <div className="border-4 border-coral bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-coral flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-database text-white text-lg"></i></div><div><p className="font-bold text-sm text-dark">Supabase</p><p className="text-xs text-dark/60">Database and infrastructure</p></div></div>
                            <div className="border-4 border-purple bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-purple flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-chart-line text-white text-lg"></i></div><div><p className="font-bold text-sm text-dark">Google Analytics</p><p className="text-xs text-dark/60">Website analytics</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CONTACT
               ══════════════════════════════════════════════════════════════ */}
            <section id="contact" className="py-16 bg-dark">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 text-center">
                            Questions About <span className="text-coral">Privacy?</span>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-coral p-6">
                                <div className="w-12 h-12 bg-coral flex items-center justify-center mb-4"><i className="fa-duotone fa-regular fa-envelope text-white text-lg"></i></div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Privacy Team</h3>
                                <a href="mailto:privacy@employment-networks.com" className="text-coral font-bold text-sm">privacy@employment-networks.com</a>
                                <p className="text-xs text-white/50 mt-2">Response within 5 business days</p>
                            </div>
                            <div className="border-4 border-teal p-6">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4"><i className="fa-duotone fa-regular fa-map-pin text-dark text-lg"></i></div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Mailing Address</h3>
                                <p className="text-sm text-white/60">Employment Networks, Inc.</p>
                                <p className="text-sm text-white/60">Wilmington, Delaware 19801</p>
                                <p className="text-sm text-white/60">USA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PrivacyAnimator>
    );
}
