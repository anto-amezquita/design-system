'use client'

import { createContext, useContext } from 'react'

/**
 * The brand and mode a ThemeScope sets, for content that renders outside it.
 *
 * Overlays (AlertDialog, Dialog and Drawer through BaseSheet, Menu, Select,
 * Tooltip) portal their content to the end of <body>, outside any region that
 * set `data-brand` or `data-mode`, so it came out in the page's brand and mode
 * instead of the region's. Each overlay now spreads
 * `useThemeScopeAttributes()` onto the elements it portals. The brand CSS
 * matches an element that carries the attributes itself, so the content takes
 * the region's tokens without a wrapper: a wrapper would cut Radix's exit
 * animations short (its Presence watches the portal's direct child) and
 * nothing is added to the DOM, so decisions/0007's mount-order layering is
 * unchanged. (decisions/0021, specs/2026-10-05-theme-scope.md item 3.)
 *
 * Lives in lib/, not in the ThemeScope folder, so the overlays importing it
 * don't each gain a registry dependency on theme-scope.json.
 */

// Generated from the *-scoped.css files in styles/brands/ (scripts/build-theme-brands.mjs).
import type { ThemeBrand } from './theme-brands'
export type { ThemeBrand }
export type ThemeMode = 'light' | 'dark'
export type ThemeScopeValue = { brand?: ThemeBrand; mode?: ThemeMode }

export const ThemeScopeContext = createContext<ThemeScopeValue>({})

export function useThemeScope(): ThemeScopeValue {
  return useContext(ThemeScopeContext)
}

/** `data-brand` and `data-mode` for an element portalled out of a ThemeScope; empty outside one. */
export function useThemeScopeAttributes(): { 'data-brand'?: ThemeBrand; 'data-mode'?: ThemeMode } {
  const { brand, mode } = useThemeScope()
  return {
    ...(brand && { 'data-brand': brand }),
    ...(mode && { 'data-mode': mode }),
  }
}
