# Firm Editorial Copy Guide

Reference for all firm card and firm profile copy across portal and candidate apps.

---

## 1. Partnership Badge Labels

The two boolean fields `candidate_firm` and `company_firm` describe what side of the split a firm operates on. These replace the old `seeking_split_partners` and `accepts_candidate_submissions` columns.

### Definitions

| Field            | Meaning                                                     | Old Column                      |
| ---------------- | ----------------------------------------------------------- | ------------------------------- |
| `candidate_firm` | This firm represents candidates. They have talent to place. | `seeking_split_partners`        |
| `company_firm`   | This firm represents companies. They have jobs to fill.     | `accepts_candidate_submissions` |

### Badge Copy (Short — Cards & Compact UI)

| Field            | Active Badge       | Inactive Badge |
| ---------------- | ------------------ | -------------- |
| `candidate_firm` | **Has Candidates** | _Not shown_    |
| `company_firm`   | **Has Jobs**       | _Not shown_    |

- Icon for `candidate_firm`: `fa-duotone fa-regular fa-user-tie`
- Icon for `company_firm`: `fa-duotone fa-regular fa-building`
- Active `candidate_firm` badge uses `badge-secondary` / `bg-secondary text-secondary-content`
- Active `company_firm` badge uses `badge-primary` / `bg-primary text-primary-content`
- Inactive badges are not rendered on cards. Cards only show what the firm does, not what it doesn't do.

### Profile Hero Copy (Inline — Header Row)

These appear in the hero header kicker row, right-aligned, as compact status indicators.

| Field            | Active             | Inactive    |
| ---------------- | ------------------ | ----------- |
| `candidate_firm` | **Candidate Firm** | _Not shown_ |
| `company_firm`   | **Company Firm**   | _Not shown_ |

- Icon for `candidate_firm`: `fa-duotone fa-regular fa-user-tie`
- Icon for `company_firm`: `fa-duotone fa-regular fa-building`
- Active `candidate_firm` uses `text-secondary`
- Active `company_firm` uses `text-primary`

### Profile Section Copy (Long — About Panel Partnership Block)

Full badge treatment with both active and inactive states visible so recruiters can see what the firm does and doesn't do.

| Field            | Active                    | Inactive                          |
| ---------------- | ------------------------- | --------------------------------- |
| `candidate_firm` | **Represents Candidates** | **Does Not Represent Candidates** |
| `company_firm`   | **Represents Companies**  | **Does Not Represent Companies**  |

- Active badges: filled semantic color (`bg-primary text-primary-content` / `bg-secondary text-secondary-content`)
- Inactive badges: muted ghost (`bg-base-200 border border-base-300 text-base-content/30`)

### Candidate App Context

When candidates see firm cards or profiles, the language shifts slightly to be candidate-facing.

| Field            | Active Badge (Card)        | Active Badge (Profile)     |
| ---------------- | -------------------------- | -------------------------- |
| `candidate_firm` | **Represents Talent**      | **Represents Talent**      |
| `company_firm`   | **Direct Employer Access** | **Direct Employer Access** |

---

## 2. Card Kicker Labels

The kicker sits above the firm name in `text-xs font-bold uppercase tracking-[0.2em] text-primary`.

### Portal Context

Use a static kicker. Do not vary by `candidate_firm` / `company_firm` status.

**Kicker text:** `RECRUITING FIRM`

Rationale: Every entity in the directory is a recruiting firm. The partnership badges already communicate their orientation. The kicker provides categorical context, not status.

### Candidate Context

**Kicker text:** `RECRUITING FIRM`

Same label. Candidates interact with firms as firms regardless of orientation.

---

## 3. Section Headers (Profile Page)

All section headers use the editorial kicker pattern:
`text-xs font-bold uppercase tracking-[0.22em] text-base-content/30`

| Section                       | Kicker Text           | Notes                              |
| ----------------------------- | --------------------- | ---------------------------------- |
| About                         | `ABOUT {FIRM_NAME}`   | Dynamic — includes firm name       |
| Specialties — Industries      | `INDUSTRIES`          | Sub-section within Specialties tab |
| Specialties — Skills          | `SPECIALTIES`         | Sub-section within Specialties tab |
| Specialties — Placement Types | `PLACEMENT TYPES`     | Sub-section within Specialties tab |
| Specialties — Geography       | `GEOGRAPHIC FOCUS`    | Sub-section within Specialties tab |
| Team                          | `TEAM MEMBERS`        |                                    |
| Reviews                       | `CLIENT TESTIMONIALS` | Placeholder until feature ships    |
| Milestones                    | `MILESTONES`          | Sidebar card header                |
| Markets Served                | `MARKETS SERVED`      | Sidebar card header                |
| Contact                       | `CONTACT`             | Sidebar card header                |
| Recent Placements             | `RECENT PLACEMENTS`   | About tab, below description       |
| Partnership                   | `PARTNERSHIP`         | About tab or card section          |

### Tab Labels

| Tab Key       | Label       | Icon                                |
| ------------- | ----------- | ----------------------------------- |
| `about`       | About       | `fa-duotone fa-regular fa-building` |
| `specialties` | Specialties | `fa-duotone fa-regular fa-bullseye` |
| `team`        | Team        | `fa-duotone fa-regular fa-users`    |
| `reviews`     | Reviews     | `fa-duotone fa-regular fa-star`     |

---

## 4. Empty States

