# Contributing

ADS is early development. Select a concrete portion of a [project issue](https://github.com/users/powerpuff-kitty/projects/20) and describe the behavior and verification in your pull request. Broad roadmap issues may require multiple pull requests; completing one portion does not complete the whole issue.

## Local verification

Install the pnpm version from the root `packageManager` field, then run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm exec playwright install chromium firefox webkit
pnpm test:browser
```

On Linux, Playwright may need `pnpm exec playwright install --with-deps chromium firefox webkit`. Use Node.js 24 from `.node-version`, which CI also reads. The root `engines` field matches the development toolchain's Node requirements; CI does not yet verify every allowed Node version. This is a contributor tooling requirement, not a browser compatibility policy.

`pnpm check` runs lint, formatting, and boundary-rule tests, then builds before typechecking because package types and JavaScript resolve to generated `dist` files. After an initial build, use `pnpm typecheck`, `pnpm test`, or `pnpm --filter @a-design-system/core test` for focused work. Run `pnpm build` again after changing dependencies or public declarations. The browser test command builds before starting the component lab.

`pnpm check:packages` requires an existing build. It packs each public package, installs the tarballs outside the workspace using the local pnpm store, checks export targets and licenses, imports every JavaScript entry in Node, and compiles a strict TypeScript consumer of the public declarations. This checks SSR-safe imports; it does not claim server-side component rendering or hydration support.

Commit `pnpm-lock.yaml` with intentional dependency changes. CI uses frozen installs. Do not commit `node_modules`, generated `dist` output, test reports, or package tarballs.

## Lint and formatting

Run `pnpm lint` for ESLint and `pnpm format:check` for Prettier. Use `pnpm format` to apply formatting before review. Generated output, reports, the lockfile, and the license text are excluded from formatting.

The ESLint setup uses the [typescript-eslint recommended rules](https://typescript-eslint.io/users/configs/). The private `tools/lint` workspace isolates its supported TypeScript 6 parser dependency from the root TypeScript 7 build compiler. It has no publishable runtime artifact. Narrow exceptions for TypeScript's generic mixin constructor signatures are documented at the affected lines.

The local `ads/workspace-imports` rule checks static imports, re-exports, literal dynamic imports, import types, and literal `require` calls. It rejects cross-workspace relative paths, unexported package paths, undeclared runtime dependencies, and imports against the dependency direction below. Manifest checks enforce `workspace:*` references and the same direction for runtime, development, peer, and optional dependencies. Core and tokens reject React, Vue, Lit, and Angular dependencies. Root-owned Vitest and Playwright imports are permitted only in `.test.ts` and `.spec.ts` files. These are source checks, not a sandbox for computed runtime module loading. `pnpm test:tooling` verifies accepted and rejected examples.

## Workspace and package contracts

- `packages/core` contains framework-free behavior and component contract types. It must not depend on components or applications.
- `packages/tokens` contains portable token data and compilation. It must not depend on components or applications.
- `packages/components` owns canonical Web Components and may depend on core and Lit.
- `apps/component-lab` consumes public package exports and provides browser fixtures.

Use `@a-design-system/*` package imports across workspace boundaries, with `workspace:*` for local dependencies. Do not import another package's source or private `dist` paths. Internal relative ESM imports use `.js` extensions. Public entry points are explicitly listed in `exports`, with built `.d.ts` declarations and `.js` runtime files; add a subpath there when it becomes part of the supported API. Source is included for inspection and declaration maps, but unit-test files are excluded from tarballs. New workspaces should contain an implemented contract rather than empty placeholders.

Keep core and tokens free of module-level side effects. Components currently register their canonical custom elements on import and therefore declare `sideEffects: true`. Imports must remain safe when browser globals are absent. Component instances still require a browser.

## Changes and licensing

Use a concise change description such as `fix(forms): preserve reset values` or `feat(core): add keyboard navigation`. Include the issue, user-visible behavior, tests run, and compatibility implications in the pull request. All current component contracts are experimental; the project does not yet promise a stable public API.

Contributions use the repository's Apache-2.0 license. Packed workspaces include the root LICENSE through pnpm's workspace packing behavior, which the package check verifies. Preserve upstream copyright, license, and required attribution when incorporating third-party code. Add a NOTICE file when incorporated material requires one; do not invent third-party attribution for original code.

Add a changeset for package behavior or distribution changes; see the [release guide](docs/releases.md) for versioning, prereleases, candidate artifacts, and the publication strategy. The manual candidate workflow does not publish packages.

After `pnpm build`, token sources can be checked or compiled with `pnpm tokens:validate`, `pnpm tokens:build`, or `pnpm ads tokens diff <current.json> <baseline.json>`. The build command writes CSS, JSON, TypeScript, and SCSS files to `dist/tokens` by default. A diff exits with status 1 when values are added, removed, or changed.

Follow the [code of conduct](CODE_OF_CONDUCT.md), [security reporting policy](SECURITY.md), and [component maturity/browser policy](docs/component-policy.md). Use the [RFC template](docs/templates/rfc.md) to propose consequential changes and the [ADR template](docs/templates/adr.md) to record accepted decisions. Store filled documents under `docs/rfcs/` or `docs/decisions/` and link them from the relevant issue or pull request.

Registry publication, SBOM/attestation generation, API compatibility snapshots, automated accessibility audits, bundle budgets, and CEM/schema validation remain tracked by [foundation issue #2](https://github.com/powerpuff-kitty/a-design-system/issues/2).
