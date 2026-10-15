/**
 * Test helper: the WCAG contrast ratio between an element's text colour and
 * the background behind it (its own, or the first opaque one up the tree,
 * or the page surface). For checks that the real CSS keeps text readable.
 */

const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)

const luminance = ([r, g, b]: number[]) => {
  const ch = [r, g, b].map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function backgroundOf(el: Element): number[] {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = parse(getComputedStyle(node).backgroundColor)
    if (bg.length >= 3 && (bg[3] === undefined || bg[3] > 0)) return bg
  }
  // Nothing opaque: the page surface.
  const probe = document.createElement('div')
  probe.style.background = 'var(--color-surface-primary)'
  document.body.append(probe)
  const bg = parse(getComputedStyle(probe).backgroundColor)
  probe.remove()
  return bg
}

export function contrastOf(el: Element): number {
  const fg = luminance(parse(getComputedStyle(el).color))
  const bg = luminance(backgroundOf(el))
  const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg]
  return (hi + 0.05) / (lo + 0.05)
}
