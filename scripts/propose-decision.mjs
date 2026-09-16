#!/usr/bin/env node
/**
 * propose-decision.mjs — the harvesting half of the living memory layer.
 *
 * Reads a Claude Code session transcript and, when the session shows signs of
 * an actual decision, writes an ADR-shaped DRAFT to `decisions/proposed/`.
 * A draft is raw evidence, not a decision: quoted turns, ordered by the
 * priority `docs/backlog.md` set out (rejected alternatives first, then
 * component decisions, then AI-readiness reasoning), with the reasoning left
 * for a human or a skill-guided agent to write.
 *
 * Why harvesting and drafting are split: noticing that a decision happened has
 * to be automatic — that is the entire point of the backlog entry — but the
 * evidence is the part that is expensive to reconstruct a week later, not the
 * prose. See `contributor-skills/decision-proposal/SKILL.md` for the half this
 * script deliberately does not do, and `decisions/0009-*.md` for the decision.
 *
 * SAFETY CONTRACT — asserted by `scripts/propose-decision.test.ts`, not left to
 * convention, because this script writes into the folder that holds the repo's
 * decision record:
 *   1. It never runs a mutating git command. The only git it shells out to is
 *      read-only (`branch --show-current`, `diff --stat`). Nothing here stages,
 *      commits, or pushes — acceptance is a human act.
 *   2. It only ever writes inside `decisions/proposed/`. The output path is
 *      constructed here and re-checked before the write; a path that escapes
 *      that folder throws rather than writing.
 *   3. Drafts are named `*.draft.md` and never match the `NNNN-slug.md` shape a
 *      real ADR uses, so a draft cannot be mistaken for an accepted decision.
 *   4. `.gitignore` excludes `decisions/proposed/*.draft.md`, so even a
 *      `git add -A` cannot sweep an unreviewed draft into a commit.
 *
 * Usage:
 *   node scripts/propose-decision.mjs --harvest        # write a draft if warranted
 *   node scripts/propose-decision.mjs --check          # report only, write nothing
 *   node scripts/propose-decision.mjs --harvest --transcript <path>
 *
 * Invoked by the SessionEnd hook in `.claude/settings.json`, which pipes the
 * hook payload (transcript_path, session_id, cwd) in on stdin. Run by hand with
 * no stdin, it falls back to the newest transcript for this project.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// --- configuration ------------------------------------------------------

/**
 * The three things worth logging, in the priority order `docs/backlog.md`
 * argues for. Order matters twice: it decides which sections a draft leads
 * with, and `rejected` alone clears the write threshold below because it was
 * flagged as the most urgent and most perishable of the three.
 */
const CATEGORIES = [
  {
    id: 'rejected',
    heading: 'Rejected alternatives',
    note: 'Priority 1 — the most perishable. An option ruled out leaves no trace in the code, so if the reasoning is not captured here it is gone.',
    patterns: [
      /\brejected\b/i,
      /\bdecided against\b/i,
      /\bruled out\b/i,
      /\bconsidered (?:but|and rejected)\b/i,
      /\binstead of\b/i,
      /\brather than\b/i,
      /\bwe could have\b/i,
      /\bnot doing\b/i,
      /\bdeliberately (?:not|skipped|left out)\b/i,
      /\bchose .{1,60}\bover\b/i,
      /\bwent with .{1,60}\binstead\b/i,
    ],
  },
  {
    id: 'component',
    heading: 'Component decisions and their reasoning',
    note: 'Priority 2 — e.g. why a prop is a literal union instead of a boolean. The code shows what was chosen; only this shows why.',
    // Needs a components/** edit in the same turn as well — see harvest().
    patterns: [
      /\bbecause\b/i,
      /\bso that\b/i,
      /\bthe reason\b/i,
      /\bliteral union\b/i,
      /\bunion\b.{0,40}\bboolean\b/i,
      /\bprop\b.{0,60}\b(?:because|instead|rather)\b/i,
      /\bpublic API\b/i,
      /\bbreaking change\b/i,
    ],
  },
  {
    id: 'ai-readiness',
    heading: 'AI-readiness and agent-safety reasoning',
    note: 'Priority 3 — distinct from ordinary design taste. Why a guardrail exists, why an agent-facing surface is shaped the way it is.',
    patterns: [
      /\bagent[- ]safe(?:ty)?\b/i,
      /\bAI[- ]readiness\b/i,
      /\bguardrail\b/i,
      /\blint rule\b/i,
      /\bMCP\b/,
      /\bllms(?:-full)?\.txt\b/i,
      /\btoken-reference\b/i,
      /\bfor an agent\b/i,
      /\bmachine[- ]readable\b/i,
    ],
  },
];

