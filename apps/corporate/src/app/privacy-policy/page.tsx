import { Metadata } from 'next';
import Link from 'next/link';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Privacy Policy | Employment Networks',
    description: 'Learn how Employment Networks protects your privacy and handles your personal data in compliance with GDPR and CCPA.',
    ...buildCanonical("/privacy-policy"),
};

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-primary text-primary-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg opacity-90">How we protect and respect your personal data</p>
                        <p className="text-sm opacity-75 mt-4">Last updated: {lastUpdated}</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Quick Navigation Card */}
                    <div className="card bg-base-200 shadow-lg mb-12">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <i className="fa-duotone fa-regular fa-list text-primary text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#overview" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Overview</a></li>
                                <li><a href="#information-collection" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Information Collection</a></li>
                                <li><a href="#how-we-use" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>How We Use</a></li>
                                <li><a href="#information-sharing" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Information Sharing</a></li>
                                <li><a href="#data-security" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Data Security</a></li>
                                <li><a href="#your-rights" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Your Rights</a></li>
                                <li><a href="#third-party" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Third-Party Services</a></li>
                                <li><a href="#contact" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-primary text-sm"></i>Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Overview */}
                    <section id="overview" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-eye text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Overview</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    Employment Networks ("we", "us", "our") operates the Splits and Applicant platforms. We're committed to protecting your privacy and ensuring transparent handling of your personal data.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-primary flex-shrink-0 mt-1"></i><span>Your data is treated with utmost care and respect</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-primary flex-shrink-0 mt-1"></i><span>We comply with GDPR, CCPA, and other privacy regulations</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-primary flex-shrink-0 mt-1"></i><span>You have full control over your personal information</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Information Collection */}
                    <section id="information-collection" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-database text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Information We Collect</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-user-pen text-primary mr-2"></i>You Provide</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Contact information</li>
                                        <li>✓ Account details</li>
                                        <li>✓ Communications</li>
                                        <li>✓ Business information</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-computer text-primary mr-2"></i>Automatically</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ IP address</li>
                                        <li>✓ Browser type</li>
                                        <li>✓ Device info</li>
                                        <li>✓ Usage analytics</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-share-nodes text-primary mr-2"></i>Third Parties</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Service providers</li>
                                        <li>✓ Analytics partners</li>
                                        <li>✓ Payment processors</li>
                                        <li>✓ Auth platforms</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use */}
                    <section id="how-we-use" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gear text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">How We Use Your Information</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-cube text-primary mr-2"></i>Service Delivery</h3>
                                    <p className="text-sm">Provide and improve our platforms</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-chart-line text-primary mr-2"></i>Analytics</h3>
                                    <p className="text-sm">Understand usage and optimize</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-envelope text-primary mr-2"></i>Communications</h3>
                                    <p className="text-sm">Send updates and notifications</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section id="information-sharing" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-share-nodes text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Information Sharing</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">We share information only when necessary:</p>
                                <div className="space-y-3 mb-6">
                                    <div><span className="badge badge-primary">Service Providers</span> - Tools and services to operate our platforms</div>
                                    <div><span className="badge badge-primary">Legal Requirements</span> - When required by law or legal process</div>
                                    <div><span className="badge badge-primary">Platform Partners</span> - Integrated services for better functionality</div>
                                </div>
                                <div className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                                    <div>
                                        <h3 className="font-bold">We never sell your data</h3>
                                        <p className="text-sm">Your information is never sold to third parties for marketing purposes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section id="data-security" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield-check text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Data Security</h2>
                        </div>
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
                                <i className="fa-duotone fa-regular fa-building text-primary flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Infrastructure</strong><p className="text-xs text-base-content/70">Secure cloud hosting</p></div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                                <i className="fa-duotone fa-regular fa-eye text-primary flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Monitoring</strong><p className="text-xs text-base-content/70">24/7 security monitoring</p></div>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section id="your-rights" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-hand-raised text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Your Privacy Rights</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-download text-primary mr-2"></i>Access</h3>
                                    <p className="text-sm">Request a copy of your personal data</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-pen text-primary mr-2"></i>Correction</h3>
                                    <p className="text-sm">Update inaccurate information</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-trash text-primary mr-2"></i>Deletion</h3>
                                    <p className="text-sm">Request deletion of your data</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-ban text-primary mr-2"></i>Objection</h3>
                                    <p className="text-sm">Object to data processing</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section id="third-party" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-network-wired text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Third-Party Services</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/20"><i className="fa-duotone fa-regular fa-lock text-primary"></i></div>
                                <div>
                                    <strong className="text-sm">Clerk</strong>
                                    <p className="text-xs text-base-content/70">Authentication and user management</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/20"><i className="fa-duotone fa-regular fa-database text-primary"></i></div>
                                <div>
                                    <strong className="text-sm">Supabase</strong>
                                    <p className="text-xs text-base-content/70">Database and infrastructure</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/20"><i className="fa-duotone fa-regular fa-chart-line text-primary"></i></div>
                                <div>
                                    <strong className="text-sm">Google Analytics</strong>
                                    <p className="text-xs text-base-content/70">Website analytics</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contact" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-primary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Questions About Privacy?</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Privacy Team</h3>
                                    </div>
                                    <p><a href="mailto:privacy@employment-networks.com" className="link link-primary font-semibold">privacy@employment-networks.com</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 5 business days</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-map-pin text-primary text-xl"></i>
                                        <h3 className="card-title text-lg">Mailing Address</h3>
                                    </div>
                                    <p className="text-sm">Employment Networks, Inc.<br/>Wilmington, Delaware 19801<br/>USA</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}