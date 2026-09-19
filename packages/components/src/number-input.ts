import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsNumberInputContract = defineComponentContract({
  name: 'AdsNumberInput',
  tagName: 'ads-number-input',
  description: 'A native-compatible numeric input.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number' },
    { name: 'min', type: 'number' },
    { name: 'max', type: 'number' },
    { name: 'step', type: 'number', default: '1' },
  ],
  properties: [
    { name: 'value', type: 'number' },
    { name: 'min', type: 'number' },
    { name: 'max', type: 'number' },
    { name: 'step', type: 'number' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
});
export class AdsNumberInput extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    input {
      min-height: 2.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      font: inherit;
    }
  `;
  @property({ type: Number }) value: number | undefined = undefined;
  @property({ type: Number }) min: number | undefined = undefined;
  @property({ type: Number }) max: number | undefined = undefined;
  @property({ type: Number }) step = 1;
  private change = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value === '' ? undefined : Number(input.value);
  };
  override render() {
    return html`<label
      ><slot name="label"></slot
      ><input
        type="number"
        .value=${this.value == null ? '' : String(this.value)}
        .min=${this.min == null ? '' : String(this.min)}
        .max=${this.max == null ? '' : String(this.max)}
        .step=${this.step}
        @input=${this.change}
    /></label>`;
  }
}
registerAdsElement('number-input', AdsNumberInput);
