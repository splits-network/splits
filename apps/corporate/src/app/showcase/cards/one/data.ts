/* ─── Role Card ──────────────────────────────────────────────────────────── */

export interface RoleCardData {
    title: string;
    company: string;
    companyInitials: string;
    location: string;
    salary: string;
    splitFee: string;
    urgency: "low" | "normal" | "high" | "urgent";
    employmentType: "Full-Time" | "Contract" | "Contract-to-Hire";
    experienceLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Executive";
    postedDate: string;
    deadline: string;
    applicantCount: number;
    tags: string[];
    industry: string;
    remote: boolean;
    description: string;
    featured: boolean;
}

export const SAMPLE_ROLES: RoleCardData[] = [
    {
        title: "Staff Backend Engineer",
        company: "Meridian Financial",
        companyInitials: "MF",
        location: "New York, NY",
        salary: "$210k-$260k",
        splitFee: "22%",
        urgency: "high",
        employmentType: "Full-Time",
        experienceLevel: "Senior",
        postedDate: "2026-02-18",
        deadline: "2026-03-28",
        applicantCount: 17,
        tags: ["Go", "Kubernetes", "PostgreSQL", "gRPC"],
        industry: "Financial Services",
        remote: false,
        description:
            "Architect and scale the core ledger platform serving 2M+ daily transactions. Reports directly to VP Engineering.",
        featured: true,
    },
    {
        title: "VP of Product",
        company: "Canopy Health",
        companyInitials: "CH",
        location: "Remote US",
        salary: "$240k-$300k",
        splitFee: "25%",
        urgency: "urgent",
        employmentType: "Full-Time",
        experienceLevel: "Executive",
        postedDate: "2026-02-24",
        deadline: "2026-03-14",
        applicantCount: 8,
        tags: ["Product Strategy", "Healthcare", "B2B SaaS"],
        industry: "Healthcare Technology",
        remote: true,
        description:
            "Lead a 40-person product org through SOC 2 compliance and enterprise expansion. Series C, $120M raised.",
        featured: true,
    },
    {
        title: "Senior Data Engineer",
        company: "Lumen Analytics",
        companyInitials: "LA",
        location: "Austin, TX",
        salary: "$175k-$210k",
        splitFee: "20%",
        urgency: "normal",
        employmentType: "Full-Time",
        experienceLevel: "Senior",
        postedDate: "2026-02-10",
        deadline: "2026-04-10",
        applicantCount: 24,
        tags: ["Spark", "Python", "Snowflake", "dbt"],
        industry: "Data & Analytics",
        remote: false,
        description:
            "Build and maintain the real-time data pipeline powering analytics for 300+ enterprise clients.",
        featured: false,
    },
];

/* ─── Candidate Card ─────────────────────────────────────────────────────── */

export interface CandidateCardData {
    name: string;
    initials: string;
    currentTitle: string;
    currentCompany: string;
    location: string;
    experience: string;
    status: "Active" | "Passive" | "Not Looking";
    availability: "Immediate" | "2 Weeks" | "30 Days" | "60+ Days";
    skills: string[];
    industries: string[];
    desiredSalary: string;
    desiredRoles: string[];
    bio: string;
    relocatable: boolean;
    remoteOnly: boolean;
}

export const SAMPLE_CANDIDATES: CandidateCardData[] = [
    {
        name: "Jordan Reeves",
        initials: "JR",
        currentTitle: "Senior Software Engineer",
        currentCompany: "Stripe",
        location: "Seattle, WA",
        experience: "9 years",
        status: "Passive",
        availability: "30 Days",
        skills: ["TypeScript", "React", "Node.js", "AWS", "System Design"],
        industries: ["Fintech", "Payments", "SaaS"],
        desiredSalary: "$220k-$260k",
        desiredRoles: ["Staff Engineer", "Principal Engineer"],
        bio: "Full-stack generalist with deep payments infrastructure experience. Led the team that built Stripe's reconciliation engine.",
        relocatable: true,
        remoteOnly: false,
    },
    {
        name: "Amara Osei",
        initials: "AO",
        currentTitle: "Product Manager",
        currentCompany: "Figma",
        location: "San Francisco, CA",
        experience: "6 years",
        status: "Active",
        availability: "2 Weeks",
        skills: ["Product Strategy", "User Research", "SQL", "A/B Testing"],
        industries: ["Developer Tools", "Design", "SaaS"],
        desiredSalary: "$190k-$230k",
        desiredRoles: ["Senior PM", "Group PM", "Director of Product"],
        bio: "Shipped collaboration features used by 4M+ designers. Looking for a role where product decisions have direct revenue impact.",
        relocatable: false,
        remoteOnly: true,
    },
    {
        name: "Daniel Kovacs",
        initials: "DK",
        currentTitle: "Engineering Manager",
        currentCompany: "Datadog",
        location: "Boston, MA",
        experience: "11 years",
        status: "Active",
        availability: "Immediate",
        skills: ["People Management", "Go", "Distributed Systems", "Observability"],
        industries: ["Infrastructure", "DevOps", "Enterprise SaaS"],
        desiredSalary: "$250k-$300k",
        desiredRoles: ["Director of Engineering", "VP Engineering"],
        bio: "Managed 3 teams across 2 time zones. Scaled the alerting platform from 10K to 500K monitored hosts.",
        relocatable: true,
        remoteOnly: false,
    },
];

