# Token compiler

`@a-design-system/tokens` accepts DTCG token groups and resolves `{group.path}` aliases transitively. Unknown references and cycles throw before CSS is emitted. Output ordering is sorted by token path, so the same source produces stable artifacts.

```ts
import {
  compileTokenModes,
  compileTokens,
  compareTokenSnapshot,
  createTokenSnapshot,
  emitTokenOutputs,
  emitFigmaMetadata,
  validateContrast,
} from '@a-design-system/tokens';

const base = compileTokens(source, { prefix: 'ads', selector: ':root' });
const files = emitTokenOutputs(base);
const themes = compileTokenModes([
  { name: 'light', source: lightTokens },
  { name: 'dark', source: darkTokens },
]);

const contrast = validateContrast(base, [
  { foreground: 'color.text.default', background: 'color.surface.default' },
]);
const figmaVariables = emitFigmaMetadata(base);
const snapshot = createTokenSnapshot(base);
const breakingPaths = compareTokenSnapshot(snapshot, base);
```

`emitTokenOutputs` returns CSS, flattened JSON, a TypeScript `tokens` constant, and SCSS variables. `compileTokenModes` compiles each mode as an isolated graph and scopes it to `[data-ads-theme="<name>"]` by default; provide `selector` for a different scope. Mode names must be unique and non-empty. A mode source must include every token it references rather than reaching into another mode.

The current compiler serializes DTCG dimensions, colors, cubic Bézier arrays, primitive values, and composite values. `validateContrast` checks resolved `#rgb`/`#rrggbb` pairs against a configurable WCAG ratio (4.5 by default). `emitFigmaMetadata` returns a stable variable inventory, while snapshots identify changed or removed paths as compatibility breaks. The CLI is documented in CONTRIBUTING.md.
