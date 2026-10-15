import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard'
import { ThemeScope } from '../ThemeScope'
import { Avatar } from '../../primitives/Avatar'
import { Link } from '../../primitives/Link'
import { Button } from '../../primitives/Button'

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  decorators: [Story => <div style={{ minBlockSize: '16rem', padding: '1rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof HoverCard>

function Profile() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-element-gap)' }}>
      <Avatar fallback="AQ" alt="" size="lg" />
      <div style={{ display: 'grid', gap: 'var(--space-tight-gap)' }}>
        <strong>Ana Quispe</strong>
        <span style={{ color: 'var(--color-text-secondary)' }}>Design systems lead, Lima. Writes about tokens and accessibility.</span>
        <div style={{ display: 'flex', gap: 'var(--space-inline-gap)', alignItems: 'center' }}>
          <Link href="#ana">View profile</Link>
          <Button variant="secondary">Follow</Button>
        </div>
      </div>
    </div>
  )
}

export const Default: Story = {
  name: 'Profile preview',
  render: args => (
    <p>
      Reviewed by{' '}
      <HoverCard {...args}>
        <HoverCardTrigger><Link href="#ana">@ana</Link></HoverCardTrigger>
        <HoverCardContent aria-label="Ana Quispe"><Profile /></HoverCardContent>
      </HoverCard>
      {' '}and <Link href="#mikkel">@mikkel</Link>.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: '@ana' })
    // The trigger keeps its own role and name; no popup semantics are added.
    await expect(link).not.toHaveAttribute('aria-haspopup')
  },
}

export const PagePreview: Story = {
  name: 'Page preview',
  render: args => (
    <p style={{ maxInlineSize: '32rem' }}>
      Contrast is checked in every brand; see{' '}
      <HoverCard {...args}>
        <HoverCardTrigger><Link href="#contrast">decisions/0014</Link></HoverCardTrigger>
        <HoverCardContent aria-label="decisions/0014">
          <strong>0014 · Contrast pairs are tested, not assumed</strong>
          <p style={{ margin: 'var(--space-tight-gap) 0 0', color: 'var(--color-text-secondary)' }}>
            Every text and control colour pair is listed and checked in all ten brand and mode combinations on each build.
          </p>
        </HoverCardContent>
      </HoverCard>.
    </p>
  ),
}

export const Danish: Story = {
  render: args => (
    <p>
      Godkendt af{' '}
      <HoverCard {...args}>
        <HoverCardTrigger><Link href="#mikkel">Mikkel Sørensen</Link></HoverCardTrigger>
        <HoverCardContent aria-label="Mikkel Sørensen">
          <strong>Mikkel Sørensen</strong>
          <p style={{ margin: 'var(--space-tight-gap) 0 0', color: 'var(--color-text-secondary)' }}>Frontendudvikler, Aarhus.</p>
        </HoverCardContent>
      </HoverCard>
    </p>
  ),
}

export const KeyboardOpen: Story = {
  name: 'Opened from the keyboard',
  tags: ['!autodocs'],
  render: args => (
    <p>
      Reviewed by{' '}
      <HoverCard {...args} openDelay={0}>
        <HoverCardTrigger><Link href="#ana">@ana</Link></HoverCardTrigger>
        <HoverCardContent aria-label="Ana Quispe"><Profile /></HoverCardContent>
      </HoverCard>
    </p>
  ),
  play: async () => {
    await userEvent.tab()
    await waitFor(() => expect(within(document.body).getByRole('group', { name: 'Ana Quispe' })).toBeVisible())
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  tags: ['!autodocs'],
  render: args => (
    <ThemeScope mode="dark" style={{ background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)', padding: '32px', minBlockSize: '16rem' }}>
      <p>
        Reviewed by{' '}
        <HoverCard {...args} defaultOpen>
          <HoverCardTrigger><Link href="#ana">@ana</Link></HoverCardTrigger>
          <HoverCardContent aria-label="Ana Quispe"><Profile /></HoverCardContent>
        </HoverCard>
      </p>
    </ThemeScope>
  ),
  play: async () => {
    await waitFor(() => expect(within(document.body).getByRole('group', { name: 'Ana Quispe' }).closest('[data-mode]')).toHaveAttribute('data-mode', 'dark'))
  },
}
