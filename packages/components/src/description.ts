import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsDescriptionContract = defineComponentContract({
  name: 'AdsDescription',
  tagName: 'ads-description',
  description: 'Supporting help text for a form control.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Description content.' }],
});
export class AdsDescription extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: color-mix(in srgb, currentColor 70%, transparent);
      font-size: 0.875rem;
    }
  `;
  override render() {
    return html`<p><slot></slot></p>`;
  }
}
registerAdsElement('description', AdsDescription);
