/**
 * Generated-artifact staleness check — run after `npm run tokens` in CI.
 *
 * Fails if rebuilding produced a diff against the committed tree, i.e. someone
 * changed a generator's input (a component's props, a token value) and didn't
 * commit the regenerated output.
 *
 * `git add -N` (intent-to-add) first: plain `git diff` is silent about
 * brand-new untracked files — e.g. a new component's docs/components/ twin —
 * so a rebuild that only *adds* a file would pass unnoticed without this.
 *
 * The path list lives in `generated-artifacts.mjs`, not here — the
 * self-healing workflow scopes its commit to the same list, and the two must
 * not drift (see specs/self-healing-ci-spec.md § "The path list").
 *
 * Exit codes: 0 = in sync, 1 = stale artifacts found.
 */

import { spawnSync } from 'child_process'
import { GENERATED_PATHS } from './generated-artifacts.mjs'

function git(...args) {
  return spawnSync('git', args, { stdio: 'inherit' })
}

git('add', '-N', ...GENERATED_PATHS)
const diff = git('diff', '--exit-code', ...GENERATED_PATHS)

if (diff.status !== 0) {
  console.error(
    '\nGenerated artifacts are out of sync with their source — run `npm run tokens` and commit the result.'
  )
  process.exit(1)
}

console.log(`Generated artifacts in sync (${GENERATED_PATHS.length} paths checked).`)
