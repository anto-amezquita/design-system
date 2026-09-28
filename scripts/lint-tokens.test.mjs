/**
 * Tests for scripts/lint-tokens.mjs's no-unknown-breakpoint rule
 * (decisions/0018).
 *
 * The rule's point is that the allowed values come from tokens/global.json,
 * not from a list in the script, so the tests run against the real token file
 * rather than a fixture — a breakpoint token renamed or re-valued there should
 * move these results with it.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import {
  RULES,
  findUnknownBreakpoints,
  lintFile,
  loadBreakpointValues,
  loadKnownTokenVars,
} from './lint-tokens.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, '..');
const breakpoints = loadBreakpointValues(projectDir);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-tokens-'));
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

function lintCss(css) {
  const file = path.join(tmpDir, `case-${Math.random().toString(36).slice(2)}.css`);
  fs.writeFileSync(file, css);
  return lintFile(file, RULES, loadKnownTokenVars(projectDir), breakpoints)
    .filter(v => v.rule === 'no-unknown-breakpoint');
}

describe('loadBreakpointValues', () => {
  it('reads the breakpoint group from tokens/global.json', () => {
    const tokens = JSON.parse(fs.readFileSync(path.join(projectDir, 'tokens/global.json'), 'utf8'));
    const expected = Object.values(tokens.breakpoint).map(t => t.$value);
    expect([...breakpoints].sort()).toEqual(expected.sort());
    expect(breakpoints.has('768px')).toBe(true);
    expect(breakpoints.has('1024px')).toBe(true);
  });
});

describe('no-unknown-breakpoint', () => {
  it('passes min-width queries at a breakpoint token value', () => {
    expect(findUnknownBreakpoints('@media (min-width: 768px) {', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@media (min-width: 1024px) {', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@media screen and (min-width:1024px) {', breakpoints)).toBeNull();
  });

  it('flags a min-width that is not a token value', () => {
    expect(findUnknownBreakpoints('@media (min-width: 1025px) {', breakpoints)).toEqual(['min-width: 1025px']);
    expect(findUnknownBreakpoints('@media (min-width: 64em) {', breakpoints)).toEqual(['min-width: 64em']);
  });

  it('flags every max-width query, even at a token value', () => {
    expect(findUnknownBreakpoints('@media (max-width: 1199px) {', breakpoints)).toEqual(['max-width: 1199px']);
    expect(findUnknownBreakpoints('@media (max-width: 1024px) {', breakpoints)).toEqual(['max-width: 1024px']);
  });

  it('checks every width condition in a compound query', () => {
    expect(
      findUnknownBreakpoints('@media (min-width: 768px) and (max-width: 1023px) {', breakpoints),
    ).toEqual(['max-width: 1023px']);
  });

  it('handles the range syntax the same way', () => {
    expect(findUnknownBreakpoints('@media (width >= 1024px) {', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@media (width >= 900px) {', breakpoints)).toEqual(['width >= 900px']);
    expect(findUnknownBreakpoints('@media (width < 1024px) {', breakpoints)).toEqual(['width < 1024px']);
  });

  it('ignores media features that are not widths', () => {
    expect(findUnknownBreakpoints('@media (prefers-reduced-motion: reduce) {', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@media (hover: none) {', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@media (min-height: 500px) {', breakpoints)).toBeNull();
  });

  it('ignores anything that is not an @media prelude', () => {
    expect(findUnknownBreakpoints('  max-width: 1199px;', breakpoints)).toBeNull();
    expect(findUnknownBreakpoints('@container (min-width: 500px) {', breakpoints)).toBeNull();
  });

  it('reports through lintFile with a line number, and skips commented-out queries', () => {
    const violations = lintCss([
      '/* @media (min-width: 900px) — old value, kept for reference */',
      '.a { display: none; }',
      '@media (min-width: 900px) {',
      '  .a { display: block; }',
      '}',
    ].join('\n'));
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(3);
    expect(violations[0].found).toEqual(['min-width: 900px']);
  });

  it('honours a lint-ignore on the same line', () => {
    const violations = lintCss(
      '@media (min-width: 900px) { /* lint-ignore: no-unknown-breakpoint — test fixture */\n}',
    );
    expect(violations).toHaveLength(0);
  });
});
