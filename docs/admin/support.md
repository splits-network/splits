# Support Management (Tickets + Live Chat)

## Current State

### Support Tickets
**Route:** `/secure/support-tickets`
**Data source:** `/support/admin/support/tickets`

**List page:**
- **Table columns:** (via TicketTable component)
- **Filters:** Status pills (All, Open, In Progress, Resolved, Closed)
- **Search:** Text search
- **Stats banner:** Open, In Progress, Resolved, Closed counts
- **Pagination:** Standard prev/next

**Detail page (`/secure/support-tickets/{id}`):**
- **Original message** display
- **Replies timeline** - Threaded replies with sender type badges (admin/visitor)
- **Reply form** - Textarea to compose and send replies (emails visitor)
- **Sidebar:** Ticket ID, Category, Source app, Visitor name/email, Authenticated status, Page URL, Created date, Resolved date
- **Status management** - Buttons to change status (open, in_progress, resolved, closed)
- **Claim ticket** - Assign yourself as the handler
- **This is the second-most complete feature** - Has real workflow management

### Support Chat
**Route:** `/secure/support-chat`
**Data source:** `/support/admin/support/conversations`

- **Queue panel** - Real-time conversation list with status filter, unread tracking
- **Thread panel** - Full chat thread with message composition
- **Real-time** - WebSocket-based with presence tracking
- **Admin presence** - Shows admin is available
- **This is well-built** - Real-time chat with good UX

### What's Missing

#### Critical (Phase Priority: High)
- **Ticket assignment** - Assign tickets to specific admins (not just claim)
- **Ticket priority** - Priority levels (urgent, high, normal, low) with SLA tracking
- **Ticket categories management** - Configure available categories
- **Internal notes** - Admin-only notes on tickets (not visible to visitor)
- **Canned responses** - Pre-written responses for common questions

#### Important (Phase Priority: Medium)
- **SLA monitoring** - Response time targets, resolution time targets, SLA breach alerts
- **Auto-assignment rules** - Route tickets to specific admins based on category/source
- **Ticket merging** - Merge duplicate tickets from same visitor
- **Related tickets** - Show other tickets from same user
- **Customer satisfaction** - Post-resolution satisfaction survey tracking
- **Support analytics** - Response times, resolution rates, volume by category, by source app
- **Ticket tags** - Custom tags for categorization and tracking
- **Escalation workflow** - Escalate to senior support with full context
- **Chat-to-ticket** - Convert a live chat into a support ticket for follow-up
- **Knowledge base integration** - Suggest KB articles while composing replies

#### Nice to Have
- **Support dashboard** - Overview of all support metrics, active conversations, pending tickets
- **Agent performance** - Track individual admin support performance
- **Macro/automation** - Auto-respond to common queries, auto-categorize
- **Multi-channel inbox** - Unified view of support from chat, tickets, and email

## Implementation Notes
- Ticket detail page is well-built but needs internal notes and priority
- SLA tracking needs defined thresholds per priority level
- Canned responses should be shared across all admins, with personal favorites
- Chat-to-ticket conversion should preserve the full conversation history
- Support analytics should break down by source_app (portal, candidate, corporate)
