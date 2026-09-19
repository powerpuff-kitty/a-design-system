import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsProgressRingContract = defineComponentContract({
  name: 'AdsProgressRing',
  tagName: 'ads-progress-ring',
  description: 'Shows progress in a circular indicator.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number' },
    { name: 'max', type: 'number', default: '100' },
  ],
  properties: [
    { name: 'value', type: 'number' },
    { name: 'max', type: 'number' },
  ],
});
export class AdsProgressRing extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      width: 2.5rem;
      height: 2.5rem;
    }
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    circle {
      fill: none;
      stroke-width: 3;
    }
    .track {
      stroke: color-mix(in srgb, CanvasText 15%, transparent);
    }
    .value {
      stroke: currentColor;
      stroke-linecap: round;
      transition: stroke-dashoffset 160ms ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .value {
        transition: none;
      }
    }
  `;
  @property({ type: Number }) value?: number;
  @property({ type: Number }) max = 100;
  override render() {
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const determinate = typeof this.value === 'number' && Number.isFinite(this.value);
    const value = determinate ? Math.min(max, Math.max(0, this.value!)) : undefined;
    const percent = determinate ? value! / max : 0.25;
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    return html`<div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax=${max}
      aria-valuenow=${determinate ? value : nothing}
      aria-label=${determinate ? `${Math.round(percent * 100)}%` : 'Loading'}
    >
      <svg viewBox="0 0 44 44">
        <circle class="track" cx="22" cy="22" r=${radius}></circle>
        <circle
          class="value"
          cx="22"
          cy="22"
          r=${radius}
          stroke-dasharray=${circumference}
          stroke-dashoffset=${circumference * (1 - percent)}
        ></circle>
      </svg>
    </div>`;
  }
}
registerAdsElement('progress-ring', AdsProgressRing);
