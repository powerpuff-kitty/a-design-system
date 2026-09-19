import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsLabelContract = defineComponentContract({
  name: 'Label',
  tagName: 'ads-label',
  description:
    'Form label text primitive for ADS field compositions. Association is owned by the containing field/control.',
  status: 'experimental',
  attributes: [{ name: 'required', type: 'boolean', default: 'false' }],
  slots: [{ name: '', description: 'Label text.' }],
  parts: [
    { name: 'label', description: 'Label text container.' },
    { name: 'required', description: 'Visual required indicator.' },
  ],
  cssCustomProperties: [
    { name: '--ads-label-color', default: 'inherit' },
    { name: '--ads-label-font-size', default: '0.875rem' },
    { name: '--ads-label-font-weight', default: '600' },
    { name: '--ads-label-required-color', default: 'var(--ads-color-danger-strong, #b42318)' },
  ],
});

export class AdsLabel extends LitElement {
  static override styles = css`
    :host {
      display: inline;
      color: var(--ads-label-color, inherit);
      font-size: var(--ads-label-font-size, 0.875rem);
      font-weight: var(--ads-label-font-weight, 600);
      line-height: 1.3;
    }

    :host([hidden]) {
      display: none;
    }

    [part='required'] {
      margin-inline-start: 0.2em;
      color: var(--ads-label-required-color, var(--ads-color-danger-strong, #b42318));
    }
  `;

  @property({ type: Boolean, reflect: true }) required = false;

  override render() {
    return html`
      <span part="label">
        <slot></slot>
        ${this.required ? html`<span part="required" aria-hidden="true">*</span>` : null}
      </span>
    `;
  }
}

registerAdsElement('label', AdsLabel);

declare global {
  interface HTMLElementTagNameMap {
    'ads-label': AdsLabel;
  }
}
