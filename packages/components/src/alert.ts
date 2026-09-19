import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsAlertVariant = 'info' | 'success' | 'warning' | 'danger';
export type AdsAlertLive = 'polite' | 'assertive' | 'off';

export const adsAlertContract = defineComponentContract({
  name: 'Alert',
  tagName: 'ads-alert',
  description: 'Accessible live or static feedback region with semantic status variants.',
  status: 'experimental',
  attributes: [
    { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: 'info' },
    { name: 'live', type: "'polite' | 'assertive' | 'off'", default: 'polite' },
  ],
  slots: [
    { name: 'icon', description: 'Optional leading icon.' },
    { name: 'title', description: 'Optional alert title.' },
    { name: '', description: 'Alert message.' },
    { name: 'actions', description: 'Optional alert actions.' },
  ],
  parts: [
    { name: 'alert', description: 'Alert container.' },
    { name: 'icon', description: 'Icon region.' },
    { name: 'content', description: 'Content region.' },
    { name: 'title', description: 'Title region.' },
    { name: 'message', description: 'Message region.' },
    { name: 'actions', description: 'Action region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-alert-radius', default: 'var(--ads-radius-panel, 0.375rem)' },
    { name: '--ads-alert-padding', default: '0.875rem' },
    { name: '--ads-alert-gap', default: '0.75rem' },
  ],
});

export class AdsAlert extends LitElement {
  static override styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    [part='alert'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--ads-alert-gap, 0.75rem);
      padding: var(--ads-alert-padding, 0.875rem);
      border: 1px solid var(--ads-alert-border, #bfd4ff);
      border-radius: var(--ads-alert-radius, var(--ads-radius-panel, 0.375rem));
      background: var(--ads-alert-background, #f1f6ff);
      color: var(--ads-alert-color, #173b7a);
    }
    :host([variant='success']) [part='alert'] {
      --ads-alert-border: var(--ads-color-success-border, #abefc6);
      --ads-alert-background: var(--ads-color-success-subtle, #ecfdf3);
      --ads-alert-color: var(--ads-color-success-strong, #067647);
    }
    :host([variant='warning']) [part='alert'] {
      --ads-alert-border: var(--ads-color-warning-border, #fedf89);
      --ads-alert-background: var(--ads-color-warning-subtle, #fffaeb);
      --ads-alert-color: var(--ads-color-warning-strong, #b54708);
    }
    :host([variant='danger']) [part='alert'] {
      --ads-alert-border: var(--ads-color-danger-border, #fecdca);
      --ads-alert-background: var(--ads-color-danger-subtle, #fef3f2);
      --ads-alert-color: var(--ads-color-danger-strong, #b42318);
    }
    [part='content'] { min-inline-size: 0; }
    [part='title'] { display: block; font-weight: 650; }
    [part='message'] { display: block; margin-block-start: 0.125rem; color: color-mix(in srgb, currentColor 86%, transparent); }
    [part='actions'] { justify-self: end; }
    ::slotted([slot='icon']) { inline-size: 1.25rem; block-size: 1.25rem; }
  `;

  @property({ reflect: true }) variant: AdsAlertVariant = 'info';
  @property({ reflect: true }) live: AdsAlertLive = 'polite';

  override render() {
    const role = this.live === 'assertive' ? 'alert' : this.live === 'polite' ? 'status' : nothing;
    return html`
      <div
        part="alert"
        role=${role}
        aria-live=${this.live === 'off' ? nothing : this.live}
        aria-atomic=${this.live === 'off' ? nothing : 'true'}
      >
        <slot part="icon" name="icon"></slot>
        <div part="content">
          <slot part="title" name="title"></slot>
          <slot part="message"></slot>
        </div>
        <slot part="actions" name="actions"></slot>
      </div>
    `;
  }
}

registerAdsElement('alert', AdsAlert);

declare global {
  interface HTMLElementTagNameMap {
    'ads-alert': AdsAlert;
  }
}
