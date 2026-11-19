#!/usr/bin/env node
/**
 * amezquita-brand: check a project's brand against the brand contract
 * (decisions/0028). Runs the same way locally and in CI.
 *
 *   npx amezquita-brand check <dir> [--name <brand>] [--pairs <file>] [--json]
 *
 * Exit codes: 0 passed, 1 the brand has problems, 2 the command was used wrong.
 */

import { checkBrand } from './check.mjs'
import { formatResult } from './report.mjs'

const USAGE = `Usage: amezquita-brand check <dir> [--name <brand>] [--pairs <file>] [--json]

  <dir>            the brand folder: tokens.json (light) and, optionally, dark.json
  --name <brand>   the brand's name and the prefix of its own tokens (default: the folder name)
  --pairs <file>   extra contrast pairs for the brand's own tokens, in the format of tokens/contrast-pairs.json
  --json           print the full result as JSON instead of text`

function usage(message) {
  if (message) console.error(`${message}\n`)
  console.error(USAGE)
  process.exit(2)
}

const args = process.argv.slice(2)
const [command, ...rest] = args
if (!command || command === '--help' || command === '-h') usage()
if (command !== 'check') usage(`Unknown command "${command}".`)

const options = {}
let dir
let json = false
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i]
  if (arg === '--json') json = true
  else if (arg === '--name' || arg === '--pairs') {
    const value = rest[++i]
    if (!value || value.startsWith('--')) usage(`${arg} needs a value.`)
    options[arg.slice(2)] = value
  } else if (arg.startsWith('--')) usage(`Unknown option "${arg}".`)
  else if (dir) usage(`Only one brand folder at a time; got "${dir}" and "${arg}".`)
  else dir = arg
}
if (!dir) usage('Which brand folder?')

const result = checkBrand(dir, options)
if (json) console.log(JSON.stringify(result, null, 2))
else for (const line of formatResult(result)) (result.ok ? console.log : console.error)(line)
process.exit(result.ok ? 0 : 1)
