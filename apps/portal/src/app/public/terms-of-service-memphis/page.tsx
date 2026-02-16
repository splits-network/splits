import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { TermsAnimator } from "./terms-animator";

export const metadata: Metadata = {
    title: "Terms of Service | Splits Network",
    description:
        "Read our comprehensive terms of service for using the Splits Network platform. Understand your rights and obligations as a user.",
    ...buildCanonical("/public/terms-of-service-memphis"),
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
                            Understand the rules and guidelines for using Splits Network
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
                                { n: "1", id: "acceptance", label: "Acceptance of Terms" },
                                { n: "2", id: "description", label: "Service Description" },
                                { n: "3", id: "eligibility", label: "Eligibility" },
                                { n: "4", id: "accounts", label: "Accounts" },
                                { n: "5", id: "conduct", label: "User Conduct" },
                                { n: "6", id: "platform-rules", label: "Platform Rules" },
                                { n: "7", id: "fees", label: "Fees & Payments" },
                                { n: "8", id: "ip", label: "Intellectual Property" },
                                { n: "9", id: "privacy", label: "Privacy" },
                                { n: "10", id: "disclaimers", label: "Disclaimers" },
                                { n: "11", id: "indemnification", label: "Indemnification" },
                                { n: "12", id: "termination", label: "Termination" },
                                { n: "13", id: "disputes", label: "Dispute Resolution" },
                                { n: "14", id: "governing-law", label: "Governing Law" },
                                { n: "15", id: "changes", label: "Changes to Terms" },
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

            {/* ── SECTION 1 — Acceptance ── */}
            <section id="acceptance" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Acceptance of <span className="text-coral">Terms</span></h2>
                        </div>
                        <p className="text-base leading-relaxed text-dark/80 mb-6">
                            By accessing and using the Splits Network platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                        <div className="border-4 border-teal bg-teal/10 p-6">
                            <p className="text-sm text-dark/70">These terms apply to all users of Splits Network, including recruiters, candidates, and company representatives.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 2 — Service Description ── */}
            <section id="description" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Service <span className="text-teal">Description</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">
                            Splits Network is a recruiting platform that facilitates split-fee placements. We connect qualified recruiters with companies seeking talent and provide the infrastructure for collaborative hiring.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">For Recruiters</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Access split opportunities</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Manage candidates</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Track placements &amp; earnings</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">For Companies</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Post job openings</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Review candidates</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Manage hiring process</li>
                                </ul>
                            </div>
                            <div className="border-4 border-purple bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">For Candidates</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Build profile</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Connect with recruiters</li>
                                    <li className="flex items-start gap-2"><span className="text-purple font-black">+</span>Explore opportunities</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 3 — Eligibility ── */}
            <section id="eligibility" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-yellow">Eligibility</span></h2>
                        </div>
                        <p className="text-base font-bold text-dark mb-4">You must meet these eligibility requirements:</p>
                        <div className="space-y-3">
                            <div className="border-4 border-coral bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">1</span><div><p className="font-bold text-sm text-dark">Age Requirement:</p><p className="text-xs text-dark/60">You must be at least 18 years old</p></div></div>
                            <div className="border-4 border-teal bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">2</span><div><p className="font-bold text-sm text-dark">Legal Capacity:</p><p className="text-xs text-dark/60">You have the legal right to enter into contracts</p></div></div>
                            <div className="border-4 border-purple bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><div><p className="font-bold text-sm text-dark">Work Authorization:</p><p className="text-xs text-dark/60">If recruiting/working, you&apos;re authorized in your jurisdiction</p></div></div>
                            <div className="border-4 border-yellow bg-white p-4 flex items-start gap-3"><span className="w-8 h-8 bg-yellow text-dark flex items-center justify-center font-black text-sm flex-shrink-0">4</span><div><p className="font-bold text-sm text-dark">No Restrictions:</p><p className="text-xs text-dark/60">You&apos;re not under sanctions or legally restricted</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 4 — Accounts ── */}
            <section id="accounts" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Accounts &amp; <span className="text-purple">Registration</span></h2>
                        </div>
                        <div className="border-4 border-teal bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Account Responsibility</h3>
                            <p className="text-sm text-dark/70">You are responsible for maintaining the confidentiality of your account credentials and password. You agree to accept responsibility for all activities under your account.</p>
                        </div>
                        <div className="border-4 border-coral bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Accurate Information</h3>
                            <p className="text-sm text-dark/70">You agree to provide accurate, current, and complete information during registration and keep it updated. Providing false information is grounds for account termination.</p>
                        </div>
                        <div className="border-4 border-yellow bg-yellow/10 p-6">
                            <p className="font-bold text-sm text-dark mb-1">Account Security</p>
                            <p className="text-sm text-dark/70">Notify us immediately of any unauthorized access or security breaches. We&apos;re not liable for unauthorized access if you fail to notify us promptly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 5 — User Conduct ── */}
            <section id="conduct" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">User <span className="text-coral">Conduct</span></h2>
                        </div>
                        <p className="text-base font-bold text-dark mb-4">You agree NOT to:</p>
                        <div className="space-y-3">
                            {[
                                "Violate any laws, regulations, or third-party rights",
                                "Engage in fraud, misrepresentation, or deception",
                                "Harass, threaten, or defame other users",
                                "Circumvent fees or payment obligations",
                                "Interfere with service availability or security",
                                "Post content that's offensive, illegal, or infringing",
                            ].map((item, i) => (
                                <div key={i} className="border-4 border-coral/20 bg-white p-4 flex items-start gap-3">
                                    <span className="w-8 h-8 bg-coral text-white flex items-center justify-center flex-shrink-0"><i className="fa-duotone fa-regular fa-ban text-sm"></i></span>
                                    <p className="text-sm text-dark/70">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 6 — Platform Rules ── */}
            <section id="platform-rules" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Platform <span className="text-teal">Rules</span></h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-coral bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">For Recruiters</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Conduct placements only through platform</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Honor split agreements</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Maintain professional conduct</li>
                                    <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Report placements accurately</li>
                                </ul>
                            </div>
                            <div className="border-4 border-teal bg-white p-6">
                                <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">For Companies</h3>
                                <ul className="space-y-2 text-sm text-dark/70">
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Provide accurate job information</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Pay agreed fees promptly</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Honor placement agreements</li>
                                    <li className="flex items-start gap-2"><span className="text-teal font-black">+</span>Treat candidates professionally</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 7 — Fees ── */}
            <section id="fees" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Fees &amp; <span className="text-yellow">Payments</span></h2>
                        </div>
                        <div className="border-4 border-teal bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Fee Structure</h3>
                            <p className="text-sm text-dark/70">Placement fees are calculated as a percentage of the candidate&apos;s agreed salary. Fees vary based on role type and market. Detailed fee information is provided at the time of placement.</p>
                        </div>
                        <div className="border-4 border-coral bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Payment Terms</h3>
                            <ul className="space-y-2 text-sm text-dark/70">
                                <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Payments processed 30 days after placement</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Candidate must be employed for 90 days</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Payment via bank transfer or check</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">+</span>Disputes must be raised within 30 days</li>
                            </ul>
                        </div>
                        <div className="border-4 border-teal bg-teal/10 p-6">
                            <p className="text-sm text-dark/70">Refunds are issued if a placement doesn&apos;t meet employment milestones. See our Refund Policy for details.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 8 — Intellectual Property ── */}
            <section id="ip" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">8</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Intellectual <span className="text-purple">Property</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-4">All platform content, features, and functionality are owned by Splits Network or our licensors and are protected by copyright, trademark, and other laws.</p>
                        <p className="text-base font-bold text-dark mb-4">You are granted a limited, non-exclusive license to use the platform. You may NOT:</p>
                        <ul className="space-y-2">
                            {[
                                "Reproduce or copy content without permission",
                                "Sell, trade, or transfer platform access",
                                "Reverse engineer or extract data",
                                "Remove copyright or intellectual property notices",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-coral text-white flex items-center justify-center flex-shrink-0 mt-0.5"><i className="fa-duotone fa-regular fa-xmark text-xs"></i></span>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── SECTION 9 — Privacy ── */}
            <section id="privacy" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">9</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-coral">Privacy</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-4">Our Privacy Policy governs how we collect, use, and protect your personal information. By using Splits Network, you consent to our Privacy Policy practices.</p>
                        <p className="text-sm"><a href="/public/privacy-policy" className="text-coral font-bold underline">Read our complete Privacy Policy</a></p>
                    </div>
                </div>
            </section>

            {/* ── SECTION 10 — Disclaimers ── */}
            <section id="disclaimers" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">10</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-teal">Disclaimers</span></h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">AS-IS SERVICE</p><p className="text-sm text-dark/70">The platform is provided &quot;AS IS&quot; without warranties. We don&apos;t guarantee uninterrupted or error-free service.</p></div>
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">NO LIABILITY FOR USER CONTENT</p><p className="text-sm text-dark/70">We&apos;re not responsible for user-generated content, placement outcomes, or disputes between parties.</p></div>
                            <div className="border-4 border-yellow bg-yellow/10 p-6"><p className="font-bold text-sm text-dark mb-1">INDEPENDENT RELATIONSHIP</p><p className="text-sm text-dark/70">Splits Network is a platform provider, not an employer. Users are independent parties responsible for their own compliance.</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 11 — Indemnification ── */}
            <section id="indemnification" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">11</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-yellow">Indemnification</span></h2>
                        </div>
                        <p className="text-base text-dark/80">You agree to indemnify, defend, and hold harmless Splits Network from any claims, damages, or expenses arising from your use of the platform, violation of these terms, or infringement of third-party rights. This includes attorney&apos;s fees and court costs.</p>
                    </div>
                </div>
            </section>

            {/* ── SECTION 12 — Termination ── */}
            <section id="termination" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-purple text-white flex items-center justify-center font-black text-lg flex-shrink-0">12</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark"><span className="text-purple">Termination</span></h2>
                        </div>
                        <div className="border-4 border-teal bg-white p-6 mb-4">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Termination by You</h3>
                            <p className="text-sm text-dark/70">You may terminate your account at any time by contacting support. We&apos;ll provide reasonable notice of termination except in cases of violations.</p>
                        </div>
                        <div className="border-4 border-coral bg-white p-6">
                            <h3 className="font-black text-base uppercase tracking-wide text-dark mb-3">Termination by Splits Network</h3>
                            <p className="text-sm font-bold text-dark mb-3">We may terminate accounts for:</p>
                            <ul className="space-y-2 text-sm text-dark/70">
                                <li className="flex items-start gap-2"><span className="text-coral font-black">-</span>Violation of these terms</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">-</span>Fraudulent activity</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">-</span>Repeated misconduct</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">-</span>Non-payment of fees</li>
                                <li className="flex items-start gap-2"><span className="text-coral font-black">-</span>Inactivity (30+ days)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 13 — Dispute Resolution ── */}
            <section id="disputes" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-coral text-white flex items-center justify-center font-black text-lg flex-shrink-0">13</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Dispute <span className="text-coral">Resolution</span></h2>
                        </div>
                        <p className="text-base font-bold text-dark mb-4">We follow this process:</p>
                        <div className="space-y-4">
                            <div className="border-4 border-teal bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-teal text-dark flex items-center justify-center font-black text-sm flex-shrink-0">1</span><div><p className="font-bold text-sm text-dark">Good Faith Negotiation</p><p className="text-xs text-dark/60">Parties attempt to resolve directly (30 days)</p></div></div>
                            <div className="border-4 border-coral bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-coral text-white flex items-center justify-center font-black text-sm flex-shrink-0">2</span><div><p className="font-bold text-sm text-dark">Mediation</p><p className="text-xs text-dark/60">Neutral third-party assists resolution (60 days)</p></div></div>
                            <div className="border-4 border-purple bg-white p-5 flex items-start gap-4"><span className="w-8 h-8 bg-purple text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span><div><p className="font-bold text-sm text-dark">Binding Arbitration</p><p className="text-xs text-dark/60">If unresolved, arbitration is binding</p></div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 14 — Governing Law ── */}
            <section id="governing-law" className="py-16 bg-cream">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-teal text-dark flex items-center justify-center font-black text-lg flex-shrink-0">14</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Governing <span className="text-teal">Law</span></h2>
                        </div>
                        <p className="text-base text-dark/80">These Terms of Service are governed by and construed in accordance with the laws of Delaware, without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of Delaware courts.</p>
                    </div>
                </div>
            </section>

            {/* ── SECTION 15 — Changes to Terms ── */}
            <section id="changes" className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="legal-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-yellow text-dark flex items-center justify-center font-black text-lg flex-shrink-0">15</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark">Changes to <span className="text-yellow">Terms</span></h2>
                        </div>
                        <p className="text-base text-dark/80 mb-6">We may update these Terms of Service periodically. Material changes will be posted with notice. Your continued use means you accept the changes.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We&apos;ll post updated terms with a new &quot;Last Updated&quot; date</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We&apos;ll notify users of material changes via email</li>
                            <li className="flex items-start gap-3 text-sm text-dark/70"><span className="w-6 h-6 bg-teal text-dark flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">+</span>We provide 30 days notice before major changes</li>
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
                            Contact <span className="text-yellow">Information</span>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-4 border-yellow p-6">
                                <div className="w-12 h-12 bg-yellow flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-dark text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">Legal Questions</h3>
                                <a href="mailto:legal@splits.network" className="text-yellow font-bold text-sm">legal@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 5 business days</p>
                            </div>
                            <div className="border-4 border-teal p-6">
                                <div className="w-12 h-12 bg-teal flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-headset text-dark text-lg"></i>
                                </div>
                                <h3 className="font-black text-base uppercase text-white mb-2">General Support</h3>
                                <a href="mailto:support@splits.network" className="text-teal font-bold text-sm">support@splits.network</a>
                                <p className="text-xs text-white/50 mt-2">Response within 2 business days</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t-4 border-white/10 text-center">
                            <p className="text-white/50 text-sm mb-4">Last updated: <span className="font-bold text-white/70">{lastUpdated}</span></p>
                            <div className="flex gap-6 justify-center flex-wrap">
                                <a href="/public/privacy-policy" className="text-coral font-bold text-sm uppercase tracking-wider">Privacy Policy</a>
                                <a href="/public/cookie-policy" className="text-teal font-bold text-sm uppercase tracking-wider">Cookie Policy</a>
                                <a href="/" className="text-yellow font-bold text-sm uppercase tracking-wider">Back to Home</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </TermsAnimator>
    );
}
