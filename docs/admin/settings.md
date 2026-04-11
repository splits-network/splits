# Platform Settings

## Current State

**Route:** `/secure/settings`
**Data source:** `/identity/admin/settings`

### What Exists
- **Settings form** - Loads settings from API, renders a form via `SettingsForm` component
- **Graceful fallback** - Uses defaults if settings endpoint is unavailable
- **General Settings section:**
  - Platform Name (text input, default "Splits Network")
  - Support Email (email input)
  - Maintenance Mode toggle (default off)
- **Feature Flags section:**
  - AI Matching toggle (default on)
  - Fraud Detection toggle (default on)
  - Automation toggle (default off)
  - Escrow toggle (default on)
- **Save button** with loading state and toast notifications

### What's Missing

#### Critical (Phase Priority: High)
- **Platform configuration** - Fee defaults (platform cut, recruiter split), guarantee period length, minimum payout threshold
- **Additional feature flags** - Chat, marketplace listing, candidate self-service, notifications
- **Email configuration** - Default sender, reply-to, notification preferences
- **Registration settings** - Open/closed registration, recruiter approval required, invite-only mode

#### Important (Phase Priority: Medium)
- **Branding settings** - Platform name, logo, colors (if multi-tenant)
- **Integration settings** - API keys for third-party services (viewable status, not raw keys)
- **Rate limiting** - Configure API rate limits
- **Webhook configuration** - Manage outbound webhooks
- **Audit logging settings** - Configure what gets logged, retention period
- **Email template management** - Preview/test email templates
- **Payment settings** - Stripe configuration, payout schedule defaults, currency settings
- **Security settings** - Password policies, 2FA requirements, session timeout
- **Notification defaults** - Default notification channels, frequencies

#### Nice to Have
- **Settings history** - Track who changed what setting and when
- **Environment comparison** - Compare settings between staging and production
- **Settings import/export** - Backup and restore configuration
- **Feature flag scheduling** - Schedule feature toggles for future dates

## Implementation Notes
- Settings changes should be audit-logged with before/after values
- Feature flags should take effect immediately without deployment
- Sensitive settings (API keys) should show masked values with reveal toggle
- Maintenance mode should be easily accessible (maybe in header bar)
