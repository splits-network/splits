import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Recruiting insights, product updates, and split placement strategies.',
};

export default function BlogPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-info to-secondary text-info-content py-20">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Splits Network Blog
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Insights, updates, and best practices for collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Coming Soon Message */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-12">
                            <i className="fa-duotone fa-regular fa-pen-to-square text-8xl text-primary opacity-20"></i>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Blog Coming Soon</h2>
                        <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
                            We're preparing valuable content about split placements, recruiting best practices,
                            platform updates, and industry insights. Check back soon!
                        </p>
                        <div className="alert alert-info max-w-2xl mx-auto mb-8">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <span>
                                Want to be notified when we publish? Subscribe to our newsletter below.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* What to Expect */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center">What We'll Cover</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-handshake text-primary text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Split Placement Strategies</h3>
                                    <p className="text-sm text-base-content/70">
                                        Tips and techniques for successful collaborative placements and partner relationships.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-chart-line text-secondary text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Industry Insights</h3>
                                    <p className="text-sm text-base-content/70">
                                        Trends in recruiting, hiring data, and the future of the talent acquisition industry.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-rocket text-accent text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Platform Updates</h3>
                                    <p className="text-sm text-base-content/70">
                                        New features, improvements, and how to get the most out of Splits
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-user-tie text-success text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Recruiter Success Stories</h3>
                                    <p className="text-sm text-base-content/70">
                                        Case studies and interviews with recruiters building successful split placement businesses.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-lightbulb text-info text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Best Practices</h3>
                                    <p className="text-sm text-base-content/70">
                                        Guides on candidate sourcing, client relationships, fee negotiations, and more.
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                                        <i className="fa-duotone fa-regular fa-building text-warning text-xl"></i>
                                    </div>
                                    <h3 className="card-title text-lg">Company Perspectives</h3>
                                    <p className="text-sm text-base-content/70">
                                        How companies can build effective external recruiting networks and partnerships.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Signup */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="card bg-primary text-primary-content shadow">
                            <div className="card-body p-12 text-center">
                                <i className="fa-duotone fa-regular fa-envelope-open-text text-5xl mb-6 opacity-80"></i>
                                <h2 className="card-title justify-center text-3xl mb-4">
                                    Subscribe to Our Newsletter
                                </h2>
                                <p className="text-lg opacity-90 mb-8">
                                    Be the first to know when we publish new content. Get platform updates,
                                    recruiting tips, and industry insights delivered to your inbox.
                                </p>
                                <div className="form-control w-full max-w-md mx-auto">
                                    <div className="join">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="input input-bordered join-item flex-grow text-base-content"
                                        />
                                        <button className="btn btn-secondary join-item">
                                            Subscribe
                                        </button>
                                    </div>
                                    <label className="label">
                                        <span className="label-text-alt text-primary-content/70">
                                            We respect your privacy. Unsubscribe at any time.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* In the Meantime */}
            <section className="py-20 bg-neutral text-neutral-content">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8">In the Meantime</h2>
                        <p className="text-lg opacity-80 mb-12">
                            Explore other resources while we prepare our blog content
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Link href="/updates" className="card bg-base-100 text-base-content shadow hover:shadow-2xl transition-shadow">
                                <div className="card-body text-center">
                                    <i className="fa-duotone fa-regular fa-bullhorn text-4xl text-primary mb-4"></i>
                                    <h3 className="card-title justify-center">Platform Updates</h3>
                                    <p className="text-sm text-base-content/70">
                                        See our latest releases and upcoming roadmap
                                    </p>
                                </div>
                            </Link>
                            <Link href="/how-it-works" className="card bg-base-100 text-base-content shadow hover:shadow-2xl transition-shadow">
                                <div className="card-body text-center">
                                    <i className="fa-duotone fa-regular fa-question-circle text-4xl text-secondary mb-4"></i>
                                    <h3 className="card-title justify-center">How It Works</h3>
                                    <p className="text-sm text-base-content/70">
                                        Learn about the split placement process
                                    </p>
                                </div>
                            </Link>
                            <a href="mailto:help@splits.network" className="card bg-base-100 text-base-content shadow hover:shadow-2xl transition-shadow">
                                <div className="card-body text-center">
                                    <i className="fa-duotone fa-regular fa-headset text-4xl text-accent mb-4"></i>
                                    <h3 className="card-title justify-center">Contact Support</h3>
                                    <p className="text-sm text-base-content/70">
                                        Have questions? Our team is here to help
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Don't wait for blog posts—start making split placements today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up" className="btn btn-lg btn-neutral">
                            <i className="fa-duotone fa-regular fa-user-plus"></i>
                            Join as a Recruiter
                        </Link>
                        <Link href="/sign-up" className="btn btn-lg btn-secondary">
                            <i className="fa-duotone fa-regular fa-building"></i>
                            Post Roles as a Company
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
