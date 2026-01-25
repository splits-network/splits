import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | Employment Networks',
    description: 'Legal terms and conditions for using Employment Networks platforms and services.',
};

export default function TermsOfServicePage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-secondary text-secondary-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-lg opacity-90">Legal terms and conditions for using our platforms</p>
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
                                <i className="fa-duotone fa-regular fa-list text-secondary text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#acceptance" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Acceptance</a></li>
                                <li><a href="#platforms" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Our Platforms</a></li>
                                <li><a href="#eligibility" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Eligibility</a></li>
                                <li><a href="#accounts" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Accounts</a></li>
                                <li><a href="#conduct" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>User Conduct</a></li>
                                <li><a href="#ip-rights" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>IP Rights</a></li>
                                <li><a href="#disclaimers" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Disclaimers</a></li>
                                <li><a href="#contact" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Acceptance of Terms */}
                    <section id="acceptance" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">1. Acceptance of Terms</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    By accessing and using Employment Networks platforms (Splits, Applicant, or any related services), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platforms.
                                </p>
                                <div className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                                    <div>
                                        <h3 className="font-bold">Binding Agreement</h3>
                                        <p className="text-sm">These terms constitute a legally binding agreement between you and Employment Networks, Inc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Platforms */}
                    <section id="platforms" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-laptop text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">2. Our Platforms</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-network-wired text-secondary mr-2"></i>Splits Network</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Collaborative recruiting</li>
                                        <li>✓ Fee sharing marketplace</li>
                                        <li>✓ ATS and job management</li>
                                        <li>✓ Placement tracking</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-briefcase text-secondary mr-2"></i>Applicant Network</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Candidate job search</li>
                                        <li>✓ Application management</li>
                                        <li>✓ Profile building</li>
                                        <li>✓ Opportunity tracking</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility */}
                    <section id="eligibility" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-id-badge text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">3. Eligibility</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="badge badge-secondary badge-lg">1</div> <span className="text-sm">You must be at least 18 years old</span><br/>
                            <div className="badge badge-secondary badge-lg">2</div> <span className="text-sm">You must have legal authority to enter into these terms</span><br/>
                            <div className="badge badge-secondary badge-lg">3</div> <span className="text-sm">You cannot violate any applicable laws or regulations</span><br/>
                            <div className="badge badge-secondary badge-lg">4</div> <span className="text-sm">You may maintain only one account per person/entity</span>
                        </div>
                    </section>

                    {/* Accounts */}
                    <section id="accounts" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-user-circle text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">4. Accounts & Registration</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-3">Accurate Information</h3>
                                    <p className="text-sm">You agree to provide accurate, current, and complete information during registration and keep it updated.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-3">Account Security</h3>
                                    <p className="text-sm">You are responsible for maintaining the confidentiality of your password and account credentials.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-3">Verification</h3>
                                    <p className="text-sm">We may require identity verification or background checks to use certain platform features.</p>
                                </div>
                            </div>
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">Keep Your Password Secure</h3>
                                    <p className="text-sm">Never share your password. You are liable for all activity on your account.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section id="conduct" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield-halved text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">5. User Conduct</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Harassment</strong><p className="text-xs text-base-content/70">Harassment, bullying, or abusive behavior is prohibited</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Fraud</strong><p className="text-xs text-base-content/70">Fraudulent activity or misrepresentation is forbidden</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Spam</strong><p className="text-xs text-base-content/70">Unsolicited communications or spam are not allowed</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Discrimination</strong><p className="text-xs text-base-content/70">Discriminatory conduct violates our policies</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Illegal Activity</strong><p className="text-xs text-base-content/70">All activity must comply with applicable laws</p></div>
                            </div>
                            <div className="p-4 bg-base-200 rounded flex gap-3">
                                <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">No Automation Abuse</strong><p className="text-xs text-base-content/70">Unauthorized bots or automated access is prohibited</p></div>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section id="ip-rights" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-copyright text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">6. Intellectual Property Rights</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-3">Platform Ownership</h3>
                                    <p className="text-sm">Employment Networks retains all rights to the platforms, including design, code, content, and trademarks. You receive a limited license to use the platforms for personal or business purposes.</p>
                                </div>
                            </div>
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-3">Your Content</h3>
                                    <p className="text-sm">You retain ownership of content you upload (resumes, job descriptions, etc.), but grant us a license to use it to provide services.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Privacy */}
                    <section id="privacy" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">7. Privacy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">Your use of our platforms is also governed by our <a href="/privacy-policy" className="link link-secondary font-semibold">Privacy Policy</a>, which describes how we collect, use, and protect your personal data.</p>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimers */}
                    <section id="disclaimers" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield-exclamation text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">8. Disclaimers</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">As-Is Service</h3>
                                    <p className="text-sm">Platforms are provided "as-is" without warranties of any kind, express or implied.</p>
                                </div>
                            </div>
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">User Content</h3>
                                    <p className="text-sm">You are responsible for the accuracy and legality of content you post.</p>
                                </div>
                            </div>
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">No Guarantees</h3>
                                    <p className="text-sm">We do not guarantee uninterrupted service, job placement, or hiring outcomes.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contact" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">Questions About These Terms?</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-gavel text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Legal Team</h3>
                                    </div>
                                    <p><a href="mailto:legal@employment-networks.com" className="link link-secondary font-semibold">legal@employment-networks.com</a></p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-headset text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">Support</h3>
                                    </div>
                                    <p><a href="mailto:support@employment-networks.com" className="link link-secondary font-semibold">support@employment-networks.com</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}
