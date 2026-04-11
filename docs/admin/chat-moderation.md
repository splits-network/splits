# Chat Moderation

## Current State

**Route:** `/secure/chat`
**Data source:** `/chat/admin/flagged`

### What Exists
- **Table columns:** Severity (high/medium/low), From/To (sender + recipient), Message Preview (truncated), Flag Reason, Status (pending/reviewed/removed/cleared), Flagged date
- **Filters:** Status dropdown (All, Pending, Reviewed, Removed, Cleared)
- **Sorting:** By sender name, flagged date
- **Actions:** None - completely read-only despite being a "moderation" page
- **No detail view** - No way to see full message, conversation context, or user profiles

### What's Missing

#### Critical (Phase Priority: High)
- **Moderation actions** - Mark as reviewed/clear/remove with one click per flagged message
- **Full message view** - Click to see complete message (not just preview), and surrounding conversation context
- **Conversation context** - Show messages before/after the flagged message for context
- **User action from moderation** - Warn user, suspend user, or escalate directly from flagged message
- **Bulk moderation** - Select multiple flagged messages, batch clear or batch remove

#### Important (Phase Priority: Medium)
- **All conversations view** - Browse all conversations (not just flagged), search by participant
- **Conversation monitoring** - Real-time view of active conversations
- **User chat history** - View all chat messages from a specific user
- **Flagging rules management** - Configure what triggers automatic flagging (keywords, patterns, AI detection)
- **Message deletion** - Delete individual messages from conversations
- **User communication ban** - Temporarily or permanently ban a user from chat
- **Moderation stats** - Flagged messages per day, resolution time, false positive rate
- **Escalation workflow** - Escalate flagged content to senior admin with notes

#### Nice to Have
- **AI moderation tuning** - Adjust sensitivity of automatic flagging
- **Content pattern analysis** - Identify trending problematic content patterns
- **Moderation queue prioritization** - Auto-sort by severity, time pending
- **Canned responses** - Pre-written warning messages for common violations

## Implementation Notes
- Moderation actions should be immediate (no confirmation needed for clear/review)
- Remove action should soft-delete the message and replace with "[Message removed by admin]"
- User warnings should be tracked and auto-escalate after N warnings
- Full conversation context should show 5-10 messages before/after the flagged message
