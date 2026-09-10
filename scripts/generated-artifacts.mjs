/**
 * The one source for "which paths does `npm run tokens` generate".
 *
 * Every consumer that needs this list imports it from here or shells out to
 * this file — it is never retyped. Before this existed the list lived inline
 * in `.github/workflows/chromatic.yml` twice (the `git add -N` line and the
 * `git diff --exit-code` line); adding the self-healing workflow's `add-paths`
 * would have made it four copies of a list that has to stay identical, which
 * is the sync hazard `contributor-skills/governance-audit` exists to catch.
 * See `specs/self-healing-ci-spec.md` § "The path list".
 *
 * Usage:
 *   import { GENERATED_PATHS } from './generated-artifacts.mjs'
 *   node scripts/generated-artifacts.mjs        # one path per line (for add-paths)
 *
 * A directory entry keeps its trailing slash: `git add`/`git diff` treat it as
 * the whole subtree, and `create-pull-request`'s `add-paths` passes it to the
 * same git commands, so the two agree by construction.
 */

export const GENERATED_PATHS = [
  'tokens/dependency-graph.json',
  'tokens/token-reference.json',
  'tokens/component-registry.json',
  'styles/brands/',
  'tokens.json',
  'docs/components/',
  'llms.txt',
  'llms-full.txt',
  'registry/',
  'skills/',
]

// `tokens/changelog.json` is deliberately absent: it is generated, but its
// staleness is checked differently (ignoring `meta.generatedAt`, which changes
// on every build) by its own step in chromatic.yml, and it is written on main
// by that workflow's `update-changelog` job. Adding it here would make the
// self-healing workflow open a PR on every single push.

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(GENERATED_PATHS.join('\n'))
}
