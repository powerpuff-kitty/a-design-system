import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export const adsBadgeContract = defineComponentContract({
  name: 'Badge',
  tagName: 'ads-badge',
  description: 'Compact status or metadata label.',
  status: 'experimental',
  attributes: [
    { name: 'variant', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'", default: 'neutral' },
    { name: 'dot', type: 'boolean', default: 'false' },
  ],
  slots: [{ name: '', description: 'Badge text.' }],
  parts: [
    { name: 'badge', description: 'Badge container.' },
    { name: 'dot', description: 'Optional status dot.' },
  ],
  cssCustomProperties: [
    { name: '--ads-badge-background', default: 'var(--ads-color-surface-subtle)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-badge-border', default: 'var(--ads-color-line-default)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-badge-color', default: 'var(--ads-color-text-default)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-badge-radius', default: 'var(--ads-radius-pill, 999px)' },
    { name: '--ads-badge-font-size', default: '0.75rem' },
  ],
});

export class AdsBadge extends LitElement {
  static override styles = css`
    :host { display: inline-flex; vertical-align: middle; }
    :host([hidden]) { display: none; }
    [part='badge'] {
      display: inline-flex;
      min-block-size: 1.5rem;
      align-items: center;
      gap: 0.375rem;
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--ads-badge-border, var(--ads-color-line-default, #d7d7dc));
      border-radius: var(--ads-badge-radius, var(--ads-radius-pill, 999px));
      background: var(--ads-badge-background, var(--ads-color-surface-subtle, #f5f5f7));
      color: var(--ads-badge-color, var(--ads-color-text-default, #39393f));
      font-size: var(--ads-badge-font-size, 0.75rem);
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
    }
    [part='dot'] {
      inline-size: 0.5em;
      block-size: 0.5em;
      border-radius: 50%;
      background: currentColor;
    }
    /* Variant defaults must not redeclare consumer variables on the shadow part. */
    :host([variant='accent']) [part='badge'] {
      background: var(--ads-badge-background, var(--ads-color-accent-subtle, var(--ads-color-surface-subtle, #eef2ff)));
      border-color: var(--ads-badge-border, var(--ads-color-accent-border, var(--ads-color-line-control, #c7d2fe)));
      color: var(--ads-badge-color, var(--ads-color-accent-strong, var(--ads-color-text-default, #3730a3)));
    }
    :host([variant='success']) [part='badge'] {
      background: var(--ads-badge-background, var(--ads-color-success-subtle, var(--ads-color-surface-subtle, #ecfdf3)));
      border-color: var(--ads-badge-border, var(--ads-color-success-border, var(--ads-color-line-control, #abefc6)));
      color: var(--ads-badge-color, var(--ads-color-success-strong, var(--ads-color-text-default, #067647)));
    }
    :host([variant='warning']) [part='badge'] {
      background: var(--ads-badge-background, var(--ads-color-warning-subtle, var(--ads-color-surface-subtle, #fffaeb)));
      border-color: var(--ads-badge-border, var(--ads-color-warning-border, var(--ads-color-line-control, #fedf89)));
      color: var(--ads-badge-color, var(--ads-color-warning-strong, var(--ads-color-text-default, #b54708)));
    }
    :host([variant='danger']) [part='badge'] {
      background: var(--ads-badge-background, var(--ads-color-danger-subtle, var(--ads-color-surface-subtle, #fef3f2)));
      border-color: var(--ads-badge-border, var(--ads-color-danger-border, var(--ads-color-line-control, #fecdca)));
      color: var(--ads-badge-color, var(--ads-color-danger-strong, var(--ads-color-text-default, #b42318)));
    }
  `;

  @property({ reflect: true }) variant: AdsBadgeVariant = 'neutral';
  @property({ type: Boolean, reflect: true }) dot = false;

  override render() {
    return html`
      <span part="badge">
        ${this.dot ? html`<span part="dot" aria-hidden="true"></span>` : null}
        <slot></slot>
      </span>
    `;
  }
}
registerAdsElement('badge', AdsBadge);
declare global {
  interface HTMLElementTagNameMap { 'ads-badge': AdsBadge; }
}
