/**
 * Breakpoints for JS, mirroring the `breakpoint.*` tokens in tokens/global.json
 * (decisions/0018). Hand-written rather than generated: it's two numbers, and
 * lib/breakpoints.test.ts fails if they ever drift from the tokens.
 *
 * Mobile-first, like the CSS: each value is where that range starts. Below
 * `tablet` is mobile, with no name of its own.
 */
export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

/** `(min-width: <n>px)` for `window.matchMedia` — the same query component CSS writes. */
export function mediaQuery(name: BreakpointName): string {
  return `(min-width: ${BREAKPOINTS[name]}px)`
}
