/**
 * Single source of truth for every business fact published on this site.
 *
 * Nothing here is invented. Every value is traceable to public flextyres.com content, and where
 * the public source contradicts itself the resolution recorded in CONTENT_TRUST_CONFLICTS.md is
 * applied here — once — so no page can drift.
 *
 * If a fact is not in this file, no page may assert it.
 */

export const site = {
  name: 'FlexTyres',
  legalName: 'FlexTyres',
  url: 'https://flextyres.com',
  /** Source: og:site_name, and the <title> suffix used across the live install. */
  tagline: 'Used Tyres Wholesale',
  description:
    'FlexTyres is a Belgian wholesaler of used car and truck tyres, supplying trade buyers by container and van since 2011.',
  locale: 'en',
  htmlLang: 'en',
} as const;

/**
 * Contact details.
 * Phone appears in three formats across the source (C-20); one canonical presentation is used.
 * Hours use the contact page's narrower Saturday window (C-03).
 */
export const contact = {
  /** E.164, as used by the source's own tel: and wa.me hrefs. */
  phoneE164: '+32489331332',
  phoneDisplay: '+32 489 33 13 32',
  whatsappUrl: 'https://wa.me/32489331332',
  email: 'info@flextyres.com',
  hours: [
    { days: 'Monday – Friday', time: '08:00 – 17:30' },
    { days: 'Saturday', time: '08:00 – 15:00' },
    { days: 'Sunday', time: 'Closed' },
  ],
  /** IANA zone for Belgium; the source writes "GMT+1", which is CET. */
  timezoneNote: 'Central European Time (CET / CEST)',
  /** schema.org openingHoursSpecification source data. */
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30',
    },
    { days: ['Saturday'], opens: '08:00', closes: '15:00' },
  ],
} as const;

/**
 * Locations exactly as published. The Belgium address follows C-02 (Evere, from the current
 * install); Hollywood is listed because both installs publish it, but is not promoted (C-04).
 */
export interface Location {
  readonly id: string;
  readonly role: string;
  readonly label: string;
  readonly street?: string;
  readonly locality: string;
  readonly postalCode?: string;
  readonly region?: string;
  readonly country: string;
  readonly countryCode: string;
  readonly isPrimary: boolean;
}

export const locations: readonly Location[] = [
  {
    id: 'office-belgium',
    role: 'Office',
    label: 'Office — Belgium',
    street: 'Avenue Jules Bordet 160, box 16',
    locality: 'Evere',
    postalCode: '1140',
    region: 'Brussels-Capital Region',
    country: 'Belgium',
    countryCode: 'BE',
    isPrimary: true,
  },
  {
    id: 'warehouse-germany',
    role: 'Warehouse',
    label: 'Warehouse — Germany',
    locality: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    isPrimary: false,
  },
  {
    id: 'warehouse-usa',
    role: 'Warehouse',
    label: 'Warehouse — United States',
    locality: 'Hollywood, Florida',
    country: 'United States',
    countryCode: 'US',
    isPrimary: false,
  },
];

export const primaryLocation = locations[0]!;

/** Social profiles that resolve to a real FlexTyres presence. LinkedIn is omitted — C-23. */
export const social = {
  facebook: 'https://www.facebook.com/flextyresco/',
  youtube: 'https://www.youtube.com/channel/UC-LghFtD0Q0jSahdEPo5JLw',
  youtubeVideos: 'https://www.youtube.com/channel/UC-LghFtD0Q0jSahdEPo5JLw/videos',
  /** Google Business Profile, from the CID published in the homepage "See All Reviews" area. */
  googleBusinessProfile: 'https://maps.google.com/?cid=15292892446084407348',
} as const;

export const sameAs = [social.facebook, social.youtube, social.googleBusinessProfile];

/** Videos published by FlexTyres and embedded on the source site. */
export const videos = {
  /** Embedded on the source homepage. */
  homepage: 'qZ2zQQBqHQg',
  /** Embedded on the source Our Stock page. */
  stock: 'AbRg1MrSFe4',
} as const;

/** Google MyMaps embed published on the source homepage. */
export const exportMapEmbedId = '1u1QPLAhv9a2GRMRWLUIdjpSOs0fgKiNq';

/**
 * Company facts.
 * "8+ years" is dropped as provably stale; 2011 is the year both installs' copyright ranges
 * begin. See C-07.
 */
export const company = {
  tradingSince: 2011,
  /** Verbatim from /en/about-us/, with the frozen year count removed. */
  originStory:
    'Started as a one-man operation, FlexTyres grew into a family business wholesaling used tyres.',
  /** Company-stated, undated figures — C-08. Published only on /about/, never in schema. */
  statedFigures: {
    tyresExported: 79359,
    customers: 325,
    note: 'These figures are published by FlexTyres and are not dated.',
  },
  /** Company-stated stock level — C-06. Never placed in structured data. */
  statedStock: 'more than 100,000 tyres',
} as const;

/**
 * Downloadable documents mirrored from the source, byte-for-byte.
 * The purchasing terms link 404s on every page of the live site; here it works.
 */
export const documents = {
  stockListXlsx: {
    href: '/documents/flextyres-stock-list.xlsx',
    label: 'Stock list (Excel)',
    sizeLabel: '106 KB',
    type: 'XLSX',
  },
  stockListPdf: {
    href: '/documents/flextyres-stock-list.pdf',
    label: 'Stock list (PDF)',
    sizeLabel: '599 KB',
    type: 'PDF',
  },
  purchasingTerms: {
    href: '/documents/flextyres-purchasing-terms.pdf',
    label: 'Purchasing Terms & Conditions',
    sizeLabel: '167 KB',
    type: 'PDF',
    lastUpdated: '2012-10-01',
  },
} as const;

/**
 * Manufacturer names published across the source, as the union of the homepage logo strip and
 * the Sprinter page's text list. Published as text, never as logos — C-24.
 */
export const brandsCarried = [
  'Michelin',
  'Pirelli',
  'Dunlop',
  'Continental',
  'Bridgestone',
  'Goodyear',
] as const;

export const brandDisclaimer =
  'FlexTyres is an independent wholesaler and is not affiliated with, endorsed by or an authorised dealer for these manufacturers.';

/**
 * Analytics. Only GA4 is carried forward; the Universal Analytics property no longer collects
 * data and the Ads tag is an owner decision. Empty string disables analytics entirely.
 */
export const analytics = {
  ga4MeasurementId: '',
} as const;

/**
 * Where quote and contact forms POST. No backend is reconstructable from public information,
 * so the build ships without an endpoint: forms degrade to a mailto: fallback and every page
 * carries phone and WhatsApp. See DEPLOYMENT.md to wire a real endpoint.
 */
export const formEndpoint = '';
