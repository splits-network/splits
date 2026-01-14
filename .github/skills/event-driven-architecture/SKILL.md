---
name: event-driven-architecture
description: Event-driven architecture patterns for RabbitMQ-based service coordination
alwaysApply: false
applyTo:
  - "services/**/consumers/**"
  - "services/**/v2/shared/events.ts"
  - "packages/shared-job-queue/**"
---

# Event-Driven Architecture Skill

This skill provides guidance for event-driven patterns using RabbitMQ in Splits Network.

## Purpose

Help developers implement reliable, decoupled service coordination:
- **Event Publishing**: How services emit domain events
- **Event Consumers**: How services react to events
- **Event Schemas**: Standardized event structure
- **Error Handling**: Retry logic and dead-letter queues
- **Testing**: Testing event flows

## When to Use This Skill

Use this skill when:
- Publishing domain events from services
- Creating event consumers to react to domain changes
- Designing event payloads
- Handling event processing errors
- Testing event-driven flows

## Core Principles

### 1. Event Publishing Pattern

All V2 services use `EventPublisher` class for consistent event emission:

```typescript
// services/ats-service/src/v2/shared/events.ts
import { JobQueueClient } from '@splits-network/shared-job-queue';

export class EventPublisher {
  constructor(private queue: JobQueueClient) {}

  async publish(eventType: string, payload: Record<string, any>): Promise<void> {
    try {
      await this.queue.publish('domain.events', {
        type: eventType,
        payload,
        timestamp: new Date().toISOString(),
        service: 'ats-service',
        version: '1.0'
      });
    } catch (error) {
      console.error(`Failed to publish ${eventType}:`, error);
      // Event publishing failures should not break the main operation
      // Log and monitor, but don't throw
    }
  }
}
```

