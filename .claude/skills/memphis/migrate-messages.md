# migrate-messages

Migrate a messages page to Memphis design.

## Page Type Characteristics
Messages pages are real-time chat interfaces with a two-pane layout (conversation list + message thread). Key traits:
- Full-height layout (`min-h-screen`) with header bar, conversation list panel, and message thread panel
- Header bar with Memphis decorations, app title, unread badge, and action buttons
- Conversation list with search, role filter tabs, sorted items (pinned first, unread next), and footer stats
- Message thread with role-colored header, bubbles (sent vs received), date dividers, quick action buttons, and compose area
- Role-based color coding: recruiter=coral, company=yellow, candidate=teal, admin=purple
- Mobile responsive: conversation list and thread toggle visibility with back button
- Thick borders throughout (`border-[3px]`), no border-radius anywhere

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Messenger header | Dark bg, `border-bottom: 4px solid coral`, Memphis shape decorations, title with icon in bordered square, unread badge pill, action buttons with `border-[3px]` |
| Search bar | `border-[3px]` dark gray, teal magnifying glass icon, uppercase placeholder, dark bg |
| Role filter tabs | Small buttons with `border-[3px]`, filled when active, color-coded by role |
| Conversation item | `border-b-[3px]`, active left bar (`w-[5px]`), initials avatar in colored square with role icon badge, pinned indicator, unread count square, truncated preview |
| Thread header | `border-bottom: 4px solid roleColor`, initials avatar, name + role badge, pin/phone/more buttons |
| Message bubble (received) | `border-[3px]` in role color, tinted bg (`${roleColor}15`), corner accent square, small initials avatar, timestamp below |
| Message bubble (sent) | `border-[3px]` white translucent, dark tinted bg, corner accent, "You" avatar, read receipt double-check icon |
| Date divider | Horizontal lines + bordered label "Conversation Start" |
| Quick actions | Row of small bordered buttons (Attach, Resume, Schedule, Propose Split) |
| Compose area | `border-top: 4px solid roleColor`, text input with `border-[3px]`, send button that fills with color when text present |
| Empty state | Memphis shapes (square, circle, triangle), bold heading, muted subtext |

## Memphis Patterns for Messages

### Conversation Item Pattern
```tsx
<div className="relative cursor-pointer border-b-[3px]"
    style={{ borderColor: "#2D2D44", backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "transparent" }}>
    {isActive && <div className="absolute left-0 top-0 bottom-0 w-[5px]" style={{ backgroundColor: roleColor }} />}
    <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="relative flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center border-[3px] text-sm font-black"
                style={{ borderColor: roleColor, backgroundColor: roleColor, color: "#FFFFFF" }}>
                {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center border-2"
                style={{ borderColor: "#1A1A2E", backgroundColor: roleColor }}>
                <i className={`${roleIcon} text-[8px]`} style={{ color: "#FFFFFF" }}></i>
            </div>
        </div>
        <div className="flex-1 min-w-0">
            {/* Name + time, role badge, preview + unread count */}
        </div>
    </div>
</div>
```

### Message Bubble Pattern
```tsx
{/* Received message */}
<div className="flex gap-3">
    <div className="w-8 h-8 flex items-center justify-center border-[2px] text-[10px] font-black"
        style={{ borderColor: roleColor, backgroundColor: roleColor, color: "#FFFFFF" }}>
        {initials}
    </div>
    <div className="max-w-[75%]">
        <div className="relative p-3.5 border-[3px]"
            style={{ borderColor: roleColor, backgroundColor: `${roleColor}15` }}>
            <div className="absolute top-0 right-0 w-3 h-3" style={{ backgroundColor: roleColor }} />
            <p className="text-sm leading-relaxed" style={{ color: "#FFFFFF" }}>{text}</p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider mt-1.5"
            style={{ color: "rgba(255,255,255,0.25)" }}>{timestamp}</span>
    </div>
</div>
```

### Compose Area Pattern
```tsx
<div className="px-4 md:px-6 py-4"
    style={{ borderTop: `4px solid ${roleColor}`, backgroundColor: "#1A1A2E" }}>
    {/* Quick action buttons */}
    <div className="flex items-center gap-2 mb-3">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border-[2px] text-[9px] font-bold uppercase tracking-wider"
            style={{ borderColor: `${color}44`, color: color }}>
            <i className="fa-duotone fa-regular fa-paperclip text-[10px]"></i>
            Attach
        </button>
    </div>
    {/* Input + send */}
    <div className="flex items-center gap-3">
        <input className="w-full px-4 py-3 border-[3px] text-sm font-bold tracking-wider"
            style={{ borderColor: hasText ? roleColor : "#2D2D44", backgroundColor: "rgba(255,255,255,0.03)", color: "#FFFFFF" }} />
        <button className="w-12 h-12 flex items-center justify-center border-[3px]"
            style={{ borderColor: roleColor, backgroundColor: hasText ? roleColor : "transparent" }}>
            <i className="fa-duotone fa-regular fa-paper-plane-top text-lg"></i>
        </button>
    </div>
</div>
```

## Common Violations
- Using DaisyUI `chat-bubble` components
- Rounded avatars instead of square initials boxes
- Missing role-based color coding on all elements
- Gradients on message bubbles instead of flat tinted backgrounds
- Missing corner accent blocks on message bubbles
- No active indicator bar on selected conversation
- Missing role icon badge on avatars
- Send button not dynamically changing fill based on input state
- Missing quick action buttons in compose area

## Reference
Showcase: `apps/corporate/src/app/showcase/messages/six/page.tsx`
