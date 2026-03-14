---
name: promo
description: Create animated social media promo videos (portrait MP4) for Splits Network, Applicant Network, or Employment Networks.
---

# /promo - Social Media Promo Videos

Spawn the `promo-video` agent (`.claude/agents/promo-video.md`) to create animated promotional videos for social media.

## Sub-Commands

- `/promo:create <brand> <topic>` — Create a new animated portrait HTML promo
- `/promo:record <html-file>` — Record an HTML animation to portrait MP4
- `/promo:list` — List existing promo videos in `showcase/`

## Brands

| Brand | Domain | Audience |
|---|---|---|
| `splits` | splits.network | Recruiters |
| `applicant` | applicant.network | Job seekers / candidates |
| `corporate` | employmentnetworks.com | Corporate / umbrella brand |

## Output

- HTML animations: `showcase/<brand>-<topic>-portrait.html`
- MP4 videos: `showcase/<brand>-<topic>.mp4`
- Resolution: 1080x1920 (portrait 9:16)
- Duration: 40-70 seconds
- Codec: H.264 with faststart (optimized for social upload)

## Recording Requirements

The recorder needs `puppeteer` and `ffmpeg-static` npm packages. On first use:
```bash
mkdir -p /tmp/promo-recorder && cd /tmp/promo-recorder && npm init -y && npm install puppeteer ffmpeg-static
```

## Existing Videos

Check `showcase/` for existing promo HTMLs and MP4s to avoid style duplication.