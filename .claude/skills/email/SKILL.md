---
name: email
description: Create branded email templates following the notification-service patterns with base template, reusable components, and brand-aware rendering.
---

# /email - Email Template Management

Spawn the `email` agent (`.claude/agents/email.md`) to create or audit email templates.

## Sub-Commands

- `/email:scaffold <domain> <event>` — Create a new email template for a domain event

## Architecture

```
services/notification-service/src/
  templates/
    base.ts             — Base HTML wrapper (header, footer, brand switching)
    components.ts       — Reusable email UI components
    <domain>/           — Domain-specific templates
  consumers/            — RabbitMQ event consumers
  services/             — Email sending logic per domain
```

## Brand-Aware Rendering

Templates support 3 brands: `portal`, `candidate`, `corporate`

```typescript
import { baseEmailTemplate, EmailSource } from '../templates/base';

const html = baseEmailTemplate({
    preheader: 'First 90 chars shown in inbox preview',
    source: 'portal',  // 'portal' | 'candidate' | 'corporate'
    content: '<p>Email body here</p>',
});
```

## Existing Template Domains

applications, billing, candidates, company-invitations, health, invitations, placements, proposals, recruiter-submission, reputation
