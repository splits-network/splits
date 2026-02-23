# OAuth Integrations

How third-party OAuth integrations (Google, Microsoft, LinkedIn) work across the Splits Network stack — from provider registration through token storage and usage.

**Version**: 1.0
**Last Updated**: February 22, 2026
**Status**: STANDARD
**Service**: `integration-service`

---

## Why This Exists

Recruiters connect external accounts (Google Calendar, Outlook, Gmail, LinkedIn) to power platform features like interview scheduling and email tracking. Each integration follows OAuth 2.0 Authorization Code flow with a confidential client, meaning the **backend** holds client secrets and exchanges codes for tokens — the frontend never touches credentials.

This document captures the architecture, the configuration requirements, and the decisions behind them.

---

## Architecture Overview

```
┌─────────────┐     1. Click "Connect"     ┌──────────────────┐
│  Portal App  │ ────────────────────────►  │  integration-    │
│  (Next.js)   │     POST /initiate         │  service (API)   │
│              │  ◄──────────────────────── │                  │
│              │     { authorization_url }   │                  │
└──────┬───────┘                            └──────────────────┘
       │                                           │
       │ 2. Redirect to provider                   │
       ▼                                           │
┌─────────────┐                                    │
│   Google /   │  3. User consents                 │
│  Microsoft / │                                   │
│  LinkedIn    │                                   │
└──────┬───────┘                                   │
       │                                           │
       │ 4. Redirect back with ?code=...&state=... │
       ▼                                           │
┌─────────────┐     5. POST /callback              │
│  /portal/    │ ────────────────────────►  ┌──────┴───────────┐
│  integrations│     { code, state }        │  integration-    │
│  /callback   │  ◄──────────────────────── │  service         │
│  (Next.js)   │     { connection }         │  exchanges code  │
└─────────────┘                             │  for tokens      │
                                            └──────────────────┘
```

**Key principle**: The frontend is a relay. It redirects the user to the provider, receives the authorization code on callback, and immediately passes it to the backend. The backend performs all token exchange and storage.

---

## Provider Configuration

### Database: `integration_providers` Table

Each supported provider has a row in the `integration_providers` table (seeded via migration `20260221000003_create_oauth_connections.sql`):

| slug | name | category | OAuth scopes |
|------|------|----------|-------------|
| `google_calendar` | Google Calendar | calendar | `calendar.events.owned`, `calendar.events.freebusy`, `calendar.calendarlist.readonly` |
| `microsoft_calendar` | Microsoft Outlook | calendar | `Calendars.ReadWrite`, `User.Read`, `offline_access` |
| `google_email` | Gmail | email | `gmail.modify` |
| `microsoft_email` | Outlook Mail | email | `Mail.ReadWrite`, `Mail.Send`, `User.Read`, `offline_access` |
| `linkedin` | LinkedIn | linkedin | `openid`, `profile`, `email` |

### Scope Rationale

- **Google Calendar**: `calendar.events.owned` (CRUD own events) + `calendar.events.freebusy` (check availability) + `calendar.calendarlist.readonly` (list calendars). Avoids the broad `calendar` scope.
- **Gmail**: Single `gmail.modify` covers read + compose + send without granting full account access. Avoids the restricted `gmail.readonly` + `gmail.send` pair.
- **Microsoft**: `offline_access` is required for refresh tokens. `User.Read` is required to identify the account.
- **LinkedIn**: "Sign In with OpenID Connect" product only — identity verification, not API access.

---

## Environment Variables

### Consolidated Naming

The code maps provider slugs to **family-level** env vars. One client ID/secret pair serves all providers in that family:

```
google_calendar  ──┐
                   ├──►  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
google_email     ──┘

microsoft_calendar ──┐
                     ├──►  MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET
microsoft_email    ──┘

linkedin ────────────►  LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET
```

This mapping lives in `services/integration-service/src/v2/shared/helpers.ts`:

```typescript
function getProviderFamily(providerSlug: string): string {
    if (providerSlug.startsWith('google_'))    return 'GOOGLE';
    if (providerSlug.startsWith('microsoft_')) return 'MICROSOFT';
    if (providerSlug === 'linkedin')           return 'LINKEDIN';
    return providerSlug.toUpperCase();
}
```

### Where to Set Them

| Environment | Location |
|-------------|----------|
| **Local dev** | Root `.env` file (all services read from `process.cwd()` which is repo root when using `pnpm --filter`) |
| **Docker Compose** | `docker-compose.yml` → `environment:` block on `integration-service` (reads from root `.env`) |
| **K8s / Staging / Prod** | GitHub Secrets → `.github/workflows/deploy-*.yml` → `kubectl create secret generic integration-secrets` → `deployment.yaml` `secretKeyRef` |

**Common mistake**: Do NOT put these in `apps/portal/.env.local`. The portal never reads OAuth credentials — only the integration-service does.

---

## OAuth Flow in Detail

### 1. Initiate (`POST /integrations/connections/initiate`)

Frontend sends: `{ provider_slug, redirect_uri }`

Backend:
1. Looks up the provider row in `integration_providers`
2. Generates a random `state` UUID (CSRF token)
3. Stores `{ providerSlug, clerkUserId, redirectUri, state }` in memory
4. Builds the authorization URL with `client_id`, `redirect_uri`, `scope`, `state`
5. Returns `{ authorization_url, state }` to the frontend

Frontend stores `state` in `sessionStorage`, then redirects the browser to the authorization URL.

### 2. Provider Consent

