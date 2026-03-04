# Technical Architecture Reference

This document provides a technical overview of the Employment Networks platform architecture for contextual understanding of how the system works.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Apps                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Portal   │  │Candidate │  │Corporate │  │ Admin  │ │
│  │splits.net │  │applicant │  │employ-net│  │        │ │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └───┬────┘ │
│       │              │                          │      │
│       └──────┬───────┘                          │      │
│              ▼                                  ▼      │
│     ┌─────────────┐                    ┌─────────────┐ │
│     │ API Gateway  │                    │Admin Gateway│ │
│     │api.splits.net│                    │             │ │
│     └──────┬──────┘                    └─────────────┘ │
│            │                                           │
│   ┌────────┼────────────────────────────┐              │
│   │        ▼        ▼        ▼          │              │
│   │  ┌─────────┐┌────────┐┌─────────┐  │              │
│   │  │   ATS   ││Network ││Identity │  │              │
│   │  │ Service ││Service ││ Service │  │              │
│   │  └─────────┘└────────┘└─────────┘  │              │
│   │  ┌─────────┐┌────────┐┌─────────┐  │              │
│   │  │Billing  ││  AI    ││Matching │  │              │
│   │  │ Service ││Service ││ Service │  │              │
│   │  └─────────┘└────────┘└─────────┘  │              │
│   │  ┌─────────┐┌────────┐┌─────────┐  │              │
│   │  │ Search  ││Gamific.││  Chat   │  │              │
│   │  │ Service ││Service ││ Service │  │              │
│   │  └─────────┘└────────┘└─────────┘  │              │
│   │  ┌─────────┐┌────────┐┌─────────┐  │              │
│   │  │Notific. ││Integr. ││Document │  │              │
│   │  │ Service ││Service ││ Service │  │              │
│   │  └─────────┘└────────┘└─────────┘  │              │
│   │  ┌─────────┐┌────────┐┌─────────┐  │              │
│   │  │Automtn. ││Content ││Analytics│  │              │
│   │  │ Service ││Service ││ Service │  │              │
│   │  └─────────┘└────────┘└─────────┘  │              │
│   │       Microservices Layer           │              │
│   └────────────────┬────────────────────┘              │
│                    │                                   │
│   ┌────────────────┼────────────────────┐              │
│   │    ┌───────────┤                    │              │
│   │    ▼           ▼           ▼        │              │
│   │ ┌──────┐  ┌────────┐  ┌────────┐   │              │
│   │ │Supa- │  │RabbitMQ│  │ Redis  │   │              │
│   │ │base  │  │ Events │  │ Cache  │   │              │
│   │ │Postgres│ │        │  │        │   │              │
│   │ └──────┘  └────────┘  └────────┘   │              │
│   │        Infrastructure               │              │
│   └─────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | TailwindCSS v4, DaisyUI v5 |
| **Design System** | Memphis UI (custom TailwindCSS plugin), Basel UI (component library) |
| **Authentication** | Clerk (two tenants: Portal + Candidate) |
| **Backend Framework** | Fastify + TypeScript |
| **Database** | Supabase PostgreSQL (single instance, schemas: public, search, analytics) |
| **Vector Search** | pgvector (PostgreSQL extension) |
| **Event Bus** | RabbitMQ |
| **Cache / Rate Limiting** | Redis |
| **File Storage** | Supabase Storage |
| **Email Delivery** | Resend |
| **Payments** | Stripe (subscriptions, invoicing, Connect payouts) |
| **AI** | OpenAI GPT (fit analysis, resume parsing) |
| **Infrastructure** | Kubernetes (Azure AKS), Docker |
| **TLS** | cert-manager + Let's Encrypt |
| **Document Scanning** | ClamAV |
| **Icons** | FontAwesome (duotone + regular) |
| **Monitoring** | Sentry (error tracking), custom health monitor |

---

## Service Directory

| Service | Purpose |
|---------|---------|
| **API Gateway** | Central entry point — Clerk JWT auth, Redis rate limiting, request routing to domain services |
| **ATS Service** | Core ATS — jobs, candidates, applications, placements, pre-screening, skills, notes |
| **Network Service** | Recruiter network — recruiter profiles, firm management, assignments, relationships, reputation |
| **Identity Service** | Users, organizations, memberships, roles, onboarding |
| **Billing Service** | Plans, subscriptions, Stripe integration, commission splits, payouts, escrow, invoicing, disputes |
| **AI Service** | Candidate-job fit analysis, resume text extraction |
| **Matching Service** | Candidate-job matching (rules + skills + AI/vector), embedding generation |
| **Search Service** | Full-text search across all entity types (Postgres FTS) |
| **Gamification Service** | XP, levels, badges, streaks, leaderboards |
| **Notification Service** | Event-driven transactional emails via Resend (20+ consumer domains) |
| **Chat Service** | Conversations, messages, presence |
| **Chat Gateway** | WebSocket fan-out for real-time messaging |
| **Integration Service** | Third-party ATS sync (Greenhouse, Lever, Workable, Ashby), LinkedIn, calendar, email |
| **Document Service** | File storage wrappers (Supabase Storage) |
| **Document Processing Service** | Resume parsing and AI metadata extraction |
| **Automation Service** | Rules engine, workflow automation, fraud signal detection |
| **Analytics Service** | Stats aggregation, charts, marketplace metrics |
| **Analytics Gateway** | WebSocket fan-out for real-time dashboard data |
| **Content Service** | CMS for marketing pages, navigation, images |
| **Health Monitor** | System health monitoring and incident management |

