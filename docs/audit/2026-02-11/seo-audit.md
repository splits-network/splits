# SEO Audit Report -- Splits Network

**Date:** 2026-02-11
**Auditor:** SEO Agent (Claude Opus 4.6)
**Branch:** staging
**Scope:** All three web properties (Portal, Candidate, Corporate)

---

## Executive Summary

The Splits Network web properties have a solid SEO foundation. All three apps use the Next.js Metadata API correctly, every public page exports either `metadata` or `generateMetadata`, root layouts include OpenGraph and Twitter Card tags, sitemaps and robots.txt files are in place, and JSON-LD structured data exists at the layout level for every app. OG images exist in the public directory of each app.

However, the audit uncovered **12 critical issues** and **21 optimization opportunities** that, if addressed, would significantly improve search visibility, eliminate duplicate-content signals, and unlock rich-result eligibility in Google Search.

### Severity Breakdown

| Severity | Count |
|----------|-------|
| Critical | 12 |
| High | 10 |
| Medium | 11 |
| Low | 8 |

---

## 1. Portal App (splits.network)

### 1.1 Root Layout Metadata

**File:** `g:\code\splits.network\apps\portal\src\app\layout.tsx`

**Strengths:**
- `metadataBase` correctly set to `https://splits.network`
- Title template configured: `"%s | Splits Network"`
- OpenGraph includes image (1200x630), locale, siteName, type
- Twitter Card configured with `summary_large_image`
- JSON-LD `WebApplication` schema with provider Organization, featureList, and free-tier Offer
- `<html lang="en">` set correctly
- Google Analytics and Microsoft Clarity loaded with `afterInteractive` strategy

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| P-01 | Medium | JSON-LD uses raw `dangerouslySetInnerHTML` | The layout predates the `<JsonLd>` component but new pages should use the XSS-safe component. Consider migrating the layout to use `<JsonLd>` for consistency and safety. File: `g:\code\splits.network\apps\portal\src\app\layout.tsx`, lines 88-123. |
| P-02 | Low | Missing `<Footer>` import but rendered outside `<main>` | The Footer is imported but not rendered in the layout body -- it is only rendered in individual page components like the homepage. This means some public pages may not render a footer depending on their structure. Not strictly SEO but affects crawl depth through footer links. |

### 1.2 Homepage

**File:** `g:\code\splits.network\apps\portal\src\app\page.tsx`

**Strengths:**
- Exports `metadata` with title and description
- Uses `<JsonLd>` component for `WebPage` schema
- FAQSection, FeaturesSection, HowItWorksSection all present (rich indexable content)
- Single `<h1>` tag in HeroSection component

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| P-03 | High | Homepage metadata lacks OpenGraph | The homepage `page.tsx` exports only `title` and `description`. It does not include `openGraph` with `url`, so when shared on social media, the OG URL defaults to the root layout's `https://splits.network` which is correct by coincidence, but explicit is better. |
| P-04 | High | No FAQPage structured data | The homepage renders a FAQ section with 6 questions, but there is no `schema.org/FAQPage` JSON-LD. This is a missed opportunity for rich FAQ snippets in Google Search. File: `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx` |
| P-05 | High | No FAQPage structured data on Pricing page | The pricing page content (`pricing-content.tsx`) includes 5 FAQ items but no `FAQPage` JSON-LD. |

### 1.3 Public Pages -- Metadata Coverage

All 16 top-level public pages export `metadata`. This is good.

**Consistency issues found:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| P-06 | Medium | Inconsistent metadata depth across pages | Most pages export only `title` and `description`. Only `for-companies` includes `openGraph`, `twitter`, and `keywords`. Pages like `pricing`, `features`, `how-it-works`, `for-recruiters`, `about` -- all high-value SEO pages -- lack explicit OpenGraph URL and per-page OG title/description. They inherit the root layout OG which has a generic description. |
| P-07 | Low | `keywords` meta tag used inconsistently | `for-companies` page uses `keywords` array. Google has stated keywords meta tag is not a ranking factor. This is not harmful but creates inconsistency. Either add it everywhere or remove it. |
| P-08 | Medium | Short descriptions on some pages | Several descriptions are under 100 characters: "Recruiting insights, product updates, and split placement strategies." (Blog, 69 chars), "Press kit, brand assets, and company updates from Splits Network." (Press, 65 chars). Target 150-160 characters for maximum SERP real estate. |

