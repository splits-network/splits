# AI Optimization (AIO) Audit Report

**Date:** 2026-02-11
**Scope:** All three public-facing apps -- Portal (splits.network), Candidate (applicant.network), Corporate (employment-networks.com)
**Branch:** staging
**Auditor:** AIO Agent (Claude Opus 4.6)

---

## Executive Summary

Splits Network has a strong foundation for AI discoverability. All three apps use Next.js App Router with server-side metadata, Open Graph tags, and some JSON-LD structured data. The `llms.txt` files are deployed for all three domains (both at root and `.well-known/`), and sitemaps exist for each app.

However, several systemic issues undermine AI crawler effectiveness:

1. **Nearly all public content components are client-rendered** (`"use client"` on every content file), meaning AI crawlers relying on initial HTML will see empty containers with `opacity-0` classes.
2. **Zero `FAQPage` JSON-LD schema** despite 5 separate FAQ sections across the three apps -- this is the single highest-impact gap for answer-engine visibility.
3. **No `BreadcrumbList`, `HowTo`, `DefinedTerm`, or `TechArticle` structured data** anywhere in the codebase, despite rich documentation and how-to content that would benefit enormously from these schema types.
4. **Content hidden behind GSAP animations** starts at `opacity: 0` and relies on JavaScript to become visible, making it invisible to crawlers that do not execute client-side JS.
5. **Sitemap priority and changeFrequency values are generic** and do not differentiate high-value content pages from legal pages.

Fixing these issues would substantially improve Splits Network's visibility in AI search results, answer engines, and LLM citation pipelines.

---

## Category 1: Client-Side Rendering (CRITICAL)

### Finding 1.1: All Content Components Use `"use client"`

**Severity:** CRITICAL
**Impact:** AI crawlers (GPTBot, ClaudeBot, PerplexityBot) may not execute JavaScript. Server-rendered HTML is the gold standard for AI discoverability.

Every single content component across all three apps is marked with `"use client"`:

**Portal app (`apps/portal/src/app/public/`):**
- `g:\code\splits.network\apps\portal\src\app\public\features\features-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\about\about-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\for-recruiters\for-recruiters-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\for-companies\for-companies-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\transparency\transparency-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\blog\blog-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\updates\updates-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\partners\partners-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\careers\careers-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\press\press-content.tsx` (line 1)
- `g:\code\splits.network\apps\portal\src\app\public\integration-partners\integration-content.tsx` (line 1)

