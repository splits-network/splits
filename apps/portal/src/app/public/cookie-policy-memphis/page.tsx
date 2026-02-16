import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { CookieAnimator } from "./cookie-animator";

export const metadata: Metadata = {
    title: "Cookie Policy | Splits Network",
    description:
        "Learn about how Splits Network uses cookies and similar tracking technologies to improve your experience and analyze platform usage.",
    ...buildCanonical("/public/cookie-policy-memphis"),
};

export default function CookiePolicyMemphisPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <CookieAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
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
                            How we use cookies and tracking technologies
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
                            <li><a href="#what-are" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">1</span>What Are Cookies?</a></li>
                            <li><a href="#how-we-use" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">2</span>How We Use Cookies</a></li>
                            <li><a href="#types" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">3</span>Types of Cookies</a></li>
                            <li><a href="#third-party" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">4</span>Third-Party Cookies</a></li>
                            <li><a href="#management" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">5</span>Cookie Management</a></li>
                            <li><a href="#consent" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">6</span>Your Consent</a></li>
                            <li><a href="#tracking" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">7</span>Do Not Track</a></li>
                            <li><a href="#updates" className="text-sm font-bold text-dark/70 hover:text-teal transition-colors flex items-center gap-2"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0">8</span>Updates</a></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 1 — What Are Cookies?
               ══════════════════════════════════════════════════════════════ */}
            <section id="what-are" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                What Are <span className="text-coral">Cookies?</span>
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            Cookies are small text files placed on your device when you visit websites. They store information about your preferences, settings, and activity to enhance your experience.
                        </p>

                        <h3 className="text-lg font-black uppercase tracking-wide text-dark mb-4">Similar Technologies</h3>
                        <p className="text-base text-dark/70 mb-4">In addition to cookies, we may use:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-teal p-4">
                                <p className="font-bold text-sm text-dark">Web Beacons</p>
                                <p className="text-xs text-dark/60">Track page visits</p>
                            </div>
                            <div className="border-4 border-purple p-4">
                                <p className="font-bold text-sm text-dark">Local Storage</p>
                                <p className="text-xs text-dark/60">Store data client-side</p>
                            </div>
                            <div className="border-4 border-yellow p-4">
                                <p className="font-bold text-sm text-dark">Session Storage</p>
                                <p className="text-xs text-dark/60">Temporary session data</p>
                            </div>
                            <div className="border-4 border-coral p-4">
                                <p className="font-bold text-sm text-dark">Fingerprinting</p>
                                <p className="text-xs text-dark/60">Device identification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 2 — How We Use Cookies
               ══════════════════════════════════════════════════════════════ */}
            <section id="how-we-use" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                How We Use <span className="text-teal">Cookies</span>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Essential</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Login &amp; sessions</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Security tokens</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>CSRF protection</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Preferences</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Analytics</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Page visits</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>User behavior</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Performance data</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Feature usage</li>
                                </ul>
                            </div>
                            <div className="border-4 border-purple bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Personalization</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Saved preferences</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Language settings</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Theme selection</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Content customization</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 3 — Types of Cookies
               ══════════════════════════════════════════════════════════════ */}
            <section id="types" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Types of <span className="text-yellow">Cookies</span> We Use
                            </h2>
                        </div>

                        {/* Essential */}
                        <div className="border-4 border-coral bg-white p-6 mb-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-coral text-white mb-4">Essential</span>
                            <p className="text-sm text-dark/70 mb-4">Required for basic platform functionality. Cannot be disabled.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-4 border-dark/10">
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">session_id</td><td className="py-2">Maintains user session</td><td className="py-2">Until logout</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">auth_token</td><td className="py-2">Authentication token</td><td className="py-2">24 hours</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">csrf_token</td><td className="py-2">CSRF protection</td><td className="py-2">Session</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">user_prefs</td><td className="py-2">User preferences</td><td className="py-2">1 year</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="border-4 border-teal bg-white p-6 mb-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-teal text-dark mb-4">Analytics</span>
                            <p className="text-sm text-dark/70 mb-4">Help us understand how you use the platform.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-4 border-dark/10">
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">_ga</td><td className="py-2">Google Analytics ID</td><td className="py-2">2 years</td></tr>
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">_gid</td><td className="py-2">Google Analytics session</td><td className="py-2">24 hours</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">usage_stats</td><td className="py-2">Feature usage tracking</td><td className="py-2">90 days</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Marketing */}
                        <div className="border-4 border-yellow bg-white p-6">
                            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-yellow text-dark mb-4">Marketing</span>
                            <p className="text-sm text-dark/70 mb-4">Used only with your consent. Can be disabled.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-4 border-dark/10">
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Cookie</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Purpose</th>
                                            <th className="text-left py-2 font-black uppercase text-xs tracking-wider text-dark">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark/70">
                                        <tr className="border-b border-dark/10"><td className="py-2 font-mono text-xs">utm_source</td><td className="py-2">Campaign tracking</td><td className="py-2">Session</td></tr>
                                        <tr><td className="py-2 font-mono text-xs">marketing_id</td><td className="py-2">Marketing attribution</td><td className="py-2">30 days</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 4 — Third-Party Cookies
               ══════════════════════════════════════════════════════════════ */}
            <section id="third-party" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Third-Party <span className="text-purple">Cookies</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">Third-party services set cookies to enhance platform functionality:</p>
                        <div className="space-y-4">
                            <div className="border-4 border-teal bg-white p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-chart-line text-dark text-lg"></i>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-dark">Google Analytics</p>
                                    <p className="text-xs text-dark/60">Website analytics &amp; visitor tracking</p>
                                </div>
                            </div>
                            <div className="border-4 border-coral bg-white p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-coral flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-credit-card text-white text-lg"></i>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-dark">Stripe</p>
                                    <p className="text-xs text-dark/60">Payment processing &amp; fraud prevention</p>
                                </div>
                            </div>
                            <div className="border-4 border-purple bg-white p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-user text-white text-lg"></i>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-dark">Clerk</p>
                                    <p className="text-xs text-dark/60">Authentication &amp; identity management</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 5 — Cookie Management
               ══════════════════════════════════════════════════════════════ */}
            <section id="management" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                How to Manage <span className="text-coral">Cookies</span>
                            </h2>
                        </div>

                        <div className="border-4 border-dark/10 bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Browser Settings</h3>
                            <p className="text-sm text-dark/70 mb-4">Most browsers allow you to control cookies:</p>
                            <div className="grid md:grid-cols-2 gap-3">
                                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="border-4 border-teal px-4 py-2 text-sm font-bold text-dark text-center hover:bg-teal hover:text-dark transition-colors">Chrome</a>
                                <a href="https://support.mozilla.org/en-US/kb/cookies" target="_blank" rel="noopener noreferrer" className="border-4 border-coral px-4 py-2 text-sm font-bold text-dark text-center hover:bg-coral hover:text-white transition-colors">Firefox</a>
                                <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="border-4 border-purple px-4 py-2 text-sm font-bold text-dark text-center hover:bg-purple hover:text-white transition-colors">Safari</a>
                                <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-bda6aba4-d4ef-4ce9-a4d4-130180968852" target="_blank" rel="noopener noreferrer" className="border-4 border-yellow px-4 py-2 text-sm font-bold text-dark text-center hover:bg-yellow transition-colors">Edge</a>
                            </div>
                        </div>

                        <div className="border-4 border-dark/10 bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Cookie Preferences</h3>
                            <p className="text-sm text-dark/70">You can adjust cookie preferences in your account settings or through our cookie consent banner when you first visit.</p>
                        </div>

                        <div className="border-4 border-yellow bg-yellow/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">Note</p>
                            <p className="text-sm text-dark/70">Disabling essential cookies may prevent the platform from functioning properly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 6 — Your Consent
               ══════════════════════════════════════════════════════════════ */}
            <section id="consent" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Your <span className="text-teal">Consent</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">
                            By using Splits Network, you consent to our use of cookies as described in this policy. You can always change your preferences or delete cookies through your browser settings.
                        </p>
                        <div className="border-4 border-teal bg-white p-6">
                            <p className="font-bold text-sm text-dark mb-1">Consent Banner</p>
                            <p className="text-sm text-dark/70">You&apos;ll see a cookie consent banner on first visit. Accept or customize your preferences.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 7 — Do Not Track
               ══════════════════════════════════════════════════════════════ */}
            <section id="tracking" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Do Not <span className="text-purple">Track</span> (DNT)
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-4">
                            Some browsers include a &quot;Do Not Track&quot; (DNT) feature. Currently, web standards don&apos;t require websites to honor DNT signals. However, we respect user privacy choices.
                        </p>
                        <p className="text-base text-dark/80">
                            If you have DNT enabled and want us to respect it, please contact{" "}
                            <a href="mailto:privacy@splits.network" className="text-coral font-bold underline">privacy@splits.network</a> to discuss your preferences.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 8 — Updates
               ══════════════════════════════════════════════════════════════ */}
            <section id="updates" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">8</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Updates to This <span className="text-coral">Policy</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We may update this Cookie Policy as our use of cookies changes or for other operational, legal, or regulatory reasons.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Updated policy will be posted with a new &quot;Last Updated&quot; date</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We&apos;ll notify you of material changes via email</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Your continued use means you accept the changes</li>
                        </ul>
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
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-teal p-6">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-dark text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Privacy Team</h3>
                                <a href="mailto:privacy@splits.network" className="text-teal font-bold text-sm">privacy@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 5 business days</p>
                            </div>
                            <div className="border-4 border-coral p-6">
                                <div className="w-12 h-12 bg-coral flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-headset text-white text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Support</h3>
                                <a href="mailto:support@splits.network" className="text-coral font-bold text-sm">support@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 2 business days</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t-4 border-white/10 text-center">
                            <p className="text-white/50 text-sm mb-4">Last updated: <span className="font-bold text-white/70">{lastUpdated}</span></p>
                            <div className="flex gap-6 justify-center flex-wrap">
                                <a href="/public/privacy-policy" className="text-teal font-bold text-sm uppercase tracking-wider">Privacy Policy</a>
                                <a href="/public/terms-of-service" className="text-coral font-bold text-sm uppercase tracking-wider">Terms of Service</a>
                                <a href="/" className="text-yellow font-bold text-sm uppercase tracking-wider">Back to Home</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </CookieAnimator>
    );
}
