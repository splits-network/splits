/* ─── Mock Data: Firm Detail Panel ───────────────────────────────────── */

import type { PanelStat } from "./panel-header";

export interface FirmMemberMock {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
    roleLabel: string;
    status: string;
    joinedAt: string;
}

export interface FirmInvitationMock {
    id: string;
    email: string;
    role: string;
    roleLabel: string;
    status: string;
    createdAt: string;
    expired: boolean;
}

export interface FirmMock {
    id: string;
    name: string;
    initials: string;
    status: string;
    slug: string;
    tagline: string;
    description: string;
    /* Location */
    headquartersCity: string;
    headquartersState: string;
    headquartersCountry: string;
    foundedYear: number;
    teamSizeRange: string;
    teamSizeLabel: string;
    /* Stats */
    memberCount: number;
    activeMemberCount: number;
    totalPlacements: number;
    totalRevenue: number;
    adminTakeRate: number;
    /* Specialization */
    industries: string[];
    specialties: string[];
    placementTypes: string[];
    geoFocus: string[];
    /* Contact */
    websiteUrl: string;
    linkedinUrl: string;
    contactEmail: string;
    contactPhone: string;
    /* Marketplace */
    marketplaceVisible: boolean;
    candidateFirm: boolean;
    companyFirm: boolean;
    /* Visibility */
    showMemberCount: boolean;
    showPlacementStats: boolean;
    showContactInfo: boolean;
    createdAt: string;
    /* Panel */
    stats: PanelStat[];
    members: FirmMemberMock[];
    invitations: FirmInvitationMock[];
}

export const data: FirmMock = {
    id: "firm-001",
    name: "Apex Talent Partners",
    initials: "AT",
    status: "active",
    slug: "apex-talent-partners",
    tagline: "Elite technology recruiting for high-growth companies",
    description:
        "Apex Talent Partners is a boutique recruiting firm specializing in technology placements. We connect top-tier engineering talent with innovative companies across the Bay Area and beyond.",
    headquartersCity: "San Francisco",
    headquartersState: "CA",
    headquartersCountry: "US",
    foundedYear: 2019,
    teamSizeRange: "16_50",
    teamSizeLabel: "16-50",
    memberCount: 28,
    activeMemberCount: 24,
    totalPlacements: 156,
    totalRevenue: 1240000,
    adminTakeRate: 12,
    industries: ["SaaS", "FinTech", "HealthTech", "AI/ML"],
    specialties: ["Full-Stack", "DevOps", "Machine Learning", "Product Management"],
    placementTypes: ["Permanent", "Contract", "Executive Search"],
    geoFocus: ["Bay Area", "NYC Metro", "Remote US"],
    websiteUrl: "https://apextalent.com",
    linkedinUrl: "https://linkedin.com/company/apex-talent",
    contactEmail: "hello@apextalent.com",
    contactPhone: "+1 (415) 555-0100",
    marketplaceVisible: true,
    candidateFirm: true,
    companyFirm: true,
    showMemberCount: true,
    showPlacementStats: true,
    showContactInfo: true,
    createdAt: "Jan 15, 2019",
    stats: [
        { label: "Members", value: "24", icon: "fa-duotone fa-regular fa-users" },
        { label: "Placements", value: "156", icon: "fa-duotone fa-regular fa-trophy" },
        { label: "Revenue", value: "$1.2M", icon: "fa-duotone fa-regular fa-chart-line" },
        { label: "Take Rate", value: "12%", icon: "fa-duotone fa-regular fa-percent" },
    ],
    members: [
        {
            id: "m-1",
            name: "Sarah Mitchell",
            email: "sarah@apextalent.com",
            initials: "SM",
            role: "owner",
            roleLabel: "Owner",
            status: "active",
            joinedAt: "Jan 15, 2019",
        },
        {
            id: "m-2",
            name: "David Park",
            email: "david@apextalent.com",
            initials: "DP",
            role: "admin",
            roleLabel: "Admin",
            status: "active",
            joinedAt: "Mar 22, 2020",
        },
        {
            id: "m-3",
            name: "Lisa Wang",
            email: "lisa@apextalent.com",
            initials: "LW",
            role: "member",
            roleLabel: "Member",
            status: "active",
            joinedAt: "Aug 5, 2021",
        },
        {
            id: "m-4",
            name: "Marcus Chen",
            email: "marcus@apextalent.com",
            initials: "MC",
            role: "member",
            roleLabel: "Member",
            status: "active",
            joinedAt: "Nov 12, 2023",
        },
    ],
    invitations: [
        {
            id: "inv-1",
            email: "maria.r@email.com",
            role: "member",
            roleLabel: "Member",
            status: "pending",
            createdAt: "Feb 20, 2026",
            expired: false,
        },
        {
            id: "inv-2",
            email: "james.k@outlook.com",
            role: "collaborator",
            roleLabel: "Collaborator",
            status: "pending",
            createdAt: "Feb 25, 2026",
            expired: true,
        },
    ],
};
