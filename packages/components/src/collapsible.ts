import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsCollapsibleContract = defineComponentContract({
  name: 'AdsCollapsible',
  tagName: 'ads-collapsible',
  description: 'A disclosure control that shows or hides associated content.',
  status: 'experimental',
  attributes: [{ name: 'open', type: 'boolean', default: 'false' }],
  properties: [{ name: 'open', type: 'boolean' }],
  slots: [
    { name: 'trigger', description: 'Disclosure button content.' },
    { name: 'default', description: 'Content shown while open.' },
  ],
  parts: [
    { name: 'trigger', description: 'The disclosure button.' },
    { name: 'content', description: 'The collapsible content.' },
  ],
  events: [
    {
      name: 'ads-toggle',
      description: 'Fired when open state changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsCollapsible extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    button {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 650;
      text-align: left;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    [part='content'] {
      padding: 0 0 0.75rem;
    }
  `;
  @property({ type: Boolean, reflect: true }) open = false;
  private toggle = () => {
    this.open = !this.open;
    this.dispatchEvent(new Event('ads-toggle', { bubbles: true, composed: true }));
  };
  override render() {
    return html`<button
        part="trigger"
        type="button"
        aria-expanded=${this.open}
        @click=${this.toggle}
      >
        <slot name="trigger">Toggle</slot><span aria-hidden="true">${this.open ? '−' : '+'}</span>
      </button>
      <div part="content" ?hidden=${!this.open}><slot></slot></div>`;
  }
}
registerAdsElement('collapsible', AdsCollapsible);
