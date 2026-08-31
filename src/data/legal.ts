/**
 * Legal document metadata.
 *
 * Kept in one place so a document's effective date, version and review status cannot drift from
 * what the page renders, and so the privacy policy can describe the site's *actual* configuration
 * rather than a fixed snapshot. If analytics or a form endpoint is switched on in site.ts, the
 * privacy policy text changes with it — a policy that silently becomes untrue is worse than none.
 */

export const legalDocs = {
  privacy: {
    /** Date this version takes effect. Update whenever the substance changes. */
    effectiveDate: '2026-08-31',
    version: '2.0',
    /** The version this replaces, for the changelog. */
    supersedes: { version: '1.0', date: '2020-10-01' },
    /**
     * Set to true only once a qualified adviser has reviewed and approved the text.
     * While false, the page displays a visible review notice.
     */
    legallyReviewed: false,
  },
  purchasingTerms: {
    effectiveDate: '2026-08-31',
    version: '2.0',
    supersedes: { version: '1.0', date: '2012-10-01' },
    legallyReviewed: false,
    /** The superseded document, retained verbatim for reference and for existing contracts. */
    archivedPdf: '/documents/flextyres-purchasing-terms-2012.pdf',
  },
  websiteTerms: {
    effectiveDate: '2026-08-31',
    version: '2.0',
    supersedes: { version: '1.0', date: '2020-10-01' },
    legallyReviewed: false,
  },
} as const;

/**
 * The data controller, for GDPR Article 13/14 disclosure. Sourced from src/data/site.ts —
 * see CONTENT_TRUST_CONFLICTS.md C-02 for the address decision.
 */
export const controller = {
  name: 'FlexTyres',
  /**
   * A registered company number and the identity of the legal entity are required for a complete
   * Article 13 disclosure. Neither is published anywhere on the public source site, so neither is
   * asserted here. OWNER ACTION: supply the registered entity name and enterprise number.
   */
  registeredEntity: null,
  enterpriseNumber: null,
  /** Belgium's supervisory authority. */
  supervisoryAuthority: {
    name: 'Gegevensbeschermingsautoriteit / Autorité de protection des données',
    shortName: 'Belgian Data Protection Authority',
    url: 'https://www.gegevensbeschermingsautoriteit.be/',
    address: 'Rue de la Presse 35, 1000 Brussels, Belgium',
  },
  /**
   * No DPO is published, and one is unlikely to be required: FlexTyres is not a public authority,
   * its core activity is tyre wholesale rather than large-scale monitoring, and it does not
   * process special-category data at scale (GDPR Art. 37). Inquiries route to the general address.
   */
  dpo: null,
} as const;
