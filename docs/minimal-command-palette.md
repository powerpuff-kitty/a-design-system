# Minimal command palette recipe

ADS treats a command palette as a composition of existing application commands, not a second business-logic system.

The recipe combines:

- the deterministic framework-free `rankCommandPaletteItems` helper from `@a-design-system/core`;
- native dialog/search/list semantics owned by the application;
- `@a-design-system/css/minimal-command-palette.css` for the Minimal reference appearance.

## Install

```ts
import { rankCommandPaletteItems } from '@a-design-system/core';
import '@a-design-system/css/minimal-command-palette.css';
```

## Command model

```ts
const commands = [
  {
    id: 'color-space',
    label: 'Color Space',
    description: 'Explore colors in 3D.',
    keywords: ['3d', 'oklab', 'analysis'],
    run: () => openTool('color-space'),
  },
  {
    id: 'undo',
    label: 'Undo',
    description: 'Move back in history.',
    keywords: ['history', 'revert'],
    run: () => history.undo(),
  },
];

const ranked = rankCommandPaletteItems(commands, query);
```

`rankCommandPaletteItems` is deterministic:

- an empty query preserves source order;
- exact label matches outrank prefixes;
- prefixes outrank contains matches;
- keywords and descriptions participate at lower weights;
- every query term must appear somewhere in the command metadata;
- source index resolves equal-score ties.

The helper never executes commands and never reads application state by itself.

## Markup

A native `<dialog>` is a good base where browser support matches the application policy:

```html
<dialog class="ads-command-palette" aria-label="Command palette">
  <label class="ads-command-palette__search">
    <span aria-hidden="true">⌘</span>
    <input type="search" aria-label="Search commands" autocomplete="off">
    <kbd>ESC</kbd>
  </label>

  <div class="ads-command-palette__list" role="listbox" aria-label="Commands">
    <div class="ads-command-palette__group-label">Tools</div>

    <button
      class="ads-command-palette__item"
      role="option"
      aria-selected="true"
      type="button"
    >
      <span class="ads-command-palette__item-main">
        <strong>Color Space</strong>
        <span class="ads-command-palette__item-description">Explore colors in 3D.</span>
      </span>
      <kbd class="ads-command-palette__shortcut">3D</kbd>
    </button>
  </div>
</dialog>
```

Applications that need richer combobox semantics may use the ADS listbox/combobox primitives instead; the visual recipe is independent from the exact state-machine implementation.

## Interaction contract

Recommended behavior:

- Ctrl/Cmd+K opens the palette.
- Search receives focus immediately.
- Up/Down moves the active result.
- Enter runs the active command if enabled.
- Escape closes and restores focus to the opener.
- Disabled commands remain discoverable but cannot execute.
- Group labels are not focusable.
- The command palette calls the same command/action functions used by visible buttons and menus.

Do **not** build separate Undo, Save, Export, navigation, or destructive-action implementations inside the palette.

## Privacy

Search strings are local UI state. The Minimal recipe does not include analytics or network transport.

If a product attaches analytics, prefer coarse events such as:

- palette opened
- command id executed
- zero-results occurred

Do not send raw query text, document data, media contents, source code, or secret values by default.

## Responsive behavior

On desktop the palette is a bounded, square-cornered overlay.

On narrow screens the same composition becomes a bottom sheet:

- full viewport width;
- bounded vertical height;
- search remains first;
- results scroll independently;
- touch targets must still satisfy the product's accessible-target policy.

## Theme contract

The recipe uses public semantic tokens only:

- surface/floating
- line/control
- text/default + muted
- accent/selection
- focus
- overlay elevation
- control sizes
- square radius

Another ADS theme can restyle the command palette without changing command ranking or application actions.

Tracked by #41 and #21.
