# /seo:audit — Audit App for SEO Compliance

Spawn the `seo` agent to perform a comprehensive SEO audit.

## Usage

```
/seo:audit portal     # Audit the portal app
/seo:audit candidate  # Audit the candidate app
/seo:audit corporate  # Audit the corporate app
/seo:audit all        # Audit all three apps
```

## Audit Process

### Phase 1: Rendering Architecture (Critical)

This is the most important phase. Perfect metadata means nothing if content is client-rendered.

1. **Scan for client-page anti-pattern**
   - Check all public `page.tsx` files for `"use client"` directive
   - Check if any public `page.tsx` is just a wrapper importing a client component
   - Flag pages where the server component does no data fetching

2. **Verify content is in initial HTML**
   - For each public page, check that primary content is rendered in server components
   - Flag any `useEffect`, `useSWR`, `useQuery`, `useFetch` in public page trees
   - Identify client components that fetch and render primary content

3. **Classify client components**
   - OK: Filters, sorting, view toggles, modals, form interactions
   - NOT OK: Data fetching, content rendering, list/table population

### Phase 2: Metadata Coverage (High)

4. **Scan for metadata exports**
   - Every public `page.tsx` must have `export const metadata` or `export async function generateMetadata`
   - Check title length (< 60 chars)
   - Check description length (150-160 chars)
   - Verify no duplicate titles across pages

5. **OpenGraph/Social**
   - Check for `openGraph` in metadata (title, description, url minimum)
   - Check for OG images on key pages (homepage, features, pricing)
   - Check Twitter card metadata

6. **Canonical URLs**
   - Verify canonical URLs set (especially for pages with Memphis/Basel variants)

### Phase 3: Indexing Infrastructure (High)

7. **Sitemap coverage**
   - Cross-reference all public routes with sitemap entries
   - Flag public pages missing from sitemap
   - Verify priority and changeFrequency values are sensible

8. **robots.txt**
   - Verify public routes are allowed
   - Verify authenticated routes are disallowed
   - Check for AI crawler rules (GPTBot, ClaudeBot, PerplexityBot)

### Phase 4: On-Page SEO (Medium)

9. **Heading hierarchy**
   - One `<h1>` per page
   - No skipped heading levels (h1 → h3 without h2)
   - Meaningful heading text (not "Section 1")

10. **Structured data**
    - JSON-LD on entity/content pages
    - Using `<JsonLd>` component (not `dangerouslySetInnerHTML`)
    - Correct schema types for page content

11. **Images**
    - All `<img>` have alt text (descriptive for content, empty for decorative)
    - No missing alt attributes entirely

12. **Internal linking**
    - Descriptive anchor text (not "click here" or "read more")
    - Links use `<a href>` not `<button>` with JS navigation

## Output

Generate an audit report with:
- **Score**: X/100
- **Issues grouped by severity**: Critical → High → Medium → Low
- **Specific file paths and line numbers** for each issue
- **Recommended fix** for each issue
- **Passing checks** at the bottom

## App-Specific Rules

### Corporate (`apps/corporate/`)
- ALL pages must be 100% server-rendered
- Every page must have metadata
- Rich JSON-LD expected on all content pages

### Portal (`apps/portal/`)
- `/public/*` routes: Full SEO treatment, server-rendered
- `/portal/*` routes: Skip (behind auth, not indexed)
- Memphis/Basel variants: Ensure canonical set to active version

### Candidate (`apps/candidate/`)
- `/public/*` routes: Full SEO treatment, server-rendered
- `/portal/*` routes: Skip (behind auth)
- Job listing pages: `JobPosting` schema required
