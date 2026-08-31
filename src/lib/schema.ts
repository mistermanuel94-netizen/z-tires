import { site, contact, primaryLocation, locations, sameAs, company } from '~/data/site';
import { absoluteUrl } from './seo';

/**
 * Reusable JSON-LD generators.
 *
 * Every property emitted here is backed by content that is visible on the page it appears on, and
 * by a public source. Deliberately absent, because the public source does not support them:
 * aggregateRating, review, offer, price, availability, foundingDate, employee, award, and any
 * LocalBusiness node for the Frankfurt or Hollywood locations.
 */

type Json = Record<string, unknown>;

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * Organization. Modelled as Organization rather than LocalBusiness: FlexTyres publishes one
 * street address (an office), no per-location hours, and no walk-in retail offer. LocalBusiness
 * would assert a storefront the source does not describe.
 */
export function organization(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: `${site.url}/`,
    description: site.description,
    logo: {
      '@type': 'ImageObject',
      '@id': `${site.url}/#logo`,
      url: absoluteUrl('/flextyres-logo.png'),
      caption: `${site.name} logo`,
    },
    image: { '@id': `${site.url}/#logo` },
    email: contact.email,
    telephone: contact.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: primaryLocation.street,
      addressLocality: primaryLocation.locality,
      postalCode: primaryLocation.postalCode,
      addressRegion: primaryLocation.region,
      addressCountry: primaryLocation.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: contact.phoneE164,
        email: contact.email,
        availableLanguage: ['en'],
        areaServed: 'Worldwide',
      },
    ],
    openingHoursSpecification: contact.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs,
    knowsAbout: [
      'Used car tyres',
      'Used truck tyres',
      'Tyre wholesale',
      'Tyre export',
      'Tyre doubling and tripling',
      'Container loading',
      'Tyre recycling',
    ],
    /** Both locations FlexTyres publishes beyond the registered office, as plain places. */
    location: locations
      .filter((l) => !l.isPrimary)
      .map((l) => ({
        '@type': 'Place',
        name: l.label,
        address: {
          '@type': 'PostalAddress',
          addressLocality: l.locality,
          addressCountry: l.countryCode,
        },
      })),
    slogan: site.tagline,
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site.url}/`,
    name: site.name,
    description: site.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

export function webPage(opts: {
  url: string;
  name: string;
  description: string;
  breadcrumbId?: string;
  primaryImage?: string;
  datePublished?: string;
  dateModified?: string;
}): Json {
  const node: Json = {
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
  };
  if (opts.breadcrumbId) node['breadcrumb'] = { '@id': opts.breadcrumbId };
  if (opts.primaryImage) {
    node['primaryImageOfPage'] = { '@type': 'ImageObject', url: absoluteUrl(opts.primaryImage) };
  }
  // Dates are only emitted when factually known. They are never manufactured.
  if (opts.datePublished) node['datePublished'] = opts.datePublished;
  if (opts.dateModified) node['dateModified'] = opts.dateModified;
  return node;
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(url: string, crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** FAQPage. Only emitted where the questions and answers are visible on the page. */
export function faqPage(url: string, items: { question: string; answer: string }[]): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

export function contactPage(url: string): Json {
  return {
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    url,
    name: `Contact ${site.name}`,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

/**
 * Service node. `provider` links to the organisation; no price, no offer, no rating — none is
 * published.
 */
export function service(opts: {
  url: string;
  name: string;
  description: string;
  serviceType: string;
}): Json {
  return {
    '@type': 'Service',
    '@id': `${opts.url}#service`,
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    inLanguage: 'en',
  };
}

/**
 * ItemList for a hub page. Represents the navigational list that is actually rendered.
 */
export function itemList(url: string, name: string, items: { name: string; path: string }[]): Json {
  return {
    '@type': 'ItemList',
    '@id': `${url}#list`,
    name,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

/**
 * Compose a graph. The organisation and website nodes are always present so every page resolves
 * the same entity.
 */
export function graph(...nodes: Json[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [organization(), website(), ...nodes],
  });
}

export { company };