**Candidate app (`apps/candidate/src/app/public/`):**
- `g:\code\splits.network\apps\candidate\src\app\public\about\about-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\how-it-works\how-it-works-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\for-recruiters\for-recruiters-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\career-guides\career-guides-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\resume-tips\resume-tips-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\interview-prep\interview-prep-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\salary-insights\salary-insights-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\industry-trends\industry-trends-content.tsx` (line 1)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\success-stories\success-stories-content.tsx` (line 1)

**Corporate app (`apps/corporate/src/`):**
- All 10 landing section components in `g:\code\splits.network\apps\corporate\src\components\landing\sections\` are `"use client"`

**Note on Next.js behavior:** While Next.js does SSR `"use client"` components (they are pre-rendered on the server and hydrated on the client), the `opacity-0` CSS classes applied to many content elements mean the initial server-rendered HTML contains the content but marks it invisible. Some crawlers may still extract this content, but it is a significant risk -- especially for answer engines that render pages in headless browsers with limited JS execution time.

**Recommendation:** Refactor public content pages to separate static content (server component) from animations (client component). The text content, headings, lists, and FAQ answers should be rendered in a server component. Animation logic should be isolated into thin client wrapper components that only handle the GSAP animation layer.

---

### Finding 1.2: Content Hidden Behind `opacity-0` CSS Classes

**Severity:** CRITICAL
**Impact:** Even though Next.js SSR renders the HTML, 92 occurrences of `opacity-0` across portal public pages and 42 across corporate pages mean the visual content is invisible until JavaScript animation fires.

**Affected files and occurrence counts:**

| File | `opacity-0` Count |
|------|-------------------|
| `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` | 26 |
| `g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx` | 22 |
| `g:\code\splits.network\apps\portal\src\app\public\about\about-content.tsx` | 18 |
| `g:\code\splits.network\apps\portal\src\app\public\partners\partners-content.tsx` | 14 |
| `g:\code\splits.network\apps\portal\src\app\public\features\features-content.tsx` | 12 |
| `g:\code\splits.network\apps\corporate\src\components\landing\sections\problem-section.tsx` | 7 |
| `g:\code\splits.network\apps\corporate\src\components\landing\sections\hero-section.tsx` | 7 |

**Example from features-content.tsx (line 527):**
```tsx
<div className="hero-content text-center max-w-5xl opacity-0">
```

**Recommendation:** Remove `opacity-0` from the server-rendered markup. Instead, apply initial opacity via JavaScript on mount (e.g., `gsap.set(el, { opacity: 0 })` inside `useGSAP`). This way crawlers see fully visible content, and users still get the animation experience.

---

## Category 2: Structured Data / JSON-LD (HIGH PRIORITY)

### Finding 2.1: No `FAQPage` Schema Despite 5 FAQ Sections

**Severity:** HIGH
**Impact:** FAQ content is the single most-cited content type in AI answer engines. Without `FAQPage` schema, these rich Q&A sections are significantly less likely to be surfaced by Perplexity, Google AI Overview, or ChatGPT browse.

**FAQ sections that lack `FAQPage` JSON-LD:**

1. **Portal landing page FAQ** -- `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx` (6 questions about split-fee mechanics, payments, costs)
2. **Portal pricing page FAQ** -- `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` (lines 22-43, 5 questions about payout bonuses, plan switching, fees)
3. **Candidate landing page FAQ** -- `g:\code\splits.network\apps\candidate\src\components\landing\sections\faq-section.tsx` (6 questions about candidate experience, recruiter matching)
4. **Corporate landing page FAQ** -- `g:\code\splits.network\apps\corporate\src\components\landing\sections\faq-section.tsx` (6 questions about platform differences, split fees, data security)
5. **Corporate page-level FAQ** -- `g:\code\splits.network\apps\corporate\src\app\page.tsx` uses `<FAQSection />` but no FAQPage JSON-LD

**Recommendation:** Add `FAQPage` JSON-LD to each page containing FAQ content. Example for the portal pricing page:

```tsx
import { JsonLd } from "@splits-network/shared-ui";

