import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "Blog",
    description:
        "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
    openGraph: {
        title: "Blog",
        description:
            "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
        url: "https://splits.network/blog",
    },
    ...buildCanonical("/blog"),
};

const blogTopics = [
    {
        icon: "fa-handshake",
        iconColor: "text-primary",
        bgColor: "bg-primary/20",
        title: "Split Placement Strategies",
        description:
            "Tips and techniques for successful collaborative placements and partner relationships.",
    },
    {
        icon: "fa-chart-line",
        iconColor: "text-secondary",
        bgColor: "bg-secondary/20",
        title: "Industry Insights",
        description:
            "Trends in recruiting, hiring data, and the future of the talent acquisition industry.",
    },
    {
        icon: "fa-rocket",
        iconColor: "text-accent",
        bgColor: "bg-accent/20",
        title: "Platform Updates",
        description:
            "New features, improvements, and how to get the most out of Splits",
    },
    {
        icon: "fa-user-tie",
        iconColor: "text-success",
        bgColor: "bg-success/20",
        title: "Recruiter Success Stories",
        description:
            "Case studies and interviews with recruiters building successful split placement businesses.",
    },
    {
        icon: "fa-lightbulb",
        iconColor: "text-info",
        bgColor: "bg-info/20",
        title: "Best Practices",
        description:
            "Guides on candidate sourcing, client relationships, fee negotiations, and more.",
    },
    {
        icon: "fa-building",
        iconColor: "text-warning",
        bgColor: "bg-warning/20",
        title: "Company Perspectives",
        description:
            "How companies can build effective external recruiting networks and partnerships.",
    },
];

const resourceLinks = [
    {
        href: "/updates",
        icon: "fa-bullhorn",
        iconColor: "text-primary",
        title: "Platform Updates",
        description: "See our latest releases and upcoming roadmap",
    },
    {
        href: "/how-it-works",
        icon: "fa-question-circle",
        iconColor: "text-secondary",
        title: "How It Works",
        description: "Learn about the split placement process",
    },
    {
        href: "mailto:help@splits.network",
        icon: "fa-headset",
        iconColor: "text-accent",
        title: "Contact Support",
        description: "Have questions? Our team is here to help",
        isExternal: true,
    },
];

export default function BlogPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Splits Network Blog",
        description:
            "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
        path: "/blog",
    });

    return (
        <>
            <JsonLd data={articleJsonLd} id="portal-blog-article-jsonld" />
            <ScrollAnimator>
                {/* Hero Section */}
                <section className="hero bg-gradient-to-r from-info to-secondary text-info-content py-20 overflow-hidden">
                    <div className="hero-content text-center max-w-5xl">
                        <div>
                            <h1 className="text-5xl font-bold mb-6">
                                Splits Network Blog
                            </h1>
                            <p className="text-xl opacity-90 max-w-3xl mx-auto">
                                Insights, updates, and best practices for
                                collaborative recruiting
                            </p>
                        </div>
                    </div>
                </section>

                {/* Coming Soon Message */}
                <section className="py-20 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="mb-12">
                                <i className="fa-duotone fa-regular fa-pen-to-square text-8xl text-primary opacity-20"></i>
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-6">
                                    Blog Coming Soon
                                </h2>
                                <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
                                    We're preparing valuable content about split
                                    placements, recruiting best practices,
                                    platform updates, and industry insights.
                                    Check back soon!
                                </p>
                                <div className="alert alert-info max-w-2xl mx-auto mb-8">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <span>
                                        Want to be notified when we publish?
                                        Subscribe to our newsletter below.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What to Expect */}
                <section className="py-20 bg-base-200 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                                What We'll Cover
                            </h2>
                            <div
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                                data-animate-stagger
                            >
                                {blogTopics.map((topic, index) => (
                                    <div
                                        key={index}
                                        className="card bg-base-100 shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                                    >
                                        <div className="card-body">
                                            <div
                                                className={`w-12 h-12 rounded-full ${topic.bgColor} flex items-center justify-center mb-4`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${topic.icon} ${topic.iconColor} text-xl`}
                                                ></i>
                                            </div>
                                            <h3 className="card-title text-lg">
                                                {topic.title}
                                            </h3>
                                            <p className="text-sm text-base-content/70">
                                                {topic.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Signup */}
                <section className="py-20 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="card bg-primary text-primary-content shadow">
                                <div className="card-body p-12 text-center">
                                    <i className="fa-duotone fa-regular fa-envelope-open-text text-5xl mb-6 opacity-80"></i>
                                    <h2 className="card-title justify-center text-3xl mb-4">
                                        Subscribe to Our Newsletter
                                    </h2>
                                    <p className="text-lg opacity-90 mb-8">
                                        Be the first to know when we publish new
                                        content. Get platform updates,
                                        recruiting tips, and industry insights
                                        delivered to your inbox.
                                    </p>
                                    <div className="form-control w-full max-w-md mx-auto">
                                        <div className="join">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                className="input w-full join-item flex-grow text-base-content"
                                            />
                                            <button className="btn btn-secondary join-item">
                                                Subscribe
                                            </button>
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-primary-content/70">
                                                We respect your privacy.
                                                Unsubscribe at any time.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* In the Meantime */}
                <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto text-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-8 opacity-0">
                                    In the Meantime
                                </h2>
                                <p className="text-lg opacity-80 mb-12">
                                    Explore other resources while we prepare our
                                    blog content
                                </p>
                            </div>
                            <div
                                className="grid md:grid-cols-3 gap-6"
                                data-animate-stagger
                            >
                                {resourceLinks.map((resource, index) => {
                                    const CardWrapper = resource.isExternal
                                        ? "a"
                                        : Link;
                                    return (
                                        <CardWrapper
                                            key={index}
                                            href={resource.href}
                                            className="card bg-base-100 text-base-content shadow hover:-translate-y-1 hover:shadow-lg transition-all"
                                        >
                                            <div className="card-body text-center">
                                                <i
                                                    className={`fa-duotone fa-regular ${resource.icon} text-4xl ${resource.iconColor} mb-4`}
                                                ></i>
                                                <h3 className="card-title justify-center">
                                                    {resource.title}
                                                </h3>
                                                <p className="text-sm text-base-content/70">
                                                    {resource.description}
                                                </p>
                                            </div>
                                        </CardWrapper>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-primary text-primary-content overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Don't wait for blog posts--start making split
                            placements today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sign-up"
                                className="btn btn-lg btn-neutral"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Join as a Recruiter
                            </Link>
                            <Link
                                href="/sign-up"
                                className="btn btn-lg btn-secondary"
                            >
                                <i className="fa-duotone fa-regular fa-building"></i>
                                Post Roles as a Company
                            </Link>
                        </div>
                    </div>
                </section>
            </ScrollAnimator>
        </>
    );
}
