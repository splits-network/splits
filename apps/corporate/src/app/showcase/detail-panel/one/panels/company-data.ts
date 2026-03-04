import type { PanelStat } from "./panel-header";

export const data = {
    /* ── Header ─────────────────────────────────────────────────── */
    name: "TechCorp Solutions",
    initials: "TC",
    industry: "Enterprise Software",
    companySize: "201-500",
    headquartersLocation: "San Francisco, CA",
    logoUrl: undefined as string | undefined,

    /* ── Stats ──────────────────────────────────────────────────── */
    stats: [
        { label: "Open Roles", value: "12", icon: "fa-duotone fa-regular fa-briefcase" },
        { label: "Stage", value: "Series B", icon: "fa-duotone fa-regular fa-rocket" },
        { label: "Founded", value: "2018", icon: "fa-duotone fa-regular fa-calendar" },
        { label: "Avg Salary", value: "$145k", icon: "fa-duotone fa-regular fa-dollar-sign" },
    ] as PanelStat[],

    /* ── Tagline & Description ──────────────────────────────────── */
    tagline: "Building the developer infrastructure that powers 10,000+ engineering teams worldwide",
    description:
        "TechCorp Solutions builds developer infrastructure tools used by over 10,000 engineering teams worldwide. Our platform simplifies CI/CD, monitoring, and deployment workflows. We are committed to developer experience and believe great tools make great teams.",

    /* ── Social Links ───────────────────────────────────────────── */
    website: "techcorp.io",
    linkedinUrl: "https://linkedin.com/company/techcorp",
    twitterUrl: "https://x.com/techcorp",
    glassdoorUrl: "https://glassdoor.com/techcorp",

    /* ── Tech Stack ─────────────────────────────────────────────── */
    techStack: [
        "TypeScript", "React", "Node.js", "PostgreSQL",
        "Kubernetes", "Terraform", "Go", "Redis",
    ],

    /* ── Perks & Benefits ───────────────────────────────────────── */
    perks: [
        "Remote-First", "Equity", "401(k) Match",
        "Unlimited PTO", "Learning Budget", "Home Office Stipend",
    ],

    /* ── Culture & Values ───────────────────────────────────────── */
    cultureTags: [
        "Innovation", "Transparency", "Work-Life Balance",
        "Diversity", "Open Source", "Continuous Learning",
    ],

    /* ── Company Details ────────────────────────────────────────── */
    stage: "Series B",
    foundedYear: 2018,
    openRolesCount: 12,
    avgSalary: 145000,

    /* ── Relationship (recruiter context) ───────────────────────── */
    relationship: {
        status: "active" as const,
        relationshipType: "recruiter" as const,
        canManageCompanyJobs: true,
        startDate: "2025-06-01",
    },

    /* ── Achievements ───────────────────────────────────────────── */
    badges: [
        { name: "Top Employer", icon: "fa-duotone fa-regular fa-building", tier: "gold" },
        { name: "Fast Hiring", icon: "fa-duotone fa-regular fa-bolt", tier: "silver" },
    ],

    /* ── Team Contacts ──────────────────────────────────────────── */
    contacts: [
        { name: "Jennifer Park", role: "VP Engineering", email: "jen.park@techcorp.io" },
        { name: "Michael Torres", role: "Hiring Manager", email: "m.torres@techcorp.io" },
        { name: "Rachel Kim", role: "Talent Lead", email: "r.kim@techcorp.io" },
    ],

    /* ── Open Roles (for Roles tab) ─────────────────────────────── */
    roles: [
        { title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", salary: "$160k-$200k" },
        { title: "DevOps Lead", department: "Infrastructure", location: "SF, CA", salary: "$180k-$220k" },
        { title: "Product Manager", department: "Product", location: "NYC, NY", salary: "$150k-$190k" },
        { title: "Staff Backend Engineer", department: "Engineering", location: "Remote", salary: "$190k-$240k" },
    ],
};
