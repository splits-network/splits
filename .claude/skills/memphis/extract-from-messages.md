# extract-from-messages

Extract reusable components from the messages showcase page.

## Available Components

1. **MessengerLayout** - Full-page layout with header, conversation panel, and thread panel
2. **MessengerHeader** - Top bar with Memphis decorations, title, unread badge, and action buttons
3. **ConversationPanel** - Left sidebar with search, role filters, conversation list, and footer stats
4. **ConversationSearch** - Memphis-styled search input for conversations
5. **RoleFilterTabs** - Horizontal filter buttons for role-based filtering
6. **ConversationItem** - Single conversation row with avatar, preview, and unread indicator
7. **ConversationAvatar** - Square initials avatar with role icon badge overlay
8. **RoleBadge** - Small colored role label (Recruiter, Company, Candidate, Admin)
9. **UnreadCount** - Small square showing unread message count
10. **MessageThread** - Right panel with thread header, messages, and compose area
11. **ThreadHeader** - Contact info bar with avatar, name, role, and action buttons
12. **MessageBubble** - Single message bubble (sent or received) with corner accent
13. **DateDivider** - Horizontal divider with centered label
14. **ComposeArea** - Message input area with quick actions and send button
15. **QuickActionButton** - Small bordered action button (Attach, Resume, Schedule, Propose Split)
16. **MessengerEmptyState** - No conversation selected placeholder with Memphis shapes
17. **NoResultsState** - Empty search results indicator

## Component Details

### ConversationItem
```tsx
interface ConversationItemProps {
    contact: { name: string; initials: string; role: string; };
    lastMessage: { text: string; timestamp: string; isSent: boolean; };
    unreadCount: number;
    pinned: boolean;
    isActive: boolean;
    roleColor: string;
    onClick: () => void;
}
// border-b-[3px], active left bar (w-[5px]), avatar with role badge,
// pinned icon (thumbtack in yellow), truncated preview,
// unread count square, bold when unread
```

### ConversationAvatar
```tsx
interface ConversationAvatarProps {
    initials: string;
    role: "recruiter" | "company" | "candidate" | "admin";
    size?: "sm" | "md" | "lg"; // 8/10/12 -> w-8/w-10/w-12
    showRoleBadge?: boolean;
}
// Square initials in border-[3px] with role color fill,
// role icon badge (absolute -bottom-1 -right-1 w-5 h-5),
// company role uses dark text, others use white text
// Role colors: recruiter=#FF6B6B, company=#FFE66D, candidate=#4ECDC4, admin=#A78BFA
```

### MessageBubble
```tsx
interface MessageBubbleProps {
    text: string;
    timestamp: string;
    isSent: boolean;
    senderInitials?: string;
    roleColor: string;
    contactRole: string;
    isRead?: boolean;
}
// Sent: border-[3px] white translucent, dark tinted bg, corner accent top-left,
//   "You" avatar, read receipt icon (teal when read)
// Received: border-[3px] in roleColor, tinted bg (roleColor + 15),
//   corner accent top-right, initials avatar
// Both: max-w-[75%], text-sm leading-relaxed, timestamp below
```

### ComposeArea
```tsx
interface ComposeAreaProps {
    roleColor: string;
    contactRole: string;
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}
// border-top: 4px solid roleColor, dark bg,
// quick action row (Attach, Resume, Schedule, Propose Split),
// text input with dynamic border color (roleColor when text present),
// send button: border-[3px], fills with roleColor when text present,
// "Press Enter to send" hint below
```

### RoleFilterTabs
```tsx
interface RoleFilterTabsProps {
    activeFilter: string;
    onFilterChange: (role: string) => void;
}
// Horizontal row: All (white), Rec (coral), Co (yellow), Cand (teal), Admin (purple)
// Each: px-3 py-1.5 text-[10px] font-black uppercase border-[3px],
// active: filled bg, inactive: transparent with colored text/border
// hover:-translate-y-0.5
```

### QuickActionButton
```tsx
interface QuickActionButtonProps {
    icon: string;
    label: string;
    color: string;
    onClick?: () => void;
}
// border-[2px] with 44 opacity color, tinted bg (color + 08),
// text-[9px] font-bold uppercase, icon + label,
// label hidden on small screens (hidden sm:inline)
```

### MessengerEmptyState
```tsx
// Large bordered square with messages icon, Memphis shape accents
// (teal circle, yellow rotated square, purple triangle),
// "Select a Conversation" heading, muted subtext
```

## Dependencies
- `ConversationAvatar` is used in both `ConversationItem` and `ThreadHeader`
- `RoleBadge` is used in `ConversationItem` and `ThreadHeader`
- `MessageBubble` is rendered in a loop inside `MessageThread`
- `QuickActionButton` is rendered inside `ComposeArea`
- `RoleFilterTabs` is inside `ConversationPanel`
- Role style mapping (`ROLE_STYLES`) maps role string to color, bg, icon, and label
- `CURRENT_USER_ID` constant determines sent vs received message direction
- Mobile responsive: `ConversationPanel` and `MessageThread` toggle visibility using `showMobileThread` state

## Reference
Source: `apps/corporate/src/app/showcase/messages/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
