import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsTabContract = defineComponentContract({
  name: 'AdsTab',
  tagName: 'ads-tab',
  description: 'A selectable tab in an ADS tablist.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'string', required: true },
    { name: 'selected', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'value', type: 'string' },
    { name: 'selected', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Tab label.' }],
});
export class AdsTab extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  static styles = css`
    :host {
      display: inline-flex;
    }
    button {
      padding: 0.625rem 0.8rem;
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    :host([selected]) button {
      border-bottom-color: currentColor;
      font-weight: 650;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -2px;
    }
  `;
  @property() value = '';
  @property({ type: Boolean, reflect: true }) selected = false;
  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector('button')?.focus(options);
  }
  override render() {
    return html`<button
      id=${this.getAttribute('data-tab-id') ?? ''}
      type="button"
      role="tab"
      aria-selected=${this.selected}
      aria-controls=${this.getAttribute('aria-controls') ?? ''}
      tabindex=${this.selected ? '0' : '-1'}
      @click=${() => this.dispatchEvent(new Event('ads-tab-activate', { bubbles: true, composed: true }))}
    >
      <slot></slot>
    </button>`;
  }
}
registerAdsElement('tab', AdsTab);
