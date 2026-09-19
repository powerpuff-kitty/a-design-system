# A Design System

**A Design System** is an open-source, standards-first design system for the web.

The implemented foundation uses Web Components, Shadow DOM, ElementInternals, Lit, and portable design tokens. Components and their examples are described by machine-readable contracts. **All component APIs remain experimental.** This repository is not yet a published, production-certified release.

## Implemented workspaces

```text
apps/
  docs/              # Minimal component explorer and source markup starters
  component-lab/     # Browser interaction and theme test fixtures
packages/
  core/              # Component contracts and headless interaction helpers
  components/        # 40 exported component classes, including Theme context
  tokens/            # DTCG tokens, compiler, and Minimal theme presets
  css/               # Native styles, density, workspace, and command-palette CSS
```

The integrated catalogue covers actions/content, form controls, feedback/loading, Intl formatters, and scoped theme context. Its exact public surface is enforced from source files, package subpaths, built modules, barrel exports, and documentation examples. Run `node scripts/check-component-surface.mjs` after building to generate `artifacts/component-surface.json`.

The inventory also reports component-local styling variables that are not yet declared in a contract. An export or a successful preview is not a guarantee of complete visual-state, accessibility, assistive-technology, touch-target, or performance conformance.

## Documentation

The docs use a restrained, content-first workspace: searchable library, large live preview, and one contextual inspector. The available views are Preview, Usage, API, and Styling. API tables derive from component contracts. Mobile navigation and customization use one modal panel at a time.

Every integrated component has an explicit example. A missing example or broken registration fails validation instead of silently disappearing from the catalogue.

```sh
corepack enable
pnpm install
pnpm build
pnpm --filter @a-design-system/docs dev
```

Open the local address printed by Vite. The build is a static site under `apps/docs/dist`; building does not deploy adesignsystem.com.

## Themes and customization

The first-party **Minimal** family includes `minimal-light`, `minimal-dark`, and `minimal-high-contrast`, with independent `compact`, `default`, and `comfortable` densities. These are three modes of one visual family, not three unrelated application templates.

Use semantic tokens for shared visual roles, component CSS custom properties for overrides, exposed CSS parts for styling, and slots for content. Ordinary external selectors do not pierce Shadow DOM. Native browser and operating-system controls retain platform limitations.

The inspector exposes declared public styling tokens. Customization coverage is still being completed. See [the Minimal theme guide](docs/minimal-theme.md) and [integration status](docs/integration-status.md).

The three source markup starters are **Settings form**, **Minimal workspace**, and **Review table**. They are examples to adapt, not backend-connected applications or CLI-installed template packages.

## Validation

```sh
pnpm typecheck
pnpm test
pnpm build
node scripts/check-component-surface.mjs
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:browser
pnpm exec playwright test --config playwright.docs.config.ts
```

CI runs both browser suites on the integrated commit and retains reports and build evidence. It checks every component preview under all three presets. Separate tests verify form semantics, keyboard behavior, theme/density context, and consumer styling overrides; this is not an exhaustive component × state × accessibility certification.

## Principles

- **Standards first:** use native web semantics before framework-specific abstractions.
- **Accessible behavior:** keyboard and accessibility requirements are release gates, not decorative extras.
- **Framework neutral:** Web Components are the canonical implementation.
- **Portable tokens:** visual decisions remain replaceable by downstream products.
- **Explicit evidence:** implementation, exports, documentation, tests, and release status are tracked separately.

## Roadmap, not yet implemented as complete products

Source-installable registry/CLI workflows, framework adapters, a full visual theme builder, advanced data grids/charts/scheduling, AI-native components, and agent tooling remain roadmap directions. Workspaces are introduced when their implementation exists, rather than as empty packages.

Namespaces are `ads-*` for components, `a-design-system-*` for system context, `@a-design-system/*` for packages, and `--ads-*` for CSS variables. Do not infer that a named roadmap component is available from the current package.

## License

Apache-2.0.
