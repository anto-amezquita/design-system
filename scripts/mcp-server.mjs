#!/usr/bin/env node
// MCP server — read-only reference surface over this repo's generated artifacts.
// Spec: docs/mcp-server-spec.md. Phase 3: search_tokens, get_token, validate_token.
// Do not add logic here that isn't already produced by an existing generator —
// see the spec's "What it wraps, not what it builds" table before adding a tool.
// Every tool does a fresh readFileSync per call — no caching, correctness over
// throughput (see the spec's Architecture section).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";
import { loadKnownTokenVars, findTokenFallbacks, isKnownTokenVar, RADIX_VAR_RE } from "./lint-tokens.mjs";
import { TOKEN_CATEGORIES } from "../lib/token-categories.mjs";

// Resolved from this file's own location, not process.cwd() — unlike the other
// scripts/ generators (always invoked via `npm run` from repo root), an MCP
// client can spawn this process with a different working directory.
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));

function readComponentRegistry() {
  const path = join(repoRoot, "tokens", "component-registry.json");
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    throw new Error(
      `Could not read or parse tokens/component-registry.json (${err.message}). Run "npm run tokens" to regenerate it.`
    );
  }
}

function readTokenReference() {
  const path = join(repoRoot, "tokens", "token-reference.json");
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    throw new Error(
      `Could not read or parse tokens/token-reference.json (${err.message}). Run "npm run tokens" to regenerate it.`
    );
  }
}

const isPublic = (c) => !c.internal;
const toolError = (text) => ({ isError: true, content: [{ type: "text", text }] });

// Slug/name matching is intentionally forgiving of spaces and hyphens (agents
// naturally write "Alert Dialog" or "data table" for AlertDialog/DataTable)
// but still exact after normalization — no fuzzy/partial matching, so a typo
// falls through to the real "doesn't exist" error instead of a silent guess.
const normalizeForMatch = (s) => s.trim().toLowerCase().replace(/[\s-]+/g, "");

// Shared by get_component and get_registry_item — both take a slug/name and
// need the same public-component lookup; a third inline copy for a future
// tool would be the kind of drift risk this function exists to avoid.
function findPublicComponent(slugOrName) {
  const registry = readComponentRegistry();
  const normalized = normalizeForMatch(slugOrName);
  return registry.components.find(
    (c) => isPublic(c) && (normalizeForMatch(c.slug) === normalized || normalizeForMatch(c.name) === normalized)
  );
}

const noSuchComponentError = (slugOrName) =>
  toolError(
    `No public component matches "${slugOrName}". Call list_components for the real list — this name doesn't exist in tokens/component-registry.json.`
  );

// CATEGORIES comes from lib/token-categories.mjs — the same canonical list
// build-token-reference.mjs's getCategory() and the docs site's TokenTable.tsx
// filter pills already use (its own header comment says as much: "the two
// can never drift out of sync"). Deriving this from whatever categories
// happen to appear in the currently-built token-reference.json instead would
// have been a third, independent source that could drift from the other two
// — e.g. a category added upstream with no token using it yet.
const CATEGORIES = TOKEN_CATEGORIES.map((c) => c.value);

// TIERS, unlike CATEGORIES, has no equivalent shared constant anywhere in the
// repo, so it's still derived from the registry itself rather than hand-typed
// — if a tier is ever renamed or added upstream, this stays correct without
// a separate edit here. Unlike every tool's own per-call reads, this has to
// run once at module load, because registerTool()'s zod inputSchema must
// exist before the transport connects — there's no per-call hook to defer
// it to. That means a malformed or mid-rewrite tokens/component-registry.json
// at startup (e.g. an MCP client connecting while npm run tokens is
// regenerating it) fails the whole connection, not just one tool call —
// correct, fail-fast behavior, since a broken schema can't be registered at
// all, but the raw thrown error makes an ugly stack trace where every other
// failure in this file produces a clean, actionable one-liner. Catch it here
// so a broken startup at least reads the same way.
let TIERS;
try {
  TIERS = [...new Set(readComponentRegistry().components.map((c) => c.tier))];
} catch (err) {
  console.error(`amezquita-design-system MCP server failed to start: ${err.message}`);
  process.exit(1);
}

// Accepts "space-4", "--space-4", "var(--space-4)", or "var(--space-4, foo)"
// and returns the bare "--space-4" cssVar form, or null if the input isn't
// shaped like any of those. The fallback form's second argument is ignored
// here — validate_token checks for it separately via findTokenFallbacks,
// since "has a fallback" and "names a real token" are independent questions.
function extractTokenVarName(input) {
  const trimmed = input.trim();
  const asVarCall = trimmed.match(/^var\(\s*(--[\w-]+)\s*(?:,.*)?\)$/);
  if (asVarCall) return asVarCall[1];
  if (/^--[\w-]+$/.test(trimmed)) return trimmed;
  if (/^[\w-]+$/.test(trimmed)) return `--${trimmed}`;
  return null;
}

const server = new McpServer({
  name: "amezquita-design-system",
  version: pkg.version,
});

