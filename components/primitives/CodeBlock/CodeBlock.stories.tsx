import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from './CodeBlock'
import { darkModeDecorator } from '@/lib/storybook'

const component = `import { Button } from '@amezquita/design-system/components/primitives/Button'

export function Save({ onSave }: { onSave: () => void }) {
  return (
    <Button variant="primary" onClick={onSave}>
      Save
    </Button>
  )
}`

const css = `.card {
  padding: var(--space-container-padding);
  border-radius: var(--border-radius-component);
  background: var(--color-surface-primary);
}`

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  args: {
    code: component,
    filename: 'Save.tsx',
    language: 'tsx',
    copyable: true,
    lineNumbers: false,
    wrap: false,
  },
  argTypes: {
    code: { control: 'text' },
    highlight: { control: 'object' },
  },
  decorators: [Story => <div style={{ maxWidth: '36rem' }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof CodeBlock>

export const Default: Story = {}

export const LineNumbersAndHighlight: Story = {
  name: 'Line numbers and highlighted lines',
  args: { lineNumbers: true, highlight: [5, 6, 7] },
}

export const LanguageOnly: Story = {
  name: 'Language only',
  args: { code: css, filename: undefined, language: 'css' },
}

export const Wrapped: Story = {
  args: { code: 'npm install @amezquita/design-system && npx shadcn add https://design.amezquita.dk/r/button.json', filename: undefined, language: 'bash', wrap: true },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  args: { lineNumbers: true, highlight: [5] },
  decorators: [darkModeDecorator],
}
