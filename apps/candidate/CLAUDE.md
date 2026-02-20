# Candidate App

Candidate-facing portal — Next.js 16, App Router.

## Key Sections

```
src/app/(auth)/       # Auth flows (login, register)
src/app/       # Public pages, CMS content
src/app/authorize/    # OAuth authorization flows
src/components/       # Navigation (header, footer)
```

## Skills

- `/ui` — DaisyUI component patterns, theme tokens
- `/auth` — Clerk auth patterns, getToken gotcha
- `/seo` — SEO audit (public pages are SEO-relevant)

## Notes

- Public-first: many pages are unauthenticated / SEO-relevant
- Shares loading components from `@splits-network/shared-ui`
- API calls go through api-gateway only
