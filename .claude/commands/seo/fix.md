# /seo:fix — Fix SEO Issues

Spawn the `seo` agent to fix SEO issues identified during audit.

## Usage

```
/seo:fix portal                           # Fix all SEO issues in portal app
/seo:fix apps/portal/src/app/public/pricing/page.tsx  # Fix specific page
/seo:fix metadata portal                  # Fix only metadata issues
/seo:fix architecture portal              # Fix only architecture issues
/seo:fix sitemap portal                   # Fix sitemap coverage
/seo:fix robots all                       # Fix robots.txt across all apps
```

## Fix Categories

### Architecture Fixes (Critical)

**Client-page anti-pattern → Server-first refactor**

Before:
```tsx
// page.tsx — BAD: just a wrapper
import { PricingClient } from './pricing-client';
export default function PricingPage() {
    return <PricingClient />;
}
```

After:
```tsx
// page.tsx — GOOD: server fetches, renders, then enhances
import type { Metadata } from "next";
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
    title: "Pricing",
    description: "Transparent pricing for Splits Network recruiting platform.",
};

export default async function PricingPage() {
    const plans = await fetchPlans();
    return (
        <main>
            <h1>Pricing</h1>
            <PricingTable plans={plans} />        {/* Server-rendered content */}
            <PricingClient plans={plans} />       {/* Client: toggle annual/monthly, FAQ accordion */}
        </main>
    );
}
```

**Client data fetching → Server fetch with props**

Before:
```tsx
// 'use client' component fetching primary data
const { data: jobs } = useSWR('/api/jobs');
```

After:
```tsx
// Server component fetches, passes to client
export default async function JobsPage() {
    const jobs = await fetchJobs();
    return <JobsList initialJobs={jobs} />;
}
```

### Metadata Fixes (High)

**Missing metadata → Add metadata export**
```tsx
export const metadata: Metadata = {
    title: "Page Title",
    description: "150-160 char description.",
    openGraph: {
        title: "Page Title — Brand Name",
        description: "Description for social sharing.",
    },
};
```

**Missing canonical → Add alternates**
```tsx
export const metadata: Metadata = {
    alternates: {
        canonical: "https://domain.com/canonical-path",
    },
};
```

### Sitemap Fixes

**Missing routes → Add to sitemap.ts**
- Add new routes to the appropriate routes array
- Set correct `changeFrequency` and `priority`

### robots.txt Fixes

**Missing AI crawler rules → Add explicit allows**
```typescript
rules: [
    { userAgent: '*', allow: '/', disallow: [...] },
    { userAgent: 'GPTBot', allow: '/' },
    { userAgent: 'ClaudeBot', allow: '/' },
    { userAgent: 'PerplexityBot', allow: '/' },
    { userAgent: 'Google-Extended', allow: '/' },
],
```

### On-Page Fixes

**Heading hierarchy → Restructure headings**
- Ensure one `<h1>` per page
- Fix skipped levels (h1 → h3 → insert h2)

**Missing alt text → Add descriptive alt**
- Content images: descriptive alt text
- Decorative images: `alt=""`

**Missing JSON-LD → Add structured data**
```tsx
import { JsonLd } from "@splits-network/shared-ui";
<JsonLd data={{ "@context": "https://schema.org", "@type": "...", ... }} />
```

## Fix Process

1. **Read the audit report** (or run `/seo:audit` first if no report exists)
2. **Prioritize fixes**: Architecture > Metadata > Indexing > On-Page
3. **Fix each issue** with the appropriate pattern above
4. **Verify the fix** — ensure no regressions
5. **Re-audit** — run `/seo:audit` to confirm score improvement

## Rules

- NEVER modify authenticated pages (`/portal/*`) for SEO purposes
- NEVER break existing functionality while fixing SEO
- ALWAYS use `<JsonLd>` component (never raw `dangerouslySetInnerHTML`)
- ALWAYS preserve existing metadata when adding missing fields
- When refactoring client-page to server-first, ensure all client interactivity still works
