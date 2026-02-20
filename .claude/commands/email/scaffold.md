# /email:scaffold - Create Email Template

**Description:** Scaffold a new branded email template for a domain event

## Usage

```bash
/email:scaffold <domain> <event>
```

## Parameters

- `<domain>` — Template domain (e.g., `interviews`, `assessments`)
- `<event>` — Event trigger (e.g., `scheduled`, `completed`)

## Examples

```bash
/email:scaffold interviews scheduled
/email:scaffold assessments completed
/email:scaffold payouts failed
```

## What Gets Created

1. Template file: `services/notification-service/src/templates/<domain>/<event>.ts`
2. Updated consumer (if needed): `services/notification-service/src/consumers/<domain>-consumer.ts`
3. Updated email service: `services/notification-service/src/services/<domain>-email.ts`

## Execution

Spawn the `email` agent. It will:
1. Read `templates/base.ts` and `templates/components.ts` for reusable parts
2. Read existing templates in the target domain for style consistency
3. Create the template with brand-aware rendering
4. Wire the consumer to trigger the email on the domain event
