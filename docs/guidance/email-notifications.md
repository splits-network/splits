# Email Notifications Guidance

This document explains how email notifications work in Splits Network and how to properly implement them.

---

## Architecture Overview

Email notifications in Splits Network use an **event-driven architecture**:

1. **Domain services** (ATS, Network, Billing, etc.) publish domain events to RabbitMQ
2. **RabbitMQ** routes events to the notification service queue
3. **Notification service** consumes events and sends transactional emails via Resend

```
┌─────────────────┐
│  ATS Service    │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────────┐    ┌──────────────────┐    ┌──────────┐
│ Network Service │──┼───→│  RabbitMQ    │───→│  Notification    │───→│  Resend  │
└─────────────────┘  │    │   Exchange   │    │    Service       │    │  (SMTP)  │
                     │    └──────────────┘    └──────────────────┘    └──────────┘
┌─────────────────┐  │
│ Billing Service │──┘
└─────────────────┘
```

**Why this architecture?**
- Decouples email sending from business logic
- Allows multiple services to trigger emails without depending on notification service
- RabbitMQ provides reliability and retry mechanisms
- Centralized email template management

---

## Publishing Events (From Domain Services)

### Step 1: Use the EventPublisher

All services have an `EventPublisher` instance that connects to RabbitMQ:

```typescript
// services/ats-service/src/events.ts
export class EventPublisher {
    async publish(
        eventType: string,           // e.g., "application.created"
        payload: Record<string, any>, // Event data
        sourceService: string         // e.g., "ats-service"
    ): Promise<void>
}
```

### Step 2: Publish Events in Your Service

When a significant domain action occurs, publish an event:

```typescript
// Example: services/ats-service/src/services/applications/service.ts

async submitCandidateApplication(...) {
    // 1. Perform business logic (save to DB, etc.)
    const application = await this.repository.create(...);
    
    // 2. Publish event
    await this.eventPublisher.publish(
        'application.created',  // Event type (use dot notation!)
        {
            application_id: application.id,
            job_id: jobId,
            candidate_id: candidateId,
            candidate_user_id: candidateUserId,
            recruiter_id: recruiterId,
            company_id: job.company_id,
            stage: initialStage,
            has_recruiter: hasRecruiter,
        },
        'ats-service'
    );
    
    return application;
}
```

### Step 3: Event Naming Conventions

Use **dot notation** for event types following this pattern:

```
<domain>.<action>
```

Examples:
- `application.created` ✅
- `application.stage_changed` ✅
- `placement.created` ✅
- `proposal.accepted` ✅
- `candidate.invited` ✅

