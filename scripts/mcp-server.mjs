#!/usr/bin/env node
// MCP server — read-only reference surface over this repo's generated artifacts.
// Spec: docs/mcp-server-spec.md. Phase 2: list_components, get_component.
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

const transport = new StdioServerTransport();
await server.connect(transport);
