/**
 * Copies the genuine FlexTyres photography out of the crawl workspace into src/assets/images,
 * renamed descriptively and resized to sane maximums. Astro's Sharp pipeline handles format
 * conversion and responsive srcset at build time; this script only handles selection, naming and
 * capping the source resolution so the build does not chew through 4032px originals.
 *
 * Run once: node scripts/prepare-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = '_research/assets/orig';
const OUT = 'src/assets/images';
const MAX_W = 1800;
const MAX_H = 1800;

/** [sourceFile, newName, maxWidth?] — every entry is a genuine FlexTyres photograph. */
const picks = [
  // Hero / headline
  ['slider-bg-2-2.jpg', 'hero-tyre-stacks.jpg', 1920],
  ['WhatsApp-Image-2020-10-04-at-10.43.59-PM-copy-1.jpg', 'warehouse-sorted-tyre-wall.jpg', 1600],

  // Warehouse and stock
  ['20190130_134423-1.jpg', 'warehouse-yard-panorama.jpg', 1800],
  ['20190130_133849-1.jpg', 'warehouse-outdoor-tyre-rows.jpg', 1800],
  ['20190130_134611-1.jpg', 'warehouse-tyre-yard-winter.jpg', 1800],
  ['index-1.jpg', 'stock-tyres-stacked-outdoor.jpg'],
  ['index2-1.jpg', 'stock-tyre-rows-warehouse.jpg'],
  ['index3-1.jpg', 'stock-tyres-on-pallet-racks.jpg'],
  ['index4-1.jpg', 'stock-graded-tyres-yard.jpg'],
  ['index5-1.jpg', 'stock-tyre-wall-outdoor.jpg'],
  ['index6-1.jpg', 'stock-tyres-loading-bay.jpg'],
  ['index7-1.jpg', 'stock-tyre-stacks-daylight.jpg'],
  ['index8-1.jpg', 'stock-tyres-steel-racking.jpg'],
  ['index9-1.jpg', 'stock-mixed-tyre-inventory.jpg'],
  ['index10-1.jpg', 'stock-tyre-yard-wide.jpg'],
  ['a2.jpg', 'warehouse-worker-sorting-tyres.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.46.06-PM.jpeg', 'warehouse-interior-tyre-racks.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.48.27-PM-1.jpeg', 'warehouse-tyre-stack-close.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.51.51-PM.jpeg', 'warehouse-tyre-inspection-area.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.52.19-PM-2.jpeg', 'warehouse-tyres-ready-for-load.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.53.20-PM-1.jpeg', 'warehouse-graded-tyre-pile.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.55.56-PM-2.jpeg', 'warehouse-tyre-column.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.57.00-PM-1.jpeg', 'warehouse-tyres-outdoor-stacked.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.57.14-PM-1.jpeg', 'warehouse-tyre-selection.jpg'],

  // Tripling / press
  ['service1.jpg', 'tripling-machine-with-tyre.jpg'],
  ['about3.jpg', 'tripling-machine-warehouse.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.50.37-PM2-1.jpeg', 'tripling-press-in-use.jpg'],
  ['WhatsApp-Image-2020-10-04-at-11.02.26-PM-1.jpeg', 'tripled-tyres-bundle.jpg'],
  ['WhatsApp-Image-2020-10-04-at-11.02.27-PM.jpeg', 'tripled-tyres-stacked.jpg'],
  ['WhatsApp-Image-2020-10-04-at-11.02.28-PM1.jpeg', 'tripled-tyres-ready-to-load.jpg'],

  // Container loading and transport
  ['service-copy.jpg', 'forklift-loading-container.jpg'],
  ['service4.jpg', 'container-packed-with-tyres.jpg'],
  ['WhatsApp-Image-2020-10-04-at-10.58.45-PM.jpeg', 'container-loading-in-progress.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.40-1024x576.jpeg', 'truck-loaded-with-tyres.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.402-1024x576.jpeg', 'container-doors-open-loaded.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.403-1024x576.jpeg', 'container-interior-packed.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.404-1024x576.jpeg', 'lorry-trailer-tyre-load.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.405-1024x576.jpeg', 'container-loading-forklift.jpg'],
  ['WhatsApp-Image-2019-03-30-at-08.46.408-1024x576.jpeg', 'loaded-container-exterior.jpg'],

  // Truck tyres
  ['IMG-20190513-WA0027.jpg', 'truck-tyres-stacked.jpg'],
  ['IMG-20190513-WA0087.jpg', 'truck-tyres-warehouse.jpg'],
  ['IMG-20190513-WA0009.jpg', 'truck-tyre-rows-outdoor.jpg'],

  // Recycling
  ['IMG-20190513-WA0050.jpg', 'tyre-chips-pile.jpg'],
  ['IMG-20190513-WA0052.jpg', 'tyre-shred-material.jpg'],
  ['IMG-20190513-WA0053.jpg', 'tyre-recycling-yard.jpg'],
  ['IMG-20190513-WA0054.jpg', 'tyre-chips-close-up.jpg'],
  ['IMG-20190513-WA0047.jpg', 'baled-tyres-stacked.jpg'],

  // Quality
  ['a1.jpg', 'used-tyre-tread-comparison.jpg'],
  ['WhatsApp-Image-2019-03-29-at-22.07.16-1024x576.jpeg', 'tyre-tread-inspection.jpg'],
  ['WhatsApp-Image-2019-03-28-at-12.39.08-497x1024.jpeg', 'graded-tyres-side-view.jpg'],

  // Gallery extras
  ['IMG-20190513-WA0005.jpg', 'gallery-tyre-wall-01.jpg'],
  ['IMG-20190513-WA0011.jpg', 'gallery-tyre-wall-02.jpg'],
  ['IMG-20190513-WA0016.jpg', 'gallery-warehouse-01.jpg'],
  ['IMG-20190513-WA0020.jpg', 'gallery-yard-01.jpg'],
  ['IMG-20190513-WA0021.jpg', 'gallery-yard-02.jpg'],
  ['IMG-20190513-WA0023.jpg', 'gallery-yard-03.jpg'],
  ['IMG-20190513-WA0045.jpg', 'gallery-racking-01.jpg'],
  ['IMG-20190513-WA0058.jpg', 'gallery-loading-01.jpg'],
  ['IMG-20190513-WA0059.jpg', 'gallery-loading-02.jpg'],
  ['IMG-20190513-WA0062.jpg', 'gallery-loading-03.jpg'],
  ['IMG-20190513-WA0063.jpg', 'gallery-container-01.jpg'],
  ['IMG-20190513-WA0075.jpg', 'gallery-container-02.jpg'],
  ['IMG-20190516-WA0001.jpg', 'gallery-warehouse-02.jpg'],

  // Brand
  ['logo-new2.png', 'flextyres-logo.png', 470],
];

fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
let missing = 0;
let bytesIn = 0;
let bytesOut = 0;

for (const [src, name, maxW] of picks) {
  const from = path.join(SRC, src);
  if (!fs.existsSync(from)) {
    console.warn('MISSING', src);
    missing++;
    continue;
  }
  bytesIn += fs.statSync(from).size;
  const to = path.join(OUT, name);
  const pipeline = sharp(from)
    .rotate()
    .resize({
      width: maxW ?? MAX_W,
      height: MAX_H,
      fit: 'inside',
      withoutEnlargement: true,
    });

  if (name.endsWith('.png')) {
    await pipeline.png({ compressionLevel: 9, palette: true }).toFile(to);
  } else {
    await pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(to);
  }
  bytesOut += fs.statSync(to).size;
  ok++;
}

console.log(`prepared ${ok} images (${missing} missing)`);
console.log(`  in:  ${(bytesIn / 1048576).toFixed(2)} MB`);
console.log(`  out: ${(bytesOut / 1048576).toFixed(2)} MB`);
