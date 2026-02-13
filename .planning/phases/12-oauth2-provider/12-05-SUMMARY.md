---
phase: 12-oauth2-provider
plan: 05
status: complete
duration: ~8 min (including checkpoint fixes)
commits:
  - e38c4be2  # feat(12-05): create OAuth consent page with Clerk auth flow
  - 6c7f844e  # feat(12-05): create OAuth error, success, and learn-more pages
  - fe349781  # feat(12-05): create OAuth consent page with Clerk auth flow (amended)
  - 2ab687a3  # fix(12-05): correct OAuth authorize flow and TypeScript errors
  - 453bff82  # feat(12-05): replace text headers with logo on consent pages
---

## What was built

OAuth consent UI pages in the candidate app under `/authorize/*`:

1. **Consent page** (`/authorize`) - Branded consent UI with Clerk auth, permission display, auto-approve for returning users, scope upgrade diffs, session limit handling
2. **Error page** (`/authorize/error`) - User-friendly error messages mapped from OAuth error codes with "Try again" and "Return to ChatGPT" actions
3. **Success page** (`/authorize/success`) - "Connected!" flash with 1.5s auto-redirect to ChatGPT callback URL
4. **Learn-more page** (`/authorize/learn-more`) - Informational page explaining GPT integration, data sharing, and session management

## Key decisions

- **JSON responses instead of redirects**: Changed authorize endpoint from 302 redirects to JSON `{ data: { code } }` because the consent page uses `fetch()` which can't follow cross-origin redirects
- **Graceful error handling**: Consent check failure falls through to show consent UI instead of throwing (handles gpt-service not running)
- **Logo over text**: Replaced "Applicant.Network" text headers with `<img src="/logo.png">` on all consent pages
- **TypeScript strict typing**: Added explicit type annotations for Supabase untyped data in oauth-service.ts

## Deviations from plan

- Authorize endpoint response format changed from 302 redirect to JSON (architectural fix discovered during checkpoint testing)
- Added logo replacements across all 4 pages (user request during checkpoint)

## Files modified

- `apps/candidate/src/app/authorize/page.tsx` (created)
- `apps/candidate/src/app/authorize/consent-client.tsx` (created, then fixed)
- `apps/candidate/src/app/authorize/error/page.tsx` (created, then updated)
- `apps/candidate/src/app/authorize/success/page.tsx` (created, then updated)
- `apps/candidate/src/app/authorize/learn-more/page.tsx` (created, then updated)
- `services/gpt-service/src/v2/oauth/routes.ts` (fixed authorize response format)
- `services/gpt-service/src/v2/oauth/oauth-service.ts` (fixed TypeScript errors)
