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

type TabsListProps = React.ComponentPropsWithoutRef<typeof RadixTabs.List>

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('tabs__list', className)}
      {...props}
    />
  )
}

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn('tabs__trigger', className)}
      {...props}
    />
  )
}

type TabsContentProps = React.ComponentPropsWithoutRef<typeof RadixTabs.Content>

export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <RadixTabs.Content
      className={cn('tabs__content', className)}
      {...props}
    />
  )
}
