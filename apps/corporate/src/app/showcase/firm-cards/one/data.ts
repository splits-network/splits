export interface FirmCardData {
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    industries: string[];
    specialties: string[];
    placementTypes: string[];
    geoFocus: string[];
    location: string | null;
    foundedYear: number | null;
    teamSizeRange: string | null;
    websiteUrl: string | null;
    linkedinUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    seekingSplitPartners: boolean;
    acceptsCandidateSubmissions: boolean;
    activeMemberCount: number | null;
    showMemberCount: boolean;
    showContactInfo: boolean;
}

export function firmInitials(name: string): string {
    const words = name.split(" ");
    const first = words[0]?.[0]?.toUpperCase() || "";
    const last = words.length > 1 ? words[words.length - 1]?.[0]?.toUpperCase() || "" : "";
    return words.length > 1 ? first + last : first;
}

export const SAMPLE_FIRMS: FirmCardData[] = [
    {
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
    },
    {
        name: "Sterling & Associates",
        slug: "sterling-associates",
        tagline: "C-suite retained search for financial services",
        description:
            "Sterling & Associates is a premier retained executive search firm exclusively serving financial services. We place C-level executives, board members, and senior leaders at global banks, asset managers, and insurance carriers. Our 12-year track record includes 200+ successful executive placements with a 96% retention rate at the two-year mark.",
        logoUrl: null,
        bannerUrl: null,
        industries: ["Banking", "Insurance", "Asset Management", "Private Equity"],
        specialties: ["CEO/CFO", "Board Directors", "CRO/CIO", "Managing Directors"],
        placementTypes: ["Retained", "Direct Hire"],
        geoFocus: ["New York Metro", "London", "Singapore"],
        location: "New York, NY",
        foundedYear: 2012,
        teamSizeRange: "25-50",
        websiteUrl: "https://sterlingassociates.com",
        linkedinUrl: "https://linkedin.com/company/sterling-associates",
        contactEmail: "inquiries@sterlingassociates.com",
        contactPhone: "+1 (212) 555-0200",
        seekingSplitPartners: true,
        acceptsCandidateSubmissions: false,
        activeMemberCount: 32,
        showMemberCount: true,
        showContactInfo: true,
    },
    {
        name: "MedTalent Group",
        slug: "medtalent-group",
        tagline: null,
        description:
            "MedTalent Group connects healthcare organizations with clinical and health-tech professionals. We've built talent pipelines for 3 unicorn health startups and partner with hospital systems across the Midwest. Our recruiters hold industry certifications and understand the regulatory landscape that shapes healthcare hiring.",
        logoUrl: null,
        bannerUrl: null,
        industries: ["Healthcare", "Biotech", "Pharma"],
        specialties: ["Clinical Operations", "Health IT", "Regulatory Affairs", "Medical Devices"],
        placementTypes: ["Direct Hire", "Contract", "Contract-to-Hire"],
        geoFocus: ["Chicago Metro", "Midwest US", "Remote US"],
        location: "Chicago, IL",
        foundedYear: 2020,
        teamSizeRange: "5-10",
        websiteUrl: null,
        linkedinUrl: "https://linkedin.com/company/medtalent-group",
        contactEmail: "team@medtalentgroup.com",
        contactPhone: null,
        seekingSplitPartners: false,
        acceptsCandidateSubmissions: true,
        activeMemberCount: 7,
        showMemberCount: true,
        showContactInfo: true,
    },
];
