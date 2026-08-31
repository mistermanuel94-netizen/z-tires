// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * FlexTyres — static-first Astro configuration.
 *
 * Static output is deliberate: every page on this site is content the business publishes once,
 * not per-request data. There is no server rendering, no adapter and no runtime.
 */
export default defineConfig({
  site: 'https://flextyres.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,

  build: {
    inlineStylesheets: 'always',
    assets: '_assets',
  },

  image: {
    // Only the Google MyMaps and YouTube embeds reach outside; no remote images are optimised.
    remotePatterns: [],
  },

  integrations: [
    sitemap({
      filter: (page) => {
        const noindex = ['/thank-you/', '/legal/'];
        const path = new URL(page).pathname;
        // /legal/ hub is excluded; the individual policies are not.
        return !noindex.includes(path);
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const priority =
          path === '/'
            ? 1.0
            : /^\/(tyres|services|request-a-quote|offers)\/$/.test(path)
              ? 0.9
              : /^\/(tyres|services|request-a-quote|offers)\//.test(path)
                ? 0.8
                : /^\/legal\//.test(path)
                  ? 0.2
                  : 0.6;
        return { ...item, priority, changefreq: /** @type {any} */ ('monthly') };
      },
    }),
  ],

  vite: {
    build: {
      // The site ships one tiny module; keep it inline rather than paying for a request.
      assetsInlineLimit: 4096,
    },
  },
});
