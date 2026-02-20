import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "FOR COMPANIES",
        kickerIcon: "fa-duotone fa-regular fa-building",
        headlineWords: [
            { text: "Hire" },
            { text: "Better," },
            { text: "Hire", accent: true },
            { text: "Faster" },
        ],
        subtitle:
            "Access a vetted network of specialized recruiters who compete to fill your roles. Only pay when a placement is made.",
        image: "/images/content/for-companies-hero.jpg",
        imageAlt: "Hiring manager reviewing top candidates on dashboard",
        buttons: [
            {
                label: "Post a Role",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-plus",
            },
            { label: "See Pricing", href: "/pricing", variant: "outline" },
        ],
    },
    {
        type: "stats-bar",
        stats: [
            { value: "< 21 days", label: "Avg. Time to Fill" },
            { value: "3,200+", label: "Recruiters in Network" },
            {
                value: "60%",
                label: "Lower Cost Per Hire",
                borderColor: "border-accent",
            },
            { value: "92%", label: "12-Month Retention" },
        ],
        bg: "neutral",
    },
    {
        type: "article-body",
        sectionNumber: "01",
        kicker: "THE CHALLENGE",
        kickerColor: "primary",
        heading: "Why Traditional Recruiting Falls Short",
        paragraphs: [
            "Hiring through traditional agencies means single-source dependency, opaque processes, and fees that strain your budget. You're locked into one recruiter's network and hoping they deliver.",
            "Splits Network flips this model. <strong>Post a role once and let specialized recruiters compete to fill it.</strong> You get broader candidate coverage, faster results, and only pay when someone is hired.",
        ],
        bg: "base-100",
    },
    {
        type: "split-editorial",
        sectionNumber: "02",
        kicker: "THE MARKETPLACE",
        heading: "One Role, Many Recruiters",
        paragraphs: [
            "When you post a role on Splits Network, it's visible to our entire network of verified recruiters. Those with relevant expertise and candidate pools engage — giving you access to talent you'd never reach through a single agency.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-filter",
                title: "Quality Over Quantity",
                body: "Recruiters are matched to roles by specialty. You only see relevant submissions.",
            },
            {
                icon: "fa-duotone fa-regular fa-handshake",
                title: "Clear Fee Terms",
                body: "Set your fee structure upfront. Recruiters engage knowing exactly what they'll earn.",
            },
            {
                icon: "fa-duotone fa-regular fa-gauge-high",
                title: "Faster Results",
                body: "Multiple recruiters working your role means faster candidate flow and shorter time-to-fill.",
            },
        ],
        image: "/images/content/marketplace-companies.jpg",
        imageAlt:
            "Dashboard showing multiple recruiter submissions for a single role",
        layout: "text-left",
        bg: "base-200",
    },
    {
        type: "feature-grid",
        kicker: "BUILT-IN TOOLS",
        heading: "Your Complete Hiring Platform",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-table-columns",
                title: "ATS Pipeline",
                description:
                    "Track every candidate through customizable hiring stages. No external tools needed.",
                stats: "Unlimited stages",
            },
            {
                icon: "fa-duotone fa-regular fa-robot",
                title: "AI Matching",
                description:
                    "Our AI evaluates candidate-role fit and surfaces the strongest matches first.",
                stats: "95% accuracy",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-mixed",
                title: "Hiring Analytics",
                description:
                    "Track time-to-fill, source effectiveness, and recruiter performance.",
                badge: "Pro",
            },
            {
                icon: "fa-duotone fa-regular fa-money-bill-wave",
                title: "Automated Billing",
                description:
                    "Placement fees calculated and processed automatically via Stripe.",
            },
            {
                icon: "fa-duotone fa-regular fa-users-gear",
                title: "Team Management",
                description:
                    "Invite hiring managers, set permissions, and collaborate on candidate reviews.",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                title: "Direct Messaging",
                description:
                    "Communicate with recruiters and coordinate on candidates without leaving the platform.",
            },
        ],
        bg: "base-100",
    },
    {
        type: "pull-quote",
        quote: "We reduced our average time-to-fill from 45 days to 18 days after switching to Splits Network. The recruiter marketplace model is a game changer for scaling teams.",
        citation: "Director of Talent Acquisition, Fortune 500",
        bg: "neutral",
        style: "left-border",
    },
    {
        type: "timeline",
        kicker: "GET STARTED",
        heading: "How It Works for Companies",
        steps: [
            {
                number: 1,
                title: "Create Your Company Profile",
                description:
                    "Sign up, set up your company page, and invite your hiring team.",
                icon: "fa-duotone fa-regular fa-building",
            },
            {
                number: 2,
                title: "Post Your Roles",
                description:
                    "Create role listings with requirements, compensation, and fee structures.",
                icon: "fa-duotone fa-regular fa-briefcase",
            },
            {
                number: 3,
                title: "Review Candidates",
                description:
                    "Recruiters submit qualified candidates. Review, interview, and advance through your pipeline.",
                icon: "fa-duotone fa-regular fa-users",
            },
            {
                number: 4,
                title: "Make the Hire",
                description:
                    "When you find the right candidate, make the offer. Fees are handled automatically.",
                icon: "fa-duotone fa-regular fa-trophy",
            },
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Ready to Transform Your Hiring?",
        subtitle:
            "Post your first role and let our recruiter network start delivering candidates today.",
        buttons: [
            {
                label: "Post a Role Free",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
            {
                label: "Talk to Sales",
                href: "mailto:sales@splits.network",
                variant: "outline",
            },
        ],
        contactEmail: "sales@splits.network",
        bg: "primary",
    },
];

export const portalForCompanies = {
    slug: "for-companies",
    app: "portal" as const,
    title: "For Companies | Splits Network",
    description:
        "Hire better, hire faster. Access a vetted network of specialized recruiters who compete to fill your roles. Only pay when a placement is made.",
    category: "marketing",
    author: "Splits Network",
    read_time: "4 min read",
    status: "published" as const,
    published_at: "2026-01-10T00:00:00Z",
    blocks,
};
