import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

/**
 * Content collections with schema validation, so malformed content fails the build rather than
 * reaching production.
 *
 * Prose that a person edits (services) uses Markdown. Repeatable records that must stay
 * structurally identical (FAQs, markets, testimonials) use JSON with a strict schema.
 */

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string().min(3).max(60),
    /** Used as the page <h1>; may differ from the nav/card title. */
    heading: z.string().min(3).max(80),
    description: z.string().min(70).max(160),
    /** One-line answer-first summary. Rendered directly under the H1. */
    summary: z.string().min(40).max(240),
    order: z.number().int().min(1),
    /** Slugs of related services, validated against this collection at build time. */
    related: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().min(10).optional(),
  }),
});

const faqs = defineCollection({
  loader: file('./src/content/faqs/faqs.json'),
  schema: z.object({
    id: z.string(),
    question: z.string().min(8).max(120),
    /** Reproduced from the source. Answer-first: the first sentence must answer the question. */
    answer: z.string().min(15),
    category: z.enum(['ordering', 'pricing', 'product', 'logistics', 'company']),
    /** Optional internal link to the page that expands on this answer. */
    expandsAt: z.string().startsWith('/').optional(),
    expandsLabel: z.string().optional(),
  }),
});

const markets = defineCollection({
  loader: file('./src/content/markets/markets.json'),
  schema: z.object({
    id: z.string(),
    /** Name exactly as FlexTyres published it, corrected only for obvious spelling. */
    name: z.string().min(2),
    /** ISO 3166-1 alpha-2 where the published entry names a country. */
    countryCode: z.string().length(2).optional(),
    region: z.enum(['Africa', 'Europe', 'North America', 'Asia']),
    /** How FlexTyres wrote it, when that differs from `name`. */
    publishedAs: z.string().optional(),
    note: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/testimonials/testimonials.json'),
  schema: z.object({
    id: z.string(),
    /** Verbatim. Never edited, never trimmed, never spell-corrected. */
    quote: z.string().min(10),
    author: z.string().min(2),
    /** ISO date, exactly as published on the source. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    source: z.literal('Google'),
  }),
});

const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: z.object({
    title: z.string().min(3).max(60),
    heading: z.string().min(3).max(80),
    description: z.string().min(70).max(160),
    summary: z.string().min(40).max(280),
    coverage: z.array(z.string()).min(1),
    order: z.number().int().min(1),
  }),
});

export const collections = { services, faqs, markets, testimonials, offers };
