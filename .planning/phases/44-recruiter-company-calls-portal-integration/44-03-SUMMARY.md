---
phase: 44-recruiter-company-calls-portal-integration
plan: 03
subsystem: notifications
tags: [rabbitmq, email, resend, call-lifecycle, notifications]
depends_on: [44-01]
provides: [call-notification-consumer, call-email-templates, call-notification-service]
affects: [44-05, 44-06]
tech_stack:
  added: []
  patterns: [event-driven-notifications, brand-aware-email, participant-based-routing]
key_files:
  created:
    - services/notification-service/src/consumers/calls/consumer.ts
    - services/notification-service/src/services/calls/service.ts
    - services/notification-service/src/templates/calls/confirmation.ts
    - services/notification-service/src/templates/calls/reminder.ts
    - services/notification-service/src/templates/calls/cancellation.ts
    - services/notification-service/src/templates/calls/reschedule.ts
    - services/notification-service/src/templates/calls/recording-ready.ts
    - services/notification-service/src/templates/calls/instant-call.ts
    - services/notification-service/src/templates/calls/index.ts
  modified:
    - services/notification-service/src/domain-consumer.ts
    - services/notification-service/src/service.ts
metrics:
  duration: 4min
  completed: 2026-03-09
---

# Phase 44 Plan 03: Call Notification Consumer & Email Templates Summary

**One-liner:** RabbitMQ consumer + 6 Basel-themed email templates for full call lifecycle notifications with brand-aware participant routing

## What Was Built

### Call Notification Consumer (`consumers/calls/consumer.ts`)
- Routes `call.created`, `call.cancelled`, `call.rescheduled`, `call.recording.ready` events
- `call.created` branches: if `scheduled_at` exists sends confirmation to all participants, otherwise sends instant call notification to non-creator participants only
- Resolves participant contacts via ContactLookupHelper, entity context (company name, job title) via DataLookupHelper
- Brand detection from entity links: candidate entities use applicant.network brand, all others use splits.network

### Call Email Service (`services/calls/service.ts`)
- `CallsEmailService` class following identical pattern to `InterviewsEmailService`
- Methods: sendConfirmation, sendInstantCallNotification, sendCancellation, sendRescheduleNotification, sendReminder, sendRecordingReady
- Each method creates notification log entry, sends via Resend, updates log with success/failure
- Proper priority levels: instant calls are `urgent`, scheduled notifications are `high`, recording ready is `normal`

### Email Templates (6 templates)
1. **confirmation.ts** - "Your call is scheduled" with date/time, participants, entity context, agenda, dual CTAs (Join Call + View in Portal)
2. **reminder.ts** - "Your call is coming up" with configurable timeUntil, escalating urgency (full-width CTA for imminent calls)
3. **cancellation.ts** - "Call cancelled" with who cancelled, reason, warning alert
4. **reschedule.ts** - "Call rescheduled" with new date/time highlighted, updated Join Call button
5. **recording-ready.ts** - "Your recording is ready" with call date, duration, View Recording button
6. **instant-call.ts** - "{name} is calling you" with prominent Join Call button, urgency styling with teal accent border

### Registration
- `CallsEmailService` added to `NotificationService` coordinator
- `CallsEventConsumer` instantiated in `DomainEventConsumer` constructor
- Queue bindings added for all 4 call event types
- Switch cases added in `handleEvent` for routing

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Single commit for consumer + templates | Consumer and templates are tightly coupled; one is useless without the other |
| Participant-based routing (not role-based) | Calls have simpler participant model than interviews; all participants get same notification |
| Brand from entity links | Matches existing interview pattern; candidate entity links trigger applicant.network branding |
| Instant call excludes creator | Creator initiated the call, does not need notification about their own action |
| Reminder template returns {subject, html} | Follows interview reminder pattern for flexible subject line generation |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/notification-service build` compiles cleanly with zero errors
- All 6 templates use shared base layout and components (heading, paragraph, button, infoCard, alert, divider)
- All templates accept `source` parameter for brand-aware rendering
- Consumer correctly filters instant call recipients (excludes creator)

## Next Phase Readiness

- Templates are ready for use when call-service emits RabbitMQ events
- Reminder functionality requires a scheduler/cron to emit reminder events (not part of this plan)
- Portal call detail page URL pattern assumed as `/portal/calls/{callId}`
