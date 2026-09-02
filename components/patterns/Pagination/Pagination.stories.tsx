import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Patterns/Pagination',
  component: Pagination,
}

export default meta
type Story = StoryObj<typeof Pagination>

function PaginationDemo({ totalPages, initialPage = 1, compact = false, label }: { totalPages: number; initialPage?: number; compact?: boolean; label?: string }) {
  const [page, setPage] = useState(initialPage)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Page {page} of {totalPages}
      </p>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        compact={compact}
        label={label}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(5)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Page {page} of 10
        </p>
        <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
      </div>
    )
  },
}

export const EdgeCases: Story = {
  name: 'Edge cases',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>1 page</p>
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Renders nothing (totalPages ≤ 1)</p>
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>2 pages</p>
        <PaginationDemo totalPages={2} initialPage={1} label="Pagination, 2 pages" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>7 pages (no ellipsis)</p>
        <PaginationDemo totalPages={7} initialPage={4} label="Pagination, 7 pages" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>100 pages (ellipsis both sides)</p>
        <PaginationDemo totalPages={100} initialPage={50} label="Pagination, 100 pages" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>100 pages — near start (ellipsis end only)</p>
        <PaginationDemo totalPages={100} initialPage={3} label="Pagination, near start" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>100 pages — near end (ellipsis start only)</p>
        <PaginationDemo totalPages={100} initialPage={98} label="Pagination, near end" />
      </div>
    </div>
  ),
}

export const Compact: Story = {
  name: 'Compact (prev/next only)',
  render: () => <PaginationDemo totalPages={20} initialPage={10} compact />,
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
  render: () => <PaginationDemo totalPages={10} initialPage={5} />,
}
