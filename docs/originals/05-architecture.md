# Splits Network – Architecture (Including Diagrams)

Covers services and event flows for:
- Draft application + AI assessment
- Proposal routing
- Payout snapshot + Stripe payouts
- Notifications via Resend

---

## 1. Components
- Next.js apps: marketing, portal, candidate
- Fastify services: ats, network, billing, notifications, assessment (optional)
- Supabase Postgres
- RabbitMQ events
- Redis caches/counters
- Clerk auth
- Stripe subscriptions + Connect payouts
- Resend email

---

## 2. Diagram – Application & Assessment

```mermaid
flowchart TD
  Cand[apps/candidate] -->|Draft/Submit| ATS[ats-service]
  ATS -->|assessment.requested| MQ[(RabbitMQ)]
  MQ --> AS[assessment-service]
  AS -->|assessment.completed| MQ
  MQ --> ATS
  ATS -->|notify.*| MQ
  MQ --> N[notification-service]
  N --> R[Resend]
```

---

## 3. Diagram – Payout Snapshot & Execution

```mermaid
flowchart TD
  ATS[ats-service] -->|placement.hired| MQ[(RabbitMQ)]
  MQ --> B[billing-service]
  B --> S[Snapshot sourcer plans @ hire]
  S --> P[Compute allocations]
  P --> L[Payout ledger]
  L -->|execute| STR[Stripe Connect]
  STR -->|transfer ids| B
  B -->|payout.paid| MQ
  MQ --> N[notification-service]
  N --> R[Resend]
```
