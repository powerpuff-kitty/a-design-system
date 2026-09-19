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
    { name: '--ads-badge-radius', default: 'var(--ads-radius-pill, 999px)' },
    { name: '--ads-badge-font-size', default: '0.75rem' },
  ],
});

export class AdsBadge extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    [part='badge'] {
      display: inline-flex;
      min-block-size: 1.5rem;
      align-items: center;
      gap: 0.375rem;
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--ads-badge-border, #d7d7dc);
      border-radius: var(--ads-badge-radius, var(--ads-radius-pill, 999px));
      background: var(--ads-badge-background, #f5f5f7);
      color: var(--ads-badge-color, #39393f);
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

    :host([variant='accent']) [part='badge'] {
      --ads-badge-background: var(--ads-color-accent-subtle, #eef2ff);
      --ads-badge-border: var(--ads-color-accent-border, #c7d2fe);
      --ads-badge-color: var(--ads-color-accent-strong, #3730a3);
    }

    :host([variant='success']) [part='badge'] {
      --ads-badge-background: var(--ads-color-success-subtle, #ecfdf3);
      --ads-badge-border: var(--ads-color-success-border, #abefc6);
      --ads-badge-color: var(--ads-color-success-strong, #067647);
    }

    :host([variant='warning']) [part='badge'] {
      --ads-badge-background: var(--ads-color-warning-subtle, #fffaeb);
      --ads-badge-border: var(--ads-color-warning-border, #fedf89);
      --ads-badge-color: var(--ads-color-warning-strong, #b54708);
    }

    :host([variant='danger']) [part='badge'] {
      --ads-badge-background: var(--ads-color-danger-subtle, #fef3f2);
      --ads-badge-border: var(--ads-color-danger-border, #fecdca);
      --ads-badge-color: var(--ads-color-danger-strong, #b42318);
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
  interface HTMLElementTagNameMap {
    'ads-badge': AdsBadge;
  }
}
