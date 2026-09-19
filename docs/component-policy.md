# Component maturity and compatibility

The `status` field in each component contract is authoritative. Every current component is `experimental`.

- **Experimental:** available for evaluation, with changes described in changesets. A package version does not promise API stability for experimental components.
- **Stable:** promotion requires reviewed API metadata and examples, native semantics where applicable, keyboard and focus tests, accessibility review, documented slots/parts/events/tokens, browser verification, and an explicit compatibility commitment.
- **Deprecated:** the component remains usable with a documented replacement, migration instructions, and planned removal version. Deprecation is not deletion.

After a stable 1.x API is published, removing or incompatibly changing public attributes, properties, methods, events, slots, parts, or semantic tokens requires a major release. Announce deprecations in documentation, contract metadata where supported, and a minor-release changelog before removal. Security fixes may require an accelerated migration; explain the affected versions and replacement. Before 1.0, breaking changes use a minor version and still require migration notes.

## Browser policy

The current automated matrix is Chromium, Firefox, and WebKit supplied by the locked Playwright version. It covers the existing form controls, not every planned component or accessibility criterion. Playwright WebKit is not proof of behavior in shipping Safari or on physical mobile devices.

The support target for stable promotion is current stable Chrome, Firefox, and Safari at the release date. Record the actual tested versions in release evidence, including manual Safari and representative mobile checks for relevant controls. Until this evidence and the remaining release gates exist, ADS remains experimental and makes no stable browser-support guarantee. Internet Explorer is outside the target.

Document reliance on platform APIs such as ElementInternals, custom states, Shadow DOM, and form association. Introduce fallbacks or update the declared support target through a reviewed compatibility change. Dropping a browser supported by a stable release follows the major-version deprecation policy above.
