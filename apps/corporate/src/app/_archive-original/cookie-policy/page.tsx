import { Metadata } from 'next';
import Link from 'next/link';
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: 'Cookie Policy | Employment Networks',
    description: 'Information about cookies and tracking technologies used on Employment Networks platforms.',
    ...buildCanonical("/cookie-policy"),
};

export default function CookiePolicyPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-accent text-accent-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">Cookie Policy</h1>
                        <p className="text-lg opacity-90">How we use cookies and similar technologies</p>
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
                                <i className="fa-duotone fa-regular fa-list text-accent text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#what-are-cookies" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>What Are Cookies</a></li>
                                <li><a href="#how-we-use" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>How We Use</a></li>
                                <li><a href="#types" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Types of Cookies</a></li>
                                <li><a href="#third-party" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Third-Party Cookies</a></li>
                                <li><a href="#management" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Management</a></li>
                                <li><a href="#dnt" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Do Not Track</a></li>
                                <li><a href="#consent" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Consent</a></li>
                                <li><a href="#updates" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Updates</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* What Are Cookies */}
                    <section id="what-are-cookies" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-cookie text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">What Are Cookies?</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow mb-6">
                            <div className="card-body">
                                <p className="mb-4">
                                    Cookies are small text files stored on your device when you visit our websites. They help us recognize you, remember your preferences, and improve your experience.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-base-200 rounded">
                                <i className="fa-duotone fa-regular fa-signal text-accent flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Web Beacons</strong><p className="text-xs text-base-content/70">Small transparent images that track page views</p></div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-base-200 rounded">
                                <i className="fa-duotone fa-regular fa-hard-drive text-accent flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Local Storage</strong><p className="text-xs text-base-content/70">Browser storage for persistent data</p></div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-base-200 rounded">
                                <i className="fa-duotone fa-regular fa-timer text-accent flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Session Storage</strong><p className="text-xs text-base-content/70">Temporary data during your session</p></div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-base-200 rounded">
                                <i className="fa-duotone fa-regular fa-fingerprint text-accent flex-shrink-0 text-xl mt-1"></i>
                                <div><strong className="text-sm">Fingerprinting</strong><p className="text-xs text-base-content/70">Device characteristics for analytics</p></div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Cookies */}
                    <section id="how-we-use" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gear text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">How We Use Cookies</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-lock text-accent mr-2"></i>Essential</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Authentication</li>
                                        <li>✓ Security</li>
                                        <li>✓ Session data</li>
                                        <li>✓ Preferences</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-chart-line text-accent mr-2"></i>Analytics</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Usage patterns</li>
                                        <li>✓ Performance</li>
                                        <li>✓ User behavior</li>
                                        <li>✓ Traffic sources</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-3"><i className="fa-duotone fa-regular fa-wand-magic-sparkles text-accent mr-2"></i>Personalization</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Language settings</li>
                                        <li>✓ Theme choice</li>
                                        <li>✓ Content filters</li>
                                        <li>✓ Recommendations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Types of Cookies */}
                    <section id="types" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-layer-group text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Types of Cookies We Use</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Essential Cookies */}
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-circle-check text-accent mr-2"></i>Essential Cookies</h3>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Expiration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="font-mono text-xs">session_id</td>
                                                    <td>Session management</td>
                                                    <td>Session end</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">auth_token</td>
                                                    <td>Authentication</td>
                                                    <td>30 days</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">csrf_token</td>
                                                    <td>CSRF protection</td>
                                                    <td>Session end</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">user_prefs</td>
                                                    <td>User preferences</td>
                                                    <td>1 year</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-chart-bar text-accent mr-2"></i>Analytics Cookies</h3>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Expiration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="font-mono text-xs">_ga</td>
                                                    <td>Google Analytics ID</td>
                                                    <td>2 years</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">_gid</td>
                                                    <td>Session analytics</td>
                                                    <td>24 hours</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">usage_stats</td>
                                                    <td>Usage tracking</td>
                                                    <td>30 days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Personalization Cookies */}
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4"><i className="fa-duotone fa-regular fa-sliders text-accent mr-2"></i>Personalization Cookies</h3>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Expiration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="font-mono text-xs">language</td>
                                                    <td>Language preference</td>
                                                    <td>1 year</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">theme</td>
                                                    <td>Theme selection</td>
                                                    <td>1 year</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">filters</td>
                                                    <td>Content filters</td>
                                                    <td>30 days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Cookies */}
                    <section id="third-party" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-people-group text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Third-Party Cookies</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-accent/20"><i className="fa-duotone fa-regular fa-chart-line text-accent"></i></div>
                                <div>
                                    <strong className="text-sm">Google Analytics</strong>
                                    <p className="text-xs text-base-content/70">Traffic analysis and behavior tracking. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="link link-accent">Privacy Policy</a></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-accent/20"><i className="fa-duotone fa-regular fa-lock text-accent"></i></div>
                                <div>
                                    <strong className="text-sm">Clerk Authentication</strong>
                                    <p className="text-xs text-base-content/70">User identity and authentication. <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="link link-accent">Privacy Policy</a></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                <div className="w-10 h-10 rounded flex items-center justify-center bg-accent/20"><i className="fa-duotone fa-regular fa-credit-card text-accent"></i></div>
                                <div>
                                    <strong className="text-sm">Stripe</strong>
                                    <p className="text-xs text-base-content/70">Payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="link link-accent">Privacy Policy</a></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cookie Management */}
                    <section id="management" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-sliders text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">How to Manage Cookies</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow mb-6">
                            <div className="card-body">
                                <p className="mb-4">You can control cookies through your browser settings. Click on your browser below for instructions:</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                <i className="fa-duotone fa-regular fa-browser"></i> Chrome Settings
                            </a>
                            <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                <i className="fa-duotone fa-regular fa-browser"></i> Firefox Settings
                            </a>
                            <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                <i className="fa-duotone fa-regular fa-browser"></i> Safari Settings
                            </a>
                            <a href="https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                <i className="fa-duotone fa-regular fa-browser"></i> Edge Settings
                            </a>
                        </div>
                    </section>

                    {/* Consent */}
                    <section id="consent" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Consent & Cookie Banner</h2>
                        </div>
                        <div className="alert alert-success">
                            <i className="fa-duotone fa-regular fa-circle-check"></i>
                            <div>
                                <h3 className="font-bold">Your Consent Matters</h3>
                                <p className="text-sm">When you first visit our site, we ask for your consent before setting non-essential cookies. You can change your preferences anytime.</p>
                            </div>
                        </div>
                    </section>

                    {/* Do Not Track */}
                    <section id="dnt" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-eye-slash text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Do Not Track (DNT)</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    Many browsers allow you to signal a "Do Not Track" (DNT) preference. Currently, we do not respond to DNT signals as there is no industry standard. However, you can still control cookies through your browser settings.
                                </p>
                                <p>
                                    For more information about DNT, visit <a href="https://allaboutdnt.com" target="_blank" rel="noopener noreferrer" className="link link-accent">allaboutdnt.com</a>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Updates */}
                    <section id="updates" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Updates to This Policy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-accent badge-lg flex-shrink-0">1</div>
                                        <div>
                                            <strong className="text-sm">We May Update</strong>
                                            <p className="text-xs text-base-content/70">We review and update this policy regularly to reflect new technologies and regulations</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-accent badge-lg flex-shrink-0">2</div>
                                        <div>
                                            <strong className="text-sm">Check Back Often</strong>
                                            <p className="text-xs text-base-content/70">Significant changes will be announced on our website</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="badge badge-accent badge-lg flex-shrink-0">3</div>
                                        <div>
                                            <strong className="text-sm">Your Consent</strong>
                                            <p className="text-xs text-base-content/70">Continued use means acceptance of any policy changes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Questions About Cookies?</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                            <div className="card-body">
                                <div className="flex items-center gap-2 mb-4">
                                    <i className="fa-duotone fa-regular fa-envelope text-accent text-xl"></i>
                                    <h3 className="card-title text-lg">Contact Us</h3>
                                </div>
                                <p>Email us at <a href="mailto:privacy@employment-networks.com" className="link link-accent font-semibold">privacy@employment-networks.com</a></p>
                                <p className="text-sm text-base-content/70 mt-2">We typically respond within 5 business days</p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}