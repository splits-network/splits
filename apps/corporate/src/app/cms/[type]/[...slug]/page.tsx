import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getContentPage } from "@/lib/content";
import { buildCanonical, CORPORATE_BASE_URL } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import {
    BaselArticleRenderer,
    BaselArticleAnimationWrapper,
} from "@splits-network/basel-ui";

export const revalidate = 300;

const VALID_TYPES = ['blog', 'article', 'help', 'partner', 'press', 'legal', 'page'] as const;

interface PageProps {
    params: Promise<{ type: string; slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { type, slug } = await params;
    const slugPath = slug.join("/");

    if (!VALID_TYPES.includes(type as any)) return {};

    const page = await getContentPage(slugPath);
    if (!page) return {};

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: `${page.title} | Employment Networks`,
            description: page.description || "",
            url: `${CORPORATE_BASE_URL}/cms/${type}/${slugPath}`,
            type: ['blog', 'article', 'press'].includes(type) ? "article" : "website",
            ...(page.published_at ? { publishedTime: page.published_at } : {}),
            ...(page.author ? { authors: [page.author] } : {}),
            ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
        },
        ...buildCanonical(`/cms/${type}/${slugPath}`),
    };
}

function getJsonLdType(type: string): string {
    switch (type) {
        case 'blog': return 'BlogPosting';
        case 'article': return 'Article';
        case 'press': return 'NewsArticle';
        default: return 'WebPage';
    }
}

export default async function CmsTypeSlugPage({ params }: PageProps) {
    const { type, slug } = await params;
    const slugPath = slug.join("/");

    if (!VALID_TYPES.includes(type as any)) {
        // Legacy URL redirect — try treating "type" as part of a multi-segment slug
        const page = await getContentPage(`${type}/${slugPath}`);
        if (page) redirect(`/cms/${page.page_type}/${page.slug}`);
        notFound();
    }

    const page = await getContentPage(slugPath);
    if (!page) notFound();

    // Validate page_type matches URL type
    if (page.page_type !== type) notFound();

    const schemaType = getJsonLdType(type);
    const isArticleType = ['blog', 'article', 'press'].includes(type);

    const jsonLd: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline: page.title,
        description: page.description,
        url: `${CORPORATE_BASE_URL}/cms/${type}/${slugPath}`,
        ...(page.published_at ? { datePublished: page.published_at } : {}),
        ...(page.updated_at ? { dateModified: page.updated_at } : {}),
        ...(page.author
            ? { author: { "@type": "Person", name: page.author } }
            : {}),
        ...(page.og_image ? { image: page.og_image } : {}),
        publisher: {
            "@type": "Organization",
            name: "Employment Networks",
            url: "https://employment-networks.com",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${CORPORATE_BASE_URL}/cms/${type}/${slugPath}`,
        },
    };

    if (isArticleType) {
        jsonLd.articleSection = type.charAt(0).toUpperCase() + type.slice(1);
    }

    return (
        <>
            <JsonLd data={jsonLd} id={`cms-${type}-${slugPath}-jsonld`} />
            <BaselArticleAnimationWrapper>
                <BaselArticleRenderer blocks={page.blocks} />
            </BaselArticleAnimationWrapper>
        </>
    );
}
