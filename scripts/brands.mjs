/**
 * The brand skins in tokens/brands, for every script that resolves tokens per
 * theme axis. A brand is any folder there other than base: a thin set of
 * overrides on base (decisions/0001), with tokens.json for light and dark.json
 * for dark. sd.config.mjs finds them the same way.
 *
 * Sorted, so the axis order (and every file generated from it) doesn't depend
 * on the file system.
 */

import { readdirSync, readFileSync } from 'fs'

export function listBrands(dir = 'tokens/brands') {
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'base')
    .map(d => d.name)
    .sort()
}

// [{ name, light, dark }], the raw override files of each brand.
export function loadBrands(dir = 'tokens/brands') {
  return listBrands(dir).map(name => ({
    name,
    light: JSON.parse(readFileSync(`${dir}/${name}/tokens.json`, 'utf8')),
    dark: JSON.parse(readFileSync(`${dir}/${name}/dark.json`, 'utf8')),
  }))
}

// Every theme axis, in cascade order: base first, then each brand's light and dark.
export function axisNames(brands) {
  return ['base-light', 'base-dark', ...brands.flatMap(b => [`${b.name ?? b}-light`, `${b.name ?? b}-dark`])]
}
