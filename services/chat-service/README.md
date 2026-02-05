# Chat Service

**Status**: ✅ V2 ONLY - Real-time chat management with file attachments

The Chat Service manages real-time messaging between recruiters and candidates, providing conversation management, message history, file attachments, and moderation capabilities.

## Responsibilities

- **Conversations**: Chat conversation lifecycle management between recruiters and candidates
- **Messages**: Real-time message storage, retrieval, and history
- **File Attachments**: Document and image sharing within chat conversations
- **Moderation**: Content moderation, reporting, and audit trail
- **Participant State**: User presence, read receipts, and typing indicators
- **Retention**: Automated message cleanup and archival policies
- **Context Awareness**: Application-specific and job-specific conversations

## V2 Architecture ✅

This service uses **V2 patterns exclusively**:

- Domain-based folder structure (`src/v2/`)
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event publishing to RabbitMQ for real-time coordination
- 5-route CRUD pattern for chat resources
- Role-based access control via shared access context
- Background job processing for attachments and moderation

## Environment Variables

Required:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `RABBITMQ_URL`: RabbitMQ connection string for events
- `REDIS_HOST`: Redis host for caching and presence
- `REDIS_PORT`: Redis port (default: 6379)
- `PORT`: Service port (default: 3011)

Optional:

- `REDIS_PASSWORD`: Redis password (if required)
- `SENTRY_DSN`: Error tracking and monitoring
- `SENTRY_RELEASE`: Release version for Sentry
- `MAX_MESSAGE_LENGTH`: Maximum message character limit (default: 2000)
- `MAX_ATTACHMENT_SIZE_MB`: Maximum file attachment size (default: 10)

## API Endpoints

All endpoints follow V2 standardized patterns with role-based access control.

### Conversations (`/v2/conversations`)

#### Core CRUD Operations

- `GET /v2/conversations` - List user conversations (role-filtered)
- `GET /v2/conversations/:id` - Get conversation details with messages
- `POST /v2/conversations` - Create new conversation
- `PATCH /v2/conversations/:id` - Update conversation metadata
- `DELETE /v2/conversations/:id` - Soft delete conversation

#### Conversation Management

- `GET /v2/conversations/:id/messages` - Get conversation messages (paginated)
- `POST /v2/conversations/:id/messages` - Send message to conversation
- `PATCH /v2/conversations/:id/participant-state` - Update read status, typing indicators
- `GET /v2/conversations/:id/attachments` - List conversation file attachments

### Messages (`/v2/messages`)

#### Message Operations

- `GET /v2/messages/:id` - Get single message details
- `PATCH /v2/messages/:id` - Edit message content (author only, time-limited)
- `DELETE /v2/messages/:id` - Soft delete message (author only)
- `POST /v2/messages/:id/report` - Report message for moderation

#### Message Search & History

- `GET /v2/messages/search` - Search messages across conversations
- `GET /v2/messages/history` - Get user's complete message history

### File Attachments (`/v2/attachments`)

#### Attachment Management

- `GET /v2/attachments` - List user attachments (role-filtered)
- `GET /v2/attachments/:id` - Get attachment metadata and download URL
- `POST /v2/attachments` - Upload file attachment
- `DELETE /v2/attachments/:id` - Remove file attachment

### Context-Aware Conversations

#### Application-Specific Chat

```bash
# Start conversation in context of a job application
POST /v2/conversations
{
  "participant_b_id": "recruiter_uuid",
  "application_id": "app_uuid",
  "initial_message": "I have questions about this role..."
}
```

#### Job-Specific Chat

```bash
# Start conversation about a specific job posting
POST /v2/conversations
{
  "participant_b_id": "candidate_uuid",
  "job_id": "job_uuid",
  "initial_message": "I'd like to discuss this opportunity..."
}
```

## Real-Time Integration

### Chat Gateway Coordination

The Chat Service publishes events for real-time delivery via Chat Gateway:

```typescript
// Message events for WebSocket delivery
await eventPublisher.publish("chat.message.sent", {
    conversationId: message.conversation_id,
    messageId: message.id,
    senderId: message.sender_id,
    recipientId: conversation.otherParticipantId,
    timestamp: message.created_at,
});

// Presence events for typing indicators
await eventPublisher.publish("chat.participant.typing", {
    conversationId: conversation.id,
    userId: participant.user_id,
    isTyping: true,
});
```

### Redis Integration

- **Presence Management**: User online status and typing indicators
- **Message Caching**: Recent message caching for performance
- **Rate Limiting**: Anti-spam message rate limiting per user

## Message Features

### Rich Message Types

