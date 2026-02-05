# Chat Gateway

**Status**: ✅ PRODUCTION READY - WebSocket gateway for real-time chat

The Chat Gateway provides WebSocket connections for real-time chat functionality, handling client connections, message delivery, presence management, and typing indicators.

## Responsibilities

- **WebSocket Management**: Handle client WebSocket connections and lifecycle
- **Multi-Tenant Authentication**: Verify Clerk JWTs from Portal and Candidate apps
- **Real-Time Message Delivery**: Deliver chat messages instantly via WebSocket
- **Presence Management**: Track online status and user presence
- **Typing Indicators**: Real-time typing status updates
- **Channel Subscriptions**: Manage user subscriptions to conversation channels
- **Connection State**: Maintain connection metadata and heartbeat monitoring
- **Redis Pub/Sub**: Subscribe to chat events and deliver to connected clients

## Architecture

This service uses **WebSocket gateway patterns**:

- Native WebSocket server with HTTP upgrade support
- Multi-tenant Clerk JWT authentication
- Redis pub/sub for event distribution
- Channel-based message routing
- Connection state management in memory
- Presence tracking with Redis TTL

## Environment Variables

Required:

- `CLERK_SECRET_KEY_PORTAL`: Clerk secret key for Portal app
- `CLERK_SECRET_KEY_CANDIDATE`: Clerk secret key for Candidate app
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port (default: 6379)
- `PORT`: Gateway port (default: 3020)
- `IDENTITY_SERVICE_URL`: Identity service URL (default: http://localhost:3001)
- `CHAT_SERVICE_URL`: Chat service URL (default: http://localhost:3011)

Optional:

- `REDIS_PASSWORD`: Redis password (if required)
- `PRESENCE_TTL_SECONDS`: User presence TTL in seconds (default: 90)
- `MAX_CHANNELS_PER_SOCKET`: Maximum channels per WebSocket (default: 200)

## WebSocket Protocol

### Connection & Authentication

#### Portal App Connection

```javascript
const ws = new WebSocket("ws://localhost:3020?token=<portal-clerk-jwt>");
```

#### Candidate App Connection

```javascript
const ws = new WebSocket("ws://localhost:3020?token=<candidate-clerk-jwt>");
```

### Message Types

#### Client → Server Messages

##### Subscribe to Channels

```json
{
    "type": "subscribe",
    "channels": ["conversation:conv_123", "conversation:conv_456"]
}
```

##### Typing Started

```json
{
    "type": "typing.started",
    "conversationId": "conv_123"
}
```

##### Typing Stopped

```json
{
    "type": "typing.stopped",
    "conversationId": "conv_123"
}
```

##### Read Receipt

```json
{
    "type": "read.receipt",
    "conversationId": "conv_123",
    "lastReadMessageId": "msg_456"
}
```

##### Presence Ping (Heartbeat)

```json
{
    "type": "presence.ping"
}
```

#### Server → Client Messages

##### New Message Delivery

```json
{
    "type": "message.new",
    "conversationId": "conv_123",
    "message": {
        "id": "msg_456",
        "content": "Hello!",
        "senderId": "user_789",
        "timestamp": "2026-02-05T10:30:00Z"
    }
}
```

##### Typing Indicator

```json
{
    "type": "typing.indicator",
    "conversationId": "conv_123",
    "userId": "user_789",
    "isTyping": true
}
```

##### User Presence Update

```json
{
    "type": "presence.update",
    "userId": "user_789",
    "status": "online",
    "lastSeen": "2026-02-05T10:30:00Z"
}
```

##### Read Receipt Confirmation

```json
{
    "type": "read.receipt.update",
    "conversationId": "conv_123",
    "userId": "user_789",
    "lastReadMessageId": "msg_456"
}
```

##### Error Response

```json
{
    "type": "error",
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid or expired token"
}
```

## Real-Time Event Handling

### Redis Pub/Sub Integration

The gateway subscribes to Redis channels to receive real-time events:

```typescript
// Message delivery events from chat-service
redis.subscribe("chat:message:*");

// Typing indicator events
redis.subscribe("chat:typing:*");

// Presence updates
redis.subscribe("chat:presence:*");

// Read receipt events
redis.subscribe("chat:read:*");
```

### Event Processing

```typescript
// Route incoming Redis events to appropriate WebSocket clients
redis.on("message", (channel, data) => {
    const event = JSON.parse(data);

    switch (channel.split(":")[1]) {
        case "message":
            deliverMessageToClients(event);
            break;
        case "typing":
            broadcastTypingIndicator(event);
            break;
        case "presence":
            updateUserPresence(event);
            break;
        case "read":
            confirmReadReceipt(event);
            break;
    }
});
```

## Connection Management

### Authentication Flow

1. **WebSocket Upgrade**: Client connects with JWT in query parameter
2. **Multi-Tenant Verification**: Verify JWT against Portal or Candidate Clerk app
3. **User Context**: Load user identity from identity-service
4. **Connection Registration**: Register authenticated connection
5. **Presence Update**: Mark user as online in Redis

### Connection Lifecycle

```typescript
// Connection established
ws.on("open", () => {
    authenticateConnection(token)
        .then((authContext) => {
            registerConnection(ws, authContext);
            updatePresence(authContext.clerkUserId, "online");
        })
        .catch((error) => {
            ws.send(JSON.stringify({ type: "error", code: "AUTH_FAILED" }));
            ws.close();
        });
});

// Connection closed
ws.on("close", () => {
    unregisterConnection(ws);
    updatePresence(authContext.clerkUserId, "offline");
});
```

### Channel Subscriptions

Users can subscribe to conversation channels to receive real-time updates:

```typescript
// Subscribe to multiple conversations
{
  "type": "subscribe",
  "channels": [
    "conversation:app_123",     // Application-specific chat
    "conversation:job_456",     // Job-specific chat
    "conversation:general_789"  // General conversation
  ]
}
```

## Presence Management

### Online Status Tracking

- **Redis Storage**: User presence stored in Redis with TTL
- **Heartbeat Mechanism**: Clients send periodic ping messages
- **Auto-Cleanup**: Presence expires automatically if client disconnects
- **Status Broadcasting**: Online/offline events broadcast to relevant users

### Presence TTL

```typescript
// User marked online with TTL
await redis.setex(`presence:${userId}`, PRESENCE_TTL_SECONDS, "online");

// Presence automatically expires if no heartbeat received
```

## Security & Rate Limiting

### Authentication Security

- **JWT Verification**: Multi-tenant Clerk JWT validation
- **Connection Limits**: Maximum connections per user
- **Channel Limits**: Maximum channel subscriptions per connection
- **Origin Validation**: WebSocket origin header validation

### Rate Limiting

- **Message Rate**: Limit typing indicators and read receipts per user
- **Subscription Rate**: Limit channel subscription changes
- **Presence Rate**: Limit presence ping frequency

```typescript
// Rate limiting per connection
const rateLimits = {
    typing: 5, // 5 typing events per 10 seconds
    subscribe: 10, // 10 subscription changes per minute
    presence: 12, // 12 presence pings per minute
};
```

## Development

### Local Setup

1. **Install dependencies**:

```bash
cd services/chat-gateway
pnpm install
```

2. **Configure environment** (copy from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start dependencies**:

```bash
# Redis (required for pub/sub and presence)
docker run -d -p 6379:6379 redis:alpine
```

4. **Run development server**:

```bash
pnpm dev
```

Gateway will start on `ws://localhost:3020`

### Testing WebSocket Connection

#### Using wscat (install: `npm install -g wscat`)

```bash
# Connect with authentication
wscat -c "ws://localhost:3020?token=<valid-clerk-jwt>"

# Subscribe to channels
> {"type":"subscribe","channels":["conversation:test_123"]}

# Send typing indicator
> {"type":"typing.started","conversationId":"test_123"}

# Send presence ping
> {"type":"presence.ping"}
```

#### Using JavaScript

```javascript
const ws = new WebSocket("ws://localhost:3020?token=<jwt>");

ws.onopen = () => {
    console.log("Connected to chat gateway");

    // Subscribe to conversation
    ws.send(
        JSON.stringify({
            type: "subscribe",
            channels: ["conversation:123"],
        }),
    );
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Received:", message);
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};
```

## Integration with Chat Service

### Event Flow

1. **Message Sent**: User sends message via Chat Service HTTP API
2. **Event Published**: Chat Service publishes event to Redis
3. **Gateway Processing**: Chat Gateway receives Redis event
4. **Client Delivery**: Gateway delivers message to subscribed WebSocket clients

### Redis Channel Patterns

```typescript
// Message channels
chat:message:${conversationId} -> new message events
chat:message:global -> all message events

// Typing channels
chat:typing:${conversationId} -> typing indicator events

// Presence channels
chat:presence:${userId} -> user presence changes
chat:presence:global -> all presence events

// Read receipt channels
chat:read:${conversationId} -> read receipt events
```

## Monitoring & Debugging

### Connection Metrics

```bash
# Active connections
GET /metrics/connections

# Channel subscriptions
GET /metrics/subscriptions

# Presence status
GET /metrics/presence
```

### Health Check

```bash
# HTTP health endpoint
curl http://localhost:3020/health
# Response: {"status":"ok","service":"chat-gateway","connections":42}
```

### Redis Monitoring

```bash
# Monitor Redis pub/sub activity
redis-cli monitor

# Check presence keys
redis-cli keys "presence:*"

# Check active channels
redis-cli pubsub channels "chat:*"
```

## Performance Considerations

### Connection Scaling

- **Connection Pooling**: Efficient WebSocket connection management
- **Memory Usage**: Optimized connection state storage
- **CPU Usage**: Minimal per-message processing overhead
- **Redis Efficiency**: Optimized Redis pub/sub patterns

### Message Delivery

- **Channel Filtering**: Deliver messages only to subscribed clients
- **Batch Processing**: Batch Redis events when possible
- **Connection Cleanup**: Automatic cleanup of stale connections
- **Heartbeat Monitoring**: Efficient presence management

---

**Port**: 3020  
**Protocol**: WebSocket (WS/WSS)  
**Dependencies**: Redis, Clerk (multi-tenant), Identity Service, Chat Service  
**Scaling**: Horizontal scaling supported via Redis pub/sub