/* ─── Application Card ───────────────────────────────────────────────────── */

export interface ApplicationCardData {
    candidateName: string;
    candidateInitials: string;
    roleTitle: string;
    company: string;
    submittedDate: string;
    status: "Submitted" | "Screening" | "Interview" | "Offer" | "Placed" | "Rejected";
    matchScore: number;
    submittedBy: string;
    splitAgreed: string;
    notes: string;
    stage: number;
    totalStages: number;
    lastActivity: string;
}

export const SAMPLE_APPLICATIONS: ApplicationCardData[] = [
    {
        candidateName: "Jordan Reeves",
        candidateInitials: "JR",
        roleTitle: "Staff Backend Engineer",
        company: "Meridian Financial",
        submittedDate: "2026-02-20",
        status: "Interview",
        matchScore: 92,
        submittedBy: "Sarah Kim",
        splitAgreed: "22%",
        notes: "Passed technical screen. Final round with CTO scheduled for March 5.",
        stage: 3,
        totalStages: 5,
        lastActivity: "2026-02-28",
    },
    {
        candidateName: "Amara Osei",
        candidateInitials: "AO",
        roleTitle: "VP of Product",
        company: "Canopy Health",
        submittedDate: "2026-02-25",
        status: "Screening",
        matchScore: 85,
        submittedBy: "Marcus Johnson",
        splitAgreed: "25%",
        notes: "Strong product background. Hiring manager reviewing portfolio this week.",
        stage: 2,
        totalStages: 5,
        lastActivity: "2026-03-01",
    },
    {
        candidateName: "Daniel Kovacs",
        candidateInitials: "DK",
        roleTitle: "Director of Engineering",
        company: "Vantage Cloud",
        submittedDate: "2026-02-12",
        status: "Offer",
        matchScore: 94,
        submittedBy: "Priya Patel",
        splitAgreed: "20%",
        notes: "Offer extended at $285k base + equity. Candidate reviewing terms.",
        stage: 4,
        totalStages: 5,
        lastActivity: "2026-03-02",
    },
];

/* ─── Placement Card ─────────────────────────────────────────────────────── */

export interface PlacementCardData {
    candidateName: string;
    candidateInitials: string;
    roleTitle: string;
    company: string;
    companyInitials: string;
    startDate: string;
    salary: string;
    fee: string;
    splitPartners: { name: string; percentage: string }[];
    recruiterName: string;
    placementType: "Direct Hire" | "Contract" | "Retained";
    industry: string;
    timeToFill: string;
    status: "Active" | "Completed" | "Guarantee Period";
}

export const SAMPLE_PLACEMENTS: PlacementCardData[] = [
    {
        candidateName: "Elena Vasquez",
        candidateInitials: "EV",
        roleTitle: "Head of Data Science",
        company: "NovaTech Solutions",
        companyInitials: "NS",
        startDate: "2026-01-15",
        salary: "$245,000",
        fee: "$49,000",
        splitPartners: [
            { name: "Sarah Kim", percentage: "60%" },
            { name: "James Rivera", percentage: "40%" },
        ],
        recruiterName: "Sarah Kim",
        placementType: "Direct Hire",
        industry: "Enterprise SaaS",
        timeToFill: "32 days",
        status: "Guarantee Period",
    },
    {
        candidateName: "Michael Chen",
        candidateInitials: "MC",
        roleTitle: "CFO",
        company: "Horizon Capital Group",
        companyInitials: "HG",
        startDate: "2025-11-04",
        salary: "$380,000",
        fee: "$95,000",
        splitPartners: [
            { name: "Marcus Johnson", percentage: "70%" },
            { name: "Lisa Tremblay", percentage: "30%" },
        ],
        recruiterName: "Marcus Johnson",
        placementType: "Retained",
        industry: "Financial Services",
        timeToFill: "48 days",
        status: "Completed",
    },
    {
        candidateName: "Priya Sharma",
        candidateInitials: "PS",
        roleTitle: "Senior DevOps Engineer",
        company: "CloudScale Systems",
        companyInitials: "CS",
        startDate: "2026-02-10",
        salary: "$195,000",
        fee: "$39,000",
        splitPartners: [
            { name: "Priya Patel", percentage: "50%" },
            { name: "David Nakamura", percentage: "50%" },
        ],
        recruiterName: "Priya Patel",
        placementType: "Direct Hire",
        industry: "Cloud Infrastructure",
        timeToFill: "21 days",
        status: "Active",
    },
];

