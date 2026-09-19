# Versioning and release preparation

Public packages are versioned independently with Changesets. `private: true` applications and tooling are never versioned or published by Changesets. The default branch is `main`; packages use public npm access. No workflow currently publishes, creates tags, or pushes release commits.

## Change policy

Every user-visible package change needs a changeset with a plain-language explanation. Use patch for compatible fixes, minor for compatible additions, and major for incompatible public API changes after 1.0. Before 1.0, use minor for intentional breaking changes and describe migration steps; patch releases remain compatible. Version numbers and component maturity are separate: publishing a package does not promote an experimental component to stable.

Use `pnpm changeset` to select packages and write release notes. Tooling-only or documentation-only changes may use `pnpm changeset --empty`. Reviewers check changeset scope and compatibility; CI does not currently require a nonempty changeset on every pull request. Conventional commit subjects aid review, but changesets are the source for generated package changelogs.

## Prepare a version change

Start on a clean branch with dependencies installed from the lockfile:

```sh
pnpm release:status
pnpm release:version
pnpm check
pnpm test:browser
pnpm release:pack
```

`release:version` updates package versions and changelogs, consumes pending changesets, updates the lockfile, and formats changed documents. Review these changes in a pull request. It does not commit them. `release:pack` builds and writes each public package tarball, `SHA256SUMS`, and a manifest to ignored `release-artifacts/`. It rejects placeholder `0.0.0` versions. Checksums cover the tarballs; the manifest records the base Git commit and whether the checkout was modified. These are candidate artifacts, not signed releases.

## Prerelease channel

The experimental prerelease tag is `next`. On a dedicated prerelease branch, set `.changeset/config.json`'s `baseBranch` to that branch for change detection, then run:

```sh
pnpm release:pre
pnpm release:version
```

Retain and commit Changesets' prerelease state with each reviewed version change. Add new changesets and run `release:version` for subsequent prereleases. When ready to prepare versions without a prerelease suffix, run `pnpm release:exit-pre`, restore `baseBranch` to `main`, and run `pnpm release:version`. The [Changesets prerelease guide](https://changesets.dev/guide/prereleases) explains state management and npm dist-tag behavior. A prerelease suffix must not be treated as a guarantee about npm's `latest` tag, especially for a package's first publication.

## GitHub candidate workflow

The manual **Prepare release candidate** workflow accepts `next` or `stable`, versions an ordinary checkout, runs the full checks and browser matrix, and uploads tarballs, checksums, metadata, and `version.patch`. It rejects an existing prerelease state; use the CLI flow above for an ongoing prerelease branch. Here `stable` means versions without a prerelease suffix, not that every component has stable maturity.

Download and inspect the artifact; apply `version.patch` only to the matching base commit on a clean branch, then review and commit the version changes. Never rerun a fresh `next` workflow as a substitute for retaining an already published prerelease's state. The workflow has read-only repository permissions and no registry credentials.

`pnpm test:release` exercises a fresh disposable workspace through `next` and ordinary versions, checking changelogs, private-package exclusions, tarball dependency versions, checksums, and isolated consumer imports/types. It seeds fixture versions and never changes the working checkout. CI runs this lifecycle test as well.

## Publication and supply-chain strategy

Publication remains a separate, unimplemented step. Before enabling it:

- Configure npm ownership and trusted publishing for `@a-design-system/*`, with a protected GitHub release environment and an approved version commit.
- Publish only artifacts verified from that version commit; record exact Node, pnpm, lockfile, test-browser versions, and artifact checksums.
- Generate an SPDX or CycloneDX SBOM from the resolved production dependency graph for each packed package, including licenses and versions. Check that it describes the installed tarball, not the entire development workspace.
- Use npm provenance and GitHub artifact attestations through OIDC. SHA-256 files alone are not signatures or proof of origin. This repository does not yet generate SBOMs or attestations.
- Verify registry tarball integrity, provenance, exports, dependency versions, and the intended dist-tag after publication. Keep the version commit, changelogs, and release artifacts together.
- For a defective release, publish a corrective version and document the affected range. Prefer deprecation and dist-tag repair over removing versions consumers may already depend on.

Automated accessibility audits, bundle budgets, and CEM/schema validation remain foundation release gates to implement before declaring a stable release process. Passing the current candidate workflow does not imply those checks ran.
