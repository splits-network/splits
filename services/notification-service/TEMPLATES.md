# Professional Email Templates - Splits Network

## Overview

We've implemented a comprehensive professional email template system that matches the Splits Network brand identity. All transactional emails now feature:

- **Brand-consistent design** matching the portal's color scheme
- **Professional HTML layouts** with proper email client compatibility
- **Rich, informative content** instead of plain text notifications
- **Responsive design** that works on desktop and mobile email clients
- **Reusable components** for consistent UI elements

## Template Structure

### Base Template (`templates/base.ts`)

The foundation for all emails with:
- Branded header with Splits Network logo and tagline
- Clean content area with proper spacing
- Professional footer with links and copyright
- Email client optimizations (Outlook, Gmail, Apple Mail)

### Components (`templates/components.ts`)

Reusable UI elements:
- **Buttons**: Primary, secondary, and accent variants
- **Info Cards**: Tabular data display with highlighting
- **Alerts**: Info, success, warning, and error messages
- **Headings**: H1, H2, H3 with consistent styling
- **Badges**: Colored status indicators
- **Dividers**: Section separators
- **Lists**: Formatted bullet lists

### Domain Templates

#### Application Templates (`templates/applications/`)
- Application created notifications
- Stage change updates
- Application accepted/rejected
- Pre-screen requests

#### Placement Templates (`templates/placements/`)
- Placement confirmation
- Placement activated
- Placement completed
- Placement failed
- Guarantee expiring reminders

## Brand Colors

Matching the portal theme:
- **Primary**: `#233876` (deep indigo)
- **Secondary**: `#0f9d8a` (teal)
- **Accent**: `#60a5fa` (electric blue)
- **Success**: `#16a34a`
- **Warning**: `#eab308`
- **Error**: `#dc2626`

## Usage Example

```typescript
import { applicationCreatedEmail } from './templates/applications';

const html = applicationCreatedEmail({
    candidateName: 'John Doe',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/123',
    recruiterName: 'Jane Smith',
});

// Send via Resend
await resend.emails.send({
    from: 'noreply@updates.splits.network',
    to: 'recruiter@example.com',
    subject: 'New Candidate Application to Review: John Doe',
    html,
});
```

## Updated Services

### ApplicationsEmailService
- ✅ `sendRecruiterApplicationPending` - Professional review notification
- ✅ `sendApplicationStageChanged` - Rich stage update with context
- ✅ `sendApplicationAccepted` - Celebration email with next steps

### PlacementsEmailService
- ✅ `sendPlacementCreated` - Congratulatory email with fee breakdown
- ✅ `sendPlacementActivated` - Start date notification with guarantee info
- ✅ `sendPlacementCompleted` - Success celebration email
- ✅ `sendPlacementFailed` - Professional failure notification
- ✅ `sendGuaranteeExpiring` - Reminder with countdown

## Next Steps

Consider extending templates to other services:
- **Invitations**: Team invitations, role assignments
- **Candidates**: Application confirmations, status updates
- **Proposals**: Split proposal notifications
- **Collaboration**: Team collaboration messages

## Testing

To test the new templates locally:

1. Start the notification service:
   ```bash
   pnpm --filter notification-service dev
   ```

2. Trigger an event that sends an email (e.g., create an application)

3. Check the Resend dashboard for the sent email preview

## Maintenance

- Update brand colors in `templates/base.ts` if the portal theme changes
- Add new components to `templates/components.ts` as needed
- Keep templates in sync with portal design updates
- Test emails across major email clients (Gmail, Outlook, Apple Mail)

---

**Created**: December 20, 2024  
**Version**: 1.0.0
