# /promo:create - Create Promo Video

**Description:** Create a new animated portrait HTML promo video for social media

## Usage

```bash
/promo:create <brand> <topic>
```

## Parameters

- `<brand>` — Target brand: `splits`, `applicant`, or `corporate`
- `<topic>` — Short topic slug (e.g., `residual-income`, `shakeup-giveaway`, `anti-ghosting`)

## Examples

```bash
/promo:create splits residual-income
/promo:create applicant career-advocacy
/promo:create splits partner-plan-launch
```

## What Gets Created

1. Portrait HTML animation: `showcase/<brand>-network-<topic>-portrait.html`
2. Optionally recorded MP4: `showcase/<brand>-network-<topic>.mp4`

## Execution

Spawn the `promo-video` agent. It will:

1. Research the topic — check the codebase for relevant features, copy, and data
2. Review existing videos in `showcase/` to avoid style duplication
3. Choose a distinct visual style (kinetic typography, terminal boot, card reveals, etc.)
4. Create the portrait HTML (1080x1920) with auto-start animation
5. Offer to record to MP4 via `/promo:record`