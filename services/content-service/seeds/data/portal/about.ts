import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "ABOUT SPLITS NETWORK",
        kickerIcon: "fa-duotone fa-regular fa-building",
        headlineWords: [
            { text: "The" },
            { text: "Future", accent: true },
            { text: "of" },
            { text: "Split-Fee" },
            { text: "Recruiting" },
        ],
        subtitle:
            "Splits Network is the marketplace where recruiters and hiring companies collaborate transparently. We're building the infrastructure that makes split-fee recruiting work at scale.",
        image: "/images/content/portal-about-hero.jpg",
        imageAlt: "Modern office with team members collaborating",
        buttons: [
            {
                label: "Join the Network",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
            {
                label: "See How It Works",
                href: "/how-it-works",
                variant: "outline",
            },
        ],
    },
    {
        type: "stats-bar",
        stats: [
            { value: "3,200+", label: "Active Recruiters" },
            { value: "500+", label: "Companies" },
            { value: "50,000+", label: "Placements" },
            {
                value: "$2.4M",
                label: "Monthly Payouts",
                borderColor: "border-accent",
            },
        ],
        bg: "neutral",
    },
    {
        type: "article-body",
        sectionNumber: "01",
        kicker: "THE PROBLEM",
        kickerColor: "primary",
        heading: "Why Recruiting Needed to Change",
        paragraphs: [
            "The recruiting industry operates on relationships and trust — but the tools haven't kept up. Companies struggle to find qualified candidates. Independent recruiters lack access to premium roles. Candidates get lost in the shuffle.",
            "Split-fee recruiting — where two recruiters collaborate to fill a role — has existed for decades. But without modern infrastructure, it's been held back by manual processes, unclear terms, and a lack of transparency.",
            "We built Splits Network to fix that. A single platform where companies post roles, recruiters discover and fill them, and everyone shares in the success — with every fee, every stage, and every payment tracked transparently.",
        ],
        bg: "base-100",
    },
    {
        type: "split-editorial",
        sectionNumber: "02",
        kicker: "OUR PLATFORM",
        heading: "Everything in One Place",
        paragraphs: [
            "From job posting to placement payout, Splits Network provides the complete toolkit for modern recruiting teams.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-briefcase",
                title: "Role Marketplace",
                body: "Companies post roles with clear fee structures. Recruiters browse and engage.",
            },
            {
                icon: "fa-duotone fa-regular fa-users",
                title: "ATS Built-In",
                body: "Track candidates through every stage without leaving the platform.",
            },
            {
                icon: "fa-duotone fa-regular fa-money-bill-wave",
                title: "Automated Payouts",
                body: "When a placement is made, fees are calculated and paid automatically via Stripe.",
            },
        ],
        image: "/images/content/platform-overview.jpg",
        imageAlt: "Splits Network platform dashboard showing role marketplace",
        layout: "text-left",
        bg: "base-200",
    },
    {
        type: "split-editorial",
        sectionNumber: "03",
        kicker: "OUR VALUES",
        heading: "Transparency at Every Level",
        paragraphs: [
            "We believe recruiting works best when everyone can see what's happening. That's why transparency isn't a feature — it's the foundation of everything we build.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-eye",
                title: "Open Fee Structures",
                body: "Every role shows the fee split upfront. No hidden charges, no surprises.",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-mixed",
                title: "Real-Time Analytics",
                body: "Track placement rates, time-to-fill, and revenue across your entire operation.",
            },
            {
                icon: "fa-duotone fa-regular fa-scale-balanced",
                title: "Fair Terms",
                body: "Standardized contracts protect all parties. Dispute resolution built in.",
            },
        ],
        image: "/images/content/transparency-values.jpg",
        imageAlt: "Dashboard showing transparent fee breakdown",
        layout: "text-right",
        bg: "base-100",
    },
    {
        type: "pull-quote",
        quote: "Splits Network gave us visibility into our recruiting operations that we never had before. We can see exactly where every dollar goes and every candidate stands.",
        citation: "VP of Talent, Series B Startup",
        bg: "neutral",
        style: "centered",
    },
    {
        type: "benefits-cards",
        kicker: "FOR EVERYONE",
        heading: "A Better Model for All Parties",
        cards: [
            {
                icon: "fa-duotone fa-regular fa-building",
                title: "For Companies",
                description:
                    "Access a network of specialized recruiters without traditional agency overhead. Pay only for results.",
                metric: "60%",
                metricLabel: "lower cost per hire",
            },
            {
                icon: "fa-duotone fa-regular fa-user-tie",
                title: "For Recruiters",
                description:
                    "Access premium roles, earn transparent fees, and scale your business with powerful tools.",
                metric: "3x",
                metricLabel: "more placements",
            },
            {
                icon: "fa-duotone fa-regular fa-user",
                title: "For Candidates",
                description:
                    "Connect with vetted recruiters who specialize in your industry. Always free, always transparent.",
                metric: "$0",
                metricLabel: "cost to candidates",
            },
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Join the Network",
        subtitle:
            "Whether you're a company looking to hire or a recruiter looking to grow — Splits Network is where modern recruiting happens.",
        buttons: [
            {
                label: "Get Started",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
            {
                label: "Contact Sales",
                href: "mailto:sales@splits.network",
                variant: "outline",
            },
        ],
        contactEmail: "hello@splits.network",
        bg: "primary",
    },
];

export const portalAbout = {
    slug: "about",
    app: "portal" as const,
    title: "About | Splits Network",
    description:
        "Splits Network is the split-fee recruiting marketplace connecting recruiters and hiring companies with transparent collaboration tools.",
    category: "marketing",
    author: "Splits Network",
    read_time: "4 min read",
    status: "published" as const,
    published_at: "2026-01-10T00:00:00Z",
    blocks,
};
