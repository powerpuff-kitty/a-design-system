import { getTypeaheadMatch, defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsMenuOrientation = 'vertical' | 'horizontal';

export const adsMenuContract = defineComponentContract({
  name: 'AdsMenu',
  tagName: 'ads-menu',
  description: 'A keyboard-navigable list of actions or options.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: 'vertical' },
  ],
  properties: [
    { name: 'label', type: 'string' },
    { name: 'orientation', type: "'vertical' | 'horizontal'" },
  ],
  slots: [{ name: 'default', description: 'Menu items and menu item groups.' }],
  parts: [{ name: 'menu', description: 'The menu container.' }],
  events: [
    {
      name: 'ads-select',
      description: 'Fired when a menu item is activated.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'ads-dismiss',
      description: 'Fired when Escape is pressed while the menu is active.',
      bubbles: true,
      composed: true,
    },
  ],
});

const menuItemSelector =
  '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [data-menu-item], ads-menu-item, button, a';

export class AdsMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    [part='menu'] {
      display: flex;
      flex-direction: column;
      min-width: 12rem;
      gap: 0.125rem;
      padding: 0.375rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.5rem;
      background: Canvas;
      color: CanvasText;
    }
    :host([orientation='horizontal']) [part='menu'] {
      flex-direction: row;
      align-items: center;
    }
    [part='menu']:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `;

  @property() label = '';
  @property({ reflect: true }) orientation: AdsMenuOrientation = 'vertical';

  @query('slot') private menuSlot?: HTMLSlotElement;

  private activeIndex = 0;
  private typeaheadBuffer = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  protected override firstUpdated(): void {
    this.syncItems();
  }

  private getItems(): HTMLElement[] {
    return (this.menuSlot?.assignedElements({ flatten: true }) ?? []).filter((item) =>
      item.matches(menuItemSelector),
    ) as HTMLElement[];
  }

  private isDisabled(item: HTMLElement): boolean {
    return item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true';
  }

  private syncItems(): void {
    const items = this.getItems();
    if (items.length === 0) return;

    if (this.isDisabled(items[this.activeIndex] as HTMLElement)) {
      this.activeIndex = items.findIndex((item) => !this.isDisabled(item));
    }
    if (this.activeIndex < 0) this.activeIndex = 0;

    items.forEach((item, index) => {
      item.tabIndex = index === this.activeIndex && !this.isDisabled(item) ? 0 : -1;
    });
  }

  private focusItem(index: number): void {
    const items = this.getItems();
    const available = items
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => !this.isDisabled(item));
    if (available.length === 0) return;

    const next = available.find(({ itemIndex }) => itemIndex === index) ?? available[0];
    if (!next) return;
    this.activeIndex = next.itemIndex;
    this.syncItems();
    next.item.focus();
  }

  private move(delta: 1 | -1): void {
    const items = this.getItems();
    const enabled = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !this.isDisabled(item));
    if (enabled.length === 0) return;

    const current = Math.max(
      0,
      enabled.findIndex(({ index }) => index === this.activeIndex),
    );
    const next = enabled[(current + delta + enabled.length) % enabled.length];
    if (next) this.focusItem(next.index);
  }

  private selectItem(item: HTMLElement): void {
    if (this.isDisabled(item)) return;
    this.dispatchEvent(
      new CustomEvent('ads-select', {
        bubbles: true,
        composed: true,
        detail: { item },
      }),
    );
  }

  private handleClick = (event: Event): void => {
    const item = (event.target as HTMLElement).closest?.(menuItemSelector);
    if (!item || !this.getItems().includes(item as HTMLElement)) return;
    this.activeIndex = this.getItems().indexOf(item as HTMLElement);
    this.syncItems();
    this.selectItem(item as HTMLElement);
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const item = (event.target as HTMLElement).closest?.(menuItemSelector);
    if (!item || !this.getItems().includes(item as HTMLElement)) return;
    this.activeIndex = this.getItems().indexOf(item as HTMLElement);
    this.syncItems();
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    const horizontal = this.orientation === 'horizontal';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === nextKey) {
      event.preventDefault();
      this.move(1);
    } else if (event.key === previousKey) {
      event.preventDefault();
      this.move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusItem(this.getItems().length - 1);
    } else if (event.key === 'Escape') {
      this.dispatchEvent(new Event('ads-dismiss', { bubbles: true, composed: true }));
    } else if (event.key === 'Enter' || event.key === ' ') {
      const item = (event.target as HTMLElement).closest?.(menuItemSelector);
      if (item && this.getItems().includes(item as HTMLElement)) {
        event.preventDefault();
        this.selectItem(item as HTMLElement);
      }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.typeaheadBuffer += event.key;
      const items = this.getItems();
      const enabled = items.filter((item) => !this.isDisabled(item));
      const labels = enabled.map((item) => item.textContent?.trim() ?? '');
      const match = getTypeaheadMatch(labels, this.typeaheadBuffer, -1);
      if (match >= 0) this.focusItem(items.indexOf(enabled[match] as HTMLElement));
      clearTimeout(this.typeaheadTimer);
      this.typeaheadTimer = setTimeout(() => {
        this.typeaheadBuffer = '';
      }, 500);
    }
  };

  override render() {
    return html`<div
      part="menu"
      role="menu"
      aria-label=${this.label || nothing}
      aria-orientation=${this.orientation}
      @click=${this.handleClick}
      @focusin=${this.handleFocusIn}
      @keydown=${this.handleKeydown}
    >
      <slot @slotchange=${this.syncItems}></slot>
    </div>`;
  }
}

registerAdsElement('menu', AdsMenu);
