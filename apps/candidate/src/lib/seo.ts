export const CANDIDATE_BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://applicant.network";

export function buildCanonical(path: string) {
    return {
        alternates: {
            canonical: `${CANDIDATE_BASE_URL}${path}`,
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
    const url = `${CANDIDATE_BASE_URL}${path}`;
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
            name: "Applicant Network",
            url: "https://applicant.network",
        },
    };
}