/** A causal clause, required alongside the topic match for the looser categories. */
const CAUSAL = /\b(?:because|since|so that|the reason|which is why|otherwise|in order to)\b/i;

/**
 * Vocabulary specific to a component's public surface. This exists to settle a
 * real collision: the backlog's own example of a priority-2 component decision
 * is "why a prop is a literal union instead of a boolean" — phrased with the
 * same "instead of" that marks a priority-1 rejected alternative. Priority
 * order alone would file every such sentence under `rejected` and leave the
 * component section permanently empty. A sentence that talks about a component's
 * API, in a turn that edited a component, is a component decision first.
 */
const COMPONENT_API =
  /\b(?:prop|props|variant|literal union|union|boolean|public API|API surface|asChild|forwardRef|className|ref\b|slot)\b/i;

/**
 * How many turns away an edit still counts as "this prose is about that edit".
 * Reasoning rarely shares a turn with the Edit call that follows it — the agent
 * explains, then calls the tool, sometimes several turns later. Measured
 * against real transcripts in this repo: a same-turn requirement found zero
 * component decisions in a session that made 34 component edits.
 */
const COMPONENT_TURN_WINDOW = 2;

/** Prose that looks like reasoning but is the agent narrating its own plan. */
const NOISE = [
  /^(?:let me|i'll|i will|now let me|next,? i)\b/i,
  /^(?:reading|checking|looking at|running)\b/i,
  /^(?:done|all set|that's it)\b/i,
];

/**
 * Talk *about* the work rather than reasoning *within* it — asking the user
 * what to do next, restating their instructions, flagging a permission
 * boundary. This filter earns its place: on a real transcript from this repo,
 * three of five "rejected alternative" hits were sentences like "Since you
 * asked to leave this on the branch rather than merge" — the rejection
 * patterns matching process talk, not a design call.
 */
const CONVERSATIONAL = [
  /\byou (?:asked|told|said|want|wanted|gave|instructed)\b/i,
  /\bwhat would you like\b/i,
  /\blet me know\b/i,
  /\bunless you want\b/i,
  /\bi'm (?:surfacing|flagging|asking)\b/i,
  /\bwithout you telling me\b/i,
  /\byour (?:review|call|decision)\b/i,
  /\bshall i\b/i,
  /\bworth writing down\b/i,
];

const MAX_ITEMS_PER_SECTION = 8;
const MAX_QUOTE_CHARS = 420;

/**
 * Below this, no draft is written. Suppression is the feature: a folder that
 * fills with a draft per session gets ignored within a week, which is the same
 * failure mode as having no drafts at all. A single rejected-alternative signal
 * is enough on its own (priority 1); anything else needs two.
 */
const MIN_SIGNALS = 2;

// --- transcript reading -------------------------------------------------

/** Read the hook payload from stdin, if a hook piped one in. */
function readHookPayload() {
  if (process.stdin.isTTY) return {};
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return {};
  }
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Claude Code slugifies the project path to name its transcript folder. */
function transcriptDirFor(projectDir) {
  const slug = projectDir.replace(/[/.]/g, '-');
  return path.join(os.homedir(), '.claude', 'projects', slug);
}

/** Newest transcript for this project — the fallback when run by hand. */
function newestTranscript(projectDir) {
  const dir = transcriptDirFor(projectDir);
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => path.join(dir, f))
    .map((p) => ({ p, mtime: fs.statSync(p).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length ? files[0].p : null;
}

/** Tools that edit a file and name it outright in `file_path`. */
const FILE_PATH_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit', 'MultiEdit']);

/**
 * A Bash command that writes rather than reads. Necessary because a shell is a
 * first-class way to edit files here — this repo's own agent instructions
 * prefer `sed`/heredocs over the Edit tool in some modes, and a harvester that
 * only understood `Edit`/`Write` was blind to all of it: the priority-2
 * component section could never fire, and the "session already wrote an ADR"
 * suppression could be defeated by writing that ADR through a heredoc.
 */
const BASH_WRITE =
  /(?:>>?|\btee\b|\bsed\s+-i\b|\bcp\b|\bmv\b|\bmkdir\b|\.write\(|\bopen\([^)]*['"]w['"])/;

/** Repo-ish file paths mentioned in a command. Deliberately conservative. */
const PATH_LIKE = /(?<![\w/.-])((?:[\w.-]+\/)*[\w.-]+\.(?:tsx?|jsx?|css|mjs|cjs|json|md))\b/g;

/**
 * Every file a tool call plausibly wrote.
 *
 * For Bash this is a heuristic and is documented as one: it extracts path-like
 * tokens only from commands that also look like writes, so `cat decisions/0007-*.md`
 * does not register as authoring an ADR. It will miss a path built from a
 * variable, and it can over-collect from a long command. Over-collecting is the
 * cheap direction — it only widens which turns count as component-adjacent —
 * which is why the filter sits on the command, not on the path.
 */
function editedPaths(block) {
  if (FILE_PATH_TOOLS.has(block.name)) {
    const file = block.input?.file_path ?? block.input?.notebook_path;
    return typeof file === 'string' ? [file] : [];
  }

  if (block.name === 'Bash') {
    const command = block.input?.command;
    if (typeof command !== 'string' || !BASH_WRITE.test(command)) return [];
    return [...command.matchAll(PATH_LIKE)].map((m) => m[1]);
  }

  return [];
}

/**
 * Flatten the transcript into one record per assistant turn: the prose it
 * wrote, and the files it edited. Both halves are needed together — a
 * components/** edit is only a decision worth logging if reasoning came with
 * it, and reasoning is only attributable if the edit is known.
 */
export function parseTranscript(jsonl) {
  const turns = [];
  let index = 0;

  for (const line of jsonl.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try {
      entry = JSON.parse(trimmed);
    } catch {
      continue; // a partially written final line is normal, not an error
    }
    if (entry.type !== 'assistant' || entry.isSidechain) continue;

    const content = entry.message?.content;
    if (!Array.isArray(content)) continue;

    const texts = [];
    const edits = [];
    for (const block of content) {
      if (block?.type === 'text' && typeof block.text === 'string') {
        texts.push(block.text);
      } else if (block?.type === 'tool_use') {
        edits.push(...editedPaths(block));
      }
    }

    if (texts.length || edits.length) {
      index += 1;
      turns.push({ index, texts, edits });
    }
  }

  return turns;
}

/**
 * Split prose into sentences, keeping them long enough to carry reasoning.
 *
 * A line break ends a candidate, and that is load-bearing rather than tidy.
 * Splitting only on `.!?` followed by a capital merges a bullet list into one
 * run-on — reasoning is routinely written as bullets, and bullets routinely
 * have no terminal punctuation. Reproduced before fixing: three separate
 * rejected alternatives written as three bullets came back as a single
 * 200-character quote, and a longer list came back as nothing at all, because
 * the merged run-on blew past the length ceiling below.
 */
function sentences(text) {
  const lines = text
    .replace(/```[\s\S]*?```/g, ' ') // code blocks are not reasoning
    .split('\n')
    .filter((line) => !/^\s*#{1,6}\s/.test(line)) // headings are labels, not sentences
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')); // drop list markers

  const candidates = [];
  for (const line of lines) {
    for (const part of line.split(/(?<=[.!?])\s+(?=[A-Z(`])/)) {
      candidates.push(part.replace(/\s+/g, ' ').trim());
    }
  }

  return candidates
    .filter((s) => s.length >= 40 && s.length <= 600)
    .filter((s) => !NOISE.some((n) => n.test(s)))
    .filter((s) => !CONVERSATIONAL.some((c) => c.test(s)));
}

function truncate(s) {
  return s.length <= MAX_QUOTE_CHARS ? s : `${s.slice(0, MAX_QUOTE_CHARS - 1).trimEnd()}…`;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Component *source*, not anything with "components" in the path. The looser
 * `components/` match also caught `docs/components/<slug>.md` — the generated
 * doc twins — which made a docs-only turn look like component work and listed
 * generated files under "Components touched". The three tiers below are the
 * only directories under `components/`; there are no loose files beside them.
 */
const isComponentFile = (f) => /(^|\/)components\/(?:primitives|composition|patterns)\//.test(f);
const isAdrFile = (f) => /(^|\/)decisions\/\d{4}-[^/]+\.md$/.test(f);

// --- harvesting ---------------------------------------------------------

/**
 * Decide which of the three buckets a sentence belongs to, or none.
 *
 * Priority order (rejected > component > ai-readiness) is the backlog's, with
 * one deliberate exception: a sentence about a component's public API, written
 * near a components/** edit, is filed as a component decision even when it uses
 * rejection phrasing. See COMPONENT_API for why that exception has to exist.
 */
function classify(sentence, nearComponent) {
  const componentApi = nearComponent && COMPONENT_API.test(sentence);
  const reasoned = CAUSAL.test(sentence);

  if (componentApi && (reasoned || CATEGORIES[0].patterns.some((p) => p.test(sentence)))) {
    return 'component';
  }

  for (const category of CATEGORIES) {
    if (!category.patterns.some((p) => p.test(sentence))) continue;
    // The looser two need corroboration, or every "because" in a routine
    // explanation would land in the draft.
    if (category.id === 'component' && !nearComponent) continue;
    if (category.id === 'ai-readiness' && !reasoned) continue;
    return category.id;
  }
  return null;
}

/**
 * Pull candidate evidence out of parsed turns, grouped by category and ordered
 * by the backlog's priority. Returns raw material only — no judgement about
 * whether any of it deserves an ADR. That call belongs to a person.
 */
export function harvest(turns, projectDir = '') {
  const found = new Map(CATEGORIES.map((c) => [c.id, []]));
  const seen = new Set();
  const filesTouched = new Set();
  let producedAdr = false;

  for (const turn of turns) {
    for (const file of turn.edits) {
      filesTouched.add(file);
      if (isAdrFile(file)) producedAdr = true;
    }
  }

  // Turns near a components/** edit, not just the turn holding it — see
  // COMPONENT_TURN_WINDOW for why the same-turn version found nothing.
  const componentAdjacent = new Set();
  for (const turn of turns) {
    if (!turn.edits.some(isComponentFile)) continue;
    for (let i = -COMPONENT_TURN_WINDOW; i <= COMPONENT_TURN_WINDOW; i += 1) {
      componentAdjacent.add(turn.index + i);
    }
  }

  const record = (categoryId, turn, sentence) => {
    const key = `${categoryId}:${normalize(sentence)}`;
    if (seen.has(key)) return;
    seen.add(key);
    const bucket = found.get(categoryId);
    if (bucket.length < MAX_ITEMS_PER_SECTION) {
      bucket.push({ turn, quote: truncate(sentence) });
    }
  };

  for (const turn of turns) {
    const nearComponent = componentAdjacent.has(turn.index);

    for (const text of turn.texts) {
      for (const sentence of sentences(text)) {
        const categoryId = classify(sentence, nearComponent);
        if (categoryId) record(categoryId, turn.index, sentence);
      }
    }
  }

  const counts = Object.fromEntries([...found].map(([id, items]) => [id, items.length]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Transcripts record absolute paths; a draft that a person reads wants the
  // repo-relative form they would type.
  const relative = [...filesTouched]
    .map((f) => (projectDir && f.startsWith(projectDir) ? path.relative(projectDir, f) : f))
    .sort();

  return {
    found,
    counts,
    total,
    producedAdr,
    filesTouched: relative,
    componentFiles: relative.filter(isComponentFile),
  };
}

/**
 * Whether a harvest is worth a draft. A session that already produced a real
 * ADR needs no proposal — the decision is already logged.
 */
export function shouldPropose(result) {
  if (result.producedAdr) return { propose: false, reason: 'session already wrote an ADR' };
  if (result.counts.rejected > 0) {
    return { propose: true, reason: 'rejected alternatives found (priority 1)' };
  }
  if (result.total >= MIN_SIGNALS) {
    return { propose: true, reason: `${result.total} signals found` };
  }
  return { propose: false, reason: `only ${result.total} signal(s), below threshold` };
}

// --- session facts (read-only git) --------------------------------------

/**
 * Read-only git only. Nothing in this file stages or commits — see the safety
 * contract at the top, and the test that asserts it.
 */
function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function sessionFacts(projectDir) {
  const branch = git(['branch', '--show-current'], projectDir) || '(unknown)';
  const diffstat = git(['diff', '--stat', 'HEAD'], projectDir);
  return { branch, diffstat };
}

// --- draft rendering ----------------------------------------------------

function renderSection(category, items) {
  const lines = [`## ${category.heading}`, '', `_${category.note}_`, ''];

  if (!items.length) {
    lines.push('_Nothing harvested for this section._', '');
    return lines.join('\n');
  }

  for (const item of items) {
    lines.push(`- **Turn ${item.turn}** — > ${item.quote}`, '');
  }
  lines.push(
    '<!-- TODO: which of these is a real decision with a tradeoff behind it, and',
    '     which is plain implementation detail? docs/backlog.md excludes the',
    '     latter on purpose. Delete what does not belong, then write the real',
    '     reasoning — the quotes above are evidence, not prose. -->',
    ''
  );
  return lines.join('\n');
}

export function renderDraft({ sessionId, date, result, facts }) {
  const out = [];

  out.push(`# PROPOSED — [title: fill in]`, '');
  out.push(
    '<!-- THIS IS A DRAFT, NOT A DECISION.',
    '',
    '     Harvested automatically from a session transcript by',
    '     scripts/propose-decision.mjs. Nothing has been committed and nothing',
    '     will be: this file is gitignored and the script runs no mutating git',
    '     command.',
    '',
    '     To accept: rewrite it as decisions/NNNN-<slug>.md using the template in',
    '     decisions/README.md, run contributor-skills/governance-audit, then commit',
    '     that file by hand. See contributor-skills/decision-proposal/SKILL.md.',
    '',
    '     To reject: delete this file. Nothing tracks it. -->',
    ''
  );

  out.push('## Status', '');
  out.push(`Proposed — harvested from session \`${sessionId}\` on ${date}. **Unreviewed.**`, '');

  for (const category of CATEGORIES) {
    out.push(renderSection(category, result.found.get(category.id)));
  }

  out.push('## Session facts', '');
  out.push(`- Branch: \`${facts.branch}\``);
  out.push(`- Files edited in session: ${result.filesTouched.length}`);
  if (result.componentFiles.length) {
    out.push('- Components touched:');
    for (const file of result.componentFiles) out.push(`  - \`${file}\``);
  }
  out.push('');
  if (facts.diffstat) {
    // Working tree as it stands right now, not a diff of the session's own
    // edits — at SessionEnd those coincide, but run by hand against an older
    // transcript they will not. Labelled rather than silently misleading.
    out.push('Uncommitted working tree at harvest time:', '', '```', facts.diffstat, '```', '');
  }

  out.push('## Not captured', '');
  out.push(
    'Plain implementation detail with no real tradeoff behind it — `docs/backlog.md`',
    'excludes it on purpose, since the code and the stories already cover it. Also not',
    'captured: anything said in a subagent transcript, and any reasoning that never made',
    'it into prose. If a decision from this session is missing here, the harvester missed',
    'it — add the phrasing to `CATEGORIES` in `scripts/propose-decision.mjs`.',
    ''
  );

  return out.join('\n');
}

// --- writing ------------------------------------------------------------

/**
 * Safety property 2: the only writable destination is `decisions/proposed/`.
 * The path is built here rather than accepted from a caller, and checked again
 * anyway — a resolved path that escapes the folder throws instead of writing.
 */
export function draftPathFor(projectDir, sessionId, date) {
  const dir = path.join(projectDir, 'decisions', 'proposed');
  const shortId = String(sessionId).slice(0, 8).replace(/[^a-zA-Z0-9]/g, '') || 'unknown';
  // Prefixed with a word, never a digit. A bare `2026-09-16-…` leads with four
  // digits and a dash — the exact shape of an ADR filename (`0009-slug.md`),
  // which is a confusion this folder cannot afford. Caught by the safety test,
  // not by review.
  const file = path.join(dir, `session-${date}-${shortId}.draft.md`);

  const resolvedDir = path.resolve(dir);
  const resolvedFile = path.resolve(file);
  if (path.dirname(resolvedFile) !== resolvedDir) {
    throw new Error(`refusing to write outside decisions/proposed/: ${resolvedFile}`);
  }
  if (!resolvedFile.endsWith('.draft.md')) {
    throw new Error(`refusing to write a non-draft filename: ${resolvedFile}`);
  }
  if (/^\d{4}-/.test(path.basename(resolvedFile))) {
    throw new Error(`refusing a filename shaped like an ADR: ${resolvedFile}`);
  }
  return file;
}

// --- entry point --------------------------------------------------------

function main() {
  const argv = process.argv.slice(2);
  const quiet = argv.includes('--quiet');
  // An explicit mode is required. Previously anything that wasn't exactly
  // `--check` fell through to writing, so a typo in the tuning loop
  // (`--chek`) silently wrote a draft instead of reporting.
  const checkOnly = argv.includes('--check');
  const harvestMode = argv.includes('--harvest');
  const log = (...a) => {
    if (!quiet) console.log(...a);
  };

  if (!checkOnly && !harvestMode) {
    console.error(
      'propose-decision: need a mode — --harvest (write a draft if warranted) or --check (report only).'
    );
    return;
  }

  const payload = readHookPayload();
  const projectDir =
    process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();

  const flagIndex = argv.indexOf('--transcript');
  const transcriptPath =
    (flagIndex !== -1 ? argv[flagIndex + 1] : null) ||
    payload.transcript_path ||
    newestTranscript(projectDir);

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    log('propose-decision: no transcript found, nothing to harvest.');
    return;
  }

  const sessionId = payload.session_id || path.basename(transcriptPath, '.jsonl');
  const turns = parseTranscript(fs.readFileSync(transcriptPath, 'utf8'));
  const result = harvest(turns, projectDir);
  const verdict = shouldPropose(result);

  if (!verdict.propose) {
    log(`propose-decision: no draft written — ${verdict.reason}.`);
    return;
  }

  const date = new Date().toISOString().slice(0, 10);

  if (checkOnly) {
    log(`propose-decision: would write a draft — ${verdict.reason}.`);
    for (const category of CATEGORIES) {
      log(`  ${category.heading}: ${result.counts[category.id]}`);
    }
    return;
  }

  const facts = sessionFacts(projectDir);
  const body = renderDraft({ sessionId, date, result, facts });
  const file = draftPathFor(projectDir, sessionId, date);

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');

  log(`propose-decision: wrote ${path.relative(projectDir, file)} — ${verdict.reason}.`);
}

// Only run when executed directly, so the test file can import the pieces.
if (process.argv[1] && path.resolve(process.argv[1]).endsWith('propose-decision.mjs')) {
  try {
    main();
  } catch (error) {
    // A SessionEnd hook must never make session exit noisy or slow. A broken
    // harvester loses a draft; it does not get to interrupt the user.
    if (!process.argv.includes('--quiet')) {
      console.error(`propose-decision: ${error.message}`);
    }
    process.exit(0);
  }
}
