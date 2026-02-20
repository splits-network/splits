# /aio:audit — Audit App for AI Optimization

Spawn the `aio` agent to perform an AI optimization audit.

## Usage

```
/aio:audit portal     # Audit the portal app
/aio:audit candidate  # Audit the candidate app
/aio:audit corporate  # Audit the corporate app
/aio:audit all        # Audit all three apps
```

## Audit Process

### Phase 1: Content Visibility (Critical)

AI crawlers cannot execute JavaScript. If content isn't in the initial HTML, it doesn't exist to AI.

1. **Server-rendering check**
    - Scan all public `page.tsx` files for `"use client"` (should be 0)
    - Identify pages that wrap a client component doing all the rendering
    - Flag `useEffect`, `useSWR`, `useQuery` fetching primary content in public trees
    - Verify important text content is in server-rendered components

2. **Content blocking check**
    - Cookie consent banners that block content before acceptance
    - Login/signup interstitials on public pages
    - Loading spinners as the default state (AI sees the spinner, not content)

3. **AI crawler access**
    - Check `robots.ts` for AI bot rules (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
    - Flag if AI crawlers are not explicitly allowed
    - Check for `llms.txt` at domain root

### Phase 2: Content Structure (High)

4. **First-paragraph quality**
    - For each public page, read the opening paragraph
    - Does it directly answer what the page is about?
    - Or is it generic/vague ("Welcome to..." / "We're excited...")?

5. **Heading analysis**
    - Are headings in question format matching natural queries?
    - "How Does Split-Fee Recruiting Work?" vs "Our Process"
    - Do headings follow logical h1 → h2 → h3 hierarchy?

6. **Structured content**
    - Are lists/tables used for structured info? (not buried in prose)
    - Are pricing/feature comparisons in `<table>` format?
    - Are step-by-step processes in ordered lists?

7. **Schema.org structured data**
    - FAQ sections → `FAQPage` schema
    - How-to content → `HowTo` schema
    - Documentation → `TechArticle` schema
    - Job listings → `JobPosting` schema
    - Blog/press → `Article` schema

### Phase 3: Content Quality (Medium)

8. **Specificity check**
    - Are statistics contextual (what + why, not just numbers)?
    - Are claims backed with specific data?
    - Are domain terms explicitly defined?

9. **Topical focus**
    - Does each page have one clear primary topic?
    - Are related topics linked rather than crammed onto one page?

10. **Content uniqueness**
    - Are Memphis/Basel variants canonical-tagged correctly?
    - Is there duplicate content across pages?
    - Is content substantive (not thin placeholder text)?

### Phase 4: Citation Potential (Low)

11. **High-value content assessment**
    - Does the site have content that answers common industry questions?
    - Are there how-to guides, glossary pages, data/benchmark pages?
    - Could an AI answer engine quote this content in a response?

## Output

Generate an audit report with:

- **Score**: X/100
- **Issues grouped by severity**: Critical → High → Medium → Low
- **Specific file paths** for each issue
- **What AI systems see** vs what humans see (for architecture issues)
- **Recommended fix** with code patterns
- **High-value content opportunities** (content that could be added for AI citation)

## Priority Pages

Focus the audit on pages most likely to be cited by AI:

### Must Audit

- Documentation pages (`/documentation/**`)
- How it works pages (`/how-it-works`)
- Features pages (`/features`)
- Pricing pages (`/pricing`)
- FAQ sections on any page
- Resource pages (`/resources/**`)

### Should Audit

- About pages
- For-recruiters / For-companies pages
- Blog/press articles
- Marketplace/job listings (candidate app)

### Skip

- Authenticated pages (`/portal/**`)
- Admin pages
- Settings pages
- Showcase pages (internal design reference)
