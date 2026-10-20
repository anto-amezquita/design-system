import type { Meta, StoryObj } from '@storybook/react-vite'
import { AspectRatio } from './AspectRatio'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  args: {
    ratio: '16/9',
    fit: 'cover',
    rounded: true,
  },
  argTypes: {
    ratio: { control: 'select', options: ['1/1', '4/3', '3/2', '16/9', '21/9', '3/4', '9/16'] },
    fit: { control: 'inline-radio', options: ['cover', 'contain'] },
    rounded: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AspectRatio>

// A self-contained gradient image, so stories and Chromatic don't depend on the network.
const art = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">'
  + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b4a6f"/><stop offset="1" stop-color="#e3a86b"/></linearGradient></defs>'
  + '<rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="400" r="220" fill="#f4efe6" opacity="0.85"/></svg>',
)}`

const caption: React.CSSProperties = {
  margin: 'var(--space-tight-gap) 0 0',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-small)',
  color: 'var(--color-text-secondary)',
}

export const Default: Story = {
  render: args => (
    <div style={{ maxWidth: '32rem' }}>
      <AspectRatio {...args}><img src={art} alt="Abstract gradient with a pale circle at its centre" /></AspectRatio>
    </div>
  ),
}

export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 'var(--space-element-gap)', alignItems: 'start' }}>
      {(['1/1', '4/3', '3/2', '16/9', '21/9', '3/4', '9/16'] as const).map(r => (
        <figure key={r} style={{ margin: 0 }}>
          <AspectRatio ratio={r} rounded><img src={art} alt="" /></AspectRatio>
          <figcaption style={caption}>{r}</figcaption>
        </figure>
      ))}
    </div>
  ),
}

export const Contain: Story = {
  args: { ratio: '1/1', fit: 'contain' },
  render: args => (
    <div style={{ maxWidth: '20rem' }}>
      <AspectRatio {...args}><img src={art} alt="The whole image, letterboxed in a square" /></AspectRatio>
    </div>
  ),
}

export const Placeholder: Story = {
  name: 'Held space (no media yet)',
  render: () => (
    <div style={{ maxWidth: '32rem' }}>
      <AspectRatio ratio="16/9" rounded />
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-element-gap)', maxWidth: '32rem' }}>
      <AspectRatio ratio="4/3" rounded><img src={art} alt="Abstract gradient" /></AspectRatio>
      <AspectRatio ratio="4/3" rounded />
    </div>
  ),
  decorators: [darkModeDecorator],
}