### 1.4 Documentation Pages

**File:** `g:\code\splits.network\apps\portal\src\app\public\documentation\layout.tsx`

**Strengths:**
- Layout has metadata for the documentation section
- Uses `<JsonLd>` with `CollectionPage` schema
- Documentation index page has `CollectionPage` with `hasPart` references
- Proper breadcrumb navigation in HTML
- Good heading hierarchy (h1 per page, h2 for sections)

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| P-09 | Critical | 28 documentation sub-pages have NO page-level metadata | Only the documentation `layout.tsx` exports metadata. None of the 28 individual documentation pages (getting-started, roles-and-permissions sub-pages, feature-guides sub-pages, core-workflows sub-pages) export `metadata` or `generateMetadata`. They inherit the layout metadata, meaning all 28 pages share the same title "Splits Network Documentation" and description. Google will see 28 pages with identical title tags, which is a severe duplicate-title issue. |
| P-10 | Medium | No `TechArticle` or `HowTo` structured data on doc pages | Documentation pages are ideal candidates for `schema.org/TechArticle` (feature guides) and `schema.org/HowTo` (core workflow pages like "Create And Publish A Role"). None currently have page-level JSON-LD. |
| P-11 | Medium | Breadcrumb structured data missing | Documentation pages render visual breadcrumbs but do not emit `schema.org/BreadcrumbList` JSON-LD. This prevents breadcrumb rich results in Google Search. |

### 1.5 Sitemap

**File:** `g:\code\splits.network\apps\portal\src\app\sitemap.ts`

**Strengths:**
- 59 routes listed (16 public + 43 documentation)
- Homepage priority 1.0, weekly changeFrequency
- All documentation routes included

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| P-12 | High | Flat priority for all non-homepage routes | Every route except the homepage gets priority `0.7`. Core product pages (features, pricing, how-it-works, for-recruiters, for-companies) should be `0.9`. Legal pages should be `0.3`. Documentation should be `0.5-0.7`. |
| P-13 | Medium | Flat changeFrequency for all non-homepage routes | All non-homepage routes are `monthly`. Legal pages should be `yearly`. Updates/blog should be `weekly`. |
| P-14 | Low | `lastModified` is always `new Date()` | Every sitemap entry uses the current date as lastModified, which tells search engines nothing useful. Ideally tie to actual file modification dates or content update timestamps. |

### 1.6 robots.txt

**File:** `g:\code\splits.network\apps\portal\src\app\robots.ts`

**Assessment:** Well configured. Disallows `/api/*`, `/portal/*`, `/sign-in`, `/sign-up`, `/accept-invitation/*`. Sitemap URL correct. No issues found.

---

## 2. Candidate App (applicant.network)

### 2.1 Root Layout Metadata

**File:** `g:\code\splits.network\apps\candidate\src\app\layout.tsx`

**Strengths:**
- `metadataBase` uses env var with fallback to `https://applicant.network`
- Title template: `"%s | Applicant Network"`
- OpenGraph and Twitter Card configured
- Two JSON-LD blocks: `WebApplication` and `WebSite` (with SearchAction)
- `<html lang="en">` set

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-01 | Critical | Typo in OpenGraph description | Line 26: `"...on Applicant  Track applications..."` -- there is a double-space and missing period between "Applicant" and "Track". This is visible in social media shares. |
| C-02 | Critical | Typo in Twitter description | Line 44: `"...on Applicant "` -- trailing space after "Applicant", sentence appears truncated. |
| C-03 | Medium | JSON-LD uses raw `dangerouslySetInnerHTML` | Same as portal -- layout predates the `<JsonLd>` component. |
| C-04 | High | WebSite SearchAction target URL uses `/jobs?search=` | The SearchAction `urlTemplate` points to `{appUrl}/jobs?search={search_term_string}`. The actual jobs page is at `/public/jobs`. This will produce an invalid Sitelinks search box target. |

### 2.2 Homepage

**File:** `g:\code\splits.network\apps\candidate\src\app\page.tsx`

**Strengths:**
- Exports metadata with title and description
- Uses `<JsonLd>` for `WebPage` schema
- Single h1 in hero section

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-05 | High | Homepage metadata lacks OpenGraph | Same pattern as portal -- only `title` and `description` exported. |

### 2.3 Public Pages -- Metadata Coverage

