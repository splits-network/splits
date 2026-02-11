export const PORTAL_BASE_URL = "https://splits.network";

export function buildCanonical(path: string) {
    return {
        alternates: {
            canonical: `${PORTAL_BASE_URL}${path}`,
        },
    };
}

export function buildArticleJsonLd({
    title,
    description,
    path,
}: {
    title: string;
    description: string;
    path: string;
}) {
    const url = `${PORTAL_BASE_URL}${path}`;
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        },
        publisher: {
            "@type": "Organization",
            name: "Splits Network",
            url: "https://splits.network",
        },
    };
}
