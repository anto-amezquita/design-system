'use client'

import { forwardRef } from 'react'
import { ThemeScopeContext, useThemeScope, type ThemeMode } from '../../../lib/theme-scope'
import type { ThemeBrand } from '../../../lib/theme-brands'

// Native <div> attributes pass through (decisions/0007).
type ThemeScopeProps = React.ComponentPropsWithoutRef<'div'> & {
  /** A brand for this part of the page: one this package ships, or a project's own (any other name). Needs that brand's scoped CSS loaded: `styles/brands/<brand>-scoped.css` for a brand this package ships (`portfolio-scoped.css`), or the `<brand>-scoped.css` a project builds with `amezquita-brand build`. Left out, the part keeps the brand around it. */
  // Spelled out rather than lib/theme-scope's ThemeScopeBrand, so the compiled
  // docs can expand the package's brand names (they resolve one import deep).
  brand?: ThemeBrand | (string & {})
  /** `light` or `dark` for this part of the page. Left out, the part follows the mode around it. */
  mode?: ThemeMode
}

/**
 * Gives one part of a page its own brand, mode, or both. It renders a `<div>`
 * with `data-brand` and `data-mode`, and overlays opened inside it (Dialog,
 * Drawer, AlertDialog, Menu, Select, Tooltip) take the same brand and mode,
 * although they render at the end of `<body>`. A scope inside another takes
 * what it doesn't set from the outer one. Toasts stay page-level.
 */
export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { brand, mode, children, ...rest },
  ref,
) {
  const outer = useThemeScope()
  const value = { brand: brand ?? outer.brand, mode: mode ?? outer.mode }
  return (
    <ThemeScopeContext.Provider value={value}>
      <div {...rest} ref={ref} data-brand={brand} data-mode={mode}>
        {children}
      </div>
    </ThemeScopeContext.Provider>
  )
})
