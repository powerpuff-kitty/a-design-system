import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsTabPanelContract = defineComponentContract({
  name: 'AdsTabPanel',
  tagName: 'ads-tab-panel',
  description: 'Content associated with an ADS tab.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'string', required: true },
    { name: 'active', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'value', type: 'string' },
    { name: 'active', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Tab panel content.' }],
});
export class AdsTabPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 0;
    }
  `;
  @property() value = '';
  @property({ type: Boolean, reflect: true }) active = false;
  override render() {
    return html`<section
      role="tabpanel"
      aria-labelledby=${this.getAttribute('aria-labelledby') ?? ''}
      tabindex="0"
      ?hidden=${!this.active}
    >
      <slot></slot>
    </section>`;
  }
}
registerAdsElement('tab-panel', AdsTabPanel);
