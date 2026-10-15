/**
 * Text matching for typeahead lists (Combobox, Multi-select, Tag Input).
 * Case- and accent-insensitive, so "peru" finds "Perú" and "sao" finds
 * "São Paulo". Letters that don't decompose (æ, ø) match only themselves.
 */

/** Lower case with accents removed. Keeps the length of the text the same where it can. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/**
 * Where `query` appears in `text`, as [start, end) in `text`'s own
 * characters, or null. Matches at the start of a word come first, so "an"
 * in "Santander, Anholt" marks "An", not "an" inside Santander.
 */
export function matchRange(text: string, query: string): [number, number] | null {
  const q = normalize(query.trim())
  if (!q) return null
  // Map each normalized character back to its index in the original text.
  const map: number[] = []
  let flat = ''
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i])
    for (let j = 0; j < n.length; j++) map.push(i)
    flat += n
  }
  const wordStart = new RegExp(`(^|[^\\p{L}\\p{N}])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u').exec(flat)
  const at = wordStart ? wordStart.index + wordStart[1].length : flat.indexOf(q)
  if (at < 0) return null
  const start = map[at]
  const end = map[at + q.length - 1] + 1
  return [start, end]
}

/** True when `query` appears in `text`. */
export function matches(text: string, query: string): boolean {
  return matchRange(text, query) !== null
}

/** Sorts matches at the start of the text first, then at the start of a word, then the rest; keeps the order otherwise. */
export function rankMatches<T>(items: T[], query: string, text: (item: T) => string): T[] {
  const q = normalize(query.trim())
  if (!q) return items
  const rank = (s: string) => {
    const n = normalize(s)
    if (n.startsWith(q)) return 0
    const r = matchRange(s, query)
    if (!r) return 3
    return r[0] === 0 || /[^\p{L}\p{N}]/u.test(s[r[0] - 1]) ? 1 : 2
  }
  return items
    .map((item, i) => ({ item, i, r: rank(text(item)) }))
    .filter(x => x.r < 3)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.item)
}
