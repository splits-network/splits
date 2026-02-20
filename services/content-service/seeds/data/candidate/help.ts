import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "HELP CENTER",
        kickerIcon: "fa-duotone fa-regular fa-circle-question",
        headlineWords: [
            { text: "How" },
            { text: "Can" },
            { text: "We", accent: true },
            { text: "Help?" },
        ],
        subtitle:
            "Find answers to common questions about your account, applications, and the job search process.",
    },
    {
        type: "feature-grid",
        kicker: "BROWSE BY TOPIC",
        heading: "Popular Help Topics",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-user",
                title: "Your Profile",
                description:
                    "Set up, edit, and optimize your candidate profile to attract the right opportunities.",
                badge: "Popular",
            },
            {
                icon: "fa-duotone fa-regular fa-paper-plane",
                title: "Applications",
                description:
                    "Track application status, understand stages, and know what to expect at each step.",
            },
            {
                icon: "fa-duotone fa-regular fa-magnifying-glass",
                title: "Job Search",
                description:
                    "Tips on using filters, saving searches, and getting the most relevant results.",
            },
            {
                icon: "fa-duotone fa-regular fa-messages",
                title: "Messaging",
                description:
                    "How to communicate with recruiters, respond to outreach, and manage conversations.",
            },
            {
                icon: "fa-duotone fa-regular fa-shield-check",
                title: "Privacy & Security",
                description:
                    "Control who sees your profile, manage data preferences, and stay safe online.",
            },
            {
                icon: "fa-duotone fa-regular fa-file-lines",
                title: "Resume & Documents",
                description:
                    "Upload, manage, and share your resume and supporting documents.",
            },
        ],
        bg: "base-200",
    },
    {
        type: "faq",
        kicker: "FAQ",
        heading: "Frequently Asked Questions",
        items: [
            {
                question: "How do I create an account?",
                answer: 'Click "Sign Up" from any page and follow the guided setup. You\'ll need an email address and a few minutes to complete your profile. We recommend uploading your resume during signup for the best experience.',
            },
            {
                question: "How do I apply for a job?",
                answer: 'Browse jobs in the marketplace, click on a listing that interests you, and hit "Apply." Your profile and resume are automatically shared with the recruiter. You can add a cover note before submitting.',
            },
            {
                question:
                    "Can recruiters see my profile without my permission?",
                answer: "Your profile visibility is controlled by you. By default, only recruiters you've interacted with can see your full profile. You can adjust this in Profile > Privacy Settings.",
            },
            {
                question: "How do I know if a recruiter is legitimate?",
                answer: 'All recruiters on Applicant Network are verified during onboarding. Look for the "Verified" badge on their profile. You can also see ratings and reviews from other candidates.',
            },
            {
                question: "What happens after I apply?",
                answer: "Your application is sent to the recruiter managing that role. They'll review it and either advance you to the next stage or provide feedback. You can track every application in your dashboard.",
            },
            {
                question: "How do I update my job preferences?",
                answer: "Go to Profile > Job Preferences to update your desired role type, location, salary range, and industry. Recruiters use these preferences to match you with relevant opportunities.",
            },
            {
                question: "Is my data secure?",
                answer: "Yes. We use industry-standard encryption for all data in transit and at rest. We never sell your data to third parties. See our Privacy Policy for full details.",
            },
            {
                question: "How do I contact support?",
                answer: "Email support@applicant.network or use the in-app chat feature. Our team typically responds within 4 hours during business days.",
            },
        ],
        bg: "base-100",
    },
    {
        type: "cta",
        heading: "Didn't Find What You're Looking For?",
        subtitle: "Our support team is happy to help with any question.",
        buttons: [
            {
                label: "Contact Support",
                href: "/contact",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-envelope",
            },
        ],
        contactEmail: "support@applicant.network",
        bg: "primary",
    },
];

export const candidateHelp = {
    slug: "help",
    app: "candidate" as const,
    title: "Help Center | Applicant Network",
    description:
        "Get help with Applicant Network. Find answers to common questions about jobs, applications, profiles, and more.",
    category: "resource",
    author: "Applicant Network",
    status: "published" as const,
    published_at: "2026-01-15T00:00:00Z",
    blocks,
};
