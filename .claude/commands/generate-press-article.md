---
name: generate-press-article
description: Generate a press/release article from git commits for a date or date range
argument-hint: "[date, date-range, or 'backfill YYYY-MM-DD..YYYY-MM-DD']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
---

<objective>
Generate a human-readable MDX press article summarizing features added, improved, or fixed based on git commit history. Output articles to `content/press/YYYY-MM-DD-{generated-slug}.mdx`.
</objective>

<context>
Date argument: $ARGUMENTS

If no argument provided, use today's date.
If argument contains ".." (e.g., "2026-02-01..2026-02-13"), treat as a date range and generate ONE article covering the range.
If argument starts with "backfill", generate SEPARATE articles for each day that has commits.
</context>

<process>

## Step 1: Parse Arguments

- Single date: `2026-02-13` — gather commits for that day
- Date range: `2026-02-01..2026-02-13` — gather commits across range, produce ONE article
- `backfill` or `backfill YYYY-MM-DD..YYYY-MM-DD` — iterate each day, produce one article per day that has commits
- No argument: use today's date

## Step 2: Gather Git Commits

Run git log to get commits for the target date(s):

```bash
# For a single date:
git log --after="YYYY-MM-DDT00:00:00" --before="YYYY-MM-DDT23:59:59" --pretty=format:"%h %s" --no-merges

# For a date range:
git log --after="START_DATE" --before="END_DATE_PLUS_1_DAY" --pretty=format:"%h %s" --no-merges
```

If no commits found for the date(s), report this and skip (or exit if single date).

## Step 3: Categorize Commits

Group commits by type based on conventional commit prefixes:

**Include in article:**
- `feat:` / `feature:` → **New Features**
- `fix:` → **Bug Fixes**
- `perf:` → **Performance Improvements**
- `refactor:` → **Under the Hood** (mention briefly)

**Skip entirely (internal/infrastructure):**
- `chore:` / `ci:` / `test:` / `build:` / `style:` / `docs:`

For each included commit, extract the scope from parentheses if present and map to user-friendly names:
- `ats-service` / `ats` → "Job Management"
- `network-service` / `network` → "Recruiter Network"
- `billing-service` / `billing` → "Billing & Payments"
- `portal` → "Portal"
- `identity-service` / `identity` → "User Management"
- `notification-service` / `notification` → "Notifications"
- `chat-service` / `chat-gateway` / `chat` → "Messaging"
- `analytics-service` / `analytics-gateway` / `analytics` → "Analytics & Reporting"
- `ai-service` / `automation-service` / `ai` / `automation` → "AI & Automation"
- `document-service` / `document` → "Documents"
- `api-gateway` → "API"
- `shared-*` → skip scope (internal library)

If ALL commits for a day are skippable types, skip that day entirely (no article).

## Step 4: Read VERSION

```bash
cat VERSION
```

## Step 5: Generate Article Content

Write the MDX file with this structure:

```mdx
---
title: "[Generated descriptive title based on main themes]"
date: "YYYY-MM-DD"
summary: "[1-2 sentence summary of the changes]"
tags: [derived from commit types and scopes]
version: "[from VERSION file]"
author: "Splits Network"
---

[Opening paragraph: 2-3 sentences contextualizing what was shipped]

## New Features

[For each feat commit, write a human-readable paragraph explaining the feature
from a user's perspective. Group related commits together into single paragraphs.]

## Improvements

[For each fix/perf commit, explain what was improved and why it matters to users]

## Under the Hood

[Brief mention of refactors if any, framed as reliability/performance improvements]

## What's Next

[Brief forward-looking sentence based on the scope of work]
```

### Writing guidelines — CRITICAL:
- **Write for recruiters and hiring companies**, not developers
- **Translate technical commit messages into user-facing benefits**
  - BAD: "feat(ats-service): add candidate search endpoint"
  - GOOD: "You can now search across all your candidates by name, skill, or location"
- **Group related commits** into coherent paragraphs rather than listing one per line
- **Active voice**: "You can now..." / "We've improved..." not "A feature was added..."
- **Omit empty sections** — if there are no bug fixes, don't include "Bug Fixes" heading
- **No commit hashes or technical jargon** in the article body
- Keep tone professional but approachable (Splits Network brand voice)
- Articles should read like product updates from Linear, Notion, or Vercel

### Title guidelines:
- Descriptive, not generic: "Candidate Search and Faster Analytics" not "February Updates"
- Reference the most impactful 1-2 changes
- Under 80 characters

### Tags:
- Derive from the categories present: `"new-feature"`, `"improvement"`, `"bug-fix"`, `"performance"`
- Add scope-based tags for major areas touched: `"ats"`, `"analytics"`, `"messaging"`, etc.

## Step 6: Generate Slug

Create a URL-safe slug from the title:
- Lowercase
- Replace spaces with hyphens
- Remove special characters (keep alphanumeric and hyphens)
- Prefix with date: `YYYY-MM-DD-slug-text`
- Truncate slug portion to ~50 chars max

## Step 7: Write File

```bash
mkdir -p content/press
```

Write the MDX file to `content/press/YYYY-MM-DD-slug.mdx`.

## Step 8: Verify

- Read the file back to confirm valid frontmatter
- Report: file path, title, word count, number of commits summarized

</process>

<backfill_mode>
When the argument starts with "backfill":

1. Parse date range — default to last 30 days if no range given
2. For each day in the range (iterate chronologically):
   a. Run git log for that specific day
   b. Check if an article already exists for that date (any file starting with `YYYY-MM-DD-` in `content/press/`)
   c. If commits exist AND no article exists AND commits include non-skippable types → generate article
   d. Otherwise skip with reason logged
3. After all days processed, report summary:
   - X articles generated (list file names)
   - Y days skipped — no commits
   - Z days skipped — only internal commits
   - W days skipped — article already exists

**Important**: In backfill mode, process days sequentially. Do not generate articles in parallel to avoid context confusion between days.
</backfill_mode>

<success_criteria>
- [ ] MDX file(s) created at `content/press/YYYY-MM-DD-slug.mdx`
- [ ] Frontmatter has all required fields (title, date, summary, tags, version, author)
- [ ] Article body is human-readable, not raw commit messages
- [ ] Technical jargon translated to user-facing language
- [ ] Empty sections omitted
- [ ] File path(s) reported to user
</success_criteria>
