/* ─── Mock Data: Invitation Panel ─────────────────────────────────────── */

import type { PanelStat } from "./panel-header";

/**
 * Combines data from three real invitation features:
 *   1. Recruiter → Candidate invitations (invitations/)
 *   2. Company → Recruiter invitations (company-invitations/)
 *   3. Recruiter → Company invitations (invite-companies/)
 */

export const data = {
    /* ── Header ──────────────────────────────────────────────────────── */
    type: "candidate" as "candidate" | "company",
    status: "pending" as "pending" | "representing" | "declined" | "expired" | "revoked" | "cancelled",
    statusIcon: "fa-hourglass-half",
    emailSent: true,
    expiringSoon: false,

    /* ── Identity ────────────────────────────────────────────────────── */
    candidateName: "Maria Rodriguez",
    candidateInitials: "MR",
    candidateEmail: "maria.rodriguez@gmail.com",
    candidatePhone: "+1 (512) 555-0147",
    candidateTitle: "Senior Product Designer",
    candidateCompany: "Figma",
    candidateLocation: "Austin, TX",
    candidateVerification: "verified" as "verified" | "pending",

    /* ── Stats ────────────────────────────────────────────────────────── */
    stats: [
        { label: "Status", value: "Pending", icon: "fa-duotone fa-regular fa-hourglass-half" },
        { label: "Invited", value: "Feb 20", icon: "fa-duotone fa-regular fa-paper-plane" },
        { label: "Expires", value: "Mar 20", icon: "fa-duotone fa-regular fa-clock" },
    ] as PanelStat[],

    /* ── Timeline dates ──────────────────────────────────────────────── */
    invitedAt: "2026-02-20T10:30:00Z",
    expiresAt: "2026-03-20T10:30:00Z",
    consentGivenAt: null as string | null,
    declinedAt: null as string | null,
    declinedReason: null as string | null,
    emailSentAt: "2026-02-20T10:31:00Z",

    /* ── Company invitation fields (invite-companies) ────────────────── */
    inviteCode: "INV-8F3K-X2M9",
    inviteLink: "https://splits.network/join/abc123def456",
    companyNameHint: "TechCorp Solutions",
    personalMessage:
        "Hi Maria, I'd love to represent you on the Splits Network. Your product design expertise is in high demand and I have several companies looking for exactly your skillset.",

    /* ── Company-invitation fields (company-invitations) ──────────────── */
    relationshipType: "recruiter" as "sourcer" | "recruiter",
    canManageCompanyJobs: true,
    relationshipStartDate: null as string | null,
    relationshipEndDate: null as string | null,
    terminationReason: null as string | null,
    company: {
        name: "TechCorp Solutions",
        industry: "Enterprise Software",
        location: "San Francisco, CA",
        logoUrl: null as string | null,
        initials: "TC",
    },
    recruiter: {
        name: "Sarah Mitchell",
        email: "sarah.mitchell@apextalent.com",
        initials: "SM",
    },

    /* ── Activity history ────────────────────────────────────────────── */
    history: [
        { action: "Invitation created", date: "Feb 20, 2026", time: "10:30 AM" },
        { action: "Email sent to candidate", date: "Feb 20, 2026", time: "10:31 AM" },
        { action: "Email opened", date: "Feb 20, 2026", time: "2:15 PM" },
        { action: "Invitation link clicked", date: "Feb 21, 2026", time: "9:45 AM" },
        { action: "Reminder sent", date: "Feb 27, 2026", time: "9:00 AM" },
    ],
};
