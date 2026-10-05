/**
 * Every element a component portals out of the page carries the nearest
 * ThemeScope's attributes (decisions/0021). A portal renders at the end of
 * <body>, outside the scope, so an element that doesn't spread
 * useThemeScopeAttributes() comes out in the page's brand and mode instead.
 *
 * ThemeScope.test.tsx checks the behaviour for the overlays that exist; this
 * catches the next one, which nothing else would until someone opens it in a
 * scoped region. Static: for each `<X.Portal>…</X.Portal>` in a component
 * file, every `<X.Content` and `<X.Overlay` inside must have `{...scope}` in
 * its opening tag, and the file must call `useThemeScopeAttributes()`.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function componentFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return componentFiles(path)
    return /\.tsx$/.test(name) && !/\.(stories|test)\.tsx$/.test(name) ? [path] : []
  })
}

/** The opening tag starting at `start`, through its closing `>`, skipping `>` inside `{…}`. */
function openingTag(source, start) {
  let depth = 0
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    else if (ch === '>' && depth === 0) return source.slice(start, i + 1)
  }
  return source.slice(start)
}

/** Portalled Content/Overlay opening tags in a file, each with whether it spreads the scope. */
export function portalledElements(source) {
  const found = []
  for (const block of source.matchAll(/<(\w+)\.Portal\b[\s\S]*?<\/\1\.Portal>/g)) {
    const [text] = block
    for (const el of text.matchAll(/<(\w+)\.(Content|Overlay)\b/g)) {
      const tag = openingTag(text, el.index)
      found.push({ element: `${el[1]}.${el[2]}`, scoped: tag.includes('{...scope}') })
    }
  }
  return found
}

const files = componentFiles('components').filter(f => /<\w+\.Portal\b/.test(readFileSync(f, 'utf8')))

describe('portalled elements follow the ThemeScope', () => {
  it('finds the components that portal', () => {
    // AlertDialog, BaseSheet (Dialog, Drawer), Menu, Select, Tooltip as of 1.3.1.
    expect(files.length).toBeGreaterThanOrEqual(5)
  })

  it.each(files)('%s', file => {
    const source = readFileSync(file, 'utf8')
    const elements = portalledElements(source)
    expect(elements.length, 'a Portal with no Content or Overlay inside').toBeGreaterThan(0)
    expect(source, 'calls useThemeScopeAttributes()').toMatch(/useThemeScopeAttributes\(\)/)
    expect(elements.filter(e => !e.scoped).map(e => e.element), 'portalled elements without {...scope}').toEqual([])
  })
})

describe('portalledElements', () => {
  it('reads a multi-line opening tag with arrow functions in it', () => {
    const source = `<D.Portal>
      <D.Overlay {...scope} className="o" />
      <D.Content
        onClick={() => go(a > b)}
        className="c"
      >hi</D.Content>
    </D.Portal>`
    expect(portalledElements(source)).toEqual([
      { element: 'D.Overlay', scoped: true },
      { element: 'D.Content', scoped: false },
    ])
  })
})
