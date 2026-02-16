import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { TermsAnimator } from "./terms-animator";

export const metadata: Metadata = {
    title: "Terms of Service | Employment Networks",
    description:
        "Legal terms and conditions for using Employment Networks platforms and services.",
    ...buildCanonical("/terms-of-service-memphis"),
};

export default function TermsOfServiceMemphisPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <TermsAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[12%] left-[8%] w-20 h-20 rounded-full border-[5px] border-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[50%] right-[12%] w-18 h-18 rounded-full bg-coral opacity-0" />
                    <div className="memphis-shape absolute bottom-[18%] left-[18%] w-14 h-14 bg-teal opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[25%] w-12 h-12 rotate-45 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[25%] right-[40%] w-20 h-8 -rotate-12 border-4 border-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[65%] left-[35%] w-10 h-10 rotate-12 bg-yellow opacity-0" />
                    <svg className="memphis-shape absolute top-[15%] left-[50%] opacity-0" width="30" height="30" viewBox="0 0 30 30">
                        <line x1="15" y1="3" x2="15" y2="27" className="text-coral" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <line x1="3" y1="15" x2="27" y2="15" className="text-coral" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <svg className="memphis-shape absolute bottom-[10%] right-[15%] opacity-0" width="80" height="24" viewBox="0 0 80 24">
                        <polyline points="0,20 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20" fill="none" stroke="currentColor" className="text-teal" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-yellow text-dark mb-8 opacity-0">
                            <i className="fa-duotone fa-regular fa-gavel"></i>
                            Legal
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-white opacity-0">
                            Terms of{" "}
                            <span className="text-yellow">Service</span>
                        </h1>

                        <p className="hero-subtitle text-lg md:text-xl leading-relaxed mb-6 text-white/70 max-w-2xl mx-auto opacity-0">
                            Legal terms and conditions for using our platforms
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
                                { n: "1", id: "acceptance", label: "Acceptance" },
                                { n: "2", id: "platforms", label: "Our Platforms" },
                                { n: "3", id: "eligibility", label: "Eligibility" },
                                { n: "4", id: "accounts", label: "Accounts" },
                                { n: "5", id: "conduct", label: "User Conduct" },
                                { n: "6", id: "ip-rights", label: "IP Rights" },
                                { n: "7", id: "disclaimers", label: "Disclaimers" },
                                { n: "8", id: "contact", label: "Contact" },
                            ].map((item) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`} className="text-sm font-bold text-dark/70 hover:text-yellow transition-colors flex items-center gap-2">
                                        <span className="w-6 h-6 bg-yellow text-dark flex items-center justify-center text-xs font-black flex-shrink-0">{item.n}</span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Section 1 — Acceptance ── */}
            <section id="acceptance" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Acceptance of <span className="text-coral">Terms</span></h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            By accessing and using Employment Networks platforms (Splits, Applicant, or any related services), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platforms.
                        </p>
                        <div className="border-4 border-teal bg-teal/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">Binding Agreement</p>
                            <p className="text-sm text-dark/70">These terms constitute a legally binding agreement between you and Employment Networks, Inc.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 2 — Our Platforms ── */}
            <section id="platforms" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Our <span className="text-teal">Platforms</span></h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Splits Network</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Collaborative recruiting</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Fee sharing marketplace</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>ATS and job management</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Placement tracking</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Applicant Network</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Candidate job search</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Application management</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Profile building</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Opportunity tracking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 3 — Eligibility ── */}
            <section id="eligibility" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-yellow">Eligibility</span></h2>
                        </div>
                        <div className="space-y-3">
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">1</span><p className="text-sm text-dark/70">You must be at least 18 years old</p></div>
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">2</span><p className="text-sm text-dark/70">You must have legal authority to enter into these terms</p></div>
                            <div className="border-4 border-purple bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><p className="text-sm text-dark/70">You cannot violate any applicable laws or regulations</p></div>
                            <div className="border-4 border-yellow bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-yellow text-dark flex items-center justify-center font-black text-sm flex-shrink-0">4</span><p className="text-sm text-dark/70">You may maintain only one account per person/entity</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4 — Accounts ── */}
            <section id="accounts" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Accounts &amp; <span className="text-purple">Registration</span></h2>
                        </div>
                        <div className="border-4 border-teal bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Accurate Information</h3>
                            <p className="text-sm text-dark/70">You agree to provide accurate, current, and complete information during registration and keep it updated.</p>
                        </div>
                        <div className="border-4 border-coral bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Account Security</h3>
                            <p className="text-sm text-dark/70">You are responsible for maintaining the confidentiality of your password and account credentials.</p>
                        </div>
                        <div className="border-4 border-purple bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Verification</h3>
                            <p className="text-sm text-dark/70">We may require identity verification or background checks to use certain platform features.</p>
                        </div>
                        <div className="border-4 border-yellow bg-yellow/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">Keep Your Password Secure</p>
                            <p className="text-sm text-dark/70">Never share your password. You are liable for all activity on your account.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5 — User Conduct ── */}
            <section id="conduct" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">User <span className="text-coral">Conduct</span></h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: "No Harassment", desc: "Harassment, bullying, or abusive behavior is prohibited" },
                                { title: "No Fraud", desc: "Fraudulent activity or misrepresentation is forbidden" },
                                { title: "No Spam", desc: "Unsolicited communications or spam are not allowed" },
                                { title: "No Discrimination", desc: "Discriminatory conduct violates our policies" },
                                { title: "No Illegal Activity", desc: "All activity must comply with applicable laws" },
                                { title: "No Automation Abuse", desc: "Unauthorized bots or automated access is prohibited" },
                            ].map((item, i) => (
                                <div key={i} className="border-4 border-coral/20 bg-white p-4 flex items-start gap-3">
                                    <span className="w-8 h-8 bg-coral text-white flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-ban text-sm"></i></span>
                                    <div><p className="font-bold text-sm text-dark">{item.title}</p><p className="text-xs text-dark/60">{item.desc}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 6 — IP Rights ── */}
            <section id="ip-rights" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Intellectual Property <span className="text-teal">Rights</span></h2>
                        </div>
                        <div className="border-4 border-coral bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Platform Ownership</h3>
                            <p className="text-sm text-dark/70">Employment Networks retains all rights to the platforms, including design, code, content, and trademarks. You receive a limited license to use the platforms for personal or business purposes.</p>
                        </div>
                        <div className="border-4 border-teal bg-white p-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Your Content</h3>
                            <p className="text-sm text-dark/70">You retain ownership of content you upload (resumes, job descriptions, etc.), but grant us a license to use it to provide services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 7 — Disclaimers ── */}
            <section id="disclaimers" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-yellow">Disclaimers</span></h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">As-Is Service</p><p className="text-sm text-dark/70">Platforms are provided &quot;as-is&quot; without warranties of any kind, express or implied.</p></div>
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">User Content</p><p className="text-sm text-dark/70">You are responsible for the accuracy and legality of content you post.</p></div>
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">No Guarantees</p><p className="text-sm text-dark/70">We do not guarantee uninterrupted service, job placement, or hiring outcomes.</p></div>
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
                            Questions About These <span className="text-yellow">Terms?</span>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-yellow p-6">
                                <div className="w-12 h-12 bg-yellow flex items-center justify-center mb-4"><i className="fa-duotone fa-regular fa-gavel text-dark text-lg"></i></div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Legal Team</h3>
                                <a href="mailto:legal@employment-networks.com" className="text-yellow font-bold text-sm">legal@employment-networks.com</a>
                            </div>
                            <div className="border-4 border-teal p-6">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4"><i className="fa-duotone fa-regular fa-headset text-dark text-lg"></i></div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Support</h3>
                                <a href="mailto:support@employment-networks.com" className="text-teal font-bold text-sm">support@employment-networks.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </TermsAnimator>
    );
}
