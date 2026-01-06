# Notification Service - Copilot Instructions

**Status**: 🔄 MIXED V1/V2 - Event-driven processing (V1) + State management (V2)

## Service Overview

The Notification Service handles notification delivery using **pure event-driven architecture** for creation and HTTP APIs for state management. Professional email templates delivered via Resend.

## Architecture Guidelines

### 🎯 **CORE PRINCIPLE: Event-Driven Only**
- ✅ All notification creation happens via RabbitMQ events
- ❌ **NO HTTP endpoints for creating notifications**  
- ✅ HTTP APIs only for notification state management (read, mark read, dismiss)

### ✅ **V1 Patterns (Event Processing)**
- Event-driven email and in-app notification creation
- RabbitMQ domain event consumers (7 domains)
- Professional HTML email templates via Resend
- Cross-service data enrichment for template rendering
- Email delivery orchestration

### ✅ **V2 Patterns (State Management)**
- HTTP APIs for notification center functionality
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/notifications`, not `/api/v2/notifications`
- Role-based notification filtering
- Template management CRUD operations
- User preference management (future)
- Direct Supabase queries with access context

## Current Domains

### V1 Domains (Event-Driven Processing)

#### Domain Event Consumers (`src/consumers/`)
- **Applications**: Application lifecycle emails (created, stage changed, accepted)
- **Placements**: Placement workflow emails (created, activated, completed)  
- **Proposals**: Proposal management emails (created, accepted, declined)
- **Candidates**: Candidate-focused notifications (invitations, updates)
- **Collaboration**: Team collaboration and recruiter submissions
- **Invitations**: Recruiter invitation workflow emails
- **Recruiter Submission**: Submission-specific communications

#### Email Services (`src/services/`)
- **Template Rendering**: Rich HTML emails with brand consistency
- **Data Enrichment**: Fetch related data for email context
- **Resend Integration**: Professional email delivery
- **Error Handling**: Graceful degradation and retry logic

### V2 Domains (State Management APIs)

#### Notifications (`src/v2/notifications/`)
- **Repository**: Role-scoped notification access
- **Service**: State management only (NO creation)
- **Routes**: Notification center APIs
  - `GET /v2/notifications` - List user notifications with filters
  - `GET /v2/notifications/:id` - Get single notification
  - ❌ ~~`POST /v2/notifications`~~ - **REMOVED: Use events only**
  - `PATCH /v2/notifications/:id` - Update notification (mark as read, etc.)
  - `DELETE /v2/notifications/:id` - Dismiss notification
  - `POST /v2/notifications/mark-all-read` - Mark all user notifications as read
  - `GET /v2/notifications/unread-count` - Get unread notification count

#### Templates (`src/v2/templates/`)
- **Repository**: Email template management
- **Service**: Template CRUD operations
- **Routes**: Standard 5-route pattern for template management
- **Purpose**: Listen to RabbitMQ events and send emails
- **Consumers**: Applications, Placements, Proposals, Candidates, Collaboration, Invitations, Recruiter Submission
- **Dependencies**: V1 NotificationService, V1 Repository, ServiceRegistry

#### Email Services (`src/services/`)
- **Status**: V1 only - needs V2 migration
- **Purpose**: Domain-specific email sending logic
- **Domains**: Applications, Placements, Proposals, Candidates, Collaboration, Invitations, Recruiter Submission
- **Integration**: Resend API for email delivery

## Development Guidelines

### Adding New Event Processing
1. **Create domain consumer** in `src/consumers/<domain>/`
2. **Create email service** in `src/services/<domain>/`
3. **Add RabbitMQ event handler** in `src/domain-consumer.ts`
4. **Create email templates** with professional HTML design
5. **Test email delivery** via Resend dashboard

### Adding New HTTP APIs  
1. **Use V2 patterns only** - Follow existing V2 domain structure
2. **NO notification creation endpoints** - Only state management
3. **Follow 5-route pattern** for CRUD operations (except POST for notifications)
4. **Use access context** from `@splits-network/shared-access-context`
5. **Role-based filtering** for notification access

### Standardized List Functionality
- **Use shared types** from `@splits-network/shared-types`:
  - `StandardListParams` for query parameters: `{ page?: number; limit?: number; search?: string; filters?: Record<string, any>; include?: string; sort_by?: string; sort_order?: 'asc' | 'desc' }`
  - `StandardListResponse<T>` for responses: `{ data: T[]; pagination: PaginationResponse }`
- **Repository pattern** for list methods:
  ```typescript
  async list(clerkUserId: string, params: StandardListParams): Promise<StandardListResponse<T>>
  ```
- **Server-side filtering** - never rely on client-side filtering for performance
- **Enriched data** - use JOINs to include related data in single queries
- **Consistent pagination** - always return total count and page information

### Database Integration
- **Schema**: All tables in `*` schema
- **Cross-Schema Queries**: Allowed for data enrichment (identity, ats, network)
- **Event Publishing**: Minimal - mostly a consumer service
- **Email Integration**: Resend for professional email delivery

### File Structure
```
src/
├── index.ts                    # Mixed V1/V2 initialization
├── domain-consumer.ts          # V1 - RabbitMQ event handling (25+ events)
├── service.ts                  # V1 - Email service coordinator
├── repository.ts               # V1 - Legacy notification repository
├── clients.ts                  # V1 - Service registry for external calls
├── consumers/                  # V1 - Domain event consumers
│   ├── applications/           # Application email workflows
│   ├── placements/             # Placement email workflows
│   ├── proposals/              # Proposal email workflows
│   ├── candidates/             # Candidate email workflows
│   ├── collaboration/          # Team collaboration emails
│   ├── invitations/            # Recruiter invitation workflows
│   └── recruiter-submission/   # Submission workflows
├── services/                   # V1 - Domain-specific email services
│   ├── applications.ts         # Application email logic
│   ├── placements.ts           # Placement email logic
│   ├── proposals.ts            # Proposal email logic
│   ├── candidates.ts           # Candidate email logic
│   ├── collaboration.ts        # Collaboration email logic
│   ├── invitations.ts          # Invitation email logic
│   └── recruiter-submission.ts # Submission email logic
├── helpers/                    # V1 - Email lookup helpers
├── templates/                  # V1 - Email templates (legacy - use V2)
└── v2/                         # V2 HTTP APIs
    ├── routes.ts               # V2 route registration
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher (minimal use)
    │   └── access.ts          # Notification-specific access context
    ├── notifications/         # Notification state management
    └── templates/             # Email template management
