---
name: seo
description: Audit and optimize SEO across all apps — server-first rendering, metadata, structured data, sitemaps, and on-page optimization.
---

# /seo - SEO Audit & Optimization

When invoked, spawn the `seo` agent (`.claude/agents/seo.md`) to perform SEO work.

## Sub-Commands

- `/seo:audit <app>` - Audit an app for SEO compliance (architecture + metadata + on-page)
- `/seo:fix <target>` - Fix SEO issues on a specific page or app-wide

## Core Principle: Server-First Rendering

The single biggest SEO lever is getting content into the initial HTML response. Before checking metadata or structured data, the agent MUST verify the rendering architecture:

1. **Public pages must be server components** — no `"use client"` in page.tsx
2. **Content must be in the initial HTML** — no client-side data fetching for primary content
3. **Client components are for interactivity only** — filters, modals, view toggles, not content

### Decision Matrix

| Page Location             | Rendering Requirement                                    |
| ------------------------- | -------------------------------------------------------- |
| `apps/corporate/src/app/` | 100% Server — all pages must be fully SSR                |
| `apps/*/src/app/`         | Server-first — content in HTML, client for interactivity |
| `apps/*/src/app/portal/`  | Client OK — behind auth, not indexed                     |

## Audit Scope

### Architecture (Critical)

- Client-page anti-pattern on public routes
- Client-side data fetching for primary content
- Content missing from initial HTML response

### Metadata (High)

- Missing `metadata` or `generateMetadata` exports
- Title under 60 chars with primary keyword
- Description 150-160 chars
- OpenGraph tags (title, description, url, image)
- Canonical URLs

### Indexing (High)

- Sitemap coverage (all public routes included)
- robots.txt configuration (AI crawlers allowed)
- No important routes blocked

### On-Page (Medium)

- Heading hierarchy (one h1, proper nesting)
- JSON-LD structured data on entity pages
- Image alt text
- Internal linking quality
- Semantic HTML landmarks

## Current Infrastructure

- **JSON-LD**: Use `<JsonLd>` from `@splits-network/shared-ui` (never raw `dangerouslySetInnerHTML`)
- **Sitemaps**: `apps/*/src/app/sitemap.ts`
- **Robots**: `apps/*/src/app/robots.ts`
- **Metadata**: Next.js 16 Metadata API (`export const metadata` or `generateMetadata`)
