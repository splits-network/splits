# migrate-tables

Migrate a tables page to Memphis design.

## Page Type Characteristics
Table pages display structured data in rows and columns with rich interactivity. They feature:
- A **dark header** with badge and title
- A single **bordered table card** containing toolbar, table, and pagination
- **Toolbar** with search input, status filter, view toggle (dense/comfortable), column visibility menu, and export button
- **Bulk action bar** that appears when rows are selected
- **Sortable column headers** with sort direction indicators
- **Row selection** with checkboxes
- **Inline editing** for status fields
- **Score visualization** with mini progress bars
- **Row action buttons** (view, edit, delete)
- **Pagination** with page buttons and showing X-Y of Z text

## Key Components to Transform

### Table Card Container
- `border-4` with `borderColor: C.dark, backgroundColor: C.white`
- Contains: toolbar, bulk actions, table, pagination as stacked sections

### Toolbar
- `p-4 border-b-3 flex flex-wrap items-center gap-3` with `borderColor: C.cream`
- Search: composite `border-3` input with icon area in `C.cream`
- Status filter: `border-3` select with `backgroundColor: C.cream`
- View toggle: `border-3` button pair (comfortable/dense), active gets `C.dark` bg
- Column menu: `border-3` button + absolute dropdown with checkboxes
- Export: `border-3` button in `C.teal`

### Bulk Action Bar
- `px-4 py-3 flex items-center gap-3` with `backgroundColor: C.coral`
- Count: `text-xs font-black uppercase tracking-wider` in white
- Action buttons: `border-2` outline buttons in white (Email, Tag, Delete)
- Clear button: `text-xs font-bold uppercase` in white, right-aligned

### Table Header Row
- `backgroundColor: C.cream`
- Column headers: `text-[10px] font-black uppercase tracking-wider` in `C.dark`
- Sortable: `cursor-pointer` with sort icon (`fa-sort`, `fa-sort-up`, `fa-sort-down`)
- Sort icon color: `C.coral` when active, `rgba(26,26,46,0.2)` when inactive
- Checkbox column: `w-5 h-5 border-2` square checkbox

### Table Row
- `border-b-2` with `borderColor: C.cream`
- Selected row: `backgroundColor: rgba(255,107,107,0.05)`
- Cell padding: `px-4 py-3` (comfortable) or `px-4 py-2` (dense)
- Candidate name: `text-sm font-bold`
- Secondary text: `text-xs font-semibold, opacity: 0.7`
- Status badge: `px-2 py-0.5 text-[10px] font-black uppercase` with status-specific color
- Salary: `text-xs font-bold` in `C.teal`
- Date: `text-xs, opacity: 0.5`

### Row Checkbox
- `w-5 h-5 border-2` square
- Selected: `borderColor: C.coral, backgroundColor: C.coral` + white check
- Unselected: `borderColor: rgba(26,26,46,0.2), backgroundColor: transparent`

### Inline Status Edit
- Click status badge to edit: shows `<select>` + confirm button
- Select: `border-2 text-[10px] font-bold uppercase`
- Confirm: `w-5 h-5` button with `backgroundColor: C.teal` + check icon

### Score Cell
- Mini progress bar: `w-12 h-1.5 border` + inner fill
- Fill color: `C.teal` (>= 90), `C.yellow` (>= 75), `C.coral` (< 75)
- Numeric value: `text-xs font-bold` colored same as bar

### Row Actions
- `flex items-center gap-1`
- Each action: `w-6 h-6 border flex items-center justify-center`
- View: `C.teal`, Edit: `C.purple`, Delete: `C.coral`
- Icons at `text-[10px]`

### Pagination
- `px-4 py-4 border-t-3 flex items-center justify-between` with `borderColor: C.cream`
- Info text: `text-xs font-bold, opacity: 0.5`
- Page buttons: `w-8 h-8 border-2 text-xs font-black`
- Active page: `backgroundColor: C.coral, borderColor: C.coral, color: C.white`
- Inactive: `borderColor: C.dark, color: C.dark`
- Prev/next arrows: `w-8 h-8 border-2`, disabled at `opacity: 0.3`

## Memphis Patterns for Tables

```tsx
{/* Toolbar search input */}
<div className="flex border-3 flex-1 min-w-[200px] max-w-sm" style={{ borderColor: C.dark }}>
    <div className="flex items-center px-3" style={{ backgroundColor: C.cream }}>
        <i className="fa-duotone fa-regular fa-magnifying-glass text-xs" style={{ color: C.dark }}></i>
    </div>
    <input placeholder="Search..." className="flex-1 px-3 py-2 text-xs font-semibold outline-none"
        style={{ color: C.dark }} />
</div>

{/* Status badge with color mapping */}
<span className="px-2 py-0.5 text-[10px] font-black uppercase"
    style={{ backgroundColor: statusColor(row.status), color: C.white }}>
    {row.status}
</span>

{/* Score bar */}
<div className="flex items-center gap-2">
    <div className="w-12 h-1.5 border" style={{ borderColor: "rgba(26,26,46,0.1)" }}>
        <div className="h-full" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
    </div>
    <span className="text-xs font-bold" style={{ color: scoreColor }}>{score}</span>
</div>

{/* Pagination button */}
<button className="w-8 h-8 flex items-center justify-center border-2 text-xs font-black"
    style={{
        borderColor: active ? C.coral : C.dark,
        backgroundColor: active ? C.coral : "transparent",
        color: active ? C.white : C.dark,
    }}>{pageNum}</button>
```

## Common Violations
- Using DaisyUI `table`, `pagination`, `dropdown` components
- Rounded checkboxes -- Memphis uses square `border-2` checkboxes
- Missing `border-4` on the table container card
- Pagination with `...` ellipsis instead of showing all page numbers
- Bulk action bar without the coral background strip
- Missing view toggle (dense/comfortable) option
- Column visibility as a sidebar instead of dropdown menu
- Score displayed as plain text instead of mini progress bar
- Using Tailwind color classes instead of inline Memphis palette styles
- Default browser `<select>` styling without Memphis borders

## Reference
Showcase: `.claude/memphis/showcase/tables-six.tsx`
