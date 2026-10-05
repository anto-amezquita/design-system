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
  'tokens/fonts.json',
  'tokens/component-registry.json',
  'lib/theme-brands.ts',
  'styles/brands/',
  'tokens.json',
  'docs/components/',
  'llms.txt',
  'llms-full.txt',
  'registry/',
  'skills/',
]

// `tokens/changelog.json` is deliberately absent from GENERATED_PATHS: it is
// generated, but its staleness can't be judged by a plain `git diff`, because
// `meta.generatedAt` changes on every build. Its own comparison — content
// only, timestamp nulled — lives in `changelog-sync.mjs`.

/**
 * What the self-healing workflow is allowed to commit. The same list as
 * GENERATED_PATHS since decisions/0019.
 *
 * It used to add `tokens/changelog.json`, because chromatic.yml gated every
 * branch on the changelog being current, and healing only GENERATED_PATHS left
 * a drifting branch red (acceptance testing, 2026-09-10). But the changelog
 * lists commit SHAs, so almost every component commit made it stale, and the
 * bot opened a PR on nearly every component branch. 0019 removed the branch
 * gate and made main's update-changelog job the only owner, so the bot has no
 * reason to touch it. Kept as its own export so the workflow's `--self-heal`
 * call and any future divergence stay explicit.
 */
export const SELF_HEAL_PATHS = [...GENERATED_PATHS]

// CLI: default prints GENERATED_PATHS (the strict staleness list);
// `--self-heal` prints the wider list the self-healing workflow commits.
if (import.meta.url === `file://${process.argv[1]}`) {
  const list = process.argv[2] === '--self-heal' ? SELF_HEAL_PATHS : GENERATED_PATHS
  console.log(list.join('\n'))
}
