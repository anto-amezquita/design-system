'use client'

import { useRef, useEffect } from 'react'
import * as RadixAccordion from '@radix-ui/react-accordion'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import './Accordion.css'

type AccordionSingleProps = {
  type: 'single'
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  collapsible?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

type AccordionMultipleProps = {
  type: 'multiple'
  defaultValue?: string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

type AccordionProps = AccordionSingleProps | AccordionMultipleProps

export function Accordion({ className, ...props }: AccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cls = cn('accordion', className)

  // Set data-mounted after hydration so the open animation only fires on user
  // interaction, not on items that are already open via defaultValue on mount.
  useEffect(() => {
    rootRef.current?.setAttribute('data-mounted', '')
  }, [])

  if (props.type === 'single') {
    const { type, ...rest } = props as AccordionSingleProps
    return <RadixAccordion.Root ref={rootRef} className={cls} type={type} {...rest} />
  }
  const { type, ...rest } = props as AccordionMultipleProps
  return <RadixAccordion.Root ref={rootRef} className={cls} type={type} {...rest} />
}

type AccordionItemProps = {
  value: string
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <RadixAccordion.Item
      className={cn('accordion__item', className)}
      {...props}
    />
  )
}

type AccordionTriggerProps = {
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>, 'className'>

export function AccordionTrigger({ children, className, ...rest }: AccordionTriggerProps) {
  return (
    <RadixAccordion.Header className="accordion__header">
      <RadixAccordion.Trigger
        className={cn('accordion__trigger', className)}
        {...rest}
      >
        <span className="accordion__trigger-label">{children}</span>
        <CaretDownIcon
          className="accordion__icon"
          size={20}
          weight="bold"
          aria-hidden="true"
        />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  )
}

type AccordionContentProps = {
  children: React.ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <RadixAccordion.Content
      className={cn('accordion__content', className)}
    >
      <div className="accordion__body">{children}</div>
    </RadixAccordion.Content>
  )
}