**DO NOT** use underscores in event type routing:
- `application_created` ❌ (RabbitMQ won't route correctly)

### Step 4: Include All Necessary Context

The event payload should include:
- **IDs**: All relevant entity IDs (user_id, application_id, job_id, etc.)
- **Context**: Information needed to determine email recipients and content
- **Avoid**: Large objects or sensitive data (fetch fresh data in notification service)

```typescript
// GOOD ✅
{
    application_id: "uuid",
    candidate_user_id: "uuid",  // For looking up email
    recruiter_id: "uuid",       // For looking up recruiter
    has_recruiter: true,        // Context for email logic
    stage: "screen"             // Context for email type
}

// BAD ❌
{
    application: { ...entire_object... },  // Too much data
    password: "secret123",                  // Never send sensitive data
}
```

---

## Critical: Routing Key Configuration

### The Problem We Encountered

RabbitMQ uses **routing keys** to match events to queues. The routing key MUST match the binding pattern.

**Bug we fixed (2024-12-20):**
```typescript
// WRONG ❌ - Only replaces first dot
const routingKey = eventType.replace('.', '_');
// "application.created" becomes "application_created" (doesn't match binding)

// CORRECT ✅ - Use event type as-is
const routingKey = eventType;
// "application.created" stays "application.created" (matches binding)
```

### Current Implementation

**Publisher** (`services/*/src/events.ts`):
```typescript
const routingKey = eventType;  // Use as-is with dots
this.channel.publish(this.exchange, routingKey, message, {
    persistent: true,
    contentType: 'application/json',
});
```

**Consumer** (`services/notification-service/src/domain-consumer.ts`):
```typescript
// Bind to events using dot notation
await this.channel.bindQueue(this.queue, this.exchange, 'application.created');
await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');
await this.channel.bindQueue(this.queue, this.exchange, 'placement.created');
```

**Rule:** Publisher routing key and consumer binding pattern MUST match exactly.

---

## Consuming Events (In Notification Service)

### Step 1: Bind to the Event

Register your event binding in `services/notification-service/src/domain-consumer.ts`:

```typescript
async connect(): Promise<void> {
    // ... existing code ...
    
    // Add your new event binding
    await this.channel.bindQueue(this.queue, this.exchange, 'your.new.event');
    
    this.logger.info('Connected to RabbitMQ and bound to events');
}
```

### Step 2: Add Event Handler Routing

Route the event to the appropriate consumer:

```typescript
private async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.event_type) {
        case 'your.new.event':
            await this.yourConsumer.handleYourEvent(event);
            break;
        
        // ... existing cases ...
    }
}
```

### Step 3: Create Event Handler

Implement the handler in a domain-specific consumer:

```typescript
// services/notification-service/src/consumers/your-domain/consumer.ts

export class YourDomainEventConsumer {
    constructor(
        private emailService: YourDomainEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handleYourEvent(event: DomainEvent): Promise<void> {
        try {
            const { entity_id, user_id } = event.payload;
            
            console.log('[YOUR-CONSUMER] 🎯 Handling your.new.event:', { entity_id });
            
            // 1. Fetch fresh data from services
            const entityResponse = await this.services.getYourService().get(`/entities/${entity_id}`);
            const entity = entityResponse.data || entityResponse;
            
            const userResponse = await this.services.getIdentityService().get(`/users/${user_id}`);
            const user = userResponse.data || userResponse;
            
            // 2. Send email
            console.log('[YOUR-CONSUMER] 📧 Sending email to:', user.email);
            await this.emailService.sendYourNotification(user.email, {
                entityName: entity.name,
                userId: user.id,
            });
            console.log('[YOUR-CONSUMER] ✅ Email sent successfully');
            
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send your notification'
            );
            throw error;
        }
    }
}
```

### Step 4: Implement Email Service

Create the email sending logic:

```typescript
// services/notification-service/src/services/your-domain/service.ts

export class YourDomainEmailService {
    constructor(
        private resend: Resend,
        private logger: Logger
    ) {}

    async sendYourNotification(to: string, data: any): Promise<void> {
        const subject = `Your notification about ${data.entityName}`;
        const html = await renderTemplate('your-template.html', data);
        
        await this.resend.emails.send({
            from: 'Splits Network <notifications@splits.network>',
            to,
            subject,
            html,
        });
        
        this.logger.info({ to, subject }, 'Email sent via Resend');
    }
}
```

---

## Email Templates

### Template System

Splits Network uses a **template-based email system** powered by Resend.

**Template location:** `services/notification-service/src/templates/`

**Template structure:**
```
templates/
├── applications/
│   ├── candidate-submitted.html
│   ├── recruiter-pending.html
│   └── company-received.html
├── placements/
│   └── placement-created.html
└── shared/
    ├── header.html
    └── footer.html
```

### Creating a New Template

1. Create HTML file in appropriate domain folder
2. Use inline CSS (email clients require inline styles)
3. Include dynamic data via template variables
4. Test template rendering

Example template:
```html
<!-- templates/applications/candidate-submitted.html -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Application Submitted</h1>
        <p>Hi {{candidateName}},</p>
        <p>Your application for <strong>{{jobTitle}}</strong> at {{companyName}} has been submitted successfully.</p>
        <p>{{nextSteps}}</p>
        <a href="{{portalUrl}}/applications/{{applicationId}}" class="button">View Application</a>
    </div>
</body>
</html>
```

### Template Best Practices

- **Inline CSS**: Many email clients strip `<style>` tags
- **Responsive**: Use max-width and fluid layouts
- **Plain text fallback**: Provide text-only version if possible
- **Test across clients**: Gmail, Outlook, Apple Mail, mobile devices
- **Avoid JavaScript**: Email clients block JavaScript
- **Keep it simple**: Complex layouts break in email

---

## Debugging Email Flow

### Check if Event was Published

```powershell
# Watch ATS service logs (or other service)
docker logs splits-ats-service --follow

# Look for:
# [ATS-SERVICE] 📧 Publishing application.created event to RabbitMQ
# [ATS-SERVICE] ✅ Event published successfully
```

### Check if Event was Received

```powershell
# Watch notification service logs
docker logs splits-notification-service --follow

# Look for:
# [NOTIFICATION-SERVICE] 📨 Received event from RabbitMQ
# [APPLICATIONS-CONSUMER] 🎯 Starting to handle application.created event
# [APPLICATIONS-CONSUMER] 📧 Sending email to: user@example.com
# [APPLICATIONS-CONSUMER] ✅ Email sent successfully
```

### Common Issues

#### 1. Event Published but Not Received

**Symptom:** ATS shows "Event published successfully" but notification service logs are silent.

**Cause:** Routing key mismatch between publisher and consumer.

**Solution:** 
- Check `services/*/src/events.ts` - routing key should be `eventType` (with dots)
- Check `services/notification-service/src/domain-consumer.ts` - binding should match exactly
- Ensure event type uses dot notation: `application.created` not `application_created`

#### 2. RabbitMQ Not Connected

**Symptom:** Log shows "❌ CRITICAL: RabbitMQ not connected"

**Cause:** RabbitMQ container not running or connection string incorrect.

**Solution:**
```powershell
# Check RabbitMQ status
docker ps --filter "name=rabbit"

# Restart if needed
docker restart splits-rabbitmq

# Check environment variable in service
docker exec splits-ats-service env | grep RABBITMQ
```

#### 3. Email Sent but Not Received

**Symptom:** Logs show "Email sent via Resend" but inbox is empty.

**Cause:** Resend API key invalid, email in spam, or rate limits.

**Solution:**
- Check Resend dashboard for delivery status
- Verify API key: `docker exec splits-notification-service env | grep RESEND_API_KEY`
- Check spam folder
- Review Resend sending limits

#### 4. Missing User Data

**Symptom:** Error "Candidate user account not found"

**Cause:** Event missing `candidate_user_id` or user not in identity service.

**Solution:**
- Ensure API Gateway passes `candidate_user_id` from Clerk auth token
- Verify user exists in `users` table
- Check event payload includes required user ID fields

---

## Adding Comprehensive Logging

When implementing new email handlers, add detailed logging for debugging:

```typescript
async handleYourEvent(event: DomainEvent): Promise<void> {
    try {
        const { entity_id, user_id } = event.payload;
        
        // Log event received
        console.log('[YOUR-CONSUMER] 🎯 Starting to handle your.event:', {
            entity_id,
            user_id,
            timestamp: new Date().toISOString(),
        });
        
        // Log data fetching
        console.log('[YOUR-CONSUMER] 🔍 Fetching entity details...');
        const entity = await this.fetchEntity(entity_id);
        
        // Log scenario/branch taken
        console.log('[YOUR-CONSUMER] 📋 Scenario: User notification');
        
        // Log before email send
        console.log('[YOUR-CONSUMER] 📧 Sending email to:', user.email);
        await this.sendEmail(user.email, data);
        
        // Log success
        console.log('[YOUR-CONSUMER] ✅ Email sent successfully');
        console.log('[YOUR-CONSUMER] 🎉 Handler complete');
        
    } catch (error) {
        // Log errors with full context
        console.error('[YOUR-CONSUMER] ❌ Handler failed:', {
            error: error.message,
            stack: error.stack,
            event_payload: event.payload,
        });
        throw error;
    }
}
```

**Logging best practices:**
- Use emojis for visual scanning (🎯📧✅❌🔍)
- Include context (IDs, email addresses, timestamps)
- Log decision points (which scenario/branch)
- Log before and after async operations
- Include full error context

---

## Security Considerations

### Never Send Sensitive Data in Events

```typescript
// BAD ❌
await eventPublisher.publish('user.created', {
    user_id: user.id,
    password: user.password,           // NEVER!
    ssn: user.ssn,                     // NEVER!
    credit_card: user.payment_method,  // NEVER!
});

// GOOD ✅
await eventPublisher.publish('user.created', {
    user_id: user.id,
    email: user.email,
    role: user.role,
});
```

### Fetch Fresh Data in Handlers

Always fetch current data from services rather than trusting event payload:

```typescript
// Fetch user details fresh (in case email changed)
const userResponse = await this.services.getIdentityService().get(`/users/${user_id}`);
const user = userResponse.data || userResponse;

// Send to current email address, not stale payload email
await this.emailService.send(user.email, ...);
```

### Validate Recipients

```typescript
// Ensure user has permission to receive this notification
if (!user.email_notifications_enabled) {
    console.log('[CONSUMER] ⚠️ User has disabled email notifications');
    return;
}

// Validate email format
if (!isValidEmail(user.email)) {
    throw new Error(`Invalid email format: ${user.email}`);
}
```

---

## Performance Considerations

### Batch Operations

When sending multiple emails (e.g., to all company admins), use batch operations:

```typescript
// Fetch all recipients first
const admins = await this.fetchCompanyAdmins(company_id);

// Send emails in parallel (but rate-limit)
await Promise.all(
    admins.map(admin => 
        this.emailService.send(admin.email, data)
    )
);
```

### Rate Limiting

Resend has rate limits. For bulk operations:
- Use batch send API when available
- Implement exponential backoff on failures
- Consider queueing for very large batches (>100 emails)

### Monitoring

Track email metrics:
- Emails sent per event type
- Delivery success/failure rates
- Average processing time
- RabbitMQ queue depth

---

## Testing Email Flow

### Unit Tests

Test event handlers in isolation:

```typescript
describe('ApplicationsEventConsumer', () => {
    it('should send candidate email on application.created', async () => {
        const mockServices = createMockServices();
        const mockEmailService = createMockEmailService();
        const consumer = new ApplicationsEventConsumer(mockEmailService, mockServices);
        
        const event = {
            event_type: 'application.created',
            payload: {
                application_id: 'test-id',
                candidate_user_id: 'user-123',
                has_recruiter: true,
                stage: 'screen',
            },
        };
        
        await consumer.handleCandidateApplicationSubmitted(event);
        
        expect(mockEmailService.sendCandidateApplicationSubmitted).toHaveBeenCalled();
    });
});
```

### Integration Tests

Test full flow from event publish to email send:

```typescript
describe('Email Flow Integration', () => {
    it('should send email when application is submitted', async () => {
        // 1. Submit application via API
        const response = await request(app)
            .post('/api/applications/submit')
            .send({ job_id: 'test-job', ... });
        
        // 2. Wait for async processing
        await sleep(1000);
        
        // 3. Verify email was sent
        const emails = await resendClient.emails.list();
        expect(emails).toContainEmailTo('candidate@example.com');
    });
});
```

### Manual Testing

```powershell
# 1. Start all services
docker-compose up -d

# 2. Watch logs in separate terminals
docker logs splits-ats-service --follow
docker logs splits-notification-service --follow

# 3. Trigger action (submit application, etc.)
# 4. Verify logs show full flow
# 5. Check Resend dashboard for delivery
```

---

## Checklist: Adding a New Email Notification

- [ ] Define event type using dot notation (e.g., `entity.action`)
- [ ] Publish event from domain service with all required IDs
- [ ] Add event binding in notification service `domain-consumer.ts`
- [ ] Create event handler in appropriate consumer class
- [ ] Implement email service method
- [ ] Create HTML email template
- [ ] Add comprehensive logging throughout handler
- [ ] Test locally with Docker logs
- [ ] Verify in Resend dashboard
- [ ] Add unit tests for handler
- [ ] Update this documentation with new event type

---

## Reference: Complete Event Handler Example

```typescript
// services/notification-service/src/consumers/applications/consumer.ts

async handleCandidateApplicationSubmitted(event: DomainEvent): Promise<void> {
    try {
        const { 
            application_id, 
            job_id, 
            candidate_id, 
            candidate_user_id, 
            recruiter_id, 
            has_recruiter, 
            stage 
        } = event.payload;

        console.log('[APPLICATIONS-CONSUMER] 🎯 Starting to handle application.created event:', {
            application_id,
            has_recruiter,
            stage,
            candidate_user_id,
            recruiter_id,
        });

        // Fetch fresh data
        console.log('[APPLICATIONS-CONSUMER] 🔍 Fetching job and candidate details...');
        const jobResponse = await this.services.getAtsService().get(`/jobs/${job_id}`);
        const job = jobResponse.data || jobResponse;

        const candidateResponse = await this.services.getAtsService().get(`/candidates/${candidate_id}`);
        const candidate = candidateResponse.data || candidateResponse;

        // Get candidate user (may not exist)
        let candidateUser = null;
        if (candidate_user_id) {
            const userResponse = await this.services.getIdentityService().get(`/users/${candidate_user_id}`);
            candidateUser = userResponse.data || userResponse;
            console.log('[APPLICATIONS-CONSUMER] ✓ Found candidate user');
        } else {
            console.log('[APPLICATIONS-CONSUMER] ⚠️ No candidate user ID');
        }

        // Scenario: Candidate with recruiter
        if (has_recruiter && stage === 'screen') {
            console.log('[APPLICATIONS-CONSUMER] 📋 Scenario: Candidate with recruiter');

            // Send to candidate
            if (candidateUser) {
                console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to candidate:', candidate.email);
                await this.emailService.sendCandidateApplicationSubmitted(candidate.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    hasRecruiter: true,
                    nextSteps: 'Your application has been sent to your recruiter for review.',
                    applicationId: application_id,
                    userId: candidateUser.id,
                });
                console.log('[APPLICATIONS-CONSUMER] ✅ Candidate email sent');
            }

            // Send to recruiter
            console.log('[APPLICATIONS-CONSUMER] 🔍 Fetching recruiter details...');
            const recruiterResponse = await this.services.getNetworkService().get(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            const recruiterUserResponse = await this.services.getIdentityService().get(`/users/${recruiter.user_id}`);
            const recruiterUser = recruiterUserResponse.data || recruiterUserResponse;

            console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to recruiter:', recruiterUser.email);
            await this.emailService.sendRecruiterApplicationPending(recruiterUser.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                applicationId: application_id,
                userId: recruiter.user_id,
            });
            console.log('[APPLICATIONS-CONSUMER] ✅ Recruiter email sent');
            console.log('[APPLICATIONS-CONSUMER] 🎉 Scenario complete - all notifications sent');

            return;
        }

        console.log('[APPLICATIONS-CONSUMER] ⚠️ No scenario matched:', { has_recruiter, stage });

    } catch (error) {
        console.error('[APPLICATIONS-CONSUMER] ❌ Handler failed:', {
            error: error.message,
            stack: error.stack,
            event_payload: event.payload,
        });
        this.logger.error(
            { error, event_payload: event.payload },
            'Failed to send candidate application submitted notification'
        );
        throw error;
    }
}
```

---

## Resources

- **RabbitMQ Documentation**: https://www.rabbitmq.com/docs
- **Resend Documentation**: https://resend.com/docs
- **Email Best Practices**: https://www.emailonacid.com/blog/
- **Transactional Email Guide**: https://postmarkapp.com/guides/transactional-email-best-practices

---

**Last Updated**: December 20, 2024  
**Version**: 1.0  
**Author**: Splits Network Engineering Team
