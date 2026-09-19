import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsProgressRingContract = defineComponentContract({
  name: 'Progress Ring',
  tagName: 'ads-progress-ring',
  description: 'Compact circular progress indicator with determinate and indeterminate accessibility semantics.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number', default: 'NaN' },
    { name: 'max', type: 'number', default: '100' },
    { name: 'label', type: 'string', default: '' },
  ],
  parts: [
    { name: 'ring', description: 'Accessible progressbar wrapper.' },
    { name: 'track', description: 'SVG track circle.' },
    { name: 'indicator', description: 'SVG progress circle.' },
  ],
  cssCustomProperties: [
    { name: '--ads-progress-ring-size', default: '2.5rem' },
    { name: '--ads-progress-ring-stroke', default: '0.25rem' },
    { name: '--ads-progress-ring-track', default: '#ececf0' },
    { name: '--ads-progress-ring-fill', default: 'var(--ads-color-action, #315efb)' },
  ],
});

export class AdsProgressRing extends LitElement {
  static override styles = css`
    :host { display: inline-grid; vertical-align: middle; }
    :host([hidden]) { display: none; }
    [part='ring'] {
      inline-size: var(--ads-progress-ring-size, 2.5rem);
      block-size: var(--ads-progress-ring-size, 2.5rem);
      display: inline-grid;
      place-items: center;
    }
    svg { inline-size: 100%; block-size: 100%; transform: rotate(-90deg); }
    circle {
      fill: none;
      stroke-width: var(--ads-progress-ring-stroke, 0.25rem);
      vector-effect: non-scaling-stroke;
    }
    [part='track'] { stroke: var(--ads-progress-ring-track, #ececf0); }
    [part='indicator'] {
      stroke: var(--ads-progress-ring-fill, var(--ads-color-action, #315efb));
      stroke-linecap: round;
      transition: stroke-dashoffset var(--ads-motion-duration-normal, 180ms) ease;
    }
    .indeterminate [part='indicator'] {
      stroke-dasharray: 22 78;
      animation: ads-progress-ring-spin 0.9s linear infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      [part='indicator'] { transition: none; }
      .indeterminate [part='indicator'] { animation: none; stroke-dasharray: 35 65; }
    }
    @keyframes ads-progress-ring-spin { to { stroke-dashoffset: -100; } }
  `;

  @property({ type: Number }) value = Number.NaN;
  @property({ type: Number }) max = 100;
  @property() label = '';

  override render() {
    const determinate = Number.isFinite(this.value);
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const clamped = determinate ? Math.min(Math.max(this.value, 0), max) : 0;
    const percent = determinate ? (clamped / max) * 100 : 0;
    return html`
      <span
        part="ring"
        class=${determinate ? '' : 'indeterminate'}
        role="progressbar"
        aria-label=${this.label || nothing}
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${determinate ? clamped : nothing}
      >
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle part="track" cx="18" cy="18" r="15.9155"></circle>
          <circle
            part="indicator"
            cx="18"
            cy="18"
            r="15.9155"
            pathLength="100"
            stroke-dasharray="100"
            stroke-dashoffset=${determinate ? 100 - percent : 0}
          ></circle>
        </svg>
      </span>
    `;
  }
}

registerAdsElement('progress-ring', AdsProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    'ads-progress-ring': AdsProgressRing;
  }
}
