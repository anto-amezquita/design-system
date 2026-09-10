/**
 * tokens/changelog.json staleness — the one place the "ignore generatedAt"
 * comparison lives.
 *
 * This artifact is generated like the others, but it can't be treated like
 * them. `meta.generatedAt` changes on every single build, so a plain
 * `git diff` says "changed" even when nothing meaningful did. Every consumer
 * therefore has to compare *content* with that field nulled out — and before
 * this script that comparison was written inline in `chromatic.yml`, about to
 * be copied into the self-healing workflow. Same duplication the path list in
 * `generated-artifacts.mjs` was extracted to avoid.
 *
 * Two modes, one comparison:
 *
 *   node scripts/changelog-sync.mjs --check
 *       Exit 1 if the committed changelog's content differs from a fresh
 *       build. What chromatic.yml gates on.
 *
 *   node scripts/changelog-sync.mjs --restore-if-unchanged
 *       If only generatedAt moved, restore the committed file so nothing is
 *       committed. If the content genuinely changed, leave the rebuilt file
 *       in place so the self-healing workflow commits it.
 *
 * The second mode is what lets `tokens/changelog.json` join the self-healing
 * workflow's add-paths without the bot opening a PR on every push — see
 * specs/self-healing-ci-spec.md § "The path list".
 */

import { execFileSync } from 'child_process'
import { readFileSync } from 'fs'

const FILE = 'tokens/changelog.json'

function committedChangelog() {
  try {
    return JSON.parse(execFileSync('git', ['show', `HEAD:${FILE}`], { encoding: 'utf8' }))
  } catch {
    return null // not committed yet — treat as content-changed
  }
}

function contentMatches() {
  const committed = committedChangelog()
  if (committed === null) return false
  const current = JSON.parse(readFileSync(FILE, 'utf8'))
  committed.meta.generatedAt = current.meta.generatedAt = null
  return JSON.stringify(committed) === JSON.stringify(current)
}

const mode = process.argv[2]

if (mode === '--check') {
  if (contentMatches()) {
    console.log(`${FILE} in sync (ignoring meta.generatedAt).`)
    process.exit(0)
  }
  console.error(
    `${FILE} is out of sync with its source (ignoring generatedAt) — run \`npm run tokens\` and commit the result.`
  )
  process.exit(1)
}

if (mode === '--restore-if-unchanged') {
  if (contentMatches()) {
    execFileSync('git', ['checkout', '--', FILE], { stdio: 'inherit' })
    console.log(`${FILE}: only meta.generatedAt moved — restored, nothing to commit.`)
  } else {
    console.log(`${FILE}: content genuinely changed — left in place to be committed.`)
  }
  process.exit(0)
}

console.error('Usage: changelog-sync.mjs --check | --restore-if-unchanged')
process.exit(2)
