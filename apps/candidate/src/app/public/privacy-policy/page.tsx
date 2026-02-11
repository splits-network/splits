import { Metadata } from 'next';
import Link from 'next/link';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Privacy Policy | Applicant Network',
    description: 'Learn how Applicant Network collects, uses, and protects your personal information. GDPR and CCPA compliant.',
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
                            How we collect, use, and protect your information
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
                                <li><a href="#how-we-use" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>How We Use Information</a></li>
                                <li><a href="#information-sharing" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Information Sharing</a></li>
                                <li><a href="#data-security" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Data Security</a></li>
                                <li><a href="#data-retention" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Data Retention</a></li>
                                <li><a href="#your-rights" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Your Privacy Rights</a></li>
                                <li><a href="#cookies" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Cookies & Tracking</a></li>
                                <li><a href="#third-party" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Third-Party Services</a></li>
                                <li><a href="#international" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>International Transfers</a></li>
                                <li><a href="#children" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Children's Privacy</a></li>
                                <li><a href="#california" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>California Rights</a></li>
                                <li><a href="#gdpr" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>GDPR Rights</a></li>
                                <li><a href="#changes" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Changes to Policy</a></li>
                                <li><a href="#contact" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* 1. Overview */}
                    <section id="overview" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-eye text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">1. Overview</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    At Splits Network, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>We use your data to provide and improve our service</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>We never sell your personal information</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>We comply with GDPR and CCPA regulations</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>You have control over your data</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. Information We Collect */}
                    <section id="information-we-collect" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-database text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">2. Information We Collect</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-user text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Information You Provide</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Name and email</li>
                                        <li>• Phone number</li>
                                        <li>• Resume/CV</li>
                                        <li>• Profile information</li>
                                        <li>• Work history</li>
                                        <li>• Skills & expertise</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-robot text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Automatically Collected</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>• IP address</li>
                                        <li>• Browser type</li>
                                        <li>• Device information</li>
                                        <li>• Page visits</li>
                                        <li>• Click behavior</li>
                                        <li>• Session duration</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-handshake text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Third-Party Sources</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Clerk auth data</li>
                                        <li>• Social profiles</li>
                                        <li>• Payment info</li>
                                        <li>• LinkedIn data</li>
                                        <li>• Reference checks</li>
                                        <li>• Background info</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. How We Use Information */}
                    <section id="how-we-use" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gear text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">3. How We Use Information</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-briefcase text-primary mr-2"></i>Service Delivery</h3>
                                    <p className="text-sm">Provide platform access, process applications, manage placements, and deliver recruiting services.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-chart-line text-primary mr-2"></i>Analytics</h3>
                                    <p className="text-sm">Understand how candidates use our platform to improve features, user experience, and matching algorithms.</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-envelope text-primary mr-2"></i>Communications</h3>
                                    <p className="text-sm">Send transactional emails, job updates, recruiter messages, and platform notifications.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Information Sharing */}
                    <section id="information-sharing" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">4. Information Sharing</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">Service Providers & Partners</h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="badge badge-primary">Recruiters</span>
                                        <span className="badge badge-primary">Companies</span>
                                        <span className="badge badge-primary">Administrators</span>
                                    </div>
                                    <p className="text-sm">We share your profile and application information with recruiters and companies involved in recruitment processes. Your resume and qualifications are core to our service.</p>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-circle-info"></i>
                                <div>
                                    <h3 className="font-bold">Legal Requirements</h3>
                                    <p className="text-sm">We may disclose information when required by law, to enforce agreements, or protect rights and safety.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Data Security */}
                    <section id="data-security" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-calendar text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">5. Data Security</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">We implement comprehensive security measures to protect your data:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-lock text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">Encryption</strong><p className="text-xs text-base-content/70">TLS/SSL encryption in transit</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-user-secret text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">Access Control</strong><p className="text-xs text-base-content/70">Role-based permission system</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-shield-check text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">Infrastructure</strong><p className="text-xs text-base-content/70">Secure cloud hosting (Supabase)</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-credit-card text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">PCI DSS</strong><p className="text-xs text-base-content/70">Payment card compliance</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-eye text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">Monitoring</strong><p className="text-xs text-base-content/70">24/7 security monitoring</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                        <i className="fa-duotone fa-regular fa-arrows-rotate text-primary flex-shrink-0 text-xl mt-1"></i>
                                        <div><strong className="text-sm">Updates</strong><p className="text-xs text-base-content/70">Regular security patches</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 6. Data Retention */}
                    <section id="data-retention" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-calendar text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">6. Data Retention</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary badge-lg flex-shrink-0">1</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-user text-primary mr-2"></i>Active Account</h3>
                                            <p className="text-sm text-base-content/80">Data retained while your account is active and for service delivery purposes, including job matching and application tracking.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary badge-lg flex-shrink-0">2</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-trash text-primary mr-2"></i>Account Deletion</h3>
                                            <p className="text-sm text-base-content/80">Upon your request, we delete personal data within 30 days. Some data may be retained for legal compliance, including backups and audit logs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary badge-lg flex-shrink-0">3</div>
                                        <div>
                                            <h3 className="card-title text-lg mb-2"><i className="fa-duotone fa-regular fa-scale-balanced text-primary mr-2"></i>Legal Hold</h3>
                                            <p className="text-sm text-base-content/80">Certain data retained for legal, tax, or regulatory requirements. This may extend retention for up to 7 years as required by applicable law.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. Your Privacy Rights */}
                    <section id="your-rights" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-hand-raised text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">7. Your Privacy Rights</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-download text-primary mr-2"></i>Access</h3>
                                    <p className="text-sm">Request a copy of your personal data we hold.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-pen text-primary mr-2"></i>Correction</h3>
                                    <p className="text-sm">Update or correct inaccurate information.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-trash text-primary mr-2"></i>Deletion</h3>
                                    <p className="text-sm">Request deletion of your personal data.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-ban text-primary mr-2"></i>Objection</h3>
                                    <p className="text-sm">Object to processing of your data.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-file-export text-primary mr-2"></i>Portability</h3>
                                    <p className="text-sm">Receive your data in machine-readable format.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-circle-xmark text-primary mr-2"></i>Withdraw Consent</h3>
                                    <p className="text-sm">Withdraw consent for data processing.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 8. Cookies & Tracking */}
                    <section id="cookies" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-cookie text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">8. Cookies & Tracking</h2>
                        </div>
                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-circle-info"></i>
                            <div>
                                <h3 className="font-bold">Cookie Management</h3>
                                <p className="text-sm">We use cookies to enhance your experience. Learn more about our cookie practices in our <Link href="/public/cookie-policy" className="link link-primary underline">Cookie Policy</Link>.</p>
                            </div>
                        </div>
                    </section>

                    {/* 9. Third-Party Services */}
                    <section id="third-party" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-link text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">9. Third-Party Services</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fa-duotone fa-regular fa-lock-open text-primary text-lg"></i>
                                        <h3 className="card-title text-lg">Clerk</h3>
                                    </div>
                                    <p className="text-sm text-base-content/70">Authentication and user identity management</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fa-duotone fa-regular fa-credit-card text-primary text-lg"></i>
                                        <h3 className="card-title text-lg">Stripe</h3>
                                    </div>
                                    <p className="text-sm text-base-content/70">Payment processing and fraud prevention</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fa-duotone fa-regular fa-database text-primary text-lg"></i>
                                        <h3 className="card-title text-lg">Supabase</h3>
                                    </div>
                                    <p className="text-sm text-base-content/70">Database and file storage infrastructure</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fa-duotone fa-regular fa-linkedin text-primary text-lg"></i>
                                        <h3 className="card-title text-lg">LinkedIn</h3>
                                    </div>
                                    <p className="text-sm text-base-content/70">Professional profile integration (optional)</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 10. International Transfers */}
                    <section id="international" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-earth-americas text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">10. International Transfers</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">Your information may be transferred to, stored in, and processed in countries other than your country of residence.</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>We implement Standard Contractual Clauses (SCCs) for international transfers</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>Compliant with GDPR Chapter 5 requirements</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>Data centers are in secure, compliant locations</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 11. Children's Privacy */}
                    <section id="children" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-child text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">11. Children's Privacy</h2>
                        </div>
                        <div className="alert alert-warning">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <div>
                                <h3 className="font-bold">Age Requirement</h3>
                                <p className="text-sm">Splits Network is not intended for children under 18. We do not knowingly collect information from anyone under 18. If we become aware of such collection, we will delete the information immediately.</p>
                            </div>
                        </div>
                    </section>

                    {/* 12. California Rights */}
                    <section id="california" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-scroll text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">12. California Consumer Rights (CCPA)</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">California residents have specific privacy rights under CCPA:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">1</span>
                                        <div>
                                            <strong className="text-sm">Right to Know</strong>
                                            <p className="text-xs text-base-content/70">Request what personal information we collect, use, and share</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">2</span>
                                        <div>
                                            <strong className="text-sm">Right to Delete</strong>
                                            <p className="text-xs text-base-content/70">Request deletion of your personal information</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">3</span>
                                        <div>
                                            <strong className="text-sm">Right to Opt-Out</strong>
                                            <p className="text-xs text-base-content/70">Opt-out of the sale or sharing of your personal information</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">4</span>
                                        <div>
                                            <strong className="text-sm">Right to Correct</strong>
                                            <p className="text-xs text-base-content/70">Request correction of inaccurate personal information</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">5</span>
                                        <div>
                                            <strong className="text-sm">Right to Limit Use</strong>
                                            <p className="text-xs text-base-content/70">Limit use of sensitive personal information</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="badge badge-primary flex-shrink-0">6</span>
                                        <div>
                                            <strong className="text-sm">Non-Discrimination</strong>
                                            <p className="text-xs text-base-content/70">We don't discriminate based on exercise of your rights</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 13. GDPR Rights */}
                    <section id="gdpr" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-euro-sign text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">13. GDPR Rights (EU/UK)</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-lock text-primary mr-2"></i>Legal Basis</h3>
                                    <p className="text-sm">We process your data based on your consent, contractual necessity, legal obligations, and legitimate interests.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-person text-primary mr-2"></i>Data Protection Officer</h3>
                                    <p className="text-sm">Contact our DPO at <a href="mailto:dpo@splits.network" className="link link-primary">dpo@splits.network</a> for GDPR inquiries.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-scale-balanced text-primary mr-2"></i>Rights Overview</h3>
                                    <p className="text-sm">You have rights to access, rectify, erase, restrict, and port your data under GDPR Article 15-22.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-file-check text-primary mr-2"></i>Automated Decisions</h3>
                                    <p className="text-sm">You can request human review of decisions made solely by automated processes.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 14. Changes to Policy */}
                    <section id="changes" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">14. Changes to This Privacy Policy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">We may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other factors.</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>We will notify you of material changes via email or platform notice</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>Your continued use indicates acceptance of updated terms</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-check text-success mt-1"></i><span>Check the "Last Updated" date for the current version</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 15. Contact Information */}
                    <section id="contact" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">15. Contact Us</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Privacy Team</h3>
                                    </div>
                                    <p><a href="mailto:privacy@splits.network" className="link link-primary font-semibold">privacy@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 5 business days</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-location-dot text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Mailing Address</h3>
                                    </div>
                                    <p className="text-sm">Splits Network, Inc.<br/>Privacy Department<br/>San Francisco, CA 94102, USA</p>
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