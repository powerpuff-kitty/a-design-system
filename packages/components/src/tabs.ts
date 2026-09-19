import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
let tabsInstanceId = 0;
export const adsTabsContract = defineComponentContract({
  name: 'AdsTabs',
  tagName: 'ads-tabs',
  description: 'Organizes related content into selectable tab panels.',
  status: 'experimental',
  attributes: [{ name: 'value', type: 'string' }],
  properties: [{ name: 'value', type: 'string' }],
  slots: [{ name: 'default', description: 'Tab and tab-panel elements.' }],
  parts: [{ name: 'list', description: 'The tablist container.' }],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when the active tab changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsTabs extends LitElement {
  private readonly instanceId = ++tabsInstanceId;
  static styles = css`
    :host {
      display: block;
    }
    [part='list'] {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid ButtonBorder;
    }
  `;
  @property({ reflect: true }) value = '';

  @query('slot') private contentSlot?: HTMLSlotElement;

  private getTabs(): HTMLElement[] {
    return (this.contentSlot?.assignedElements({ flatten: true }) ?? []).filter((element) =>
      element.matches('ads-tab'),
    ) as HTMLElement[];
  }

  private getPanels(): HTMLElement[] {
    return (this.contentSlot?.assignedElements({ flatten: true }) ?? []).filter((element) =>
      element.matches('ads-tab-panel'),
    ) as HTMLElement[];
  }

  private syncSelection(emit = false): void {
    const tabs = this.getTabs();
    const panels = this.getPanels();
    if (tabs.length === 0) return;

    const selectedTab = tabs.find((tab) => tab.getAttribute('value') === this.value) ?? tabs[0];
    const nextValue = selectedTab?.getAttribute('value') ?? '';
    const changed = this.value !== nextValue;
    this.value = nextValue;

    tabs.forEach((tab, index) => {
      const value = tab.getAttribute('value') ?? '';
      const selected = value === nextValue;
      tab.toggleAttribute('selected', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');

      const panel = panels.find((candidate) => candidate.getAttribute('value') === value);
      if (!panel) return;
      if (!panel.id) panel.id = `ads-tab-panel-${this.id || this.instanceId}-${index + 1}`;
      const tabId = `ads-tab-${this.id || this.instanceId}-${index + 1}`;
      tab.setAttribute('aria-controls', panel.id);
      tab.setAttribute('data-tab-id', tabId);
      panel.setAttribute('aria-labelledby', tabId);
      panel.toggleAttribute('active', selected);
    });

    if (emit && (changed || tabs.length > 0)) {
      this.dispatchEvent(
        new CustomEvent('ads-change', {
          bubbles: true,
          composed: true,
          detail: { value: nextValue },
        }),
      );
    }
  }

  private activateTab(tab: HTMLElement): void {
    const nextValue = tab.getAttribute('value') ?? '';
    if (!nextValue || nextValue === this.value) return;
    this.value = nextValue;
    this.syncSelection(true);
  }

  private handleClick = (event: Event): void => {
    const tab = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.matches('ads-tab'));
    if (tab) this.activateTab(tab);
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    const tabs = this.getTabs();
    const current = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.matches('ads-tab'));
    if (!current || tabs.length === 0) return;

    const index = tabs.indexOf(current);
    let nextIndex: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const next = tabs[nextIndex];
    if (!next) return;
    this.activateTab(next);
    (next as HTMLElement & { focus?: () => void }).focus?.();
  };

  protected override firstUpdated(): void {
    this.syncSelection();
  }

  override render() {
    return html`<div
      part="list"
      role="tablist"
      aria-orientation="horizontal"
      @click=${this.handleClick}
      @keydown=${this.handleKeydown}
    >
      <slot @slotchange=${() => this.syncSelection()}></slot>
    </div>`;
  }
}
registerAdsElement('tabs', AdsTabs);
