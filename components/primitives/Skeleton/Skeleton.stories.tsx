import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    variant: 'text',
  },
  argTypes: {
    variant: { control: 'select', options: ['text', 'circle', 'rect'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Text: Story = {
  args: { variant: 'text' },
  decorators: [(Story) => <div style={{ width: '240px' }}><Story /></div>],
}

export const MultiLine: Story = {
  name: 'Text (multi-line)',
  args: { variant: 'text', lines: 3 },
  decorators: [(Story) => <div style={{ width: '240px' }}><Story /></div>],
}

export const Circle: Story = {
  args: { variant: 'circle', width: 40, height: 40 },
}

export const Rect: Story = {
  args: { variant: 'rect', width: 240, height: 120 },
}

export const CardSkeleton: Story = {
  name: 'Card skeleton (composed)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
      <Skeleton variant="rect" height={160} />
      <Skeleton variant="text" />
      <Skeleton variant="text" lines={2} />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  ...CardSkeleton,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
