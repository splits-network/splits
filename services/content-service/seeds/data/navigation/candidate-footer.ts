import type { FooterNavConfig } from "@splits-network/shared-types";

export const candidateFooterNav = {
    app: "candidate" as const,
    location: "footer" as const,
    config: {
        sections: [
            {
                title: "Platform",
                links: [
                    { label: "Browse Jobs", href: "/jobs" },
                    { label: "How It Works", href: "/how-it-works" },
                    { label: "Find a Recruiter", href: "/marketplace" },
                    { label: "Help Center", href: "/help" },
                    { label: "System Status", href: "/status" },
                ],
            },
            {
                title: "Resources",
                links: [
                    {
                        label: "Career Guides",
                        href: "/resources/career-guides",
                    },
                    { label: "Resume Tips", href: "/resources/resume-tips" },
                    {
                        label: "Interview Prep",
                        href: "/resources/interview-prep",
                    },
                    {
                        label: "Salary Insights",
                        href: "/resources/salary-insights",
                    },
                    {
                        label: "Industry Trends",
                        href: "/resources/industry-trends",
                    },
                ],
            },
            {
                title: "Company",
                links: [
                    { label: "About Us", href: "/about" },
                    { label: "Contact", href: "/contact" },
                    { label: "For Recruiters", href: "/for-recruiters" },
                    {
                        label: "Splits Network",
                        href: "https://splits.network",
                        external: true,
                    },
                ],
            },
            {
                title: "Legal",
                links: [
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Terms of Service", href: "/terms-of-service" },
                    { label: "Cookie Policy", href: "/cookie-policy" },
                ],
            },
        ],
        socialLinks: [
            {
                icon: "fa-brands fa-linkedin-in",
                href: "https://linkedin.com",
                label: "LinkedIn",
            },
            {
                icon: "fa-brands fa-x-twitter",
                href: "https://twitter.com",
                label: "X / Twitter",
            },
            {
                icon: "fa-brands fa-facebook",
                href: "https://facebook.com",
                label: "Facebook",
            },
            {
                icon: "fa-brands fa-instagram",
                href: "https://instagram.com",
                label: "Instagram",
            },
        ],
        trustStats: [
            { value: "2,847", label: "Recruiters" },
            { value: "518", label: "Companies" },
            { value: "12,340", label: "Candidates" },
            { value: "$42M+", label: "In Placements" },
        ],
        legalLinks: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms-of-service" },
            { label: "Cookie Policy", href: "/cookie-policy" },
        ],
    } satisfies FooterNavConfig,
};
