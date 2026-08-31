/**
 * Tyre grading and ordering data, exactly as FlexTyres publishes it.
 *
 * Car grades follow CONTENT_TRUST_CONFLICTS.md C-01: the ranges published on /en/about-us/,
 * /en/tripling-techniques/ and the legacy /tyres-for-cars/ — three pages across both installs,
 * internally consistent and tiling without gaps. The homepage's differing fourth variant is not
 * published here.
 *
 * Truck grades follow C-12: reproduced from the legacy /tyres-for-trucks/ page, which is the only
 * place FlexTyres has ever published them, and carried with a visible provenance note.
 */

export interface Grade {
  readonly id: string;
  readonly name: string;
  readonly treadDepth: string;
  /** Additional published criteria, in the source's own terms. */
  readonly criteria: readonly string[];
}

export const carGrades: readonly Grade[] = [
  {
    id: 'high',
    name: 'High quality',
    treadDepth: '4 mm – 8 mm',
    criteria: ['Tyre quality A', 'All brands'],
  },
  {
    id: 'medium',
    name: 'Medium quality',
    treadDepth: '2.5 mm – 5 mm',
    criteria: ['Tyre quality A and B', 'All brands'],
  },
  {
    id: 'low',
    name: 'Low quality',
    treadDepth: '1 mm – 3 mm',
    criteria: ['Tyre quality B', 'All brands'],
  },
];

export const truckGrades: readonly Grade[] = [
  {
    id: 'high',
    name: 'High quality',
    treadDepth: '5 mm and above',
    criteria: ['Can be reused', 'No damage', 'Only export to Europe'],
  },
  {
    id: 'medium',
    name: 'Medium quality',
    treadDepth: '3 mm – 5 mm',
    criteria: [
      'For retread and reuse',
      'Maximum 1 repaired damage',
      'For export, also within Europe',
    ],
  },
  {
    id: 'low',
    name: 'Low quality',
    treadDepth: '0 mm – 2.5 mm',
    criteria: ['For retread', '2 to 3 repaired damages', 'Only for export'],
  },
];

/** Shown beneath every grade table. Required by C-01 and C-12 while grades remain unverified. */
export const gradeCaveat =
  'Grades and tread depths are indicative. Confirm the exact grade, tread depth and mix for your order in writing before shipping.';

export const truckGradeProvenance =
  'Truck grading criteria as last published by FlexTyres. Confirm current grading and export restrictions when you request a quote.';

/**
 * The three purchase routes FlexTyres publishes, each with its own stated minimum.
 * Replaces the single contradictory "minimum order" figure — C-05.
 */
export interface OrderRoute {
  readonly id: string;
  readonly name: string;
  readonly quantity: string;
  readonly coverage: string;
  readonly notes: readonly string[];
  readonly href: string;
}

export const carOrderRoutes: readonly OrderRoute[] = [
  {
    id: 'sprinter',
    name: 'Sprinter van delivery',
    quantity: '180 tyres',
    coverage: 'Belgium, France and the Netherlands',
    notes: [
      '4–6 mm tread depth',
      'Sets of 2 only',
      'One price for all sizes',
      'Delivery within 7 days',
    ],
    href: '/offers/sprinter-van-delivery/',
  },
  {
    id: 'container-20',
    name: '20 ft container',
    quantity: 'approx. 1,350 tyres tripled',
    coverage: 'Export worldwide',
    notes: ['At least 20 different sizes'],
    href: '/request-a-quote/car-tyres/',
  },
  {
    id: 'container-40',
    name: '40 ft container',
    quantity: 'approx. 2,800 tyres tripled',
    coverage: 'Export worldwide',
    notes: [],
    href: '/request-a-quote/car-tyres/',
  },
];

export const truckOrderRoutes: readonly OrderRoute[] = [
  {
    id: 'container-20',
    name: '20 ft container',
    quantity: 'approx. 130 truck tyres',
    coverage: 'Export worldwide',
    notes: [],
    href: '/request-a-quote/truck-tyres/',
  },
  {
    id: 'container-40',
    name: '40 ft container',
    quantity: 'approx. 270 truck tyres',
    coverage: 'Export worldwide',
    notes: [],
    href: '/request-a-quote/truck-tyres/',
  },
  {
    id: 'custom',
    name: 'Custom order',
    quantity: 'By arrangement',
    coverage: 'Export worldwide',
    notes: ['Tell us the sizes and volumes you need'],
    href: '/request-a-quote/truck-tyres/',
  },
];

/** Shown wherever sizes are listed. C-06, C-13. */
export const stockCaveat =
  'Sizes listed are those FlexTyres publishes. Stock is limited and rotates — confirm availability when you request a quote.';

/** Recycling products, from /en/tire-recycling/ and the legacy /recycling/ page. */
export const recyclingProducts = [
  { name: 'High quality tyre chips', description: 'Shredded tyre material, higher grade.' },
  { name: 'Low quality tyre chips', description: 'Shredded tyre material, lower grade.' },
  { name: 'Bales', description: 'Compressed and bound whole tyres.' },
] as const;
