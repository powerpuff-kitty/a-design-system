# ADS Minimal reference theme

ADS Minimal is the first-party visual reference theme for A Design System. It is deliberately **not** a product brand: consumers can replace it with their own token package without changing component semantics or APIs.

## Visual language

Minimal uses a paper-like near-white working surface, neutral ink, hairline structure, sharp geometry, restrained semantic color, and functional motion. Major content receives whitespace; control groups stay compact. Data, artwork, media, and semantic state should carry more chroma than application chrome.

The default hierarchy is:

1. content / canvas / result,
2. local structure through hairlines and spacing,
3. contextual controls,
4. floating elevation only when an element is actually layered over another surface.

Decorative shadows, glass effects, ambient gradients, rounded card grids, and pill-shaped navigation are not part of the reference theme.

## Token contract

Theme sources live in:

- `@a-design-system/tokens/themes/minimal-light.json`
- `@a-design-system/tokens/themes/minimal-dark.json`
- `@a-design-system/tokens/themes/minimal-high-contrast.json`

They are complete DTCG token graphs and intentionally expose the same token paths across variants.

### Color

Semantic roles separate product chrome from content:

- `color.surface.page|default|subtle|floating|inverse`
- `color.text.default|muted|subtle|inverse`
- `color.line.default|control|strong`
- `color.action.primary|primaryText|secondary|secondaryText|hover`
- `color.focus.ring`
- `color.state.danger|dangerText`
- `color.accent.default|selection`

Components should consume semantic roles, never the primitive palette directly unless implementing a token/debugging tool.

### Shape

- `radius.none` — square
- `radius.control` — square in Minimal
- `radius.panel` — square in Minimal
- `radius.overlay` — square in Minimal
- `radius.pill` — reserved for semantics that are inherently pill/capsule-shaped

Circular radio controls, avatars, status dots, and other shape-semantic objects may remain circular.

### Elevation

`elevation.none` is the baseline. Hairlines and spatial separation should be preferred to shadows. `elevation.overlay` exists for genuinely floating layers such as dialogs/popovers.

### Density and hit targets

The visual control heights are:

- compact: 32 px
- default: 36 px
- comfortable: 44 px

The minimum interactive target contract is separately represented as `size.target.minimum = 44px`. A compact visual control may therefore need padding/host hit-area composition rather than shrinking the actual accessible target.

### Typography

Minimal provides:

- `font.family.ui` for application text
- `font.family.mono` for code/data/technical readouts
- compact 11/12/14 px UI sizes
- medium emphasis rather than blanket semibold controls
- `font.tracking.eyebrow` for small technical uppercase labels
- tabular/mono treatment should be preferred for measurements, hashes, coordinates, and code

### Motion

90/160/240 ms durations cover fast state transitions through bounded overlays. Reduced-motion behavior remains mandatory. The reference theme does not define decorative parallax or perpetual ambient motion.

## Component requirements

First-party components should:

- use semantic/component variables for color, line, shape, focus, motion, and state;
- default to square controls/panels unless the semantic object requires another shape;
- avoid decorative elevation;
- retain strong focus-visible treatment;
- expose disabled/loading/error/selected states in high-contrast mode;
- preserve native form and keyboard semantics independently of the visual theme.

The current initial compliance slice covers button, input, textarea, checkbox, radio, and radio-group.

## Component lab

The component lab installs Minimal Light by default. Use:

- `/?theme=minimal-light`
- `/?theme=minimal-dark`
- `/?theme=minimal-high-contrast`

The lab compiles the same DTCG source with `compileTokens`; it does not maintain a separate hand-authored Minimal CSS variable set.

## Downstream products

Tintropy's current UI motivated this theme, but ADS Minimal is generic. Tintropy-specific color-analysis graphics, layout choices, routes, terminology, and product styling do not belong in the theme contract.

A downstream product may use the Minimal theme unchanged, extend its semantic token layer, or replace it entirely while continuing to use ADS component/runtime contracts.

## Roadmap

- #38 — visual-language epic
- #39 — DTCG theme/token contract
- #40 — component compliance
- #41 — reusable application/workspace patterns
- #42 — adesignsystem.com and playground application
- #43 — visual conformance and anti-drift
