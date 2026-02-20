# Services

All backend services use **Fastify + TypeScript** with **Supabase Postgres**.

## Skills

- `/api:scaffold <service> <resource>` — Scaffold a new V2 resource (types, repo, service, routes)
- `/api:audit <service>` — Audit V2 compliance
- `/migration <description>` — Create database migration
- `/test:scaffold <service> <resource>` — Scaffold Vitest tests
- `/event:scaffold <domain> <action>` — Scaffold RabbitMQ event flow
- `/email:scaffold <domain> <event>` — Create email template
- `/auth` — Clerk auth patterns reference

## Service Directory

| Service | Purpose |
|---------|---------|
| `api-gateway` | Routes to domain services, Clerk JWT auth, rate limiting |
| `identity-service` | Users, orgs, memberships |
| `ats-service` | Jobs, candidates, applications, placements |
| `network-service` | Recruiters, assignments, proposals |
| `billing-service` | Plans, subscriptions, Stripe, payouts |
| `notification-service` | Event-driven email (Resend) |
| `automation-service` | AI matching, fraud detection |
| `ai-service` | AI-powered candidate-job fit analysis |
| `document-service` | File storage (Supabase Storage) |
| `analytics-service` | Stats, charts, metrics aggregation |
| `analytics-gateway` | WebSocket fan-out for real-time dashboard events |
| `chat-service` | Conversations, messages, presence queries |
| `chat-gateway` | WebSocket fan-out for real-time messaging |
| `content-service` | CMS content management |
| `health-monitor` | System health monitoring |

## Key Rules

- No HTTP calls between services — use DB queries or RabbitMQ events
- User identity comes from `request.headers['x-clerk-user-id']` (set by api-gateway)
- Always wrap responses in `{ data: payload }` envelope
- List responses include `{ data, pagination: { total, page, limit, total_pages } }`
