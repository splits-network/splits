# Markdown Editor Rollout (Portal + Candidate)

Status: Draft
Owner: TBD
Last updated: 2026-01-31

## Decision summary
- Editor: @uiw/react-md-editor (Markdown + preview, toolbar, non-WYSIWYG)
- Storage: Markdown strings only (no HTML stored)
- Rendering: react-markdown + remark-gfm + rehype-sanitize
- Scope: All user-editable textareas in Portal and Candidate apps

## Goals
- Provide a consistent, low-risk Markdown authoring experience with a toolbar.
- Support non-technical users (toolbar + preview) while allowing technical users to type Markdown directly.
- Eliminate custom, unsafe markdown parsing (dangerouslySetInnerHTML).
- Keep data model unchanged (strings in existing fields).

## Non-goals
- Full WYSIWYG rich text editor.
- Images, embeds, or custom HTML.
- Storing HTML in the database.

## Feature set (initial)
- Bold, italic
- Bulleted + numbered lists
- Links
- Inline code + code block
- Headings

## Shared implementation approach

### 1) Shared editor wrapper
Create a shared component so both apps use the same toolbar + preview configuration.

Recommended location (choose one):
- New package: packages/shared-ui/src/markdown/MarkdownEditor.tsx
- Or app-level: apps/portal/src/components/markdown/MarkdownEditor.tsx and mirror in candidate

Key responsibilities:
- Wrap @uiw/react-md-editor with a consistent toolbar config.
- Provide a common interface: value, onChange, placeholder, label, helperText, maxLength, height/rows.
- Optionally enforce a max length.
- Optional: provide a minimal inline toolbar preset for small fields.

### 2) Shared markdown renderer
Replace existing regex renderers with a single shared renderer that is safe.

Recommended approach:
- react-markdown + remark-gfm + rehype-sanitize
- Explicitly configure allowed elements/attributes (links, lists, headings, code)
- Disallow raw HTML entirely

Recommended location (choose one):
- New package: packages/shared-ui/src/markdown/MarkdownRenderer.tsx
- Or app-level renderer in each app, using the same config

### 3) Preview rendering
Ensure the editor preview uses the same renderer pipeline so preview == display.

Implementation note:
- @uiw/react-md-editor supports a custom preview renderer. Wire it to the shared MarkdownRenderer.

## Security notes
- Do not allow raw HTML from markdown input.
- Always sanitize when rendering markdown for display.
- Ensure link URLs are safe (consider a link transform that rejects javascript:).

## Migration strategy
- No database migrations expected (fields already store strings).
- Update UI components only.
- Replace existing MarkdownRenderer implementations and custom inline parsing.

## Tasks

### Phase 0 - Planning and decisions
- [ ] Confirm initial feature set for toolbar (bold, italic, list, link, code, headings) - approved
- [ ] Decide shared component location (package vs app-level)

### Phase 1 - Shared components
- [ ] Add @uiw/react-md-editor to workspace dependencies
- [ ] Add react-markdown, remark-gfm, rehype-sanitize
- [ ] Create shared MarkdownEditor wrapper (toolbar config + props)
- [ ] Create shared MarkdownRenderer (safe render pipeline)
- [ ] Ensure preview uses MarkdownRenderer

### Phase 2 - Replace existing markdown rendering
- [ ] Replace apps/candidate/src/components/markdown-renderer.tsx usage
- [ ] Replace apps/portal/src/components/markdown-renderer.tsx usage
- [ ] Replace any ad-hoc markdown parsing in marketplace settings and recruiter profile

Known locations (non-exhaustive):
- apps/portal/src/app/portal/profile/components/marketplace-settings.tsx
- apps/candidate/src/app/public/marketplace/[id]/recruiter-detail-client.tsx
- apps/candidate/src/app/public/jobs/[id]/components/job-detail-client.tsx
- apps/portal/src/app/portal/roles/[id]/components/role-details-tabs.tsx
- apps/portal/src/app/portal/candidates/components/browse/detail-bio.tsx

### Phase 3 - Replace textareas with MarkdownEditor

