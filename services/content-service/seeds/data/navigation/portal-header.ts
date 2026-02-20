import type { HeaderNavConfig } from "@splits-network/shared-types";

export const portalHeaderNav = {
    app: "portal" as const,
    location: "header" as const,
    config: {
        items: [
            {
                label: "Platform",
                icon: "fa-duotone fa-regular fa-grid-2",
                subItems: [
                    {
                        icon: "fa-duotone fa-regular fa-briefcase",
                        label: "ATS",
                        desc: "Track every candidate",
                        href: "/platform/ats",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-handshake",
                        label: "Split Fees",
                        desc: "Fair, transparent splits",
                        href: "/platform/split-fees",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-chart-mixed",
                        label: "Analytics",
                        desc: "Real-time insights",
                        href: "/platform/analytics",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-messages",
                        label: "Messaging",
                        desc: "Built-in communication",
                        href: "/platform/messaging",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-robot",
                        label: "AI Matching",
                        desc: "Smart candidate pairing",
                        href: "/platform/ai-matching",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-file-invoice-dollar",
                        label: "Billing",
                        desc: "Automated payouts",
                        href: "/platform/billing",
                    },
                ],
            },
            {
                label: "Network",
                icon: "fa-duotone fa-regular fa-circle-nodes",
                subItems: [
                    {
                        icon: "fa-duotone fa-regular fa-user-tie",
                        label: "For Recruiters",
                        desc: "Grow your business",
                        href: "/for-recruiters",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-building",
                        label: "For Companies",
                        desc: "Find top talent",
                        href: "/for-companies",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-address-book",
                        label: "Directory",
                        desc: "Browse the network",
                        href: "#",
                    },
                ],
            },
            {
                label: "Pricing",
                icon: "fa-duotone fa-regular fa-tag",
                href: "/pricing",
            },
            {
                label: "Resources",
                icon: "fa-duotone fa-regular fa-books",
                subItems: [
                    {
                        icon: "fa-duotone fa-regular fa-gears",
                        label: "How It Works",
                        desc: "See the platform in action",
                        href: "/how-it-works",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-life-ring",
                        label: "Help Center",
                        desc: "Get support",
                        href: "#",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-newspaper",
                        label: "Blog",
                        desc: "Latest industry insights",
                        href: "#",
                    },
                ],
            },
            {
                label: "Company",
                icon: "fa-duotone fa-regular fa-building-columns",
                subItems: [
                    {
                        icon: "fa-duotone fa-regular fa-users",
                        label: "About",
                        desc: "Our story & mission",
                        href: "#",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-envelope",
                        label: "Contact",
                        desc: "Get in touch",
                        href: "#",
                    },
                ],
            },
        ],
    } satisfies HeaderNavConfig,
};
