import type { Meta, StoryObj } from '@storybook/react-vite'
import { Citation } from './Citation'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Citation> = {
  title: 'Components/Citation',
  component: Citation,
  args: {
    href: '#source-1',
    index: 1,
    title: 'Ten principles for good design',
    external: false,
  },
  argTypes: {
    index: { control: 'number' },
    external: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Citation>

const text: React.CSSProperties = {
  margin: 0,
  maxWidth: '36rem',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-primary)',
}

const sources = [
  ['Ten principles for good design', 'Vitsœ'],
  ['WCAG 2.2: Non-text contrast', 'w3.org'],
] as const

export const Default: Story = {
  render: args => <p style={text}>Good design is as little design as possible.<Citation {...args} /></p>,
}

export const InAnAnswer: Story = {
  name: 'In an answer, with sources',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-element-gap)' }}>
      <p style={text}>
        Good design is as little design as possible<Citation href="#source-1" index={1} title={sources[0][0]} />,
        and icons on their own need 3:1 contrast against what's around them<Citation href="#source-2" index={2} title={sources[1][0]} />.
      </p>
      <ol style={{ ...text, fontSize: 'var(--font-size-small)', lineHeight: 'var(--line-height-small)', color: 'var(--color-text-secondary)', paddingInlineStart: 'var(--space-element-gap)' }}>
        {sources.map(([title, site], i) => <li key={title} id={`source-${i + 1}`}>{title}, {site}</li>)}
      </ol>
    </div>
  ),
}

export const SourceChips: Story = {
  name: 'Source chips',
  render: () => (
    <p style={text}>
      The Bauhaus ran from 1919 to 1933<Citation href="https://en.wikipedia.org/wiki/Bauhaus" source="Wikipedia" title="Bauhaus" external />.
    </p>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <p style={text}>
      Less, but better<Citation href="#source-1" index={1} title={sources[0][0]} />,
      as the Bauhaus taught<Citation href="https://en.wikipedia.org/wiki/Bauhaus" source="Wikipedia" title="Bauhaus" external />.
    </p>
  ),
  decorators: [darkModeDecorator],
}
