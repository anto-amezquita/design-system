import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Tag } from './Tag'
import { StarIcon, TagIcon } from '@phosphor-icons/react'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  args: {
    children: 'Tag label',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'accent', 'muted'],
    },
    children: { control: 'text' },
    removable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
}

export const Accent: Story = {
  args: { variant: 'accent', children: 'Accent' },
}

export const Muted: Story = {
  args: { variant: 'muted', children: 'Muted' },
}

export const WithIcon: Story = {
  name: 'With icon',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag icon={<StarIcon size={12} />}>Featured</Tag>
      <Tag variant="accent" icon={<TagIcon size={12} />}>Accent with icon</Tag>
      <Tag variant="muted" icon={<TagIcon size={12} />}>Muted with icon</Tag>
    </div>
  ),
}

export const Removable: Story = {
  name: 'Removable',
  render: () => {
    const [tags, setTags] = useState(['Design systems', 'React', 'Next.js', 'Typography'])
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            removable
            onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
          >
            {tag}
          </Tag>
        ))}
        {tags.length === 0 && (
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            All tags removed
          </span>
        )}
      </div>
    )
  },
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Tag variant="default">Default</Tag>
      <Tag variant="accent">Accent</Tag>
      <Tag variant="muted">Muted</Tag>
      <Tag icon={<StarIcon size={12} />}>With icon</Tag>
      <Tag removable onRemove={() => {}}>Removable</Tag>
    </div>
  ),
}

export const InContext: Story = {
  name: 'In context',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Tag>Design systems</Tag>
      <Tag>React</Tag>
      <Tag variant="accent">Featured</Tag>
      <Tag variant="muted">Archive</Tag>
      <Tag>Next.js</Tag>
      <Tag>Typography</Tag>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllVariants,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