---

## Domain Architecture

### Domains and Bounded Contexts

```
Identity Domain          Network Domain           ATS Domain
├── Users                ├── Recruiters            ├── Jobs
├── Organizations        ├── Firms                 ├── Candidates
├── Memberships          ├── Assignments (CRA)     ├── Applications
├── User Roles           ├── Recruiter-Company     ├── Placements
└── Onboarding           │   Relationships         ├── Application Notes
                         ├── Recruiter-Candidate   ├── Pre-screening
                         │   Relationships         ├── Skills
                         ├── Referral Codes        ├── Job Requirements
                         └── Reputation            └── Saved Jobs

Billing Domain           Engagement Domain         Intelligence Domain
├── Plans                ├── Gamification          ├── AI Fit Analysis
├── Subscriptions        │   ├── XP                ├── AI Matching
├── Splits Rates         │   ├── Badges            ├── Vector Embeddings
├── Placement Snapshots  │   ├── Streaks           ├── Resume Parsing
├── Placement Splits     │   └── Leaderboards      └── Fraud Detection
├── Payout Transactions  ├── Chat / Messaging
├── Escrow Holds         ├── Notifications
├── Invoices             └── Search
└── Disputes
```

---

## Key Architectural Patterns

### 1. Frontend → Gateway → Service → Database

All frontend requests follow this path:
- Frontend apps call the API Gateway only (never individual services)
- Gateway authenticates the Clerk JWT and sets `x-clerk-user-id` header
- Gateway routes requests to the appropriate domain service
- Services access the shared Supabase PostgreSQL database directly

### 2. No HTTP Between Services

Services never call each other over HTTP. Cross-service communication uses:
- **Direct database queries** — services share the same database
- **RabbitMQ events** — for asynchronous, event-driven workflows

### 3. Event-Driven Architecture

Domain events flow through RabbitMQ:
```
Service publishes event → RabbitMQ → Consumer services react
```

Examples:
- `application.stage_changed` → Notification service sends email
- `placement.completed` → Billing service triggers payout
- `badge.awarded` → Notification service sends congratulatory email
- `placement.created` → Gamification service awards XP

### 4. V2 API Pattern (5-Route Standard)

Every resource follows a consistent 5-route pattern:

| Route | Purpose |
|-------|---------|
| `GET /` | List with pagination, filtering, sorting |
| `GET /:id` | Get single resource by ID |
| `POST /` | Create new resource |
| `PATCH /:id` | Update existing resource |
| `DELETE /:id` | Delete (soft or hard) resource |

Each resource has three layers:
- **Routes** — HTTP endpoint definitions and request validation
- **Service** — Business logic and authorization
- **Repository** — Database queries (Supabase client)

### 5. Standard API Response Format

All API responses use a consistent envelope:

```json
// Single resource
{ "data": { ... } }

// List response
{
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

## Data Flow Examples

### Placement Flow (End-to-End)

```
1. Company posts job on Splits Network (or recruiter posts on company's behalf)
2. Recruiter sources candidate (or candidate applies via Applicant Network)
3. Recruiter submits candidate to job → Application created
4. AI analyzes candidate-job fit → Fit score + feedback generated
5. Candidate optionally revises application based on AI feedback
6. Application passes through approval gates:
   a. Candidate Recruiter reviews and approves
   b. Company Recruiter validates
   c. Company makes final decision
7. Company extends offer → Candidate accepts → Status: "hired"
8. Placement record created with commission attribution snapshot
9. Placement Splits calculated based on 5-role attribution + plan-tier rates
10. Escrow holds created for guarantee period (default 90 days)
11. Guarantee period passes successfully
12. Payout transactions triggered → Stripe transfers to recruiter accounts
13. Gamification events: XP awarded, badges evaluated, leaderboards updated
```

### Event Flow Example: New Placement

```
ats-service: placement.created
     ├── notification-service → Sends placement confirmation emails
     ├── billing-service → Creates placement snapshot + split calculations
     ├── gamification-service → Awards XP to involved recruiters
     └── analytics-service → Updates marketplace metrics
```

---

## Deployment Architecture

- **Cloud Provider:** Azure (AKS — Azure Kubernetes Service)
- **Container Orchestration:** Kubernetes with raw YAML manifests
- **Environments:** Staging + Production
- **Horizontal Scaling:** Portal app runs 3 replicas in production
- **WebSocket Routing:** Dedicated ingress rules for `/ws/chat` and `/ws/analytics`
- **TLS Termination:** ingress-nginx with cert-manager (Let's Encrypt certificates)
- **Namespace:** `splits-network`

---

## Domain Mapping

| Domain | Service |
|--------|---------|
| `splits.network` | Portal app |
| `applicant.network` | Candidate app |
| `employment-networks.com` | Corporate app |
| `api.splits.network` | API Gateway |
| `api.applicant.network` | API Gateway (candidate routes) |
| `status.splits.network` | Status app |
| `admin.employment-networks.com` | Admin app |
