'use client'

import * as RadixTooltip from '@radix-ui/react-tooltip'
import './Tooltip.css'

// Read delay and offset directly from the compiled CSS tokens so they stay in
// sync when token values change. Cached after first read; falls back to the
// token default if the CSS variable is not yet available (e.g. SSR).
function readCssInt(property: string, fallback: number): number {
  if (typeof document === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const parsed = parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

let _cachedDelay: number | null = null
let _cachedOffset: number | null = null

function getTooltipDelay(): number {
  return (_cachedDelay ??= readCssInt('--tooltip-delay-duration', 400))
}

function getTooltipSideOffset(): number {
  return (_cachedOffset ??= readCssInt('--tooltip-side-offset', 6))
}

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactElement
  side?: TooltipSide
  delayDuration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

type TooltipProviderProps = {
  children: React.ReactNode
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}

export function TooltipProvider({ children, delayDuration, skipDelayDuration, disableHoverableContent }: TooltipProviderProps) {
  return (
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {children}
    </RadixTooltip.Provider>
  )
}

export function Tooltip({ content, children, side = 'top', delayDuration, open, defaultOpen, onOpenChange }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration ?? getTooltipDelay()} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixTooltip.Trigger asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className="tooltip" side={side} sideOffset={getTooltipSideOffset()}>
          {content}
          <RadixTooltip.Arrow className="tooltip__arrow" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
