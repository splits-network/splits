import { Metadata } from 'next';
import Link from 'next/link';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Terms of Service | Applicant Network',
    description: 'Legal terms and conditions for using Applicant Network for job seekers, recruiters, and companies.',
    ...buildCanonical("/public/terms-of-service"),
};

export default function TermsOfServicePage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-secondary text-secondary-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg opacity-90">
                            Legal terms and conditions for using Splits Network
                        </p>
                        <p className="text-sm opacity-75 mt-4">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Table of Contents Card */}
                    <div className="card bg-base-200 shadow-lg mb-12">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <i className="fa-duotone fa-regular fa-list text-secondary text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#acceptance" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Acceptance of Terms</a></li>
                                <li><a href="#service-description" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Service Description</a></li>
                                <li><a href="#eligibility" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Eligibility</a></li>
                                <li><a href="#accounts" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Accounts & Registration</a></li>
                                <li><a href="#user-conduct" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>User Conduct</a></li>
                                <li><a href="#platform-rules" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Platform Rules</a></li>
                                <li><a href="#fees" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Fees & Payments</a></li>
                                <li><a href="#intellectual-property" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Intellectual Property</a></li>
                                <li><a href="#privacy" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Privacy</a></li>
                                <li><a href="#disclaimers" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Disclaimers</a></li>
                                <li><a href="#indemnification" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Indemnification</a></li>
                                <li><a href="#termination" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Termination</a></li>
                                <li><a href="#dispute-resolution" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Dispute Resolution</a></li>
                                <li><a href="#governing-law" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Governing Law</a></li>
                                <li><a href="#changes" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Changes to Terms</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* 1. Acceptance of Terms */}
                    <section id="acceptance" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">1. Acceptance of Terms</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <p className="text-sm mb-4">
                                        By accessing and using Splits Network, you accept and agree to be bound by the terms and conditions described in this agreement. If you do not agree to these terms, you should not use the service.
                                    </p>
                                </div>
                            </div>
                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-circle-info"></i>
                                <div>
                                    <h3 className="font-bold">Legal Agreement</h3>
                                    <p className="text-sm">These Terms of Service constitute a binding legal agreement between you and Splits Network.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Service Description */}
                    <section id="service-description" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-layer-group text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">2. Service Description</h2>
                        </div>
                        <p className="mb-6 text-base-content/80">
                            Splits Network is a split-fee recruiting marketplace that connects job seekers with recruiters and companies. The platform enables:
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-briefcase text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Candidates</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Job search & discovery</li>
                                        <li>✓ Application management</li>
                                        <li>✓ Recruiter communication</li>
                                        <li>✓ Placement tracking</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-people-group text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Recruiters</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Job listing & management</li>
                                        <li>✓ Candidate search</li>
                                        <li>✓ Application review</li>
                                        <li>✓ Interview coordination</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-building text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Companies</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Job posting</li>
                                        <li>✓ Applicant tracking</li>
                                        <li>✓ Team collaboration</li>
                                        <li>✓ Hiring workflows</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Eligibility */}
                    <section id="eligibility" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-id-card text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">3. Eligibility</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="badge badge-secondary flex-shrink-0">1</span>
                                <p className="text-sm"><strong>Age:</strong> You must be at least 18 years old</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="badge badge-secondary flex-shrink-0">2</span>
                                <p className="text-sm"><strong>Legal Authority:</strong> You must have legal capacity to enter into binding agreements</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="badge badge-secondary flex-shrink-0">3</span>
                                <p className="text-sm"><strong>Jurisdiction:</strong> You must not be prohibited by law from using the service</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="badge badge-secondary flex-shrink-0">4</span>
                                <p className="text-sm"><strong>Single Account:</strong> You must create only one personal account per email</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Accounts & Registration */}
                    <section id="accounts" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">4. Accounts & Registration</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Account Creation</h3>
                                    <p className="text-sm">You agree to provide accurate and complete information during registration. You are responsible for maintaining confidentiality of your login credentials.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Account Responsibility</h3>
                                    <p className="text-sm">You are liable for all activity on your account. Notify us immediately of unauthorized access or security breaches.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Verification</h3>
                                    <p className="text-sm">We may require email verification, identity verification, or background checks to maintain platform integrity.</p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">Account Security</h3>
                                    <p className="text-sm">Keep your password secure. Never share your login credentials with others.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. User Conduct */}
                    <section id="user-conduct" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield-check text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">5. User Conduct</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Harassment</strong><p className="text-xs text-base-content/70">Prohibited: threats, intimidation, or abusive communication</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Fraud</strong><p className="text-xs text-base-content/70">Prohibited: misrepresentation, false information, or deception</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Spam</strong><p className="text-xs text-base-content/70">Prohibited: unsolicited messages, commercial spam, or mass mailings</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Discrimination</strong><p className="text-xs text-base-content/70">Prohibited: discrimination based on protected characteristics</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Illegal Activity</strong><p className="text-xs text-base-content/70">Prohibited: violating local, state, or federal laws</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded-lg border border-base-300 flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl"></i>
                                <div><strong className="text-sm">No Automation</strong><p className="text-xs text-base-content/70">Prohibited: bots, scrapers, or automated access without permission</p></div>
                            </div>
                        </div>
                    </section>

                    {/* 6. Platform Rules */}
                    <section id="platform-rules" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gavel text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">6. Platform Rules</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-briefcase text-secondary mr-2"></i>For Candidates</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Provide accurate resume and qualifications</li>
                                        <li>✓ Respond professionally to recruiters</li>
                                        <li>✓ Notify changes in availability</li>
                                        <li>✓ Honor agreed placement terms</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-people-group text-secondary mr-2"></i>For Recruiters</h3>
                                    <div className="space-y-2 text-sm">
                                        <li>✓ Accurate job descriptions</li>
                                        <li>✓ Timely candidate communication</li>
                                        <li>✓ Fair fee arrangements</li>
                                        <li>✓ Compliance with employment laws</li>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. Fees & Payments */}
                    <section id="fees" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-credit-card text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">7. Fees & Payments</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Fee Structure</h3>
                                    <p className="text-sm mb-4">Recruiters pay split fees on successful placements. Fee percentages and payment terms are displayed at the time of service.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Payment Methods</h3>
                                    <p className="text-sm">We accept payments via Stripe. Fees are processed automatically upon placement completion.</p>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-circle-info"></i>
                                <div>
                                    <h3 className="font-bold">Fee Changes</h3>
                                    <p className="text-sm">We may update fees with 30 days' notice. Continuing to use the service indicates acceptance of new fees.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 8. Intellectual Property */}
                    <section id="intellectual-property" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-copyright text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">8. Intellectual Property Rights</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <h3 className="card-title mb-4">Our IP</h3>
                                <p className="text-sm mb-4">All platform content, design, and technology are owned by Splits Network. You may not reproduce, distribute, or modify without permission.</p>
                                <div className="divider my-4"></div>
                                <h3 className="card-title mb-4">Your Content</h3>
                                <p className="text-sm">You retain rights to your resumes, profiles, and content. By uploading, you grant us license to use it for platform operations.</p>
                            </div>
                        </div>
                    </section>

                    {/* 9. Privacy */}
                    <section id="privacy" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">9. Privacy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">Your use of Splits Network is governed by our <Link href="/public/privacy-policy" className="link link-secondary underline">Privacy Policy</Link>. By using the platform, you consent to our privacy practices.</p>
                            </div>
                        </div>
                    </section>

                    {/* 10. Disclaimers */}
                    <section id="disclaimers" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">10. Disclaimers</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">As-Is Service</h3>
                                    <p className="text-sm">Splits Network is provided "as is" without warranties. We don't guarantee specific outcomes or successful placements.</p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">User Content</h3>
                                    <p className="text-sm">Users are responsible for content they post. We don't verify resume accuracy or recruiter legitimacy. Verify information independently.</p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">Independence</h3>
                                    <p className="text-sm">Splits Network is a marketplace platform. We're not a party to any employment agreements or fees between users.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 11. Indemnification */}
                    <section id="indemnification" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-file-shield text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">11. Indemnification</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">You agree to indemnify Splits Network from any claims, damages, or losses arising from your use of the platform, violation of these terms, or infringement of rights.</p>
                            </div>
                        </div>
                    </section>

                    {/* 12. Termination */}
                    <section id="termination" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-power-off text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">12. Termination</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-user text-secondary mr-2"></i>By You</h3>
                                    <p className="text-sm">You may terminate your account at any time through account settings. We'll delete your data within 30 days.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-building text-secondary mr-2"></i>By Us</h3>
                                    <p className="text-sm">We may terminate accounts for violations of these terms. You'll be notified and given opportunity to cure issues.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 13. Dispute Resolution */}
                    <section id="dispute-resolution" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">13. Dispute Resolution</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-secondary badge-lg flex-shrink-0">1</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-comments text-secondary mr-2"></i>Informal Resolution</h3>
                                            <p className="text-sm text-base-content/80">Contact <a href="mailto:support@splits.network" className="link link-secondary font-semibold">support@splits.network</a> to discuss and resolve disputes amicably.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-secondary badge-lg flex-shrink-0">2</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-balance-scale text-secondary mr-2"></i>Mediation</h3>
                                            <p className="text-sm text-base-content/80">If informal resolution fails, you may submit to non-binding mediation with a neutral third party to facilitate agreement.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-secondary badge-lg flex-shrink-0">3</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-gavel text-secondary mr-2"></i>Legal Action</h3>
                                            <p className="text-sm text-base-content/80">If mediation is unsuccessful, either party may pursue binding arbitration or legal action through the courts of Delaware.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 14. Governing Law */}
                    <section id="governing-law" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gavel text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">14. Governing Law</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">These Terms of Service are governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. You consent to the exclusive jurisdiction of Delaware courts.</p>
                            </div>
                        </div>
                    </section>

                    {/* 15. Changes to Terms */}
                    <section id="changes" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">15. Changes to These Terms</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">We may update these Terms at any time. Material changes will be announced with 30 days' notice.</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span className="text-sm">Updated terms posted with new effective date</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span className="text-sm">Notification sent to registered email address</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span className="text-sm">Continued use indicates acceptance</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Contact Us</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Legal Team</h3>
                                    </div>
                                    <p><a href="mailto:legal@splits.network" className="link link-secondary font-semibold">legal@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 5 business days</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-headset text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Support</h3>
                                    </div>
                                    <p><a href="mailto:support@splits.network" className="link link-secondary font-semibold">support@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 2 business days</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <section className="py-12 text-center border-t border-base-300 mt-12">
                        <div className="space-y-4">
                            <p className="text-base-content/70">
                                Last updated: <span className="font-semibold">{lastUpdated}</span>
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <a href="/public/privacy-policy" className="link link-secondary">Privacy Policy</a>
                                <a href="/public/cookie-policy" className="link link-secondary">Cookie Policy</a>
                                <a href="/" className="link link-secondary">Back to Home</a>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}