```

## Key Rules

### ✅ Always Do (Event Processing)
- Process all notification creation via RabbitMQ events
- Enrich email data with cross-service queries for professional templates
- Use professional HTML templates with brand consistency
- Handle email delivery errors gracefully with retry logic
- Log all notification processing for debugging
- Test email delivery via Resend dashboard

### ✅ Always Do (HTTP APIs)  
- Use V2 access context for notification filtering
- Follow role-based filtering (users see own notifications only)
- Implement pagination for notification lists
- Support notification categories and priorities  
- Validate all input data and handle edge cases
- Use direct Supabase queries for state management

### ❌ Never Do
- **Create HTTP endpoints for notification creation** (use events only)
- Skip access context in V2 repository methods
- Make HTTP calls to other services (use database queries)
- Bypass event processing for notification delivery
- Create routes outside V2 structure for new HTTP APIs
- Modify V1 email templates without testing in all clients

## Common Patterns

### V2 Repository Method Structure
```typescript
async list(clerkUserId: string, filters: NotificationFilters) {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    
    const query = this.supabase
        
        .from('notifications')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'candidate') {
        query.eq('recipient_user_id', context.userId);
    } else if (context.role === 'recruiter') {
        // Recruiters see their own notifications
        query.eq('recipient_user_id', context.userId);
    } else if (context.isCompanyUser) {
        // Company users see their organization's notifications
        query.in('recipient_user_id', context.accessibleUserIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply filters
    if (filters.unread_only) {
        query.eq('status', 'unread');
    }
    
    return query;
}
```

### V2 Service Method with Events
```typescript
async createNotification(clerkUserId: string, data: NotificationCreateInput) {
    // Create notification record
    const notification = await this.repository.create(clerkUserId, data);
    
    // Send email if needed
    if (data.channel === 'email' || data.channel === 'both') {
        // TODO: Use V2 email service when migrated
        // For now, this creates in-app notification only
    }
    
    // Publish event
    await this.eventPublisher?.publish('notification.created', {
        notificationId: notification.id,
        recipientUserId: notification.recipient_user_id,
        eventType: notification.event_type,
        channel: notification.channel
    });
    
    return notification;
}
```

### V1 Email Service Pattern (Legacy - TODO: Migrate)
```typescript
// Current V1 pattern in domain consumers
await notificationService.applications.sendApplicationCreated(email, data);

// TODO: Migrate to V2 pattern
// Should become direct V2 email service calls
```

## Testing & Debugging

### Local Development
- Service runs on port 3005 by default
- Swagger docs available at `/docs` endpoint
- RabbitMQ required for email functionality
- Resend API key required for email delivery

### Event Testing
- Monitor RabbitMQ for domain events triggering emails
- Test V2 notification CRUD operations
- Verify email delivery via Resend dashboard
- Test notification filtering and access control

### Database Testing
- Test role-based notification filtering
- Verify cross-user notification access restrictions
- Test notification lifecycle (created → read → dismissed)
- Test unread count accuracy

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: 🔄 PARTIAL - V2 HTTP APIs complete, V1 email services remain