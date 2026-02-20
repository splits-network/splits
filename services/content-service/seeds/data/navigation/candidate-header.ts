import type { HeaderNavConfig } from "@splits-network/shared-types";

export const candidateHeaderNav = {
    app: "candidate" as const,
    location: "header" as const,
    config: {
        items: [
            {
                label: "How It Works",
                href: "/how-it-works",
            },
            {
                label: "Find Jobs",
                href: "/jobs",
            },
            {
                label: "Resources",
                subItems: [
                    {
                        label: "Career Guides",
                        href: "/resources/career-guides",
                        icon: "fa-duotone fa-regular fa-book",
                        desc: "Actionable career advice",
                    },
                    {
                        label: "Salary Insights",
                        href: "/resources/salary-insights",
                        icon: "fa-duotone fa-regular fa-chart-line",
                        desc: "Compensation data",
                    },
                    {
                        label: "Interview Prep",
                        href: "/resources/interview-prep",
                        icon: "fa-duotone fa-regular fa-user-tie",
                        desc: "Practice and frameworks",
                    },
                    {
                        label: "Success Stories",
                        href: "/resources/success-stories",
                        icon: "fa-duotone fa-regular fa-star",
                        desc: "Real candidate journeys",
                    },
                    {
                        label: "Resume Tips",
                        href: "/resources/resume-tips",
                        icon: "fa-duotone fa-regular fa-file-alt",
                        desc: "Stand out to recruiters",
                    },
                    {
                        label: "Industry Trends",
                        href: "/resources/industry-trends",
                        icon: "fa-duotone fa-regular fa-display-chart-up",
                        desc: "Market intelligence",
                    },
                ],
            },
            {
                label: "Find a Recruiter",
                href: "/marketplace",
            },
            {
                label: "Companies",
                subItems: [
                    {
                        label: "Browse All Companies",
                        href: "/companies",
                        icon: "fa-duotone fa-regular fa-building",
                        desc: "Explore employers",
                    },
                    {
                        label: "Featured Employers",
                        href: "/companies/featured",
                        icon: "fa-duotone fa-regular fa-crown",
                        desc: "Top companies hiring",
                    },
                    {
                        label: "Company Reviews",
                        href: "/companies/reviews",
                        icon: "fa-duotone fa-regular fa-star",
                        desc: "Employee feedback",
                    },
                ],
            },
        ],
    } satisfies HeaderNavConfig,
};
