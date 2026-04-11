# Content Management (CMS)

## Current State

**Routes:** `/secure/content/pages`, `/secure/content/images`, `/secure/content/navigation`

### Pages (Well-Built)
- **Page list** with stats cards (total, published, draft), search, filters (app, status, type)
- **Create Page** modal with title, slug (auto-generated), app, page_type, description
- **Import JSON** for bulk page creation
- **Delete pages** with confirmation
- **Page editor** (`/secure/content/pages/{id}`) - comprehensive block editor:
  - **Left panel:** Block list with drag-to-reorder, add block, edit/delete per block
  - **Center:** Live preview pane with desktop/mobile toggle (renders via BaselArticleRenderer)
  - **Right:** Page settings (title, slug, description, OG image, type, author, read time, app, tags)
  - **Block types (12):** Hero, Article Body, Benefits Cards, CTA, FAQ, Feature Grid, Full Bleed Image, Inline Image, Pull Quote, Split Editorial, Stats Bar, Timeline
  - **Block picker** modal with type selection -> dynamic block form
  - **Publish/Unpublish** toggle, Save, Discard Changes, unsaved changes indicator

### Images (Well-Built)
- **Grid view** with stats, search, MIME type filter
- **Upload modal** - File upload (max 10MB), alt text, tags, preview
- **Image detail modal** - Full preview, edit alt text/tags, delete
- **Copy URL** on hover for quick sharing

### Navigation (Well-Built)
- **App selector** tabs (Portal, Candidate, Corporate)
- **Location selector** (Header, Footer)
- **Header nav editor** - Items with label, href, sub-items, drag-to-reorder, add/delete
- **Footer nav editor** - 4 sections: Link Sections, Social Links, Trust Stats, Legal Links
- **Import/Export** JSON config, Download Schema
- **Unsaved changes** warning modal

### What's Missing

#### Important (Phase Priority: Medium) - *Most critical CMS features already exist*
- **Page versioning** - Save versions, revert to previous versions
- **Content scheduling** - Schedule content to go live/expire at specific dates
- **Multi-step review** - Draft -> Review -> Published with approval workflow

#### Important (Phase Priority: Medium)
- **Page templates** - Create page from template (landing page, about page, etc.)
- **Content scheduling** - Schedule content to go live/expire at specific dates
- **Global content blocks** - Reusable blocks shared across pages (e.g., CTA that appears everywhere)
- **Media management** - Better media library with folders, tags, search, bulk upload
- **Image optimization** - Auto-resize, format conversion, CDN purge
- **URL/slug management** - Custom URLs, redirects
- **Content search** - Full-text search across all page content
- **Content analytics** - Page views, time on page, bounce rate per content page
- **Blog/article management** - If the platform has a blog, manage posts, categories, authors

#### Nice to Have
- **Visual A/B testing** - Create variant pages and split traffic
- **Content localization** - Multi-language content management
- **Content approval workflow** - Multi-step approval with roles
- **Broken link checker** - Scan for broken internal/external links
- **Content calendar** - Visual calendar of scheduled content

## Implementation Notes
- The page builder is already well-built with many block types
- Publishing workflow needs: draft (save without publishing), preview (view as published), publish
- Page versioning should store full page JSON snapshots
- Multi-site should use a site selector dropdown in the content editor
- SEO metadata should follow the existing SEO patterns in the corporate app
