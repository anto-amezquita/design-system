import type { Meta, StoryObj } from '@storybook/react-vite'
import { Image } from './Image'
import { darkModeDecorator } from '@/lib/storybook'

// Self-contained images, so stories and Chromatic don't depend on the network.
const art = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">'
  + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b4a6f"/><stop offset="1" stop-color="#e3a86b"/></linearGradient></defs>'
  + '<rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="400" r="220" fill="#f4efe6" opacity="0.85"/></svg>',
)}`
const broken = 'data:image/png;base64,bm90LWFuLWltYWdl'

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  args: {
    src: art,
    alt: 'Abstract gradient with a pale circle at its centre',
    width: 1200,
    height: 800,
    rounded: true,
  },
  argTypes: {
    ratio: { control: 'select', options: [undefined, '1/1', '4/3', '3/2', '16/9', '21/9', '3/4', '9/16'] },
    fit: { control: 'inline-radio', options: ['cover', 'contain'] },
    rounded: { control: 'boolean' },
    loading: { control: 'inline-radio', options: ['lazy', 'eager'] },
    caption: { control: 'text' },
  },
  decorators: [Story => <div style={{ maxWidth: '32rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof Image>

export const Default: Story = {}

export const WithRatio: Story = {
  name: 'With a ratio',
  args: { ratio: '1/1' },
}

export const WithCaption: Story = {
  name: 'With a caption',
  args: { caption: 'The gradient the demo-warm brand started from.' },
}

export const Failed: Story = {
  name: 'Failed to load',
  args: { src: broken, alt: 'Team photo from the 2026 offsite', ratio: '16/9' },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-element-gap)' }}>
      <Image src={art} alt="Abstract gradient" ratio="4/3" rounded caption="Loaded" />
      <Image src={broken} alt="Team photo" ratio="4/3" rounded caption="Failed" />
    </div>
  ),
  decorators: [darkModeDecorator],
}
