# Notification Service

**Status**: 🔄 MIXED V1/V2 - Event-driven email processing (V1) + In-app notification APIs (V2)

The Notification Service handles all notification delivery for the Splits Network platform using a **pure event-driven architecture** for notification creation and HTTP APIs for state management.

## Architecture Overview

### 🎯 **Core Principle: Event-Driven Only**
All notification creation happens via RabbitMQ events. **No HTTP endpoints for creating **

```
Service Event → RabbitMQ → Notification Service → Email/In-App Created
                                                          ↓
Frontend ← HTTP APIs ← Notification State Management ←────┘
```

## ✅ Current Capabilities

### **V1: Event-Driven Notification Processing**
- **Email Delivery**: Professional branded HTML templates via Resend
- **In-App Notification Creation**: Stores notifications for frontend consumption
- **RabbitMQ Event Processing**: Listens to 25+ domain events
- **Template System**: Rich responsive templates with brand consistency

### **V2: Notification State Management APIs**
- **GET /v2/notifications** - Fetch notifications for notification center
- **PATCH /v2/notifications/:id** - Mark as read/unread
- **DELETE /v2/notifications/:id** - Dismiss notifications
- **GET /v2/notifications/unread-count** - Badge counts
- **POST /v2/notifications/mark-all-read** - Bulk operations

### **V2: Template Management APIs**
- **GET /v2/templates** - List email templates
- **GET /v2/templates/:id** - Get template details
- **POST /v2/templates** - Create templates
- **PATCH /v2/templates/:id** - Update templates
- **DELETE /v2/templates/:id** - Delete templates

## 🎨 Preview Email Templates

Generate HTML previews of all email templates:

```bash
pnpm preview:emails
```

This creates preview files in `email-previews/` directory. Open `email-previews/index.html` to browse all templates.

## 📧 **Email Template Categories**

### **Application Workflow**
- New candidate applications
- Stage change updates with rich context
- Application acceptance/rejection
- Pre-screen requests and confirmations
- AI review completion notifications

### **Placement Lifecycle**  
- Placement confirmations with fee breakdowns
- Placement activation (start dates)
- Placement completion celebrations
- Guarantee expiring reminders

### **Collaboration & Invitations**
- Recruiter invitations and responses
- Team collaboration notifications
- Proposal management
- Recruiter submission workflows

## 🔄 **Event-Driven Processing**

### **Supported RabbitMQ Events**
```typescript
// Application Events
'application.created'
'application.stage_changed'  
'application.accepted'
'application.withdrawn'

// Placement Events  
'placement.created'
'placement.activated'
'placement.completed'
'placement.failed'

// Proposal Events
'proposal.created'
'proposal.accepted'
'proposal.declined'
'proposal.timeout'

// AI Review Events
'ai_review.started'
'ai_review.completed'
'ai_review.failed'

// Invitation Events
'invitation.created'
'invitation.revoked'

// And 15+ more domain events...
```

### **Event Payload Structure**
```typescript
interface NotificationEvent {
  recipient_user_id: string;
  recipient_email: string;
  data: {
    // Event-specific data
    application_id?: string;
    placement_id?: string;
    job_id?: string;
    candidate_id?: string;
  };
  metadata: {
    // Display data for templates
    company_name?: string;
    job_title?: string;
    candidate_name?: string;
  };
}
```

## 🎨 **Email Templates**

