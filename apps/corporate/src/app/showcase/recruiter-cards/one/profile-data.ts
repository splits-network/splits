import type { RecruiterCardData } from "./data";

export interface RecruiterProfileData extends RecruiterCardData {
    email: string;
    phone: string;
    linkedin: string;
    experience: { title: string; company: string; period: string; description: string }[];
    recentActivity: { action: string; time: string; icon: string; color: string }[];
    testimonials: { text: string; author: string; role: string; initials: string }[];
    badges: { label: string; icon: string; color: string }[];
}

export const SAMPLE_PROFILE: RecruiterProfileData = {
    name: "Sarah Kim",
    initials: "SK",
    title: "Senior Technical Recruiter",
    firm: "Apex Talent Partners",
    location: "San Francisco, CA",
    bio: "Veteran technical recruiter with 8+ years specializing in engineering and product placements. Built talent pipelines for 50+ startups from Series A through IPO. Passionate about connecting exceptional talent with companies that value culture fit alongside technical excellence.",
    online: true,
    verified: true,
    memberSince: "Mar 2023",
    email: "sarah@example.com",
    phone: "+1 (415) 555-0142",
    linkedin: "linkedin.com/in/sarahkim",
    stats: [
        { label: "Placements", value: "47", icon: "fa-duotone fa-regular fa-trophy" },
        { label: "Success Rate", value: "94%", icon: "fa-duotone fa-regular fa-bullseye" },
        { label: "Avg Time-to-Fill", value: "28d", icon: "fa-duotone fa-regular fa-clock" },
        { label: "Rating", value: "4.9", icon: "fa-duotone fa-regular fa-star" },
    ],
    specializations: ["Engineering", "Product", "Data Science", "DevOps", "Machine Learning"],
    industries: ["SaaS", "Fintech", "Healthcare Tech", "Developer Tools"],
    seekingSplits: true,
    acceptsCandidates: true,
    experience: [
        {
            title: "Senior Technical Recruiter",
            company: "Splits Network",
            period: "2023 - Present",
            description: "Top-performing recruiter on the marketplace. 47 placements across engineering and product roles.",
        },
        {
            title: "Technical Recruiter",
            company: "TalentBridge",
            period: "2020 - 2023",
            description: "Built engineering pipelines for Series A-C startups. Specialized in hard-to-fill senior roles.",
        },
        {
            title: "Recruiting Coordinator",
            company: "BigTech Corp",
            period: "2018 - 2020",
            description: "Coordinated hiring for 200+ engineering roles annually. Developed interview process improvements.",
        },
    ],
    recentActivity: [
        { action: "Placed a Senior Engineer at TechCorp", time: "2 days ago", icon: "fa-duotone fa-regular fa-trophy", color: "text-success" },
        { action: "Submitted 3 candidates to DataFlow VP role", time: "4 days ago", icon: "fa-duotone fa-regular fa-paper-plane", color: "text-primary" },
        { action: "Earned Pro Recruiter badge", time: "1 week ago", icon: "fa-duotone fa-regular fa-award", color: "text-warning" },
        { action: "Completed 5-star review from InnovateCo", time: "2 weeks ago", icon: "fa-duotone fa-regular fa-star", color: "text-accent" },
    ],
    testimonials: [
        {
            text: "Sarah consistently delivers exceptional candidates. Her understanding of our engineering culture is unmatched.",
            author: "Priya Patel",
            role: "VP Talent, TechCorp",
            initials: "PP",
        },
        {
            text: "The fastest placement we have ever had. Sarah had qualified candidates within 48 hours.",
            author: "Robert Tanaka",
            role: "CTO, DataFlow",
            initials: "RT",
        },
    ],
    badges: [
        { label: "Pro Recruiter", icon: "fa-duotone fa-regular fa-award", color: "text-warning" },
        { label: "Top 10%", icon: "fa-duotone fa-regular fa-ranking-star", color: "text-primary" },
        { label: "Verified", icon: "fa-duotone fa-regular fa-badge-check", color: "text-secondary" },
        { label: "Fast Placer", icon: "fa-duotone fa-regular fa-bolt", color: "text-accent" },
    ],
};
