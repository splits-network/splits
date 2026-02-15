# extract-from-headers

Extract reusable components from the headers showcase page.

## Available Components

1. **DesktopHeader** - Full desktop navigation with top bar, logo, nav, search, notifications, CTAs, user menu
2. **MobileHeader** - Compact mobile navigation with hamburger toggle and expandable menu
3. **HeaderLogo** - Square logo box with accent dot and brand text
4. **TopUtilityBar** - Slim bar with colored utility links
5. **NavItem** - Single navigation button with icon and optional dropdown indicator
6. **NavDropdown** - Expanded dropdown panel with icon-labeled links
7. **NavDropdownItem** - Single dropdown link with icon box, label, and description
8. **HeaderSearchToggle** - Search button that toggles inline search input dropdown
9. **NotificationBell** - Bell icon button with count badge
10. **HeaderCta** - CTA button (primary filled or secondary outline)
11. **UserMenu** - Logged-in user initials avatar with chevron
12. **MobileMenuToggle** - Hamburger/X toggle button
13. **MobileAccordionNav** - Mobile expandable nav with nested items
14. **MobileNavItem** - Single mobile nav item with expand/collapse
15. **HeaderMemphisDecorations** - Background geometric shapes for header

## Component Details

### DesktopHeader
```tsx
interface DesktopHeaderProps {
    navItems: { label: string; icon: string; color: string; hasDropdown: boolean }[];
    borderColor?: string; // bottom border color, default coral
}
// Two-row layout: top utility bar + main nav bar
// backgroundColor: navy, borderBottom: 5px solid borderColor
// Contains: Logo, NavItems, SearchToggle, NotificationBell, CTAs, UserMenu
```

### MobileHeader
```tsx
interface MobileHeaderProps {
    navItems: { label: string; icon: string; color: string; hasDropdown: boolean }[];
    borderColor?: string; // default teal
}
// Single row with logo + action buttons, expandable menu below
// Hamburger toggles menu open/closed
// Menu: accordion nav items + CTA buttons at bottom
```

### HeaderLogo
```tsx
interface HeaderLogoProps {
    size?: "sm" | "md"; // sm for mobile, md for desktop
}
// Square box (w-9/w-11 h-9/h-11 border-[3px]) with "S" in white,
// coral bg and border, small teal dot (absolute -top-1 -right-1),
// "Splits" in bold white + "Network" in coral below
```

### NavItem
```tsx
interface NavItemProps {
    label: string;
    icon: string;
    color: string;
    isActive: boolean;
    hasDropdown: boolean;
    onClick?: () => void;
}
// border-[3px], px-3.5 py-2, text-xs font-black uppercase tracking-[0.12em]
// Active: colored border + tinted bg + colored text
// Inactive: transparent border + white text
// Icon always in accent color, chevron-down when hasDropdown
```

### NavDropdown
```tsx
interface NavDropdownProps {
    items: { icon: string; label: string; desc: string; color: string }[];
    accentColor: string;
}
// Absolute positioned, w-[340px], border-[4px] in accentColor,
// navy bg, section header in accent color,
// items with hover translate-x-1 and border-left highlight,
// colored bottom bar (h-1)
```

### HeaderSearchToggle
```tsx
interface HeaderSearchToggleProps {
    isOpen: boolean;
    onToggle: () => void;
}
// w-10 h-10 border-[3px], toggles between magnifying-glass and xmark,
// When open: teal border + teal text, dropdown with border-[3px] input
// Input: uppercase placeholder, dark bg, teal border
```

### NotificationBell
```tsx
interface NotificationBellProps {
    count: number;
}
// w-10 h-10 border-[3px] darkGray, bell icon,
// count badge: absolute -top-1 -right-1 w-4 h-4 (w-3.5 on mobile),
// coral bg, tiny font-black text
```

### HeaderCta
```tsx
interface HeaderCtaProps {
    label: string;
    icon: string;
    color: string;
    variant: "primary" | "secondary";
    href: string;
}
// Primary: border-[3px] + filled bg + white text
// Secondary: border-[3px] + transparent bg + colored text
// Both: font-black uppercase tracking-[0.12em], hover:-translate-y-0.5
```

### MobileAccordionNav
```tsx
interface MobileAccordionNavProps {
    items: { label: string; icon: string; color: string; hasDropdown: boolean; subItems?: { icon: string; label: string }[] }[];
}
// Each item: border-[2px], expand/collapse toggle with chevron,
// Sub-items: ml-4, border-left: 2px solid color,
// CTAs at bottom separated by border-top: 3px solid darkGray
```

## Dependencies
- `DesktopHeader` composes `HeaderLogo`, `NavItem`, `NavDropdown`, `HeaderSearchToggle`, `NotificationBell`, `HeaderCta`, `UserMenu`
- `MobileHeader` composes `HeaderLogo`, `MobileMenuToggle`, `MobileAccordionNav`, `HeaderCta`
- `NavDropdown` renders multiple `NavDropdownItem` components
- `HeaderMemphisDecorations` is used inside both desktop and mobile headers
- GSAP animations on mount: bounce for header entrance, elastic for decorations, staggered nav items
- Animation constants used: D (durations), E (easing), S (stagger)

## Reference
Source: `.claude/memphis/showcase/headers-six.tsx`
Target: `packages/memphis-ui/src/components/`
