# Portal App

Main authenticated app — Next.js 16, App Router, DaisyUI + TailwindCSS.

Runs at `localhost:3100` via `pnpm --filter @splits-network/portal dev`.

## Key Sections

```
src/app/portal/       # Authenticated routes (admin, dashboard, billing, etc.)
src/app/       # Public marketing pages (pricing, features)
src/components/       # Shared portal components (header, footer, Basel design)
```

## Skills

- `/ui` — DaisyUI component patterns, theme tokens, form controls
- `/auth` — Clerk auth patterns, getToken gotcha, user identification
- `/basel` — Basel design system migration & compliance

## Frontend Data Loading

Progressive pattern: load primary data immediately, secondary in parallel after primary.

## Loading States

Use `@splits-network/shared-ui` — never manually create spinners.
See `docs/guidance/loading-patterns-usage-guide.md` for components and usage.
