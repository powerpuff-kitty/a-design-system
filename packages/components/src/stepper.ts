import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsStepperContract = defineComponentContract({
  name: 'AdsStepper',
  tagName: 'ads-stepper',
  description: 'Shows progress through an ordered workflow.',
  status: 'experimental',
  attributes: [{ name: 'current', type: 'number', default: '1' }],
  properties: [{ name: 'current', type: 'number' }],
  slots: [{ name: 'default', description: 'Step elements.' }],
});
export class AdsStepper extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    ol {
      display: flex;
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `;
  @property({ type: Number, reflect: true }) current = 1;
  override render() {
    return html`<nav aria-label="Progress">
      <ol>
        <slot></slot>
      </ol>
    </nav>`;
  }
}
registerAdsElement('stepper', AdsStepper);
