import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Patterns/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'radio', options: ['line', 'pill'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" style={{ maxWidth: '480px' }}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          An overview of the selected item appears here. This is the default active tab.
        </p>
      </TabsContent>
      <TabsContent value="details">
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Detailed information about the item, including all metadata and configuration.
        </p>
      </TabsContent>
      <TabsContent value="history">
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          A log of all changes made to this item over time.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '480px' }}>
      <div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Line (default)</p>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Design</TabsTrigger>
            <TabsTrigger value="tab2">Code</TabsTrigger>
            <TabsTrigger value="tab3">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Design content</TabsContent>
          <TabsContent value="tab2">Code content</TabsContent>
          <TabsContent value="tab3">Preview content</TabsContent>
        </Tabs>
      </div>

      <div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pill</p>
        <Tabs defaultValue="tab1" variant="pill">
          <TabsList>
            <TabsTrigger value="tab1">Design</TabsTrigger>
            <TabsTrigger value="tab2">Code</TabsTrigger>
            <TabsTrigger value="tab3">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Design content</TabsContent>
          <TabsContent value="tab2">Code content</TabsContent>
          <TabsContent value="tab3">Preview content</TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '480px' }}>
      <div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medium (default)</p>
        <Tabs defaultValue="tab1" size="md">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Overview content</TabsContent>
          <TabsContent value="tab2">Details content</TabsContent>
        </Tabs>
      </div>

      <div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Small</p>
        <Tabs defaultValue="tab1" size="sm">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Overview content</TabsContent>
          <TabsContent value="tab2">Details content</TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

export const WithDisabledTab: Story = {
  name: 'With disabled tab',
  render: () => (
    <Tabs defaultValue="active" style={{ maxWidth: '480px' }}>
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active">This tab is active and accessible.</TabsContent>
      <TabsContent value="disabled">This tab cannot be reached.</TabsContent>
      <TabsContent value="another">Another accessible tab.</TabsContent>
    </Tabs>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '480px' }}>
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Design</TabsTrigger>
          <TabsTrigger value="tab2">Code</TabsTrigger>
          <TabsTrigger value="tab3">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>Design content in dark mode.</p>
        </TabsContent>
        <TabsContent value="tab2">Code content</TabsContent>
        <TabsContent value="tab3">Preview content</TabsContent>
      </Tabs>

      <Tabs defaultValue="tab1" variant="pill">
        <TabsList>
          <TabsTrigger value="tab1">Design</TabsTrigger>
          <TabsTrigger value="tab2">Code</TabsTrigger>
          <TabsTrigger value="tab3">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Design content</TabsContent>
        <TabsContent value="tab2">Code content</TabsContent>
        <TabsContent value="tab3">Preview content</TabsContent>
      </Tabs>
    </div>
  ),
}
