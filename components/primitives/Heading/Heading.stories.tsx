import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  args: {
    level: 1,
    children: 'The quick brown fox jumps over the lazy dog',
  },
  argTypes: {
    level: {
      control: 'radio',
      options: [1, 2, 3, 4, 5, 6],
    },
    as: {
      control: 'select',
      options: [undefined, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    children: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Heading>

export const H1: Story = {
  args: { level: 1, children: 'Design systems, built to last' },
}

export const H2: Story = {
  args: { level: 2, children: 'A shared visual language' },
}

export const H3: Story = {
  args: { level: 3, children: 'Tokens, components, and process' },
}

export const H4: Story = {
  args: { level: 4, children: 'Getting started' },
}

export const H5: Story = {
  args: { level: 5, children: 'Installation' },
}

export const AllLevels: Story = {
  name: 'All levels',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
    </div>
  ),
}

export const LevelAsDecoupling: Story = {
  name: 'Level/as decoupling',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading level={2}>
        Regular H2 — renders a real &lt;h2&gt;
      </Heading>
      <Heading level={1} as="h2">
        Big and bold, but a real &lt;h2&gt; — <code>level={'{1}'} as="h2"</code>, for a
        prominent section title that isn&apos;t the page&apos;s actual top-level heading
      </Heading>
      <Heading level={5} as="h1">
        Small and quiet, but a real &lt;h1&gt; — <code>level={'{5}'} as="h1"</code>, for
        pages where SEO/document-outline correctness requires an &lt;h1&gt; that
        shouldn&apos;t visually dominate the layout
      </Heading>
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllLevels,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
