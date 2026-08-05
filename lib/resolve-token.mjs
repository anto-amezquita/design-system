/**
 * Shared DTCG token resolver.
 *
 * Handles two reference styles found in this token system:
 *   {category.key}        — dotted path into globalTokens (e.g. {color.warm-800})
 *   {category.sub.key}    — multi-level path   (e.g. {feedback.success.50})
 *   {token-name}          — kebab-case ref into the semantic/merged token map
 *
 * Returns the first raw primitive value (hex, px, ms, number string, etc.).
 * Returns null if the reference chain is unresolvable or circular.
 */
export function makeResolver(semanticTokens, globalTokens) {
  function resolveGlobalPath(ref) {
    // Navigate globalTokens along dot-separated path segments
    const segments = ref.split('.');
    let node = globalTokens;
    for (const seg of segments) {
      if (node == null) return undefined;
      node = node[seg];
    }
    if (node == null) return undefined;
    const val = node.$value ?? node.value;
    return val === undefined || val === null ? undefined : val;
  }

  // Resolves a single {ref} — dotted (global primitive) or kebab (semantic) —
  // and keeps following the chain if the target itself is another reference.
  function resolveRef(ref, visited) {
    if (!ref.includes('.')) {
      // Kebab-case semantic reference — delegate to resolve(), which owns
      // visited-tracking for token names. Don't also mark it here, or a
      // legitimate two-level chain (A -> {B} -> {C}) gets flagged as a
      // false-positive cycle the moment resolve(B) re-checks visited.
      return resolve(ref, visited);
    }

    if (visited.has(ref)) return null;
    visited.add(ref);

    const val = resolveGlobalPath(ref);
    if (val === undefined) return null;
    const str = typeof val === 'string' ? val : String(val);
    const nested = str.match(/^\{([^}]+)\}$/);
    return nested ? resolveRef(nested[1], visited) : str;
  }

  function resolve(name, visited = new Set()) {
    if (visited.has(name)) return null;
    visited.add(name);

    const token = semanticTokens[name];
    if (!token) return null;

    const raw = token.$value ?? token.value;
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'number') return String(raw);
    if (typeof raw === 'object') return null; // shadow/composite — skip
    if (typeof raw !== 'string') return String(raw);

    const refMatch = raw.match(/^\{([^}]+)\}$/);
    if (!refMatch) return raw; // raw primitive value

    return resolveRef(refMatch[1], visited);
  }

  return resolve;
}
