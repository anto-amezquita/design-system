// Self-hosts the demo brands' fonts for /design-sync (cfg.extraFonts).
//
// Designs on claude.ai/design only get styles.css and what it imports, so a
// brand whose fonts come from a Google Fonts <link> (ADR 0020) would render a
// fallback there. This script reads each brand's link from tokens/fonts.json,
// asks Google for the same CSS a consumer's browser would get, keeps the latin
// and latin-ext subsets, downloads the woff2 files into .design-sync/fonts/
// and writes .design-sync/fonts/demo-brands.css pointing at them.
//
// Schibsted Grotesk and JetBrains Mono are skipped: fonts.css already
// self-hosts both, in wider ranges than any brand asks for.
//
// Run from the repo root when tokens/fonts.json gains or changes a family:
//   node .design-sync/fetch-demo-fonts.mjs
// A new family also needs its OFL.txt in .design-sync/fonts/licenses/ (see
// the README there).

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, '.design-sync', 'fonts');
const SKIP = new Set(['Schibsted Grotesk', 'JetBrains Mono']);
const SUBSETS = new Set(['latin', 'latin-ext']);
// Google serves woff2 with unicode-range subsets only to a modern browser.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const { brands } = JSON.parse(readFileSync(join(ROOT, 'tokens', 'fonts.json'), 'utf8'));

// One request per family, taken from the brand's own link so the ranges and
// axes are exactly the ones the brand was designed with.
const specs = new Map();
for (const [brand, { href }] of Object.entries(brands)) {
  for (const spec of new URL(href).searchParams.getAll('family')) {
    const family = spec.split(':')[0];
    if (SKIP.has(family)) continue;
    if (!specs.has(family)) specs.set(family, { spec, brands: [] });
    specs.get(family).brands.push(brand);
  }
}

const files = new Map(); // remote url -> local file name
const taken = new Set();
let css = '/* Self-hosted from Google Fonts (SIL OFL 1.1) by .design-sync/fetch-demo-fonts.mjs - latin + latin-ext subsets.\n' +
  '   The demo brands\' families, as tokens/fonts.json requests them. Do not edit: re-run the script. */\n';

for (const [family, { spec, brands: usedBy }] of [...specs].sort(([a], [b]) => a.localeCompare(b))) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(spec).replace(/%20/g, '+').replace(/%3A/g, ':').replace(/%40/g, '@').replace(/%2C/g, ',').replace(/%3B/g, ';')}&display=swap`;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${family}: ${res.status} from ${url}`);
  const text = await res.text();
  let kept = 0;
  for (const [, subset, block] of text.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[^}]+\})/g)) {
    if (!SUBSETS.has(subset)) continue;
    const remote = block.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    const style = block.match(/font-style: (\w+)/)?.[1] ?? 'normal';
    if (!remote) throw new Error(`${family}: no woff2 url in the ${subset} block`);
    if (!files.has(remote)) {
      // A variable family is one file per subset; a static one is a file per
      // weight, so the weight goes in the name only when it has to.
      const base = `${family.replace(/\s+/g, '')}-${style}-${subset}`;
      const weight = block.match(/font-weight: ([\d ]+)/)?.[1].trim().replace(/\s+/g, '-');
      let name = `${base}.woff2`;
      if (taken.has(name)) name = `${base}-${weight}.woff2`;
      if (taken.has(name)) throw new Error(`${family}: two files want the name ${name}`);
      taken.add(name);
      files.set(remote, name);
      const font = await fetch(remote, { headers: { 'user-agent': UA } });
      if (!font.ok) throw new Error(`${family}: ${font.status} from ${remote}`);
      writeFileSync(join(OUT, name), Buffer.from(await font.arrayBuffer()));
    }
    css += `/* ${family} (${usedBy.join(', ')}) - ${subset} */\n${block.replace(remote, `./${files.get(remote)}`)}\n`;
    kept++;
  }
  if (!kept) throw new Error(`${family}: Google returned no latin blocks for ${url}`);
  console.log(`${family}: ${kept} faces`);
}

writeFileSync(join(OUT, 'demo-brands.css'), css);
console.log(`wrote demo-brands.css and ${files.size} font files -> .design-sync/fonts/`);
