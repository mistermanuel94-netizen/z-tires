/**
 * Minimal static server for QA. Serves dist/ with the trailing-slash and 404 behaviour the
 * production host is configured for, and applies the generated _headers so security headers can
 * be verified locally.
 *
 * Usage: node scripts/serve.mjs [port]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] ?? 4499);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.webmanifest': 'application/manifest+json',
};

/** Parse the generated _headers so local QA sees the production security headers. */
const globalHeaders = {};
const headersFile = path.join(ROOT, '_headers');
if (fs.existsSync(headersFile)) {
  let inGlobal = false;
  for (const line of fs.readFileSync(headersFile, 'utf8').split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    if (!line.startsWith(' ')) {
      inGlobal = line.trim() === '/*';
      continue;
    }
    if (!inGlobal) continue;
    const i = line.indexOf(':');
    if (i > 0) globalHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

/** Redirect rules from the generated _redirects. */
const redirects = new Map();
const gone = new Set();
const redirFile = path.join(ROOT, '_redirects');
if (fs.existsSync(redirFile)) {
  for (const line of fs.readFileSync(redirFile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, status] = t.split(/\s+/);
    if (status === '410') gone.add(from);
    else redirects.set(from, to);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const rawPath = url.pathname;
  let p = decodeURIComponent(rawPath);
  /** The generated _redirects uses percent-encoded paths; match either form, as a host does. */
  const lookup = (map) => (map.has(rawPath) ? rawPath : map.has(p) ? p : null);

  const send = (code, body, type, extra = {}) => {
    res.writeHead(code, { ...globalHeaders, 'Content-Type': type, ...extra });
    res.end(body);
  };

  if (lookup(gone)) {
    const notFound = path.join(ROOT, '404.html');
    return send(410, fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Gone', TYPES['.html']);
  }
  const redirectKey = lookup(redirects);
  if (redirectKey) {
    res.writeHead(301, { ...globalHeaders, Location: redirects.get(redirectKey) });
    return res.end();
  }

  let file = path.join(ROOT, p);
  if (p.endsWith('/')) file = path.join(file, 'index.html');
  else if (!path.extname(p)) {
    // Enforce trailing slashes the way the host does.
    res.writeHead(301, { ...globalHeaders, Location: p + '/' });
    return res.end();
  }

  if (!file.startsWith(ROOT)) return send(403, 'Forbidden', TYPES['.txt']);

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const notFound = path.join(ROOT, '404.html');
    return send(
      404,
      fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found',
      TYPES['.html'],
    );
  }

  const ext = path.extname(file).toLowerCase();
  send(200, fs.readFileSync(file), TYPES[ext] ?? 'application/octet-stream');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`serving dist/ at http://127.0.0.1:${PORT}/`);
});
