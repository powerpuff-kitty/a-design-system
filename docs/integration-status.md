# Component, theme, and documentation integration

This integration combines the committed component work at `8cd7bc4ef74ccc6f4786570dd3aad0f99c6afb8e` (PR #51) and the Minimal docs/themes at `8aacb91f4d74c2d8fd395256051c7ddc4e795a10` (PR #52). Both commits remain in the merge ancestry. No uncommitted or roadmap-only components are claimed as shipped.

The union retains both browser test suites. Shared controls preserve the Minimal theme while the input keeps its specialized-type extension point and the checkbox keeps its group/event repairs. The docs catalogue is generated from the integrated package exports.

All components remain experimental. Successful integration tests are not a claim of complete keyboard, assistive-technology, forced-colors, visual-state, or performance coverage for every element. Template starters are markup examples, not backend-connected applications. No package publication or site deployment is performed by this change.
