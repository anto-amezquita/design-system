/**
 * Tests for the living memory harvester.
 *
 * Two kinds of test here, and the distinction matters. Most assert harvesting
 * *behaviour* — did it find the decision, did it ignore the noise. The last
 * group asserts the *safety contract* documented at the top of
 * propose-decision.mjs: that the script cannot commit, and cannot write outside
 * decisions/proposed/. Those are the properties that make it safe to run
 * unattended at session exit, so they are pinned by tests rather than left to a
 * comment someone can edit away.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  draftPathFor,
  harvest,
  parseTranscript,
  renderDraft,
  shouldPropose,
} from './propose-decision.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, '..');

/** Build a transcript line the way Claude Code writes them. */
function assistantTurn({ text, edits = [], bash = [], isSidechain = false }) {
  const content = [];
  if (text) content.push({ type: 'text', text });
  for (const file of edits) {
    content.push({ type: 'tool_use', name: 'Edit', input: { file_path: file } });
  }
  for (const command of bash) {
    content.push({ type: 'tool_use', name: 'Bash', input: { command } });
  }
  return JSON.stringify({ type: 'assistant', isSidechain, message: { role: 'assistant', content } });
}

const COMPONENT_FILE = `${projectDir}/components/primitives/Badge/Badge.tsx`;

describe('parseTranscript', () => {
  it('collects prose and edits per assistant turn, ignoring other entry types', () => {
    const jsonl = [
      JSON.stringify({ type: 'queue-operation', operation: 'enqueue' }),
      JSON.stringify({ type: 'user', message: { role: 'user', content: 'do the thing' } }),
      assistantTurn({ text: 'Some reasoning here about the work.', edits: [COMPONENT_FILE] }),
    ].join('\n');

    const turns = parseTranscript(jsonl);

    expect(turns).toHaveLength(1);
    expect(turns[0].texts).toEqual(['Some reasoning here about the work.']);
    expect(turns[0].edits).toEqual([COMPONENT_FILE]);
  });

  it('skips subagent turns, whose reasoning is not the main session s decision record', () => {
    const jsonl = assistantTurn({ text: 'A subagent talking to itself at length.', isSidechain: true });
    expect(parseTranscript(jsonl)).toHaveLength(0);
  });

  it('tolerates a truncated final line rather than throwing', () => {
    const jsonl = `${assistantTurn({ text: 'A complete turn of real prose here.' })}\n{"type":"assist`;
    expect(parseTranscript(jsonl)).toHaveLength(1);
  });
});

describe('harvest', () => {
  it('captures a rejected alternative, the priority-1 signal', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'Both were fixed with additive, higher-specificity CSS rather than touching each existing rule.',
      })
    );

    const result = harvest(turns, projectDir);

    expect(result.counts.rejected).toBe(1);
    expect(result.found.get('rejected')[0].quote).toMatch(/higher-specificity CSS rather than/);
  });

  it('files a component API decision as priority 2 even though it uses rejection phrasing', () => {
    // The backlog's own example of a component decision is "why a prop is a
    // literal union instead of a boolean" — "instead of" is also the marker of
    // a rejected alternative. Without the COMPONENT_API exception this lands in
    // the wrong section and the component section stays permanently empty.
    const turns = parseTranscript(
      assistantTurn({
        text: 'The prop is a literal union instead of a boolean because a third state is already on the roadmap.',
        edits: [COMPONENT_FILE],
      })
    );

    const result = harvest(turns, projectDir);

    expect(result.counts.component).toBe(1);
    expect(result.counts.rejected).toBe(0);
  });

  it('attributes reasoning to a component edit made a couple of turns later', () => {
    // Reasoning rarely shares a turn with the Edit call it explains. A
    // same-turn requirement found zero component decisions in a real session
    // that made 34 component edits.
    const jsonl = [
      assistantTurn({ text: 'This prop should be a union because a boolean cannot grow a third state.' }),
      assistantTurn({ text: 'Checking the existing type first.' }),
      assistantTurn({ text: 'Applying it now.', edits: [COMPONENT_FILE] }),
    ].join('\n');

    const result = harvest(parseTranscript(jsonl), projectDir);

    expect(result.counts.component).toBe(1);
  });

  it('ignores process talk that merely reads like a rejected alternative', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'Since you asked to leave this on the branch rather than merge it, there is nothing further to do.',
      })
    );

    expect(harvest(turns, projectDir).total).toBe(0);
  });

  it('ignores a markdown heading, which is a label rather than reasoning', () => {
    const turns = parseTranscript({} && assistantTurn({ text: '## Summary of what changed instead of the old approach' }));
    expect(harvest(turns, projectDir).total).toBe(0);
  });

  it('requires a causal clause before logging AI-readiness reasoning', () => {
    const mentionOnly = parseTranscript(
      assistantTurn({ text: 'The MCP server exposes the same data as the files it mirrors, one call away.' })
    );
    expect(harvest(mentionOnly, projectDir).counts['ai-readiness']).toBe(0);

    const reasoned = parseTranscript(
      assistantTurn({
        text: 'The lint rule exists because an agent cannot tell a real token from a fabricated one at a glance.',
      })
    );
    expect(harvest(reasoned, projectDir).counts['ai-readiness']).toBe(1);
  });

  it('reports component paths relative to the repo, not as transcript absolutes', () => {
    const turns = parseTranscript(assistantTurn({ text: 'Editing.', edits: [COMPONENT_FILE] }));
    expect(harvest(turns, projectDir).componentFiles).toEqual([
      'components/primitives/Badge/Badge.tsx',
    ]);
  });
});