**Key Rules**:
- ✅ Always use `EventPublisher` class (don't publish directly)
- ✅ Never throw errors from event publishing (log only)
- ✅ Include service name and version in event metadata
- ✅ Use ISO timestamps for event timing

See [examples/event-publisher.ts](./examples/event-publisher.ts).

### 2. Event Naming Convention

Events follow `domain.action` pattern in past tense:

```typescript
// Domain: jobs
'job.created'
'job.updated'
'job.closed'
'job.reopened'

// Domain: applications
'application.created'
'application.stage_changed'
'application.withdrawn'
'application.accepted'

// Domain: placements
'placement.created'
'placement.activated'
'placement.completed'

// Domain: recruiters
'recruiter.created'
'recruiter.status_changed'
'recruiter.profile_updated'
```

**Pattern Rules**:
- Use lowercase with underscores
- Use past tense (what happened, not what will happen)
- Be specific but concise
- Include domain prefix for clarity

See [references/event-naming-conventions.md](./references/event-naming-conventions.md).

### 3. Event Payload Structure

Events contain minimal, essential data:

```typescript
// ✅ CORRECT - Minimal payload with IDs
await this.eventPublisher.publish('application.stage_changed', {
  applicationId: application.id,
  candidateId: application.candidate_id,
  jobId: application.job_id,
  oldStage: previousStage,
  newStage: application.stage,
  changedBy: userContext.identityUserId,
  changedAt: new Date().toISOString()
});

// ❌ WRONG - Including full objects
await this.eventPublisher.publish('application.stage_changed', {
  application: entireApplicationObject, // Too much data
  candidate: entireCandidateObject,
  job: entireJobObject
});
```

**Payload Rules**:
- ✅ Include primary resource ID
- ✅ Include foreign key IDs for related entities
- ✅ Include changed fields (old/new values)
- ✅ Include actor ID (who triggered the change)
- ✅ Include timestamp when relevant
- ❌ Don't include full nested objects
- ❌ Don't include sensitive data (passwords, tokens)

See [examples/event-payloads.ts](./examples/event-payloads.ts).

### 4. Event Consumer Pattern

Consumers use `DomainConsumer` class to process events:

```typescript
// services/notification-service/src/consumers/applications.ts
import { JobQueueClient } from '@splits-network/shared-job-queue';

export class ApplicationEventsConsumer {
  constructor(
    private queue: JobQueueClient,
    private notificationService: NotificationService
  ) {}

  async start(): Promise<void> {
    // Subscribe to application events
    await this.queue.subscribe('domain.events', 'notification-service', async (message) => {
      const { type, payload } = message;
      
      try {
        switch (type) {
          case 'application.created':
            await this.handleApplicationCreated(payload);
            break;
            
          case 'application.stage_changed':
            await this.handleApplicationStageChanged(payload);
            break;
            
          case 'application.accepted':
            await this.handleApplicationAccepted(payload);
            break;
            
          default:
            // Unknown event type - ignore silently
            break;
        }
      } catch (error) {
        console.error(`Error processing ${type}:`, error);
        throw error; // Trigger retry
      }
    });
  }

  private async handleApplicationCreated(payload: any): Promise<void> {
    const { applicationId, candidateId, jobId } = payload;
    
    // Fetch additional data if needed
    const application = await this.fetchApplicationData(applicationId);
    
    // Send notification
    await this.notificationService.sendApplicationCreatedEmail(application);
  }
}
```

**Consumer Rules**:
- ✅ Handle only events you care about
- ✅ Ignore unknown events silently
- ✅ Fetch additional data as needed (don't rely on payload having everything)
- ✅ Throw errors for retry-worthy failures
- ✅ Log errors for monitoring
- ❌ Don't process events synchronously in the publisher

See [examples/event-consumer.ts](./examples/event-consumer.ts).

### 5. Error Handling & Retries

RabbitMQ retries failed messages automatically:

```typescript
async handleEvent(message: any): Promise<void> {
  try {
    // Process event
    await this.processEvent(message);
  } catch (error) {
    // Check if error is retry-worthy
    if (this.shouldRetry(error)) {
      console.error('Retriable error:', error);
      throw error; // RabbitMQ will retry
    } else {
      // Non-retriable error (bad data, etc.)
      console.error('Non-retriable error:', error);
      // Log to monitoring, don't throw
      // Message will be acknowledged and won't retry
    }
  }
}

private shouldRetry(error: any): boolean {
  // Retry on network errors, 5xx responses
  if (error.code === 'ECONNREFUSED') return true;
  if (error.statusCode >= 500) return true;
  
  // Don't retry on validation errors, 4xx responses
  if (error.statusCode >= 400 && error.statusCode < 500) return false;
  
  return false;
}
```

**Retry Configuration**:
- Max retries: 3
- Retry delay: Exponential backoff (1s, 2s, 4s)
- Dead-letter queue: After max retries
- Monitoring: Alert on dead-letter queue growth

See [examples/error-handling.ts](./examples/error-handling.ts) and [references/retry-strategies.md](./references/retry-strategies.md).

### 6. Event Versioning

Include version field for schema evolution:

```typescript
// V1 event
{
  type: 'job.created',
  version: '1.0',
  payload: {
    jobId: '123',
    companyId: '456'
  }
}

// V2 event - added location field
{
  type: 'job.created',
  version: '2.0',
  payload: {
    jobId: '123',
    companyId: '456',
    location: 'San Francisco'
  }
}

// Consumer handles both versions
switch (message.version) {
  case '1.0':
    await this.handleV1(message.payload);
    break;
  case '2.0':
    await this.handleV2(message.payload);
    break;
  default:
    console.warn(`Unknown version: ${message.version}`);
}
```

See [references/event-versioning.md](./references/event-versioning.md).

### 7. Testing Event Flows

Test event publishing and consumption:

```typescript
// Test event publishing
describe('JobServiceV2', () => {
  it('should publish job.created event', async () => {
    const mockEventPublisher = {
      publish: vi.fn()
    };
    
    const service = new JobServiceV2(mockRepository, mockEventPublisher);
    await service.create('clerk_123', jobData);
    
    expect(mockEventPublisher.publish).toHaveBeenCalledWith(
      'job.created',
      expect.objectContaining({
        jobId: expect.any(String),
        companyId: '123'
      })
    );
  });
});

// Test event consumption
describe('ApplicationEventsConsumer', () => {
  it('should send email on application.created', async () => {
    const mockNotificationService = {
      sendApplicationCreatedEmail: vi.fn()
    };
    
    const consumer = new ApplicationEventsConsumer(
      mockQueue,
      mockNotificationService
    );
    
    await consumer.handleApplicationCreated({
      applicationId: '123',
      candidateId: '456',
      jobId: '789'
    });
    
    expect(mockNotificationService.sendApplicationCreatedEmail)
      .toHaveBeenCalled();
  });
});
```

See [examples/event-testing.ts](./examples/event-testing.ts).

## Domain Events Catalog

### ATS Service Events

- `job.created` - New job posted
- `job.updated` - Job details changed
- `job.closed` - Job no longer accepting applications
- `application.created` - Candidate applied to job
- `application.stage_changed` - Application moved to new stage
- `application.withdrawn` - Candidate withdrew application
- `application.accepted` - Application accepted for placement
- `placement.created` - Successful placement recorded
- `placement.activated` - Candidate started working
- `placement.completed` - Placement period completed

### Network Service Events

- `recruiter.created` - New recruiter joined
- `recruiter.status_changed` - Recruiter activated/paused
- `assignment.created` - Recruiter assigned to job
- `assignment.removed` - Recruiter unassigned from job
- `proposal.created` - Recruiter proposed candidate
- `proposal.accepted` - Proposal accepted
- `proposal.declined` - Proposal declined

### Billing Service Events

- `subscription.created` - New subscription started
- `subscription.updated` - Subscription plan changed
- `subscription.canceled` - Subscription canceled
- `payout.created` - New payout record created
- `payout.processed` - Payout sent to recruiter

### Identity Service Events

- `user.created` - New user registered
- `user.updated` - User profile changed
- `organization.created` - New organization created
- `membership.created` - User joined organization
- `membership.removed` - User left organization

See [references/events-catalog.md](./references/events-catalog.md).

## Message Queue Configuration

### Queue Setup

```typescript
// packages/shared-job-queue/src/index.ts
import amqp from 'amqplib';

export class JobQueueClient {
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    
    // Setup exchange
    await this.channel.assertExchange('domain.events', 'topic', {
      durable: true
    });
    
    // Setup dead-letter exchange
    await this.channel.assertExchange('domain.events.dlx', 'topic', {
      durable: true
    });
  }

  async publish(exchange: string, message: any): Promise<void> {
    await this.channel?.publish(
      exchange,
      '', // routing key
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async subscribe(
    exchange: string,
    serviceName: string,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    const queue = `${serviceName}.${exchange}`;
    
    await this.channel?.assertQueue(queue, {
      durable: true,
      deadLetterExchange: 'domain.events.dlx'
    });
    
    await this.channel?.bindQueue(queue, exchange, '#');
    
    await this.channel?.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const message = JSON.parse(msg.content.toString());
        await handler(message);
        this.channel?.ack(msg);
      } catch (error) {
        console.error('Consumer error:', error);
        this.channel?.nack(msg, false, true); // Requeue for retry
      }
    });
  }
}
```

See [examples/queue-setup.ts](./examples/queue-setup.ts).

## Anti-Patterns to Avoid

### ❌ Synchronous Service-to-Service HTTP Calls

```typescript
// WRONG - Tight coupling
await fetch('http://notification-service/api/send-email', {
  method: 'POST',
  body: JSON.stringify({ email: '...' })
});

// CORRECT - Event-driven
await this.eventPublisher.publish('application.created', {
  applicationId: '123'
});
// Notification service consumes event and sends email
```

### ❌ Overloading Event Payloads

```typescript
// WRONG - Too much data
await this.eventPublisher.publish('job.created', {
  job: entireJobObject,
  company: entireCompanyObject,
  recruiter: entireRecruiterObject,
  requirements: allRequirementsArray
});

// CORRECT - Minimal payload
await this.eventPublisher.publish('job.created', {
  jobId: job.id,
  companyId: job.company_id,
  createdBy: userContext.identityUserId
});
```

### ❌ Breaking Changes in Events

```typescript
// WRONG - Removing fields without versioning
{
  type: 'job.created',
  payload: {
    // Removed companyId field - breaks consumers!
    jobId: '123'
  }
}

// CORRECT - Version bump
{
  type: 'job.created',
  version: '2.0',
  payload: {
    jobId: '123',
    organizationId: '456' // New field name
  }
}
```

## Monitoring & Observability

### Key Metrics

- **Event publish rate**: Events/second per domain
- **Consumer lag**: Time between publish and consumption
- **Error rate**: Failed event processing attempts
- **Dead-letter queue size**: Events that failed max retries
- **Retry rate**: Events being retried

### Logging

```typescript
// Log event publishing
console.log(`Published ${eventType}`, {
  service: 'ats-service',
  eventType,
  payloadKeys: Object.keys(payload),
  timestamp: new Date().toISOString()
});

// Log event consumption
console.log(`Processing ${eventType}`, {
  service: 'notification-service',
  eventType,
  processingTime: Date.now() - startTime
});
```

See [references/monitoring-events.md](./references/monitoring-events.md).

## References

- [Event Publisher Example](./examples/event-publisher.ts)
- [Event Consumer Example](./examples/event-consumer.ts)
- [Event Payloads](./examples/event-payloads.ts)
- [Error Handling](./examples/error-handling.ts)
- [Event Testing](./examples/event-testing.ts)
- [Events Catalog](./references/events-catalog.md)
- [Naming Conventions](./references/event-naming-conventions.md)
- [Retry Strategies](./references/retry-strategies.md)
- [Monitoring Guide](./references/monitoring-events.md)

## Related Skills

- `api-specifications` - When to use events vs HTTP
- `error-handling` - Error handling patterns
- `testing-patterns` - Testing event flows
