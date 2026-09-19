import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSpinnerContract = defineComponentContract({
  name: 'AdsSpinner',
  tagName: 'ads-spinner',
  description: 'Indicates an ongoing operation.',
  status: 'experimental',
  attributes: [{ name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md' }],
  properties: [{ name: 'size', type: "'sm' | 'md' | 'lg'" }],
});
export class AdsSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    span {
      display: block;
      width: 1.25rem;
      height: 1.25rem;
      border: 0.15rem solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: ads-spin 0.8s linear infinite;
    }
    :host([size='sm']) span {
      width: 0.875rem;
      height: 0.875rem;
    }
    :host([size='lg']) span {
      width: 2rem;
      height: 2rem;
    }
    @keyframes ads-spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      span {
        animation: none;
      }
    }
  `;
  @property({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  override render() {
    return html`<span role="status" aria-busy="true" aria-label="Loading"></span>`;
  }
}
registerAdsElement('spinner', AdsSpinner);
