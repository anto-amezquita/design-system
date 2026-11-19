#!/usr/bin/env node
/**
 * amezquita-brand: check a project's brand against the brand contract, and
 * build its CSS (decisions/0028). Runs the same way locally and in CI.
 *
 *   npx amezquita-brand check <dir> [--name <brand>] [--pairs <file>] [--json]
 *   npx amezquita-brand build <dir> --out <dir> [--name <brand>] [--pairs <file>] [--json]
 *
 * Exit codes: 0 passed, 1 the brand has problems or couldn't be built,
 * 2 the command was used wrong.
 */

import { buildBrand } from './build.mjs'
import { checkBrand } from './check.mjs'
import { formatResult } from './report.mjs'

const USAGE = `Usage:
  amezquita-brand check <dir> [--name <brand>] [--pairs <file>] [--json]
  amezquita-brand build <dir> --out <dir> [--name <brand>] [--pairs <file>] [--json]

  check            check the brand against the brand contract and the contrast pairs
  build            check, then write <brand>-light.css, <brand>-dark.css,
                   <brand>-scoped.css and <brand>-fonts.json (needs style-dictionary ^5)

  <dir>            the brand folder: tokens.json (light) and, optionally, dark.json
  --out <dir>      where build writes its files
  --name <brand>   the brand's name and the prefix of its own tokens (default: the folder name)
  --pairs <file>   extra contrast pairs for the brand's own tokens, in the format of tokens/contrast-pairs.json
  --json           print the full result as JSON instead of text`

function usage(message) {
  if (message) console.error(`${message}\n`)
  console.error(USAGE)
  process.exit(2)
}

const [command, ...rest] = process.argv.slice(2)
if (!command || command === '--help' || command === '-h') usage()
if (command !== 'check' && command !== 'build') usage(`Unknown command "${command}".`)

const options = {}
let dir
let json = false
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i]
  if (arg === '--json') json = true
  else if (arg === '--name' || arg === '--pairs' || (arg === '--out' && command === 'build')) {
    const value = rest[++i]
    if (!value || value.startsWith('--')) usage(`${arg} needs a value.`)
    options[arg.slice(2)] = value
  } else if (arg.startsWith('--')) usage(`Unknown option "${arg}".`)
  else if (dir) usage(`Only one brand folder at a time; got "${dir}" and "${arg}".`)
  else dir = arg
}
if (!dir) usage('Which brand folder?')
if (command === 'build' && !options.out) usage('Where should the files go? Pass --out <dir>.')

function print(lines, ok) {
  for (const line of lines) (ok ? console.log : console.error)(line)
}

if (command === 'check') {
  const result = checkBrand(dir, options)
  if (json) console.log(JSON.stringify(result, null, 2))
  else print(formatResult(result), result.ok)
  process.exit(result.ok ? 0 : 1)
}

const result = await buildBrand(dir, options)
if (json) {
  console.log(JSON.stringify(result, null, 2))
} else if (result.error) {
  console.error(`✗ ${result.error}`)
} else if (!result.ok) {
  print([...formatResult(result.check), 'Nothing was built.'], false)
} else {
  const lines = [...formatResult(result.check), ...result.files.map(f => `✓ Wrote ${f}`)]
  if (result.fonts.href) lines.push(`  Load the fonts with <link rel="stylesheet" href="${result.fonts.href}"> (and preconnect to ${result.fonts.preconnect.join(', ')})`)
  print(lines, true)
  for (const { family, token } of result.fonts.unknown) {
    console.warn(`⚠ ${token} names "${family}", which the font link doesn't cover. Load it in the project yourself.`)
  }
}
process.exit(result.ok ? 0 : 1)
