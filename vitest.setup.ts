// Registers jest-dom's DOM matchers (toHaveAttribute, toBeInTheDocument, …)
// for the `unit` project. The `storybook` project doesn't use this file — its
// assertions run inside play functions, which get their matchers from
// storybook/test instead.
import '@testing-library/jest-dom/vitest'

// Testing Library normally self-registers this via a detected global
// `afterEach`, but this project runs without Vitest's `globals: true`
// (deliberately — global test APIs are one more implicit thing to keep
// straight against the storybook project's own conventions), so the
// auto-registration never fires. Without it, every render after the first
// in a file stays mounted and later queries can match stale elements from
// an earlier test — exactly what happened on this file's first run.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