Follow the pattern: **[What's missing]. [What to do or what to expect.]**

Use `text-base text-base-content/40 italic` for empty state text.

| Section                 | Copy                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| No description          | This firm hasn't added a description yet.                               |
| No specialties          | No specialties listed. Check back as the firm builds out their profile. |
| No team members visible | Team members are not publicly visible for this firm.                    |
| No recent placements    | No recent placements to show.                                           |
| No industries           | No industries specified.                                                |
| No placement types      | No placement types listed.                                              |
| No geographic focus     | No geographic focus specified.                                          |
| Reviews coming soon     | Reviews are coming soon.                                                |
| Milestones coming soon  | Milestones are coming soon.                                             |
| No contact info         | Contact information is not publicly available for this firm.            |

---

## 5. CTA Button Labels

All CTAs use `font-bold uppercase tracking-wider`. Action verb first, max 3 words.

### Firm Card Footer

| Context                       | Primary CTA   | Style                 |
| ----------------------------- | ------------- | --------------------- |
| Portal (recruiter viewing)    | **View Firm** | `btn btn-sm btn-link` |
| Candidate (candidate viewing) | **View Firm** | `btn btn-sm btn-link` |

The card itself is clickable. The link CTA is a secondary affordance.

### Firm Profile Hero

| Context                       | Primary CTA             | Secondary CTAs          |
| ----------------------------- | ----------------------- | ----------------------- |
| Portal (recruiter viewing)    | **Request Partnership** | **Website** / **Share** |
| Candidate (candidate viewing) | **Submit Resume**       | **Website** / **Share** |

### Firm Profile Sidebar

| Context   | CTA                     | Style                           |
| --------- | ----------------------- | ------------------------------- |
| Portal    | **Request Partnership** | `btn btn-primary btn-sm w-full` |
| Candidate | **Submit Resume**       | `btn btn-primary btn-sm w-full` |

### CTA Icons

| CTA                 | Icon                                                  |
| ------------------- | ----------------------------------------------------- |
| Request Partnership | `fa-duotone fa-regular fa-handshake`                  |
| Submit Resume       | `fa-duotone fa-regular fa-paper-plane`                |
| Website             | `fa-duotone fa-regular fa-arrow-up-right-from-square` |
| Share               | `fa-duotone fa-regular fa-share-nodes`                |
| View Firm           | `fa-duotone fa-regular fa-arrow-up-right-from-square` |

---

## 6. Filter Labels

For the firm directory filters and header stats.

### Filter Options

| Field                   | Filter Label       | Filter Description                                       |
| ----------------------- | ------------------ | -------------------------------------------------------- |
| `candidate_firm = true` | **Has Candidates** | Firms that represent candidates and have talent to place |
| `company_firm = true`   | **Has Jobs**       | Firms that represent companies and have roles to fill    |

These appear as filter checkboxes or toggle badges in the directory sidebar/toolbar.

### Directory Header Stats

Stats bar above the directory grid, following the standard pattern of big number + short label.

| Stat                                  | Label               |
| ------------------------------------- | ------------------- |
| Total firms                           | **Firms**           |
| Firms with `candidate_firm = true`    | **With Candidates** |
| Firms with `company_firm = true`      | **With Jobs**       |
| Average team size or total recruiters | **Recruiters**      |

---

## 7. Stat Labels

### Card Stats Strip

Compact format. Labels should be short — one word preferred.

| Stat                  | Label      | Value Format      | Icon                                  |
| --------------------- | ---------- | ----------------- | ------------------------------------- |
| Team size range       | **Team**   | `10–25` (en-dash) | `fa-duotone fa-regular fa-users`      |
| Founded year          | **Est.**   | `2018`            | `fa-duotone fa-regular fa-calendar`   |
| Active member count   | **Active** | `12`              | `fa-duotone fa-regular fa-user-check` |
| Placement types count | **Types**  | `3`               | `fa-duotone fa-regular fa-briefcase`  |

### Profile Hero Stats Strip

Expanded format. Labels can be slightly longer.

| Stat                  | Label               | Value Format      | Icon                                  |
| --------------------- | ------------------- | ----------------- | ------------------------------------- |
| Team size range       | **Team Size**       | `10–25` (en-dash) | `fa-duotone fa-regular fa-users`      |
| Active member count   | **Active**          | `12`              | `fa-duotone fa-regular fa-user-check` |
| Founded year          | **Founded**         | `2018`            | `fa-duotone fa-regular fa-calendar`   |
| Placement types count | **Placement Types** | `3`               | `fa-duotone fa-regular fa-briefcase`  |

### Stat Display Rules

- Team size ranges use en-dash: `10–25` not `10-25`
- Founded year is a plain 4-digit number, no prefix in the stat block (the label provides context)
- In inline metadata (header row below firm name), use `Est. 2018` with prefix
- Active member count only renders when `showMemberCount = true`
- Stats use semantic icon color rotation: primary, secondary, accent, warning

---

## Formatting Reference

All copy in this guide assumes the Basel typographic system.

### Kicker

```
text-xs font-bold uppercase tracking-[0.18em] text-base-content/30
```

Profile sections use `tracking-[0.22em]`.

### Section Kicker (Sidebar Card Header)

```
text-xs font-bold uppercase tracking-[0.22em] text-base-content/40
```

### Badge (Partnership)

```
text-xs font-bold uppercase tracking-wider
```

Card badges: `flex items-center gap-2 px-3 py-1.5`
Profile badges: `flex items-center gap-2 px-4 py-2`

### Stat Value

```
Card: text-lg font-black text-base-content leading-none
Profile: text-xl font-black text-base-content leading-none
```

### Stat Label

```
text-xs font-bold uppercase tracking-[0.16em] text-base-content/30
```
