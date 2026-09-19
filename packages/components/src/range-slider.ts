import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsRangeSliderContract = defineComponentContract({
  name: 'AdsRangeSlider',
  tagName: 'ads-range-slider',
  description: 'Selects a numeric range with two native sliders.',
  status: 'experimental',
  attributes: [
    { name: 'low', type: 'number', default: '0' },
    { name: 'high', type: 'number', default: '100' },
    { name: 'min', type: 'number', default: '0' },
    { name: 'max', type: 'number', default: '100' },
    { name: 'step', type: 'number', default: '1' },
  ],
  properties: [
    { name: 'low', type: 'number' },
    { name: 'high', type: 'number' },
    { name: 'min', type: 'number' },
    { name: 'max', type: 'number' },
    { name: 'step', type: 'number' },
  ],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when either value changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsRangeSlider extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    input {
      width: 100%;
      accent-color: currentColor;
    }
  `;
  @property({ type: Number }) low = 0;
  @property({ type: Number }) high = 100;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  private updateRange = (which: 'low' | 'high', event: Event) => {
    const value = Number((event.target as HTMLInputElement).value);
    if (which === 'low') this.low = Math.min(value, this.high);
    else this.high = Math.max(value, this.low);
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };
  override render() {
    return html`<div>
      <input
        type="range"
        aria-label="Minimum"
        .value=${String(this.low)}
        .min=${String(this.min)}
        .max=${String(this.max)}
        .step=${String(this.step)}
        @input=${(e: Event) => this.updateRange('low', e)}
      /><input
        type="range"
        aria-label="Maximum"
        .value=${String(this.high)}
        .min=${String(this.min)}
        .max=${String(this.max)}
        .step=${String(this.step)}
        @input=${(e: Event) => this.updateRange('high', e)}
      />
    </div>`;
  }
}
registerAdsElement('range-slider', AdsRangeSlider);
