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

// `tokens/changelog.json` is deliberately absent from GENERATED_PATHS: it is
// generated, but its staleness can't be judged by a plain `git diff`, because
// `meta.generatedAt` changes on every build. Its own comparison — content
// only, timestamp nulled — lives in `changelog-sync.mjs`.

/**
 * What the self-healing workflow is allowed to commit. GENERATED_PATHS plus
 * the changelog.
 *
 * The changelog is included here but not above because the workflow runs
 * `changelog-sync.mjs --restore-if-unchanged` first: if only `generatedAt`
 * moved, the committed file is put back and there is nothing to commit; if the
 * content genuinely changed, it stays and gets committed. Without that step
 * this list would make the bot open a PR on every single push forever.
 *
 * Why it has to be here at all: acceptance testing on 2026-09-10 found that
 * healing only GENERATED_PATHS leaves a drifting branch still red. Any
 * feat/fix/refactor/perf/style/docs commit touching tokens/, components/,
 * sd.config.mjs or styles/brands/ changes the changelog's content too, so the
 * bot fixed the component docs and `chromatic.yml`'s changelog step stayed
 * failing — leaving the human to run `npm run tokens` anyway, which is the
 * trip Phase 1 exists to save.
 */
export const SELF_HEAL_PATHS = [...GENERATED_PATHS, 'tokens/changelog.json']

// CLI: default prints GENERATED_PATHS (the strict staleness list);
// `--self-heal` prints the wider list the self-healing workflow commits.
if (import.meta.url === `file://${process.argv[1]}`) {
  const list = process.argv[2] === '--self-heal' ? SELF_HEAL_PATHS : GENERATED_PATHS
  console.log(list.join('\n'))
}
