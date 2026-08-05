import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'Patterns/EmptyState',
  component: EmptyState,
}

export default meta
type Story = StoryObj<typeof EmptyState>

const SearchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const InboxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const FolderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<SearchIcon />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={{ label: 'Clear filters', onClick: () => {} }}
    />
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div style={{ border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <p style={{ margin: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>With icon + action</p>
        <EmptyState
          icon={<SearchIcon />}
          title="No results found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{ label: 'Clear filters', onClick: () => {} }}
        />
      </div>

      <div style={{ border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <p style={{ margin: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title + description only</p>
        <EmptyState
          title="Your inbox is empty"
          description="Messages from your team will appear here."
        />
      </div>

      <div style={{ border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <p style={{ margin: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title only</p>
        <EmptyState title="Nothing here yet" />
      </div>

      <div style={{ border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <p style={{ margin: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Primary action</p>
        <EmptyState
          icon={<FolderIcon />}
          title="No projects yet"
          description="Create your first project to get started."
          action={{ label: 'New project', onClick: () => {}, variant: 'primary' }}
        />
      </div>
    </div>
  ),
}

export const Compact: Story = {
  name: 'Compact (inline context)',
  render: () => (
    <div style={{ border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden', maxWidth: '480px' }}>
      <EmptyState
        icon={<InboxIcon />}
        title="No messages"
        description="Your inbox is empty."
        compact
      />
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [
    (Story) => (
      <div data-mode="dark" style={{ background: 'var(--color-surface-primary)', padding: '32px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <EmptyState
      icon={<SearchIcon />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={{ label: 'Clear filters', onClick: () => {} }}
    />
  ),
}