/* ─── Company Card ───────────────────────────────────────────────────────── */

export interface CompanyCardData {
    name: string;
    initials: string;
    industry: string;
    location: string;
    size: string;
    stage: string;
    openRoles: number;
    description: string;
    founded: number;
    hiring: boolean;
    featuredPerks: string[];
    techStack: string[];
    averageSalary: string;
    logoUrl: string | null;
}

export const SAMPLE_COMPANIES: CompanyCardData[] = [
    {
        name: "Meridian Financial",
        initials: "MF",
        industry: "Financial Services",
        location: "New York, NY",
        size: "500-1000",
        stage: "Series D",
        openRoles: 14,
        description:
            "Next-generation treasury management platform for mid-market companies. Processing $8B in annual transaction volume.",
        founded: 2019,
        hiring: true,
        featuredPerks: ["Equity Refresh", "Unlimited PTO", "401k Match"],
        techStack: ["Go", "React", "PostgreSQL", "Kubernetes"],
        averageSalary: "$185k-$240k",
        logoUrl: null,
    },
    {
        name: "Canopy Health",
        initials: "CH",
        industry: "Healthcare Technology",
        location: "Remote US",
        size: "200-500",
        stage: "Series C",
        openRoles: 9,
        description:
            "Clinical decision support platform used by 1,200+ hospitals. Reducing diagnostic errors by 34% through evidence-based workflows.",
        founded: 2020,
        hiring: true,
        featuredPerks: ["Remote-First", "Health Stipend", "Learning Budget"],
        techStack: ["Python", "React", "AWS", "FHIR"],
        averageSalary: "$170k-$220k",
        logoUrl: null,
    },
    {
        name: "Lumen Analytics",
        initials: "LA",
        industry: "Data & Analytics",
        location: "Austin, TX",
        size: "50-200",
        stage: "Series B",
        openRoles: 6,
        description:
            "Real-time analytics infrastructure for product and growth teams. 300+ enterprise clients including 12 Fortune 500 companies.",
        founded: 2021,
        hiring: true,
        featuredPerks: ["Early-Stage Equity", "Flexible Hours", "Conference Budget"],
        techStack: ["Spark", "Python", "Snowflake", "dbt"],
        averageSalary: "$160k-$200k",
        logoUrl: null,
    },
];

/* ─── Match Card ─────────────────────────────────────────────────────────── */

export interface MatchCardData {
    candidateName: string;
    candidateInitials: string;
    candidateTitle: string;
    roleTitle: string;
    company: string;
    companyInitials: string;
    matchScore: number;
    matchReasons: string[];
    salaryAlignment: string;
    locationMatch: boolean;
    skillOverlap: string[];
    missingSkills: string[];
    recruiterName: string;
    status: "New" | "Reviewed" | "Presented" | "Declined";
}

export const SAMPLE_MATCHES: MatchCardData[] = [
    {
        candidateName: "Jordan Reeves",
        candidateInitials: "JR",
        candidateTitle: "Senior Software Engineer",
        roleTitle: "Staff Backend Engineer",
        company: "Meridian Financial",
        companyInitials: "MF",
        matchScore: 92,
        matchReasons: [
            "9 years backend experience",
            "Payments infrastructure expertise",
            "System design at scale",
            "TypeScript + Node.js alignment",
        ],
        salaryAlignment: "Within range",
        locationMatch: true,
        skillOverlap: ["TypeScript", "Node.js", "AWS", "System Design"],
        missingSkills: ["Go"],
        recruiterName: "Sarah Kim",
        status: "Presented",
    },
    {
        candidateName: "Amara Osei",
        candidateInitials: "AO",
        candidateTitle: "Product Manager",
        roleTitle: "VP of Product",
        company: "Canopy Health",
        companyInitials: "CH",
        matchScore: 78,
        matchReasons: [
            "6 years product management",
            "B2B SaaS background",
            "Strong user research skills",
            "Remote-first preference match",
        ],
        salaryAlignment: "Below range",
        locationMatch: true,
        skillOverlap: ["Product Strategy", "User Research", "A/B Testing"],
        missingSkills: ["Healthcare Domain", "Enterprise Sales"],
        recruiterName: "Marcus Johnson",
        status: "New",
    },
    {
        candidateName: "Daniel Kovacs",
        candidateInitials: "DK",
        candidateTitle: "Engineering Manager",
        roleTitle: "Director of Engineering",
        company: "Vantage Cloud",
        companyInitials: "VC",
        matchScore: 94,
        matchReasons: [
            "11 years engineering experience",
            "Multi-team management track record",
            "Infrastructure domain expertise",
            "Immediate availability",
        ],
        salaryAlignment: "Within range",
        locationMatch: true,
        skillOverlap: ["People Management", "Go", "Distributed Systems"],
        missingSkills: [],
        recruiterName: "Priya Patel",
        status: "Reviewed",
    },
];
