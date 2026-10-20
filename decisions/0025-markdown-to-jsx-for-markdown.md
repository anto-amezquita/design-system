# 0025 — Parse Markdown with markdown-to-jsx; no syntax colouring yet

## Status

Accepted (2026-10-20)

## Context

Wave 4 of the coverage plan includes a Markdown component: render a Markdown string (release notes, a model's answer, a README) with the system's own components, so written content looks like the rest of the product in every brand. Parsing Markdown properly (nesting, tables, fenced code, escaping) is not something to write by hand, so this needs a dependency, and [ADR 0002](./0002-reject-transitions-dev-library-adopt-audit-technique.md) asks that one not be adopted lightly.

Two things mattered beyond correctness. Markdown often comes from people or models, so the parser must not render raw HTML from the source or keep `javascript:` URLs. And each element should become a system component (Heading, Text, Link, List, Blockquote, CodeBlock, Table, Image, Divider), not HTML that gets styled after the fact.

CodeBlock (shipped the same day) left syntax colouring open for this decision, since Markdown's fenced code goes through CodeBlock too.

## Decision

**Use `markdown-to-jsx` 9.10.3**, pinned, as a runtime dependency. It builds React elements directly (no `innerHTML`), maps each tag to a component through `overrides`, and has an option to treat raw HTML as text (`disableParsingRawHTML`), which Markdown always sets. Its built-in URL sanitiser stays on.

**No syntax colouring for now.** Code stays monochrome in CodeBlock and in Markdown. Colouring needs a palette per brand and mode with its own contrast checks, which is a piece of work of its own; it's revisited after wave 5.

## Alternatives considered

- **react-markdown (unified/remark).** The most correct and extensible, with a plugin for everything. Rejected for now: measured the same way (esbuild, minified, gzipped, React external) it's 36.8 kB against markdown-to-jsx's 28.5 kB, installs about 80 packages against none, and needs a further plugin (`remark-gfm`) for tables.
- **No parser: a "Prose" wrapper that styles HTML the consumer parses.** No dependency. Rejected: the consumer would have to sanitise HTML themselves, which is exactly the part that goes wrong, and the elements wouldn't be the system's components.
- **Write a small parser.** Rejected: Markdown's edge cases (nested lists, tables, emphasis rules) are where hand-written parsers fail, and that's not this system's job.
- **Add a highlighter now (prism-react-renderer or Shiki).** Rejected for now, see above. Shiki is also heavy (grammars and themes loaded at runtime).

## Consequences

### Positive

- Markdown renders as system components: headings carry Heading's type scale and `id`s for linking, code gets CodeBlock's copy button and keyboard-scrollable region, tables get Table's semantics.
- Raw HTML and `javascript:` URLs from untrusted Markdown are not rendered; tests cover both.

### Negative

- A runtime dependency of 28.5 kB gzipped (79 kB minified) for the React build, with no dependencies of its own. It's only loaded by apps that import Markdown, since components are imported per path.
- Its peer dependencies list Vue, Solid and React Native as optional peers; they're never installed, but they show in the lockfile entry.
- Code in Markdown is monochrome until colouring is decided.
- A major version of `markdown-to-jsx` can change its output; it's pinned, and the component's tests cover each element it maps.

## Related files

- `components/patterns/Markdown/` — the component, its overrides and its tests (including the HTML and URL safety tests)
- `components/primitives/CodeBlock/` — renders fenced code; documents the no-colouring limit
- [`0002`](./0002-reject-transitions-dev-library-adopt-audit-technique.md) — why dependencies get an ADR
