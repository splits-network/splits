import { Metadata } from 'next';
import Link from 'next/link';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Privacy Policy | Splits Network',
    description: 'Learn how Splits Network collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our commitments.',
    ...buildCanonical("/public/privacy-policy"),
};

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-primary text-primary-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg opacity-90">
                            How we collect, use, and protect your personal information
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
                                <i className="fa-duotone fa-regular fa-list text-primary text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#overview" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Overview</a></li>
                                <li><a href="#information-we-collect" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Information We Collect</a></li>
                                <li><a href="#how-we-use-information" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>How We Use Information</a></li>
                                <li><a href="#information-sharing" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Information Sharing</a></li>
                                <li><a href="#data-security" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Data Security</a></li>
                                <li><a href="#data-retention" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Data Retention</a></li>
                                <li><a href="#your-rights" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Your Privacy Rights</a></li>
                                <li><a href="#cookies" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Cookies & Tracking</a></li>
                                <li><a href="#third-party" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Third-Party Services</a></li>
                                <li><a href="#international" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>International Transfers</a></li>
                                <li><a href="#children" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Children's Privacy</a></li>
                                <li><a href="#california" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>California Rights</a></li>
                                <li><a href="#gdpr" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>GDPR Rights (EU)</a></li>
                                <li><a href="#changes" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Changes to Policy</a></li>
                                <li><a href="#contact" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Overview */}
                    <section id="overview" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-eye text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">1. Overview</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    Employment Networks, Inc. ("Splits Network," "we," "us," or "our") operates a split-fee recruiting marketplace that connects recruiters, candidates, and companies. We are committed to protecting your privacy.
                                </p>
                                <p className="mb-4 font-semibold">This Privacy Policy explains how we handle your information when you:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i><span>Visit our websites (splits.network, applicant.network)</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i><span>Use our platform and mobile applications</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i><span>Create an account as a recruiter, candidate, or company representative</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i><span>Interact with customer support or marketing communications</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section id="information-we-collect" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-database text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">2. Information We Collect</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4"><i className="fa-duotone fa-regular fa-user text-secondary mr-2"></i>Information You Provide</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2"><span className="badge badge-primary badge-sm mt-1 flex-shrink-0">1</span><div><strong>Account:</strong> Name, email, phone, job title, company</div></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-primary badge-sm mt-1 flex-shrink-0">2</span><div><strong>Profile:</strong> Background, skills, experience, education, resume</div></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-primary badge-sm mt-1 flex-shrink-0">3</span><div><strong>Identity:</strong> Government ID, certifications, work authorization</div></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-primary badge-sm mt-1 flex-shrink-0">4</span><div><strong>Payment:</strong> Bank details (processed securely by Stripe)</div></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-primary badge-sm mt-1 flex-shrink-0">5</span><div><strong>Communications:</strong> Messages, feedback, support requests</div></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4"><i className="fa-duotone fa-regular fa-computer text-secondary mr-2"></i>Information We Collect Automatically</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-globe text-info mt-1 flex-shrink-0"></i><div><strong>Device Info:</strong> IP address, browser type, operating system</div></li>
                                        <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-chart-line text-info mt-1 flex-shrink-0"></i><div><strong>Usage Data:</strong> Pages visited, features used, time spent</div></li>
                                        <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-map-pin text-info mt-1 flex-shrink-0"></i><div><strong>Location:</strong> General geographic location from IP</div></li>
                                        <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-gauge text-info mt-1 flex-shrink-0"></i><div><strong>Performance:</strong> Error logs, loading times, statistics</div></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4"><i className="fa-duotone fa-regular fa-handshake text-secondary mr-2"></i>Information from Third Parties</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2"><span className="badge badge-outline badge-sm mt-1 flex-shrink-0">LinkedIn</span><span>Professional information (when you connect)</span></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-outline badge-sm mt-1 flex-shrink-0">Checks</span><span>Employment verification, references (with consent)</span></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-outline badge-sm mt-1 flex-shrink-0">Partners</span><span>Data from ATS and HR platform integrations</span></li>
                                        <li className="flex items-start gap-2"><span className="badge badge-outline badge-sm mt-1 flex-shrink-0">Public</span><span>Publicly available professional information</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section id="how-we-use-information" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gear text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">3. How We Use Information</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-layer-group text-primary text-2xl"></i>
                                        <h3 className="card-title text-lg">Platform Services</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Account management</li>
                                        <li>✓ Candidate matching</li>
                                        <li>✓ Job connections</li>
                                        <li>✓ Split agreements</li>
                                        <li>✓ Payment processing</li>
                                        <li>✓ Customer support</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-secondary text-2xl"></i>
                                        <h3 className="card-title text-lg">Communication</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Service updates</li>
                                        <li>✓ Job opportunities</li>
                                        <li>✓ Candidate profiles</li>
                                        <li>✓ Feature announcements</li>
                                        <li>✓ Marketing (consensual)</li>
                                        <li>✓ Feedback surveys</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-chart-bar text-accent text-2xl"></i>
                                        <h3 className="card-title text-lg">Improvement & Safety</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Usage analytics</li>
                                        <li>✓ Feature development</li>
                                        <li>✓ Security monitoring</li>
                                        <li>✓ Fraud prevention</li>
                                        <li>✓ Compliance needs</li>
                                        <li>✓ Experience enhancement</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section id="information-sharing" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-share-nodes text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">4. Information Sharing & Disclosure</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">Within Our Platform</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <span className="badge badge-primary flex-shrink-0">Candidates</span>
                                            <p className="text-sm">Shared with recruiters for matching and opportunities</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <span className="badge badge-secondary flex-shrink-0">Companies</span>
                                            <p className="text-sm">Present qualified candidates during hiring</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <span className="badge badge-accent flex-shrink-0">Recruiters</span>
                                            <p className="text-sm">Enable split-fee partnerships</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <span className="badge badge-info flex-shrink-0">Analytics</span>
                                            <p className="text-sm">Anonymized success rates and metrics</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">Service Providers</h3>
                                    <p className="mb-4 text-sm text-base-content/70">We partner with trusted service providers:</p>
                                    <div className="grid gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded">
                                            <i className="fa-duotone fa-regular fa-lock text-primary flex-shrink-0"></i>
                                            <div><strong>Clerk</strong><p className="text-xs text-base-content/70">Identity & authentication</p></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-success/10 rounded">
                                            <i className="fa-duotone fa-regular fa-credit-card text-success flex-shrink-0"></i>
                                            <div><strong>Stripe</strong><p className="text-xs text-base-content/70">Payment processing</p></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-info/10 rounded">
                                            <i className="fa-duotone fa-regular fa-envelope text-info flex-shrink-0"></i>
                                            <div><strong>Resend</strong><p className="text-xs text-base-content/70">Email delivery</p></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-warning/10 rounded">
                                            <i className="fa-duotone fa-regular fa-database text-warning flex-shrink-0"></i>
                                            <div><strong>Supabase</strong><p className="text-xs text-base-content/70">Database & hosting</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">Legal Requirements</h3>
                                    <p>We may disclose information when required by law, court orders, or to protect safety and prevent fraud.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section id="data-security" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">5. Data Security</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow mb-6">
                            <div className="card-body">
                                <p className="mb-6">We implement comprehensive security measures:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-lock-keyhole text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>Encryption</strong>
                                            <p className="text-sm text-base-content/70">TLS 1.3 in transit, AES-256 at rest</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-user-shield text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>Access Controls</strong>
                                            <p className="text-sm text-base-content/70">Role-based access, 2FA enabled</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-building text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>Infrastructure</strong>
                                            <p className="text-sm text-base-content/70">Secure cloud hosting with audits</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-credit-card text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>PCI Compliance</strong>
                                            <p className="text-sm text-base-content/70">PCI DSS compliant payments</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-eye text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>24/7 Monitoring</strong>
                                            <p className="text-sm text-base-content/70">Security monitoring & incident response</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-arrow-rotate-right text-primary text-lg flex-shrink-0 mt-1"></i>
                                        <div>
                                            <strong>Regular Updates</strong>
                                            <p className="text-sm text-base-content/70">Continuous security patches</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-circle-info"></i>
                            <span>While we implement robust security, no system is 100% secure. We encourage strong passwords and 2FA.</span>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section id="data-retention" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-calendar text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">6. Data Retention</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">We retain your information only as long as necessary:</p>
                                <div className="space-y-3">
                                    <div className="timeline timeline-compact">
                                        <div className="timeline-item">
                                            <div className="timeline-middle"><div className="badge badge-primary">1</div></div>
                                            <div className="timeline-end"><div className="font-bold">Active Accounts</div><p className="text-sm text-base-content/70">Retained while account is active</p></div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-middle"><div className="badge badge-primary">2</div></div>
                                            <div className="timeline-end"><div className="font-bold">Inactive Accounts</div><p className="text-sm text-base-content/70">Deleted after 3 years (with 60-day notice)</p></div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-middle"><div className="badge badge-primary">3</div></div>
                                            <div className="timeline-end"><div className="font-bold">Transaction Records</div><p className="text-sm text-base-content/70">Retained 7 years for tax/accounting</p></div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-middle"><div className="badge badge-primary">4</div></div>
                                            <div className="timeline-end"><div className="font-bold">Legal Requirements</div><p className="text-sm text-base-content/70">Retained as required by law</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section id="your-rights" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-hand-raised text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">7. Your Privacy Rights</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-eye text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Access</h3><p className="text-sm text-base-content/70">Request a copy of your data</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-pen-to-square text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Correct</h3><p className="text-sm text-base-content/70">Update inaccurate information</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-trash text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Delete</h3><p className="text-sm text-base-content/70">Request deletion (with exceptions)</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-download text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Portability</h3><p className="text-sm text-base-content/70">Get data in readable format</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-ban text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Restrict</h3><p className="text-sm text-base-content/70">Limit how we use your data</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body p-4">
                                    <div className="flex gap-3">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-primary text-xl flex-shrink-0"></i>
                                        <div><h3 className="font-bold">Right to Object</h3><p className="text-sm text-base-content/70">Object to processing</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="alert alert-success">
                            <i className="fa-duotone fa-regular fa-circle-check"></i>
                            <span>To exercise these rights, email <a href="mailto:privacy@splits.network" className="link link-primary">privacy@splits.network</a>. We'll respond within 30 days.</span>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section id="cookies" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-cookie text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">8. Cookies & Tracking</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    We use cookies and similar technologies to improve your experience. For detailed information, see our <Link href="/public/cookie-policy" className="link link-primary">Cookie Policy</Link>.
                                </p>
                                <div className="bg-base-200 p-4 rounded flex gap-3">
                                    <i className="fa-duotone fa-regular fa-info text-info flex-shrink-0 mt-1"></i>
                                    <p className="text-sm">You can control cookie preferences in your browser settings or through our cookie management interface.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section id="third-party" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-link text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">9. Third-Party Services</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">Our platform integrates with third-party services that have their own privacy policies:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="card bg-base-200 hover:bg-base-300 transition-colors">
                                        <div className="card-body p-4">
                                            <h3 className="card-title text-sm">Clerk</h3>
                                            <p className="text-xs text-base-content/70 mb-3">Identity & authentication</p>
                                            <span className="text-xs link">View Policy →</span>
                                        </div>
                                    </a>
                                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="card bg-base-200 hover:bg-base-300 transition-colors">
                                        <div className="card-body p-4">
                                            <h3 className="card-title text-sm">Stripe</h3>
                                            <p className="text-xs text-base-content/70 mb-3">Payment processing</p>
                                            <span className="text-xs link">View Policy →</span>
                                        </div>
                                    </a>
                                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="card bg-base-200 hover:bg-base-300 transition-colors">
                                        <div className="card-body p-4">
                                            <h3 className="card-title text-sm">Supabase</h3>
                                            <p className="text-xs text-base-content/70 mb-3">Database & infrastructure</p>
                                            <span className="text-xs link">View Policy →</span>
                                        </div>
                                    </a>
                                    <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="card bg-base-200 hover:bg-base-300 transition-colors">
                                        <div className="card-body p-4">
                                            <h3 className="card-title text-sm">LinkedIn</h3>
                                            <p className="text-xs text-base-content/70 mb-3">Professional network integration</p>
                                            <span className="text-xs link">View Policy →</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* International Transfers */}
                    <section id="international" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-earth-americas text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">10. International Data Transfers</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">Your information may be processed in other countries. We ensure appropriate safeguards:</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3"><span className="badge badge-primary mt-1 flex-shrink-0">✓</span><span>Adequacy decisions from data protection authorities</span></li>
                                    <li className="flex items-start gap-3"><span className="badge badge-primary mt-1 flex-shrink-0">✓</span><span>Standard contractual clauses</span></li>
                                    <li className="flex items-start gap-3"><span className="badge badge-primary mt-1 flex-shrink-0">✓</span><span>Certification schemes and codes of conduct</span></li>
                                    <li className="flex items-start gap-3"><span className="badge badge-primary mt-1 flex-shrink-0">✓</span><span>Other legally required safeguards</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section id="children" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-child text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">11. Children's Privacy</h2>
                        </div>
                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <div>
                                <h3 className="font-bold">Not for Users Under 16</h3>
                                <p>Our services are not intended for individuals under 16. We do not knowingly collect information from children under 16. If you become aware of this, please contact us.</p>
                            </div>
                        </div>
                    </section>

                    {/* California Rights */}
                    <section id="california" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-scroll text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">12. California Privacy Rights (CCPA/CPRA)</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">California residents have additional rights:</p>
                                <div className="space-y-3">
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">1</span><div><strong>Right to Know</strong><p className="text-sm text-base-content/70">Categories and specific personal information collected</p></div></div>
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">2</span><div><strong>Right to Delete</strong><p className="text-sm text-base-content/70">Request deletion (subject to exceptions)</p></div></div>
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">3</span><div><strong>Right to Correct</strong><p className="text-sm text-base-content/70">Request correction of inaccurate information</p></div></div>
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">4</span><div><strong>Right to Opt-Out</strong><p className="text-sm text-base-content/70">Opt-out of sale or sharing</p></div></div>
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">5</span><div><strong>Right to Limit</strong><p className="text-sm text-base-content/70">Limit use of sensitive information</p></div></div>
                                    <div className="flex gap-3"><span className="badge badge-lg badge-secondary flex-shrink-0">6</span><div><strong>Non-Discrimination</strong><p className="text-sm text-base-content/70">Right not to be discriminated against</p></div></div>
                                </div>
                                <div className="alert alert-success mt-6">
                                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                                    <span>We do not sell information. Email <a href="mailto:privacy@splits.network" className="link link-primary">privacy@splits.network</a> to exercise rights.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* GDPR Rights */}
                    <section id="gdpr" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-euro-sign text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">13. GDPR Rights (EU Users)</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">If you are in the EU, you have additional GDPR rights:</p>
                                <div className="space-y-3">
                                    <div className="p-4 bg-base-200 rounded"><h3 className="font-bold">Lawful Basis</h3><p className="text-sm text-base-content/70">We process data based on contract, legitimate interests, or consent</p></div>
                                    <div className="p-4 bg-base-200 rounded"><h3 className="font-bold">Data Protection Officer</h3><p className="text-sm text-base-content/70">Contact our DPO at <a href="mailto:dpo@splits.network" className="link link-primary">dpo@splits.network</a></p></div>
                                    <div className="p-4 bg-base-200 rounded"><h3 className="font-bold">Supervisory Authority</h3><p className="text-sm text-base-content/70">Right to lodge complaints with your data protection authority</p></div>
                                    <div className="p-4 bg-base-200 rounded"><h3 className="font-bold">Automated Decision-Making</h3><p className="text-sm text-base-content/70">Right to object to automated decision-making</p></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Changes */}
                    <section id="changes" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">14. Changes to This Policy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">We may update this Privacy Policy periodically:</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>We'll post the updated policy with a new "Last Updated" date</span></li>
                                    <li className="flex items-start gap-3"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>We'll notify you via email if changes are material</span></li>
                                    <li className="flex items-start gap-3"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>We provide 30 days notice before significant changes</span></li>
                                    <li className="flex items-start gap-3"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>We maintain previous versions for reference</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">15. Contact Information</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Privacy Questions</h3>
                                    </div>
                                    <p><a href="mailto:privacy@splits.network" className="link link-primary font-semibold">privacy@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 5 business days</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-shield-check text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Data Protection Officer</h3>
                                    </div>
                                    <p><a href="mailto:dpo@splits.network" className="link link-primary font-semibold">dpo@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 30 days (GDPR)</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <h3 className="card-title mb-4">Mailing Address</h3>
                                <address className="not-italic space-y-1">
                                    <div>Employment Networks, Inc.</div>
                                    <div>Attention: Privacy Team</div>
                                    <div>[Company Address]</div>
                                    <div>[City, State ZIP Code]</div>
                                </address>
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
                                <a href="/public/terms-of-service" className="link link-primary">Terms of Service</a>
                                <a href="/public/cookie-policy" className="link link-primary">Cookie Policy</a>
                                <a href="/" className="link link-primary">Back to Home</a>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}