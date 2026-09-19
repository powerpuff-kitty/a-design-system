import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { registerAdsElement } from './runtime/registration.js';

export const adsVisuallyHiddenContract = defineComponentContract({
  name: 'Visually Hidden',
  tagName: 'ads-visually-hidden',
  description: 'Keeps content available to assistive technologies while removing it from visual layout.',
  status: 'experimental',
  slots: [{ name: '', description: 'Content that should remain available to assistive technologies.' }],
  parts: [{ name: 'content', description: 'Visually hidden wrapper.' }],
});

export class AdsVisuallyHidden extends LitElement {
  static override styles = css`
    :host { display: contents; }
    [part='content'] {
      position: absolute !important;
      inline-size: 1px !important;
      block-size: 1px !important;
      overflow: hidden !important;
      margin: -1px !important;
      padding: 0 !important;
      border: 0 !important;
      clip: rect(0 0 0 0) !important;
      clip-path: inset(50%) !important;
      white-space: nowrap !important;
    }
  `;

  override render() {
    return html`<span part="content"><slot></slot></span>`;
  }
}

registerAdsElement('visually-hidden', AdsVisuallyHidden);

declare global {
  interface HTMLElementTagNameMap {
    'ads-visually-hidden': AdsVisuallyHidden;
  }
}
