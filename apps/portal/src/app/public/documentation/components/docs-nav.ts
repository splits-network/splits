export type DocsNavItem = {
    title: string;
    href: string;
    description?: string;
    comingSoon?: boolean;
};

export type DocsNavSection = {
    title: string;
    items: DocsNavItem[];
};

export const docsNavSections: DocsNavSection[] = [
    {
        title: "Getting Started",
        items: [
            {
                title: "Documentation Home",
                href: "/public/documentation",
                description: "Start here",
            },
            {
                title: "What Is Splits Network",
                href: "/public/documentation/getting-started/what-is-splits-network",
            },
            {
                title: "First-Time Setup",
                href: "/public/documentation/getting-started/first-time-setup",
            },
            {
                title: "Navigation Overview",
                href: "/public/documentation/getting-started/navigation-overview",
            },
        ],
    },
    {
        title: "Feature Guides",
        items: [
            {
                title: "Integrations",
                href: "/public/documentation/integrations",
                comingSoon: true,
            },
        ],
    },
];

