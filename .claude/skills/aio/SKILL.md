---
name: aio
description: Audit and optimize for AI crawlers, LLM consumption, and answer-engine visibility (Perplexity, Google AI Overview, ChatGPT browse).
---

# /aio - AI Optimization Audit & Fix

When invoked, spawn the `aio` agent (`.claude/agents/aio.md`) to perform AIO work.

## Sub-Commands

- `/aio:audit <app>` - Audit an app for AI optimization compliance
- `/aio:fix <target>` - Fix AIO issues on a specific page or app-wide

## Core Principle: If It's Not in the HTML, AI Can't See It

AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do minimal or no JavaScript execution. Content must be in the initial server response.

### The Anti-Pattern
```
page.tsx (server) → imports ClientPage
ClientPage.tsx ('use client') → fetches data, renders everything
Result: AI sees an empty shell
```

### The Correct Pattern
```
page.tsx (server) → fetches data, renders content in RSC
ClientControls.tsx ('use client') → receives data as props, adds interactivity
Result: AI sees complete content
```

## AIO Focus Areas

### Content Visibility (Critical)
- Server-rendered content on all public pages
- No client-page anti-pattern
- No content hidden behind client-side data fetching
- robots.txt allows AI crawlers

### Content Structure (High)
- Direct answers in first paragraph (AI snippets pull from opening sentences)
- Question-format headings matching natural queries
- FAQ sections with `FAQPage` JSON-LD schema
- How-to content with `HowTo` JSON-LD schema
- Structured lists and tables (not info buried in prose)

### Content Quality (Medium)
- Specific data with context (not vague claims)
- Domain terms explicitly defined
- Unique, substantive content per page
- Clear topical focus (one topic per page)

### AI Crawler Access
- robots.txt: GPTBot, ClaudeBot, PerplexityBot, Google-Extended explicitly allowed
- llms.txt at domain root (emerging standard)
- No interstitials blocking content from crawlers

## High-Value Content Types for AI Citation

| Content Type | Why AI Cites It | Schema |
|-------------|----------------|--------|
| FAQ sections | Direct Q&A extraction | `FAQPage` |
| How-to guides | Step-by-step answers | `HowTo` |
| Documentation | Reference material | `TechArticle` |
| Pricing tables | "How much" queries | `Product` + `Offer` |
| Glossary/definitions | Term explanations | `DefinedTerm` |
| Data/statistics | Specific citation | `Article` |
