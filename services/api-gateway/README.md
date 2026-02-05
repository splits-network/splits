# API Gateway

**Status**: ✅ V2 READY - Multi-tenant Clerk authentication with simplified authorization

The API Gateway serves as the main entry point for all frontend applications, providing authentication, rate limiting, and request routing to backend services.

## Responsibilities

- **Multi-Tenant Authentication**: Support for Portal and Candidate app Clerk tokens
- **Request Routing**: Proxy authenticated requests to appropriate backend services
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **Request/Response Logging**: Comprehensive request logging for debugging
- **Health Checks**: Service availability monitoring
- **Event Publishing**: RabbitMQ event coordination for cross-service communication
- **API Documentation**: Swagger/OpenAPI documentation generation

## V2 Architecture ✅

This service uses **V2 gateway patterns**:

- Multi-tenant Clerk authentication for Portal and Candidate apps
- Simplified authentication middleware (`requireAuth()`)
- Authorization delegated to backend services via access context
- Event publishing to RabbitMQ for coordination
- Service registry for backend service communication
- Redis integration for caching and rate limiting

## Environment Variables

Required:

- `CLERK_SECRET_KEY_PORTAL`: Clerk secret key for Portal app
- `CLERK_SECRET_KEY_CANDIDATE`: Clerk secret key for Candidate app
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: Gateway port (default: 3000)

Backend Service URLs:

