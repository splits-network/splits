# /aio:fix — Fix AI Optimization Issues

Spawn the `aio` agent to fix AIO issues identified during audit.

## Usage

```
/aio:fix portal                                        # Fix all AIO issues in portal app
/aio:fix apps/portal/src/app/how-it-works/page.tsx  # Fix specific page
/aio:fix robots all                                     # Fix AI crawler rules across all apps
/aio:fix content portal                                 # Fix content structure issues
/aio:fix schema portal                                  # Fix structured data issues
```

## Fix Categories

### Architecture Fixes (Critical)

**Client-rendered content → Server-first rendering**

The exact same fix as SEO — move data fetching to server, render content in RSC, use client components only for interactivity. See `/seo:fix` for the refactoring pattern.

Key difference: AIO cares specifically about **text content** being in the HTML. Even if layout/styling is client-side, the actual words and data must be server-rendered.

### AI Crawler Access Fixes

**Missing AI crawler rules → Update robots.ts**

```typescript
// apps/*/src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api", "/api/*", "/portal", "/portal/*"],
            },
            // Explicitly allow AI crawlers
            { userAgent: "GPTBot", allow: "/" },
            { userAgent: "ClaudeBot", allow: "/" },
            { userAgent: "PerplexityBot", allow: "/" },
            { userAgent: "Google-Extended", allow: "/" },
            { userAgent: "anthropic-ai", allow: "/" },
            { userAgent: "Bytespider", allow: "/" },
        ],
        sitemap: "https://domain.com/sitemap.xml",
    };
}
```

**Missing llms.txt → Create llms.txt**

Create `apps/{app}/llms.txt` with a concise site description, key pages, and core concepts. Follow the emerging llms.txt standard format.

### Content Structure Fixes (High)

**Weak opening paragraph → Direct answer rewrite**

Before:

```tsx
<p>
    Welcome to Splits Network. We're excited to help you discover a new way to
    recruit.
</p>
```

After:

```tsx
<p>
    Splits Network is a split-fee recruiting marketplace where recruiters share
    placement fees. Companies post roles once, specialized recruiters engage
    based on expertise, and candidates get matched with advocates. The platform
    tracks every interaction and distributes payments on verified outcomes.
</p>
```

**Generic headings → Question-format headings**

Before:

```tsx
<h2>Our Process</h2>
<h2>Pricing</h2>
<h2>About</h2>
```

After:

```tsx
<h2>How Does Split-Fee Recruiting Work?</h2>
<h2>How Much Does Splits Network Cost?</h2>
<h2>What Is Splits Network?</h2>
```

**Prose-buried data → Structured format**

Before:

```tsx
<p>
    Our Starter plan costs $49 per month and includes 10 roles for 2 users. If
    you need more, our Professional plan is $149 per month with 50 roles and up
    to 10 users.
</p>
```

After:

```tsx
<table>
    <thead>
        <tr>
            <th scope="col">Plan</th>
            <th scope="col">Price</th>
            <th scope="col">Roles</th>
            <th scope="col">Users</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Starter</td>
            <td>$49/mo</td>
            <td>10</td>
            <td>2</td>
        </tr>
        <tr>
            <td>Professional</td>
            <td>$149/mo</td>
            <td>50</td>
            <td>10</td>
        </tr>
    </tbody>
</table>
```

### Structured Data Fixes (High)

**FAQ without schema → Add FAQPage JSON-LD**

```tsx
import { JsonLd } from "@splits-network/shared-ui";

<JsonLd
    data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    }}
/>;
```

**How-to without schema → Add HowTo JSON-LD**

```tsx
<JsonLd
    data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Post a Role on Splits Network",
        step: steps.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: step.title,
            text: step.description,
        })),
    }}
/>
```

**Documentation without schema → Add TechArticle JSON-LD**

```tsx
<JsonLd
    data={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: doc.title,
        description: doc.summary,
        datePublished: doc.createdAt,
        dateModified: doc.updatedAt,
    }}
/>
```

### Semantic HTML Fixes (Medium)

**Div soup → Semantic elements**

- Wrap main content in `<main>`
- Use `<article>` for self-contained content
- Use `<section>` with headings for thematic groups
- Use `<nav>` for navigation
- Use `<time datetime="...">` for dates
- Use `<ul>/<ol>` for lists (not styled divs)

## Fix Process

1. **Read the audit report** (or run `/aio:audit` first)
2. **Prioritize**: Architecture > AI Crawler Access > Content Structure > Schema > Semantic HTML
3. **Fix each issue** with patterns above
4. **Verify**: Check that content appears in server-rendered HTML
5. **Re-audit**: Run `/aio:audit` to confirm improvement

## Rules

- NEVER modify authenticated pages for AIO purposes
- NEVER break existing functionality while fixing AIO issues
- ALWAYS use `<JsonLd>` component from `@splits-network/shared-ui`
- ALWAYS preserve existing content when restructuring
- When rewriting opening paragraphs, keep factual accuracy — improve structure, not meaning
- The `basel-copy` agent owns editorial voice — AIO agent fixes structure, not tone
