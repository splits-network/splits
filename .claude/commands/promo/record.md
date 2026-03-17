# /promo:record - Record HTML to MP4

**Description:** Record a portrait HTML animation to MP4 video for social media upload

## Usage

```bash
/promo:record <html-file> [duration]
```

## Parameters

- `<html-file>` — Path to the portrait HTML file (relative to project root)
- `[duration]` — Optional max duration in seconds (default: 70)

## Examples

```bash
/promo:record showcase/splits-network-shakeup-giveaway-portrait.html
/promo:record showcase/applicant-network-promo-portrait.html 60
```

## Prerequisites

The recorder needs `puppeteer` and `ffmpeg-static` installed in `/tmp/promo-recorder/`. If not present, run:

```bash
mkdir -p /tmp/promo-recorder && cd /tmp/promo-recorder && npm init -y > /dev/null 2>&1 && npm install puppeteer ffmpeg-static
```

## How It Works

1. Launches headless Chromium at 1080x1920 viewport
2. Injects virtual time control (overrides setTimeout, setInterval, requestAnimationFrame, Date.now, performance.now)
3. Steps time forward frame-by-frame at 24fps, capturing JPEG screenshots
4. Waits for `window.__showDone === true` signal from the animation
5. Captures 4 extra seconds of the final scene
6. Encodes all frames to H.264 MP4 with ffmpeg (CRF 18, faststart)
7. Cleans up frame files

## Output

- MP4 file saved next to the HTML file (same name, `.mp4` extension)
- 1080x1920 portrait (9:16 aspect ratio)
- 24fps, H.264, faststart flag for streaming

## Execution

Use the recording script at `showcase/tools/record-video.mjs`:

```bash
cd /tmp/promo-recorder && node G:/code/splits.network/showcase/tools/record-video.mjs \
  --input G:/code/splits.network/<html-file> \
  --output G:/code/splits.network/<output.mp4> \
  --duration <seconds>
```