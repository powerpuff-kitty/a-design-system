# A Design System

**A Design System** is an open-source, standards-first design-system platform for the web.

The project is built around interoperable Web Components (`<ads-…>`), DTCG design tokens, headless behavior primitives, source-installable components, framework adapters, testing utilities, AI-native interface components, and machine-readable tooling for developers and coding agents.

## Principles

- **Standards first** — HTML, CSS, Custom Elements, Shadow DOM, ElementInternals, and platform APIs before framework-specific abstractions.
- **Accessible by default** — accessibility and keyboard behavior are release criteria, not optional enhancements.
- **Install it or own it** — consume versioned packages or install component source through the ADS registry/CLI.
- **Framework neutral** — canonical components are Web Components; framework adapters provide native ergonomics where useful.
- **Token portable** — DTCG token files are the source of truth and compile to CSS and platform adapters.
- **Agent readable** — component contracts, tokens, examples, migrations, and rules are exposed as structured data.
- **Open advanced UI** — complex components such as data grids, charts, scheduling, and AI interfaces should not be artificially paywalled.

## Planned workspace

```text
apps/
  docs/              # adesignsystem.com
  playground/
  theme-builder/
  component-lab/
packages/
  core/              # headless behavior primitives
  components/        # <ads-…> Web Components
  tokens/            # DTCG tokens + compilers
  css/               # native styles, reset, utilities
  icons/
  registry/
  cli/               # `ads`
  test/
  react/
  vue/
  ai/                # AI-native components and adapters
  agent/             # skills, machine-readable context, MCP tooling
```

## Namespaces

- Custom elements: `<ads-button>`, `<ads-dialog>`, `<ads-prompt-input>`
- System/meta elements: `<a-design-system-theme>`, `<a-design-system-devtools>`
- Packages: `@a-design-system/*`
- CSS custom properties: `--ads-*`
- CLI: `ads`

## Status

Early development. The public API is not stable yet.

## License

Apache-2.0 (planned; license file will be added as part of repository foundation work).
