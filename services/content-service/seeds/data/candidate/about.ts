import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "ABOUT US",
        kickerIcon: "fa-duotone fa-regular fa-users",
        headlineWords: [
            { text: "Your" },
            { text: "Career," },
            { text: "Your", accent: true },
            { text: "Terms" },
        ],
        subtitle:
            "Applicant Network connects talented candidates with vetted recruiters who actually care about your career. Transparent process, zero cost to candidates, better opportunities.",
        image: "/images/content/candidate-about-hero.jpg",
        imageAlt: "Diverse professionals collaborating in a modern workspace",
        buttons: [
            {
                label: "Browse Jobs",
                href: "/jobs",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-magnifying-glass",
            },
            {
                label: "How It Works",
                href: "/how-it-works",
                variant: "outline",
            },
        ],
    },
    {
        type: "stats-bar",
        stats: [
            { value: "50,000+", label: "Candidates Placed" },
            { value: "3,200+", label: "Vetted Recruiters" },
            {
                value: "$0",
                label: "Cost to Candidates",
                borderColor: "border-accent",
            },
            { value: "98%", label: "Satisfaction Rate" },
        ],
        bg: "neutral",
    },
    {
        type: "article-body",
        sectionNumber: "01",
        kicker: "OUR MISSION",
        kickerColor: "primary",
        heading: "Putting Candidates First",
        paragraphs: [
            "Traditional job searching is broken. You submit applications into a black hole, get ghosted by recruiters, and have no visibility into where you stand. We built Applicant Network to change that.",
            "Our platform connects you with <strong>pre-vetted recruiters</strong> who specialize in your industry and are incentivized to find you the right fit — not just any fit. Every interaction is tracked, every step is transparent, and you never pay a dime.",
        ],
        bg: "base-100",
    },
    {
        type: "split-editorial",
        sectionNumber: "02",
        kicker: "TRANSPARENCY",
        heading: "See Everything, Control Everything",
        paragraphs: [
            "Know exactly where your application stands at every stage. No more wondering if your resume was even seen.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-eye",
                title: "Full Visibility",
                body: "Track every application from submission to offer in real time.",
            },
            {
                icon: "fa-duotone fa-regular fa-shield-check",
                title: "Vetted Recruiters",
                body: "Every recruiter on our platform is verified and rated by candidates like you.",
            },
            {
                icon: "fa-duotone fa-regular fa-lock",
                title: "Privacy First",
                body: "You control who sees your profile and resume. Opt in, not out.",
            },
        ],
        image: "/images/content/candidate-transparency.jpg",
        imageAlt:
            "Application tracking dashboard showing real-time status updates",
        layout: "text-left",
        bg: "base-200",
    },
    {
        type: "pull-quote",
        quote: "For the first time in my career, I felt like I was in control of my job search. The transparency is a game changer.",
        citation: "Maria Gonzalez, Software Engineer",
        bg: "base-100",
        style: "left-border",
    },
    {
        type: "benefits-cards",
        kicker: "WHY APPLICANT NETWORK",
        heading: "Built for Candidates",
        cards: [
            {
                icon: "fa-duotone fa-regular fa-dollar-sign",
                title: "Always Free",
                description:
                    "No fees, no premium tiers, no catch. Recruiters pay — you benefit.",
                metric: "$0",
                metricLabel: "forever",
            },
            {
                icon: "fa-duotone fa-regular fa-comments",
                title: "Direct Communication",
                description:
                    "Message recruiters directly. No gatekeepers, no waiting.",
                metric: "< 4 hrs",
                metricLabel: "avg. response time",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-line",
                title: "Career Growth Tools",
                description:
                    "Resume tips, career guides, and salary insights — all free.",
                metric: "200+",
                metricLabel: "resources",
            },
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Ready to Take Control of Your Career?",
        subtitle:
            "Join 50,000+ candidates who found their next role through Applicant Network.",
        buttons: [
            {
                label: "Create Free Account",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
            { label: "Browse Jobs", href: "/jobs", variant: "outline" },
        ],
        contactEmail: "candidates@applicant.network",
        bg: "primary",
    },
];

export const candidateAbout = {
    slug: "about",
    app: "candidate" as const,
    title: "About Us | Applicant Network",
    description:
        "Applicant Network connects talented candidates with vetted recruiters who actually care about your career. Transparent process, zero cost to candidates, better opportunities.",
    category: "marketing",
    author: "Applicant Network",
    read_time: "3 min read",
    status: "published" as const,
    published_at: "2026-01-15T00:00:00Z",
    blocks,
};
