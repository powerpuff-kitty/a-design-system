# Styling contracts and customization boundaries

Every component exposes its public CSS variables in `cssCustomProperties` on its exported contract. The documentation API tables and live inspector use that same contract. A declaration is not proof that an override is visible in every state: browser tests cover representative bindings and regressions separately.

## Customization order

Use global semantic tokens for a product theme, component CSS variables for a local override, and documented `::part()` selectors for additional styling. An override can be inherited from an ancestor or set on an individual host. Removing it restores the applicable theme/variant fallback. Component variants must consume a public variable through `var(...)`, not redefine it on a shadow descendant and hide the consumer's inherited value.

```css
.product-panel {
  --ads-input-label-font-size: 0.9375rem;
  --ads-input-message-gap: 0.5rem;
}

ads-select {
  --ads-select-padding-block: 0.75rem;
  --ads-select-radius: 0.25rem;
}

ads-tag[variant='accent'] {
  --ads-tag-background: #143b38;
  --ads-tag-color: #ffffff;
  --ads-tag-border: #4a8982;
}
```

Input, Search Input, Password Input, and Number Input intentionally share the `--ads-input-*` styling family. Number Input reuses the input styling contract rather than maintaining a stale copy. Icon Button consumes documented `--ads-button-*` color/interaction variables as well as its own size, padding, radius, and border-width controls. Toast Item uses the documented `--ads-toast-*` family shared with the viewport; it is not restricted to variables beginning `--ads-toast-item-*`.

## State-specific variables

Invalid and focus-border variables apply only in the corresponding state. Primary, secondary, ghost, and danger button tokens apply to their named variants. Hover/active brightness values are unitless CSS filter multipliers. Skeleton width/height defaults depend on shape: rect is `100% × 1rem`, text is `100% × 0.75em`, and circle is `2.5rem × 2.5rem`. Explicit width/height variables override these defaults. Avatar's square-radius token applies to square shape; circular avatars retain their separate radius variable.

## Validation

```sh
pnpm build
node --test scripts/styling-surface.test.mjs
node scripts/check-component-surface.mjs
pnpm test:browser
```

The package/docs gate inspects each compiled Lit constructor's effective static styles, including inheritance and borrowed style arrays. It rejects undeclared first-party component variables, unused component-variable declarations, and duplicate declarations. CSS comments and quoted content do not count as live references. Nested fallback references do count. Unsupported stylesheet representations fail instead of silently producing an empty inventory.

`artifacts/component-surface.json` is schema version 2 and includes declared metadata, effective references, shared semantic references, and diagnostics. The legacy `undeclaredLocalTokens` field is retained, but now covers all recognized component families used by that component, not merely the filename's own prefix.

## Not certified by this gate

The gate does not certify contrast for arbitrary overrides, every state combination, operating-system picker styling, manual assistive-technology behavior, pointer target sizes, or performance. Shared global theme tokens are inventoried, not required to be duplicated in every component contract. All components remain experimental until their broader release criteria are met.
