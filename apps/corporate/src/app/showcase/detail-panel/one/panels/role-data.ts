/* ─── Mock Data: Role/Job Detail Panel ──────────────────────────────── */

export const data = {
    /* Header */
    companyName: "TechCorp Solutions",
    companyInitials: "TC",
    companyIndustry: "Enterprise Software",
    companyHQ: "San Francisco, CA",
    companyDescription:
        "TechCorp builds developer infrastructure tools used by over 10,000 engineering teams worldwide. Our platform simplifies CI/CD, monitoring, and deployment workflows.",
    companyWebsite: "https://techcorp.io",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    status: "active" as const,
    employmentType: "Full Time",
    jobLevel: "Senior",
    isNew: true,
    feePercentage: 20,
    salaryMin: 180000,
    salaryMax: 220000,
    salaryDisplay: "$180K - $220K",
    guaranteeDays: 90,
    applicationCount: 34,
    openToRelocation: true,
    commute: "Hybrid (2 days), Remote",

    /* Stats for PanelHeader */
    stats: [
        { label: "Compensation", value: "$180-220K", icon: "fa-duotone fa-regular fa-dollar-sign" },
        { label: "Fee", value: "20%", icon: "fa-duotone fa-regular fa-handshake" },
        { label: "Candidates", value: "34", icon: "fa-duotone fa-regular fa-users" },
    ],

    /* Recruiter Brief tab */
    recruiterDescription:
        "We need a senior full-stack engineer who can own features end-to-end. The ideal candidate has shipped production React + Node.js applications at scale and is comfortable with infrastructure-as-code. This role reports to the VP of Engineering and will lead a squad of 3-4 engineers.",
    candidateDescription:
        "Join our platform team and help build the next generation of developer tools. You will work across the entire stack -- from React interfaces to Node.js microservices -- shipping features used by thousands of engineering teams daily. We value clean architecture, strong testing practices, and clear communication.",

    /* Requirements */
    mandatoryRequirements: [
        { id: "r1", description: "5+ years of professional full-stack development experience" },
        { id: "r2", description: "Strong proficiency with React/TypeScript and Node.js" },
        { id: "r3", description: "Experience designing and operating PostgreSQL databases at scale" },
        { id: "r4", description: "Comfortable owning features from design through deployment" },
    ],
    preferredRequirements: [
        { id: "r5", description: "Experience with Kubernetes and container orchestration" },
        { id: "r6", description: "Familiarity with CI/CD pipeline design (GitHub Actions, CircleCI)" },
        { id: "r7", description: "Background in developer tooling or infrastructure products" },
    ],

    /* Skills */
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    preferredSkills: ["Kubernetes", "Terraform", "Redis", "GraphQL"],

    /* Company tab: team members */
    teamMembers: [
        { name: "David Kim", email: "david.kim@techcorp.io", role: "VP of Engineering", initials: "DK" },
        { name: "Priya Sharma", email: "priya.s@techcorp.io", role: "Engineering Manager", initials: "PS" },
        { name: "Marcus Lee", email: "marcus.l@techcorp.io", role: "Tech Lead", initials: "ML" },
    ],
};
