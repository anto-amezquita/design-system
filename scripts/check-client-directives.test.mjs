/**
 * Tests for scripts/check-client-directives.mjs: which component sources need
 * 'use client', and which can stay server-renderable.
 */

import { describe, expect, it } from 'vitest'

import { missingDirectiveReasons } from './check-client-directives.mjs'

describe('missingDirectiveReasons', () => {
  it('flags a Radix import, including Slot', () => {
    const source = "import { Slot } from '@radix-ui/react-slot'\nexport function Link() {}"
    expect(missingDirectiveReasons(source)).toHaveLength(1)
  })

  it('flags context and client-only hooks', () => {
    expect(missingDirectiveReasons('const Ctx = createContext(null)')).toHaveLength(1)
    expect(missingDirectiveReasons('const [open, setOpen] = useState(false)')).toHaveLength(1)
  })

  it('flags an inline or locally defined event handler', () => {
    expect(missingDirectiveReasons('<button onClick={() => onRemove()} />')).toHaveLength(1)
    expect(missingDirectiveReasons('<a onClick={handleClick} />')).toHaveLength(1)
  })

  it('passes a component that only forwards the consumer’s own handler', () => {
    expect(missingDirectiveReasons('<a onClick={onClick} />')).toEqual([])
  })

  it('passes hooks that work in Server Components', () => {
    expect(missingDirectiveReasons('const id = useId()')).toEqual([])
  })

  it('passes a file that already has the directive, after a leading comment', () => {
    const source = "// Link\n'use client'\nimport { Slot } from '@radix-ui/react-slot'"
    expect(missingDirectiveReasons(source)).toEqual([])
  })
})