Portal app
- [ ] apps/portal/src/components/unified-proposal-card.tsx
- [ ] apps/portal/src/components/onboarding/steps/company-info-step.tsx
- [ ] apps/portal/src/components/onboarding/steps/recruiter-profile-step.tsx
- [ ] apps/portal/src/app/public/status/status-client.tsx
- [ ] apps/portal/src/app/portal/messages/components/thread-panel.tsx
- [ ] apps/portal/src/app/portal/profile/components/marketplace-settings.tsx
- [ ] apps/portal/src/app/portal/roles/components/wizard-steps/step-3-descriptions.tsx
- [ ] apps/portal/src/app/portal/roles/components/browse/wizard-steps/step-3-descriptions.tsx
- [ ] apps/portal/src/app/portal/roles/[id]/components/submit-candidate-wizard.tsx
- [ ] apps/portal/src/app/portal/roles/[id]/components/submit-candidate-modal.tsx
- [ ] apps/portal/src/app/portal/roles/[id]/components/pre-screen-request-modal.tsx
- [ ] apps/portal/src/app/portal/applications/[id]/components/add-note-modal.tsx
- [ ] apps/portal/src/app/portal/applications/[id]/components/stage-update-modal.tsx
- [ ] apps/portal/src/app/portal/applications/components/request-info-modal.tsx
- [ ] apps/portal/src/app/portal/applications/components/provide-info-modal.tsx
- [ ] apps/portal/src/app/portal/applications/components/deny-gate-modal.tsx
- [ ] apps/portal/src/app/portal/applications/components/bulk-action-modal.tsx
- [ ] apps/portal/src/app/portal/applications/components/approve-gate-modal.tsx
- [ ] apps/portal/src/app/portal/candidates/[id]/components/verification-modal.tsx
- [ ] apps/portal/src/app/portal/candidates/[id]/components/submit-to-job-wizard.tsx
- [ ] apps/portal/src/app/portal/candidates/[id]/components/submit-to-job-modal.tsx
- [ ] apps/portal/src/app/portal/candidates/[id]/components/propose-job-modal.tsx
- [ ] apps/portal/src/app/portal/candidates/[id]/propose/components/propose-job-client.tsx
- [ ] apps/portal/src/app/portal/company/settings/components/settings-form.tsx
- [ ] apps/portal/src/app/portal/admin/payouts/escrow/components/release-modal.tsx

Candidate app
- [ ] apps/candidate/src/components/application-wizard/step-questions.tsx
- [ ] apps/candidate/src/components/onboarding/steps/contact-step.tsx
- [ ] apps/candidate/src/app/public/status/status-client.tsx
- [ ] apps/candidate/src/app/public/contact/page.tsx
- [ ] apps/candidate/src/app/portal/profile/page.tsx
- [ ] apps/candidate/src/app/portal/invitation/[token]/invitation-client.tsx
- [ ] apps/candidate/src/app/public/marketplace/[id]/recruiter-detail-client.tsx
- [ ] apps/candidate/src/app/portal/messages/components/thread-panel.tsx
- [ ] apps/candidate/src/app/portal/applications/[id]/components/decline-modal.tsx
- [ ] apps/candidate/src/app/portal/applications/[id]/components/proposal-actions.tsx
- [ ] apps/candidate/src/app/portal/applications/[id]/components/wizard-steps/answer-questions-step.tsx
- [ ] apps/candidate/src/app/portal/applications/[id]/components/wizard-steps/add-notes-step.tsx

### Phase 4 - QA + consistency
- [ ] Validate Markdown is rendered consistently in preview and display
- [ ] Verify list, link, and emphasis rendering
- [ ] Confirm copy/paste behaviors for external content
- [ ] Confirm no HTML is stored
- [ ] Sanity check for XSS (links, script tags, HTML blocks)

## Open questions
- Should there be a simplified toolbar preset for short inputs?

## Rollout suggestion
- Pilot on recruiter bio (portal marketplace settings) + job descriptions.
- Validate rendering in candidate-facing job detail and marketplace pages.
- Expand to remaining textareas in staged passes.
