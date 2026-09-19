/** Extract the effective static CSS, including inherited/shared Lit styles, without creating DOM. */
export function effectiveCss(constructor) {
  if (typeof constructor?.finalize !== 'function') {
    throw new TypeError('Expected a Lit component constructor with finalize().');
  }
  constructor.finalize();
  return (constructor.elementStyles ?? []).map((sheet) => {
    if (typeof sheet?.cssText === 'string') return sheet.cssText;
    if (sheet?.cssRules) return Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n');
    throw new TypeError('Unsupported stylesheet in component styling audit.');
  }).join('\n');
}

/** ADS public tokens use ASCII identifiers. Ignore comments and quoted content, not nested fallbacks. */
export function referencedTokens(css) {
  const executable = css.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
  return [...new Set(Array.from(executable.matchAll(/\bvar\(\s*(--ads-[\w-]+)(?=\s*[,\)])/g), (match) => match[1]))].sort();
}

/** Audit all first-party component namespaces, not only the current file's prefix. */
export function auditStyling(contract, css, componentNames) {
  const prefixes = componentNames.map((name) => `--ads-${name}-`);
  const isComponentToken = (token) => prefixes.some((prefix) => token.startsWith(prefix));
  const referenced = referencedTokens(css);
  const declared = (contract.cssCustomProperties ?? []).map((token) => token.name);
  const duplicateDeclarations = [...new Set(declared.filter((token, index) => declared.indexOf(token) !== index))].sort();
  const undeclared = referenced.filter((token) => isComponentToken(token) && !declared.includes(token));
  const unused = declared.filter((token) => isComponentToken(token) && !referenced.includes(token)).sort();
  return {
    declaredTokens: declared,
    referencedTokens: referenced,
    undeclaredLocalTokens: undeclared,
    unusedDeclaredComponentTokens: unused,
    duplicateDeclarations,
    sharedReferencedTokens: referenced.filter((token) => !isComponentToken(token)),
    valid: undeclared.length === 0 && unused.length === 0 && duplicateDeclarations.length === 0,
  };
}
