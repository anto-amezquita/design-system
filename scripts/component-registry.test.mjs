/**
 * Tests for tokens/component-registry.json's Storybook fields (1.3.1): the
 * path comes from each story file's `title`, and defaultStoryId is the id
 * Storybook itself gives the first story. Both were wrong for some
 * components before, so every link built from them opened a missing page.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { sanitize, storyNameFromExport, toId } from 'storybook/internal/csf'
import { describe, expect, it } from 'vitest'

const registry = JSON.parse(readFileSync('tokens/component-registry.json', 'utf8'))
const topLevel = registry.components.filter(c => !c.parent && !c.internal)

describe('component-registry.json Storybook fields', () => {
  it.each(topLevel.map(c => [c.name, c]))('%s: path is the story file’s title, ids are Storybook’s', (name, c) => {
    const story = readFileSync(join('components', c.tier, name, `${name}.stories.tsx`), 'utf8')
    const title = story.match(/^\s*title:\s*['"]([^'"]+)['"]/m)?.[1]
    expect(c.storybookPath).toBe(title)
    expect(c.storybookTitleId).toBe(sanitize(title))
    expect(c.defaultStoryId).toBe(toId(title, storyNameFromExport(c.stories[0])))
  })

  it('files the ones that had drifted where Storybook does', () => {
    const byName = Object.fromEntries(topLevel.map(c => [c.name, c]))
    expect(byName.Accordion.storybookPath).toBe('Patterns/Accordion')
    expect(byName.Radio.storybookPath).toBe('Components/RadioGroup')
    expect(byName.Heading.defaultStoryId).toBe('components-heading--h-1')
  })

  it('sub-components point at their parent’s story', () => {
    const cardBody = registry.components.find(c => c.name === 'CardBody')
    expect(cardBody.defaultStoryId).toBe(topLevel.find(c => c.name === 'Card').defaultStoryId)
  })
})
