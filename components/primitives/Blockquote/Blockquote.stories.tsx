import type { Meta, StoryObj } from '@storybook/react-vite'
import { Blockquote } from './Blockquote'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
  args: {
    size: 'default',
    children: 'Good design is as little design as possible. Less, but better, because it concentrates on the essential aspects.',
    attribution: 'Dieter Rams',
    source: 'Ten principles for good design',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'pull'] },
    attribution: { control: 'text' },
    source: { control: 'text' },
  },
  decorators: [Story => <div style={{ maxWidth: '36rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Blockquote>

export const Default: Story = {}

export const Bare: Story = {
  name: 'Without attribution',
  args: { attribution: undefined, source: undefined },
}

export const Pull: Story = {
  name: 'Pull quote',
  args: { size: 'pull', children: 'Less, but better.', source: undefined },
}

export const Paragraphs: Story = {
  render: () => (
    <Blockquote attribution="From the brand brief" cite="https://design.amezquita.dk">
      <p>Every colour, size and space comes from a token.</p>
      <p>A brand is a thin skin over the same components, never a second system.</p>
    </Blockquote>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-component-gap)' }}>
      <Blockquote attribution="Dieter Rams" source="Ten principles for good design">Less, but better.</Blockquote>
      <Blockquote size="pull" attribution="Dieter Rams">Less, but better.</Blockquote>
    </div>
  ),
  decorators: [darkModeDecorator],
}