server.registerTool(
  "list_components",
  {
    title: "List components",
    description:
      "List every public component in the design system, optionally filtered by tier (primitives, composition, patterns). Excludes internal-only components (e.g. BaseSheet).",
    inputSchema: {
      tier: z.enum(TIERS).optional().describe("Filter to one tier. Omit for all public components."),
    },
  },
  async ({ tier }) => {
    const registry = readComponentRegistry();
    const components = registry.components
      .filter((c) => isPublic(c) && (!tier || c.tier === tier))
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        tier: c.tier,
        purpose: c.purpose,
        tokenCount: c.tokenCount,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(components, null, 2) }],
    };
  }
);

server.registerTool(
  "get_component",
  {
    title: "Get component",
    description:
      "Get the compiled documentation for one public component — full prop table with literal unions expanded, its token list, and a usage example. Reads docs/components/<slug>.md, the same artifact generated for and served to agents elsewhere in this system.",
    inputSchema: {
      slug: z
        .string()
        .describe(
          'Component slug or name, e.g. "button" or "Button". Call list_components first if unsure — inventing a slug is not the same as looking one up.'
        ),
    },
  },
  async ({ slug }) => {
    const component = findPublicComponent(slug);

    if (!component) {
      return noSuchComponentError(slug);
    }

    const docPath = join(repoRoot, "docs", "components", `${component.slug}.md`);
    if (!existsSync(docPath)) {
      return toolError(
        `"${component.name}" is a real public component but its compiled doc twin is missing at docs/components/${component.slug}.md. Run "npm run tokens" to regenerate it — this is a build gap, not a naming mistake.`
      );
    }

    let doc;
    try {
      doc = readFileSync(docPath, "utf-8");
    } catch (err) {
      return toolError(
        `"${component.name}"'s doc twin existed a moment ago but couldn't be read (${err.message}) — likely a build regenerating docs/components/ concurrently. Try again.`
      );
    }

    return {
      content: [{ type: "text", text: doc }],
    };
  }
);

server.registerTool(
  "search_tokens",
  {
    title: "Search tokens",
    description:
      "Search all design tokens (primitive, semantic, and component-scoped) by a substring match on name or CSS variable, optionally narrowed to one category. Returns name, cssVar, type, and the resolved value on each of the 4 theme axes (light-default, light-bold, dark-default, dark-bold).",
    inputSchema: {
      query: z
        .string()
        .trim()
        .min(1, "query cannot be empty or only whitespace")
        .describe('Substring to match against token name/cssVar, e.g. "space" or "accent".'),
      category: z.enum(CATEGORIES).optional().describe("Narrow to one token category."),
    },
  },
  async ({ query, category }) => {
    const { tokens } = readTokenReference();
    const q = query.toLowerCase(); // already trimmed and non-empty per inputSchema
    const matches = tokens
      .filter((t) => (!category || t.category === category) && (t.name.toLowerCase().includes(q) || t.cssVar.toLowerCase().includes(q)))
      .map((t) => ({ name: t.name, cssVar: t.cssVar, type: t.type, resolved: t.resolved }));

    return {
      content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
    };
  }
);

server.registerTool(
  "get_token",
  {
    title: "Get token",
    description:
      "Get the full entry for one exact token — raw value, resolved value on each theme axis, and which components use it. Call search_tokens first if you don't know the exact name.",
    inputSchema: {
      name: z.string().describe('Exact token name or CSS variable, e.g. "space-4" or "--space-4".'),
    },
  },
  async ({ name }) => {
    const { tokens } = readTokenReference();
    // extractTokenVarName normalizes "space-4" -> "--space-4"; every real token name
    // is a plain kebab-case string, so a normalized "--x" also correctly matches the
    // un-prefixed t.name field once the leading "--" is stripped back off.
    const varName = extractTokenVarName(name) ?? name;
    const bareName = varName.replace(/^--/, "");
    const token = tokens.find((t) => t.cssVar === varName || t.name === bareName);

    if (!token) {
      return toolError(
        `No token named "${name}". Call search_tokens for real matches — this name doesn't exist in tokens/token-reference.json.`
      );
    }

    return {
      content: [{ type: "text", text: JSON.stringify(token, null, 2) }],
    };
  }
);