- `IDENTITY_SERVICE_URL`: Identity service URL (default: http://localhost:3001)
- `ATS_SERVICE_URL`: ATS service URL (default: http://localhost:3002)
- `NETWORK_SERVICE_URL`: Network service URL (default: http://localhost:3003)
- `BILLING_SERVICE_URL`: Billing service URL (default: http://localhost:3004)
- `NOTIFICATION_SERVICE_URL`: Notification service URL (default: http://localhost:3005)
- `DOCUMENT_PROCESSING_SERVICE_URL`: Document processing URL (default: http://localhost:3006)
- `DOCUMENT_SERVICE_URL`: Document service URL (default: http://localhost:3007)
- `AUTOMATION_SERVICE_URL`: Automation service URL (default: http://localhost:3008)
- `AI_SERVICE_URL`: AI service URL (default: http://localhost:3009)
- `ANALYTICS_SERVICE_URL`: Analytics service URL (default: http://localhost:3010)
- `CHAT_SERVICE_URL`: Chat service URL (default: http://localhost:3011)

Optional:

- `SENTRY_DSN`: Error tracking and monitoring
- `SENTRY_RELEASE`: Release version for Sentry

## API Architecture

### Multi-Tenant Authentication

The gateway supports authentication for multiple frontend applications:

```typescript
// Portal app users (recruiters, company users, admins)
Authorization: Bearer <portal-clerk-jwt>

// Candidate app users
Authorization: Bearer <candidate-clerk-jwt>
```

### Request Flow

1. **Authentication**: Extract JWT from `Authorization` header
2. **JWT Verification**: Verify against appropriate Clerk application (Portal/Candidate)
3. **User Context**: Load user profile and memberships from Clerk
4. **Rate Limiting**: Apply Redis-based rate limiting per user
5. **Service Routing**: Proxy to appropriate backend service with headers
6. **Response**: Return service response to client

### Service Headers

The gateway adds authentication headers to backend service requests:

```http
x-clerk-user-id: user_2ABC123...
x-user-email: user@example.com
x-user-name: John Doe
x-source-app: portal | candidate
```

## API Endpoints

### Health & Status

- `GET /health` - Gateway health check
- `GET /api/status` - All service status check

### V2 Service Routes (Proxied)

All V2 routes are proxied with authentication:

#### Identity Service (`/api/v2/identity/...`)

- User management, organizations, memberships
- Proxied to: `${IDENTITY_SERVICE_URL}/v2/...`

#### ATS Service (`/api/v2/ats/...`)

- Companies, jobs, candidates, applications, placements
- Proxied to: `${ATS_SERVICE_URL}/v2/...`

#### Network Service (`/api/v2/network/...`)

- Recruiters, assignments, reputation, proposals
- Proxied to: `${NETWORK_SERVICE_URL}/v2/...`

#### Billing Service (`/api/v2/billing/...`)

- Plans, subscriptions, payouts
- Proxied to: `${BILLING_SERVICE_URL}/v2/...`

#### Notification Service (`/api/v2/notifications/...`)

- Notifications, templates, preferences
- Proxied to: `${NOTIFICATION_SERVICE_URL}/v2/...`

#### Document Services

- **Processing**: `${DOCUMENT_PROCESSING_SERVICE_URL}/v2/...`
- **Storage**: `${DOCUMENT_SERVICE_URL}/v2/...`

#### AI & Automation

- **AI Service**: `${AI_SERVICE_URL}/v2/...`
- **Automation**: `${AUTOMATION_SERVICE_URL}/v2/...`

#### Analytics & Chat

- **Analytics**: `${ANALYTICS_SERVICE_URL}/v2/...`
- **Chat**: `${CHAT_SERVICE_URL}/v2/...`

### Rate Limiting

Redis-based rate limiting is applied per user:

```typescript
// Default rate limits
const rateLimits = {
    max: 100, // requests per window
    timeWindow: "1 minute",
    keyGenerator: (request) => request.auth.clerkUserId,
};
```

## Authentication Flows

### Portal App Authentication

```bash
# Portal users (recruiters, company admins, hiring managers)
curl -X GET http://localhost:3000/api/v2/jobs \
  -H "Authorization: Bearer <portal-clerk-jwt>"
```

### Candidate App Authentication

```bash
# Candidate users
curl -X GET http://localhost:3000/api/v2/candidates/me \
  -H "Authorization: Bearer <candidate-clerk-jwt>"
```

## Development

### Local Setup

1. **Install dependencies**:

```bash
cd services/api-gateway
pnpm install
```

2. **Configure environment** (copy from `.env.example`):

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start dependencies**:

```bash
# Redis (required for rate limiting)
docker run -d -p 6379:6379 redis:alpine

# RabbitMQ (required for events)
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

4. **Run development server**:

```bash
pnpm dev
```

Gateway will start on `http://localhost:3000`

### Testing

#### Health Check

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"api-gateway"}
```

#### Service Status

```bash
curl http://localhost:3000/api/status
# Response: {"gateway":"ok","services":{"identity":...}}
```

#### Authenticated Request

```bash
curl -X GET http://localhost:3000/api/v2/jobs \
  -H "Authorization: Bearer <valid-clerk-jwt>"
```

## Architecture Notes

### V2 Service Integration

- **Authentication Only**: Gateway handles JWT verification
- **Authorization Delegated**: Backend services use access context for permissions
- **Clean Separation**: No business logic in gateway
- **Service Independence**: Services can query across schemas directly

### Error Handling

All errors are standardized:

```json
{
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Invalid or expired token"
    }
}
```

### Event Publishing

Gateway publishes gateway-level events:

```typescript
// Request events
await eventPublisher.publish("gateway.request.authenticated", {
    userId: auth.clerkUserId,
    sourceApp: auth.sourceApp,
    endpoint: request.url,
    timestamp: new Date(),
});
```

## Dependencies

- **@clerk/backend**: Multi-tenant Clerk authentication
- **@fastify/http-proxy**: Service request proxying
- **@fastify/rate-limit**: Redis-based rate limiting
- **ioredis**: Redis client for caching and rate limiting
- **amqplib**: RabbitMQ event publishing
- **@splits-network/shared-\***: Shared utilities and configuration

## Service Registry

The gateway maintains connections to all backend services:

```typescript
const services = new ServiceRegistry({
    identity: process.env.IDENTITY_SERVICE_URL,
    ats: process.env.ATS_SERVICE_URL,
    network: process.env.NETWORK_SERVICE_URL,
    billing: process.env.BILLING_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
    // ... other services
});
```

## Monitoring

- **Health Checks**: Built-in health endpoint
- **Request Logging**: Comprehensive request/response logging
- **Rate Limiting**: Redis-based abuse prevention
- **Sentry Integration**: Error tracking and performance monitoring
- **Service Status**: Real-time backend service availability

---

**Port**: 3000  
**Schema**: N/A (Gateway service)  
**Dependencies**: Redis, RabbitMQ, All backend services  
**Documentation**: Swagger UI available at `/docs`
