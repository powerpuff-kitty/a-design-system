import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { registerAdsElement } from './runtime/registration.js';

export const adsErrorContract = defineComponentContract({
  name: 'Error',
  tagName: 'ads-error',
  description: 'Validation error text announced as an alert when inserted or changed.',
  status: 'experimental',
  slots: [{ name: '', description: 'Validation error content.' }],
  parts: [{ name: 'error', description: 'Error text container.' }],
  cssCustomProperties: [
    { name: '--ads-error-color', default: 'var(--ads-color-danger-strong, #b42318)' },
    { name: '--ads-error-font-size', default: '0.8125rem' },
  ],
});

export class AdsError extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-error-color, var(--ads-color-danger-strong, #b42318));
      font-size: var(--ads-error-font-size, 0.8125rem);
      line-height: 1.4;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  override render() {
    return html`<span part="error" role="alert" dir="auto"><slot></slot></span>`;
  }
}

registerAdsElement('error', AdsError);

declare global {
  interface HTMLElementTagNameMap {
    'ads-error': AdsError;
  }
}
