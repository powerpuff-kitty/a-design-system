import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsBadgeContract = defineComponentContract({
  name: 'AdsBadge',
  tagName: 'ads-badge',
  description: 'A compact status indicator for labels and counts.',
  status: 'experimental',
  attributes: [
    {
      name: 'tone',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: 'neutral',
    },
  ],
  properties: [{ name: 'tone', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'" }],
  slots: [{ name: 'default', description: 'Badge content.' }],
  parts: [{ name: 'badge', description: 'The badge surface.' }],
});

export class AdsBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    [part='badge'] {
      display: inline-flex;
      align-items: center;
      min-height: 1.5rem;
      padding: 0 0.5rem;
      border: 1px solid var(--ads-badge-border, ButtonBorder);
      border-radius: 999px;
      background: var(--ads-badge-background, ButtonFace);
      color: var(--ads-badge-color, ButtonText);
      font: inherit;
      font-size: 0.875rem;
    }
    :host([tone='success']) [part='badge'] {
      background: var(--ads-color-success-subtle, color-mix(in srgb, currentColor 12%, Canvas));
    }
    :host([tone='info']) [part='badge'] {
      background: var(--ads-color-info-subtle, color-mix(in srgb, currentColor 12%, Canvas));
    }
    :host([tone='warning']) [part='badge'] {
      background: var(--ads-color-warning-subtle, color-mix(in srgb, currentColor 12%, Canvas));
    }
    :host([tone='danger']) [part='badge'] {
      background: var(--ads-color-danger-subtle, color-mix(in srgb, currentColor 12%, Canvas));
    }
  `;
  @property({ reflect: true }) tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' =
    'neutral';
  override render() {
    return html`<span part="badge" data-tone=${this.tone}><slot></slot></span>`;
  }
}
registerAdsElement('badge', AdsBadge);
