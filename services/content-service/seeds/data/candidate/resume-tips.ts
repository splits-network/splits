import type { ContentBlock } from "@splits-network/shared-types";

const blocks: ContentBlock[] = [
    {
        type: "hero",
        kicker: "RESUME GUIDE",
        kickerIcon: "fa-duotone fa-regular fa-file-lines",
        headlineWords: [
            { text: "Craft" },
            { text: "a" },
            { text: "Standout", accent: true },
            { text: "Resume" },
        ],
        subtitle:
            "Expert resume tips and strategies to craft a compelling resume that gets interviews. Learn formatting, quantifying achievements, and tailoring for each role.",
        meta: [
            { icon: "fa-duotone fa-regular fa-clock", label: "6 min read" },
            { icon: "fa-duotone fa-regular fa-tag", label: "Resume Writing" },
        ],
    },
    {
        type: "article-body",
        sectionNumber: "01",
        kicker: "THE BASICS",
        kickerColor: "primary",
        heading: "Format for Humans and Machines",
        paragraphs: [
            "Your resume needs to pass two gates: the Applicant Tracking System (ATS) and the human reviewer. Most candidates optimize for one and fail the other.",
            "<strong>For ATS:</strong> Use standard section headings (Experience, Education, Skills). Avoid tables, columns, headers/footers, and images. Use a clean .docx or .pdf format. Include keywords from the job description naturally in your experience bullets.",
            "<strong>For humans:</strong> Lead with impact, not duties. A recruiter spends 7 seconds on a first scan — make those seconds count with quantified achievements at the top of each role.",
        ],
        bg: "base-100",
    },
    {
        type: "stats-bar",
        stats: [
            { value: "7 sec", label: "Avg. Resume Scan Time" },
            { value: "75%", label: "Filtered by ATS" },
            {
                value: "2 pages",
                label: "Ideal Length",
                borderColor: "border-accent",
            },
            { value: "40%", label: "More Interviews with Metrics" },
        ],
        bg: "neutral",
    },
    {
        type: "article-body",
        sectionNumber: "02",
        kicker: "QUANTIFY IMPACT",
        kickerColor: "secondary",
        heading: "Show Results, Not Responsibilities",
        paragraphs: [
            "The single most impactful change you can make to your resume is replacing task descriptions with measurable outcomes.",
            '<strong>Before:</strong> "Managed social media accounts and created content."',
            '<strong>After:</strong> "Grew Instagram following from 5K to 45K in 8 months, driving a 3x increase in inbound leads and $120K in attributed revenue."',
            "Use the <strong>XYZ formula</strong>: Accomplished [X] as measured by [Y], by doing [Z]. Not every bullet needs a dollar figure — percentages, time saved, team size, and scale all work.",
        ],
        bg: "base-200",
    },
    {
        type: "split-editorial",
        sectionNumber: "03",
        kicker: "TAILORING",
        heading: "One Resume Does Not Fit All",
        paragraphs: [
            "The most effective candidates maintain a master resume and tailor it for each application. It takes 15 minutes and dramatically increases your response rate.",
        ],
        items: [
            {
                icon: "fa-duotone fa-regular fa-bullseye",
                title: "Match Keywords",
                body: 'Mirror the language from the job description in your experience bullets. If they say "cross-functional collaboration," use that exact phrase.',
            },
            {
                icon: "fa-duotone fa-regular fa-arrow-up-right",
                title: "Reorder Bullets",
                body: "Put the most relevant experience for each role at the top. Your best bullet should always come first.",
            },
            {
                icon: "fa-duotone fa-regular fa-pen",
                title: "Adjust Your Summary",
                body: "Your 2-3 sentence professional summary should speak directly to the role. Generic summaries get ignored.",
            },
        ],
        image: "/images/content/resume-tailoring.jpg",
        imageAlt: "Person customizing their resume on a laptop",
        layout: "text-left",
        bg: "base-100",
    },
    {
        type: "pull-quote",
        quote: "A tailored resume takes 15 minutes to customize but makes you 3x more likely to land an interview. It's the highest-ROI activity in any job search.",
        citation: "Applicant Network Recruiting Team",
        bg: "neutral",
        style: "left-border",
    },
    {
        type: "article-body",
        sectionNumber: "04",
        kicker: "COMMON MISTAKES",
        kickerColor: "accent",
        heading: "What to Avoid",
        paragraphs: [
            "<strong>Objective statements</strong> — Replace with a professional summary that highlights your value proposition.",
            '<strong>"References available upon request"</strong> — Everyone knows this. It wastes space.',
            "<strong>Irrelevant experience</strong> — That summer job from 10 years ago doesn't help. Focus on the last 10-15 years of relevant work.",
            "<strong>Spelling and grammar errors</strong> — An instant rejection for many recruiters. Use Grammarly or have someone proofread.",
            "<strong>Dense paragraphs</strong> — Use bullet points, white space, and clear section breaks. Readability matters.",
        ],
        bg: "base-200",
    },
    {
        type: "cta",
        heading: "Ready to Update Your Resume?",
        subtitle:
            "Upload your new resume to Applicant Network and start getting matched with the right opportunities.",
        buttons: [
            {
                label: "Upload Resume",
                href: "/sign-up",
                variant: "primary",
                icon: "fa-duotone fa-regular fa-cloud-arrow-up",
            },
            {
                label: "Browse Career Guides",
                href: "/resources/career-guides",
                variant: "outline",
            },
        ],
        bg: "primary",
    },
];

export const candidateResumeTips = {
    slug: "resources/resume-tips",
    app: "candidate" as const,
    title: "Resume Tips | Applicant Network",
    description:
        "Expert resume tips and strategies to craft a compelling resume that gets interviews. Learn formatting, quantifying achievements, and tailoring for each role.",
    category: "resource",
    author: "Applicant Network",
    read_time: "6 min read",
    status: "published" as const,
    published_at: "2026-01-25T00:00:00Z",
    blocks,
};