describe('shouldPropose', () => {
  it('proposes on a single rejected alternative, the most perishable signal', () => {
    const turns = parseTranscript(
      assistantTurn({ text: 'We went with the additive override instead of rewriting the base rule.' })
    );
    expect(shouldPropose(harvest(turns, projectDir)).propose).toBe(true);
  });

  it('stays silent on a session with nothing worth logging', () => {
    const turns = parseTranscript(assistantTurn({ text: 'Renamed the variable and reran the tests.' }));
    const verdict = shouldPropose(harvest(turns, projectDir));
    expect(verdict.propose).toBe(false);
    expect(verdict.reason).toMatch(/below threshold/);
  });

  it('stays silent when the session already wrote a real ADR', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'Chose the additive override over rewriting the base rule, for the reasons below.',
        edits: [`${projectDir}/decisions/0009-living-memory-layer.md`],
      })
    );
    const verdict = shouldPropose(harvest(turns, projectDir));
    expect(verdict.propose).toBe(false);
    expect(verdict.reason).toMatch(/already wrote an ADR/);
  });
});

describe('renderDraft', () => {
  const draft = () => {
    const turns = parseTranscript(
      [
        assistantTurn({ text: 'We used the additive override rather than rewriting the base rule.' }),
        assistantTurn({
          text: 'The prop is a union instead of a boolean because a third state is coming.',
          edits: [COMPONENT_FILE],
        }),
      ].join('\n')
    );
    return renderDraft({
      sessionId: 'abcd1234-ef',
      date: '2026-09-16',
      result: harvest(turns, projectDir),
      facts: { branch: 'feat/x', diffstat: '' },
    });
  };

  it('orders the three sections by the priority the backlog sets out', () => {
    const body = draft();
    expect(body.indexOf('## Rejected alternatives')).toBeLessThan(
      body.indexOf('## Component decisions')
    );
    expect(body.indexOf('## Component decisions')).toBeLessThan(
      body.indexOf('## AI-readiness')
    );
  });

  it('states on its face that it is not a decision and was not committed', () => {
    const body = draft();
    expect(body).toMatch(/THIS IS A DRAFT, NOT A DECISION/);
    expect(body).toMatch(/\*\*Unreviewed\.\*\*/);
    expect(body).toMatch(/^# PROPOSED/m);
  });
});

describe('safety contract', () => {
  const source = fs.readFileSync(path.join(here, 'propose-decision.mjs'), 'utf8');

  it('runs no mutating git command', () => {
    // Acceptance is a human act. If this ever fails, the script has grown the
    // ability to put an unreviewed draft into the repo's history.
    const body = source.replace(/^\s*(?:\/\/|\*).*$/gm, ''); // prose about git is fine
    for (const forbidden of ['add', 'commit', 'push', 'checkout', 'reset', 'tag']) {
      expect(body).not.toMatch(new RegExp(`['"\`]${forbidden}['"\`]`));
    }
  });

  it('writes only inside decisions/proposed, with a name no ADR could have', () => {
    const file = draftPathFor(projectDir, 'abcd1234-ef', '2026-09-16');
    expect(path.dirname(file)).toBe(path.join(projectDir, 'decisions', 'proposed'));
    expect(path.basename(file)).toMatch(/\.draft\.md$/);
    // decisions/README.md's real ADR shape, which a draft must never match.
    expect(path.basename(file)).not.toMatch(/^\d{4}-[^/]+\.md$/);
  });

  it('cannot be walked out of the folder by a hostile session id', () => {
    const file = draftPathFor(projectDir, '../../../etc/passwd', '2026-09-16');
    expect(path.dirname(file)).toBe(path.join(projectDir, 'decisions', 'proposed'));
    expect(file).not.toMatch(/passwd/);
  });
});

describe('sentence splitting', () => {
  // Reasoning is routinely written as bullets, and bullets routinely have no
  // terminal punctuation. Splitting only on `.!?` + capital merged the whole
  // list into one run-on quote; past the 600-character ceiling it was dropped
  // entirely, so a session full of decisions could harvest to nothing.
  const bullets = [
    'What was decided:',
    '- Rejected the shared base rule because AlertDialog reuses that exact class',
    '- Went with additive overrides instead of editing each rule in place',
    '- Chose a literal union over a boolean since a third state is planned',
  ].join('\n');

  it('treats each bullet as its own candidate, with or without a full stop', () => {
    const result = harvest(parseTranscript(assistantTurn({ text: bullets })), projectDir);
    expect(result.counts.rejected).toBe(3);
    for (const item of result.found.get('rejected')) {
      expect(item.quote).not.toMatch(/What was decided/);
    }
  });

  it('does not lose a long bullet list to the length ceiling', () => {
    const long = Array.from(
      { length: 6 },
      (_, i) => `- Rejected approach number ${i} because it would have broken the existing contract`
    ).join('\n');
    expect(harvest(parseTranscript(assistantTurn({ text: long })), projectDir).counts.rejected)
      .toBeGreaterThan(1);
  });
});

describe('edits made outside the Edit tool', () => {
  // A shell is a first-class way to edit files here. A harvester that only
  // understood Edit/Write was blind to all of it: the component section could
  // never fire, and the "already wrote an ADR" suppression could be defeated
  // by writing the ADR through a heredoc.
  it('counts a component written through a Bash heredoc', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'The prop is a union instead of a boolean because a third state is coming.',
        bash: ["cat > components/primitives/Badge/Badge.tsx <<'EOF'"],
      })
    );
    const result = harvest(turns, projectDir);
    expect(result.counts.component).toBe(1);
    expect(result.componentFiles).toContain('components/primitives/Badge/Badge.tsx');
  });

  it('counts an ADR written through a heredoc, so suppression cannot be sidestepped', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'Chose the override instead of a rewrite because it was cheaper to verify.',
        bash: ["cat > decisions/0010-example.md <<'EOF'"],
      })
    );
    expect(harvest(turns, projectDir).producedAdr).toBe(true);
  });

  it('does not treat reading a file as writing it', () => {
    const turns = parseTranscript(
      assistantTurn({
        text: 'Chose the override instead of a rewrite because it was cheaper to verify.',
        bash: ['cat decisions/0007-universal-prop-passthrough-and-nesting-safe-z-index.md'],
      })
    );
    expect(harvest(turns, projectDir).producedAdr).toBe(false);
  });

  it('reads a notebook edit from its own path key', () => {
    const jsonl = JSON.stringify({
      type: 'assistant',
      message: {
        role: 'assistant',
        content: [
          { type: 'tool_use', name: 'NotebookEdit', input: { notebook_path: '/tmp/analysis.ipynb' } },
        ],
      },
    });
    expect(parseTranscript(jsonl)[0].edits).toEqual(['/tmp/analysis.ipynb']);
  });
});

