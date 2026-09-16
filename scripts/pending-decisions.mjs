#!/usr/bin/env node
/**
 * pending-decisions.mjs — the other half of the SessionEnd hook's loop.
 *
 * SessionEnd writes a draft, but its output is never shown: the session is
 * already over by the time the hook runs. Without something reading the folder
 * back out, drafts accumulate where nobody looks, which is the same outcome as
 * not writing them. This runs at SessionStart, where output does reach both the
 * user and the next agent's context, and says one line if drafts are waiting.
 *
 * Silent when there is nothing pending — the common case, and the only way a
 * start-of-session hook stays worth having.
 *
 * Writes nothing. Reads one directory. See decisions/0009-*.md.
 */

import fs from 'node:fs';
import path from 'node:path';

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const dir = path.join(projectDir, 'decisions', 'proposed');

try {
  const drafts = fs.readdirSync(dir).filter((f) => f.endsWith('.draft.md'));
  if (drafts.length) {
    const noun = drafts.length === 1 ? 'draft' : 'drafts';
    console.log(
      `${drafts.length} proposed decision ${noun} awaiting review in decisions/proposed/ ` +
        `(${drafts.join(', ')}). These are unreviewed harvested evidence, not decisions — ` +
        `see contributor-skills/decision-proposal/SKILL.md to accept or delete one.`
    );
  }
} catch {
  // No folder yet, or unreadable. A start-of-session hook has no business
  // failing loudly over either.
}
