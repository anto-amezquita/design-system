import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DataTable } from './DataTable'
import type { Column } from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'Patterns/DataTable',
  component: DataTable,
}

export default meta
type Story = StoryObj<typeof DataTable>

type Person = {
  name: string
  role: string
  department: string
  status: string
  joined: string
}

const columns: Column<Person>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'joined', label: 'Joined', sortable: true },
]

const data: Person[] = [
  { name: 'Sofia Andersen', role: 'Design Engineer', department: 'Product', status: 'Active', joined: '2022-09' },
  { name: 'Lars Møller', role: 'Frontend Developer', department: 'Engineering', status: 'Active', joined: '2021-03' },
  { name: 'Mia Christensen', role: 'Product Manager', department: 'Product', status: 'On leave', joined: '2020-11' },
  { name: 'Jonas Pedersen', role: 'UX Researcher', department: 'Design', status: 'Active', joined: '2023-01' },
  { name: 'Emma Nielsen', role: 'Content Designer', department: 'Marketing', status: 'Inactive', joined: '2019-06' },
  { name: 'Oliver Hansen', role: 'Backend Developer', department: 'Engineering', status: 'Active', joined: '2021-08' },
  { name: 'Astrid Larsen', role: 'Data Analyst', department: 'Product', status: 'Active', joined: '2022-04' },
  { name: 'Noah Eriksen', role: 'DevOps Engineer', department: 'Engineering', status: 'Active', joined: '2020-07' },
]

export const Default: Story = {
  render: () => (
    <DataTable<Person>
      columns={columns}
      data={data}
    />
  ),
}

export const Sortable: Story = {
  name: 'Sortable — sort state cycling',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Click a column header to sort. Click again to reverse. Click a third time to clear.
      </p>
      <DataTable<Person>
        columns={columns}
        data={data}
      />
    </div>
  ),
}

export const WithSelection: Story = {
  name: 'With row selection',
  render: () => {
    const [selected, setSelected] = useState<Person[]>([])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DataTable<Person>
          columns={columns}
          data={data}
          selectable
          onSelectionChange={setSelected}
        />
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {selected.length === 0
            ? 'No rows selected'
            : `Selected: ${selected.map(r => r.name).join(', ')}`}
        </p>
      </div>
    )
  },
}

function generateRows(count: number): Person[] {
  const roles = ['Design Engineer', 'Frontend Developer', 'Product Manager', 'UX Researcher', 'Content Designer']
  const departments = ['Product', 'Engineering', 'Design', 'Marketing']
  const statuses = ['Active', 'Inactive', 'On leave']
  return Array.from({ length: count }, (_, i) => ({
    name: `Team Member ${i + 1}`,
    role: roles[i % roles.length],
    department: departments[i % departments.length],
    status: statuses[i % statuses.length],
    joined: `${2018 + (i % 7)}-${String((i % 12) + 1).padStart(2, '0')}`,
  }))
}

export const WithPagination: Story = {
  name: 'With pagination (50 rows)',
  render: () => (
    <DataTable<Person>
      columns={columns}
      data={generateRows(50)}
      pageSize={8}
    />
  ),
}

export const WithPaginationAndSelection: Story = {
  name: 'Pagination + selection',
  render: () => {
    const [selected, setSelected] = useState<Person[]>([])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DataTable<Person>
          columns={columns}
          data={generateRows(30)}
          pageSize={5}
          selectable
          onSelectionChange={setSelected}
        />
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {selected.length} row{selected.length !== 1 ? 's' : ''} selected across all pages
        </p>
      </div>
    )
  },
}

export const Striped: Story = {
  render: () => (
    <DataTable<Person>
      columns={columns}
      data={data}
      striped
    />
  ),
}

export const Compact: Story = {
  render: () => (
    <DataTable<Person>
      columns={columns}
      data={data}
      compact
    />
  ),
}

export const Empty: Story = {
  name: 'Empty state',
  render: () => (
    <DataTable<Person>
      columns={columns}
      data={[]}
    />
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
    <DataTable<Person>
      columns={columns}
      data={data}
      striped
      selectable
    />
  ),
}
