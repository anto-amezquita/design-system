#!/usr/bin/env node
// MCP server — read-only reference surface over this repo's generated artifacts.
// Spec: docs/mcp-server-spec.md. Scaffold phase (Task 1.1): zero tools, stdio only.
// Do not add logic here that isn't already produced by an existing generator —
// see the spec's "What it wraps, not what it builds" table before adding a tool.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Resolved from this file's own location, not process.cwd() — unlike the other
// scripts/ generators (always invoked via `npm run` from repo root), an MCP
// client can spawn this process with a different working directory.
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const server = new McpServer({
  name: "amezquita-design-system",
  version: pkg.version,
});

const transport = new StdioServerTransport();
await server.connect(transport);
