/**
 * Event Bindings Registry
 *
 * Complete list of RabbitMQ routing keys the notification service subscribes to.
 * Grouped by domain for readability. The domain consumer binds all of these
 * to its queue at startup.
 */

export const EVENT_BINDINGS = [
  // Applications domain
  'application.created',
  'application.accepted',
  'application.stage_changed',
  'application.submitted_to_company',
  'application.withdrawn',
  'application.prescreen_requested',
  'application.expired',
  'application.expiration_warning',
  'application.reactivated',
  'application.note.created',

  // AI Review
  'ai_review.started',
  'ai_review.completed',
  'ai_review.failed',
  'application.draft_completed',

  // Recruiter Submission (opportunity proposals)
  'application.recruiter_proposed',
  'application.recruiter_approved',
  'application.recruiter_declined',
  'application.recruiter_opportunity_expired',

  // Application Proposals (recruiter proposes job to candidate)
  'application.proposal_accepted',
  'application.proposal_declined',

  // Placements domain
  'placement.created',
  'placement.activated',
  'placement.completed',
  'placement.failed',
  'replacement.requested',
  'guarantee.expiring',

  // Candidates domain
  'candidate.sourced',
  'candidate.outreach_recorded',
  'candidate.invited',
  'candidate.consent_given',
  'candidate.consent_declined',
  'candidate.invitation_cancelled',
  'ownership.conflict_detected',

  // Collaboration domain
  'collaborator.added',
  'reputation.updated',
  'reputation.tier_changed',
  'company_reputation.tier_changed',

  // Invitations domain
  'invitation.created',
  'invitation.revoked',
  'invitation.accepted',

  // Company platform invitations
  'company_invitation.created',
  'company_invitation.accepted',

  // Firm invitations
  'firm.invitation.created',

  // Recruiter-company invitations
  'recruiter_company.invited',
  'recruiter_company.accepted',
  'recruiter_company.declined',

  // Billing domain
  'recruiter.stripe_connect_onboarded',
  'recruiter.stripe_connect_disabled',
  'company.billing_profile_completed',
  'payout_transaction.connect_required',
  'payout.processed',
  'payout.failed',
  'escrow.released',
  'escrow.auto_released',
  'invoice.paid',
  'subscription.cancelled',

  // Support / Chat domain
  'status.contact_submitted',
  'support_ticket.replied',
  'chat.message.created',

  // Onboarding domain
  'user.registered',
  'recruiter.created',
  'company.created',

  // Jobs domain
  'job.created',
  'job.status_changed',
  'job.updated',
  'job.deleted',
  'job_recommendation.created',

  // Relationships domain
  'recruiter_company.connection_requested',
  'recruiter_company.terminated',
  'recruiter_candidate.terminated',

  // Security domain
  'fraud_signal.created',
  'gpt.oauth.replay_detected',

  // Recruiter codes domain
  'recruiter_code.used',

  // Documents domain
  'resume.metadata.extracted',

  // Health monitoring
  'system.health.service_unhealthy',
  'system.health.service_recovered',

  // Matches domain
  'match.invited',
  'match.invite_denied',

  // Calls domain
  'call.created',
  'call.cancelled',
  'call.rescheduled',
  'call.recording_ready',
  'call.starting_soon',
  'call.reminder',
  'call.declined',
  'call.participant.joined',

  // Gamification domain
  'badge.awarded',
  'level.up',
  'streak.milestone',
] as const;

export type NotificationEventType = (typeof EVENT_BINDINGS)[number];
