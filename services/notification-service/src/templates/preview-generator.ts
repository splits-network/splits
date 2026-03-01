/**
 * Email Template Test/Preview Generator
 * Run this file to generate HTML files for all email templates for visual testing
 *
 * Usage: pnpm --filter @splits-network/notification-service preview:emails
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    applicationCreatedEmail,
    applicationStageChangedEmail,
    applicationAcceptedEmail,
    applicationRejectedEmail,
    applicationWithdrawnEmail,
    candidateApplicationSubmittedEmail,
    companyApplicationReceivedEmail,
    preScreenRequestedEmail,
    preScreenRequestConfirmationEmail,
    applicationSubmittedToCompanyEmail,
    aiReviewCompletedCandidateEmail,
    aiReviewCompletedRecruiterEmail,
    recruiterProposedEmail,
    proposalAcceptedByApplicationEmail,
    proposalDeclinedByApplicationEmail,
    applicationNoteCreatedEmail,
} from './applications';
import {
    placementCreatedEmail,
    placementActivatedEmail,
    placementCompletedEmail,
    placementFailedEmail,
    guaranteeExpiringEmail,
    firstPlacementEmail,
} from './placements';
import {
    candidateSourcedEmail,
    ownershipConflictEmail,
    ownershipConflictRejectionEmail,
    candidateAddedToNetworkEmail,
    collaboratorAddedEmail,
    candidateInvitationEmail,
    consentGivenEmail,
    consentDeclinedEmail,
} from './candidates';
import {
    companyPlatformInvitationEmail,
    companyInvitationAcceptedEmail,
} from './company-invitations';
import {
    serviceUnhealthyEmail,
    serviceRecoveredEmail,
} from './health';
import {
    firmInvitationEmail,
    invitationRevokedEmail,
} from './invitations';
import {
    newOpportunityEmail,
    candidateApprovedEmail,
    candidateDeclinedEmail,
    opportunityExpiredEmail,
} from './recruiter-submission';
import {
    tierPromotionEmail,
    tierDemotionEmail,
} from './reputation';
import {
    companyTierPromotionEmail,
    companyTierDemotionEmail,
} from './reputation/company-emails';
import {
    stripeConnectOnboardedEmail,
    stripeConnectDisabledEmail,
    companyBillingSetupCompleteEmail,
    payoutConnectRequiredEmail,
} from './billing';
import {
    recruiterCompanyInvitationEmail,
    recruiterCompanyAcceptedEmail,
    recruiterCompanyDeclinedEmail,
} from './recruiter-company-invitations';
import {
    welcomeEmail,
    recruiterOnboardingEmail,
    companyWelcomeEmail,
} from './onboarding';
import {
    jobCreatedConfirmationEmail,
    jobStatusChangedEmail,
    jobExpiredEmail,
    firstJobPostedEmail,
} from './jobs';
import {
    connectionRequestedEmail,
    relationshipTerminatedEmail,
    invitationCancelledEmail,
} from './relationships';
import { fraudAlertEmail, securityReplayAlertEmail } from './security';
import { invitationAcceptedEmail } from './invitations';
import { referralCodeRedeemedEmail } from './recruiter-codes';
import { resumeProcessedEmail } from './documents';
import {
    weeklyActivityDigestEmail,
    monthlyHiringReportEmail,
    candidateProfileReminderEmail,
    recruiterInactivityReminderEmail,
} from './engagement';
import {
    payoutProcessedEmail,
    payoutFailedEmail,
    escrowReleasedEmail,
    escrowAutoReleasedEmail,
    invoicePaidEmail,
    subscriptionCancelledEmail,
} from './billing';

const OUTPUT_DIR = path.join(__dirname, '../../email-previews');

// ── Application sample data ──────────────────────────────────────────

const applicationCreatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/abc123',
    recruiterName: 'Jane Smith',
};

const applicationStageChangedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    oldStage: 'Initial Review',
    newStage: 'Technical Interview',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const applicationAcceptedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const applicationRejectedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    reason: 'Position has been filled by another candidate',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const applicationWithdrawnData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    reason: 'Accepted a competing offer',
    withdrawnBy: 'Brandon Test2',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const candidateApplicationSubmittedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    hasRecruiter: true,
    nextSteps: 'Your recruiter Jane Smith will guide you through the next steps. Expect an update within 3-5 business days.',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const companyApplicationReceivedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    applicationUrl: 'https://splits.network/applications/abc123',
    hasRecruiter: true,
    recruiterName: 'Jane Smith',
};

const preScreenRequestedData = {
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah@example.com',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    requestedBy: 'Jane Smith',
    message: 'Hi Sarah, could you complete a brief pre-screen questionnaire before your interview?',
    portalUrl: 'https://applicant.network/portal/pre-screen/abc123',
};

const preScreenRequestConfirmationData = {
    candidateName: 'Sarah Johnson',
    jobTitle: 'Backend Engineer (Go)',
    autoAssign: true,
    portalUrl: 'https://applicant.network/portal/pre-screen/abc123',
};

const applicationSubmittedToCompanyData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    submittedBy: 'Jane Smith',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const aiReviewCompletedCandidateData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    fitScore: 85,
    recommendation: 'Strong Match',
    strengths: ['5+ years Go experience', 'Strong system design skills', 'Open source contributions'],
    concerns: ['No direct Kubernetes experience', 'Limited fintech background'],
    applicationUrl: 'https://splits.network/applications/abc123',
};

const aiReviewCompletedRecruiterData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    fitScore: 85,
    recommendation: 'Strong Match',
    overallSummary: 'Brandon is a strong backend engineer with extensive Go experience. His system design skills and open source contributions align well with the role requirements.',
    strengths: ['5+ years Go experience', 'Strong system design skills', 'Open source contributions'],
    concerns: ['No direct Kubernetes experience', 'Limited fintech background'],
    matchedSkills: ['Go', 'PostgreSQL', 'REST APIs', 'Microservices'],
    missingSkills: ['Kubernetes', 'Terraform'],
    applicationUrl: 'https://splits.network/applications/abc123',
};

const recruiterProposedData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    pitch: 'I think you would be a great fit for this role given your Go experience and passion for distributed systems.',
    proposalUrl: 'https://applicant.network/portal/proposals/abc123',
};

const proposalAcceptedData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const proposalDeclinedData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    reason: 'Not interested in this type of role at the moment.',
    candidateProfileUrl: 'https://splits.network/portal/candidates/sarah123',
};

const applicationNoteCreatedData = {
    recipientName: 'Jane Smith',
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    notePreview: 'Candidate performed excellently in the technical interview. Strong problem-solving skills and clear communication.',
    addedByName: 'Mike Chen',
    addedByRole: 'Hiring Manager',
    applicationUrl: 'https://splits.network/applications/abc123',
};

// ── Placement sample data ────────────────────────────────────────────

const placementCreatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    salary: 150000,
    recruiterShare: 18750,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementActivatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    startDate: 'January 15, 2025',
    guaranteePeriodDays: 90,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementCompletedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    recruiterShare: 18750,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementFailedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    reason: 'Candidate decided to accept another offer',
    placementUrl: 'https://splits.network/placements/xyz789',
};

const guaranteeExpiringData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    daysRemaining: 7,
    guaranteeEndDate: 'April 15, 2025',
    placementUrl: 'https://splits.network/placements/xyz789',
};

// ── Candidate sample data ────────────────────────────────────────────

const candidateSourcedData = {
    candidateName: 'Sarah Johnson',
    sourceMethod: 'LinkedIn',
    protectionPeriod: '12 months',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const ownershipConflictData = {
    candidateName: 'Sarah Johnson',
    attemptingRecruiterName: 'Mike Chen',
    candidateUrl: 'https://splits.network/portal/candidates',
};

const ownershipConflictRejectionData = {
    candidateName: 'Sarah Johnson',
    originalSourcerName: 'Jane Smith',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const candidateAddedToNetworkData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    portalUrl: 'https://applicant.network/portal/profile',
};

const collaboratorAddedData = {
    candidateName: 'Sarah Johnson',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    role: 'Split Recruiter',
    splitPercentage: 30,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const candidateInvitationData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    recruiterEmail: 'jane@splits.network',
    recruiterBio: 'Senior tech recruiter with 10+ years placing engineers at top-tier companies across the UK and US.',
    invitationUrl: 'https://applicant.network/portal/invitation/abc123',
    expiryDate: 'March 15, 2026',
};

const consentGivenData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah@example.com',
    consentDate: 'February 19, 2026',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const consentDeclinedData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah@example.com',
    declinedDate: 'February 19, 2026',
    declinedReason: 'I am not currently looking for new opportunities.',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

// ── Company invitation sample data ───────────────────────────────────

const companyPlatformInvitationData = {
    recruiterName: 'Jane Smith',
    recruiterBio: 'Senior tech recruiter with 10+ years placing engineers at top-tier companies.',
    personalMessage: 'Hi! I would love to connect your company with top engineering talent through Splits Network.',
    companyNameHint: 'TechCorp Inc',
    inviteCode: 'TECH2026',
    invitationLink: 'https://splits.network/invite/TECH2026',
    expiresDate: 'March 15, 2026',
};

const companyInvitationAcceptedData = {
    recruiterName: 'Jane Smith',
    companyName: 'TechCorp Inc',
    companyAdminName: 'Alex Director',
};

// ── Health alert sample data ─────────────────────────────────────────

const serviceUnhealthyData = {
    serviceName: 'api-gateway',
    serviceDisplayName: 'API Gateway',
    severity: 'critical',
    status: 'unhealthy' as const,
    error: 'Connection refused: upstream service timeout after 30s',
    environment: 'production',
    statusPageUrl: 'https://status.splits.network',
    timestamp: '2026-02-26T14:30:00Z',
};

const serviceRecoveredData = {
    serviceName: 'api-gateway',
    serviceDisplayName: 'API Gateway',
    severity: 'info',
    status: 'recovered' as const,
    environment: 'production',
    statusPageUrl: 'https://status.splits.network',
    timestamp: '2026-02-26T14:45:00Z',
};

// ── Firm invitation sample data ──────────────────────────────────────

const firmInvitationData = {
    organizationName: 'Smith Recruiting',
    role: 'Recruiter',
    invitedByName: 'Jane Smith',
    invitationLink: 'https://splits.network/invite/firm/abc123',
    expiresDate: 'March 15, 2026',
};

const invitationRevokedData = {
    organizationName: 'Smith Recruiting',
};

// ── Recruiter submission sample data ─────────────────────────────────

const newOpportunityData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    jobDescription: 'We are looking for an experienced Go developer to join our distributed systems team.',
    recruiterPitch: 'This role is a great fit for your background in backend development and distributed systems.',
    opportunityUrl: 'https://applicant.network/portal/opportunities/abc123',
    expiresAt: 'March 20, 2026',
};

const candidateApprovedData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    candidateEmail: 'sarah@example.com',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const candidateDeclinedData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    declineReason: 'Not looking for new roles right now',
    candidateNotes: 'Please check back in 3 months.',
    othersSourceUrl: 'https://splits.network/portal/candidates',
};

const opportunityExpiredData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    exploreUrl: 'https://splits.network/portal/candidates',
};

// ── Reputation sample data ───────────────────────────────────────────

const tierPromotionData = {
    recruiterName: 'Jane Smith',
    oldTier: 'Bronze',
    newTier: 'Silver',
    oldScore: 45,
    newScore: 72,
    profileUrl: 'https://splits.network/portal/profile',
};

const tierDemotionData = {
    recruiterName: 'Jane Smith',
    oldTier: 'Silver',
    newTier: 'Bronze',
    oldScore: 52,
    newScore: 38,
    profileUrl: 'https://splits.network/portal/profile',
};

const companyTierPromotionData = {
    companyName: 'TechCorp Inc',
    oldTier: 'Standard',
    newTier: 'Premium',
    oldScore: 60,
    newScore: 82,
    dashboardUrl: 'https://splits.network/portal/company/dashboard',
};

const companyTierDemotionData = {
    companyName: 'TechCorp Inc',
    oldTier: 'Premium',
    newTier: 'Standard',
    oldScore: 55,
    newScore: 40,
    dashboardUrl: 'https://splits.network/portal/company/dashboard',
};

// ── Billing sample data ──────────────────────────────────────────────

const stripeConnectOnboardedData = {
    recruiterName: 'Jane Smith',
    billingUrl: 'https://splits.network/portal/billing',
};

const stripeConnectDisabledData = {
    recruiterName: 'Jane Smith',
    reason: 'Your Stripe account requires additional verification documents.',
    connectUrl: 'https://splits.network/portal/billing/connect',
};

const companyBillingSetupCompleteData = {
    billingEmail: 'billing@techcorp.com',
    billingTerms: 'Net 30',
    hasPaymentMethod: true,
    billingUrl: 'https://splits.network/portal/company/billing',
};

const payoutConnectRequiredData = {
    recruiterName: 'Jane Smith',
    amount: 18750,
    connectUrl: 'https://splits.network/portal/billing/connect',
    reason: 'no_connect_account' as const,
};

// ── Recruiter-company invitation sample data ─────────────────────────

const recruiterCompanyInvitationData = {
    companyName: 'TechCorp Inc',
    inviterName: 'Alex Director',
    personalMessage: 'We would love to have you as a preferred recruiter on our platform.',
    invitationsLink: 'https://splits.network/portal/invitations',
};

const recruiterCompanyAcceptedData = {
    recruiterName: 'Jane Smith',
    companyName: 'TechCorp Inc',
    portalLink: 'https://splits.network/portal',
};

const recruiterCompanyDeclinedData = {
    recruiterName: 'Jane Smith',
    companyName: 'TechCorp Inc',
    portalLink: 'https://splits.network/portal',
};

// ── Onboarding sample data ──────────────────────────────────────────

const welcomeData = {
    userName: 'Brandon Test2',
    dashboardUrl: 'https://splits.network/portal',
};

const recruiterOnboardingData = {
    recruiterName: 'Jane Smith',
    dashboardUrl: 'https://splits.network/portal',
};

const companyWelcomeData = {
    companyName: 'TechCorp Inc',
    adminName: 'Alex Director',
    dashboardUrl: 'https://splits.network/portal',
};

// ── Job lifecycle sample data ───────────────────────────────────────

const jobCreatedConfirmationData = {
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    jobUrl: 'https://splits.network/portal/jobs/abc123',
};

const jobStatusChangedData = {
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    previousStatus: 'active',
    newStatus: 'paused',
    jobUrl: 'https://splits.network/portal/jobs/abc123',
    recipientName: 'Alex Director',
};

const jobExpiredData = {
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    jobUrl: 'https://splits.network/portal/jobs/abc123',
};

// ── Relationship sample data ────────────────────────────────────────

const connectionRequestedData = {
    companyName: 'TechCorp Inc',
    recruiterName: 'Jane Smith',
    message: 'I specialize in backend engineering placements and would love to work with your team.',
    connectionUrl: 'https://splits.network/portal/network',
};

const relationshipTerminatedData = {
    recipientName: 'Jane Smith',
    otherPartyName: 'TechCorp Inc',
    relationshipType: 'recruiter-company' as const,
    reason: 'Company has decided to work with a different recruiting firm.',
    dashboardUrl: 'https://splits.network/portal/network',
};

const invitationCancelledData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    dashboardUrl: 'https://applicant.network/dashboard',
};

// ── Security sample data ────────────────────────────────────────────

const fraudAlertData = {
    signalType: 'Duplicate Application Pattern',
    severity: 'high',
    description: 'Multiple applications submitted from the same IP address within a short time frame, using different candidate profiles.',
    entityType: 'candidate',
    entityId: 'cand_abc123',
    detectedAt: '2026-02-26T14:30:00Z',
    reviewUrl: 'https://splits.network/portal/admin/fraud',
};

const securityReplayAlertData = {
    clerkUserId: 'user_2abc123def456',
    tokenId: 'tok_replay_789xyz',
    detectedAt: '2026-02-26T14:45:00Z',
    reviewUrl: 'https://splits.network/portal/admin/security',
};

// ── Invitation accepted sample data ────────────────────────────────

const invitationAcceptedData = {
    organizationName: 'TechCorp Inc',
    newMemberName: 'Sarah Johnson',
    role: 'Hiring Manager',
};

// ── Recruiter code sample data ─────────────────────────────────────

const referralCodeRedeemedData = {
    recruiterName: 'Jane Smith',
    newUserName: 'Alex Director',
    code: 'JANESMITH2026',
    dashboardUrl: 'https://splits.network/portal/referrals',
};

// ── Document processing sample data ─────────────────────────────────

const resumeProcessedData = {
    candidateName: 'Sarah Johnson',
    fileName: 'Sarah_Johnson_Resume_2026.pdf',
    skillsCount: 12,
    experienceCount: 4,
    educationCount: 2,
    viewUrl: 'https://splits.network/portal/candidates/sarah123',
};

// ── Milestone sample data ──────────────────────────────────────────

const firstJobPostedData = {
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    jobUrl: 'https://splits.network/portal/jobs/abc123',
};

const firstPlacementData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    recruiterShare: 18750,
    placementUrl: 'https://splits.network/placements/xyz789',
};

// ── Engagement sample data ─────────────────────────────────────────

const weeklyDigestData = {
    recruiterName: 'Jane Smith',
    weekStartDate: 'Feb 17, 2026',
    weekEndDate: 'Feb 23, 2026',
    applicationsSubmitted: 8,
    applicationsAdvanced: 3,
    placementsCreated: 1,
    placementsActivated: 1,
    totalEarnings: 18750,
    dashboardUrl: 'https://splits.network/portal/dashboard',
};

const monthlyReportData = {
    companyName: 'TechCorp Inc',
    monthName: 'January',
    year: 2026,
    totalApplications: 42,
    applicationsReviewing: 12,
    applicationsInterviewing: 8,
    applicationsHired: 3,
    applicationsRejected: 15,
    activeJobs: 6,
    placementsCompleted: 2,
    dashboardUrl: 'https://splits.network/portal/dashboard',
};

const candidateReminderData = {
    candidateName: 'Sarah Johnson',
    daysSinceActivity: 35,
    profileUrl: 'https://applicant.network/portal/profile',
};

const recruiterReminderData = {
    recruiterName: 'Jane Smith',
    daysSinceActivity: 18,
    pendingApplications: 5,
    activeJobs: 12,
    dashboardUrl: 'https://splits.network/portal/dashboard',
};

// ── Payout & financial sample data ──────────────────────────────────

const payoutProcessedData = {
    recruiterName: 'Jane Smith',
    amount: '$18,750.00',
    placementTitle: 'Backend Engineer (Go) at TechCorp Inc',
    payoutUrl: 'https://splits.network/portal/billing/payouts',
};

const payoutFailedData = {
    recruiterName: 'Jane Smith',
    amount: '$18,750.00',
    reason: 'Bank account details are invalid or outdated',
    payoutUrl: 'https://splits.network/portal/billing/payouts',
};

const escrowReleasedData = {
    recruiterName: 'Jane Smith',
    amount: '$18,750.00',
    placementTitle: 'Backend Engineer (Go) at TechCorp Inc',
    billingUrl: 'https://splits.network/portal/billing',
};

const escrowAutoReleasedData = {
    recipientName: 'Jane Smith',
    amount: '$18,750.00',
    placementTitle: 'Backend Engineer (Go) at TechCorp Inc',
    billingUrl: 'https://splits.network/portal/billing',
    isRecruiter: true,
};

const invoicePaidData = {
    companyName: 'TechCorp Inc',
    amount: '$18,750.00',
    invoiceNumber: 'INV-2026-0042',
    placementTitle: 'Backend Engineer (Go)',
    billingUrl: 'https://splits.network/portal/company/billing',
};

const subscriptionCancelledData = {
    companyName: 'TechCorp Inc',
    planName: 'Professional',
    endDate: 'March 26, 2026',
    billingUrl: 'https://splits.network/portal/company/billing',
};

// ── Generate all previews ────────────────────────────────────────────

function generatePreviews() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const previews = [
        // Applications
        { name: 'application-created', html: applicationCreatedEmail(applicationCreatedData) },
        { name: 'application-stage-changed', html: applicationStageChangedEmail(applicationStageChangedData) },
        { name: 'application-accepted', html: applicationAcceptedEmail(applicationAcceptedData) },
        { name: 'application-rejected', html: applicationRejectedEmail(applicationRejectedData) },
        { name: 'application-withdrawn', html: applicationWithdrawnEmail(applicationWithdrawnData) },
        { name: 'candidate-application-submitted', html: candidateApplicationSubmittedEmail(candidateApplicationSubmittedData) },
        { name: 'company-application-received', html: companyApplicationReceivedEmail(companyApplicationReceivedData) },
        { name: 'pre-screen-requested', html: preScreenRequestedEmail(preScreenRequestedData) },
        { name: 'pre-screen-request-confirmation', html: preScreenRequestConfirmationEmail(preScreenRequestConfirmationData) },
        { name: 'application-submitted-to-company', html: applicationSubmittedToCompanyEmail(applicationSubmittedToCompanyData) },
        { name: 'ai-review-completed-candidate', html: aiReviewCompletedCandidateEmail(aiReviewCompletedCandidateData) },
        { name: 'ai-review-completed-recruiter', html: aiReviewCompletedRecruiterEmail(aiReviewCompletedRecruiterData) },
        { name: 'recruiter-proposed', html: recruiterProposedEmail(recruiterProposedData) },
        { name: 'proposal-accepted', html: proposalAcceptedByApplicationEmail(proposalAcceptedData) },
        { name: 'proposal-declined', html: proposalDeclinedByApplicationEmail(proposalDeclinedData) },
        { name: 'application-note-created', html: applicationNoteCreatedEmail(applicationNoteCreatedData) },

        // Placements
        { name: 'placement-created', html: placementCreatedEmail(placementCreatedData) },
        { name: 'placement-activated', html: placementActivatedEmail(placementActivatedData) },
        { name: 'placement-completed', html: placementCompletedEmail(placementCompletedData) },
        { name: 'placement-failed', html: placementFailedEmail(placementFailedData) },
        { name: 'guarantee-expiring', html: guaranteeExpiringEmail(guaranteeExpiringData) },

        // Candidates
        { name: 'candidate-sourced', html: candidateSourcedEmail(candidateSourcedData) },
        { name: 'ownership-conflict', html: ownershipConflictEmail(ownershipConflictData) },
        { name: 'ownership-conflict-rejection', html: ownershipConflictRejectionEmail(ownershipConflictRejectionData) },
        { name: 'candidate-added-to-network', html: candidateAddedToNetworkEmail(candidateAddedToNetworkData) },
        { name: 'collaborator-added', html: collaboratorAddedEmail(collaboratorAddedData) },
        { name: 'candidate-invitation', html: candidateInvitationEmail(candidateInvitationData) },
        { name: 'consent-given', html: consentGivenEmail(consentGivenData) },
        { name: 'consent-declined', html: consentDeclinedEmail(consentDeclinedData) },

        // Company Invitations
        { name: 'company-platform-invitation', html: companyPlatformInvitationEmail(companyPlatformInvitationData) },
        { name: 'company-invitation-accepted', html: companyInvitationAcceptedEmail(companyInvitationAcceptedData) },

        // Health Alerts
        { name: 'service-unhealthy', html: serviceUnhealthyEmail(serviceUnhealthyData) },
        { name: 'service-recovered', html: serviceRecoveredEmail(serviceRecoveredData) },

        // Firm Invitations
        { name: 'firm-invitation', html: firmInvitationEmail(firmInvitationData) },
        { name: 'invitation-revoked', html: invitationRevokedEmail(invitationRevokedData) },

        // Recruiter Submissions
        { name: 'new-opportunity', html: newOpportunityEmail(newOpportunityData) },
        { name: 'candidate-approved', html: candidateApprovedEmail(candidateApprovedData) },
        { name: 'candidate-declined', html: candidateDeclinedEmail(candidateDeclinedData) },
        { name: 'opportunity-expired', html: opportunityExpiredEmail(opportunityExpiredData) },

        // Reputation
        { name: 'tier-promotion', html: tierPromotionEmail(tierPromotionData) },
        { name: 'tier-demotion', html: tierDemotionEmail(tierDemotionData) },
        { name: 'company-tier-promotion', html: companyTierPromotionEmail(companyTierPromotionData) },
        { name: 'company-tier-demotion', html: companyTierDemotionEmail(companyTierDemotionData) },

        // Billing
        { name: 'stripe-connect-onboarded', html: stripeConnectOnboardedEmail(stripeConnectOnboardedData) },
        { name: 'stripe-connect-disabled', html: stripeConnectDisabledEmail(stripeConnectDisabledData) },
        { name: 'company-billing-setup-complete', html: companyBillingSetupCompleteEmail(companyBillingSetupCompleteData) },
        { name: 'payout-connect-required', html: payoutConnectRequiredEmail(payoutConnectRequiredData) },

        // Recruiter-Company Invitations
        { name: 'recruiter-company-invitation', html: recruiterCompanyInvitationEmail(recruiterCompanyInvitationData) },
        { name: 'recruiter-company-accepted', html: recruiterCompanyAcceptedEmail(recruiterCompanyAcceptedData) },
        { name: 'recruiter-company-declined', html: recruiterCompanyDeclinedEmail(recruiterCompanyDeclinedData) },

        // Onboarding & Welcome
        { name: 'welcome', html: welcomeEmail(welcomeData) },
        { name: 'recruiter-onboarding', html: recruiterOnboardingEmail(recruiterOnboardingData) },
        { name: 'company-welcome', html: companyWelcomeEmail(companyWelcomeData) },

        // Job Lifecycle
        { name: 'job-created-confirmation', html: jobCreatedConfirmationEmail(jobCreatedConfirmationData) },
        { name: 'job-status-changed', html: jobStatusChangedEmail(jobStatusChangedData) },
        { name: 'job-expired', html: jobExpiredEmail(jobExpiredData) },

        // Relationships
        { name: 'connection-requested', html: connectionRequestedEmail(connectionRequestedData) },
        { name: 'relationship-terminated', html: relationshipTerminatedEmail(relationshipTerminatedData) },
        { name: 'invitation-cancelled', html: invitationCancelledEmail(invitationCancelledData) },

        // Security
        { name: 'fraud-alert', html: fraudAlertEmail(fraudAlertData) },
        { name: 'security-replay-alert', html: securityReplayAlertEmail(securityReplayAlertData) },

        // Invitation Accepted
        { name: 'invitation-accepted', html: invitationAcceptedEmail(invitationAcceptedData) },

        // Recruiter Codes
        { name: 'referral-code-redeemed', html: referralCodeRedeemedEmail(referralCodeRedeemedData) },

        // Documents
        { name: 'resume-processed', html: resumeProcessedEmail(resumeProcessedData) },

        // Milestones
        { name: 'first-job-posted', html: firstJobPostedEmail(firstJobPostedData) },
        { name: 'first-placement', html: firstPlacementEmail(firstPlacementData) },

        // Engagement
        { name: 'weekly-activity-digest', html: weeklyActivityDigestEmail(weeklyDigestData) },
        { name: 'monthly-hiring-report', html: monthlyHiringReportEmail(monthlyReportData) },
        { name: 'candidate-profile-reminder', html: candidateProfileReminderEmail(candidateReminderData) },
        { name: 'recruiter-inactivity-reminder', html: recruiterInactivityReminderEmail(recruiterReminderData) },

        // Payout & Financial
        { name: 'payout-processed', html: payoutProcessedEmail(payoutProcessedData) },
        { name: 'payout-failed', html: payoutFailedEmail(payoutFailedData) },
        { name: 'escrow-released', html: escrowReleasedEmail(escrowReleasedData) },
        { name: 'escrow-auto-released', html: escrowAutoReleasedEmail(escrowAutoReleasedData) },
        { name: 'invoice-paid', html: invoicePaidEmail(invoicePaidData) },
        { name: 'subscription-cancelled', html: subscriptionCancelledEmail(subscriptionCancelledData) },
    ];

    previews.forEach(({ name, html }) => {
        const filePath = path.join(OUTPUT_DIR, `${name}.html`);
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`✓ Generated: ${name}.html`);
    });

    // Generate index file
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Templates - Splits Network</title>
    <style>
        body {
            font-family: -apple-system, 'Segoe UI', sans-serif;
            background: #f4f4f5;
            padding: 40px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 4px;
            padding: 40px;
            border: 4px solid #18181b;
        }
        h1 {
            color: #18181b;
            margin-bottom: 24px;
        }
        .links {
            display: grid;
            gap: 12px;
        }
        a {
            display: block;
            padding: 16px 20px;
            background: #f4f4f5;
            border: 2px solid #e4e4e7;
            border-radius: 4px;
            text-decoration: none;
            color: #18181b;
            font-weight: 700;
            transition: all 0.2s;
        }
        a:hover {
            background: #233876;
            color: white;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #FFE0E0;
            color: #18181b;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            margin-left: 8px;
            border: 1px solid #18181b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Template Previews</h1>
        <p style="color: #18181b; margin-bottom: 32px;">
            Click any template below to preview how it looks in an email client.
        </p>
        <div class="links">
            <h3 style="color: #18181b; margin: 24px 0 12px;">Application Emails</h3>
            <a href="application-created.html">Application Created <span class="badge">New</span></a>
            <a href="application-stage-changed.html">Stage Changed <span class="badge">Update</span></a>
            <a href="application-accepted.html">Application Accepted <span class="badge">Success</span></a>
            <a href="application-rejected.html">Application Rejected <span class="badge">Rejected</span></a>
            <a href="application-withdrawn.html">Application Withdrawn <span class="badge">Withdrawn</span></a>
            <a href="candidate-application-submitted.html">Candidate Application Submitted <span class="badge">Candidate</span></a>
            <a href="company-application-received.html">Company Application Received <span class="badge">Company</span></a>
            <a href="pre-screen-requested.html">Pre-Screen Requested <span class="badge">Action</span></a>
            <a href="pre-screen-request-confirmation.html">Pre-Screen Confirmation <span class="badge">Info</span></a>
            <a href="application-submitted-to-company.html">Submitted to Company <span class="badge">Update</span></a>
            <a href="ai-review-completed-candidate.html">AI Review — Candidate <span class="badge">AI</span></a>
            <a href="ai-review-completed-recruiter.html">AI Review — Recruiter <span class="badge">AI</span></a>
            <a href="recruiter-proposed.html">Recruiter Proposed <span class="badge">Proposal</span></a>
            <a href="proposal-accepted.html">Proposal Accepted <span class="badge">Success</span></a>
            <a href="proposal-declined.html">Proposal Declined <span class="badge">Declined</span></a>
            <a href="application-note-created.html">Application Note Created <span class="badge">Note</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Placement Emails</h3>
            <a href="placement-created.html">Placement Created <span class="badge">Celebration</span></a>
            <a href="placement-activated.html">Placement Activated <span class="badge">Started</span></a>
            <a href="placement-completed.html">Placement Completed <span class="badge">Success</span></a>
            <a href="placement-failed.html">Placement Failed <span class="badge">Issue</span></a>
            <a href="guarantee-expiring.html">Guarantee Expiring <span class="badge">Reminder</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Candidate Emails</h3>
            <a href="candidate-sourced.html">Candidate Sourced <span class="badge">Recruiter</span></a>
            <a href="ownership-conflict.html">Ownership Conflict <span class="badge">Warning</span></a>
            <a href="ownership-conflict-rejection.html">Ownership Conflict Rejection <span class="badge">Info</span></a>
            <a href="candidate-added-to-network.html">Added to Network <span class="badge">Candidate</span></a>
            <a href="collaborator-added.html">Collaborator Added <span class="badge">Split</span></a>
            <a href="candidate-invitation.html">Candidate Invitation <span class="badge">Candidate</span></a>
            <a href="consent-given.html">Consent Given <span class="badge">Success</span></a>
            <a href="consent-declined.html">Consent Declined <span class="badge">Declined</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Company Invitation Emails</h3>
            <a href="company-platform-invitation.html">Platform Invitation <span class="badge">Invite</span></a>
            <a href="company-invitation-accepted.html">Invitation Accepted <span class="badge">Success</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Health Alert Emails</h3>
            <a href="service-unhealthy.html">Service Unhealthy <span class="badge">Critical</span></a>
            <a href="service-recovered.html">Service Recovered <span class="badge">Resolved</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Firm Invitation Emails</h3>
            <a href="firm-invitation.html">Firm Invitation <span class="badge">Invite</span></a>
            <a href="invitation-accepted.html">Invitation Accepted <span class="badge">New</span></a>
            <a href="invitation-revoked.html">Invitation Revoked <span class="badge">Revoked</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Recruiter Submission Emails</h3>
            <a href="new-opportunity.html">New Opportunity <span class="badge">Candidate</span></a>
            <a href="candidate-approved.html">Candidate Approved <span class="badge">Success</span></a>
            <a href="candidate-declined.html">Candidate Declined <span class="badge">Declined</span></a>
            <a href="opportunity-expired.html">Opportunity Expired <span class="badge">Expired</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Reputation Emails</h3>
            <a href="tier-promotion.html">Tier Promotion — Recruiter <span class="badge">Promotion</span></a>
            <a href="tier-demotion.html">Tier Demotion — Recruiter <span class="badge">Demotion</span></a>
            <a href="company-tier-promotion.html">Tier Promotion — Company <span class="badge">Promotion</span></a>
            <a href="company-tier-demotion.html">Tier Demotion — Company <span class="badge">Demotion</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Billing Emails</h3>
            <a href="stripe-connect-onboarded.html">Stripe Connect Onboarded <span class="badge">Success</span></a>
            <a href="stripe-connect-disabled.html">Stripe Connect Disabled <span class="badge">Warning</span></a>
            <a href="company-billing-setup-complete.html">Billing Setup Complete <span class="badge">Company</span></a>
            <a href="payout-connect-required.html">Payout Connect Required <span class="badge">Action</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Recruiter-Company Invitation Emails</h3>
            <a href="recruiter-company-invitation.html">Recruiter Invitation <span class="badge">Invite</span></a>
            <a href="recruiter-company-accepted.html">Recruiter Accepted <span class="badge">Success</span></a>
            <a href="recruiter-company-declined.html">Recruiter Declined <span class="badge">Declined</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Onboarding & Welcome Emails</h3>
            <a href="welcome.html">Welcome Email <span class="badge">New</span></a>
            <a href="recruiter-onboarding.html">Recruiter Onboarding <span class="badge">New</span></a>
            <a href="company-welcome.html">Company Welcome <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Job Lifecycle Emails</h3>
            <a href="job-created-confirmation.html">Job Created Confirmation <span class="badge">New</span></a>
            <a href="job-status-changed.html">Job Status Changed <span class="badge">New</span></a>
            <a href="job-expired.html">Job Expired <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Relationship Emails</h3>
            <a href="connection-requested.html">Connection Requested <span class="badge">New</span></a>
            <a href="relationship-terminated.html">Relationship Terminated <span class="badge">New</span></a>
            <a href="invitation-cancelled.html">Invitation Cancelled <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Security Emails</h3>
            <a href="fraud-alert.html">Fraud Alert <span class="badge">New</span></a>
            <a href="security-replay-alert.html">Replay Attack Alert <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Recruiter Codes</h3>
            <a href="referral-code-redeemed.html">Referral Code Redeemed <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Document Processing Emails</h3>
            <a href="resume-processed.html">Resume Processed <span class="badge">New</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Milestone Emails</h3>
            <a href="first-job-posted.html">First Job Posted <span class="badge">Milestone</span></a>
            <a href="first-placement.html">First Placement <span class="badge">Milestone</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Engagement Emails</h3>
            <a href="weekly-activity-digest.html">Weekly Activity Digest <span class="badge">Digest</span></a>
            <a href="monthly-hiring-report.html">Monthly Hiring Report <span class="badge">Report</span></a>
            <a href="candidate-profile-reminder.html">Candidate Profile Reminder <span class="badge">Reminder</span></a>
            <a href="recruiter-inactivity-reminder.html">Recruiter Inactivity Reminder <span class="badge">Reminder</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Payout & Financial Emails</h3>
            <a href="payout-processed.html">Payout Processed <span class="badge">New</span></a>
            <a href="payout-failed.html">Payout Failed <span class="badge">New</span></a>
            <a href="escrow-released.html">Escrow Released <span class="badge">New</span></a>
            <a href="escrow-auto-released.html">Escrow Auto-Released <span class="badge">New</span></a>
            <a href="invoice-paid.html">Invoice Paid <span class="badge">New</span></a>
            <a href="subscription-cancelled.html">Subscription Cancelled <span class="badge">New</span></a>
        </div>
    </div>
</body>
</html>
    `.trim();

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf-8');
    console.log(`✓ Generated: index.html`);
    console.log(`\n✨ All previews generated in: ${OUTPUT_DIR}`);
    console.log(`\n📧 Open index.html to browse all email templates`);
}

// Run if executed directly
if (require.main === module) {
    generatePreviews();
}

export { generatePreviews };