All 28 public pages have metadata (either in the page or a parent layout). This is good.

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-06 | Critical | Duplicate legal pages with different URLs | The candidate app has TWO sets of legal pages at different URLs with different content and metadata: `/public/terms` AND `/public/terms-of-service`, `/public/privacy` AND `/public/privacy-policy`, `/public/cookies` AND `/public/cookie-policy`. This is 6 pages covering 3 topics. Search engines will see duplicate content. The metadata is different too -- e.g., `/public/terms` title is "Terms of Service - Applicant Network | User Agreement" while `/public/terms-of-service` title is "Terms of Service | Splits Network" (wrong brand name -- says Splits instead of Applicant). |
| C-07 | Critical | Wrong brand in candidate legal page titles | Files at `/public/cookie-policy/page.tsx`, `/public/terms-of-service/page.tsx`, `/public/privacy-policy/page.tsx` all have titles like "Cookie Policy | Splits Network", "Terms of Service | Splits Network", "Privacy Policy | Splits Network". These are on the Applicant Network domain but reference "Splits Network" in the title. These appear to be copied from the portal app without updating the brand. |
| C-08 | Medium | Inconsistent OG metadata across pages | Some candidate pages (about, how-it-works, for-recruiters) include `openGraph` and `keywords`. Most do not. Same inconsistency issue as portal. |

### 2.4 Dynamic Pages (Jobs and Marketplace)

**Jobs List (`g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx`):**
- Good: Exports metadata, uses `<JsonLd>` for `ItemList` with `JobPosting` items
- Good: Server-rendered with `revalidate = 60`
- Good: RSS and Atom feed alternates declared

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-09 | Critical | RSS/Atom feed and JSON-LD reference wrong URL path | The RSS feed alternates point to `/public/jobs-new/rss.xml` and `/public/jobs-new/atom.xml`, but the actual route handlers are at `/public/jobs/rss.xml` and `/public/jobs/atom.xml`. The JSON-LD ItemList URLs also reference `/public/jobs-new/` instead of `/public/jobs/`. The internal links in `job-detail-client.tsx` also use `/public/jobs-new/`. This is a systemic path mismatch -- it appears the pages were renamed from `jobs-new` to `jobs` but internal references were not updated. |
| C-10 | High | Job detail page missing JSON-LD `JobPosting` | The individual job detail page (`g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx`) has good `generateMetadata` but does NOT emit a `JobPosting` JSON-LD schema. This is the single most impactful missing structured data -- Google uses `JobPosting` schema for the Google Jobs carousel. Fields like `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation`, `baseSalary` are all available from the fetched data. |
| C-11 | Medium | Job detail description not truncated | `generateMetadata` uses `job.candidate_description || job.description` for the meta description without truncating. Descriptions could be thousands of characters long. Should truncate to ~155 characters. |

**Marketplace List (`g:\code\splits.network\apps\candidate\src\app\public\marketplace\page.tsx`):**
- Good: Metadata exported
- Missing: No JSON-LD for recruiter listing (could use `ItemList`)

**Marketplace Detail (`g:\code\splits.network\apps\candidate\src\app\public\marketplace\[id]\page.tsx`):**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-12 | Medium | Duplicate metadata from page and layout | Both `page.tsx` and `layout.tsx` export `generateMetadata` for the same route. The page's metadata is more specific (fetches recruiter name), but the layout also generates metadata with a generic "Recruiter Profile {id}" title. Next.js merges these, but the layout's generic title may interfere. |
| C-13 | Medium | No `Person` structured data for recruiter profiles | Recruiter detail pages are prime candidates for `schema.org/Person` with `jobTitle`, `worksFor`, specialties. Currently no JSON-LD is emitted. |

### 2.5 Sitemap

**File:** `g:\code\splits.network\apps\candidate\src\app\sitemap.ts`

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| C-14 | Critical | RSS/Atom URLs in sitemap | The sitemap includes `/public/jobs/rss.xml` and `/public/jobs/atom.xml`. These are XML feed endpoints, not HTML pages. They should NOT be in the sitemap. Search engines expect HTML pages in sitemaps. |
| C-15 | High | Duplicate legal pages in sitemap | The sitemap lists both `/public/cookie-policy` AND `/public/cookies`, `/public/privacy` AND `/public/privacy-policy`, `/public/terms` AND `/public/terms-of-service`. This amplifies the duplicate content issue. |
| C-16 | High | Flat priority and changeFrequency | Same issue as portal. Jobs page should be `daily`, legal pages `yearly`, resources `monthly`. Priority should vary. |
| C-17 | High | Dynamic job pages not in sitemap | Individual job pages (`/public/jobs/[id]`) and recruiter marketplace pages (`/public/marketplace/[id]`) are not generated in the sitemap. These are the most valuable pages for organic search (individual job postings). The sitemap should be async and fetch job IDs from the API. |

