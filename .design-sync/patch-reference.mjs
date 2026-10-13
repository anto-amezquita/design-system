// Gives the local reference storybook (.design-sync/sb-reference) the fonts
// the design-sync bundle ships, so the compare oracle grades against the real
// typeface instead of a fallback on both sides.
//
// Why: .storybook/storybook.css sets --font-family-base/heading to 'Schibsted
// Grotesk', but .storybook/preview-head.html only loads DM Sans, DM Serif
// Display, Inter and JetBrains Mono - Schibsted Grotesk never loads, so the
// repo's storybook renders the fallback sans-serif. The bundle self-hosts
// Schibsted Grotesk + JetBrains Mono from .design-sync/fonts/.
//
// Run after every reference rebuild:
//   npx storybook build -c .storybook -o .design-sync/sb-reference
//   node .design-sync/patch-reference.mjs

import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const HERE = import.meta.dirname;
const REF = resolve(HERE, 'sb-reference');
const MARK = '<!-- design-sync: self-hosted fonts -->';

cpSync(join(HERE, 'fonts'), join(REF, 'ds-fonts'), { recursive: true });
const iframe = join(REF, 'iframe.html');
const html = readFileSync(iframe, 'utf8');
if (html.includes(MARK)) {
  console.log('reference already patched');
} else {
  writeFileSync(iframe, html.replace('<head>', `<head>\n${MARK}\n<link rel="stylesheet" href="./ds-fonts/fonts.css">`));
  console.log('patched', iframe);
}
