# Minimal workspace recipe

The Minimal workspace recipe combines a framework-free layout state machine from `@a-design-system/core` with source-owned CSS from `@a-design-system/css/minimal-workspace.css`.

It is intentionally not a heavyweight application-shell component. Products keep ownership of their DOM, routes, persistence, and tool logic while sharing the same layout/state contract.

## Install

```ts
import { WorkspaceLayoutState } from '@a-design-system/core';
import '@a-design-system/css/minimal-workspace.css';
```

## Markup

```html
<div
  class="ads-workspace"
  data-tools-collapsed="false"
  data-document-collapsed="false"
>
  <nav class="ads-workspace__rail" aria-label="Workspace tools">
    <!-- compact task/tool actions -->
  </nav>

  <aside class="ads-workspace__tools" data-pinned="true">
    <div class="ads-workspace__panel-controls"><!-- collapse/pin controls --></div>
    <div class="ads-workspace__panel-content"><!-- contextual inspector --></div>
  </aside>

  <main class="ads-workspace__result">
    <!-- canvas / artifact / content / analysis -->
  </main>

  <aside class="ads-workspace__document" data-pinned="true">
    <div class="ads-workspace__panel-controls"><!-- collapse/pin controls --></div>
    <div class="ads-workspace__panel-content"><!-- document/output inspector --></div>
  </aside>

  <div class="ads-workspace__mobile-launchers">
    <!-- buttons that set data-mobile-open on exactly one inspector -->
  </div>
</div>
```

## State

```ts
const layout = new WorkspaceLayoutState();

layout.addEventListener('change', () => {
  const state = layout.snapshot;

  workspace.dataset.toolsCollapsed = String(state.toolsCollapsed);
  workspace.dataset.documentCollapsed = String(state.documentCollapsed);

  tools.dataset.pinned = String(state.toolsPinned);
  documentPanel.dataset.pinned = String(state.documentPinned);

  tools.dataset.mobileOpen = String(state.mobilePanel === 'tools');
  documentPanel.dataset.mobileOpen = String(state.mobilePanel === 'document');

  localStorage.setItem('my-product.workspace-layout', JSON.stringify(state));
});
```

The state machine contains **presentation state only**:

- tools collapsed/pinned
- document collapsed/pinned
- one active mobile sheet

It does not contain artwork, document, route, authentication, data, or business state.

## Responsive behavior

Desktop:

- narrow tool rail
- optional left contextual inspector
- dominant result/content surface
- optional right document/output inspector
- inspectors may be sticky or collapsed independently

Tablet:

- result remains dominant
- inspectors flow below the result rather than forcing four cramped columns

Mobile:

- result first
- tool rail becomes horizontal
- contextual/document inspectors are hidden until opened as bottom sheets
- only one sheet should be open at once

## Accessibility

Applications remain responsible for their control labels and focus-return policy. Recommended behavior:

- rail uses a labelled `nav`
- inspectors use labelled `aside` regions
- collapse/pin buttons expose `aria-expanded` / `aria-pressed`
- mobile launchers expose `aria-expanded`
- closing a sheet returns focus to the launcher that opened it
- sheet content remains in logical DOM order
- keyboard users can reach the same commands exposed in a command palette

## Theme relationship

The CSS recipe consumes public ADS semantic tokens only. Under the Minimal theme it becomes paper-like, square, hairline-driven, and low-elevation. Another theme can completely change those visual decisions without changing the workspace state contract.

Tracked by #41 and #21.
