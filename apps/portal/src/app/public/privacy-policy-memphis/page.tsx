import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PrivacyAnimator } from "./privacy-animator";

export const metadata: Metadata = {
    title: "Privacy Policy | Splits Network",
    description:
        "Learn how Splits Network collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our commitments.",
    ...buildCanonical("/public/privacy-policy-memphis"),
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
                            How we collect, use, and protect your personal information
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
                            {[
                                { n: "1", id: "overview", label: "Overview" },
                                { n: "2", id: "information-we-collect", label: "Information We Collect" },
                                { n: "3", id: "how-we-use-information", label: "How We Use Information" },
                                { n: "4", id: "information-sharing", label: "Information Sharing" },
                                { n: "5", id: "data-security", label: "Data Security" },
                                { n: "6", id: "data-retention", label: "Data Retention" },
                                { n: "7", id: "your-rights", label: "Your Privacy Rights" },
                                { n: "8", id: "cookies", label: "Cookies & Tracking" },
                                { n: "9", id: "third-party", label: "Third-Party Services" },
                                { n: "10", id: "international", label: "International Transfers" },
                                { n: "11", id: "children", label: "Children's Privacy" },
                                { n: "12", id: "california", label: "California Rights" },
                                { n: "13", id: "gdpr", label: "GDPR Rights (EU)" },
                                { n: "14", id: "changes", label: "Changes to Policy" },
                                { n: "15", id: "contact", label: "Contact Us" },
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

            {/* ══════════════════════════════════════════════════════════════
                SECTION 1 — Overview
               ══════════════════════════════════════════════════════════════ */}
            <section id="overview" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                <span className="text-coral">Overview</span>
                            </h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            Employment Networks, Inc. (&quot;Splits Network,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates a split-fee recruiting marketplace that connects recruiters, candidates, and companies. We are committed to protecting your privacy.
                        </p>
                        <p className="text-base font-bold text-dark mb-4">This Privacy Policy explains how we handle your information when you:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Visit our websites (splits.network, applicant.network)</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Use our platform and mobile applications</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Create an account as a recruiter, candidate, or company representative</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Interact with customer support or marketing communications</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 2 — Information We Collect
               ══════════════════════════════════════════════════════════════ */}
            <section id="information-we-collect" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Information We <span className="text-teal">Collect</span>
                            </h2>
                        </div>

                        <div className="border-4 border-coral bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-4">Information You Provide</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">1</span><div><span className="font-bold text-dark">Account:</span> Name, email, phone, job title, company</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">2</span><div><span className="font-bold text-dark">Profile:</span> Background, skills, experience, education, resume</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">3</span><div><span className="font-bold text-dark">Identity:</span> Government ID, certifications, work authorization</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">4</span><div><span className="font-bold text-dark">Payment:</span> Bank details (processed securely by Stripe)</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0">5</span><div><span className="font-bold text-dark">Communications:</span> Messages, feedback, support requests</div></li>
                            </ul>
                        </div>

                        <div className="border-4 border-teal bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-4">Information We Collect Automatically</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="text-teal font-black">+</span><div><span className="font-bold text-dark">Device Info:</span> IP address, browser type, operating system</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="text-teal font-black">+</span><div><span className="font-bold text-dark">Usage Data:</span> Pages visited, features used, time spent</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="text-teal font-black">+</span><div><span className="font-bold text-dark">Location:</span> General geographic location from IP</div></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="text-teal font-black">+</span><div><span className="font-bold text-dark">Performance:</span> Error logs, loading times, statistics</div></li>
                            </ul>
                        </div>

                        <div className="border-4 border-purple bg-white p-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-4">Information from Third Parties</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase">LinkedIn</span><span>Professional information (when you connect)</span></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase">Checks</span><span>Employment verification, references (with consent)</span></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase">Partners</span><span>Data from ATS and HR platform integrations</span></li>
                                <li className="flex items-start gap-3 text-sm text-dark/70"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase">Public</span><span>Publicly available professional information</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 3 — How We Use Information
               ══════════════════════════════════════════════════════════════ */}
            <section id="how-we-use-information" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                How We Use <span className="text-yellow">Information</span>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Platform Services</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Account management</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Candidate matching</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Job connections</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Split agreements</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Payment processing</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Customer support</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Communication</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Service updates</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Job opportunities</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Candidate profiles</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Feature announcements</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Marketing (consensual)</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Feedback surveys</li>
                                </ul>
                            </div>
                            <div className="border-4 border-purple bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Improvement &amp; Safety</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Usage analytics</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Feature development</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Security monitoring</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Fraud prevention</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Compliance needs</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Experience enhancement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 4 — Information Sharing
               ══════════════════════════════════════════════════════════════ */}
            <section id="information-sharing" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Information Sharing &amp; <span className="text-purple">Disclosure</span>
                            </h2>
                        </div>

                        <div className="border-4 border-teal bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-4">Within Our Platform</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 border-4 border-coral/20"><span className="px-2 py-0.5 bg-coral text-white text-xs font-bold uppercase flex-shrink-0">Candidates</span><p className="text-sm text-dark/70">Shared with recruiters for matching and opportunities</p></div>
                                <div className="flex items-start gap-3 p-3 border-4 border-teal/20"><span className="px-2 py-0.5 bg-teal text-dark text-xs font-bold uppercase flex-shrink-0">Companies</span><p className="text-sm text-dark/70">Present qualified candidates during hiring</p></div>
                                <div className="flex items-start gap-3 p-3 border-4 border-purple/20"><span className="px-2 py-0.5 bg-purple text-white text-xs font-bold uppercase flex-shrink-0">Recruiters</span><p className="text-sm text-dark/70">Enable split-fee partnerships</p></div>
                                <div className="flex items-start gap-3 p-3 border-4 border-yellow/20"><span className="px-2 py-0.5 bg-yellow text-dark text-xs font-bold uppercase flex-shrink-0">Analytics</span><p className="text-sm text-dark/70">Anonymized success rates and metrics</p></div>
                            </div>
                        </div>

                        <div className="border-4 border-coral bg-white p-6 mb-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-4">Service Providers</h3>
                            <p className="text-sm text-dark/70 mb-4">We partner with trusted service providers:</p>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 bg-cream"><span className="font-bold text-sm text-dark">Clerk</span><span className="text-xs text-dark/60">Identity &amp; authentication</span></div>
                                <div className="flex items-center gap-3 p-3 bg-cream"><span className="font-bold text-sm text-dark">Stripe</span><span className="text-xs text-dark/60">Payment processing</span></div>
                                <div className="flex items-center gap-3 p-3 bg-cream"><span className="font-bold text-sm text-dark">Resend</span><span className="text-xs text-dark/60">Email delivery</span></div>
                                <div className="flex items-center gap-3 p-3 bg-cream"><span className="font-bold text-sm text-dark">Supabase</span><span className="text-xs text-dark/60">Database &amp; hosting</span></div>
                            </div>
                        </div>

                        <div className="border-4 border-yellow bg-yellow/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">Legal Requirements</p>
                            <p className="text-sm text-dark/70">We may disclose information when required by law, court orders, or to protect safety and prevent fraud.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 5 — Data Security
               ══════════════════════════════════════════════════════════════ */}
            <section id="data-security" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Data <span className="text-coral">Security</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We implement comprehensive security measures:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-teal p-4"><p className="font-bold text-sm text-dark">Encryption</p><p className="text-xs text-dark/60">TLS 1.3 in transit, AES-256 at rest</p></div>
                            <div className="border-4 border-coral p-4"><p className="font-bold text-sm text-dark">Access Controls</p><p className="text-xs text-dark/60">Role-based access, 2FA enabled</p></div>
                            <div className="border-4 border-purple p-4"><p className="font-bold text-sm text-dark">Infrastructure</p><p className="text-xs text-dark/60">Secure cloud hosting with audits</p></div>
                            <div className="border-4 border-yellow p-4"><p className="font-bold text-sm text-dark">PCI Compliance</p><p className="text-xs text-dark/60">PCI DSS compliant payments</p></div>
                            <div className="border-4 border-teal p-4"><p className="font-bold text-sm text-dark">24/7 Monitoring</p><p className="text-xs text-dark/60">Security monitoring &amp; incident response</p></div>
                            <div className="border-4 border-coral p-4"><p className="font-bold text-sm text-dark">Regular Updates</p><p className="text-xs text-dark/60">Continuous security patches</p></div>
                        </div>
                        <div className="border-4 border-teal bg-teal/10 p-6 mt-6">
                            <p className="text-sm text-dark/70">While we implement robust security, no system is 100% secure. We encourage strong passwords and 2FA.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 6 — Data Retention
               ══════════════════════════════════════════════════════════════ */}
            <section id="data-retention" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Data <span className="text-teal">Retention</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We retain your information only as long as necessary:</p>
                        <div className="space-y-4">
                            <div className="border-4 border-coral bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">1</span><div><p className="font-bold text-sm text-dark">Active Accounts</p><p className="text-xs text-dark/60">Retained while account is active</p></div></div>
                            <div className="border-4 border-teal bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">2</span><div><p className="font-bold text-sm text-dark">Inactive Accounts</p><p className="text-xs text-dark/60">Deleted after 3 years (with 60-day notice)</p></div></div>
                            <div className="border-4 border-purple bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><div><p className="font-bold text-sm text-dark">Transaction Records</p><p className="text-xs text-dark/60">Retained 7 years for tax/accounting</p></div></div>
                            <div className="border-4 border-yellow bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-yellow text-dark flex items-center justify-center font-black text-sm flex-shrink-0">4</span><div><p className="font-bold text-sm text-dark">Legal Requirements</p><p className="text-xs text-dark/60">Retained as required by law</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 7 — Your Privacy Rights
               ══════════════════════════════════════════════════════════════ */}
            <section id="your-rights" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Your Privacy <span className="text-yellow">Rights</span>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="border-4 border-coral p-5"><p className="font-bold text-sm text-dark">Right to Access</p><p className="text-xs text-dark/60">Request a copy of your data</p></div>
                            <div className="border-4 border-teal p-5"><p className="font-bold text-sm text-dark">Right to Correct</p><p className="text-xs text-dark/60">Update inaccurate information</p></div>
                            <div className="border-4 border-purple p-5"><p className="font-bold text-sm text-dark">Right to Delete</p><p className="text-xs text-dark/60">Request deletion (with exceptions)</p></div>
                            <div className="border-4 border-yellow p-5"><p className="font-bold text-sm text-dark">Right to Portability</p><p className="text-xs text-dark/60">Get data in readable format</p></div>
                            <div className="border-4 border-coral p-5"><p className="font-bold text-sm text-dark">Right to Restrict</p><p className="text-xs text-dark/60">Limit how we use your data</p></div>
                            <div className="border-4 border-teal p-5"><p className="font-bold text-sm text-dark">Right to Object</p><p className="text-xs text-dark/60">Object to processing</p></div>
                        </div>
                        <div className="border-4 border-teal bg-teal/10 p-6">
                            <p className="text-sm text-dark/70">To exercise these rights, email <a href="mailto:privacy@splits.network" className="text-coral font-bold underline">privacy@splits.network</a>. We&apos;ll respond within 30 days.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 8 — Cookies & Tracking
               ══════════════════════════════════════════════════════════════ */}
            <section id="cookies" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">8</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Cookies &amp; <span className="text-purple">Tracking</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-4">
                            We use cookies and similar technologies to improve your experience. For detailed information, see our{" "}
                            <a href="/public/cookie-policy" className="text-coral font-bold underline">Cookie Policy</a>.
                        </p>
                        <div className="border-4 border-teal bg-white p-6">
                            <p className="text-sm text-dark/70">You can control cookie preferences in your browser settings or through our cookie management interface.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 9 — Third-Party Services
               ══════════════════════════════════════════════════════════════ */}
            <section id="third-party" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">9</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Third-Party <span className="text-coral">Services</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">Our platform integrates with third-party services that have their own privacy policies:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border-4 border-teal p-5"><p className="font-bold text-sm text-dark">Clerk</p><p className="text-xs text-dark/60">Identity &amp; authentication</p></div>
                            <div className="border-4 border-coral p-5"><p className="font-bold text-sm text-dark">Stripe</p><p className="text-xs text-dark/60">Payment processing</p></div>
                            <div className="border-4 border-purple p-5"><p className="font-bold text-sm text-dark">Supabase</p><p className="text-xs text-dark/60">Database &amp; infrastructure</p></div>
                            <div className="border-4 border-yellow p-5"><p className="font-bold text-sm text-dark">LinkedIn</p><p className="text-xs text-dark/60">Professional network integration</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 10 — International Transfers
               ══════════════════════════════════════════════════════════════ */}
            <section id="international" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">10</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                International Data <span className="text-teal">Transfers</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">Your information may be processed in other countries. We ensure appropriate safeguards:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Adequacy decisions from data protection authorities</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Standard contractual clauses</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Certification schemes and codes of conduct</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>Other legally required safeguards</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 11 — Children's Privacy
               ══════════════════════════════════════════════════════════════ */}
            <section id="children" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">11</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Children&apos;s <span className="text-yellow">Privacy</span>
                            </h2>
                        </div>
                        <div className="border-4 border-yellow bg-yellow/10 p-6">
                            <p className="font-bold text-sm text-dark mb-2">Not for Users Under 16</p>
                            <p className="text-sm text-dark/70">Our services are not intended for individuals under 16. We do not knowingly collect information from children under 16. If you become aware of this, please contact us.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 12 — California Rights
               ══════════════════════════════════════════════════════════════ */}
            <section id="california" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">12</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                California Privacy <span className="text-purple">Rights</span> (CCPA/CPRA)
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">California residents have additional rights:</p>
                        <div className="space-y-3">
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">1</span><div><p className="font-bold text-sm text-dark">Right to Know</p><p className="text-xs text-dark/60">Categories and specific personal information collected</p></div></div>
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">2</span><div><p className="font-bold text-sm text-dark">Right to Delete</p><p className="text-xs text-dark/60">Request deletion (subject to exceptions)</p></div></div>
                            <div className="border-4 border-purple bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><div><p className="font-bold text-sm text-dark">Right to Correct</p><p className="text-xs text-dark/60">Request correction of inaccurate information</p></div></div>
                            <div className="border-4 border-yellow bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-yellow text-dark flex items-center justify-center font-black text-sm flex-shrink-0">4</span><div><p className="font-bold text-sm text-dark">Right to Opt-Out</p><p className="text-xs text-dark/60">Opt-out of sale or sharing</p></div></div>
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">5</span><div><p className="font-bold text-sm text-dark">Right to Limit</p><p className="text-xs text-dark/60">Limit use of sensitive information</p></div></div>
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">6</span><div><p className="font-bold text-sm text-dark">Non-Discrimination</p><p className="text-xs text-dark/60">Right not to be discriminated against</p></div></div>
                        </div>
                        <div className="border-4 border-teal bg-teal/10 p-6 mt-6">
                            <p className="text-sm text-dark/70">We do not sell information. Email <a href="mailto:privacy@splits.network" className="text-coral font-bold underline">privacy@splits.network</a> to exercise rights.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 13 — GDPR Rights
               ══════════════════════════════════════════════════════════════ */}
            <section id="gdpr" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">13</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                GDPR Rights <span className="text-coral">(EU Users)</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">If you are in the EU, you have additional GDPR rights:</p>
                        <div className="space-y-4">
                            <div className="border-4 border-teal bg-white p-5"><p className="font-bold text-sm text-dark">Lawful Basis</p><p className="text-xs text-dark/60">We process data based on contract, legitimate interests, or consent</p></div>
                            <div className="border-4 border-purple bg-white p-5"><p className="font-bold text-sm text-dark">Data Protection Officer</p><p className="text-xs text-dark/60">Contact our DPO at <a href="mailto:dpo@splits.network" className="text-coral font-bold underline">dpo@splits.network</a></p></div>
                            <div className="border-4 border-coral bg-white p-5"><p className="font-bold text-sm text-dark">Supervisory Authority</p><p className="text-xs text-dark/60">Right to lodge complaints with your data protection authority</p></div>
                            <div className="border-4 border-yellow bg-white p-5"><p className="font-bold text-sm text-dark">Automated Decision-Making</p><p className="text-xs text-dark/60">Right to object to automated decision-making</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 14 — Changes to Policy
               ══════════════════════════════════════════════════════════════ */}
            <section id="changes" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">14</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">
                                Changes to This <span className="text-teal">Policy</span>
                            </h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We may update this Privacy Policy periodically:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We&apos;ll post the updated policy with a new &quot;Last Updated&quot; date</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We&apos;ll notify you via email if changes are material</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We provide 30 days notice before significant changes</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We maintain previous versions for reference</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 15 — Contact
               ══════════════════════════════════════════════════════════════ */}
            <section id="contact" className="py-16 bg-dark">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 text-center">
                            Contact <span className="text-coral">Information</span>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="border-4 border-coral p-6">
                                <div className="w-12 h-12 bg-coral flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-white text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Privacy Questions</h3>
                                <a href="mailto:privacy@splits.network" className="text-coral font-bold text-sm">privacy@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 5 business days</p>
                            </div>
                            <div className="border-4 border-teal p-6">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-shield-check text-dark text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Data Protection Officer</h3>
                                <a href="mailto:dpo@splits.network" className="text-teal font-bold text-sm">dpo@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 30 days (GDPR)</p>
                            </div>
                        </div>

                        <div className="border-4 border-white/20 p-6 mb-8">
                            <h3 className="font-black text-base uppercase text-white mb-3">Mailing Address</h3>
                            <p className="text-sm text-white/60">Employment Networks, Inc.</p>
                            <p className="text-sm text-white/60">Attention: Privacy Team</p>
                            <p className="text-sm text-white/60">[Company Address]</p>
                            <p className="text-sm text-white/60">[City, State ZIP Code]</p>
                        </div>

                        <div className="pt-8 border-t-4 border-white/10 text-center">
                            <p className="text-white/50 text-sm mb-4">Last updated: <span className="font-bold text-white/70">{lastUpdated}</span></p>
                            <div className="flex gap-6 justify-center flex-wrap">
                                <a href="/public/terms-of-service" className="text-teal font-bold text-sm uppercase tracking-wider">Terms of Service</a>
                                <a href="/public/cookie-policy" className="text-coral font-bold text-sm uppercase tracking-wider">Cookie Policy</a>
                                <a href="/" className="text-yellow font-bold text-sm uppercase tracking-wider">Back to Home</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PrivacyAnimator>
    );
}
