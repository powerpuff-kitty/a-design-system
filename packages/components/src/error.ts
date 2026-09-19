import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsErrorContract = defineComponentContract({
  name: 'AdsError',
  tagName: 'ads-error',
  description: 'Validation feedback for a form control.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Error content.' }],
});
export class AdsError extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--ads-error-color, #b42318);
      font-size: 0.875rem;
    }
  `;
  override render() {
    return html`<p role="alert"><slot></slot></p>`;
  }
}
registerAdsElement('error', AdsError);
