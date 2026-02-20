import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContentPage } from '@/lib/content';
import { buildCanonical, CORPORATE_BASE_URL } from '@/lib/seo';
import { JsonLd } from '@splits-network/shared-ui';
import { BaselArticleAnimated } from '@splits-network/basel-ui';

export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const slugPath = slug.join('/');
    const page = await getContentPage(slugPath);
    if (!page) return {};

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: `${page.title} | Employment Networks`,
            description: page.description || '',
            url: `${CORPORATE_BASE_URL}/cms/${slugPath}`,
            type: page.category === 'blog' || page.category === 'article' ? 'article' : 'website',
            ...(page.published_at ? { publishedTime: page.published_at } : {}),
            ...(page.author ? { authors: [page.author] } : {}),
            ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
        },
        ...buildCanonical(`/cms/${slugPath}`),
    };
}

export default async function CmsPage({ params }: PageProps) {
    const { slug } = await params;
    const slugPath = slug.join('/');
    const page = await getContentPage(slugPath);
    if (!page) notFound();

    const isArticle =
        page.category === 'blog' ||
        page.category === 'article' ||
        page.category === 'press';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': isArticle ? 'Article' : 'WebPage',
        headline: page.title,
        description: page.description,
        url: `${CORPORATE_BASE_URL}/cms/${slugPath}`,
        ...(page.published_at ? { datePublished: page.published_at } : {}),
        ...(page.author
            ? { author: { '@type': 'Person', name: page.author } }
            : {}),
        ...(page.og_image ? { image: page.og_image } : {}),
        publisher: {
            '@type': 'Organization',
            name: 'Employment Networks',
            url: 'https://employment-networks.com',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${CORPORATE_BASE_URL}/cms/${slugPath}`,
        },
    };

    return (
        <>
            <JsonLd data={jsonLd} id={`cms-${slugPath}-jsonld`} />
            <BaselArticleAnimated blocks={page.blocks} />
        </>
    );
}
