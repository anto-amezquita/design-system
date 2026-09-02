import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table, TableHead, TableBody, TableFoot, TableRow, TableHeader, TableCell, TableCaption } from './Table'

const meta: Meta<typeof Table> = {
  title: 'Patterns/Table',
  component: Table,
}

export default meta
type Story = StoryObj<typeof Table>

const sampleHeaders = ['Name', 'Role', 'Status', 'Joined']
const sampleRows = [
  ['Sofia Andersen', 'Design Engineer', 'Active', '2022-09'],
  ['Lars Møller', 'Frontend Developer', 'Active', '2021-03'],
  ['Mia Christensen', 'Product Manager', 'On leave', '2020-11'],
  ['Jonas Pedersen', 'UX Researcher', 'Active', '2023-01'],
  ['Emma Nielsen', 'Content Designer', 'Inactive', '2019-06'],
]

function SampleTable({ striped = false, bordered = false, compact = false, scrollLabel }: { striped?: boolean; bordered?: boolean; compact?: boolean; scrollLabel?: string }) {
  return (
    <Table striped={striped} bordered={bordered} compact={compact} scrollLabel={scrollLabel}>
      <TableHead>
        <TableRow>
          {sampleHeaders.map(h => <TableHeader key={h}>{h}</TableHeader>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleRows.map(row => (
          <TableRow key={row[0]}>
            {row.map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          {sampleHeaders.map(h => <TableHeader key={h}>{h}</TableHeader>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleRows.map(row => (
          <TableRow key={row[0]}>
            {row.map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => <SampleTable striped />,
}

export const Bordered: Story = {
  render: () => <SampleTable bordered />,
}

export const Compact: Story = {
  render: () => <SampleTable compact />,
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Default</p>
        <SampleTable scrollLabel="Default table" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Striped</p>
        <SampleTable striped scrollLabel="Striped table" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bordered</p>
        <SampleTable bordered scrollLabel="Bordered table" />
      </div>
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Compact</p>
        <SampleTable compact scrollLabel="Compact table" />
      </div>
    </div>
  ),
}

export const WithCaption: Story = {
  name: 'With caption',
  render: () => (
    <Table>
      <TableCaption>Team members — Q2 2026</TableCaption>
      <TableHead>
        <TableRow>
          {sampleHeaders.map(h => <TableHeader key={h}>{h}</TableHeader>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleRows.slice(0, 3).map(row => (
          <TableRow key={row[0]}>
            {row.map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithFoot: Story = {
  name: 'With footer row',
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Product</TableHeader>
          <TableHeader>Units</TableHeader>
          <TableHeader>Revenue</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>Design System Pro</TableCell><TableCell>142</TableCell><TableCell>DKK 284,000</TableCell></TableRow>
        <TableRow><TableCell>Component Kit</TableCell><TableCell>89</TableCell><TableCell>DKK 89,000</TableCell></TableRow>
        <TableRow><TableCell>Token Toolkit</TableCell><TableCell>204</TableCell><TableCell>DKK 204,000</TableCell></TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>435</TableCell>
          <TableCell>DKK 577,000</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ),
}

export const HorizontalScroll: Story = {
  name: 'Horizontal scroll (narrow container)',
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Department</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Joined</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sampleRows.map(row => (
            <TableRow key={row[0]}>
              <TableCell>{row[0]}</TableCell>
              <TableCell>{row[1]}</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Copenhagen</TableCell>
              <TableCell>{row[2]}</TableCell>
              <TableCell>{row[3]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
  render: () => <SampleTable striped />,
}
