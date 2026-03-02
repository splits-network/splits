export interface RecruiterCardData {
    name: string;
    initials: string;
    title: string;
    firm: string;
    location: string;
    bio: string;
    avatarUrl?: string;
    online: boolean;
    verified: boolean;
    memberSince: string;
    stats: { label: string; value: string; icon: string }[];
    specializations: string[];
    industries: string[];
    seekingSplits: boolean;
    acceptsCandidates: boolean;
}

export const SAMPLE_RECRUITERS: RecruiterCardData[] = [
    {
        name: "Sarah Kim",
        initials: "SK",
        title: "Senior Technical Recruiter",
        firm: "Apex Talent Partners",
        location: "San Francisco, CA",
        bio: "8+ years placing top engineering and product talent across 50+ startups from Series A through IPO.",
        online: true,
        verified: true,
        memberSince: "Mar 2023",
        stats: [
            { label: "Placements", value: "47", icon: "fa-duotone fa-regular fa-trophy" },
            { label: "Success Rate", value: "94%", icon: "fa-duotone fa-regular fa-bullseye" },
            { label: "Avg Fill", value: "28d", icon: "fa-duotone fa-regular fa-clock" },
            { label: "Rating", value: "4.9", icon: "fa-duotone fa-regular fa-star" },
        ],
        specializations: ["Engineering", "Product", "Data Science", "DevOps"],
        industries: ["SaaS", "Fintech", "Healthcare Tech"],
        seekingSplits: true,
        acceptsCandidates: true,
    },
    {
        name: "Marcus Johnson",
        initials: "MJ",
        title: "Executive Search Partner",
        firm: "Sterling & Associates",
        location: "New York, NY",
        bio: "C-suite and VP-level placements in financial services. 12 years of retained search experience.",
        online: false,
        verified: true,
        memberSince: "Jan 2024",
        stats: [
            { label: "Placements", value: "89", icon: "fa-duotone fa-regular fa-trophy" },
            { label: "Success Rate", value: "91%", icon: "fa-duotone fa-regular fa-bullseye" },
            { label: "Avg Fill", value: "42d", icon: "fa-duotone fa-regular fa-clock" },
            { label: "Rating", value: "4.8", icon: "fa-duotone fa-regular fa-star" },
        ],
        specializations: ["C-Suite", "VP Engineering", "VP Product", "CFO"],
        industries: ["Banking", "Insurance", "Asset Management"],
        seekingSplits: true,
        acceptsCandidates: false,
    },
    {
        name: "Priya Patel",
        initials: "PP",
        title: "Healthcare Recruiting Lead",
        firm: "MedTalent Group",
        location: "Chicago, IL",
        bio: "Specialized in clinical and health-tech placements. Built teams for 3 unicorn health startups.",
        online: true,
        verified: false,
        memberSince: "Sep 2023",
        stats: [
            { label: "Placements", value: "63", icon: "fa-duotone fa-regular fa-trophy" },
            { label: "Success Rate", value: "88%", icon: "fa-duotone fa-regular fa-bullseye" },
            { label: "Avg Fill", value: "35d", icon: "fa-duotone fa-regular fa-clock" },
            { label: "Rating", value: "4.7", icon: "fa-duotone fa-regular fa-star" },
        ],
        specializations: ["Clinical", "Health IT", "Biotech", "Medical Devices"],
        industries: ["Healthcare", "Biotech", "Pharma"],
        seekingSplits: false,
        acceptsCandidates: true,
    },
];
