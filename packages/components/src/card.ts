import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsCardContract = defineComponentContract({
  name: 'AdsCard',
  tagName: 'ads-card',
  description: 'A surface for grouping related content and actions.',
  status: 'experimental',
  slots: [
    { name: 'header', description: 'Card heading or introductory content.' },
    { name: 'default', description: 'Card body content.' },
    { name: 'footer', description: 'Card actions or supporting content.' },
  ],
  parts: [
    { name: 'card', description: 'The card surface.' },
    { name: 'header', description: 'The card header.' },
    { name: 'body', description: 'The card body.' },
    { name: 'footer', description: 'The card footer.' },
  ],
});
export class AdsCard extends LitElement {
  @state() private hasHeader = false;
  @state() private hasFooter = false;

  static styles = css`
    :host {
      display: block;
    }
    [part='card'] {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ads-card-border, ButtonBorder);
      border-radius: var(--ads-card-radius, 0.5rem);
      background: var(--ads-card-background, Canvas);
      color: var(--ads-card-color, CanvasText);
    }
    [part='header'],
    [part='footer'] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    [part='body'] {
      min-width: 0;
    }
    [hidden] {
      display: none;
    }
  `;

  protected firstUpdated() {
    this.updateSlotState();
  }

  private updateSlotState = () => {
    this.hasHeader = this.slotHasContent(
      this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="header"]'),
    );
    this.hasFooter = this.slotHasContent(
      this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="footer"]'),
    );
  };

  private slotHasContent(slot?: HTMLSlotElement | null) {
    return Boolean(
      slot
        ?.assignedNodes({ flatten: true })
        .some((node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())),
    );
  }

  override render() {
    return html`<article part="card">
      <header part="header" ?hidden=${!this.hasHeader}>
        <slot name="header" @slotchange=${this.updateSlotState}></slot>
      </header>
      <div part="body"><slot></slot></div>
      <footer part="footer" ?hidden=${!this.hasFooter}>
        <slot name="footer" @slotchange=${this.updateSlotState}></slot>
      </footer>
    </article>`;
  }
}
registerAdsElement('card', AdsCard);
