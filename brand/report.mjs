/**
 * Turns checkBrand()'s result into the lines the command prints. Shared by
 * the amezquita-brand command and this repo's own check (scripts/check-brands.mjs).
 */

export function formatResult(result) {
  const { brand, failures, contrast } = result
  if (failures.length === 0) {
    return [`✓ ${brand}: brand contract passed, ${contrast.checked} contrast pairs passed (${contrast.modes.join(', ')})`]
  }
  const lines = [`✗ ${brand}: ${failures.length} problem${failures.length === 1 ? '' : 's'}`, '']
  for (const f of failures) {
    const where = [f.token, f.file, f.mode].filter(Boolean).join('  ')
    lines.push(`  ${f.rule}${where ? `  ${where}` : ''}`)
    lines.push(`    ${f.message}`)
    lines.push(`    fix: ${f.fix}`)
    lines.push('')
  }
  return lines
}
