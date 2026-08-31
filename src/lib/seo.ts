import { site } from '~/data/site';

/**
 * Deterministic metadata generation.
 *
 * Titles and descriptions are authored per page and validated here, so a duplicate or an
 * over-length title fails the build instead of shipping. The source site had one description
 * shared by four URLs and a 130-character homepage title; neither is possible now.
 */

export interface PageSeo {
  /** Page-specific title. The brand suffix is appended automatically, except on the homepage. */
  title: string;
  description: string;
  /** Path with leading and trailing slash, e.g. "/tyres/car-tyres/". */
  path: string;
  /** Set true only on the homepage, where the title already carries the brand. */
  bareTitle?: boolean | undefined;
  noindex?: boolean | undefined;
  /** Absolute or root-relative OG image URL. Falls back to the site default. */
  image?: string | undefined;
  imageAlt?: string | undefined;
  type?: 'website' | 'article' | undefined;
  /** ISO date; only emitted when factually known. */
  datePublished?: string | undefined;
  dateModified?: string | undefined;
}

const BRAND_SUFFIX = ` | ${site.name}`;
const MAX_TITLE = 62;
const MIN_DESC = 70;
const MAX_DESC = 158;

/** Titles and descriptions seen so far in this build, to catch duplicates. */
const seenTitles = new Map<string, string>();
const seenDescriptions = new Map<string, string>();

export function buildTitle(seo: PageSeo): string {
  const full = seo.bareTitle ? seo.title : `${seo.title}${BRAND_SUFFIX}`;
  if (full.length > MAX_TITLE) {
    throw new Error(
      `SEO: title is ${full.length} chars (max ${MAX_TITLE}) on ${seo.path}\n  "${full}"`,
    );
  }
  const prev = seenTitles.get(full);
  if (prev && prev !== seo.path) {
    throw new Error(`SEO: duplicate title on ${seo.path} and ${prev}\n  "${full}"`);
  }
  seenTitles.set(full, seo.path);
  return full;
}

export function checkDescription(seo: PageSeo): string {
  const d = seo.description.trim();
  if (d.length < MIN_DESC || d.length > MAX_DESC) {
    throw new Error(
      `SEO: description is ${d.length} chars (want ${MIN_DESC}-${MAX_DESC}) on ${seo.path}\n  "${d}"`,
    );
  }
  const prev = seenDescriptions.get(d);
  if (prev && prev !== seo.path) {
    throw new Error(`SEO: duplicate description on ${seo.path} and ${prev}`);
  }
  seenDescriptions.set(d, seo.path);
  return d;
}

export function canonical(path: string): string {
  if (!path.startsWith('/')) throw new Error(`SEO: path must start with "/" — got "${path}"`);
  if (!path.endsWith('/')) throw new Error(`SEO: path must end with "/" — got "${path}"`);
  return new URL(path, site.url).href;
}

export function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : new URL(pathOrUrl, site.url).href;
}
