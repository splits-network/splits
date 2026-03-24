import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContentPage } from "@/lib/content";
import { buildCanonical, CANDIDATE_BASE_URL } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import {
    BaselArticleRenderer,
    BaselArticleAnimationWrapper,
} from "@splits-network/basel-ui";

export const revalidate = 300;

const VALID_TYPES = [
    "blog",
    "article",
    "help",
    "partner",
    "press",
    "legal",
    "page",
] as const;

interface PageProps {
    params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { type, slug } = await params;
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number]))
        return {};

    const page = await getContentPage(slug);
    if (!page) return {};

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: `${page.title} | Applicant Network`,
            description: page.description || "",
            url: `${CANDIDATE_BASE_URL}/cms/${type}/${slug}`,
            type: ["blog", "article", "press"].includes(type)
                ? "article"
                : "website",
            ...(page.published_at
                ? { publishedTime: page.published_at }
                : {}),
            ...(page.author ? { authors: [page.author] } : {}),
            ...(page.og_image
                ? { images: [{ url: page.og_image }] }
                : {}),
        },
        ...buildCanonical(`/cms/${type}/${slug}`),
    };
}

function getJsonLdType(type: string): string {
    switch (type) {
        case "blog":
            return "BlogPosting";
        case "article":
            return "Article";
        case "press":
            return "NewsArticle";
        default:
            return "WebPage";
    }
}

export default async function CmsTypeSlugPage({ params }: PageProps) {
    const { type, slug } = await params;
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number]))
        notFound();

    const page = await getContentPage(slug);
    if (!page) notFound();
    if (page.page_type !== type) notFound();

    const schemaType = getJsonLdType(type);

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline: page.title,
        description: page.description,
        url: `${CANDIDATE_BASE_URL}/cms/${type}/${slug}`,
        ...(page.published_at
            ? { datePublished: page.published_at }
            : {}),
        ...(page.updated_at
            ? { dateModified: page.updated_at }
            : {}),
        ...(page.author
            ? { author: { "@type": "Person", name: page.author } }
            : {}),
        ...(page.og_image ? { image: page.og_image } : {}),
        publisher: {
            "@type": "Organization",
            name: "Applicant Network",
            url: "https://applicant.network",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${CANDIDATE_BASE_URL}/cms/${type}/${slug}`,
        },
    };

    if (["blog", "article", "press"].includes(type)) {
        jsonLd.articleSection =
            type.charAt(0).toUpperCase() + type.slice(1);
    }

    return (
        <>
            <JsonLd data={jsonLd} id={`cms-${type}-${slug}-jsonld`} />
            <BaselArticleAnimationWrapper>
                <BaselArticleRenderer blocks={page.blocks} />
            </BaselArticleAnimationWrapper>
        </>
    );
}