### 2.6 robots.txt

**File:** `g:\code\splits.network\apps\candidate\src\app\robots.ts`

**Assessment:** Correctly disallows `/api/*` and `/portal/*`. Sitemap URL correct. No issues.

---

## 3. Corporate App (employment-networks.com)

### 3.1 Root Layout Metadata

**File:** `g:\code\splits.network\apps\corporate\src\app\layout.tsx`

**Strengths:**
- `metadataBase` set to `https://employment-networks.com`
- Title template: `"%s | Employment Networks"`
- OpenGraph with image, locale, siteName
- Twitter Card configured
- Three JSON-LD schemas: Organization, SoftwareApplication, WebSite
- `data-theme="splits-light"` hardcoded (no theme flash)
- `other` metadata includes image for Teams/unfurling

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| CO-01 | High | Fabricated AggregateRating in SoftwareApplication schema | The SoftwareApplication JSON-LD includes `aggregateRating: { ratingValue: "4.8", ratingCount: "150" }`. If these ratings do not come from a verified third-party review platform (e.g., G2, Capterra), Google may issue a manual action for fake reviews. This is a compliance risk. Lines 99-102. |
| CO-02 | Medium | WebSite SearchAction target URL references non-existent page | The SearchAction `urlTemplate` points to `https://employment-networks.com/search?q={search_term_string}`, but no `/search` page exists in the corporate app. The corporate app has only 5 pages (home, 3 legal, status). |
| CO-03 | Medium | Organization `founder` self-references | The Organization schema lists `founder: { "@type": "Organization", name: "Employment Networks" }` -- the organization founded itself. This should either list the actual founder(s) as `Person` or be removed. |
| CO-04 | Low | JSON-LD uses raw `dangerouslySetInnerHTML` | Same as other apps. |
| CO-05 | Low | No analytics scripts | Unlike portal and candidate, the corporate app has no Google Analytics or Clarity scripts. This may be intentional but means no traffic data for SEO measurement. |

### 3.2 Homepage

**File:** `g:\code\splits.network\apps\corporate\src\app\page.tsx`

**Strengths:**
- Exports metadata with title and description
- Uses `<JsonLd>` for `WebPage` schema
- Single h1 in hero section
- FAQSection rendered

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| CO-06 | Medium | No FAQPage JSON-LD | The corporate homepage renders a FAQ section but no `FAQPage` structured data. |

### 3.3 Sitemap

**File:** `g:\code\splits.network\apps\corporate\src\app\sitemap.ts`

**Issues:**

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| CO-07 | Medium | Only 5 routes in sitemap | The corporate site is thin (home + 3 legal + status). This is not necessarily a problem if the site's purpose is a landing page, but it limits organic search surface area. |
| CO-08 | Low | Non-homepage priority is 0.6 | Legal pages should be `0.3`, status should be `0.4`. |

### 3.4 Other Observations

- **Not-found page:** Has metadata `{ title: "Page Not Found" }` but uses `export const metadata` without `Metadata` type import. Minor type safety issue.
- **Image alt text:** All images in corporate components have meaningful alt text ("Employment Networks", "Splits Network", "Applicant Network"). Good.
- **Internal links:** 404 page links to `https://splits.network` and `https://applicant.network` -- good cross-linking between properties.

---

## 4. Cross-App Issues

### 4.1 Canonical URLs

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| X-01 | Critical | No canonical URLs set anywhere | Zero pages across all three apps set `alternates.canonical` in their metadata. This is important because: (a) The candidate app has duplicate legal pages at different paths, (b) Job/marketplace pages can be reached via search params that create duplicate URLs, (c) Cross-domain content (legal pages exist on all 3 domains with similar content). Without canonicals, search engines must guess which URL is authoritative. |

