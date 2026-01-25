import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Cookie Policy | Splits Network',
    description: 'Learn about how Splits Network uses cookies and similar tracking technologies to improve your experience and analyze platform usage.',
};

export default function CookiePolicyPage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-accent text-accent-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">
                            Cookie Policy
                        </h1>
                        <p className="text-lg opacity-90">
                            How we use cookies and tracking technologies
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
                                <i className="fa-duotone fa-regular fa-list text-accent text-2xl"></i>
                                <h2 className="card-title text-2xl">Quick Navigation</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li><a href="#what-are" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>What Are Cookies?</a></li>
                                <li><a href="#how-we-use" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>How We Use Cookies</a></li>
                                <li><a href="#types" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Types of Cookies</a></li>
                                <li><a href="#third-party" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Third-Party Cookies</a></li>
                                <li><a href="#management" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Cookie Management</a></li>
                                <li><a href="#consent" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Your Consent</a></li>
                                <li><a href="#tracking" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Do Not Track</a></li>
                                <li><a href="#updates" className="link link-hover flex items-center gap-2"><i className="fa-duotone fa-regular fa-chevron-right text-accent text-sm"></i>Updates</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* What Are Cookies */}
                    <section id="what-are" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-cookie text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">1. What Are Cookies?</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <p className="mb-4">
                                        Cookies are small text files placed on your device when you visit websites. They store information about your preferences, settings, and activity to enhance your experience.
                                    </p>
                                    <div className="divider my-0"></div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4"><i className="fa-duotone fa-regular fa-fingerprint text-accent mr-2"></i>Similar Technologies</h3>
                                    <p className="mb-4 text-sm">In addition to cookies, we may use:</p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <i className="fa-duotone fa-regular fa-circle-dot text-accent flex-shrink-0 text-sm mt-1"></i>
                                            <div><strong className="text-sm">Web Beacons</strong><p className="text-xs text-base-content/70">Track page visits</p></div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <i className="fa-duotone fa-regular fa-circle-dot text-accent flex-shrink-0 text-sm mt-1"></i>
                                            <div><strong className="text-sm">Local Storage</strong><p className="text-xs text-base-content/70">Store data client-side</p></div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <i className="fa-duotone fa-regular fa-circle-dot text-accent flex-shrink-0 text-sm mt-1"></i>
                                            <div><strong className="text-sm">Session Storage</strong><p className="text-xs text-base-content/70">Temporary session data</p></div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                            <i className="fa-duotone fa-regular fa-circle-dot text-accent flex-shrink-0 text-sm mt-1"></i>
                                            <div><strong className="text-sm">Fingerprinting</strong><p className="text-xs text-base-content/70">Device identification</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Cookies */}
                    <section id="how-we-use" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gear text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">2. How We Use Cookies</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-cube text-accent text-2xl"></i>
                                        <h3 className="card-title text-lg">Essential</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Login & sessions</li>
                                        <li>✓ Security tokens</li>
                                        <li>✓ CSRF protection</li>
                                        <li>✓ Preferences</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-chart-line text-accent text-2xl"></i>
                                        <h3 className="card-title text-lg">Analytics</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Page visits</li>
                                        <li>✓ User behavior</li>
                                        <li>✓ Performance data</li>
                                        <li>✓ Feature usage</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-sliders text-accent text-2xl"></i>
                                        <h3 className="card-title text-lg">Personalization</h3>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li>✓ Saved preferences</li>
                                        <li>✓ Language settings</li>
                                        <li>✓ Theme selection</li>
                                        <li>✓ Content customization</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Types of Cookies */}
                    <section id="types" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-list-check text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">3. Types of Cookies We Use</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4"><span className="badge badge-accent">Essential</span></h3>
                                    <p className="text-sm mb-4">Required for basic platform functionality. Cannot be disabled.</p>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">session_id</td>
                                                    <td>Maintains user session</td>
                                                    <td>Until logout</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">auth_token</td>
                                                    <td>Authentication token</td>
                                                    <td>24 hours</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">csrf_token</td>
                                                    <td>CSRF protection</td>
                                                    <td>Session</td>
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

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4"><span className="badge badge-info">Analytics</span></h3>
                                    <p className="text-sm mb-4">Help us understand how you use the platform.</p>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">_ga</td>
                                                    <td>Google Analytics ID</td>
                                                    <td>2 years</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">_gid</td>
                                                    <td>Google Analytics session</td>
                                                    <td>24 hours</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">usage_stats</td>
                                                    <td>Feature usage tracking</td>
                                                    <td>90 days</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4"><span className="badge badge-warning">Marketing</span></h3>
                                    <p className="text-sm mb-4">Used only with your consent. Can be disabled.</p>
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th>Cookie Name</th>
                                                    <th>Purpose</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="font-mono text-xs">utm_source</td>
                                                    <td>Campaign tracking</td>
                                                    <td>Session</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono text-xs">marketing_id</td>
                                                    <td>Marketing attribution</td>
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
                            <i className="fa-duotone fa-regular fa-share-nodes text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">4. Third-Party Cookies</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6">Third-party services set cookies to enhance platform functionality:</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                        <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/20"><i className="fa-duotone fa-regular fa-chart-line text-primary"></i></div>
                                        <div>
                                            <strong className="text-sm">Google Analytics</strong>
                                            <p className="text-xs text-base-content/70">Website analytics & visitor tracking</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                        <div className="w-10 h-10 rounded flex items-center justify-center bg-secondary/20"><i className="fa-duotone fa-regular fa-credit-card text-secondary"></i></div>
                                        <div>
                                            <strong className="text-sm">Stripe</strong>
                                            <p className="text-xs text-base-content/70">Payment processing & fraud prevention</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-base-200 rounded">
                                        <div className="w-10 h-10 rounded flex items-center justify-center bg-accent/20"><i className="fa-duotone fa-regular fa-user text-accent"></i></div>
                                        <div>
                                            <strong className="text-sm">Clerk</strong>
                                            <p className="text-xs text-base-content/70">Authentication & identity management</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cookie Management */}
                    <section id="management" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-sliders text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">5. How to Manage Cookies</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4"><i className="fa-duotone fa-regular fa-globe text-accent mr-2"></i>Browser Settings</h3>
                                    <p className="text-sm mb-4">Most browsers allow you to control cookies:</p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                            <i className="fa-duotone fa-regular fa-link"></i>Chrome
                                        </a>
                                        <a href="https://support.mozilla.org/en-US/kb/cookies" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                            <i className="fa-duotone fa-regular fa-link"></i>Firefox
                                        </a>
                                        <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                            <i className="fa-duotone fa-regular fa-link"></i>Safari
                                        </a>
                                        <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-bda6aba4-d4ef-4ce9-a4d4-130180968852" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                            <i className="fa-duotone fa-regular fa-link"></i>Edge
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4"><i className="fa-duotone fa-regular fa-cog text-accent mr-2"></i>Cookie Preferences</h3>
                                    <p className="text-sm">You can adjust cookie preferences in your account settings or through our cookie consent banner when you first visit.</p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">Note</h3>
                                    <p className="text-sm">Disabling essential cookies may prevent the platform from functioning properly.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Your Consent */}
                    <section id="consent" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-check-circle text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">6. Your Consent</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <p className="text-sm mb-4">
                                        By using Splits Network, you consent to our use of cookies as described in this policy. You can always change your preferences or delete cookies through your browser settings.
                                    </p>
                                    <div className="bg-success/10 border border-success/30 rounded p-4">
                                        <div className="flex gap-3">
                                            <i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i>
                                            <div>
                                                <strong className="text-sm">Consent Banner</strong>
                                                <p className="text-xs text-base-content/70 mt-1">You'll see a cookie consent banner on first visit. Accept or customize your preferences.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Do Not Track */}
                    <section id="tracking" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-ban text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">7. Do Not Track (DNT)</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm mb-4">
                                    Some browsers include a "Do Not Track" (DNT) feature. Currently, web standards don't require websites to honor DNT signals. However, we respect user privacy choices.
                                </p>
                                <p className="text-sm">
                                    If you have DNT enabled and want us to respect it, please contact <a href="mailto:privacy@splits.network" className="link link-accent">privacy@splits.network</a> to discuss your preferences.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Updates */}
                    <section id="updates" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">8. Updates to This Policy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">We may update this Cookie Policy as our use of cookies changes or for other operational, legal, or regulatory reasons.</p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>Updated policy will be posted with a new "Last Updated" date</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>We'll notify you of material changes via email</span></li>
                                    <li className="flex items-start gap-2"><i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i><span>Your continued use means you accept the changes</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-accent text-2xl"></i>
                            <h2 className="text-3xl font-bold">Questions About Cookies?</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-accent text-xl"></i>
                                        <h3 className="card-title text-lg">Privacy Team</h3>
                                    </div>
                                    <p><a href="mailto:privacy@splits.network" className="link link-accent font-semibold">privacy@splits.network</a></p>
                                    <p className="text-sm text-base-content/70 mt-2">Response within 5 business days</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-headset text-accent text-xl"></i>
                                        <h3 className="card-title text-lg">Support</h3>
                                    </div>
                                    <p><a href="mailto:support@splits.network" className="link link-accent font-semibold">support@splits.network</a></p>
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
                                <a href="/public/privacy-policy" className="link link-accent">Privacy Policy</a>
                                <a href="/public/terms-of-service" className="link link-accent">Terms of Service</a>
                                <a href="/" className="link link-accent">Back to Home</a>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}
