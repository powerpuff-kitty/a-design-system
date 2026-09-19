import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsVisuallyHiddenContract = defineComponentContract({
  name: 'AdsVisuallyHidden',
  tagName: 'ads-visually-hidden',
  description: 'Visually hides content while keeping it available to assistive technology.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Content for assistive technology.' }],
});
export class AdsVisuallyHidden extends LitElement {
  static styles = css`
    :host {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0 0 0 0) !important;
      clip-path: inset(50%) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
  `;
  override render() {
    return html`<slot></slot>`;
  }
}
registerAdsElement('visually-hidden', AdsVisuallyHidden);