```typescript
// Text message
{
  "content": "Hello! I'm interested in this position.",
  "message_type": "text"
}

// File attachment message
{
  "content": "Here's my updated resume",
  "message_type": "attachment",
  "attachment_ids": ["att_uuid"]
}

// System message (automated)
{
  "content": "Candidate applied to Senior Developer role",
  "message_type": "system"
}
```

### Message Moderation

- **Automated Screening**: Basic profanity and spam detection
- **User Reporting**: Report inappropriate messages
- **Moderation Queue**: Admin review of flagged content
- **Audit Trail**: Complete moderation action history

### File Attachment Support

- **Supported Types**: PDF, DOC, DOCX, JPG, PNG, TXT (configurable)
- **Size Limits**: 10MB per file (configurable)
- **Virus Scanning**: Integration with document processing pipeline
- **Secure URLs**: Pre-signed URLs for secure file access

## Access Control & Security

### Role-Based Message Access

- **Candidates**: See only their own conversations
- **Recruiters**: See conversations they participate in
- **Company Admins**: See conversations for their organization's jobs/candidates
- **Platform Admins**: See all conversations (moderation purposes)

### Privacy & Retention

- **Message Retention**: Configurable retention policies (default: 2 years)
- **Soft Delete**: Messages marked deleted but retained for audit
- **Data Export**: User data export for GDPR compliance
- **Encryption**: Message content encrypted at rest

## Background Jobs

### Chat Attachment Processing

```bash
# Process uploaded files
pnpm run job:chat-attachments
```

### Message Retention

```bash
# Clean up expired messages
pnpm run job:chat-retention
```

### Content Moderation

```bash
# Process moderation queue
pnpm run job:chat-moderation
```

## Development

### Local Setup

1. **Install dependencies**:

```bash
cd services/chat-service
pnpm install
```

2. **Configure environment** (copy from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start dependencies**:

```bash
# Redis (required for presence and caching)
docker run -d -p 6379:6379 redis:alpine

# RabbitMQ (required for real-time events)
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

4. **Run development server**:

```bash
pnpm dev
```

Service will start on `http://localhost:3011`

### Testing

#### Health Check

```bash
curl http://localhost:3011/health
# Response: {"status":"ok","service":"chat-service"}
```

#### Create Conversation

```bash
curl -X POST http://localhost:3011/v2/conversations \
  -H "Content-Type: application/json" \
  -H "x-clerk-user-id: user_abc123" \
  -d '{
    "participant_b_id": "user_def456",
    "initial_message": "Hello!"
  }'
```

#### Send Message

```bash
curl -X POST http://localhost:3011/v2/conversations/{conversation_id}/messages \
  -H "Content-Type: application/json" \
  -H "x-clerk-user-id: user_abc123" \
  -d '{
    "content": "Thanks for connecting!",
    "message_type": "text"
  }'
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test -- --coverage
```

## Integration Patterns

### With ATS Service

- **Application Context**: Link conversations to job applications
- **Candidate Profiles**: Enrich conversations with candidate data
- **Job Context**: Associate conversations with specific job postings

### With Document Service

- **File Attachments**: Upload resumes, portfolios, and documents
- **Secure Storage**: Leverage document service storage infrastructure
- **Processing Pipeline**: Automatic virus scanning and text extraction

### With Notification Service

- **Message Notifications**: Email notifications for offline users
- **Conversation Summaries**: Weekly conversation digest emails
- **Moderation Alerts**: Admin notifications for flagged content

## Event Publishing

Chat service publishes key events for real-time coordination:

```typescript
// Real-time message delivery
'chat.message.sent' -> { conversationId, messageId, senderId, recipientId }

// Presence management
'chat.participant.online' -> { userId, conversationId, timestamp }
'chat.participant.typing' -> { userId, conversationId, isTyping }

// Moderation events
'chat.message.reported' -> { messageId, reporterId, reason }
'chat.message.moderated' -> { messageId, moderatorId, action }

// File attachment events
'chat.attachment.uploaded' -> { attachmentId, conversationId, uploaderId }
```

## Performance Considerations

### Message Pagination

- **Default Page Size**: 25 messages per request
- **Efficient Queries**: Optimized database queries with proper indexing
- **Cursor-Based**: Cursor pagination for consistent results

### Caching Strategy

- **Recent Messages**: Cache last 50 messages per conversation in Redis
- **Participant State**: Cache typing indicators and read receipts
- **Presence Data**: Cache online user status for real-time features

### File Storage

- **CDN Integration**: Cached file delivery via Supabase Storage CDN
- **Lazy Loading**: Load attachments only when accessed
- **Thumbnail Generation**: Generate previews for image attachments

---

**Port**: 3011  
**Schema**: `chat`  
**Dependencies**: Supabase, RabbitMQ, Redis  
**Documentation**: Swagger UI available at `/docs`
