# Organizations Management

## Current State

**Route:** `/secure/organizations`
**Data source:** `/identity/admin/organizations`

### What Exists
- **Table columns:** Name/Slug, Type, Member Count, Owner Name, Created date, Status (active/inactive/suspended)
- **Filters:** Status dropdown (All, Active, Inactive, Suspended)
- **Search:** Text search
- **Pagination:** Standard numbered pagination
- **Actions:** None - completely read-only
- **No detail page** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Organization detail page** - Full profile: members, type, settings, associated firm, activity
- **Status management** - Suspend/reactivate organization with reason and audit trail
- **Member management** - View members, their roles, add/remove members, transfer ownership
- **Organization editing** - Edit name, slug, type, settings

#### Important (Phase Priority: Medium)
- **Clerk org sync** - Show sync status with Clerk organizations, trigger re-sync
- **Organization notes** - Internal admin notes
- **Associated entities** - Link to firm, recruiters, billing profile
- **Invitation management** - View pending invitations, revoke
- **Activity log** - Organization-level activity trail

#### Nice to Have
- **Organization merge** - Merge duplicate organizations
- **SSO configuration** - View/manage SSO settings for enterprise orgs
- **Usage analytics** - How active is this organization

## Implementation Notes
- Organizations map to Clerk organizations - changes should sync
- Suspension should cascade to org members' access
- Ownership transfer needs confirmation from both parties
