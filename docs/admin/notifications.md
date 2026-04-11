# Site Notifications Management

## Current State

**Route:** `/secure/notifications`
**Data source:** `/notification/admin/site-notifications`

### What Exists
- **Table columns:** Title/Message, Type (badge), Severity (info/warning/critical), Active toggle, Expires date, Created date
- **Filters:** Active status pills (All, Active, Inactive), Severity dropdown
- **Pagination:** Standard prev/next
- **Actions:**
  - **Create** - Button to create new notification (opens form)
  - **Edit** - Edit existing notification
  - **Toggle active** - Toggle switch to activate/deactivate
  - **Delete** - Delete notification with confirmation
- **This is the most complete feature in the admin app** - Full CRUD

### What's Missing

#### Important (Phase Priority: Medium)
- **Notification preview** - Preview how notification looks to users before publishing
- **Targeting** - Target notifications to specific user segments (role, firm, etc.)
- **Scheduling** - Schedule notification to go live at a future date/time
- **Notification analytics** - View count, dismiss rate, click-through rate
- **Notification templates** - Save and reuse notification templates
- **Rich content** - Support markdown or basic HTML in notification body
- **Priority ordering** - If multiple active, set display order

#### Nice to Have
- **A/B testing** - Test different notification messages
- **Auto-expiration rules** - Auto-deactivate after N days or N views
- **Notification history** - Archive of all past notifications with performance data
- **Multi-channel** - Send same notification as in-app, email, or push

## Implementation Notes
- This feature is already well-built with full CRUD
- Priority additions: targeting and scheduling
- Preview should show exact rendering across portal, candidate, and corporate apps
- Analytics tracking needs frontend event emission (notification viewed, dismissed, clicked)
