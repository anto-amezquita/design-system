import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription, CardMedia } from './Card'
import { Button } from '@/components/primitives/Button/Button'
import { darkModeDecorator } from '@/lib/storybook'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'default',
    interactive: false,
    horizontal: false,
    compact: false,
    featured: false,
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'ghost'],
    },
    interactive: { control: 'boolean' },
    horizontal: { control: 'boolean' },
    compact: { control: 'boolean' },
    featured: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: '360px' }}>
      <Card {...args}>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Supporting text that describes the card content in one or two sentences.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="primary">Action</Button>
          <Button variant="ghost">Cancel</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => (
    <div style={{ maxWidth: '360px' }}>
      <Card {...args}>
        <CardHeader>
          <CardTitle>Ghost card</CardTitle>
          <CardDescription>No border — sits on a secondary background surface.</CardDescription>
        </CardHeader>
        <CardBody>
          <p style={{ margin: 0, fontSize: 'var(--font-size-body)' }}>Any content can live in the body slot.</p>
        </CardBody>
      </Card>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Card interactive onClick={() => alert('Card clicked')}>
        <CardHeader>
          <CardTitle>Interactive card</CardTitle>
          <CardDescription>Hover to see the shadow and border darkening. Click or press Enter/Space.</CardDescription>
        </CardHeader>
        <CardBody>
          <p style={{ margin: 0, fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)' }}>Keyboard accessible — tabIndex and role="button".</p>
        </CardBody>
      </Card>
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Card horizontal>
        <CardMedia>
          <div
            aria-hidden="true"
            style={{
              width: '200px',
              height: '100%',
              minHeight: '140px',
              background: 'var(--color-surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            Media
          </div>
        </CardMedia>
        <CardHeader>
          <CardTitle>Horizontal layout</CardTitle>
          <CardDescription>Media sits in a fixed-width left column, content flows on the right.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
}

export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Card compact>
        <CardHeader>
          <CardTitle>Compact card</CardTitle>
          <CardDescription>Half the standard padding — useful for denser layouts.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="secondary">Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const Featured: Story = {
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Card featured>
        <CardHeader>
          <CardTitle>Featured card</CardTitle>
          <CardDescription>Accent border signals this card is highlighted or promoted.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="primary">View</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const WithBody: Story = {
  name: 'With body',
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Card>
        <CardHeader>
          <CardTitle>With body section</CardTitle>
        </CardHeader>
        <CardBody>
          <CardDescription>The body slot has independent padding and stretches to fill available space. Useful for longer content.</CardDescription>
        </CardBody>
        <CardFooter>
          <Button variant="secondary">Learn more</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const WithMedia: Story = {
  name: 'With media',
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <Card>
        <CardMedia>
          <div
            aria-hidden="true"
            style={{
              height: '200px',
              background: 'var(--color-surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontFamily: 'var(--font-family-base)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Media
          </div>
        </CardMedia>
        <CardHeader>
          <CardTitle>With media</CardTitle>
          <CardDescription>The media slot is full-bleed — no padding, flush to card edges.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="primary">Open</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {[
        { label: 'Default', props: {} },
        { label: 'Ghost', props: { variant: 'ghost' as const } },
        { label: 'Interactive', props: { interactive: true } },
        { label: 'Compact', props: { compact: true } },
        { label: 'Featured', props: { featured: true } },
      ].map(({ label, props }) => (
        <div key={label} style={{ maxWidth: '220px' }}>
          <Card {...props} onClick={props.interactive ? () => {} : undefined}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Card description text.</CardDescription>
            </CardHeader>
            {/* A clickable card renders as <button> — nesting a Button inside it
                is invalid HTML and an axe nested-interactive violation. */}
            {!props.interactive && (
              <CardFooter>
                <Button variant="secondary">Action</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      ))}
    </div>
  ),
}

export const DarkMode: Story = {
  ...AllVariants,
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
