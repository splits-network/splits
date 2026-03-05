import type { PanelStat } from "./panel-header";

export const data = {
    /* ── Header ─────────────────────────────────────────────────── */
    name: "Alex Chen",
    initials: "AC",
    currentTitle: "Senior Software Engineer",
    currentCompany: "Meridian Technologies",
    verificationStatus: "verified" as const,
    isNew: true,

    /* ── Contact ────────────────────────────────────────────────── */
    email: "alex.chen@email.com",
    phone: "+1 (512) 555-0147",
    location: "Austin, TX",

    /* ── Social Links ───────────────────────────────────────────── */
    linkedinUrl: "https://linkedin.com/in/alexchen",
    githubUrl: "https://github.com/alexchen",
    portfolioUrl: "https://alexchen.dev",

    /* ── Stats ──────────────────────────────────────────────────── */
    stats: [
        { label: "Applied", value: "12", icon: "fa-duotone fa-regular fa-paper-plane" },
        { label: "Interviews", value: "5", icon: "fa-duotone fa-regular fa-comments" },
        { label: "Placed", value: "1", icon: "fa-duotone fa-regular fa-trophy" },
        { label: "Skills", value: "14", icon: "fa-duotone fa-regular fa-code" },
    ] as PanelStat[],

    /* ── Bio ─────────────────────────────────────────────────────── */
    bio: "Senior software engineer with 7 years of experience building distributed systems. Passionate about clean architecture, developer tooling, and mentoring junior engineers. Most recently led the migration of a monolithic Rails app to a TypeScript microservices architecture serving 2M+ daily requests.",

    /* ── Career Preferences ─────────────────────────────────────── */
    desiredSalaryMin: 170000,
    desiredSalaryMax: 210000,
    desiredJobType: "full_time",
    availability: "two_weeks",
    openToRemote: true,
    openToRelocation: false,

    /* ── Skills ──────────────────────────────────────────────────── */
    skills: [
        "TypeScript", "React", "Node.js", "PostgreSQL",
        "AWS", "Docker", "Kubernetes", "Redis",
        "GraphQL", "Terraform", "Python", "Go",
        "CI/CD", "System Design",
    ],

    /* ── Profile Status ─────────────────────────────────────────── */
    hasActiveRelationship: true,
    hasPendingInvitation: false,
    hasOtherActiveRecruiters: false,
    marketplaceVisibility: "public" as const,
    onboardingStatus: "complete",
    createdAt: "2025-03-15T10:30:00Z",

    /* ── Achievements ───────────────────────────────────────────── */
    badges: [
        { name: "Profile Complete", icon: "fa-duotone fa-regular fa-user-check", tier: "gold" },
        { name: "Skill Master", icon: "fa-duotone fa-regular fa-wand-magic-sparkles", tier: "silver" },
        { name: "Quick Responder", icon: "fa-duotone fa-regular fa-bolt", tier: "bronze" },
    ],

    /* ── Applications (for Applications tab) ────────────────────── */
    applications: [
        {
            id: "app-1",
            jobTitle: "Senior Full-Stack Engineer",
            companyName: "TechCorp Solutions",
            status: "Interview",
        },
        {
            id: "app-2",
            jobTitle: "Staff Engineer",
            companyName: "CloudScale Inc",
            status: "Applied",
        },
        {
            id: "app-3",
            jobTitle: "Engineering Lead",
            companyName: "DataStream Analytics",
            status: "Offer",
        },
    ],

    /* ── Documents (for Documents tab) ──────────────────────────── */
    resumeName: "alex-chen-resume-2026.pdf",
    certifications: ["AWS Solutions Architect", "Kubernetes Administrator"],
};
