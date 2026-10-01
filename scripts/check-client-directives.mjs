/**
 * Client-directive check: every component that needs the browser says so.
 *
 * A component file that uses client-only React (state and effect hooks,
 * context, inline event handlers) or imports Radix (Slot included) must start
 * with 'use client'. Without it, a Next.js App Router consumer can't render
 * the component from a Server Component: the build fails with
 * "createContext is not a function" or "Event handlers cannot be passed to
 * Client Component props".
 *
 * Nothing else in validate catches this. The tests and Storybook render in a
 * browser, where the directive means nothing, so Link, SkipLink and Tag
 * shipped without it until the docs site (design-system-site), a real
 * App Router consumer, hit it in 1.1.1.
 *
 * Components that use none of these (Heading, Badge, Hero…) stay without the
 * directive on purpose: they render on the server with no client JavaScript.
 *
 * Exit codes: 0 = pass, 1 = failures found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TIERS = ['components/primitives', 'components/composition', 'components/patterns']

// useId and use() work in Server Components; every other built-in hook doesn't.
const SERVER_SAFE_HOOKS = new Set(['useId', 'use'])

const CHECKS = [
  {
    reason: 'imports Radix (its primitives, Slot included, use React context)',
    test: source => /from\s+['"]@radix-ui\//.test(source),
  },
  {
    reason: 'creates or reads React context',
    test: source => /\b(createContext|useContext)\b/.test(source),
  },
  {
    reason: 'calls a client-only hook',
    test: source =>
      [...source.matchAll(/\b(use[A-Z]\w*)\s*\(/g)].some(m => !SERVER_SAFE_HOOKS.has(m[1])),
  },
  {
    // An inline arrow or function, or a locally defined handle*, passed to an
    // on* prop. Forwarding the consumer's own prop (onClick={onClick}) is fine
    // on the server, so it isn't flagged.
    reason: 'defines an event handler',
    test: source => /\bon[A-Z]\w*=\{\s*(\(|[A-Za-z_$][\w$]*\s*=>|function\b|handle[A-Z])/.test(source),
  },
]

const DIRECTIVE = /^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)\s*)*['"]use client['"]/

/** The reasons a component file needs 'use client'. Empty if it doesn't, or if it already has it. */
export function missingDirectiveReasons(source) {
  if (DIRECTIVE.test(source)) return []
  return CHECKS.filter(check => check.test(source)).map(check => check.reason)
}

function componentFiles(projectDir) {
  const files = []
  for (const tier of TIERS) {
    const tierDir = join(projectDir, tier)
    for (const name of readdirSync(tierDir)) {
      const dir = join(tierDir, name)
      if (!statSync(dir).isDirectory()) continue
      for (const file of readdirSync(dir)) {
        if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && !file.endsWith('.test.tsx')) {
          files.push(join(tier, name, file))
        }
      }
    }
  }
  return files
}

function run() {
  const projectDir = process.cwd()
  const failures = componentFiles(projectDir)
    .map(file => ({ file, reasons: missingDirectiveReasons(readFileSync(join(projectDir, file), 'utf8')) }))
    .filter(f => f.reasons.length > 0)

  if (failures.length === 0) {
    console.log('✓ Client directives: every component that needs the browser starts with \'use client\'')
    process.exit(0)
  }

  console.error(`\n✗ ${failures.length} component file(s) need 'use client' as their first line:\n`)
  for (const { file, reasons } of failures) {
    console.error(`  ${file}`)
    for (const reason of reasons) console.error(`    — ${reason}`)
  }
  console.error(
    '\n  Without it, a Next.js App Router consumer can\'t render the component from a Server Component.' +
    '\n  Add \'use client\' at the top of the file. If the component shouldn\'t need the browser,' +
    '\n  move the client-only part into a child component that has the directive instead.\n',
  )
  process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}
