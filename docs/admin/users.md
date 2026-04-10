# Users Management

## Current State

**Route:** `/secure/users`
**Data source:** `/identity/admin/users`

### What Exists
- **Table columns:** Avatar, Name, Email, Roles (badge list), Created, Last Active
- **Search:** Text search on users
- **Stats banner:** Total Users, Admins count
- **Pagination:** Standard prev/next
- **Row click:** Routes to `/secure/users/{id}` (detail page may not exist yet)
- **Actions:** None - completely read-only

### What's Missing

#### Critical (Phase Priority: High)
- **User detail page** - Click-through to full user profile with all related data (recruiter profile, candidate profile, activity, sessions)
- **Role management** - Ability to assign/remove roles (admin, recruiter, candidate, etc.)
- **Account suspension/ban** - Suspend or ban user accounts with reason tracking
- **Impersonation** - "View as user" for debugging (read-only impersonation)
- **Force password reset** - Trigger password reset for security incidents
- **Activity history** - Show user's recent actions, login history, IP addresses

#### Important (Phase Priority: Medium)
- **Merge duplicate accounts** - Tool to merge when same person has multiple accounts
- **Export user data** - GDPR-compliant data export for a specific user
- **Delete/anonymize user** - GDPR right-to-be-forgotten compliance
- **Bulk actions** - Select multiple users, bulk assign roles, bulk suspend
- **User notes** - Internal admin notes attached to user profiles
- **Email user** - Send direct email from admin interface
- **Registration source tracking** - See how users found the platform
- **Clerk sync status** - Show if user is in sync with Clerk, trigger re-sync

#### Nice to Have
- **User timeline** - Visual timeline of all user events (signup, first job, first placement, etc.)
- **Linked accounts** - Show all related entities (recruiter profile, candidate profile, firm memberships)
- **Session management** - View active sessions, force logout
- **Login attempt log** - Failed login attempts for security monitoring

## Implementation Notes
- User detail page should be a tabbed layout: Overview, Activity, Roles, Security, Notes
- Role changes should be audit-logged
- Suspension should cascade (suspend recruiter profile too)
- Impersonation must be logged and time-limited
