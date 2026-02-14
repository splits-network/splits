import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";
import { getAllArticles } from "@/lib/press";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "Press & Updates",
    description: "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
    openGraph: {
        title: "Press & Updates | Splits Network",
        description: "The latest features, improvements, and platform news from Splits Network. See what we've shipped and where we're headed.",
        url: "https://splits.network/public/press",
    },
    ...buildCanonical("/public/press"),
};

function formatArticleDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function PressKitPage() {
    const articles = getAllArticles();

    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-info text-info-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Press & Updates
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            The latest features, improvements, and platform
                            news from Splits Network
                        </p>
                        <Link
                            href="/public/brand"
                            className="btn btn-ghost btn-sm mt-6 border-info-content/30"
                        >
                            <i className="fa-duotone fa-regular fa-palette"></i>
                            Looking for brand assets?
                        </Link>
                    </div>
                </div>
            </section>

            {/* Articles */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="space-y-6" data-animate-stagger>
                            {articles.map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/public/press/${article.slug}`}
                                    className="card bg-base-200 shadow hover:-translate-y-1 hover:shadow-lg transition-all block"
                                >
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="badge badge-primary whitespace-nowrap">
                                                {formatArticleDate(
                                                    article.date,
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-lg mb-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-base-content/70">
                                                    {article.summary}
                                                </p>
                                                {article.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {article.tags.map(
                                                            (tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="badge badge-outline badge-sm"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-primary mt-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
