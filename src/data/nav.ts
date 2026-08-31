/**
 * Navigation. Every href is a final canonical URL — no redirects, no "#", no external links
 * dressed as internal ones. The source site shipped three nav labels pointing at one URL, a dead
 * "#" link and a 404 in the primary menu; a build-time check (scripts/check-links.mjs) prevents
 * any of that recurring.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Short description, used in the mobile drawer and mega-menu. */
  hint?: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  {
    label: 'Tyres',
    href: '/tyres/',
    hint: 'Grades, sizes and container quantities',
    children: [
      {
        label: 'Used car tyres',
        href: '/tyres/car-tyres/',
        hint: '348 published sizes, 12" to 22"',
      },
      {
        label: 'Used truck tyres',
        href: '/tyres/truck-tyres/',
        hint: '16 published sizes, 17" to 22.5"',
      },
      {
        label: 'Quality grades',
        href: '/tyres/quality-grades/',
        hint: 'How tread depth and grading work',
      },
      { label: 'Tyre recycling', href: '/tyre-recycling/', hint: 'Chips and bales' },
    ],
  },
  {
    label: 'Services',
    href: '/services/',
    hint: 'What FlexTyres does with your order',
    children: [
      { label: 'Doubling & tripling', href: '/services/doubling-and-tripling/' },
      { label: 'Container loading', href: '/services/container-loading/' },
      { label: 'Transportation', href: '/services/transportation/' },
      { label: 'Export & customs', href: '/services/export-and-customs/' },
    ],
  },
  {
    label: 'How to order',
    href: '/how-to-order/',
    hint: 'Minimums, process and what to send us',
  },
  {
    label: 'Company',
    href: '/about/',
    hint: 'Who FlexTyres is',
    children: [
      { label: 'About FlexTyres', href: '/about/' },
      { label: 'Export markets', href: '/export-markets/' },
      { label: 'Offers', href: '/offers/' },
      { label: 'Franchise programme', href: '/franchise/' },
      { label: 'Gallery', href: '/gallery/' },
      { label: 'FAQs', href: '/faqs/' },
    ],
  },
  { label: 'Contact', href: '/contact/' },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Tyres',
    items: [
      { label: 'Used car tyres', href: '/tyres/car-tyres/' },
      { label: 'Used truck tyres', href: '/tyres/truck-tyres/' },
      { label: 'Quality grades', href: '/tyres/quality-grades/' },
      { label: 'Tyre recycling', href: '/tyre-recycling/' },
      { label: 'Sprinter van delivery', href: '/offers/sprinter-van-delivery/' },
    ],
  },
  {
    heading: 'Services',
    items: [
      { label: 'Doubling & tripling', href: '/services/doubling-and-tripling/' },
      { label: 'Container loading', href: '/services/container-loading/' },
      { label: 'Transportation', href: '/services/transportation/' },
      { label: 'Export & customs', href: '/services/export-and-customs/' },
      { label: 'How to order', href: '/how-to-order/' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About FlexTyres', href: '/about/' },
      { label: 'Export markets', href: '/export-markets/' },
      { label: 'Franchise programme', href: '/franchise/' },
      { label: 'Gallery', href: '/gallery/' },
      { label: 'FAQs', href: '/faqs/' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: 'Purchasing terms', href: '/legal/purchasing-terms/' },
  { label: 'Terms & conditions', href: '/legal/terms-and-conditions/' },
  { label: 'Privacy policy', href: '/legal/privacy-policy/' },
];