User authenticates with the provider and approves the requested scopes. Provider redirects back to `redirect_uri` with `?code=...&state=...`.

### 3. Callback (`/portal/integrations/callback`)

This is a Next.js **client-side** page (`apps/portal/src/app/portal/integrations/callback/page.tsx`).

It:
1. Extracts `code` and `state` from URL params
2. Validates `state` matches `sessionStorage` value (CSRF check)
3. POSTs `{ code, state }` to the backend

### 4. Token Exchange (`POST /integrations/connections/callback`)

Backend:
1. Validates `state` against in-memory store
2. Exchanges the authorization code for tokens via the provider's token endpoint
3. Fetches account info (email, display name) from the provider
4. Encrypts tokens and stores them in `oauth_connections`
5. Publishes a `integration.connection_created` event via RabbitMQ
6. Returns the sanitized connection (no tokens) to the frontend

### Redirect URI

All providers use the **same** callback URL:

```
https://splits.network/portal/integrations/callback
```

This must be registered in each provider's console:
- **Google Cloud Console**: OAuth 2.0 Client → Authorized redirect URIs
- **Azure AD**: App registration → Authentication → Web platform → Redirect URIs
- **LinkedIn**: App settings → Auth → Authorized redirect URLs

**Important**: Azure AD must use the **Web** platform, NOT SPA. SPA requires PKCE and does not support `client_secret`, which our confidential client flow requires.

---

## Service Structure

```
services/integration-service/src/v2/
├── connections/
│   ├── repository.ts       # CRUD for oauth_connections table
│   ├── routes.ts           # /initiate, /callback, list, revoke
│   └── service.ts          # OAuth flow orchestration
├── providers/
│   └── repository.ts       # Read-only access to integration_providers
├── calendar/
│   ├── google-client.ts    # Google Calendar API wrapper
│   ├── microsoft-client.ts # Microsoft Graph Calendar wrapper
│   ├── routes.ts           # /calendars, /events, /freebusy
│   ├── service.ts          # Calendar operations
│   └── token-refresh.ts    # Token refresh for all providers
├── email/
│   ├── gmail-client.ts     # Gmail API wrapper
│   ├── microsoft-mail-client.ts
│   ├── routes.ts           # /threads, /send
│   └── service.ts          # Email operations
├── linkedin/
│   ├── client.ts           # LinkedIn OpenID profile fetch
│   ├── routes.ts           # /profile, /verification
│   └── service.ts          # Identity verification
├── ats/
│   ├── greenhouse-client.ts
│   ├── lever-client.ts
│   ├── repository.ts
│   ├── routes.ts
│   └── service.ts
├── shared/
│   ├── helpers.ts          # getOAuthClientId, getOAuthClientSecret, getProviderFamily
│   └── events.ts           # RabbitMQ event publisher
└── routes.ts               # Route registry
```

---

## Token Storage & Refresh

- Tokens are encrypted at rest in the `oauth_connections` table (`access_token_enc`, `refresh_token_enc`)
- `token_expires_at` tracks when the access token expires
- `TokenRefreshService` checks expiry before each API call and refreshes transparently
- A database index (`idx_oauth_connections_expiring`) supports batch refresh queries
- Each user can have **one active connection per provider** (enforced by a partial unique index on `clerk_user_id + provider_slug WHERE status != 'revoked'`)

---

## Provider Console Setup Checklist

### Google Cloud Console

1. Create OAuth 2.0 Client (Web application type)
2. Add redirect URI: `https://splits.network/portal/integrations/callback`
3. Enable APIs: **Google Calendar API**, **Gmail API**
4. Add scopes to OAuth consent screen
5. Set to **Testing** mode with test users during development
6. Submit for scope verification before production launch

### Microsoft Azure AD

1. Create App Registration
2. Add redirect URI under **Web** platform (NOT SPA)
3. Add API permissions: `Calendars.ReadWrite`, `Mail.ReadWrite`, `Mail.Send`, `User.Read`, `offline_access`
4. Grant admin consent if using organizational accounts
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"

### LinkedIn Developer Portal

1. Create App
2. Request "Sign In with LinkedIn using OpenID Connect" product
3. Add redirect URI: `https://splits.network/portal/integrations/callback`
4. Scopes are fixed by the product: `openid`, `profile`, `email`

---

## Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScheduleInterviewModal` | `apps/portal/src/components/basel/scheduling/` | Multi-step wizard (BaselWizardModal) for creating calendar events |
| `integrations-section.tsx` | `apps/portal/src/components/basel/integrations/` | Profile page — shows connected integrations |
| `installed-integrations.tsx` | `apps/portal/src/components/basel/integrations/` | Marketplace page — installed integrations tab |
| `provider-detail-modal.tsx` | `apps/portal/src/components/basel/integrations/` | Provider info + connect/disconnect actions |
| `callback/page.tsx` | `apps/portal/src/app/portal/integrations/callback/` | OAuth callback relay page |

---

## Adding a New Provider

1. **Add provider row** to the seed migration (or create a new migration with an INSERT)
2. **Create API client** in the appropriate domain folder (e.g., `v2/calendar/new-provider-client.ts`)
3. **Add provider family mapping** in `helpers.ts` if the slug prefix is new
4. **Add env vars** to: root `.env`, `docker-compose.yml`, K8s `deployment.yaml`, both deploy workflows, and GitHub Secrets
5. **Register in provider console** with redirect URI `https://splits.network/portal/integrations/callback`
6. **Frontend**: The marketplace page auto-populates from the `integration_providers` table — no frontend changes needed for the card to appear
