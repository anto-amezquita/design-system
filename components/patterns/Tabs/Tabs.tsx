'use client'

import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '../../../lib/cn'
import './Tabs.css'

type TabsProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Root> & {
  variant?: 'line' | 'pill'
  size?: 'sm' | 'md'
}

export function Tabs({ variant = 'line', size = 'md', className, ...props }: TabsProps) {
  const cls = cn('tabs', `tabs--${variant}`, `tabs--${size}`, className)

  return <RadixTabs.Root className={cls} {...props} />
}

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn('tabs__list', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn('tabs__trigger', className)}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cn('tabs__content', className)}
      {...props}
    />
  )
}
