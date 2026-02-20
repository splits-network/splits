import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "CAREER RESOURCES",
        kickerIcon: "fa-duotone fa-regular fa-graduation-cap",
        headlineWords: [
            { text: "Expert" },
            { text: "Career", accent: true },
            { text: "Guides" },
        ],
        subtitle:
            "Actionable career guides to help you grow, switch roles, and negotiate offers. Expert advice for every stage of your career journey.",
        meta: [
            { icon: "fa-duotone fa-regular fa-clock", label: "8 min read" },
            {
                icon: "fa-duotone fa-regular fa-tag",
                label: "Career Development",
            },
        ],
    },
    {
        type: "article-body",
        sectionNumber: "01",
        kicker: "KNOW YOUR WORTH",
        kickerColor: "primary",
        heading: "Research Your Market Value",
        paragraphs: [
            "Understanding your market value is the foundation of every career decision — from negotiating a raise to evaluating a new offer. The job market moves fast, and what you were worth two years ago may not reflect your value today.",
            "Start with compensation data from platforms like Glassdoor, Levels.fyi, and industry-specific salary surveys. <strong>Look beyond base salary</strong> — factor in equity, bonuses, benefits, remote flexibility, and growth trajectory. A lower-base offer with strong equity and advancement potential may outperform a higher-base role at a stagnant company.",
            "Talk to recruiters, even when you're not actively looking. They have real-time market intelligence and can benchmark your compensation against current offers in your space.",
        ],
        bg: "base-100",
    },
    {
        type: "split-editorial",
        sectionNumber: "02",
        kicker: "NETWORKING",
        heading: "Build Relationships Before You Need Them",
        paragraphs: [
            "The best career opportunities rarely come from job boards. They come from relationships built over time. Invest in your network before you need it.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-handshake",
                title: "Be Generous First",
                body: "Offer introductions, share knowledge, and help others before asking for anything in return.",
            },
            {
                icon: "fa-duotone fa-regular fa-calendar",
                title: "Stay Consistent",
                body: "Set a reminder to reach out to 2-3 contacts per week. Coffee chats, LinkedIn messages, or quick check-ins all count.",
            },
            {
                icon: "fa-duotone fa-regular fa-bullhorn",
                title: "Share Your Work",
                body: "Write about what you're learning, present at meetups, or contribute to open-source. Visibility creates opportunity.",
            },
        ],
        image: "/images/content/networking-career.jpg",
        imageAlt: "Professionals networking at an industry event",
        layout: "text-left",
        bg: "base-200",
    },
    {
        type: "article-body",
        sectionNumber: "03",
        kicker: "INTERVIEWING",
        kickerColor: "secondary",
        heading: "Master the Interview Process",
        paragraphs: [
            "Interviewing is a skill, not a talent. The candidates who land the best roles practice systematically and prepare differently for each stage.",
            "<strong>Phone screens:</strong> Keep answers concise (60-90 seconds). Focus on relevance to the role. Have 3 strong stories ready that demonstrate impact.",
            "<strong>Technical rounds:</strong> Practice out loud. Whether it's coding, case studies, or portfolio reviews — rehearse the format, not just the content. Time yourself.",
            "<strong>Final rounds:</strong> This is where culture fit and leadership questions dominate. Prepare questions that show you've researched the company's challenges and have opinions about how to solve them.",
        ],
        bg: "base-100",
    },
    {
        type: "pull-quote",
        quote: "The candidates who get offers aren't always the most experienced — they're the ones who prepare the most deliberately.",
        citation: "Career Coach Sarah Park",
        bg: "neutral",
        style: "left-border",
    },
    {
        type: "article-body",
        sectionNumber: "04",
        kicker: "NEGOTIATION",
        kickerColor: "accent",
        heading: "Negotiate Like a Pro",
        paragraphs: [
            "Most candidates leave money on the table because they don't negotiate — or they negotiate too early. The key is timing and preparation.",
            "<strong>Wait for the offer before discussing numbers.</strong> If asked for salary expectations early, deflect: \"I'd like to learn more about the role before discussing compensation.\" This gives you leverage once they've decided they want you.",
            'When the offer comes, don\'t accept immediately. Express enthusiasm, ask for 48 hours to review, and come back with a specific, justified counter. "Based on my research and the scope of this role, I\'d be looking for $X" is stronger than "Can you do better?"',
            "Remember: negotiation isn't adversarial. Companies expect it. Recruiters on Applicant Network can coach you through this process — it's one of the key benefits of having a dedicated recruiter in your corner.",
        ],
        bg: "base-200",
    },
    {
        type: "feature-grid",
        kicker: "MORE RESOURCES",
        heading: "Continue Your Career Journey",
        columns: 3,
        items: [
            {
                icon: "fa-duotone fa-regular fa-file-lines",
                title: "Resume Tips",
                description:
                    "Craft a resume that gets past ATS filters and catches recruiter attention.",
                badge: "Popular",
            },
            {
                icon: "fa-duotone fa-regular fa-money-bill-wave",
                title: "Salary Insights",
                description:
                    "Up-to-date compensation data across industries and roles.",
            },
            {
                icon: "fa-duotone fa-regular fa-people-group",
                title: "Interview Prep",
                description:
                    "Practice questions, frameworks, and tips for every interview format.",
            },
        ],
        bg: "base-100",
    },
    {
        type: "cta",
        heading: "Put These Tips Into Action",
        subtitle:
            "Create your free Applicant Network profile and connect with recruiters who can accelerate your career.",
        buttons: [
            {
                label: "Get Started Free",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-rocket",
            },
            {
                label: "Browse More Resources",
                href: "/resources",
                variant: "outline",
            },
        ],
        bg: "primary",
    },
];

export const candidateCareerGuides = {
    slug: "resources/career-guides",
    app: "candidate" as const,
    title: "Career Guides | Applicant Network",
    description:
        "Actionable career guides to help you grow, switch roles, and negotiate offers. Expert advice for every stage of your career journey.",
    category: "resource",
    author: "Applicant Network",
    read_time: "8 min read",
    status: "published" as const,
    published_at: "2026-01-20T00:00:00Z",
    blocks,
};
