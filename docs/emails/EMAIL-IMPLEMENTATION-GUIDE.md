# Email Implementation Guide

**Last Updated**: January 1, 2026  
**Version**: 1.0

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Current Email Coverage](#current-email-coverage)
4. [Missing Email Types](#missing-email-types)
5. [Implementation Instructions](#implementation-instructions)
6. [Best Practices](#best-practices)
7. [Testing](#testing)

---

## Overview

The Splits Network notification system is **event-driven** and uses **RabbitMQ** for message delivery. All email notifications are handled by the `notification-service`, which consumes events from various domain services and sends emails via the **Resend API**.

### Key Principles

- ✅ **Event-driven architecture**: Services publish events, notification-service consumes them
- ✅ **Snake_case naming**: All event field names use snake_case (e.g., `application_id`, not `applicationId`)
- ✅ **Dual notifications**: High-priority items send both email + in-app notification
- ✅ **Recipient routing**: Each email type routes to appropriate recipients (candidate, recruiter, company admins)
- ✅ **V2 standardization**: All V2 services follow consistent event publishing patterns

---

## Architecture

```
┌─────────────────┐         ┌─────────────┐         ┌─────────────────────┐
│  Domain Service │────────>│  RabbitMQ   │────────>│ Notification Service│
│  (ATS, Network, │ publish  │   Events    │ consume │  (Email Sender)     │
│   Billing, etc.)│  event   │  Exchange   │  event  │                     │
└─────────────────┘         └─────────────┘         └─────────────────────┘
                                                              │
                                                              v
                                                     ┌─────────────────┐
                                                     │   Resend API    │
                                                     │ (Email Delivery)│
                                                     └─────────────────┘
```

### Components

1. **Event Publishers** (in each service)
   - Location: `services/*/src/v2/shared/events.ts`
   - Publishes events to RabbitMQ exchange `splits-network-events`
   - Uses snake_case field names

2. **RabbitMQ**
   - Exchange: `splits-network-events` (topic exchange)
   - Routing keys: `<domain>.<entity>.<action>` (e.g., `application.created`)
   - Connection: `rabbitmq:5672`

3. **Notification Service**
   - Location: `services/notification-service/`
   - Consumes events via domain-specific consumers
   - Sends emails via Resend API
   - Logs all notifications to `notification_logs` table

4. **Email Service Layer**
   - Location: `services/notification-service/src/services/*/service.ts`
   - Contains email template logic and Resend API calls
   - Returns notification metadata for logging

---

## Current Email Coverage

### ✅ Application Lifecycle (COMPLETE)

**Events Handled**: `application.created`, `application.stage_changed`, `application.updated`

**Email Types**:
- **Recruiter Proposed** (`recruiter_proposed` stage)
  - To Candidate: Job opportunity proposal with details
  - To Recruiter: Confirmation of proposal sent
- **Screening** (`screen` stage)
  - To Candidate: Screening call scheduled
  - To Recruiter: Progress update
- **Submitted** (`submitted` stage)
  - To Candidate: Application submission confirmation
  - To Company Admins: New application received
  - To Recruiter: Status update
- **Interview** (`interview` stage)
  - To Candidate: Interview opportunity
  - To Recruiter: Progress update
- **Offer** (`offer` stage)
  - To Candidate: Offer extended
  - To Recruiter: Success notification
- **Hired** (`hired` stage)
  - To Candidate: Congratulations
  - To Recruiter: Placement success
  - To Company Admins: New hire notification
- **Rejected** (`rejected` stage)
  - To Candidate: Tactful rejection notice
  - To Recruiter: Rejection with context
- **Withdrawn** (`withdrawn` stage)
  - To Recruiter: Always notified
  - To Company: Only if submitted/interview/offer
- **Draft/AI Review** (`draft`, `ai_review` stages)
  - To Recruiter: Status updates only

**Implementation**: `services/notification-service/src/consumers/applications/consumer.ts`

### ✅ Placements (COMPLETE)

**Events Handled**: `placement.created`, `placement.status_changed`, `placement.updated`

**Email Types**:
- Placement created notification
- Placement status changes

**Implementation**: `services/notification-service/src/consumers/placements/consumer.ts`

### ✅ Recruiter-Candidate Relationships (COMPLETE)

**Events Handled**: `recruiter_candidate.created`, `recruiter_candidate.updated`, `recruiter_candidate.deleted`

**Email Types**:
- Invitation sent to candidate
- Invitation accepted/declined notifications

**Implementation**: `services/notification-service/src/consumers/recruiter-candidates/consumer.ts`

### ✅ Proposals (COMPLETE)

**Events Handled**: `proposal.created`, `proposal.accepted`, `proposal.declined`, `proposal.timed_out`

**Email Types**:
- Proposal sent to candidate
- Proposal acceptance/decline notifications

**Implementation**: `services/notification-service/src/consumers/proposals/consumer.ts`

---

## Missing Email Types

Based on comprehensive gap analysis, these email types need to be implemented:

### 🔴 HIGH PRIORITY

#### 1. Interview Management
- **Events needed**: `interview.scheduled`, `interview.rescheduled`, `interview.canceled`, `interview.reminder`
- **Recipients**: Candidate (always), Recruiter (always), Company contact (if available)
- **Critical**: Core business workflow, poor candidate experience if missing

#### 2. Payout Notifications
- **Events needed**: `payout.initiated`, `payout.completed`, `payout.failed`, `payout.on_hold`, `payout.split_distributed`
- **Recipients**: Recruiter (always), Company admins (for records), Platform admins (for failures)
- **Critical**: Trust and transparency for recruiters

#### 3. Job Lifecycle Notifications
- **Events needed**: `job.created`, `job.closed`, `job.reopened`, `job.status_changed`
- **Recipients**:
  - `job.created`: Assigned recruiters
  - `job.closed`: All recruiters with proposals, candidates with applications
  - `job.reopened`: Previous applicants/recruiters
- **Critical**: Prevents wasted effort on closed positions

#### 4. Welcome/Onboarding Emails
- **Events needed**: `user.registered`, `recruiter.onboarded`, `company.onboarded`
- **Recipients**: New user
- **Critical**: First impression, sets platform tone

#### 5. Pending Action Reminders
- **Events needed**: Scheduled job (not event-based)
  - `reminder.pending_opportunities` (for `recruiter_proposed` applications)
  - `reminder.pending_reviews` (for `screen`/`submitted` applications)
  - `reminder.incomplete_profile` (for candidates/recruiters)
- **Recipients**: User with pending action
- **Critical**: Drives engagement and completion rates

### 🟡 MEDIUM PRIORITY

#### 6. Company Actions
- **Events needed**: `candidate.unmasked`, `interview.scheduled_by_company`
- **Recipients**: Recruiter (when company acts on their candidate), Candidate (for scheduling)

#### 7. Activity Digests
- **Events needed**: Scheduled job (daily/weekly digests)
- **Recipients**: All active users
- **Content**: Summary of activity (new jobs, applications, responses)

#### 8. Collaboration/Split Notifications
- **Events needed**: `split.proposed`, `split.accepted`, `split.disputed`
- **Recipients**: All collaborating recruiters
- **Future**: Phase 2 multi-recruiter placements

#### 9. Verification/Security
- **Events needed**: `candidate.verification_requested`, `candidate.verified`, `candidate.rejected`, `password.changed`, `suspicious_activity.detected`
- **Recipients**: Candidate/recruiter being verified, User for security events

#### 10. Reputation/Milestones
- **Events needed**: `reputation.tier_changed`, `milestone.reached`
- **Recipients**: Recruiter
- **Content**: Achievements, level-ups, badges

### 🟢 NICE TO HAVE

#### 11. Platform Updates
- **Events needed**: `platform.announcement`, `platform.feature_released`
- **Recipients**: All users or targeted segments

#### 12. Engagement Emails
- **Events needed**: Scheduled (re-engagement campaigns)
- **Recipients**: Inactive users

---

## Implementation Instructions

### Step-by-Step Process

#### 1. Identify the Event

Determine:
- Which service owns the domain? (ATS, Network, Billing, etc.)
- What action triggers the email? (entity created, status changed, etc.)
- What data is needed in the event payload?

Example: For interview scheduling, ATS service owns interviews, trigger is interview creation/update.

#### 2. Publish the Event (Domain Service)

**File**: `services/<service-name>/src/v2/<domain>/service.ts`

Add event publishing to the appropriate method:

```typescript
import { EventPublisher } from '../shared/events';

export class InterviewServiceV2 {
  constructor(
    private repository: InterviewRepositoryV2,
    private events: EventPublisher
  ) {}

  async createInterview(data: CreateInterviewInput, clerkUserId: string) {
    // Create interview in database
    const interview = await this.repository.create(data, clerkUserId);
    
    // Publish event with snake_case field names
    await this.events.publish('interview.scheduled', {
      interview_id: interview.id,
      application_id: interview.application_id,
      job_id: interview.job_id,
      candidate_id: interview.candidate_id,
      recruiter_id: interview.recruiter_id,
      scheduled_at: interview.scheduled_at,
      scheduled_by: clerkUserId
    });
    
    return interview;
  }
}
```

**Critical Rules**:
- ✅ Use **snake_case** for all field names (e.g., `interview_id`, not `interviewId`)
- ✅ Include all IDs needed for recipient lookup (candidate_id, recruiter_id, job_id, company_id)
- ✅ Include metadata (timestamps, who performed action)
- ✅ Keep payloads focused (only necessary data)

#### 3. Add Event Binding (Notification Service)

**File**: `services/notification-service/src/consumers/<domain>/consumer.ts`

If the consumer doesn't exist, create it:

```typescript
// services/notification-service/src/consumers/interviews/consumer.ts
import { ConsumeMessage } from 'amqplib';
import { InterviewsEmailService } from '../../services/interviews/service';
import { ServiceRegistry } from '../../services/registry';
import { EmailLookupHelper } from '../../services/shared/email-lookup';

export class InterviewsEventConsumer {
  constructor(
    private emailService: InterviewsEmailService,
    private services: ServiceRegistry,
    private emailHelper: EmailLookupHelper
  ) {}

  async handleInterviewScheduled(msg: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(msg.content.toString());
    
    // Extract data from event payload
    const {
      interview_id,
      application_id,
      job_id,
      candidate_id,
      recruiter_id,
      scheduled_at
    } = payload;

    // Look up recipients
    const candidateEmail = await this.emailHelper.getCandidateEmail(candidate_id);
    const recruiterEmail = await this.emailHelper.getRecruiterEmail(recruiter_id);
    const companyEmails = await this.emailHelper.getCompanyAdminEmails(job_id);

    // Send to candidate
    if (candidateEmail) {
      await this.emailService.sendInterviewScheduledToCandidate({
        candidateEmail,
        interviewId: interview_id,
        scheduledAt: scheduled_at,
        // ... other data
      });
    }

    // Send to recruiter
    if (recruiterEmail) {
      await this.emailService.sendInterviewConfirmationToRecruiter({
        recruiterEmail,
        interviewId: interview_id,
        // ... other data
      });
    }

    // Send to company
    for (const email of companyEmails) {
      await this.emailService.sendInterviewNotificationToCompany({
        companyEmail: email,
        interviewId: interview_id,
        // ... other data
      });
    }
  }
}
```

**Register the consumer in domain-consumer.ts**:

```typescript
// services/notification-service/src/domain-consumer.ts

// Add import
import { InterviewsEventConsumer } from './consumers/interviews/consumer';

// In startDomainConsumers() function:
const interviewsConsumer = new InterviewsEventConsumer(
  new InterviewsEmailService(resend, notificationRepo),
  services,
  emailLookup
);

// Bind events
await channel.bindQueue(queueName, exchangeName, 'interview.scheduled');
await channel.bindQueue(queueName, exchangeName, 'interview.rescheduled');
await channel.bindQueue(queueName, exchangeName, 'interview.canceled');

// Handle messages
if (msg.fields.routingKey === 'interview.scheduled') {
  await interviewsConsumer.handleInterviewScheduled(msg);
} else if (msg.fields.routingKey === 'interview.rescheduled') {
  await interviewsConsumer.handleInterviewRescheduled(msg);
}
// ... etc
```

#### 4. Create Email Service Methods

**File**: `services/notification-service/src/services/<domain>/service.ts`

If the service doesn't exist, create it:

```typescript
// services/notification-service/src/services/interviews/service.ts
import { Resend } from 'resend';
import { NotificationRepository } from '../../repositories/notification';

export class InterviewsEmailService {
  constructor(
    private resend: Resend,
    private notificationRepo: NotificationRepository
  ) {}

  async sendInterviewScheduledToCandidate(data: {
    candidateEmail: string;
    candidateId: string;
    interviewId: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: Date;
    interviewLink?: string;
  }) {
    const { candidateEmail, candidateId, interviewId, jobTitle, companyName, scheduledAt, interviewLink } = data;

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Interview Scheduled!</h1>
            </div>
            
            <!-- Content -->
            <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hi there,</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Great news! Your interview has been scheduled for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
              </p>
              
              <!-- Interview Details Card -->
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Interview Details</p>
                <p style="margin: 0; font-size: 18px; color: #111827;">
                  <strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
              
              ${interviewLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${interviewLink}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Join Interview
                </a>
              </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  Questions? Reply to this email or contact your recruiter.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send via Resend
    const { data: emailResult, error } = await this.resend.emails.send({
      from: 'Splits Network <notifications@splits.network>',
      to: candidateEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[InterviewsEmailService] Failed to send interview scheduled email:', error);
      throw new Error(`Failed to send interview email: ${error.message}`);
    }

    // Log notification
    await this.notificationRepo.create({
      user_id: candidateId,
      type: 'interview.scheduled',
      title: 'Interview Scheduled',
      message: `Your interview for ${jobTitle} at ${companyName} has been scheduled.`,
      data: {
        interview_id: interviewId,
        scheduled_at: scheduledAt,
        job_title: jobTitle,
        company_name: companyName
      },
      channel: 'both', // email + in-app
      priority: 'high',
      read: false,
      email_id: emailResult?.id,
      email_status: 'sent',
      sent_at: new Date()
    });

    return {
      email_id: emailResult?.id,
      status: 'sent'
    };
  }

  // Additional methods: sendInterviewRescheduled, sendInterviewCanceled, etc.
}
```

#### 5. Update RabbitMQ Bindings

**File**: `services/notification-service/src/domain-consumer.ts`

Add queue bindings for new events:

```typescript
// Bind interview events
await channel.bindQueue(queueName, exchangeName, 'interview.scheduled');
await channel.bindQueue(queueName, exchangeName, 'interview.rescheduled');
await channel.bindQueue(queueName, exchangeName, 'interview.canceled');
await channel.bindQueue(queueName, exchangeName, 'interview.reminder');
```

#### 6. Test the Implementation

1. **Unit test** the email service methods
2. **Integration test** the full flow (publish event → consume → send email)
3. **Manual test** in dev environment
4. Check Resend dashboard for delivery status
5. Verify notification_logs table for records

---

## Best Practices

### Event Publishing

1. ✅ **Always use snake_case** for field names
   ```typescript
   // CORRECT
   await events.publish('interview.scheduled', {
     interview_id: id,
     candidate_id: candidateId,
     scheduled_at: scheduledAt
   });
   
   // WRONG
   await events.publish('interview.scheduled', {
     interviewId: id,
     candidateId: candidateId,
     scheduledAt: scheduledAt
   });
   ```

2. ✅ **Include all necessary IDs** for recipient lookup
   - `candidate_id`, `recruiter_id`, `job_id`, `company_id`, `application_id`

3. ✅ **Include action metadata**
   - `created_by`, `updated_by`, `changed_by` (Clerk user ID of actor)
   - Timestamps: `created_at`, `updated_at`, `scheduled_at`, etc.

4. ✅ **Keep payloads focused** - Only include data needed by consumers

### Email Content

1. ✅ **Use HTML templates** with inline CSS (email clients strip `<style>` tags)

2. ✅ **Include clear CTAs** (call-to-action buttons)
   ```html
   <a href="${actionUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
     Take Action
   </a>
   ```

3. ✅ **Brand consistency**: Use Splits Network color palette
   - Primary: `#6366f1` (indigo)
   - Secondary: `#8b5cf6` (purple)
   - Success: `#10b981` (green)
   - Warning: `#f59e0b` (amber)
   - Error: `#ef4444` (red)

4. ✅ **Mobile responsive**: Use max-width 600px, test on mobile devices

5. ✅ **Provide context**: Include job title, company name, candidate name where relevant

### Recipient Routing

1. ✅ **Always notify the candidate** (when applicable)

2. ✅ **Conditionally notify recruiter** (only when `has_recruiter=true`)

3. ✅ **Company admins for key events**: submitted, hired, withdrawn (if already submitted)

4. ✅ **Use email lookup helpers**:
   ```typescript
   const candidateEmail = await this.emailHelper.getCandidateEmail(candidate_id);
   const recruiterEmail = await this.emailHelper.getRecruiterEmail(recruiter_id);
   const companyEmails = await this.emailHelper.getCompanyAdminEmails(job_id);
   ```

### Dual Notifications

For high-priority events, send both email AND in-app notification:

```typescript
await this.notificationRepo.create({
  user_id: userId,
  type: 'interview.scheduled',
  title: 'Interview Scheduled',
  message: 'Your interview has been scheduled.',
  data: { interview_id, scheduled_at },
  channel: 'both', // ← Email + in-app
  priority: 'high', // ← High priority
  read: false,
  email_id: emailResult?.id,
  email_status: 'sent',
  sent_at: new Date()
});
```

**High-priority events**: interview scheduled, offer extended, hired, payout completed, verification required

**Normal priority**: status updates, reminders, digests

### Error Handling

1. ✅ **Log all errors** with context
   ```typescript
   console.error('[InterviewsEmailService] Failed to send email:', {
     error,
     interview_id,
     candidate_id,
     recipient: candidateEmail
   });
   ```

2. ✅ **Don't throw on email failures** - Log and continue (emails are best-effort)

3. ✅ **Store failure status** in notification_logs:
   ```typescript
   await this.notificationRepo.create({
     // ... other fields
     email_status: 'failed',
     error_message: error.message
   });
   ```

---

## Testing

### 1. Unit Tests

Test email service methods in isolation:

```typescript
// services/notification-service/tests/services/interviews.test.ts
import { describe, it, expect, vi } from 'vitest';
import { InterviewsEmailService } from '../../src/services/interviews/service';

describe('InterviewsEmailService', () => {
  it('sends interview scheduled email to candidate', async () => {
    const mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: 'email-123' } })
      }
    };
    const mockRepo = {
      create: vi.fn()
    };
    
    const service = new InterviewsEmailService(mockResend as any, mockRepo as any);
    
    await service.sendInterviewScheduledToCandidate({
      candidateEmail: 'candidate@example.com',
      candidateId: 'cand-123',
      interviewId: 'int-123',
      jobTitle: 'Senior Engineer',
      companyName: 'Tech Corp',
      scheduledAt: new Date('2026-01-15T10:00:00Z')
    });
    
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'candidate@example.com',
        subject: expect.stringContaining('Interview Scheduled')
      })
    );
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests

Test full event flow:

```typescript
// services/notification-service/tests/integration/interviews.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import amqp from 'amqplib';

describe('Interview Email Integration', () => {
  let connection: amqp.Connection;
  let channel: amqp.Channel;
  
  beforeAll(async () => {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();
  });
  
  afterAll(async () => {
    await channel.close();
    await connection.close();
  });
  
  it('processes interview.scheduled event and sends email', async () => {
    // Publish test event
    await channel.publish(
      'splits-network-events',
      'interview.scheduled',
      Buffer.from(JSON.stringify({
        interview_id: 'test-int-123',
        candidate_id: 'test-cand-123',
        recruiter_id: 'test-rec-123',
        scheduled_at: new Date().toISOString()
      }))
    );
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check notification_logs table for record
    // ... database assertion
  });
});
```

### 3. Manual Testing (Dev Environment)

1. **Start all services**:
   ```bash
   cd g:\code\splits.network
   docker-compose up -d
   ```

2. **Trigger event** via API or direct database insert:
   ```bash
   # Example: Create interview via API
   curl -X POST http://localhost:3002/v2/interviews \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "application_id": "app-123",
       "scheduled_at": "2026-01-15T10:00:00Z"
     }'
   ```

3. **Check RabbitMQ Management UI**:
   - URL: http://localhost:15672
   - Verify message was published and consumed

4. **Check Resend Dashboard**:
   - URL: https://resend.com/emails
   - Verify email was sent

5. **Check database**:
   ```sql
   SELECT * FROM notification_logs 
   WHERE type = 'interview.scheduled' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### 4. Smoke Testing Checklist

Before deploying:

- [ ] Event published with correct snake_case field names
- [ ] RabbitMQ queue binding exists for routing key
- [ ] Consumer handler registered in domain-consumer.ts
- [ ] Email service method sends via Resend
- [ ] Notification logged to database
- [ ] Correct recipients receive emails
- [ ] Email HTML renders correctly on desktop
- [ ] Email HTML renders correctly on mobile
- [ ] Links in email work correctly
- [ ] No errors in notification-service logs

---

## Troubleshooting

### Event not being consumed

1. **Check RabbitMQ bindings**:
   ```bash
   docker exec splits-rabbitmq rabbitmqctl list_bindings
   ```

2. **Verify routing key** matches binding pattern:
   - Publisher: `interview.scheduled`
   - Binding: `interview.scheduled` (exact match)

3. **Check consumer is running**:
   ```bash
   docker logs splits-notification-service | grep "handleInterviewScheduled"
   ```

### Email not sending

1. **Check Resend API key** is configured:
   ```bash
   docker exec splits-notification-service env | grep RESEND
   ```

2. **Check Resend logs** in dashboard for errors

3. **Verify recipient email** is valid (not placeholder/test email)

### Wrong recipient receiving email

1. **Check email lookup logic** in consumer:
   ```typescript
   const candidateEmail = await this.emailHelper.getCandidateEmail(candidate_id);
   console.log('Sending to candidate:', candidateEmail);
   ```

2. **Verify IDs in event payload** are correct

3. **Check database** for correct user/candidate/recruiter records

### Email HTML broken

1. **Test email rendering** using Resend preview or Litmus
2. **Verify inline CSS** (no external stylesheets)
3. **Check HTML structure** is valid
4. **Test on multiple email clients** (Gmail, Outlook, Apple Mail)

---

## Additional Resources

- **Resend Documentation**: https://resend.com/docs
- **RabbitMQ Documentation**: https://www.rabbitmq.com/documentation.html
- **Email HTML Best Practices**: https://www.litmus.com/blog/email-design-best-practices/
- **Can I Email**: https://www.caniemail.com/ (check CSS support)

---

## Changelog

### Version 1.0 (January 1, 2026)
- Initial documentation created
- Documented current email coverage (applications, placements, recruiter-candidates, proposals)
- Identified 12 categories of missing emails
- Provided step-by-step implementation instructions
- Added best practices and testing guidelines