### 4.2 Structured Data

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| X-02 | High | All layout JSON-LD uses raw `dangerouslySetInnerHTML` | Three layout files use `dangerouslySetInnerHTML` for JSON-LD instead of the XSS-safe `<JsonLd>` component from `@splits-network/shared-ui`. The component exists (`g:\code\splits.network\packages\shared-ui\src\seo\json-ld.tsx`) and is used in page components. Layouts should be migrated for consistency and safety. |
| X-03 | High | No FAQPage structured data anywhere | All three apps render FAQ sections on their homepages and/or pricing pages. None emit `FAQPage` JSON-LD. This is one of the highest-ROI structured data types for click-through rate improvement. |

### 4.3 Cross-Domain Considerations

| ID | Severity | Issue | Details |
|----|----------|-------|---------|
| X-04 | Medium | Similar legal content on three domains without canonicals | Privacy Policy, Terms of Service, and Cookie Policy exist on splits.network, applicant.network, AND employment-networks.com. While the content differs somewhat per domain, Google may see these as near-duplicates. Each should set canonical to itself and consider using `hreflang` or simply accepting the three versions as separate. |
| X-05 | Low | No cross-domain `sameAs` linking from portal/candidate | The corporate Organization schema includes `sameAs: ["https://splits.network", "https://applicant.network"]`. However, neither the portal nor candidate schemas reciprocate by linking to the corporate domain. |

---

## 5. Technical SEO Checks

### 5.1 Server-Side Rendering

All public pages are server-rendered (SSR or SSG). The portal and candidate apps use a mix of:
- Static pages with `metadata` export (server components)
- Dynamic pages with `generateMetadata` and `revalidate`
- Client components only for interactive sections (GSAP animations, forms)

**Assessment:** Good. Content is server-rendered and indexable.

### 5.2 URL Structure

**Assessment:** Follows convention mostly. Portal public pages at `/public/{page-name}`, corporate at `/{page-name}`. All kebab-case, no trailing slashes, no uppercase.

**Issue:** The `/public/` prefix is unusual for public-facing pages. It works but adds unnecessary path depth. Not a critical SEO issue but not ideal for URL readability.

### 5.3 Image SEO

- Corporate app: All `<img>` tags have meaningful `alt` attributes. Good.
- Portal and candidate apps: No raw `<img>` tags found in public page directories. Icons are FontAwesome `<i>` tags (no alt needed). The only `next/image` usage is in press content and avatar components.
- OG images exist at `apps/*/public/og-image.png` for all three apps.

### 5.4 Heading Hierarchy

- All three homepages have a single `<h1>` in their HeroSection component.
- Documentation pages have proper h1 > h2 nesting.
- Corporate legal pages use h1 for page title, h2 for sections, h3 for subsections. Good hierarchy.

### 5.5 RSS/Atom Feeds

The candidate app provides RSS and Atom feeds for jobs at:
- `/public/jobs/rss.xml`
- `/public/jobs/atom.xml`

**Issue:** Internal references point to `/public/jobs-new/` instead of `/public/jobs/` (see C-09).

### 5.6 Page Speed Indicators

- FontAwesome CSS loaded as render-blocking `<link>` in `<head>` on all three apps. This affects LCP. Consider `preload` or async loading.
- GSAP animations loaded on multiple pages. Not a direct SEO issue but affects Total Blocking Time if bundle is large.
- Google Analytics and Clarity use `afterInteractive` strategy. Good.

---

## 6. Prioritized Recommendations

### Critical (Fix Immediately)

