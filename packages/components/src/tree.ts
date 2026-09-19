import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

const treeItemSelector = '[role="treeitem"], [data-treeitem], ads-tree-item';
const treeGroupSelector = '[role="group"], [data-tree-group]';

export const adsTreeContract = defineComponentContract({
  name: 'AdsTree',
  tagName: 'ads-tree',
  description: 'A keyboard-navigable hierarchy of selectable tree items.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string' },
    { name: 'multiselectable', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'label', type: 'string' },
    { name: 'multiselectable', type: 'boolean' },
  ],
  slots: [
    {
      name: 'default',
      description: 'Nested elements with role="treeitem" and role="group" markup.',
    },
  ],
  parts: [
    { name: 'tree', description: 'The tree container.' },
    { name: 'item', description: 'A slotted tree item.' },
    { name: 'group', description: 'A nested tree item group.' },
  ],
  events: [
    {
      name: 'ads-select',
      description: 'Fired when a tree item becomes selected.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'ads-toggle',
      description: 'Fired when a tree item expands or collapses.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsTree extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    [part='tree'] {
      display: block;
      min-width: 12rem;
      color: CanvasText;
    }

    ::slotted([role='treeitem']),
    ::slotted([data-treeitem]),
    ::slotted(ads-tree-item) {
      display: block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      outline: none;
    }

    ::slotted([role='treeitem']:focus-visible),
    ::slotted([data-treeitem]:focus-visible),
    ::slotted(ads-tree-item:focus-visible) {
      outline: 2px solid currentColor;
      outline-offset: 1px;
    }

    ::slotted([role='treeitem'][aria-selected='true']),
    ::slotted([data-treeitem][aria-selected='true']),
    ::slotted(ads-tree-item[aria-selected='true']) {
      background: color-mix(in srgb, Highlight 18%, transparent);
    }
  `;

  @property() label = '';
  @property({ type: Boolean, reflect: true }) multiselectable = false;

  @query('slot') private contentSlot?: HTMLSlotElement;

  private activeItem: HTMLElement | undefined;
  private mutationObserver: MutationObserver | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.syncItems());
      this.mutationObserver.observe(this, { childList: true, subtree: true });
    }
  }

  override disconnectedCallback(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.syncItems();
  }

  private isTreeItem(element: Element): element is HTMLElement {
    return element.matches(treeItemSelector);
  }

  private getItems(): HTMLElement[] {
    const items: HTMLElement[] = [];
    const visit = (element: Element): void => {
      if (this.isTreeItem(element)) items.push(element);
      for (const child of Array.from(element.children)) visit(child);
    };

    for (const element of this.contentSlot?.assignedElements({ flatten: true }) ?? []) {
      visit(element);
    }
    return items;
  }

  private getGroup(item: HTMLElement): HTMLElement | undefined {
    for (const child of Array.from(item.children)) {
      if (child.matches(treeGroupSelector)) return child as HTMLElement;
      if (this.isTreeItem(child)) break;
    }
    return undefined;
  }

  private getParent(item: HTMLElement): HTMLElement | undefined {
    let parent: Element | null = item.parentElement;
    while (parent && parent !== this) {
      if (this.isTreeItem(parent)) return parent;
      parent = parent.parentElement;
    }
    return undefined;
  }

  private getDepth(item: HTMLElement): number {
    let depth = 1;
    let parent = this.getParent(item);
    while (parent) {
      depth += 1;
      parent = this.getParent(parent);
    }
    return depth;
  }

  private isExpanded(item: HTMLElement): boolean {
    return item.getAttribute('aria-expanded') === 'true' || item.hasAttribute('expanded');
  }

  private hasChildren(item: HTMLElement): boolean {
    return Boolean(this.getGroup(item)?.querySelector(treeItemSelector));
  }

  private getVisibleItems(): HTMLElement[] {
    return this.getItems().filter((item) => {
      let parent = this.getParent(item);
      while (parent) {
        if (!this.isExpanded(parent)) return false;
        parent = this.getParent(parent);
      }
      return true;
    });
  }

  private syncItems(): void {
    const items = this.getItems();
    if (items.length === 0) return;

    const selectedItems = items.filter(
      (item) => item.hasAttribute('selected') || item.getAttribute('aria-selected') === 'true',
    );
    const selected = this.multiselectable ? selectedItems : selectedItems.slice(0, 1);
    const visibleItems = this.getVisibleItems();
    if (!this.activeItem || !visibleItems.includes(this.activeItem)) {
      this.activeItem = visibleItems[0] ?? items[0];
    }

    items.forEach((item) => {
      const group = this.getGroup(item);
      const hasChildren = Boolean(group?.querySelector(treeItemSelector));
      if (item.hasAttribute('data-treeitem') && !item.hasAttribute('role')) {
        item.setAttribute('role', 'treeitem');
      }
      item.setAttribute('part', `${item.getAttribute('part') ?? ''} item`.trim());
      item.tabIndex = item === this.activeItem && visibleItems.includes(item) ? 0 : -1;
      item.setAttribute('aria-level', String(this.getDepth(item)));

      const parent = this.getParent(item);
      const siblings = parent
        ? Array.from(this.getGroup(parent)?.children ?? []).filter((candidate) =>
            this.isTreeItem(candidate),
          )
        : items.filter((candidate) => !this.getParent(candidate));
      const siblingIndex = siblings.indexOf(item);
      if (siblingIndex >= 0) {
        item.setAttribute('aria-posinset', String(siblingIndex + 1));
        item.setAttribute('aria-setsize', String(siblings.length));
      }

      if (hasChildren && group) {
        if (!item.hasAttribute('aria-expanded')) {
          item.setAttribute('aria-expanded', String(item.hasAttribute('expanded')));
        }
        group.setAttribute('part', `${group.getAttribute('part') ?? ''} group`.trim());
        group.hidden = !this.isExpanded(item);
      } else {
        item.removeAttribute('aria-expanded');
      }

      const isSelected = selected.includes(item);
      item.setAttribute('aria-selected', String(isSelected));
      item.toggleAttribute('selected', isSelected);
    });
  }

  private focusItem(item: HTMLElement | undefined): void {
    if (!item) return;
    this.activeItem = item;
    this.syncItems();
    item.focus();
  }

  private move(delta: 1 | -1): void {
    const items = this.getVisibleItems();
    const current = this.activeItem && items.includes(this.activeItem) ? this.activeItem : items[0];
    if (!current) return;
    const index = Math.max(0, items.indexOf(current));
    this.focusItem(items[(index + delta + items.length) % items.length]);
  }

  private setExpanded(item: HTMLElement, expanded: boolean): void {
    if (!this.hasChildren(item)) return;
    item.setAttribute('aria-expanded', String(expanded));
    item.toggleAttribute('expanded', expanded);
    this.syncItems();
    this.dispatchEvent(
      new CustomEvent('ads-toggle', {
        bubbles: true,
        composed: true,
        detail: { item, expanded },
      }),
    );
  }

  private selectItem(item: HTMLElement): void {
    if (this.multiselectable) {
      const selected = item.getAttribute('aria-selected') === 'true';
      item.toggleAttribute('selected', !selected);
      item.setAttribute('aria-selected', String(!selected));
    } else {
      this.getItems().forEach((candidate) => {
        candidate.toggleAttribute('selected', candidate === item);
        candidate.setAttribute('aria-selected', String(candidate === item));
      });
    }
    this.activeItem = item;
    this.syncItems();
    this.dispatchEvent(
      new CustomEvent('ads-select', {
        bubbles: true,
        composed: true,
        detail: { item, selected: true },
      }),
    );
  }

  private itemFromEvent(event: Event): HTMLElement | undefined {
    return event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && this.isTreeItem(node));
  }

  private handleSlotChange = (): void => this.syncItems();

  private handleClick = (event: Event): void => {
    const item = this.itemFromEvent(event);
    if (!item || !this.getItems().includes(item)) return;
    this.activeItem = item;
    this.selectItem(item);
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const item = this.itemFromEvent(event);
    if (!item || !this.getItems().includes(item)) return;
    this.activeItem = item;
    this.syncItems();
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    const item = this.itemFromEvent(event) ?? this.activeItem;
    if (!item || !this.getItems().includes(item)) return;
    this.activeItem = item;
    const children = this.hasChildren(item);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusItem(this.getVisibleItems()[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusItem(this.getVisibleItems().at(-1));
    } else if (event.key === 'ArrowRight' && children) {
      event.preventDefault();
      if (!this.isExpanded(item)) this.setExpanded(item, true);
      else this.focusItem(this.getVisibleItems()[this.getVisibleItems().indexOf(item) + 1]);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (children && this.isExpanded(item)) this.setExpanded(item, false);
      else this.focusItem(this.getParent(item));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(item);
    }
  };

  override render() {
    return html`<div
      part="tree"
      role="tree"
      aria-label=${this.label || nothing}
      aria-multiselectable=${this.multiselectable ? 'true' : nothing}
      @click=${this.handleClick}
      @focusin=${this.handleFocusIn}
      @keydown=${this.handleKeydown}
    >
      <slot @slotchange=${this.handleSlotChange}></slot>
    </div>`;
  }
}

registerAdsElement('tree', AdsTree);
