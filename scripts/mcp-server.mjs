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

// Derived once at startup from the registry itself, not hand-typed — if a
// tier is ever renamed or added upstream, this stays correct without a
// separate edit here.
const TIERS = [...new Set(readComponentRegistry().components.map((c) => c.tier))];

// Same reasoning as TIERS: derived from token-reference.json's real category
// values (primitive, color, motion, spacing, ... ) rather than hand-typed.
const CATEGORIES = [...new Set(readTokenReference().tokens.map((t) => t.category))];

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
    const registry = readComponentRegistry();
    const normalized = normalizeForMatch(slug);
    const component = registry.components.find(
      (c) => isPublic(c) && (normalizeForMatch(c.slug) === normalized || normalizeForMatch(c.name) === normalized)
    );

    if (!component) {
      return toolError(
        `No public component matches "${slug}". Call list_components for the real list — this name doesn't exist in tokens/component-registry.json.`
      );
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
      query: z.string().min(1).describe('Substring to match against token name/cssVar, e.g. "space" or "accent".'),
      category: z.enum(CATEGORIES).optional().describe("Narrow to one token category."),
    },
  },
  async ({ query, category }) => {
    const { tokens } = readTokenReference();
    const q = query.trim().toLowerCase();
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
    const varName = extractTokenVarName(name) ?? name;
    const token = tokens.find((t) => t.cssVar === varName || t.name === name);

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
      "Check whether a var(--x) reference or bare token name is real, before using it in CSS. Reuses this repo's actual lint rules (no-fabricated-token, no-token-fallback) from scripts/lint-tokens.mjs — the same checks npm run validate enforces — so a tool pass here means the lint pass will also be clean.",
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
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: false,
                reason: `"${token}" isn't a recognized token reference — expected var(--x), a bare --x custom property, or a bare token name like "space-4".`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const knownTokenVars = loadKnownTokenVars(repoRoot);
    if (!isKnownTokenVar(varName, knownTokenVars)) {
      reasons.push(
        `${varName} isn't a real token — not in tokens/global.json, any brand's tokens.json, or tokens/components/*.json, and not a --radix-* runtime variable (no-fabricated-token). Call search_tokens to find the real one.`
      );
    }

    const validReason = RADIX_VAR_RE.test(varName)
      ? `${varName} is a Radix Primitives runtime variable, not a design token — allowed, but won't resolve to a value in tokens/token-reference.json.`
      : `${varName} is a real token.`;
    const result = reasons.length > 0 ? { valid: false, reason: reasons.join(" ") } : { valid: true, reason: validReason };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