### **Brand-Consistent Design**
- **Colors**: Splits Network blue (#233876 primary, #0f9d8a secondary)
- **Responsive HTML**: Optimized for Gmail, Outlook, Apple Mail
- **Rich Components**: Info cards, alerts, buttons, formatted data
- **Template Preview**: Generate HTML previews for testing

See [TEMPLATES.md](./TEMPLATES.md) for complete template documentation.

## 🎯 **Future: User Notification Preferences**

Planned architecture for granular user control:

```sql
-- user_notification_preferences
user_id UUID,
notification_type VARCHAR, -- 'application_created', 'placement_completed'
email_enabled BOOLEAN DEFAULT true,
in_app_enabled BOOLEAN DEFAULT true
```

**Preference APIs (Planned)**:
- `GET /v2/notification-preferences`
- `PATCH /v2/notification-preferences`
- `POST /v2/notification-preferences/reset-defaults`

## 🧪 Testing Notifications

### Prerequisites

1. **Resend API Key**: Set `RESEND_API_KEY` in your environment or Supabase Vault
2. **From Email**: Configure `RESEND_FROM_EMAIL` (defaults to `noreply@updates.splits.network`)
3. **All services running**: `docker-compose up -d`

### Method 1: Submit a Candidate via API

```bash
# Submit a candidate to trigger notification
curl -X POST http://localhost:3002/applications \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "<your-job-id>",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "linkedin_url": "https://linkedin.com/in/janedoe",
    "notes": "Great candidate!",
    "recruiter_id": "<your-recruiter-id>"
  }'
```

### Method 2: Use the Test Script

```bash
# From repo root
cd G:\code\splits.network
pnpm tsx scripts/test-notification.ts
```

This script will:
1. Find an existing job and recruiter
2. Submit a test candidate
3. Show the notification log status

### Method 3: Via Portal UI

1. Navigate to http://localhost:3100
2. Sign in as a recruiter
3. Go to a role detail page
4. Click "Submit Candidate"
5. Fill out the form and submit
6. Check the recruiter's email address

## 📋 Checking Notification Status

### View Notification Logs in Database

```sql
SELECT 
  event_type,
  recipient_email,
  subject,
  status,
  resend_message_id,
  error_message,
  created_at
FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Check Docker Logs

```bash
# Watch notification service logs in real-time
docker-compose logs -f notification-service

# See last 50 lines
docker-compose logs --tail=50 notification-service
```

## 🔧 Configuration

### Environment Variables

The notification service uses these environment variables:

```env
# Service URLs (default to Docker network names)
IDENTITY_SERVICE_URL=http://identity-service:3001
ATS_SERVICE_URL=http://ats-service:3002
NETWORK_SERVICE_URL=http://network-service:3003

# Resend Configuration
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=noreply@updates.splits.network

# RabbitMQ
RABBITMQ_URL=amqp://splits:splits_local_dev@rabbitmq:5672

# Database
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Docker Compose

Service URLs are automatically configured in `docker-compose.yml`:

```yaml
notification-service:
  environment:
    IDENTITY_SERVICE_URL: http://identity-service:3001
    ATS_SERVICE_URL: http://ats-service:3002
    NETWORK_SERVICE_URL: http://network-service:3003
```

## 📧 Email Templates

### Application Created

Sent to: Recruiter who submitted the candidate

```
Subject: New Candidate Submitted: {candidate_name} for {job_title}

Body:
- Candidate name
- Job title
- Company name
- Link to log in and view
```

### Stage Changed

Sent to: Recruiter who submitted the candidate

```
Subject: Application Update: {candidate_name} - {new_stage}

Body:
- Candidate name
- Job title
- Previous stage
- New stage
```

### Placement Created

Sent to: Recruiter who made the placement

```
Subject: Placement Confirmed: {candidate_name} - ${recruiter_share}

Body:
- Candidate name
- Job title
- Company name
- Salary
- Recruiter share amount
```

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**
   ```bash
   # Verify key is set
   docker-compose exec notification-service env | grep RESEND
   ```

2. **Check Service Connectivity**
   ```bash
   # Test from notification-service container
   docker-compose exec notification-service curl http://ats-service:3002/jobs
   ```

3. **Check RabbitMQ Connection**
   ```bash
   # View RabbitMQ management UI
   open http://localhost:15672
   # Login: splits / splits_local_dev
   # Check queues and bindings
   ```

4. **Check Notification Logs**
   ```sql
   SELECT status, error_message 
   FROM notification_logs 
   WHERE status = 'failed' 
   ORDER BY created_at DESC;
   ```

### Common Issues

**Issue**: `Failed to fetch from service`  
**Solution**: Ensure all services are running and accessible

**Issue**: `Resend API error`  
**Solution**: Verify Resend API key and that sender email is verified

**Issue**: `User not found`  
**Solution**: Ensure recruiter has a valid user_id linking to users

## 🚀 Next Steps

1. **Set up Resend Account**
   - Sign up at https://resend.com
   - Verify your sending domain
   - Get API key from dashboard

2. **Configure Environment**
   - Add `RESEND_API_KEY` to `.env.local`
   - Set `RESEND_FROM_EMAIL` to your verified domain email

3. **Test End-to-End**
   - Submit a real candidate
   - Verify email is received
   - Check notification log status

4. **Monitor in Production**
   - Set up alerts for failed notifications
   - Monitor notification_logs table
   - Track Resend dashboard for delivery stats
