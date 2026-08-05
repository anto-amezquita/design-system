/**
 * Generates tokens/changelog.json from git history.
 *
 * Parses conventional commit messages and groups them by version (git tags).
 * Commits since the last tag appear in "unreleased".
 * Requires git history — CI must use fetch-depth: 0.
 *
 * Called from sd.config.mjs after buildComponentRegistry().
 *
 * Output shape:
 *   {
 *     meta: { generatedAt: string }  ← only field that changes per-run
 *     versions: VersionEntry[]       ← one per git tag, newest first
 *     unreleased: CommitEntry[]      ← commits since last tag (or all if no tags)
 *   }
 */

import { execFileSync } from 'child_process'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

// Commit types to include — filter out noisy maintenance types
const INCLUDED_TYPES = new Set(['feat', 'fix', 'refactor', 'perf', 'style', 'docs'])

const TYPE_LABELS = {
  feat:     'Features',
  fix:      'Fixes',
  refactor: 'Refactoring',
  perf:     'Performance',
  style:    'Style',
  docs:     'Documentation',
}

// ── Git helpers ───────────────────────────────────────────────

// execFileSync bypasses the shell entirely, so tag names and refs
// (which come from git history, not user input) can never be interpreted
// as shell metacharacters — no quoting/escaping needed.
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch (err) {
    // Swallowed on purpose (e.g. `git log` on a range with no commits yet
    // exits non-zero) — but surface it so a real misconfiguration (shallow
    // clone missing history, corrupted repo) doesn't silently render as an
    // empty changelog with no signal anywhere in the build output.
    console.warn(`[build-changelog] git ${args.join(' ')} failed: ${err.message.split('\n')[0]}`)
    return ''
  }
}

function getTags() {
  const raw = git(['tag', '-l', '--sort=-v:refname'])
  return raw ? raw.split('\n').filter(Boolean) : []
}

function getTagSha(tag) {
  return git(['rev-list', '-n1', tag]).slice(0, 7)
}

function getTagDate(tag) {
  return git(['log', '-1', '--format=%ai', tag]).slice(0, 10)
}

// ── Commit parsing ────────────────────────────────────────────

// Paths that constitute the design system — commits must touch at least one
const DS_PATHS = ['tokens/', 'components/', 'sd.config.mjs', 'styles/brands/']

function parseCommits(range) {
  const raw = git(['log', range, '--format=%H|%s|%ai', '--no-merges', '--', ...DS_PATHS])
  if (!raw) return []

  return raw.split('\n').map(line => {
    const [sha, ...rest] = line.split('|')
    const date = rest[rest.length - 1]?.slice(0, 10) ?? ''
    const subject = rest.slice(0, -1).join('|')

    const m = subject.match(/^(feat|fix|refactor|perf|style|docs|test|chore|build|ci)(\([^)]+\))?!?:\s*(.+)/)
    if (!m) return null

    const type = m[1]
    if (!INCLUDED_TYPES.has(type)) return null

    return {
      sha: sha.slice(0, 7),
      type,
      scope: m[2] ? m[2].slice(1, -1) : null,
      message: m[3].trim(),
      date,
      breaking: subject.includes('!:') || subject.toLowerCase().includes('breaking change'),
    }
  }).filter(Boolean)
}

// ── Main build ────────────────────────────────────────────────

export function buildChangelog() {
  const tags = getTags()

  // Ranges: HEAD..tag[0], tag[0]..tag[1], tag[1]..tag[2], ...
  const versions = []
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]
    const prevTag = tags[i + 1] // older tag, or undefined (= beginning of history)
    const range = prevTag ? `${prevTag}..${tag}` : tag

    const commits = parseCommits(range)
    versions.push({
      tag,
      date: getTagDate(tag),
      sha: getTagSha(tag),
      entries: commits,
      entryCount: commits.length,
    })
  }

  // Commits since latest tag (= unreleased)
  const unreleasedRange = tags.length > 0 ? `${tags[0]}..HEAD` : 'HEAD'
  const unreleased = parseCommits(unreleasedRange)

  const changelog = {
    meta: {
      // generatedAt changes on every regeneration by design — the CI sync
      // check ignores this field when comparing the committed changelog
      // against a freshly built one.
      generatedAt: new Date().toISOString().slice(0, 10),
    },
    versions,
    unreleased,
    typeLabels: TYPE_LABELS,
  }

  writeFileSync('tokens/changelog.json', JSON.stringify(changelog, null, 2))
  console.log(`✓ Built changelog.json (${versions.length} versions, ${unreleased.length} unreleased commits)`)
}

// Run as main
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildChangelog()
}