// In the page.tsx (server component), not the content component
const pricingFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
        },
    })),
};
```

This requires extracting the `faqs` array from the client component into a shared data file that both the server page (for JSON-LD) and the client component (for rendering) can import.

---

### Finding 2.2: No `BreadcrumbList` JSON-LD Schema

**Severity:** HIGH
**Impact:** Documentation pages have visual breadcrumbs (via `DocPageHeader`) but no corresponding `BreadcrumbList` JSON-LD. AI systems cannot parse the navigation hierarchy from visual-only breadcrumbs.

**Affected component:** `g:\code\splits.network\apps\portal\src\app\public\documentation\components\doc-page-header.tsx`

The component accepts `breadcrumbs` prop (line 18) and renders a `<nav className="text-sm breadcrumbs">` element, but no structured data is emitted.

**Affected pages:** All 30+ documentation pages under `g:\code\splits.network\apps\portal\src\app\public\documentation\` that use `DocPageHeader`.

**Recommendation:** Add `BreadcrumbList` JSON-LD inside `DocPageHeader`:

```tsx
const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: crumb.href
            ? `https://splits.network${crumb.href}`
            : undefined,
    })),
};
```

---

### Finding 2.3: No `HowTo` Schema on How-It-Works Pages

**Severity:** HIGH
**Impact:** The how-it-works pages contain step-by-step process content that perfectly maps to `HowTo` schema -- a high-value schema type for AI citation. The recruiter 5-step and company 5-step workflows are ideal candidates.

**Affected files:**
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\page.tsx`
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx` (recruiterSteps lines 21-79, companySteps lines 81-138)
- `g:\code\splits.network\apps\candidate\src\app\public\how-it-works\page.tsx`

**Recommendation:** Add `HowTo` JSON-LD to the server-side page component:

```tsx
const recruiterHowToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use Splits Network as a Recruiter",
    description: "A step-by-step guide for recruiters joining Splits Network",
    step: recruiterSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
    })),
};
```

---

### Finding 2.4: No `TechArticle` Schema on Documentation Pages

**Severity:** MEDIUM
**Impact:** The documentation section contains 30+ technical articles about platform usage. Using `TechArticle` schema would help AI systems understand these as authoritative technical content.

**Affected:** All pages under `g:\code\splits.network\apps\portal\src\app\public\documentation\`

The documentation layout (`g:\code\splits.network\apps\portal\src\app\public\documentation\layout.tsx`) uses `CollectionPage` schema for the section-level, which is correct, but individual doc pages have no schema at all.

**Recommendation:** Add `TechArticle` JSON-LD to individual documentation pages, leveraging the existing `DocPageHeader` props:

```tsx
const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: description,
    dateModified: lastUpdated,
    author: { "@type": "Organization", name: "Splits Network" },
    publisher: { "@type": "Organization", name: "Employment Networks" },
};
```

---

### Finding 2.5: No `DefinedTerm` Schema for Glossary-Like Content

**Severity:** MEDIUM
**Impact:** Several documentation pages define recruiting-specific terms (e.g., "Placement," "Role," "Split Fee"). Without `DefinedTerm` schema, these definitions are less likely to be surfaced when users ask AI systems "What is a split-fee placement?"

**Example from** `g:\code\splits.network\apps\portal\src\app\public\documentation\getting-started\what-is-splits-network\page.tsx` (lines 160-170):
```tsx
<strong>Role:</strong> The permission set that controls what you can see and do in the portal.
<strong>Placement:</strong> A successful hire tied to a role and candidate, used to track fees and earnings.
```

**Recommendation:** Either create a dedicated glossary page with `DefinedTerm` schema, or add `DefinedTermSet` JSON-LD to documentation pages that define terms.

---

### Finding 2.6: Existing JSON-LD Quality Issues

**Severity:** MEDIUM

**Issue A -- Corporate layout has potentially fabricated rating data:**
`g:\code\splits.network\apps\corporate\src\app\layout.tsx` (lines 99-103):
```tsx
aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
},
```
If these numbers are not based on real review data, this violates Google's structured data guidelines and could result in penalties. AI systems may also flag this as unreliable.

**Issue B -- Corporate SearchAction references non-existent search endpoint:**
`g:\code\splits.network\apps\corporate\src\app\layout.tsx` (lines 117-120):
```tsx
urlTemplate: "https://employment-networks.com/search?q={search_term_string}",
```
The corporate site has no `/search` route. This is a dead SearchAction.

**Issue C -- Job detail pages lack individual `JobPosting` JSON-LD:**
`g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx` generates metadata but no `JobPosting` structured data for individual job pages. The list page (`g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx`, line 119) includes `JobPosting` in the `ItemList`, but individual job detail pages have no standalone schema.

**Recommendation:** Remove or verify the `aggregateRating`. Remove the invalid `SearchAction`. Add full `JobPosting` JSON-LD to individual job detail pages including `description`, `datePosted`, `validThrough`, `employmentType`, `baseSalary`, and `jobLocation`.

---

## Category 3: Robots.txt and AI Crawler Access

### Finding 3.1: No Explicit AI Crawler Rules in robots.txt

**Severity:** MEDIUM
**Impact:** While the current `userAgent: '*'` rules allow all crawlers, explicit AI crawler rules signal intentional cooperation and can prevent issues if future changes accidentally block them.

**Affected files:**
- `g:\code\splits.network\apps\portal\src\app\robots.ts` -- Only has `userAgent: '*'` rule
- `g:\code\splits.network\apps\candidate\src\app\robots.ts` -- Only has `userAgent: '*'` rule
- `g:\code\splits.network\apps\corporate\src\app\robots.ts` -- Only has `userAgent: '*'` rule

**Recommendation:** Add explicit allow rules for AI crawlers:

```typescript
rules: [
    {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/api/*', '/portal', '/portal/*'],
    },
    { userAgent: 'GPTBot', allow: '/' },
    { userAgent: 'ClaudeBot', allow: '/' },
    { userAgent: 'PerplexityBot', allow: '/' },
    { userAgent: 'Google-Extended', allow: '/' },
    { userAgent: 'anthropic-ai', allow: '/' },
],
```

---

## Category 4: Sitemap Optimization

### Finding 4.1: Corporate Sitemap Missing Most Content

**Severity:** MEDIUM
**File:** `g:\code\splits.network\apps\corporate\src\app\sitemap.ts`

The corporate sitemap only includes 5 routes: `'', '/cookie-policy', '/privacy-policy', '/status', '/terms-of-service'`. The homepage is the only content page -- this is technically correct since the corporate site is a single-page marketing site, but the sitemap does not convey page section importance.

**Recommendation:** No change needed for the corporate sitemap since it is a single-page app with policy pages.

---

### Finding 4.2: Sitemap Priority Values Are Generic

**Severity:** LOW
**Affected files:**
- `g:\code\splits.network\apps\portal\src\app\sitemap.ts` -- All non-home pages get `priority: 0.7`
- `g:\code\splits.network\apps\candidate\src\app\sitemap.ts` -- All non-home pages get `priority: 0.7`

**Recommendation:** Differentiate priority by content type:
- Home, features, pricing, how-it-works, for-recruiters, for-companies: `priority: 0.9`
- Documentation hub pages: `priority: 0.8`
- Individual documentation pages, resources: `priority: 0.7`
- Blog, updates, press: `priority: 0.6`
- Legal/policy pages: `priority: 0.3`

Also set `changeFrequency` to `'weekly'` for documentation and resource pages that get regular updates.

---

### Finding 4.3: Candidate Sitemap Includes Feed URLs

**Severity:** LOW
**File:** `g:\code\splits.network\apps\candidate\src\app\sitemap.ts` (lines 14-15)

The sitemap includes `/public/jobs/rss.xml` and `/public/jobs/atom.xml`. Feed URLs should not be in sitemaps -- they are linked via `<link rel="alternate">` in the HTML head instead.

**Recommendation:** Remove feed URLs from the sitemap. They are already referenced via the `alternates` metadata in the jobs page.

---

## Category 5: llms.txt Files

### Finding 5.1: llms.txt Files Exist But Lack Depth

**Severity:** MEDIUM
**Impact:** The `llms.txt` standard (llmstxt.org) recommends including a structured description of what the site offers, not just a list of URLs.

**Affected files:**
- `g:\code\splits.network\apps\portal\public\llms.txt`
- `g:\code\splits.network\apps\portal\public\.well-known\llms.txt` (duplicate)
- `g:\code\splits.network\apps\candidate\public\llms.txt`
- `g:\code\splits.network\apps\candidate\public\.well-known\llms.txt` (duplicate)
- `g:\code\splits.network\apps\corporate\public\llms.txt`
- `g:\code\splits.network\apps\corporate\public\.well-known\llms.txt` (duplicate)

**Current format (example from portal):**
```
# llms.txt
# Splits Network public index for AI systems

Site: https://splits.network
Contact: hello@splits.network

Key pages:
- /public/documentation
- /public/features
...
```

**Recommendation:** Expand to include a description block, key topics, and content summaries per the llmstxt.org specification:

```
# Splits Network

> Splits Network is a split-fee recruiting marketplace where recruiters collaborate on job placements. Companies post roles, recruiters submit candidates, and fees are split transparently when a hire is made.

## Key topics
- Split-fee recruiting
- Recruiter marketplace
- Collaborative hiring
- Placement fee management
- ATS (Applicant Tracking System)

## Documentation
- [Getting Started](/public/documentation/getting-started): Account setup, navigation, and platform overview
- [Core Workflows](/public/documentation/core-workflows): Publishing roles, submitting candidates, tracking placements
- [Feature Guides](/public/documentation/feature-guides): Dashboard, billing, team management, notifications

## Pages
- [Features](/public/features): Platform capabilities for recruiters and companies
- [Pricing](/public/pricing): Starter (free), Pro ($99/mo), Partner ($249/mo) subscription tiers
- [How It Works](/public/how-it-works): Step-by-step process for recruiters and companies
- [For Recruiters](/public/for-recruiters): Benefits and workflows for recruiting professionals
- [For Companies](/public/for-companies): How companies use the platform to hire
- [Transparency](/public/transparency): Fee structure and split calculation details
```

Also, the portal `llms.txt` lists `/public/blog` and `/public/updates` but the blog page (`g:\code\splits.network\apps\portal\src\app\public\blog\blog-content.tsx`) and updates page are likely placeholder content. Only list pages with substantive content.

---

## Category 6: Meta Tags and Open Graph

### Finding 6.1: Inconsistent Metadata Depth Across Pages

**Severity:** MEDIUM

Some pages have comprehensive metadata (Open Graph, Twitter, keywords), while others have bare minimum:

**Well-optimized pages:**
- `g:\code\splits.network\apps\portal\src\app\public\for-companies\page.tsx` -- Has OG, Twitter, keywords array
- `g:\code\splits.network\apps\candidate\src\app\public\about\page.tsx` -- Has OG, keywords
- `g:\code\splits.network\apps\candidate\src\app\public\how-it-works\page.tsx` -- Has OG, keywords

**Under-optimized pages (title and description only):**
- `g:\code\splits.network\apps\portal\src\app\public\features\page.tsx` -- No OG or keywords
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\page.tsx` -- No OG or keywords
- `g:\code\splits.network\apps\portal\src\app\public\pricing\page.tsx` -- No OG or keywords
- `g:\code\splits.network\apps\portal\src\app\public\about\page.tsx` -- No OG or keywords
- `g:\code\splits.network\apps\portal\src\app\public\for-recruiters\page.tsx` -- No OG or keywords
- `g:\code\splits.network\apps\portal\src\app\public\transparency\page.tsx` -- No OG or keywords
- All candidate resource pages (career-guides, resume-tips, interview-prep, salary-insights, etc.)
- All portal documentation pages

**Recommendation:** Add Open Graph metadata to all high-value public pages. The Next.js metadata template (`%s | Splits Network`) handles title, but each page should have explicit `openGraph.description` and optionally page-specific OG images.

---

### Finding 6.2: Missing Canonical URLs on Public Pages

**Severity:** LOW
**Impact:** Without explicit canonical URLs, AI crawlers may index duplicate URLs (with/without trailing slashes, with query parameters).

**Recommendation:** Add `alternates.canonical` to each page's metadata:
```tsx
export const metadata: Metadata = {
    alternates: {
        canonical: "https://splits.network/public/features",
    },
};
```

---

## Category 7: Content Structure for LLM Consumption

### Finding 7.1: No Direct-Answer Opening Paragraphs

**Severity:** HIGH
**Impact:** AI answer engines pull from the first 2-3 sentences of a page. Currently, most pages start with hero sections containing vague marketing copy instead of direct answers.

**Examples:**

**Features page** (`g:\code\splits.network\apps\portal\src\app\public\features\features-content.tsx`, line 529):
```
"Everything You Need for Split Placements"
```
This is a tagline, not an answer. An AI system asking "What features does Splits Network have?" gets nothing useful from the opening.

**How-It-Works page** (`g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx`, line 587):
```
"How Splits Network Works"
```
Again, just a heading repetition.

**Recommendation:** Add a direct-answer paragraph at the top of each content component (or better, as a server-rendered `<p>` in the page component):

For Features:
> "Splits Network provides a complete split-fee recruiting platform including an applicant tracking system (ATS), automated fee calculation, a recruiter network marketplace, subscription-based pricing tiers, real-time notifications, and administrative controls. The platform serves recruiters, companies, and hiring managers."

For How-It-Works:
> "Splits Network connects companies who need talent with specialized recruiters. Companies post roles with fee structures, recruiters submit qualified candidates, and when a hire is made, the placement fee is automatically split between the recruiter and the platform based on the recruiter's subscription tier (Starter: 65%, Pro: 75%, Partner: 85%)."

---

### Finding 7.2: FAQ Answers Are Trapped in Client Components

**Severity:** HIGH
**Impact:** All FAQ content is defined inside `"use client"` components. While Next.js SSR renders this content, the answers are rendered inside `<div style={{ height: 0, opacity: 0 }}>` containers, making them effectively invisible to crawlers.

**Affected files:**
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\faq-section.tsx` (line 205: `style={{ height: 0, opacity: 0 }}`)
- `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` (line 760-763: `style={{ height: index === 0 ? "auto" : 0, opacity: index === 0 ? 1 : 0 }}`)
- `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx`
- `g:\code\splits.network\apps\candidate\src\components\landing\sections\faq-section.tsx`

**Recommendation:** Use `<details>` / `<summary>` HTML elements for FAQ accordion behavior. This is semantically correct, natively accessible, works without JavaScript, and exposes all content to crawlers. The GSAP animation can enhance the open/close transition without hiding the content from the DOM.

---

### Finding 7.3: Pricing Comparison Table Has Good Structure, Weak Accessibility

**Severity:** MEDIUM
**File:** `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` (lines 572-727)

The pricing comparison table is well-structured with `<table>`, `<thead>`, `<tbody>`, and `<th>` elements. However:
- Table rows start with `opacity-0` (line 582)
- Check/X indicators use icon elements (`<i className="fa-duotone...">`) with no text alternative
- The pricing data itself (Free, $99, $249) is embedded only in this client-rendered table

**Recommendation:** Add `aria-label` or visually hidden text for check/X icons. Consider also adding a `Product` JSON-LD or `Offer` structured data for each pricing tier.

---

### Finding 7.4: Metrics Section Uses Animated Counter Starting at Zero

**Severity:** MEDIUM
**File:** `g:\code\splits.network\apps\corporate\src\components\landing\sections\metrics-section.tsx` (line 198)

```tsx
<div className="metric-value ...">0{metric.suffix}</div>
```

The server-rendered HTML shows "0+", "0+", "0+", "0%" as the initial metric values. AI crawlers will see these zero values instead of the actual numbers (10,000+, 2,000+, 500+, 95%). This is a direct loss of citable data.

**Recommendation:** Render the actual target values in the HTML and use GSAP to animate from 0 only visually. Or render the values in a `<noscript>` tag, or set them as `data-*` attributes.

---

## Category 8: Content Gaps for AI Citation

### Finding 8.1: No Glossary or Definition Page

**Severity:** MEDIUM
**Impact:** Terms like "split-fee recruiting," "placement fee," "split placement," and "ATS" are domain-specific. AI systems would cite a glossary page when users ask "What is split-fee recruiting?" Currently no such page exists.

**Recommendation:** Create a dedicated glossary page at `/public/glossary` with definitions of key terms, each marked up with `DefinedTerm` schema. High-value terms include:
- Split-fee recruiting
- Placement fee
- Split placement
- Recruiter marketplace
- ATS (Applicant Tracking System)
- Payout bonus
- Candidate submission
- Hiring pipeline

---

### Finding 8.2: No Comparison Content

**Severity:** LOW
**Impact:** "Splits Network vs [competitor]" or "Splits Network vs traditional recruiting" queries are common in AI search. The portal landing page has a `ComparisonSection` component (referenced in `g:\code\splits.network\apps\portal\src\app\page.tsx`, line 3) but no standalone comparison page exists.

**Recommendation:** Create a dedicated comparison page at `/public/compare` covering:
- Splits Network vs traditional recruiting agencies
- Splits Network vs other split-fee platforms
- Split-fee recruiting vs direct hire

---

## Category 9: Semantic HTML

### Finding 9.1: Good Use of `<section>` Elements

**Positive finding.** All content pages make extensive use of `<section>` elements to delineate content areas. The documentation layout uses `<aside>` for the sidebar and `<main>` for the content area.

### Finding 9.2: Missing `<article>` on Documentation Pages

**Severity:** LOW
**Impact:** Documentation pages use `<div className="space-y-10">` as their root element. Using `<article>` would signal to AI crawlers that each documentation page is a self-contained piece of content.

**Affected:** All pages under `g:\code\splits.network\apps\portal\src\app\public\documentation\`

---

### Finding 9.3: Heading Hierarchy Is Generally Good

**Positive finding.** Documentation pages follow a clean h1 > h2 hierarchy. Content pages use h1 for the page title and h2/h3 for sections. No significant heading skip issues were found.

---

## Category 10: Job Posting Optimization (Candidate App)

### Finding 10.1: Job List Page Has Good JSON-LD, Detail Pages Do Not

**Severity:** HIGH
**File:** `g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx` (lines 110-137)

The jobs list page generates `ItemList` JSON-LD with `JobPosting` items, which is excellent. However:
- Individual job detail pages (`g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx`) have no `JobPosting` JSON-LD
- The list page ItemList only includes the first 20 jobs
- Job URLs reference `/public/jobs-new/` (line 114) but the actual route is `/public/jobs/`

**Recommendation:**
1. Add full `JobPosting` JSON-LD to `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx` with all available fields
2. Fix the URL mismatch from `jobs-new` to `jobs`
3. The existing job detail page already server-renders with `revalidate` -- this is excellent for AI crawlers

---

## Priority Matrix

| Priority | Finding | Impact | Effort |
|----------|---------|--------|--------|
| P0 | 1.2 - Remove `opacity-0` from SSR HTML | Critical | Low |
| P0 | 2.1 - Add `FAQPage` JSON-LD to all FAQ sections | Critical | Medium |
| P0 | 7.2 - FAQ answers hidden in `height:0; opacity:0` containers | Critical | Medium |
| P0 | 7.4 - Metrics show "0" values to crawlers | High | Low |
| P1 | 2.2 - Add `BreadcrumbList` JSON-LD to documentation | High | Low |
| P1 | 2.3 - Add `HowTo` JSON-LD to how-it-works pages | High | Low |
| P1 | 7.1 - Add direct-answer opening paragraphs | High | Medium |
| P1 | 10.1 - Add `JobPosting` JSON-LD to job detail pages | High | Medium |
| P1 | 2.6 - Fix fabricated rating, broken SearchAction, missing job schema | High | Low |
| P2 | 1.1 - Refactor content to server components where possible | Medium | High |
| P2 | 2.4 - Add `TechArticle` JSON-LD to documentation pages | Medium | Medium |
| P2 | 3.1 - Add explicit AI crawler rules to robots.txt | Medium | Low |
| P2 | 5.1 - Expand llms.txt with descriptions and topic summaries | Medium | Low |
| P2 | 6.1 - Add consistent OG metadata to all public pages | Medium | Medium |
| P3 | 2.5 - Add `DefinedTerm` schema for glossary content | Medium | Medium |
| P3 | 4.2 - Differentiate sitemap priorities by content type | Low | Low |
| P3 | 4.3 - Remove feed URLs from candidate sitemap | Low | Low |
| P3 | 6.2 - Add canonical URLs to all pages | Low | Low |
| P3 | 8.1 - Create glossary page | Medium | Medium |
| P3 | 8.2 - Create comparison page | Low | Medium |
| P3 | 9.2 - Use `<article>` on documentation pages | Low | Low |

---

## Summary of Key Files Referenced

### Portal App (splits.network)
- `g:\code\splits.network\apps\portal\src\app\layout.tsx` -- Root layout with WebApplication JSON-LD
- `g:\code\splits.network\apps\portal\src\app\page.tsx` -- Landing page with WebPage JSON-LD
- `g:\code\splits.network\apps\portal\src\app\robots.ts` -- Robots configuration
- `g:\code\splits.network\apps\portal\src\app\sitemap.ts` -- Sitemap with 58 routes
- `g:\code\splits.network\apps\portal\src\app\public\layout.tsx` -- Public layout wrapper
- `g:\code\splits.network\apps\portal\src\app\public\features\features-content.tsx` -- Client-rendered features
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx` -- Client-rendered how-it-works
- `g:\code\splits.network\apps\portal\src\app\public\pricing\pricing-content.tsx` -- Client-rendered pricing with FAQ
- `g:\code\splits.network\apps\portal\src\app\public\documentation\layout.tsx` -- Documentation layout with CollectionPage JSON-LD
- `g:\code\splits.network\apps\portal\src\app\public\documentation\page.tsx` -- Documentation index with CollectionPage JSON-LD
- `g:\code\splits.network\apps\portal\src\app\public\documentation\components\doc-page-header.tsx` -- Breadcrumb component (visual only)
- `g:\code\splits.network\apps\portal\src\app\public\documentation\getting-started\what-is-splits-network\page.tsx` -- Example doc page
- `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx` -- Landing FAQ (no schema)
- `g:\code\splits.network\apps\portal\public\llms.txt` -- LLM discovery file
- `g:\code\splits.network\apps\portal\public\.well-known\llms.txt` -- LLM discovery file (duplicate)

### Candidate App (applicant.network)
- `g:\code\splits.network\apps\candidate\src\app\layout.tsx` -- Root layout with WebApplication + WebSite JSON-LD
- `g:\code\splits.network\apps\candidate\src\app\page.tsx` -- Landing page with WebPage JSON-LD
- `g:\code\splits.network\apps\candidate\src\app\robots.ts` -- Robots configuration
- `g:\code\splits.network\apps\candidate\src\app\sitemap.ts` -- Sitemap with 35 routes
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx` -- Server-rendered jobs with ItemList/JobPosting JSON-LD
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx` -- Server-rendered job detail (missing JSON-LD)
- `g:\code\splits.network\apps\candidate\src\app\public\resources\resume-tips\resume-tips-content.tsx` -- Client-rendered resource
- `g:\code\splits.network\apps\candidate\src\app\public\resources\interview-prep\interview-prep-content.tsx` -- Client-rendered resource
- `g:\code\splits.network\apps\candidate\src\components\landing\sections\faq-section.tsx` -- Landing FAQ (no schema)
- `g:\code\splits.network\apps\candidate\public\llms.txt` -- LLM discovery file

### Corporate App (employment-networks.com)
- `g:\code\splits.network\apps\corporate\src\app\layout.tsx` -- Root layout with Organization + SoftwareApplication + WebSite JSON-LD
- `g:\code\splits.network\apps\corporate\src\app\page.tsx` -- Landing page with WebPage JSON-LD
- `g:\code\splits.network\apps\corporate\src\app\robots.ts` -- Robots configuration
- `g:\code\splits.network\apps\corporate\src\app\sitemap.ts` -- Sitemap with 5 routes
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\faq-section.tsx` -- FAQ section (no schema, client-rendered, hidden answers)
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\hero-section.tsx` -- Hero with `opacity-0` content
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\metrics-section.tsx` -- Metrics with "0" initial values
- `g:\code\splits.network\apps\corporate\public\llms.txt` -- LLM discovery file

### Shared
- `g:\code\splits.network\packages\shared-ui\src\seo\json-ld.tsx` -- Safe JSON-LD serialization component (well-implemented)

---

## Conclusion

The platform has a solid technical foundation with Next.js App Router, proper metadata exports, existing JSON-LD on key pages, and `llms.txt` files deployed. The primary gaps are:

1. **Content visibility** -- GSAP animations hide content from crawlers via `opacity-0` and `height: 0` inline styles
2. **Structured data coverage** -- FAQ, HowTo, BreadcrumbList, and TechArticle schemas are entirely missing despite perfect content for them
3. **Content strategy** -- Pages open with marketing taglines rather than direct answers to the questions AI users ask

Addressing the P0 and P1 items would have the most immediate impact on AI discoverability and citation rates. The P0 items (removing opacity-0, adding FAQPage schema, fixing hidden FAQ answers, fixing metric values) are relatively low-effort changes with outsized returns.
