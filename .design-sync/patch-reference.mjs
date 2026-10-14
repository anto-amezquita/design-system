// Gives the local reference storybook (.design-sync/sb-reference) the fonts
// the design-sync bundle ships, so the compare oracle grades against the real
// typeface instead of a fallback on both sides.
//
// Why: the reference storybook loads the brands' fonts from Google (via
// .storybook/main.ts, since 2026-10-14; before that it never loaded Schibsted
// Grotesk at all). The bundle self-hosts them from .design-sync/fonts/, and the
// oracle should grade against those same files, with no network.
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
