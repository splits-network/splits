import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/press";
import { buildCanonical, PORTAL_BASE_URL } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { pressComponents } from "@/lib/press-mdx-components";
import Link from "next/link";
import { ArticleAnimator } from "./article-animator";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return {};

    return {
        title: article.title,
        description: article.summary,
        openGraph: {
            title: `${article.title} | Splits Network`,
            description: article.summary,
            url: `${PORTAL_BASE_URL}/public/press/${slug}`,
            type: "article",
            publishedTime: article.date,
            authors: [article.author],
            tags: article.tags,
            ...(article.heroImage
                ? { images: [{ url: article.heroImage }] }
                : {}),
        },
        ...buildCanonical(`/public/press/${slug}`),
    };
}

export default async function PressArticleMemphisPage({ params }: PageProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) notFound();

    const formattedDate = new Date(
        article.date + "T00:00:00"
    ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const newsArticleJsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.summary,
        datePublished: article.date,
        author: {
            "@type": "Organization",
            name: article.author,
        },
        publisher: {
            "@type": "Organization",
            name: "Splits Network",
            url: "https://splits.network",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${PORTAL_BASE_URL}/public/press/${slug}`,
        },
        ...(article.heroImage ? { image: article.heroImage } : {}),
    };

    return (
        <>
            <JsonLd data={newsArticleJsonLd} id={`press-${slug}-jsonld`} />
            <ArticleAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════ */}
                <section className="relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                    {/* Memphis decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[50%] right-[8%] w-16 h-16 rounded-full bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[15%] left-[12%] w-10 h-10 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[25%] right-[22%] w-14 h-14 rotate-12 bg-purple opacity-0" />
                        <div className="memphis-shape absolute bottom-[35%] right-[35%] w-20 h-8 -rotate-6 border-4 border-coral opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Breadcrumb */}
                            <div className="hero-breadcrumb flex items-center justify-center gap-2 mb-8 opacity-0">
                                <Link
                                    href="/public/press-memphis"
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50 hover:text-coral transition-colors"
                                >
                                    Press Room
                                </Link>
                                <span className="text-cream/30">/</span>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cream/70 truncate max-w-xs">
                                    {article.title}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="hero-headline text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-8 text-cream opacity-0">
                                {article.title}
                            </h1>

                            {/* Meta */}
                            <div className="hero-meta flex items-center justify-center gap-4 flex-wrap opacity-0">
                                <time
                                    dateTime={article.date}
                                    className="text-xs font-bold uppercase tracking-[0.15em] text-cream/50"
                                >
                                    <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                    {formattedDate}
                                </time>
                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-cream/50">
                                    <i className="fa-duotone fa-regular fa-pen-nib mr-1" />
                                    {article.author}
                                </span>
                                {article.version && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] bg-teal text-dark">
                                        v{article.version}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            {article.tags.length > 0 && (
                                <div className="hero-tags flex justify-center gap-2 mt-6 opacity-0">
                                    {article.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-cream/20 text-cream/70"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    ARTICLE BODY
                   ══════════════════════════════════════════════════════════ */}
                <section className="py-16 bg-cream">
                    <div className="container mx-auto px-4">
                        <div className="article-body max-w-3xl mx-auto prose prose-lg opacity-0">
                            <MDXRemote
                                source={article.content}
                                components={pressComponents}
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    BACK TO PRESS
                   ══════════════════════════════════════════════════════════ */}
                <section className="back-nav py-12 bg-dark opacity-0">
                    <div className="container mx-auto px-4 text-center">
                        <Link
                            href="/public/press-memphis"
                            className="btn btn-coral btn-md"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-left mr-2" />
                            Back To Press Room
                        </Link>
                    </div>
                </section>
            </ArticleAnimator>
        </>
    );
}
