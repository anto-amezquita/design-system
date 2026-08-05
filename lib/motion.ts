import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

// Signature ease: fast commitment to slight overshoot, slow confident settle
// SVG path — not expressible as CSS cubic-bezier; GSAP CustomEase only
CustomEase.create('expand', 'M0,0 C0.15,0 0.3,1.06 0.4,1.06 C0.6,1.06 0.88,1.002 1,1')

export const ease = {
  in: 'power2.in',
  expand: 'expand',
  out: 'power2.out',
  inOut: 'power2.inOut',
  reveal: 'power3.out',
} as const

// Note: this is a trimmed copy of the portfolio's lib/motion.ts — scoped to
// just what Button needs (the `ease` map + the 'expand' CustomEase). The
// portfolio's version also exports scroll/reveal choreography helpers
// (getEntryOffset, createLineMask, onCurtainReveal, dur) used by its own
// page-transition and reveal-on-scroll components — those are site-specific
// and intentionally not part of this package.