describe('component source vs generated doc twins', () => {
  it('does not treat docs/components/<slug>.md as component work', () => {
    // The looser `components/` match caught the generated doc twins, so a
    // docs-only turn looked like a component decision and the draft listed
    // generated files under "Components touched".
    const turns = parseTranscript(
      assistantTurn({
        text: 'The prop is a union instead of a boolean because a third state is coming.',
        edits: [`${projectDir}/docs/components/badge.md`],
      })
    );
    const result = harvest(turns, projectDir);
    expect(result.counts.component).toBe(0);
    expect(result.componentFiles).toEqual([]);
  });
});

describe('mode flag', () => {
  it('refuses to run without an explicit mode, so a typo cannot write a draft', async () => {
    const { execFileSync } = await import('node:child_process');
    const run = (args) => {
      try {
        return execFileSync('node', [path.join(here, 'propose-decision.mjs'), ...args], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
      } catch (error) {
        return `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
    };

    const before = fs.readdirSync(path.join(projectDir, 'decisions', 'proposed'));
    // `--chek` is the realistic slip during the SKILL.md tuning loop; before
    // this, anything that wasn't exactly `--check` fell through to writing.
    run(['--chek']);
    const after = fs.readdirSync(path.join(projectDir, 'decisions', 'proposed'));
    expect(after).toEqual(before);
  });
});
