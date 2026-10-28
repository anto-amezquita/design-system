/**
 * Consumer type check: the shipped source compiles without @types/node.
 *
 * This package ships raw .ts/.tsx, so every app compiles it with its own
 * TypeScript and its own `types`. Since TypeScript 6, `types` defaults to [],
 * so an app no longer gets Node's globals unless it lists "node" itself.
 * FinFam hit this in 1.6.3: Checkbox, Input and Select used
 * process.env.NODE_ENV and failed with "Cannot find name 'process'".
 *
 * The repo's own typecheck can't catch it: tsconfig.json lists "node", and
 * lib/storybook.tsx pulls Node's types in through Storybook's own types.
 * This check compiles what an app compiles (components, lib, hooks, without
 * tests, stories and the Storybook helper) with only "vite/client".
 *
 * Exit codes: 0 = pass, 1 = type errors an app would see.
 */

import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
// In the repo root, so `types` resolves against this repo's node_modules.
const configPath = join(root, 'tsconfig.consumer-check.json')

const config = {
  extends: './tsconfig.json',
  compilerOptions: { types: ['vite/client'] },
  include: ['components', 'lib', 'hooks'],
  // lib/storybook.tsx is a helper for this repo's own stories; apps don't import it.
  exclude: ['**/*.test.*', '**/*.stories.*', '**/*-test-utils.ts', 'lib/storybook.tsx', 'node_modules'],
}

writeFileSync(configPath, JSON.stringify(config, null, 2))
let result
try {
  result = spawnSync(join(root, 'node_modules', '.bin', 'tsc'), ['--noEmit', '-p', configPath], {
    cwd: root,
    encoding: 'utf8',
  })
} finally {
  rmSync(configPath, { force: true })
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
if (result.error || result.status !== 0) {
  console.error('✗ Consumer type check failed: an app without @types/node would see these errors.\n')
  console.error(output || String(result.error))
  process.exit(1)
}
console.log('✓ Consumer type check passed: components, lib and hooks compile without @types/node')
