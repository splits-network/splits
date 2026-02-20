import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "GET IN TOUCH",
        kickerIcon: "fa-duotone fa-regular fa-envelope",
        headlineWords: [
            { text: "We're" },
            { text: "Here", accent: true },
            { text: "to" },
            { text: "Help" },
        ],
        subtitle:
            "Have a question about your application, profile, or how the platform works? Our support team typically responds within 4 hours during business days.",
        buttons: [
            {
                label: "Email Support",
                href: "mailto:support@applicant.network",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-envelope",
            },
        ],
    },
    {
        type: "feature-grid",
        heading: "How to Reach Us",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-envelope",
                title: "Email",
                description:
                    "support@applicant.network — General inquiries and account help.",
                stats: "< 4 hr response",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                title: "In-App Chat",
                description:
                    "Log in and use the chat feature for real-time support with our team.",
                stats: "Real-time",
            },
            {
                icon: "fa-duotone fa-regular fa-book",
                title: "Help Center",
                description:
                    "Browse our comprehensive FAQ and self-service guides.",
                stats: "50+ articles",
            },
        ],
        bg: "base-200",
    },
    {
        type: "faq",
        kicker: "COMMON QUESTIONS",
        heading: "Before You Reach Out",
        items: [
            {
                question: "How do I update my profile or resume?",
                answer: "Log in to your account and navigate to your Profile page. You can update your resume, skills, experience, and preferences at any time. Changes are reflected immediately to recruiters.",
            },
            {
                question: "Why haven't I heard back about my application?",
                answer: "Application timelines vary by company. You can check the status of all your applications in your dashboard. If an application has been in the same stage for more than 2 weeks, consider reaching out to the recruiter directly through our messaging feature.",
            },
            {
                question: "Is Applicant Network really free for candidates?",
                answer: "Yes, 100% free. We are funded by recruiting fees paid by hiring companies. Candidates never pay anything — no hidden costs, no premium tiers.",
            },
            {
                question: "How do I delete my account?",
                answer: 'Go to Profile > Settings > Account and click "Delete Account." This will remove your profile and all associated data within 30 days. You can also email support@applicant.network for assistance.',
            },
        ],
        bg: "base-100",
    },
    {
        type: "cta",
        heading: "Still Need Help?",
        subtitle: "Our support team is here for you. Reach out anytime.",
        buttons: [
            {
                label: "Email Support",
                href: "mailto:support@applicant.network",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-envelope",
            },
            { label: "Visit Help Center", href: "/help", variant: "outline" },
        ],
        contactEmail: "support@applicant.network",
        bg: "neutral",
    },
];

export const candidateContact = {
    slug: "contact",
    app: "candidate" as const,
    title: "Contact Us | Applicant Network",
    description:
        "Get in touch with the Applicant Network team. Questions about jobs, applications, or your profile? We're here to help you land your next role.",
    category: "marketing",
    author: "Applicant Network",
    status: "published" as const,
    published_at: "2026-01-15T00:00:00Z",
    blocks,
};
