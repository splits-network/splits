import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/press";
import { buildCanonical, PORTAL_BASE_URL } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { pressComponents } from "@/lib/press-mdx-components";
import { ArticleLayout } from "./article-layout";

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

export default async function PressArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) notFound();

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
            <ArticleLayout article={article}>
                <MDXRemote
                    source={article.content}
                    components={pressComponents}
                />
            </ArticleLayout>
        </>
    );
}
