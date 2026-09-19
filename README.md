# A Design System

**A Design System** is an open-source, standards-first design-system platform for the web.

The project is built around interoperable Web Components (`<ads-…>`), DTCG design tokens, headless behavior primitives, source-installable components, framework adapters, testing utilities, AI-native interface components, and machine-readable tooling for developers and coding agents.

## Principles

- **Standards first** — HTML, CSS, Custom Elements, Shadow DOM, ElementInternals, and platform APIs before framework-specific abstractions.
- **Accessible by default** — accessibility and keyboard behavior are release criteria, not optional enhancements.
- **Install it or own it** — consume versioned packages or install component source through the ADS registry/CLI.
- **Framework neutral** — canonical components are Web Components; framework adapters provide native ergonomics where useful.
- **Token portable** — stable DTCG token files are the source of truth and compile to CSS and platform adapters.
- **Agent readable** — component contracts, tokens, examples, migrations, and rules are exposed as structured data.
- **Open advanced UI** — complex components such as data grids, charts, scheduling, and AI interfaces should not be artificially paywalled.

## Workspace direction

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

The repository starts with `tokens`, `core`, and `components`; the remaining workspaces are introduced as their contracts are implemented rather than as empty packages.

## Namespaces

- Custom elements: `<ads-button>`, `<ads-dialog>`, `<ads-prompt-input>`
- System/meta elements: `<a-design-system-theme>`, `<a-design-system-devtools>`
- Packages: `@a-design-system/*`
- CSS custom properties: `--ads-*`
- CSS utility classes: `.ads-*`
- CLI: `ads`

## Development

Use Node.js 24 (the version in `.node-version`) and pnpm 10.17.1 (the version in `packageManager`). CI uses the same Node version. The root `engines` field records the versions allowed by the development toolchain.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm exec playwright install chromium firefox webkit
pnpm test:browser
```

`pnpm check` runs lint, formatting and package-boundary checks, builds the workspace, typechecks it, runs unit tests, and verifies packed packages in an isolated consumer. `pnpm build` removes previous workspace build output before rebuilding in dependency order. See [CONTRIBUTING.md](CONTRIBUTING.md) for package boundaries and focused checks.

The documentation site is available locally with `pnpm run dev` at `http://127.0.0.1:4174`. Use `pnpm run docs:build` to produce the static site artifact.

## Current foundation

- pnpm monorepo with strict TypeScript
- stable DTCG 2025.10 token source
- framework-free headless interaction primitives
- Lit-based button, input, textarea, checkbox, radio, and radio-group Web Components
- unit tests and Chromium, Firefox, and WebKit form interaction tests
- frozen dependency installs and isolated package export/declaration checks

## Project policies

See [contributing](CONTRIBUTING.md), [releases](docs/releases.md), [component and browser compatibility](docs/component-policy.md), [security](SECURITY.md), and the [code of conduct](CODE_OF_CONDUCT.md).

## Status

Early development. The public API is not stable yet.

## License

Apache-2.0.
