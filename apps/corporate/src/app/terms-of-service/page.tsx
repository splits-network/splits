import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { LegalBaselAnimator } from "@/components/legal-animator";

export const metadata: Metadata = {
    title: "Terms of Service | Employment Networks",
    description:
        "Legal terms and conditions for using Employment Networks platforms and services.",
    ...buildCanonical("/terms-of-service"),
};

export default function TermsOfServiceBaselPage() {
    const lastUpdated = "January 24, 2026";

    const tocItems = [
        { n: "1", id: "acceptance", label: "Acceptance" },
        { n: "2", id: "platforms", label: "Our Platforms" },
        { n: "3", id: "eligibility", label: "Eligibility" },
        { n: "4", id: "accounts", label: "Accounts" },
        { n: "5", id: "conduct", label: "User Conduct" },
        { n: "6", id: "ip-rights", label: "IP Rights" },
        { n: "7", id: "disclaimers", label: "Disclaimers" },
        { n: "8", id: "contact", label: "Contact" },
    ];

    return (
        <LegalBaselAnimator>
            {/* ═══ HERO ═══ */}
            <section className="py-28 bg-neutral text-neutral-content">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="bl-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-gavel mr-2" />
                            Legal
                        </p>
                        <h1 className="bl-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-6 opacity-0">
                            Terms of <span className="text-primary">Service</span>
                        </h1>
                        <p className="bl-hero-subtitle text-lg md:text-xl opacity-70 leading-relaxed mb-6 opacity-0">
                            Legal terms and conditions for using our platforms
                        </p>
                        <p className="bl-hero-date text-sm font-semibold uppercase tracking-wider opacity-40 opacity-0">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ TABLE OF CONTENTS ═══ */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-toc border-l-4 border-primary bg-base-100 p-8 shadow-sm opacity-0">
                        <h2 className="text-xl font-black tracking-tight mb-6">
                            Quick <span className="text-primary">Navigation</span>
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-3">
                            {tocItems.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className="text-sm font-bold text-base-content/70 hover:text-primary transition-colors flex items-center gap-3"
                                    >
                                        <span className="w-7 h-7 bg-primary text-primary-content flex items-center justify-center text-xs font-black flex-shrink-0">
                                            {item.n}
                                        </span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══ Section 1 — Acceptance ═══ */}
            <section id="acceptance" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">1</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Acceptance of Terms</h2>
                        </div>
                        <p className="text-base leading-relaxed text-base-content/80 mb-6">
                            By accessing and using Employment Networks platforms (Splits, Applicant, or any related services), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platforms.
                        </p>
                        <div className="border-l-4 border-info bg-info/5 p-6">
                            <p className="font-bold text-sm mb-1">Binding Agreement</p>
                            <p className="text-sm text-base-content/70">These terms constitute a legally binding agreement between you and Employment Networks, Inc.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 2 — Our Platforms ═══ */}
            <section id="platforms" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">2</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Our Platforms</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: "Splits Network", color: "primary", items: ["Collaborative recruiting", "Fee sharing marketplace", "ATS and job management", "Placement tracking"] },
                                { title: "Applicant Network", color: "secondary", items: ["Candidate job search", "Application management", "Profile building", "Opportunity tracking"] },
                            ].map((p) => (
                                <div key={p.title} className={`border-l-4 border-${p.color} bg-base-100 p-6 shadow-sm`}>
                                    <h3 className="font-bold text-base mb-3">{p.title}</h3>
                                    <ul className="space-y-2 text-sm text-base-content/70">
                                        {p.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <i className={`fa-duotone fa-regular fa-check text-xs text-${p.color} mt-1`} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 3 — Eligibility ═══ */}
            <section id="eligibility" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-accent text-accent-content flex items-center justify-center font-black text-lg flex-shrink-0">3</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Eligibility</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "You must be at least 18 years old",
                                "You must have legal authority to enter into these terms",
                                "You cannot violate any applicable laws or regulations",
                                "You may maintain only one account per person/entity",
                            ].map((text, i) => (
                                <div key={i} className="border-l-4 border-primary bg-base-200 p-4 flex items-start gap-3">
                                    <span className="w-8 h-8 bg-primary text-primary-content flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-base-content/70 pt-1">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 4 — Accounts ═══ */}
            <section id="accounts" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">4</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Accounts &amp; Registration</h2>
                        </div>
                        {[
                            { title: "Accurate Information", desc: "You agree to provide accurate, current, and complete information during registration and keep it updated." },
                            { title: "Account Security", desc: "You are responsible for maintaining the confidentiality of your password and account credentials." },
                            { title: "Verification", desc: "We may require identity verification or background checks to use certain platform features." },
                        ].map((item) => (
                            <div key={item.title} className="border-l-4 border-secondary bg-base-100 p-6 mb-4 shadow-sm">
                                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                                <p className="text-sm text-base-content/70">{item.desc}</p>
                            </div>
                        ))}
                        <div className="border-l-4 border-warning bg-warning/5 p-6">
                            <p className="font-bold text-sm mb-1">Keep Your Password Secure</p>
                            <p className="text-sm text-base-content/70">Never share your password. You are liable for all activity on your account.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 5 — User Conduct ═══ */}
            <section id="conduct" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-error text-error-content flex items-center justify-center font-black text-lg flex-shrink-0">5</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">User Conduct</h2>
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
                                <div key={i} className="border-l-4 border-error/30 bg-base-200 p-4 flex items-start gap-3">
                                    <span className="w-8 h-8 bg-error text-error-content flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-ban text-sm" />
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm">{item.title}</p>
                                        <p className="text-xs text-base-content/60">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 6 — IP Rights ═══ */}
            <section id="ip-rights" className="py-16 bg-base-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center font-black text-lg flex-shrink-0">6</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Intellectual Property Rights</h2>
                        </div>
                        <div className="border-l-4 border-primary bg-base-100 p-6 mb-4 shadow-sm">
                            <h3 className="font-bold text-base mb-2">Platform Ownership</h3>
                            <p className="text-sm text-base-content/70">Employment Networks retains all rights to the platforms, including design, code, content, and trademarks. You receive a limited license to use the platforms for personal or business purposes.</p>
                        </div>
                        <div className="border-l-4 border-secondary bg-base-100 p-6 shadow-sm">
                            <h3 className="font-bold text-base mb-2">Your Content</h3>
                            <p className="text-sm text-base-content/70">You retain ownership of content you upload (resumes, job descriptions, etc.), but grant us a license to use it to provide services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Section 7 — Disclaimers ═══ */}
            <section id="disclaimers" className="py-16 bg-base-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-section opacity-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-warning text-warning-content flex items-center justify-center font-black text-lg flex-shrink-0">7</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Disclaimers</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "As-Is Service", desc: "Platforms are provided \"as-is\" without warranties of any kind, express or implied." },
                                { title: "User Content", desc: "You are responsible for the accuracy and legality of content you post." },
                                { title: "No Guarantees", desc: "We do not guarantee uninterrupted service, job placement, or hiring outcomes." },
                            ].map((item) => (
                                <div key={item.title} className="border-l-4 border-warning bg-warning/5 p-6">
                                    <p className="font-bold text-sm mb-1">{item.title}</p>
                                    <p className="text-sm text-base-content/70">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT ═══ */}
            <section id="contact" className="py-16 bg-primary text-primary-content">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bl-contact opacity-0">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8 text-center">
                            Questions About These Terms?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-gavel text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">Legal Team</h3>
                                <a href="mailto:legal@employment-networks.com" className="text-sm font-bold underline hover:opacity-80 transition-opacity">
                                    legal@employment-networks.com
                                </a>
                            </div>
                            <div className="border-l-4 border-white/30 bg-white/10 p-6">
                                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-4">
                                    <i className="fa-duotone fa-regular fa-headset text-lg" />
                                </div>
                                <h3 className="font-bold text-base mb-2">Support</h3>
                                <a href="mailto:support@employment-networks.com" className="text-sm font-bold underline hover:opacity-80 transition-opacity">
                                    support@employment-networks.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LegalBaselAnimator>
    );
}
