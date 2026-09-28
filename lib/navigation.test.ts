import { describe, expect, test } from 'vitest'
import { groupContainsHref, isCurrentHref, isNavGroup, type NavGroup } from './navigation'

const group: NavGroup = {
  id: 'docs',
  label: 'Docs',
  items: [
    { id: 'intro', label: 'Intro', href: '/docs/intro' },
    { id: 'tokens', label: 'Tokens', href: '/docs/tokens' },
  ],
}

describe('lib/navigation', () => {
  test('isNavGroup tells groups from links', () => {
    expect(isNavGroup(group)).toBe(true)
    expect(isNavGroup(group.items[0])).toBe(false)
  })

  test('isCurrentHref is an exact match, and false with no currentHref', () => {
    expect(isCurrentHref('/docs', '/docs')).toBe(true)
    expect(isCurrentHref('/docs', '/docs/intro')).toBe(false)
    expect(isCurrentHref('/docs', undefined)).toBe(false)
  })

  test('groupContainsHref finds the current link inside a group', () => {
    expect(groupContainsHref(group, '/docs/tokens')).toBe(true)
    expect(groupContainsHref(group, '/docs')).toBe(false)
  })
})
