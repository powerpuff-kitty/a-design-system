import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsLabelContract = defineComponentContract({
  name: 'AdsLabel',
  tagName: 'ads-label',
  description: 'A styled label for a form control.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Label content.' }],
});
export class AdsLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-weight: 600;
    }
  `;
  override render() {
    return html`<label><slot></slot></label>`;
  }
}
registerAdsElement('label', AdsLabel);
