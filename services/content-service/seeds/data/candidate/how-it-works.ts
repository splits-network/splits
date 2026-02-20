import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "HOW IT WORKS",
        kickerIcon: "fa-duotone fa-regular fa-route",
        headlineWords: [
            { text: "From" },
            { text: "Profile" },
            { text: "to", accent: true },
            { text: "Placement" },
        ],
        subtitle:
            "Your complete guide to finding your next role on Applicant Network. From profile creation to job placement — here's how the process works step by step.",
        image: "/images/content/candidate-how-it-works-hero.jpg",
        imageAlt: "Candidate reviewing job opportunities on their laptop",
        buttons: [
            {
                label: "Get Started",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
        ],
    },
    {
        type: "timeline",
        kicker: "THE PROCESS",
        heading: "Your Journey in 5 Steps",
        steps: [
            {
                number: 1,
                title: "Create Your Profile",
                description:
                    "Sign up for free and build your candidate profile. Upload your resume, add your skills, and set your job preferences. The more complete your profile, the better your matches.",
                icon: "fa-duotone fa-regular fa-user-plus",
            },
            {
                number: 2,
                title: "Browse the Marketplace",
                description:
                    "Explore hundreds of verified job listings. Use smart filters to narrow by role, location, salary, and industry. Save searches to get notified about new matches.",
                icon: "fa-duotone fa-regular fa-magnifying-glass",
            },
            {
                number: 3,
                title: "Apply with Confidence",
                description:
                    "When you find a role that fits, apply with one click. Your profile and resume are shared with the recruiter. Add a personalized note to stand out.",
                icon: "fa-duotone fa-regular fa-paper-plane",
            },
            {
                number: 4,
                title: "Track Your Progress",
                description:
                    "Follow every application in real time through your dashboard. See exactly which stage you're in, get updates when things move, and communicate directly with recruiters.",
                icon: "fa-duotone fa-regular fa-chart-line",
            },
            {
                number: 5,
                title: "Land Your Role",
                description:
                    "When a match is made, your recruiter guides you through the offer process. Accept your new role and start your next chapter.",
                icon: "fa-duotone fa-regular fa-trophy",
            },
        ],
        bg: "base-100",
    },
    {
        type: "split-editorial",
        kicker: "VETTED RECRUITERS",
        heading: "Recruiters Who Work for You",
        paragraphs: [
            "Every recruiter on Applicant Network is verified and rated by candidates. They specialize in your industry and are motivated to find you the right fit — because they only get paid when you succeed.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-badge-check",
                title: "Identity Verified",
                body: "Every recruiter passes our verification process before joining the platform.",
            },
            {
                icon: "fa-duotone fa-regular fa-star",
                title: "Candidate Rated",
                body: "See reviews from candidates who have worked with each recruiter.",
            },
            {
                icon: "fa-duotone fa-regular fa-handshake",
                title: "Success-Based",
                body: "Recruiters earn fees from companies when they place you — not from you.",
            },
        ],
        image: "/images/content/vetted-recruiters.jpg",
        imageAlt: "Recruiter and candidate having a productive conversation",
        layout: "text-right",
        bg: "base-200",
    },
    {
        type: "pull-quote",
        quote: "I went from applying to hundreds of jobs with no response to getting three interviews in my first week on Applicant Network. The recruiter matched me with roles I never would have found on my own.",
        citation: "David Kim, Product Manager",
        bg: "base-100",
        style: "centered",
    },
    {
        type: "feature-grid",
        kicker: "WHAT YOU GET",
        heading: "Your Free Toolkit",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-radar",
                title: "Smart Matching",
                description:
                    "AI-powered suggestions surface roles that fit your skills and preferences.",
            },
            {
                icon: "fa-duotone fa-regular fa-bell",
                title: "Instant Alerts",
                description:
                    "Get notified the moment new roles match your saved search criteria.",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                title: "Direct Messaging",
                description:
                    "Chat with recruiters directly — no middlemen, no delays.",
            },
            {
                icon: "fa-duotone fa-regular fa-shield-check",
                title: "Privacy Controls",
                description:
                    "You decide who sees your profile and when. Fully opt-in.",
            },
            {
                icon: "fa-duotone fa-regular fa-chart-mixed",
                title: "Application Dashboard",
                description:
                    "Track every application and see exactly where you stand.",
            },
            {
                icon: "fa-duotone fa-regular fa-book",
                title: "Career Resources",
                description:
                    "Access resume tips, interview prep, salary insights, and more.",
            },
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Ready to Find Your Next Role?",
        subtitle:
            "Create your free profile in under 5 minutes and start receiving matched opportunities.",
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

export const candidateHowItWorks = {
    slug: "how-it-works",
    app: "candidate" as const,
    title: "How It Works | Applicant Network",
    description:
        "Your complete guide to finding your next role on Applicant Network. From profile creation to job placement — here's how the process works step by step.",
    category: "marketing",
    author: "Applicant Network",
    read_time: "3 min read",
    status: "published" as const,
    published_at: "2026-01-15T00:00:00Z",
    blocks,
};
