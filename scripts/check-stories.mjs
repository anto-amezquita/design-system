/**
 * Story coverage check — two requirements:
 *
 * 1. Every component directory under components/{primitives,composition,patterns}/
 *    must contain a .stories.tsx file.
 *
 * 2. Every .stories.tsx file must contain a dark-mode story (detected by a
 *    `data-mode="dark"` wrapper — use `darkModeDecorator` from lib/storybook).
 *    The rendered-story a11y audit only sees what stories render; without a
 *    dark story a component's dark rendering is unaudited.
 *
 * Exit codes: 0 = pass, 1 = failures found.
 */

import { readdirSync, existsSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

const TIERS = ['components/primitives', 'components/composition', 'components/patterns']

// Internal building-block components that are not meant to be used standalone.
// Dialog and Drawer wrap BaseSheet and own its stories.
const EXCLUDED = new Set(['BaseSheet'])

function getComponentDirs(tier) {
  try {
    return readdirSync(tier).filter(name => {
      const full = join(tier, name)
      return statSync(full).isDirectory()
    })
  } catch {
    return []
  }
}

const missing = []
const missingDark = []
let storyFileCount = 0

// Matches data-mode="dark", data-mode='dark', and the JSX expression forms
// data-mode={'dark'} / data-mode={"dark"} — a literal-string match on the
// double-quoted form alone false-negatives on any of the others, flagging a
// story as missing dark coverage when it already has it.
const DARK_MODE_ATTR = /data-mode=(?:\{\s*)?(["'])dark\1(?:\s*\})?/

function checkDarkStory(storyFile) {
  storyFileCount++
  const content = readFileSync(storyFile, 'utf8')
  // Either the shared decorator or an inline data-mode="dark" wrapper counts.
  if (!content.includes('darkModeDecorator') && !DARK_MODE_ATTR.test(content)) {
    missingDark.push(storyFile)
  }
}

for (const tier of TIERS) {
  for (const name of getComponentDirs(tier)) {
    if (EXCLUDED.has(name)) continue
    const storyFile = join(tier, name, `${name}.stories.tsx`)
    if (!existsSync(storyFile)) {
      missing.push({ tier, name, storyFile })
    } else {
      checkDarkStory(storyFile)
    }
  }
}

if (missing.length === 0 && missingDark.length === 0) {
  console.log(`✓ Story coverage check passed — ${storyFileCount} story files, all with dark-mode stories`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`\n✗ Story coverage: ${missing.length} component(s) missing a .stories.tsx file\n`)
  for (const { tier, name, storyFile } of missing) {
    console.error(`  ${tier}/${name}  →  add ${storyFile}`)
  }
  console.error(`\n  Add it manually following Button.stories.tsx as a template.\n`)
}

if (missingDark.length > 0) {
  console.error(`\n✗ Dark-mode coverage: ${missingDark.length} story file(s) without a dark-mode story\n`)
  for (const f of missingDark) {
    console.error(`  ${f}`)
  }
  console.error(`\n  Add a DarkMode story using darkModeDecorator from lib/storybook.tsx —`)
  console.error(`  spread the richest existing story: { ...AllStates, name: 'Dark mode', decorators: [darkModeDecorator] }\n`)
}

process.exit(1)
