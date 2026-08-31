/**
 * Screenshot capture through the DevTools Protocol with real device-metrics emulation.
 *
 * Chrome's `--screenshot --window-size` flag does not reliably apply the window size to the
 * layout viewport in new headless mode, which produces misleading "clipped" mobile captures.
 * Emulation.setDeviceMetricsOverride does, so QA images match what the responsive checks measure.
 *
 * Usage: node scripts/shoot.mjs <outDir> [baseUrl]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = process.argv[2] ?? '_research/shots';
const BASE = process.argv[3] ?? 'http://127.0.0.1:4499';
const PORT = 9334;

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
];
const BIN = CANDIDATES.find((p) => fs.existsSync(p));
if (!BIN) {
  console.error('shoot: no Chrome binary found.');
  process.exit(1);
}

const SHOTS = [
  { name: 'home', route: '/', vp: 'desktop' },
  { name: 'home', route: '/', vp: 'mobile' },
  { name: 'car-tyres', route: '/tyres/car-tyres/', vp: 'desktop' },
  { name: 'car-tyres', route: '/tyres/car-tyres/', vp: 'mobile' },
  { name: 'quality-grades', route: '/tyres/quality-grades/', vp: 'desktop' },
  { name: 'how-to-order', route: '/how-to-order/', vp: 'desktop' },
  { name: 'contact', route: '/contact/', vp: 'mobile' },
  { name: 'quote-car', route: '/request-a-quote/car-tyres/', vp: 'mobile' },
  { name: 'gallery', route: '/gallery/', vp: 'desktop' },
  { name: 'faqs', route: '/faqs/', vp: 'mobile' },
  { name: '404', route: '/404.html', vp: 'desktop' },
];

const VP = {
  desktop: { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-shoot-'));
const chrome = spawn(
  BIN,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error('no DevTools endpoint');
}

const ws = new WebSocket(await wsUrl());
await new Promise((r) => ws.addEventListener('open', r));

let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);

for (const shot of SHOTS) {
  await send('Emulation.setDeviceMetricsOverride', VP[shot.vp], sessionId);
  await send('Page.navigate', { url: BASE + shot.route }, sessionId);
  await sleep(900);
  const { data } = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true },
    sessionId,
  );
  const file = path.join(OUT, `${shot.name}-${shot.vp}.png`);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`${file}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

await send('Target.closeTarget', { targetId });
ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {
  /* Windows may hold the profile briefly */
}
