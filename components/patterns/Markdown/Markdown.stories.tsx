import type { Meta, StoryObj } from '@storybook/react-vite'
import { Markdown } from './Markdown'
import { darkModeDecorator } from '@/lib/storybook'

const notes = `# Release 1.5.0

Thirty-four new components and readable **disabled states** across the library. Read the [changelog](https://design.amezquita.dk/changelog) for the full list.

## Highlights

- Date Picker, Combobox and Command Palette
- Every component in five brands, light and dark
- Disabled controls no longer fade to near-invisible

## Upgrading

1. Update the package
2. Run \`npx shadcn add\` for any component you copied

\`\`\`bash
npm install @amezquita/design-system@1.5.0
\`\`\`

> Breadth gets attention; depth is what survives a close look.

| Wave | Components |
| --- | --- |
| 1 Core gaps | 10 |
| 2 Forms | 14 |
| 3 Overlays and navigation | 10 |

---

Questions? Open an issue.
`

const meta: Meta<typeof Markdown> = {
  title: 'Components/Markdown',
  component: Markdown,
  args: {
    children: notes,
    headingOffset: 1,
  },
  argTypes: {
    children: { control: 'text' },
    headingOffset: { control: 'inline-radio', options: [0, 1, 2, 3] },
  },
}

export default meta
type Story = StoryObj<typeof Markdown>

export const Default: Story = {}

export const UntrustedInput: Story = {
  name: 'Untrusted input (raw HTML stays text)',
  args: {
    children: 'A model answered: <img src=x onerror="alert(1)"> and [a link](javascript:alert(1)). Neither runs.',
  },
}

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [darkModeDecorator],
}
