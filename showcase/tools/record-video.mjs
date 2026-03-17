#!/usr/bin/env node

/**
 * Record an HTML animation to MP4 using Puppeteer + ffmpeg.
 *
 * Uses virtual time control (frame-stepping) so animations play at
 * correct speed regardless of capture performance.
 *
 * Prerequisites (install once):
 *   mkdir -p /tmp/promo-recorder && cd /tmp/promo-recorder
 *   npm init -y && npm install puppeteer ffmpeg-static
 *
 * Usage:
 *   node showcase/tools/record-video.mjs \
 *     --input showcase/my-promo-portrait.html \
 *     --output showcase/my-promo.mp4 \
 *     --duration 70 \
 *     --fps 24
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf('--' + name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const INPUT = path.resolve(getArg('input', ''));
const OUTPUT = path.resolve(getArg('output', INPUT.replace(/\.html$/, '.mp4')));
const MAX_DURATION = parseInt(getArg('duration', '70'));
const FPS = parseInt(getArg('fps', '24'));
const WIDTH = 1080;
const HEIGHT = 1920;

if (!INPUT || !fs.existsSync(INPUT)) {
  console.error('Usage: node record-video.mjs --input <file.html> [--output <file.mp4>] [--duration 70] [--fps 24]');
  console.error('  --input    Path to portrait HTML animation (required)');
  console.error('  --output   Output MP4 path (default: same name as input with .mp4)');
  console.error('  --duration Max recording duration in seconds (default: 70)');
  console.error('  --fps      Frames per second (default: 24)');
  process.exit(1);
}

// Dynamic imports from promo-recorder/node_modules
import os from 'os';
const RECORDER_DIR = path.join(os.tmpdir(), 'promo-recorder');
if (!fs.existsSync(path.join(RECORDER_DIR, 'node_modules', 'puppeteer'))) {
  console.error('Missing dependencies. Run:');
  console.error('  mkdir -p /tmp/promo-recorder && cd /tmp/promo-recorder && npm init -y && npm install puppeteer ffmpeg-static');
  process.exit(1);
}

// Resolve modules from recorder directory
const { createRequire } = await import('module');
const require = createRequire(path.join(RECORDER_DIR, 'package.json'));
const puppeteer = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.join(RECORDER_DIR, 'frames-recording');

// Clean up frames directory
if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

console.log(`Input:    ${INPUT}`);
console.log(`Output:   ${OUTPUT}`);
console.log(`Max:      ${MAX_DURATION}s at ${FPS}fps`);
console.log('');

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  protocolTimeout: 300000,
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

// Inject virtual time control BEFORE page loads
await page.evaluateOnNewDocument(() => {
  let virtualTime = 0;
  const timers = [];
  let nextId = 1;

  window.__origSetTimeout = window.setTimeout;
  window.__origSetInterval = window.setInterval;
  window.__origClearTimeout = window.clearTimeout;
  window.__origClearInterval = window.clearInterval;

  Date.now = () => virtualTime;
  performance.now = () => virtualTime;

  window.setTimeout = (fn, delay = 0, ...args) => {
    const id = nextId++;
    timers.push({ id, fn, triggerAt: virtualTime + delay, type: 'timeout', args });
    return id;
  };

  window.setInterval = (fn, delay = 0, ...args) => {
    const id = nextId++;
    timers.push({ id, fn, triggerAt: virtualTime + delay, interval: delay, type: 'interval', args });
    return id;
  };

  window.clearTimeout = (id) => {
    const idx = timers.findIndex(t => t.id === id);
    if (idx !== -1) timers.splice(idx, 1);
  };
  window.clearInterval = window.clearTimeout;

  const rafCallbacks = [];
  let rafId = 1;
  window.requestAnimationFrame = (cb) => {
    const id = rafId++;
    rafCallbacks.push({ id, cb });
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    const idx = rafCallbacks.findIndex(r => r.id === id);
    if (idx !== -1) rafCallbacks.splice(idx, 1);
  };

  window.__advanceTime = (dt) => {
    virtualTime += dt;
    const due = [];
    for (let i = timers.length - 1; i >= 0; i--) {
      if (timers[i].triggerAt <= virtualTime) {
        due.push(timers[i]);
        if (timers[i].type === 'interval') {
          timers[i].triggerAt = virtualTime + timers[i].interval;
        } else {
          timers.splice(i, 1);
        }
      }
    }
    due.sort((a, b) => a.triggerAt - b.triggerAt);
    for (const t of due) {
      try { t.fn(...(t.args || [])); } catch(e) { console.error(e); }
    }
    const cbs = rafCallbacks.splice(0, rafCallbacks.length);
    for (const r of cbs) {
      try { r.cb(virtualTime); } catch(e) { console.error(e); }
    }
  };
});

console.log('Loading page...');
await page.goto('file:///' + INPUT.replace(/\\/g, '/') + '?autoplay=1', {
  waitUntil: 'load',
  timeout: 60000,
});
await page.evaluate(() => document.fonts.ready);

// Advance initial setup
for (let i = 0; i < 10; i++) {
  await page.evaluate(() => window.__advanceTime(100));
}

const frameDt = 1000 / FPS;
const totalFrames = FPS * MAX_DURATION;
const startTime = Date.now();

console.log(`Recording up to ${MAX_DURATION}s at ${FPS}fps...`);

let frame = 0;
let showDone = false;
let extraFrames = 0;

while (frame < totalFrames) {
  await page.evaluate((dt) => window.__advanceTime(dt), frameDt);
  await new Promise(r => setTimeout(r, 5)); // let CSS render

  const fp = path.join(FRAMES_DIR, 'frame_' + String(frame).padStart(5, '0') + '.jpg');
  try {
    await page.screenshot({ path: fp, type: 'jpeg', quality: 92 });
  } catch (err) {
    console.error('Screenshot failed:', err.message);
    break;
  }
  frame++;

  if (!showDone) {
    showDone = await page.evaluate(() => window.__showDone === true).catch(() => false);
    if (showDone) {
      console.log(`Show complete at ${(frame / FPS).toFixed(1)}s. Recording ${4}s more...`);
      extraFrames = FPS * 4;
    }
  } else {
    extraFrames--;
    if (extraFrames <= 0) break;
  }

  if (frame % (FPS * 2) === 0) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const pct = ((frame / totalFrames) * 100).toFixed(0);
    console.log(`  ${(frame / FPS).toFixed(0)}s video (${elapsed}s elapsed, ${pct}%)`);
  }
}

console.log(`Captured ${frame} frames (${(frame / FPS).toFixed(1)}s)`);
try { await browser.close(); } catch {}

// Encode
console.log('Encoding MP4...');
const ffmpeg = spawn(ffmpegPath, [
  '-y', '-framerate', String(FPS),
  '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-vf', `scale=${WIDTH}:${HEIGHT}`,
  OUTPUT,
], { stdio: 'inherit' });

await new Promise((resolve, reject) => {
  ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code)));
  ffmpeg.on('error', reject);
});

const mb = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
console.log('');
console.log(`Done! ${OUTPUT}`);
console.log(`${WIDTH}x${HEIGHT} portrait | ${(frame / FPS).toFixed(1)}s | ${mb} MB`);

// Cleanup
fs.rmSync(FRAMES_DIR, { recursive: true });