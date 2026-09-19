import { describe, expect, it } from 'vitest';
import { WorkspaceLayoutState } from './workspace.js';

describe('WorkspaceLayoutState', () => {
  it('keeps document/tool presentation state independent from domain state', () => {
    const state = new WorkspaceLayoutState();
    expect(state.snapshot).toEqual({
      toolsCollapsed: false,
      documentCollapsed: false,
      toolsPinned: true,
      documentPinned: true,
      mobilePanel: 'none',
    });

    state.toggleTools();
    state.toggleDocumentPinned();
    state.openMobilePanel('document');

    expect(state.snapshot).toEqual({
      toolsCollapsed: true,
      documentCollapsed: false,
      toolsPinned: true,
      documentPinned: false,
      mobilePanel: 'document',
    });
  });

  it('emits change only when layout state actually changes', () => {
    const state = new WorkspaceLayoutState({ toolsCollapsed: true });
    let changes = 0;
    state.addEventListener('change', () => changes++);

    state.setToolsCollapsed(true);
    state.setToolsCollapsed(false);
    state.openMobilePanel('tools');
    state.openMobilePanel('tools');
    state.closeMobilePanel();

    expect(changes).toBe(3);
  });

  it('restores partial saved preferences and can reset to defaults', () => {
    const state = new WorkspaceLayoutState();
    state.restore({ toolsPinned: false, documentCollapsed: true });

    expect(state.toolsPinned).toBe(false);
    expect(state.documentCollapsed).toBe(true);

    state.reset();
    expect(state.snapshot.toolsPinned).toBe(true);
    expect(state.snapshot.documentCollapsed).toBe(false);
    expect(state.snapshot.mobilePanel).toBe('none');
  });
});
