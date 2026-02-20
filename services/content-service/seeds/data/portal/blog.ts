import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "BLOG",
        kickerIcon: "fa-duotone fa-regular fa-newspaper",
        headlineWords: [
            { text: "Insights" },
            { text: "&" },
            { text: "Updates", accent: true },
        ],
        subtitle:
            "The latest from Splits Network — product updates, industry insights, recruiting best practices, and company news.",
        buttons: [
            {
                label: "Subscribe",
                href: "#subscribe",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-envelope",
            },
        ],
    },
    {
        type: "article-body",
        heading: "Coming Soon",
        paragraphs: [
            "We're building out our blog with content that matters to recruiters and hiring teams. Expect articles on recruiting strategy, marketplace trends, product releases, and success stories from our network.",
            'In the meantime, follow us on <a href="https://linkedin.com/company/splits-network" target="_blank" rel="noopener noreferrer">LinkedIn</a> for the latest updates, or check out our <a href="/press">press releases</a> for company news.',
        ],
        bg: "base-100",
    },
    {
        type: "feature-grid",
        kicker: "WHAT TO EXPECT",
        heading: "Topics We Cover",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-chart-line",
                title: "Industry Trends",
                description:
                    "Data-driven analysis of the recruiting landscape, compensation trends, and market shifts.",
            },
            {
                icon: "fa-duotone fa-regular fa-lightbulb",
                title: "Best Practices",
                description:
                    "Proven strategies for hiring teams and recruiters to optimize their process.",
            },
            {
                icon: "fa-duotone fa-regular fa-rocket",
                title: "Product Updates",
                description:
                    "New features, improvements, and what's coming next on the platform.",
            },
            {
                icon: "fa-duotone fa-regular fa-trophy",
                title: "Success Stories",
                description:
                    "Real stories from recruiters and companies using Splits Network.",
            },
            {
                icon: "fa-duotone fa-regular fa-scale-balanced",
                title: "Policy & Legal",
                description:
                    "Updates on compliance, regulations, and industry standards.",
            },
            {
                icon: "fa-duotone fa-regular fa-people-group",
                title: "Company Culture",
                description:
                    "Behind the scenes at Splits Network — our team, values, and vision.",
            },
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Stay in the Loop",
        subtitle:
            "Get notified when we publish new articles and product updates.",
        buttons: [
            {
                label: "Follow on LinkedIn",
                href: "https://linkedin.com/company/splits-network",
                variant: "primary",
                icon: "fa-brands fa-linkedin",
            },
            {
                label: "View Press Releases",
                href: "/press",
                variant: "outline",
            },
        ],
        contactEmail: "press@splits.network",
        bg: "neutral",
    },
];

export const portalBlog = {
    slug: "blog",
    app: "portal" as const,
    title: "Blog | Splits Network",
    description:
        "The latest from Splits Network — product updates, industry insights, recruiting best practices, and company news.",
    category: "blog",
    author: "Splits Network",
    status: "published" as const,
    published_at: "2026-02-01T00:00:00Z",
    blocks,
};
