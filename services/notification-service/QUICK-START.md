# Quick Start Guide - New Email Templates

## What Changed?

Your notification service now sends **professional, branded HTML emails** instead of plain text. The emails match your Splits Network portal design with proper styling, structure, and rich content.

## See It In Action

### 1. Preview the Templates

Generate HTML previews to see what the emails look like:

```bash
cd services/notification-service
pnpm preview:emails
```

Then open `email-previews/index.html` in your browser to browse all templates.

### 2. Test with Real Emails

The templates are already integrated! When you trigger any of these events, you'll see the new design:

**Application Events:**
- Create a new application → Sends professional "New Application" email
- Change application stage → Sends "Stage Changed" update
- Accept an application → Sends celebration email

**Placement Events:**
- Create a placement → Sends "Placement Confirmed" with fee breakdown
- Activate placement → Sends "Placement Started" notification
- Complete placement → Sends success celebration
- Guarantee expiring → Sends reminder countdown

### 3. Make Changes

All templates are in `services/notification-service/src/templates/`

**To modify an existing template:**
1. Edit the template function in `templates/applications/` or `templates/placements/`
2. Regenerate previews: `pnpm preview:emails`
3. Check your changes in the HTML preview

**To add a new template:**
```typescript
// In templates/applications/index.ts
export function myNewEmail(data: MyData): string {
    const content = `
        ${heading({ level: 1, text: 'My Title', icon: '🎉' })}
        ${paragraph('My content here...')}
        ${button({ href: data.url, text: 'Click Me' })}
    `;
    
    return baseEmailTemplate({ content });
}
```

## Component Library

Use these pre-built components in any template:

```typescript
import { 
    heading,      // H1, H2, H3 with icons
    paragraph,    // Formatted text
    button,       // CTA buttons (primary, secondary, accent)
    infoCard,     // Structured data table
    alert,        // Info/success/warning/error boxes
    badge,        // Status indicators
    list,         // Bullet lists
    divider,      // Section separators
} from '../components';
```

## Brand Colors

The templates use your exact brand colors:
- **Primary**: `#233876` (deep indigo)
- **Secondary**: `#0f9d8a` (teal)
- **Accent**: `#60a5fa` (electric blue)

## Need Help?

- **Full Documentation**: See `TEMPLATES.md`
- **Implementation Guide**: See `EMAIL-TEMPLATES-IMPLEMENTATION.md`
- **Service README**: See `README.md`

## Example: Before & After

### Before
![Plain text email from 1992](attachment:screenshot)

### After
- ✅ Branded Splits Network header
- ✅ Professional typography and spacing
- ✅ Rich content with structured info cards
- ✅ Clear call-to-action buttons
- ✅ Professional footer with links
- ✅ Responsive design for mobile

## Next Steps

1. **Preview**: Run `pnpm preview:emails` to see all templates
2. **Test**: Trigger an event to receive a real email
3. **Customize**: Modify templates to match your exact needs
4. **Extend**: Add new templates for other events

---

**Note**: The new templates are already integrated into your `ApplicationsEmailService` and `PlacementsEmailService`. No code changes needed to start using them!
