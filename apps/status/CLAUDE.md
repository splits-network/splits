# Status App

Public system health status page -- Next.js 16, App Router, Basel design system.

Runs at `localhost:3103` via `pnpm --filter @splits-network/status dev`.

## Key Sections

```
src/app/              # Main status page (SSR + client polling)
src/components/       # Header, Footer, StatusAnimator
```

## Skills

- `/ui` -- DaisyUI component patterns, theme tokens
- `/basel` -- Basel design system compliance
- `/seo` -- SEO for public status page

## Notes

- Fully public, no authentication
- SSR with ISR (revalidate: 15s) + client-side 30s polling
- Basel design system throughout (DaisyUI semantic tokens only)
- Consumes GET /api/v2/system-health and /api/v2/system-health/incidents
- Contact form POSTs to /api/v2/status-contact
- API calls proxied via Next.js rewrites to avoid CORS
