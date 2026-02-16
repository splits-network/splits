# Memphis Compliance Audit — Existing Memphis Pages

**Date:** 2026-02-16
**Auditor:** Orchestrator (manual)

## Summary

| File | `style={{` | Hex colors | Shadows/Rounded/Gradient | Old DaisyUI | Verdict |
|------|-----------|------------|--------------------------|-------------|---------|
| features/page.tsx | **144** | **143** | 0 | 0 | NEEDS FIX |
| pricing/page.tsx | **168** | **157** | 0 | 0 | NEEDS FIX |
| how-it-works/page.tsx | **139** | **143** | 0 | 0 | NEEDS FIX |
| integration-partners/page.tsx | **112** | **119** | 0 | 0 | NEEDS FIX |
| transparency/page.tsx | **113** | **116** | 0 | 0 | NEEDS FIX |
| updates/page.tsx | **122** | **125** | 0 | 0 | NEEDS FIX |
| brand/page.tsx | 0 | **6** | 0 | 0 | MINOR (hex in data arrays only) |
| corporate page.tsx | 0 | **2** | 0 | 0 | MINOR (SVG gradient stops only) |

## Key Findings

### Good News
- **Zero** old DaisyUI classes (bg-primary, bg-secondary, etc.) — all use Memphis palette
- **Zero** shadows, rounded corners, or gradients in any file
- **brand/page.tsx** is nearly clean — 6 hex values are in data arrays (acceptable per copy rules)
- **corporate landing** is nearly clean — 2 hex values in SVG gradient stops only

### Bad News
The 6 main Memphis content pages (features, pricing, how-it-works, integration-partners, transparency, updates) were built in the **pre-Tailwind-only era** and have massive inline style violations:
- **798 total `style={{}}` occurrences** across 6 files
- **803 total hardcoded hex colors** across 6 files
- These all use the pattern: `style={{ backgroundColor: "#FF6B6B", color: "#1A1A2E" }}` instead of `className="bg-coral text-dark"`

### Fix Priority
1. **HIGH** — features, pricing, how-it-works (most-visited pages)
2. **MEDIUM** — integration-partners, transparency, updates
3. **LOW** — brand (6 hex in data arrays), corporate landing (2 SVG hex)

### Fix Strategy
Each of these 6 pages needs a `/memphis:fix` pass to convert:
- `style={{ backgroundColor: "#FF6B6B" }}` → `className="bg-coral"`
- `style={{ color: "#1A1A2E" }}` → `className="text-dark"`
- `style={{ borderColor: "#4ECDC4" }}` → `className="border-teal"`
- `style={{ color: "rgba(255,255,255,0.7)" }}` → `className="text-cream/70"`

Estimated: ~100-170 replacements per file. Recommended approach: batch fix with designer agent per file.
