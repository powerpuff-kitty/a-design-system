export type WorkspacePanel = 'tools' | 'document';
export type WorkspaceMobilePanel = WorkspacePanel | 'none';

export interface WorkspaceLayoutSnapshot {
  toolsCollapsed: boolean;
  documentCollapsed: boolean;
  toolsPinned: boolean;
  documentPinned: boolean;
  mobilePanel: WorkspaceMobilePanel;
}

const DEFAULT_LAYOUT: WorkspaceLayoutSnapshot = Object.freeze({
  toolsCollapsed: false,
  documentCollapsed: false,
  toolsPinned: true,
  documentPinned: true,
  mobilePanel: 'none',
});

export class WorkspaceLayoutState extends EventTarget {
  #layout: WorkspaceLayoutSnapshot;

  constructor(initial: Partial<WorkspaceLayoutSnapshot> = {}) {
    super();
    this.#layout = Object.freeze({ ...DEFAULT_LAYOUT, ...initial });
  }

  get snapshot(): WorkspaceLayoutSnapshot {
    return this.#layout;
  }

  get toolsCollapsed(): boolean {
    return this.#layout.toolsCollapsed;
  }

  get documentCollapsed(): boolean {
    return this.#layout.documentCollapsed;
  }

  get toolsPinned(): boolean {
    return this.#layout.toolsPinned;
  }

  get documentPinned(): boolean {
    return this.#layout.documentPinned;
  }

  get mobilePanel(): WorkspaceMobilePanel {
    return this.#layout.mobilePanel;
  }

  setToolsCollapsed(value: boolean): void {
    this.#patch({ toolsCollapsed: Boolean(value) });
  }

  setDocumentCollapsed(value: boolean): void {
    this.#patch({ documentCollapsed: Boolean(value) });
  }

  setToolsPinned(value: boolean): void {
    this.#patch({ toolsPinned: Boolean(value) });
  }

  setDocumentPinned(value: boolean): void {
    this.#patch({ documentPinned: Boolean(value) });
  }

  toggleTools(): void {
    this.setToolsCollapsed(!this.toolsCollapsed);
  }

  toggleDocument(): void {
    this.setDocumentCollapsed(!this.documentCollapsed);
  }

  toggleToolsPinned(): void {
    this.setToolsPinned(!this.toolsPinned);
  }

  toggleDocumentPinned(): void {
    this.setDocumentPinned(!this.documentPinned);
  }

  openMobilePanel(panel: WorkspacePanel): void {
    this.#patch({ mobilePanel: panel });
  }

  closeMobilePanel(): void {
    this.#patch({ mobilePanel: 'none' });
  }

  restore(snapshot: Partial<WorkspaceLayoutSnapshot>): void {
    this.#patch(snapshot);
  }

  reset(): void {
    this.#replace(DEFAULT_LAYOUT);
  }

  #patch(patch: Partial<WorkspaceLayoutSnapshot>): void {
    this.#replace({ ...this.#layout, ...patch });
  }

  #replace(next: WorkspaceLayoutSnapshot): void {
    if (
      next.toolsCollapsed === this.#layout.toolsCollapsed &&
      next.documentCollapsed === this.#layout.documentCollapsed &&
      next.toolsPinned === this.#layout.toolsPinned &&
      next.documentPinned === this.#layout.documentPinned &&
      next.mobilePanel === this.#layout.mobilePanel
    ) return;

    this.#layout = Object.freeze({ ...next });
    this.dispatchEvent(new Event('change'));
  }
}
