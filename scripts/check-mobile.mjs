/**
 * Real-browser mobile/desktop QA via the Chrome DevTools Protocol.
 *
 * For every route, at each viewport, it reports:
 *   - horizontal overflow (scrollWidth > innerWidth) and the exact elements causing it
 *   - tap targets smaller than 44x44 CSS px
 *   - console errors
 *   - the LCP element and its time
 *   - cumulative layout shift
 *
 * Requires a Chrome/Edge binary and a running static server (scripts/serve.mjs).
 *
 * Usage: node scripts/check-mobile.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4499';
const PORT = 9333;

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const BIN = CANDIDATES.find((p) => fs.existsSync(p));
if (!BIN) {
  console.error('check-mobile: no Chrome or Edge binary found.');
  process.exit(1);
}

const ROUTES = [
  '/',
  '/tyres/',
  '/tyres/car-tyres/',
  '/tyres/truck-tyres/',
  '/tyres/quality-grades/',
  '/tyre-recycling/',
  '/services/',
  '/services/doubling-and-tripling/',
  '/how-to-order/',
  '/export-markets/',
  '/offers/',
  '/offers/sprinter-van-delivery/',
  '/franchise/',
  '/gallery/',
  '/faqs/',
  '/about/',
  '/contact/',
  '/request-a-quote/',
  '/request-a-quote/car-tyres/',
  '/request-a-quote/truck-tyres/',
  '/legal/purchasing-terms/',
  '/404.html',
];

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 720, mobile: true, scale: 2 },
  { name: 'mobile-390', width: 390, height: 844, mobile: true, scale: 3 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true, scale: 2 },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false, scale: 1 },
];

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-cdp-'));
const chrome = spawn(
  BIN,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
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
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error('Chrome did not expose a DevTools endpoint');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.sessions = new Map();
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        const h = this.sessions.get(msg.sessionId ?? '__root__');
        h?.(msg);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  on(sessionId, handler) {
    this.sessions.set(sessionId ?? '__root__', handler);
  }
}

/** Runs in the page. Returns overflow offenders, small tap targets and layout metrics. */
const PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const offenders = [];
  if (docW > vw + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        // Ignore elements inside a deliberate horizontal scroller.
        if (el.closest('.table-scroll, [style*="overflow-x"]')) continue;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    }
  }
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, label.choice')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    // Deliberately off-screen (honeypot): not a real target.
    if (r.right < 0 || r.bottom < 0 || el.closest('.hp')) continue;
    // Inline links inside running prose are exempt from the 44px target rule (WCAG 2.2 AA 2.5.8).
    const inProse = el.tagName === 'A' && el.closest('p, li, dd, figcaption, caption, td, th, address');
    if (inProse) continue;
    // A control wrapped in a label: the label is the hit area, so measure that instead.
    if (el.tagName === 'INPUT') {
      const lab = el.closest('label');
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (lr.width >= 44 && lr.height >= 44) continue;
      }
    }
    if (r.width < 44 || r.height < 44) {
      small.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 34),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }
  return JSON.stringify({ vw, docW, overflow: docW - vw, offenders: offenders.slice(0, 12), small: small.slice(0, 12) });
})()`;

const VITALS = `(() => new Promise((resolve) => {
  let lcp = null, cls = 0;
  try {
    new PerformanceObserver((l) => {
      const es = l.getEntries();
      const last = es[es.length - 1];
      if (last) lcp = { time: Math.round(last.startTime), el: last.element ? (last.element.tagName.toLowerCase() + (last.element.className ? '.' + String(last.element.className).split(' ')[0] : '')) : (last.url || 'text') };
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    resolve(JSON.stringify({
      lcp, cls: Math.round(cls * 10000) / 10000,
      ttfb: Math.round(nav.responseStart || 0),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      transfer: nav.transferSize || 0,
      resources: performance.getEntriesByType('resource').length,
    }));
  }, 1200);
}))()`;

const errors = [];
const rows = [];

const ws = new WebSocket(await wsUrl());
await new Promise((r) => ws.addEventListener('open', r));
const cdp = new CDP(ws);

const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

const consoleErrors = [];
cdp.on(sessionId, (msg) => {
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.text ?? 'exception');
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '?').join(' '));
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    consoleErrors.push(msg.params.entry.text);
  }
});

await cdp.send('Page.enable', {}, sessionId);
await cdp.send('Runtime.enable', {}, sessionId);
await cdp.send('Log.enable', {}, sessionId);

for (const vp of VIEWPORTS) {
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: vp.mobile },
    sessionId,
  );

  for (const route of ROUTES) {
    consoleErrors.length = 0;
    await cdp.send('Page.navigate', { url: BASE + route }, sessionId);
    await sleep(700);

    const probe = await cdp.send(
      'Runtime.evaluate',
      { expression: PROBE, returnByValue: true },
      sessionId,
    );
    const r = JSON.parse(probe.result.value);

    let vitals = {};
    if (vp.name === 'mobile-390' || vp.name === 'desktop-1440') {
      const v = await cdp.send(
        'Runtime.evaluate',
        { expression: VITALS, awaitPromise: true, returnByValue: true },
        sessionId,
      );
      vitals = JSON.parse(v.result.value);
    }

    rows.push({ vp: vp.name, route, ...r, vitals, consoleErrors: [...consoleErrors] });

    if (r.overflow > 1) {
      errors.push(
        `${vp.name} ${route}: horizontal overflow ${r.overflow}px — ` +
          r.offenders.map((o) => `<${o.tag} class="${o.cls}"> right=${o.right}`).join('; '),
      );
    }
    for (const s of r.small) {
      errors.push(`${vp.name} ${route}: tap target ${s.w}x${s.h} — <${s.tag}> "${s.text}"`);
    }
    for (const e of consoleErrors) {
      errors.push(`${vp.name} ${route}: console error — ${e.slice(0, 140)}`);
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────────
console.log(`check-mobile: ${ROUTES.length} routes x ${VIEWPORTS.length} viewports\n`);

for (const vpName of ['mobile-390', 'desktop-1440']) {
  const set = rows.filter((r) => r.vp === vpName && r.vitals?.lcp);
  if (!set.length) continue;
  console.log(`${vpName} — Core Web Vitals (local, uncached)`);
  console.log('   LCP    CLS     TTFB  reqs   route');
  for (const r of set
    .sort((a, b) => (b.vitals.lcp?.time ?? 0) - (a.vitals.lcp?.time ?? 0))
    .slice(0, 8)) {
    console.log(
      `  ${String(r.vitals.lcp.time).padStart(4)}ms ${String(r.vitals.cls).padStart(6)} ${String(r.vitals.ttfb).padStart(5)}ms ${String(r.vitals.resources).padStart(4)}   ${r.route}  (${r.vitals.lcp.el})`,
    );
  }
  const worstCls = Math.max(...set.map((r) => r.vitals.cls));
  const worstLcp = Math.max(...set.map((r) => r.vitals.lcp.time));
  console.log(`  worst LCP ${worstLcp}ms · worst CLS ${worstCls}\n`);
}

fs.writeFileSync('_research/mobile-qa.json', JSON.stringify(rows, null, 2));

await cdp.send('Target.closeTarget', { targetId });
ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {
  /* Windows sometimes holds the profile briefly */
}

if (errors.length) {
  console.error(`${errors.length} issue(s):`);
  for (const e of [...new Set(errors)]) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('check-mobile: PASS');
