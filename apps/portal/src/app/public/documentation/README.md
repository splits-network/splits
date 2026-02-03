# Documentation UX Guide (Public)

This README defines the information architecture, content standards, and UX requirements for the public documentation section of the Splits Network portal. The audience is recruiters, hiring managers, and company admins who use the platform day-to-day. Content should be clear, factual, and task-focused. No hype.

## Goals

- Help users complete common tasks quickly.
- Explain why a feature exists and when to use it.
- Provide troubleshooting guidance by symptom.
- Keep role-based permissions and visibility explicit.

## Audience And Roles

Primary roles seen in the portal:

- Recruiter
- Hiring Manager
- Company Admin
- Platform Admin (internal but referenced where relevant)

Docs should be written for recruiters, hiring managers, and company admins. If a section is platform-admin-only, call that out clearly and keep it brief.

## Portal Map (Source Of Truth)

Navigation is role-based. Use these labels and groupings in documentation to match the UI.

| Section | Page | Who Sees It |
| --- | --- | --- |
| Main | Dashboard | All users |
| Management | Roles | All users |
| Management | Invitations | Recruiter |
| Management | Candidates | Recruiter, Platform Admin |
| Management | Applications | Recruiter, Hiring Manager, Company Admin |
| Management | Messages | Recruiter, Hiring Manager, Company Admin |
| Management | Placements | Recruiter, Platform Admin |
| Settings | Profile | Recruiter, Hiring Manager, Company Admin |
| Settings | Billing | All users |
| Settings | Company Settings | Hiring Manager, Company Admin |
| Settings | Team | Hiring Manager, Company Admin |
| Platform | Admin Dashboard | Platform Admin |

Also accessible outside the sidebar:

- Notifications (bell icon)
- Onboarding wizard
- Accept Invitation flow

## Recommended Documentation Structure

Use a two-level structure: sections and pages. Keep pages short and task-oriented.

Top-level sections:

- Getting Started
- Roles And Permissions
- Core Workflows
- Feature Guides
- Troubleshooting
- Reference

Suggested pages by section:

Getting Started:

- What Is Splits Network (purpose, who it is for)
- First-Time Setup (account, org connection, onboarding)
- Navigation Overview (dashboard, management, settings)

Roles And Permissions:

- Recruiter Capabilities
- Hiring Manager Capabilities
- Company Admin Capabilities
- How Role-Based Access Works

Core Workflows:

- Create And Publish A Role
- Invite Recruiters Or Teammates
- Add Or Import Candidates
- Submit A Candidate For A Role
- Review Applications And Move Stages
- Communicate With Recruiters And Candidates
- Mark A Hire And Understand Placement Tracking

Feature Guides (map directly to portal pages):

- Dashboard
- Roles
- Candidates
- Applications
- Invitations
- Messages
- Placements
- Profile
- Billing
- Company Settings
- Team Management
- Notifications
- Integrations (coming soon)

Troubleshooting:

- Can’t Access The Portal
- I Don’t See My Company Or Team
- I Can’t Create Or Edit A Role
- My Candidate Is Missing Or Masked
- I Can’t Move An Application Stage
- I Can’t Upload Or View Documents
- Billing Or Subscription Issues
- Messages Not Showing Or Unread Count Wrong

Reference:

- Application Stages (plain-language labels)
- Role Statuses (Active, Paused, Filled, Closed)
- Employment Types (Full Time, Contract, Temporary)
- Guarantee Period (what it means)
- Fee Percentage And Commission
- Document Types (Resume, Offer Letter, NDA, etc.)
- Glossary (key terms used across the platform)

## Page Template (Use On Every Doc Page)

Each documentation page should follow this order and reuse section labels exactly.

- Purpose (1-2 sentences on what this page helps you do)
- Who This Is For (list roles)
- Prerequisites (accounts, permissions, required data)
- Steps (numbered, short, action-oriented)
- What Happens Next (system behavior and expected outcomes)
- Tips (optional)
- Troubleshooting (3-6 symptom-based bullets)
- Related Pages (2-5 links)
- Reference (optional mini-glossary or key definitions for this page)

## Writing And UX Rules

- Use the same labels users see in the UI.
- Avoid internal code names and developer terms.
- Explain outcomes, not just clicks.
- Assume users have limited time and are mid-task.
- Prefer short sections, tables, and checklists.
- Keep verbs active and sentences short.
- Don’t over-promise. Be precise about what the system does.

## UX Requirements For The Documentation Section

Content organization:

- Left-side navigation with section grouping.
- Search bar that supports partial matches and common synonyms.
- Breadcrumbs for context.
- On-page table of contents for long guides.

Page components:

- Role badges (Recruiter, Hiring Manager, Company Admin) at the top.
- Callouts for permissions, approvals, or visibility constraints.
- “Common issues” block near the bottom of each page.
- Cross-links to the next logical task.
- Lightweight glossary callout when a page introduces new terms.

Behavior:

- All pages must be readable without authentication (public).
- Links to product pages should be clear about required login.
- Avoid dead-ends: every page should link to at least 2 related pages.

## Feature Notes To Reflect In Docs

Roles:

- Users can browse roles or manage their own, depending on view mode.
- Role statuses include Active, Paused, Filled, Closed.
- Role creation includes compensation, fee percentage, guarantee period, and employment type.

Candidates:

- Recruiters can manage candidates or browse the marketplace.
- Candidate visibility may be masked before company acceptance.
- Verification status exists (unverified, pending, verified, rejected).

Applications:

- Applications move through stages (screen, interview, offer, hired, rejected).
- Users can add notes, upload documents, and review pre-screen answers.
- Some actions are permission-gated by role and organization.

Invitations:

- Used to invite candidates or collaborators.
- Track invitation status in list or browse views.

Messages:

- Conversations include recruiters and company users.
- Unread counts appear in the sidebar.

Placements:

- Placements track hire outcomes and recruiter earnings.
- Pages show fee percentage, total fee, and recruiter share.

Billing:

- Billing controls subscription and payment methods.

Company Settings And Team:

- Company settings are organization-scoped.
- Team management requires company admin permissions.

## Troubleshooting Design Patterns

When writing troubleshooting sections, use this format:

- Symptom: Short user statement.
- Likely cause: One sentence.
- Fix: 1-3 steps.

Examples to cover:

- “I don’t see my company” -> Organization not linked or missing permissions.
- “I can’t add a role” -> You don’t have company admin access or no organization is linked.
- “I can’t view a candidate” -> Application not yet accepted or candidate is masked.
- “I can’t move an application stage” -> Stage change restricted to specific roles or missing required notes.
- “Uploads fail” -> File type or size not allowed, or missing permissions.

## Next Steps

1. Start with Getting Started pages (MVP).
2. Add Integrations page stub labeled “Coming soon.”
3. Draft the first 3-5 guides using the template above.

---

Last updated: February 3, 2026
