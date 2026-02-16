import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { CookieAnimator } from "./cookie-animator";

export const metadata: Metadata = {
    title: "Cookie Policy | Employment Networks",
    description:
        "Information about cookies and tracking technologies used on Employment Networks platforms.",
    ...buildCanonical("/cookie-policy-memphis"),
};

export default function CookiePolicyMemphisPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <CookieAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-[5px] border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[60%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[15%] left-[20%] w-10 h-10 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[25%] right-[22%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[35%] right-[35%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[45%] left-[30%] w-8 h-8 rotate-45 bg-coral opacity-0" />
                    <svg className="memphis-shape absolute top-[70%] left-[45%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                        <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20" fill="none" stroke="currentColor" className="text-purple" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-dark mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-cookie"></i>
                            Legal
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Cookie{" "}
                            <span className="text-teal">Policy</span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl leading-relaxed mb-6 text-white/70 max-w-2xl mx-auto opacity-0">
                            How we use cookies and similar technologies
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
                        <h2 className="text-xl font-black uppercase tracking-wide text-dark mb-6">
                            Quick <span className="text-teal">Navigation</span>
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-3">
                            <li><a href="#what-are-cookies" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">1</span>What Are Cookies</a></li>
                            <li><a href="#how-we-use" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">2</span>How We Use</a></li>
                            <li><a href="#types" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">3</span>Types of Cookies</a></li>
                            <li><a href="#third-party" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">4</span>Third-Party Cookies</a></li>
                            <li><a href="#management" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">5</span>Management</a></li>
                            <li><a href="#consent" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">6</span>Consent</a></li>
                            <li><a href="#dnt" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">7</span>Do Not Track</a></li>
                            <li><a href="#updates" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">8</span>Updates</a></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Section 1 ── */}
            <section id="what-are-cookies" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">What Are <span className="text-coral">Cookies?</span></h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            Cookies are small text files stored on your device when you visit our websites. They help us recognize you, remember your preferences, and improve your experience.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-teal p-4"><p className="font-bold text-sm text-dark">Web Beacons</p><p className="text-xs text-dark/60">Small transparent images that track page views</p></div>
                            <div className="border-4 border-purple p-4"><p className="font-bold text-sm text-dark">Local Storage</p><p className="text-xs text-dark/60">Browser storage for persistent data</p></div>
                            <div className="border-4 border-yellow p-4"><p className="font-bold text-sm text-dark">Session Storage</p><p className="text-xs text-dark/60">Temporary data during your session</p></div>
                            <div className="border-4 border-coral p-4"><p className="font-bold text-sm text-dark">Fingerprinting</p><p className="text-xs text-dark/60">Device characteristics for analytics</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 2 ── */}
            <section id="how-we-use" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">How We Use <span className="text-teal">Cookies</span></h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Essential</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Authentication</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Security</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Session data</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Preferences</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Analytics</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Usage patterns</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Performance</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>User behavior</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Traffic sources</li>
                                </ul>
                            </div>
                            <div className="border-4 border-purple bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Personalization</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Language settings</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Theme choice</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Content filters</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Recommendations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 3 ── */}
            <section id="types" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Types of <span className="text-yellow">Cookies</span></h2>
                        </div>

                        <div className="border-4 border-coral bg-white p-6 mb-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-coral text-white mb-4">Essential</span>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b-4 border-dark/10"><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Expiration</th></tr></thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">session_id</td><td className="py-2">Session management</td><td className="py-2">Session end</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">auth_token</td><td className="py-2">Authentication</td><td className="py-2">30 days</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">csrf_token</td><td className="py-2">CSRF protection</td><td className="py-2">Session end</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">user_prefs</td><td className="py-2">User preferences</td><td className="py-2">1 year</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="border-4 border-teal bg-white p-6 mb-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-teal text-dark mb-4">Analytics</span>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b-4 border-dark/10"><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Expiration</th></tr></thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">_ga</td><td className="py-2">Google Analytics ID</td><td className="py-2">2 years</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">_gid</td><td className="py-2">Session analytics</td><td className="py-2">24 hours</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">usage_stats</td><td className="py-2">Usage tracking</td><td className="py-2">30 days</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="border-4 border-purple bg-white p-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-purple text-white mb-4">Personalization</span>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b-4 border-dark/10"><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th><th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Expiration</th></tr></thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">language</td><td className="py-2">Language preference</td><td className="py-2">1 year</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">theme</td><td className="py-2">Theme selection</td><td className="py-2">1 year</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">filters</td><td className="py-2">Content filters</td><td className="py-2">30 days</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4 ── */}
            <section id="third-party" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Third-Party <span className="text-purple">Cookies</span></h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-4 border-teal bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-teal flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-chart-line text-dark text-lg"></i></div><div><p className="font-bold text-sm text-dark">Google Analytics</p><p className="text-xs text-dark/60">Traffic analysis and behavior tracking</p></div></div>
                            <div className="border-4 border-coral bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-coral flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-user text-white text-lg"></i></div><div><p className="font-bold text-sm text-dark">Clerk Authentication</p><p className="text-xs text-dark/60">User identity and authentication</p></div></div>
                            <div className="border-4 border-purple bg-white p-5 flex items-center gap-4"><div className="w-12 h-12 bg-purple flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-credit-card text-white text-lg"></i></div><div><p className="font-bold text-sm text-dark">Stripe</p><p className="text-xs text-dark/60">Payment processing</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5 ── */}
            <section id="management" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">How to Manage <span className="text-coral">Cookies</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">You can control cookies through your browser settings. Click on your browser below for instructions:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="border-4 border-teal px-4 py-2 text-sm font-bold text-dark text-center hover:bg-teal hover:text-dark transition-colors">Chrome Settings</a>
                            <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="border-4 border-coral px-4 py-2 text-sm font-bold text-dark text-center hover:bg-coral hover:text-white transition-colors">Firefox Settings</a>
                            <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="border-4 border-purple px-4 py-2 text-sm font-bold text-dark text-center hover:bg-purple hover:text-white transition-colors">Safari Settings</a>
                            <a href="https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="border-4 border-yellow px-4 py-2 text-sm font-bold text-dark text-center hover:bg-yellow transition-colors">Edge Settings</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 6 ── */}
            <section id="consent" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Consent &amp; Cookie <span className="text-teal">Banner</span></h2>
                        </div>
                        <div className="border-4 border-teal bg-white p-6">
                            <p className="font-bold text-sm text-dark mb-2">Your Consent Matters</p>
                            <p className="text-sm text-dark/70">When you first visit our site, we ask for your consent before setting non-essential cookies. You can change your preferences anytime.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 7 ── */}
            <section id="dnt" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Do Not <span className="text-purple">Track</span> (DNT)</h2>
                        </div>
                        <p className="text-base text-dark/80 mb-4">
                            Many browsers allow you to signal a &quot;Do Not Track&quot; (DNT) preference. Currently, we do not respond to DNT signals as there is no industry standard. However, you can still control cookies through your browser settings.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Section 8 ── */}
            <section id="updates" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">8</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Updates to This <span className="text-coral">Policy</span></h2>
                        </div>
                        <div className="space-y-3">
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">1</span><div><p className="font-bold text-sm text-dark">We May Update</p><p className="text-xs text-dark/60">We review and update this policy regularly to reflect new technologies and regulations</p></div></div>
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">2</span><div><p className="font-bold text-sm text-dark">Check Back Often</p><p className="text-xs text-dark/60">Significant changes will be announced on our website</p></div></div>
                            <div className="border-4 border-purple bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><div><p className="font-bold text-sm text-dark">Your Consent</p><p className="text-xs text-dark/60">Continued use means acceptance of any policy changes</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CONTACT
               ══════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-dark">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 text-center">
                            Questions About <span className="text-teal">Cookies?</span>
                        </h2>
                        <div className="border-4 border-teal p-6 max-w-lg mx-auto">
                            <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4">
                                <i className="fa-duotone fa-regular fa-envelope text-dark text-lg"></i>
                            </div>
                            <h3 className="font-black text-base uppercase text-white mb-2">Contact Us</h3>
                            <a href="mailto:privacy@employment-networks.com" className="text-teal font-bold text-sm">privacy@employment-networks.com</a>
                            <p className="text-xs text-white/50 mt-2">We typically respond within 5 business days</p>
                        </div>
                    </div>
                </div>
            </section>
        </CookieAnimator>
    );
}
