import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsSpinnerContract = defineComponentContract({
  name: 'Spinner',
  tagName: 'ads-spinner',
  description: 'Indeterminate loading indicator with a screen-reader status label.',
  status: 'experimental',
  attributes: [{ name: 'label', type: 'string', default: 'Loading' }],
  parts: [
    { name: 'spinner', description: 'Animated spinner ring.' },
    { name: 'label', description: 'Visually hidden status label.' },
  ],
  cssCustomProperties: [
    { name: '--ads-spinner-size', default: '1.25rem' },
    { name: '--ads-spinner-width', default: '0.125rem' },
  ],
});

export class AdsSpinner extends LitElement {
  static override styles = css`
    :host { display: inline-flex; vertical-align: middle; }
    :host([hidden]) { display: none; }
    [part='spinner'] {
      inline-size: var(--ads-spinner-size, 1.25rem);
      block-size: var(--ads-spinner-size, 1.25rem);
      box-sizing: border-box;
      border: var(--ads-spinner-width, 0.125rem) solid color-mix(in srgb, currentColor 22%, transparent);
      border-inline-end-color: currentColor;
      border-radius: 50%;
      animation: ads-spinner-spin 0.7s linear infinite;
    }
    [part='label'] {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }
    @media (prefers-reduced-motion: reduce) {
      [part='spinner'] { animation: none; }
    }
    @keyframes ads-spinner-spin { to { transform: rotate(1turn); } }
  `;

  @property() label = 'Loading';

  override render() {
    return html`
      <span part="spinner" aria-hidden="true"></span>
      <span part="label" role="status" aria-live="polite">${this.label}</span>
    `;
  }
}

registerAdsElement('spinner', AdsSpinner);

declare global {
  interface HTMLElementTagNameMap {
    'ads-spinner': AdsSpinner;
  }
}
