import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarGroup } from './Avatar'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    alt: 'Antonio Amezquita',
    size: 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    src: { control: 'text' },
    alt: { control: 'text' },
    fallback: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  name: 'With image',
  args: {
    src: 'https://github.com/shadcn.png',
    alt: 'User avatar',
  },
}

export const WithFallback: Story = {
  name: 'Fallback (initials from alt)',
  args: { alt: 'Antonio Amezquita' },
}

export const WithCustomFallback: Story = {
  name: 'Fallback (custom)',
  args: { fallback: 'AA' },
}

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar size="sm" alt="User sm" />
      <Avatar size="md" alt="User md" />
      <Avatar size="lg" alt="User lg" />
      <Avatar size="xl" alt="User xl" />
    </div>
  ),
}

export const Group: Story = {
  name: 'AvatarGroup',
  render: () => (
    <AvatarGroup>
      <Avatar alt="Alice Brown" />
      <Avatar alt="Bo Chen" />
      <Avatar alt="Diana Evans" />
    </AvatarGroup>
  ),
}

export const GroupWithOverflow: Story = {
  name: 'AvatarGroup (overflow)',
  render: () => (
    <AvatarGroup max={3}>
      <Avatar alt="Alice Brown" />
      <Avatar alt="Bo Chen" />
      <Avatar alt="Diana Evans" />
      <Avatar alt="Frank Garcia" />
      <Avatar alt="Helen Ida" />
    </AvatarGroup>
  ),
}

export const DarkMode: Story = {
  ...AllSizes,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
