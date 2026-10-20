import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './Text'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  args: {
    size: 'body',
    tone: 'primary',
    weight: 'body',
    truncate: false,
    children: 'Every colour, size and space comes from a token, so a brand is a thin skin over the same components.',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['body', 'small', 'caption'] },
    tone: { control: 'inline-radio', options: ['primary', 'secondary', 'inherit'] },
    weight: { control: 'inline-radio', options: ['body', 'label'] },
    truncate: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Text>

export const Default: Story = {
  render: args => <div style={{ maxWidth: '36rem' }}><Text {...args} /></div>,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)', maxWidth: '36rem' }}>
      <Text>Body. Running text in articles, descriptions and dialogs.</Text>
      <Text size="small" tone="secondary">Small. Hints under a field, metadata on a card.</Text>
      <Text size="caption" tone="secondary">Caption. Figure captions, timestamps, fine print.</Text>
    </div>
  ),
}

export const Emphasis: Story = {
  render: () => (
    <div style={{ maxWidth: '36rem' }}>
      <Text>
        Release 1.5.0 adds <Text as="strong" weight="label">ten components</Text> and <Text as="em" tone="inherit">no breaking changes</Text>.
      </Text>
    </div>
  ),
}

export const Truncated: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)', maxWidth: '16rem' }}>
      <Text truncate title="brand-brief-final-final-v3-approved.pdf">brand-brief-final-final-v3-approved.pdf</Text>
      <Text size="small" tone="secondary" truncate={2}>
        Every colour, size and space comes from a token, so a brand is a thin skin over the same components.
      </Text>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)', maxWidth: '36rem' }}>
      <Text>Body text in dark mode.</Text>
      <Text size="small" tone="secondary">Small, secondary.</Text>
      <Text size="caption" tone="secondary" weight="label">Caption, label weight.</Text>
    </div>
  ),
  decorators: [darkModeDecorator],
}
