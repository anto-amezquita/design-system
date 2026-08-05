// PascalCase/camelCase → kebab-case, e.g. AllVariants → all-variants
export function toKebab(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
