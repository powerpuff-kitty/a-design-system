import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsToastItemContract = defineComponentContract({
  name: 'AdsToastItem',
  tagName: 'ads-toast-item',
  description: 'A structured item for a toast notification.',
  status: 'experimental',
  attributes: [
    { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'", default: 'neutral' },
  ],
  properties: [{ name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'" }],
  slots: [
    { name: 'title', description: 'Toast title.' },
    { name: 'default', description: 'Toast message.' },
    { name: 'actions', description: 'Toast actions.' },
  ],
  parts: [
    { name: 'item', description: 'The toast item.' },
    { name: 'title', description: 'The toast title.' },
    { name: 'actions', description: 'The toast actions.' },
  ],
});
export class AdsToastItem extends LitElement {
  @state() private hasTitle = false;
  @state() private hasActions = false;

  static styles = css`
    :host {
      display: block;
    }
    [part='item'] {
      display: grid;
      gap: 0.375rem;
    }
    [part='title'] {
      font-weight: 650;
    }
    [part='actions'] {
      display: flex;
      gap: 0.5rem;
    }
    [hidden] {
      display: none;
    }
  `;
  @property({ reflect: true }) tone: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';
  protected firstUpdated() {
    this.updateSlotState();
  }

  private updateSlotState = () => {
    this.hasTitle = this.slotHasContent('title');
    this.hasActions = this.slotHasContent('actions');
  };

  private slotHasContent(name: string) {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
    return Boolean(
      slot
        ?.assignedNodes({ flatten: true })
        .some((node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())),
    );
  }

  override render() {
    return html`<article part="item" data-tone=${this.tone}>
      <strong part="title" ?hidden=${!this.hasTitle}
        ><slot name="title" @slotchange=${this.updateSlotState}></slot
      ></strong>
      <div><slot></slot></div>
      <div part="actions" ?hidden=${!this.hasActions}>
        <slot name="actions" @slotchange=${this.updateSlotState}></slot>
      </div>
    </article>`;
  }
}
registerAdsElement('toast-item', AdsToastItem);
