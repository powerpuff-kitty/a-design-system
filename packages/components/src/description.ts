import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { registerAdsElement } from './runtime/registration.js';

export const adsDescriptionContract = defineComponentContract({
  name: 'Description',
  tagName: 'ads-description',
  description: 'Supporting form-field description text.',
  status: 'experimental',
  slots: [{ name: '', description: 'Description content.' }],
  parts: [{ name: 'description', description: 'Description text container.' }],
  cssCustomProperties: [
    { name: '--ads-description-color', default: '#606068' },
    { name: '--ads-description-font-size', default: '0.8125rem' },
  ],
});

export class AdsDescription extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-description-color, #606068);
      font-size: var(--ads-description-font-size, 0.8125rem);
      line-height: 1.4;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  override render() {
    return html`<span part="description" dir="auto"><slot></slot></span>`;
  }
}

registerAdsElement('description', AdsDescription);

declare global {
  interface HTMLElementTagNameMap {
    'ads-description': AdsDescription;
  }
}