server.registerTool(
  "validate_token",
  {
    title: "Validate token",
    description:
      'Check whether a var(--x) reference or bare token name is real, before using it in CSS. Reuses two of this repo\'s actual lint rules from scripts/lint-tokens.mjs — no-fabricated-token and no-token-fallback, the same checks npm run validate enforces for those two rules specifically. Does NOT check no-primitive-tokens (a primitive like --color-warm-500 is a real token and validates true here, but is still banned in component CSS — call get_component or check tokens/global.json\'s "primitive" category if you need that distinction) or any of the other CSS-structural lint rules (no-raw-hex, hardcoded motion/spacing, etc.), and can\'t see a CSS file\'s own locally-declared custom properties (a legitimate component-private value like --button-glow-color reads as fabricated here, same as it would to no-fabricated-token run without that file\'s context).',
    inputSchema: {
      token: z.string().describe('e.g. "var(--space-4)", "--space-4", "space-4", or the invalid "var(--space-4, 16px)".'),
    },
  },
  async ({ token }) => {
    const reasons = [];

    // findTokenFallbacks's match is abbreviated to "var(--x)" (it only needs to detect
    // the fallback, not capture it) — that reads as the token's *valid* one-argument
    // form out of context, so quote the caller's actual input instead of the match.
    if (findTokenFallbacks(token)) {
      reasons.push(
        `"${token.trim()}" uses the two-argument var(--x, fallback) form — a token either exists or it doesn't; a fallback masks that difference (no-token-fallback).`
      );
    }

    const varName = extractTokenVarName(token);
    if (!varName) {
      // Still report a collected fallback reason (if any) instead of discarding it —
      // "var(--space-4, 16px) foo" has trailing content extractTokenVarName can't
      // parse into a name, but its fallback problem was already detected above and
      // shouldn't disappear behind a generic "not recognized" message.
      reasons.push(
        `"${token}" isn't a recognized token reference — expected var(--x), a bare --x custom property, or a bare token name like "space-4".`
      );
      const result = { valid: false, reason: reasons.join(" ") };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    const isRadix = RADIX_VAR_RE.test(varName);
    const knownTokenVars = loadKnownTokenVars(repoRoot);
    if (!isRadix && !isKnownTokenVar(varName, knownTokenVars)) {
      reasons.push(
        `${varName} isn't a real token — not in tokens/global.json, any brand's tokens.json, or tokens/components/*.json, and not a --radix-* runtime variable (no-fabricated-token). It's still possible this is a legitimate custom property declared elsewhere in the same CSS file it's used in (this tool has no file to check that against) — if so, search_tokens won't find it either, since it was never meant to be a registered token.`
      );
    }

    const validReason = isRadix
      ? `${varName} is a Radix Primitives runtime variable, not a design token — allowed, but won't resolve to a value in tokens/token-reference.json.`
      : `${varName} is a real token.`;
    const result = reasons.length > 0 ? { valid: false, reason: reasons.join(" ") } : { valid: true, reason: validReason };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "get_registry_item",
  {
    title: "Get registry item",
    description:
      "Get the shadcn-spec registry-item.json for one public component — its npm dependency, cross-component registryDependencies, and the CSS custom properties it needs. Use this to decide whether to `npx shadcn add` a component or hand-write it. Reads registry/<slug>.json, generated by scripts/build-registry-manifests.mjs.",
    inputSchema: {
      slug: z
        .string()
        .describe('Component slug or name, e.g. "button" or "Button" — same matching as get_component.'),
    },
  },
  async ({ slug }) => {
    const component = findPublicComponent(slug);

    if (!component) {
      return noSuchComponentError(slug);
    }

    const itemPath = join(repoRoot, "registry", `${component.slug}.json`);
    if (!existsSync(itemPath)) {
      return toolError(
        `"${component.name}" is a real public component but its registry item is missing at registry/${component.slug}.json. Run "npm run tokens" to regenerate it — this is a build gap, not a naming mistake.`
      );
    }

    let item;
    try {
      item = readFileSync(itemPath, "utf-8");
    } catch (err) {
      return toolError(
        `"${component.name}"'s registry item existed a moment ago but couldn't be read (${err.message}) — likely a build regenerating registry/ concurrently. Try again.`
      );
    }

    return {
      content: [{ type: "text", text: item }],
    };
  }
);

server.registerTool(
  "get_skill",
  {
    title: "Get skill",
    description:
      "Get the current agent skill content (SKILL.md) — the same file served from /.well-known/skills/ for agents that read the skill format instead of calling MCP tools directly. Useful to compare what the skill claims against what these tools actually return.",
  },
  async () => {
    const skillsIndexPath = join(repoRoot, "skills", "index.json");
    let index;
    try {
      index = JSON.parse(readFileSync(skillsIndexPath, "utf-8"));
    } catch (err) {
      throw new Error(`Could not read or parse skills/index.json (${err.message}). Run "npm run tokens" to regenerate it.`);
    }

    // This system publishes exactly one skill, per skills/build-skill.mjs — indexed
    // positionally rather than by name because there's nothing to select between yet.
    // If a second skill is ever added, this needs a selector input, not a silent [0].
    const skill = index.skills[0];
    if (!skill) {
      return toolError(`skills/index.json declares no skills. Run "npm run tokens" to regenerate it — this is a build gap.`);
    }

    const skillPath = join(repoRoot, "skills", skill.name, skill.files[0]);
    if (!existsSync(skillPath)) {
      return toolError(
        `skills/index.json declares "${skill.name}" at ${skill.files[0]} but that file is missing. Run "npm run tokens" to regenerate it — this is a build gap, not a naming mistake.`
      );
    }

    let content;
    try {
      content = readFileSync(skillPath, "utf-8");
    } catch (err) {
      return toolError(`SKILL.md existed a moment ago but couldn't be read (${err.message}). Try again.`);
    }

    return {
      content: [{ type: "text", text: content }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