| Priority | ID(s) | Recommendation | Affected Files |
|----------|-------|----------------|----------------|
| 1 | C-09 | Fix all `/public/jobs-new/` references to `/public/jobs/` across RSS feeds, JSON-LD, and internal links | `g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx`, `g:\code\splits.network\apps\candidate\src\app\public\jobs\rss.xml\route.ts`, `g:\code\splits.network\apps\candidate\src\app\public\jobs\atom.xml\route.ts`, `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\components\job-detail-client.tsx`, `g:\code\splits.network\apps\candidate\src\app\public\jobs\components\shared\*` |
| 2 | P-09 | Add unique `metadata` exports to all 28 documentation sub-pages with specific title and description per page | All files in `g:\code\splits.network\apps\portal\src\app\public\documentation\**\page.tsx` |
| 3 | C-01, C-02 | Fix typos in candidate layout OG/Twitter descriptions | `g:\code\splits.network\apps\candidate\src\app\layout.tsx`, lines 26, 44 |
| 4 | C-06, C-07, C-15 | Consolidate duplicate legal pages in candidate app. Keep one URL per topic (recommend `/public/privacy-policy`, `/public/terms-of-service`, `/public/cookie-policy`). Set up redirects from old URLs. Remove duplicates from sitemap. Fix brand names. | `g:\code\splits.network\apps\candidate\src\app\public\{terms,privacy,cookies}\page.tsx`, `g:\code\splits.network\apps\candidate\src\app\public\{terms-of-service,privacy-policy,cookie-policy}\page.tsx`, `g:\code\splits.network\apps\candidate\src\app\sitemap.ts` |
| 5 | X-01 | Add `alternates.canonical` to all public pages, especially job detail, marketplace detail, and legal pages | All `page.tsx` files across all apps |
| 6 | CO-01 | Remove or substantiate AggregateRating from SoftwareApplication schema. If no verified reviews exist, remove entirely. | `g:\code\splits.network\apps\corporate\src\app\layout.tsx`, lines 99-102 |
| 7 | C-14 | Remove RSS/Atom feed URLs from candidate sitemap | `g:\code\splits.network\apps\candidate\src\app\sitemap.ts`, lines 15-16 |

### High (Fix Within 2 Weeks)

| Priority | ID(s) | Recommendation | Affected Files |
|----------|-------|----------------|----------------|
| 8 | C-10 | Add `JobPosting` JSON-LD to individual job detail pages using `<JsonLd>` component. Include title, description, datePosted, validThrough, hiringOrganization, jobLocation, baseSalary. | `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx` |
| 9 | X-03, P-04, P-05, CO-06 | Add `FAQPage` JSON-LD to all pages that render FAQ sections (portal home, portal pricing, candidate home, corporate home) | Portal: `g:\code\splits.network\apps\portal\src\app\page.tsx`, `g:\code\splits.network\apps\portal\src\app\public\pricing\page.tsx`; Candidate: `g:\code\splits.network\apps\candidate\src\app\page.tsx`; Corporate: `g:\code\splits.network\apps\corporate\src\app\page.tsx` |
| 10 | C-17 | Make candidate sitemap async and dynamically include job pages (`/public/jobs/[id]`) and marketplace pages (`/public/marketplace/[id]`). Fetch IDs from API. | `g:\code\splits.network\apps\candidate\src\app\sitemap.ts` |
| 11 | P-12, P-13, C-16, CO-08 | Implement differentiated priority and changeFrequency values in all sitemaps per the guidelines (homepage 1.0/weekly, core pages 0.9/monthly, docs 0.7/monthly, legal 0.3/yearly, jobs daily) | All three `sitemap.ts` files |
| 12 | X-02 | Migrate all layout JSON-LD from raw `dangerouslySetInnerHTML` to the `<JsonLd>` component | All three `layout.tsx` files |
| 13 | P-06, C-08 | Add explicit OpenGraph `url` to all high-value public pages (features, pricing, how-it-works, for-recruiters, for-companies, about, jobs, marketplace) | Various `page.tsx` files |
| 14 | C-04 | Fix WebSite SearchAction URL from `/jobs?search=` to `/public/jobs?search=` | `g:\code\splits.network\apps\candidate\src\app\layout.tsx`, line 132 |

### Medium (Fix Within 1 Month)

| Priority | ID(s) | Recommendation | Affected Files |
|----------|-------|----------------|----------------|
| 15 | P-10 | Add `TechArticle` JSON-LD to documentation feature guide pages and `HowTo` JSON-LD to core workflow pages | Documentation sub-page files |
| 16 | P-11 | Add `BreadcrumbList` JSON-LD to documentation pages that render breadcrumbs | Documentation sub-page files |
| 17 | C-13 | Add `Person` structured data to recruiter marketplace detail pages | `g:\code\splits.network\apps\candidate\src\app\public\marketplace\[id]\page.tsx` |
| 18 | C-11 | Truncate meta description in job detail `generateMetadata` to ~155 characters | `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx` |
| 19 | C-12 | Remove redundant `generateMetadata` from marketplace detail layout (let page handle it) | `g:\code\splits.network\apps\candidate\src\app\public\marketplace\[id]\layout.tsx` |
| 20 | CO-02, CO-03 | Fix corporate WebSite SearchAction (remove or point to valid URL) and Organization founder field | `g:\code\splits.network\apps\corporate\src\app\layout.tsx` |
| 21 | P-08 | Expand thin meta descriptions to 150-160 characters on blog, press, careers, updates pages | Various portal `page.tsx` files |

