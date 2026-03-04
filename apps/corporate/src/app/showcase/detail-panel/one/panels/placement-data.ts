/* ─── Mock Data: Placement Detail Panel ──────────────────────────────── */

import type { PanelStat } from "./panel-header";

export interface PlacementMock {
    state: string;
    candidateName: string;
    candidateInitials: string;
    candidateEmail: string;
    companyName: string;
    jobTitle: string;
    hiredAt: string;
    startDate: string;
    endDate: string | null;
    guaranteeExpiresAt: string;
    guaranteeDays: number;
    failedAt: string | null;
    salary: number;
    feePercentage: number;
    feeAmount: number;
    recruiterShare: number;
    platformShare: number;
    stats: PanelStat[];
    splits: {
        id: string;
        role: string;
        roleLabel: string;
        recruiterName: string;
        splitPercentage: number;
        splitAmount: number;
    }[];
}

export const data: PlacementMock = {
    state: "confirmed",
    candidateName: "Jordan Davis",
    candidateInitials: "JD",
    candidateEmail: "jordan.davis@email.com",
    companyName: "TechCorp Solutions",
    jobTitle: "Senior Full-Stack Engineer",
    hiredAt: "Jan 28, 2026",
    startDate: "Feb 10, 2026",
    endDate: null,
    guaranteeExpiresAt: "May 10, 2026",
    guaranteeDays: 90,
    failedAt: null,
    salary: 195000,
    feePercentage: 20,
    feeAmount: 39000,
    recruiterShare: 23400,
    platformShare: 15600,
    stats: [
        { label: "Salary", value: "$195k", icon: "fa-duotone fa-regular fa-dollar-sign" },
        { label: "Fee Rate", value: "20%", icon: "fa-duotone fa-regular fa-percent" },
        { label: "Your Share", value: "$23.4k", icon: "fa-duotone fa-regular fa-coins" },
        { label: "Guarantee", value: "90d", icon: "fa-duotone fa-regular fa-shield-check" },
    ],
    splits: [
        {
            id: "sp-1",
            role: "candidate_recruiter",
            roleLabel: "Candidate Recruiter",
            recruiterName: "Sarah Mitchell",
            splitPercentage: 60,
            splitAmount: 23400,
        },
        {
            id: "sp-2",
            role: "company_recruiter",
            roleLabel: "Company Recruiter",
            recruiterName: "David Park",
            splitPercentage: 30,
            splitAmount: 11700,
        },
        {
            id: "sp-3",
            role: "candidate_sourcer",
            roleLabel: "Candidate Sourcer",
            recruiterName: "Lisa Wang",
            splitPercentage: 10,
            splitAmount: 3900,
        },
    ],
};
