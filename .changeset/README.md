# Changesets

Run `pnpm changeset` for a user-visible package change. Select each affected public package and describe the behavior, compatibility impact, and migration steps. Use `pnpm changeset --empty` for tooling or documentation changes with no release impact.

Review the pending plan with `pnpm release:status`. See [the release guide](../docs/releases.md) for versioning, the `next` channel, verification, and artifact preparation. Adding a changeset does not publish or change package versions.
