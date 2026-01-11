# Service Documentation Standards

This document establishes the standard format for service documentation in the Splits Network monorepo.

## Required Documentation

Each service **MUST** have:
1. `README.md` - Service overview, API, events, deployment
2. `.copilot-instructions.md` - Service-specific AI coding guidelines

## README.md Template

```markdown
# [Service Name]

Brief description of service purpose and responsibilities.

## Responsibilities

- **Primary Feature**: Main responsibility
- **Secondary Feature**: Additional responsibilities
- **Integration**: How it fits with other services

## V2 Architecture

Follows standardized V2 patterns:
- Domain-based folder structure (`src/v2/`)
- Repository pattern with access context
- Service layer with business logic  
- Event publishing to RabbitMQ
- 5-route CRUD pattern where applicable

## API Endpoints

### V2 Routes (RESTful)
- `GET /v2/resource` - List resources with filtering
- `GET /v2/resource/:id` - Get resource by ID  
- `POST /v2/resource` - Create new resource
- `PATCH /v2/resource/:id` - Update resource
- `DELETE /v2/resource/:id` - Delete resource

### System Routes
- `GET /health` - Health check
- `GET /metrics` - Service metrics

## Events

### Consumed Events (Listens For)

| Event | Exchange | Routing Key | Description |
|-------|----------|-------------|-------------|
| `event.name` | `splits-network-events` | `routing.key` | What triggers this service |

**Event Payload**:
```typescript
interface EventPayload {
  id: string;
  // ... other fields
}
```

### Published Events (Publishes)

| Event | Exchange | Routing Key | Description |
|-------|----------|-------------|-------------|
| `event.completed` | `splits-network-events` | `event.completed` | When service completes action |

## Database Schema

Uses `[schema].*` in Supabase:
- `schema.table_name` - Purpose of table

## Environment Variables

Required:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase service role key  
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: Service port (default: 30XX)

Optional:
- `LOG_LEVEL`: Logging level (default: info)

## Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm --filter @splits-network/[service-name] dev

# Build
pnpm --filter @splits-network/[service-name] build

# Start production  
pnpm --filter @splits-network/[service-name] start
```

## Docker

```bash
docker-compose build [service-name]
docker-compose up -d [service-name]
```

## Architecture Compliance

This service follows **V2 Architecture** patterns:
- ✅ Single PATCH method for all updates
- ✅ Access context integration for role-based authorization
- ✅ Domain-based folder structure under `src/v2/`
- ✅ Standardized response format: `{ data: ... }`
- ✅ Event-driven coordination (no HTTP service calls)

## Related Services

- **Service A**: How it interacts
- **Service B**: Data dependencies
- **Service C**: Event relationships
```

## .copilot-instructions.md Template

```markdown
# [Service Name] - Copilot Instructions

Service-specific instructions for GitHub Copilot when working on this service.

## Service Overview

Brief description of what this service does and its role in the system.

### Key Responsibilities
- Primary responsibility
- Secondary responsibility  
- Integration points

## Architecture Patterns

### ✅ V2 Architecture Compliance
This service follows V2 patterns:
- Repository pattern with `resolveAccessContext(supabase, clerkUserId)`
- Single PATCH method for all updates
- Direct Supabase queries with role-based filtering
- Event-driven coordination
- Domain-based folder structure

## Code Patterns

### Repository Pattern
```typescript
// V2 Access Context Pattern
const context = await resolveAccessContext(this.supabase, clerkUserId);
if (context.candidateId) {
  query.eq('user_id', context.candidateId);
}
```

### Event Publishing Pattern
```typescript
const userContext = await this.accessResolver.resolve(clerkUserId);
await this.eventPublisher.publish('resource.updated', {
  resource_id: id,
  updated_by: userContext.identityUserId,
  changes: Object.keys(updates)
});
```

## Critical Implementation Details

### Database Schema Considerations
- Important field structures
- JSONB patterns
- Relationship considerations

### Event Specifications

List consumed and published events with:
- Event names and triggers
- Expected payloads
- Downstream effects

## Dependencies & Integration

### Required Services
- **Service A**: Why it's required
- **Database**: Schema dependencies

### Optional Integrations  
- **Service B**: When it's used

## Development Guidelines

### Testing Patterns
```typescript
// Service-specific test patterns
```

### Common Pitfalls
❌ **Don't**: Anti-patterns specific to this service
✅ **Do**: Best practices for this service

---
**Last Updated**: [Date]
**Service Version**: X.X.X
**Architecture**: V2
```

## Implementation Checklist

When creating a new service:

- [ ] Create `README.md` using template above
- [ ] Create `.copilot-instructions.md` using template above  
- [ ] Document all consumed events with payloads
- [ ] Document all published events with payloads
- [ ] List environment variables
- [ ] Specify database schema usage
- [ ] Include Docker commands
- [ ] List related service dependencies
- [ ] Add service-specific development patterns
- [ ] Document critical implementation details

## Event Documentation Standards

### Event Naming Convention
- `entity.action` (e.g., `document.uploaded`, `application.created`)
- Use past tense for completed actions
- Use present tense for ongoing states

### Event Payload Standards
- Always include `entity_id` and timestamps
- Use consistent field naming (snake_case)
- Include correlation IDs where applicable
- Document required vs optional fields

### Routing Key Patterns
- Match event names exactly
- Use topic exchange for flexible routing
- Document routing key patterns used

---

**Note**: This documentation standard should be applied to all existing and new services in the monorepo. Services without proper event documentation create integration difficulties and debugging challenges.