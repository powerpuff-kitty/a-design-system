import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsSkeletonShape = 'rect' | 'text' | 'circle';

export const adsSkeletonContract = defineComponentContract({
  name: 'Skeleton',
  tagName: 'ads-skeleton',
  description: 'Decorative loading placeholder that stays hidden from assistive technologies.',
  status: 'experimental',
  attributes: [
    { name: 'shape', type: "'rect' | 'text' | 'circle'", default: 'rect' },
    { name: 'animated', type: 'boolean', default: 'true' },
  ],
  parts: [{ name: 'skeleton', description: 'Skeleton placeholder surface.' }],
  cssCustomProperties: [
    { name: '--ads-skeleton-background', default: 'var(--ads-color-surface-subtle, #ececf0)' },
    { name: '--ads-skeleton-highlight', default: 'var(--ads-color-surface-default, #f6f6f8)' },
    { name: '--ads-skeleton-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-skeleton-height', default: '1rem', description: 'Placeholder height: 1rem for rect, 0.75em for text, and 2.5rem for circle by default.' },
    { name: '--ads-skeleton-width', default: '100%', description: 'Placeholder width: 100% for rect/text and 2.5rem for circle by default.' },
  ],
});

export class AdsSkeleton extends LitElement {
  static override styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    [part='skeleton'] {
      display: block;
      box-sizing: border-box;
      inline-size: var(--ads-skeleton-width, 100%);
      block-size: var(--ads-skeleton-height, 1rem);
      border-radius: var(--ads-skeleton-radius, var(--ads-radius-control, 0px));
      background: var(--ads-skeleton-background, var(--ads-color-surface-subtle, #ececf0));
    }
    :host([shape='text']) [part='skeleton'] {
      block-size: var(--ads-skeleton-height, 0.75em);
      border-radius: var(--ads-radius-pill, 999px);
    }
    :host([shape='circle']) [part='skeleton'] {
      inline-size: var(--ads-skeleton-width, 2.5rem);
      block-size: var(--ads-skeleton-height, 2.5rem);
      border-radius: 50%;
    }
    :host([animated]) [part='skeleton'] {
      background:
        linear-gradient(100deg, transparent 0 35%, var(--ads-skeleton-highlight, var(--ads-color-surface-default, #f6f6f8)) 50%, transparent 65% 100%),
        var(--ads-skeleton-background, var(--ads-color-surface-subtle, #ececf0));
      background-size: 200% 100%;
      animation: ads-skeleton-shimmer 1.5s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      :host([animated]) [part='skeleton'] {
        animation: none;
        background: var(--ads-skeleton-background, var(--ads-color-surface-subtle, #ececf0));
      }
    }
    @keyframes ads-skeleton-shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }
  `;

  @property({ reflect: true }) shape: AdsSkeletonShape = 'rect';
  @property({ type: Boolean, reflect: true }) animated = true;

  override render() {
    return html`<span part="skeleton" aria-hidden="true"></span>`;
  }
}

registerAdsElement('skeleton', AdsSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    'ads-skeleton': AdsSkeleton;
  }
}
