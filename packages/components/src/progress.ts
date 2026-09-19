import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsProgressContract = defineComponentContract({
  name: 'Progress',
  tagName: 'ads-progress',
  description: 'Native progress indicator supporting determinate and indeterminate states.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number', default: 'NaN' },
    { name: 'max', type: 'number', default: '100' },
    { name: 'label', type: 'string', default: '' },
  ],
  parts: [{ name: 'progress', description: 'The native progress element.' }],
  cssCustomProperties: [
    { name: '--ads-progress-size', default: '0.5rem' },
    { name: '--ads-progress-track', default: '#ececf0' },
    { name: '--ads-progress-fill', default: 'var(--ads-color-action, #315efb)' },
    { name: '--ads-progress-radius', default: 'var(--ads-radius-pill, 999px)' },
  ],
});

export class AdsProgress extends LitElement {
  static override styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    progress {
      inline-size: 100%;
      block-size: var(--ads-progress-size, 0.5rem);
      overflow: hidden;
      display: block;
      border: 0;
      border-radius: var(--ads-progress-radius, var(--ads-radius-pill, 999px));
      background: var(--ads-progress-track, #ececf0);
      appearance: none;
    }
    progress::-webkit-progress-bar { background: var(--ads-progress-track, #ececf0); border-radius: inherit; }
    progress::-webkit-progress-value { background: var(--ads-progress-fill, var(--ads-color-action, #315efb)); border-radius: inherit; }
    progress::-moz-progress-bar { background: var(--ads-progress-fill, var(--ads-color-action, #315efb)); border-radius: inherit; }
  `;

  @property({ type: Number }) value = Number.NaN;
  @property({ type: Number }) max = 100;
  @property() label = '';

  override render() {
    const determinate = Number.isFinite(this.value);
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const value = determinate ? Math.min(Math.max(this.value, 0), max) : nothing;
    return html`<progress part="progress" value=${value} max=${max} aria-label=${this.label || nothing}></progress>`;
  }
}

registerAdsElement('progress', AdsProgress);

declare global {
  interface HTMLElementTagNameMap {
    'ads-progress': AdsProgress;
  }
}
