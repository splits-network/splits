import type { FirmCardData } from "./data";

export interface FirmProfileData extends FirmCardData {
    recentPlacements: { role: string; level: string; time: string }[];
    teamHighlights: { name: string; title: string; initials: string; specialization: string }[];
    testimonials: { text: string; author: string; role: string; initials: string }[];
    milestones: { year: string; event: string }[];
}

export const SAMPLE_FIRM_PROFILE: FirmProfileData = {
    name: "Apex Talent Partners",
    slug: "apex-talent-partners",
    tagline: "Engineering leaders for the companies shaping tomorrow",
    description:
        "Apex Talent Partners is a boutique technical recruiting firm specializing in senior engineering and product leadership placements. With a network spanning 500+ hiring managers across the Bay Area and beyond, we connect exceptional talent with high-growth companies at inflection points. Our consultative approach means we don't just fill roles — we help shape teams.",
    logoUrl: null,
    bannerUrl: null,
    industries: ["SaaS", "Fintech", "Developer Tools"],
    specialties: ["Engineering Leadership", "Staff+ Engineers", "VP Product", "CTO Search"],
    placementTypes: ["Direct Hire", "Retained"],
    geoFocus: ["San Francisco Bay Area", "Remote US", "New York Metro"],
    location: "San Francisco, CA",
    foundedYear: 2018,
    teamSizeRange: "10-25",
    websiteUrl: "https://apextalent.com",
    linkedinUrl: "https://linkedin.com/company/apex-talent",
    contactEmail: "hello@apextalent.com",
    contactPhone: "+1 (415) 555-0100",
    seekingSplitPartners: true,
    acceptsCandidateSubmissions: true,
    activeMemberCount: 12,
    showMemberCount: true,
    showContactInfo: true,
    recentPlacements: [
        { role: "VP of Engineering", level: "Executive", time: "2 weeks ago" },
        { role: "Staff Software Engineer", level: "Senior IC", time: "3 weeks ago" },
        { role: "Director of Product", level: "Director", time: "1 month ago" },
        { role: "Principal Engineer", level: "Senior IC", time: "1 month ago" },
        { role: "CTO", level: "C-Suite", time: "2 months ago" },
    ],
    teamHighlights: [
        { name: "Sarah Kim", title: "Senior Technical Recruiter", initials: "SK", specialization: "Engineering" },
        { name: "David Chen", title: "Partner, Executive Search", initials: "DC", specialization: "C-Suite" },
        { name: "Maria Lopez", title: "Recruiting Lead", initials: "ML", specialization: "Product" },
        { name: "James Wright", title: "Technical Sourcer", initials: "JW", specialization: "DevOps" },
    ],
    testimonials: [
        {
            text: "Apex delivered three VP-caliber candidates within two weeks. Their understanding of our engineering culture and technical bar is unmatched in the industry.",
            author: "Priya Patel",
            role: "CTO, DataFlow",
            initials: "PP",
        },
        {
            text: "We've used Apex for every senior hire since Series B. They don't just source — they advise on comp, leveling, and team structure. True partners.",
            author: "Michael Torres",
            role: "CEO, BuildStack",
            initials: "MT",
        },
    ],
    milestones: [
        { year: "2018", event: "Founded in San Francisco" },
        { year: "2019", event: "First 25 placements completed" },
        { year: "2021", event: "Expanded to New York office" },
        { year: "2022", event: "100th placement milestone" },
        { year: "2023", event: "Joined Splits Network marketplace" },
        { year: "2024", event: "Named Top 10 Technical Search Firm" },
    ],
};