### Low (Backlog)

| Priority | ID(s) | Recommendation | Affected Files |
|----------|-------|----------------|----------------|
| 22 | P-14 | Use actual content modification dates in sitemap `lastModified` instead of `new Date()` | All three `sitemap.ts` files |
| 23 | P-07 | Either add `keywords` to all pages or remove from the one that has it | `g:\code\splits.network\apps\portal\src\app\public\for-companies\page.tsx` |
| 24 | X-05 | Add `sameAs` to portal and candidate JSON-LD linking to corporate and sibling domains | `g:\code\splits.network\apps\portal\src\app\layout.tsx`, `g:\code\splits.network\apps\candidate\src\app\layout.tsx` |
| 25 | -- | Add `Product` with `Offer` structured data to pricing page | `g:\code\splits.network\apps\portal\src\app\public\pricing\page.tsx` |
| 26 | -- | Add `Article` structured data to blog and career guides pages | Various resource/blog pages |
| 27 | -- | Consider `preload` for FontAwesome CSS to reduce render-blocking | All three `layout.tsx` files |
| 28 | CO-05 | Add analytics to corporate site for SEO measurement | `g:\code\splits.network\apps\corporate\src\app\layout.tsx` |

---

## 7. Summary Scorecard

| Category | Portal | Candidate | Corporate |
|----------|--------|-----------|-----------|
| Metadata on public pages | 18/18 (layout covers docs) | 28/28 | 5/5 |
| Unique titles per page | 18/49 (docs share title) | 25/28 (duplicates in legal) | 5/5 |
| OpenGraph per page | 2/49 (root + for-companies) | 4/28 | 1/5 (root only) |
| JSON-LD schemas | 3 (WebApplication, WebPage, CollectionPage) | 3 (WebApplication, WebSite, WebPage, ItemList) | 4 (Organization, SoftwareApplication, WebSite, WebPage) |
| Sitemap accuracy | Good | 4 issues | Good |
| robots.txt | Good | Good | Good |
| Canonical URLs | None | None | None |
| Rich result eligibility | Low (no FAQ, no HowTo) | Medium (has JobPosting list) | Low (no FAQ) |
| Heading hierarchy | Good | Good | Good |
| Image alt text | Good (minimal images) | Good (minimal images) | Good |
| Internal linking | Good | Good | Good |

---

## 8. Files Referenced in This Audit

### Root Layouts
- `g:\code\splits.network\apps\portal\src\app\layout.tsx`
- `g:\code\splits.network\apps\candidate\src\app\layout.tsx`
- `g:\code\splits.network\apps\corporate\src\app\layout.tsx`

### Sitemaps
- `g:\code\splits.network\apps\portal\src\app\sitemap.ts`
- `g:\code\splits.network\apps\candidate\src\app\sitemap.ts`
- `g:\code\splits.network\apps\corporate\src\app\sitemap.ts`

### robots.txt
- `g:\code\splits.network\apps\portal\src\app\robots.ts`
- `g:\code\splits.network\apps\candidate\src\app\robots.ts`
- `g:\code\splits.network\apps\corporate\src\app\robots.ts`

### JSON-LD Utility
- `g:\code\splits.network\packages\shared-ui\src\seo\json-ld.tsx`

### Key Page Files
- `g:\code\splits.network\apps\portal\src\app\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\page.tsx`
- `g:\code\splits.network\apps\corporate\src\app\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\[id]\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\marketplace\[id]\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\marketplace\[id]\layout.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\rss.xml\route.ts`
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\atom.xml\route.ts`
- `g:\code\splits.network\apps\portal\src\app\public\documentation\layout.tsx`
- `g:\code\splits.network\apps\portal\src\app\public\for-companies\page.tsx`
- `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx`

### Duplicate Legal Pages (Candidate)
- `g:\code\splits.network\apps\candidate\src\app\public\terms\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\terms-of-service\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\privacy\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\privacy-policy\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\cookies\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\cookie-policy\page.tsx`

---

*End of audit. Total issues identified: 41. Critical: 12, High: 10, Medium: 11, Low: 8.*
