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
    { name: '--ads-alert-background', default: 'var(--ads-color-surface-subtle)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-alert-border', default: 'var(--ads-color-line-control)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-alert-color', default: 'var(--ads-color-text-default)', description: 'Consumer override; honored across variants.' },
    { name: '--ads-alert-radius', default: 'var(--ads-radius-panel, 0px)' },
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
      border: 1px solid var(--ads-alert-border, var(--ads-color-line-control, #bfd4ff));
      border-radius: var(--ads-alert-radius, var(--ads-radius-panel, 0px));
      background: var(--ads-alert-background, var(--ads-color-surface-subtle, #f1f6ff));
      color: var(--ads-alert-color, var(--ads-color-text-default, #173b7a));
    }
    :host([variant='success']) [part='alert'] {
      border-color: var(--ads-alert-border, var(--ads-color-success-border, var(--ads-color-line-control, #abefc6)));
      background: var(--ads-alert-background, var(--ads-color-success-subtle, var(--ads-color-surface-subtle, #ecfdf3)));
      color: var(--ads-alert-color, var(--ads-color-success-strong, var(--ads-color-text-default, #067647)));
    }
    :host([variant='warning']) [part='alert'] {
      border-color: var(--ads-alert-border, var(--ads-color-warning-border, var(--ads-color-line-control, #fedf89)));
      background: var(--ads-alert-background, var(--ads-color-warning-subtle, var(--ads-color-surface-subtle, #fffaeb)));
      color: var(--ads-alert-color, var(--ads-color-warning-strong, var(--ads-color-text-default, #b54708)));
    }
    :host([variant='danger']) [part='alert'] {
      border-color: var(--ads-alert-border, var(--ads-color-danger-border, var(--ads-color-line-control, #fecdca)));
      background: var(--ads-alert-background, var(--ads-color-danger-subtle, var(--ads-color-surface-subtle, #fef3f2)));
      color: var(--ads-alert-color, var(--ads-color-danger-strong, var(--ads-color-text-default, #b42318)));
    }
    [part='content'] { min-inline-size: 0; }
    [part='title'] { display: block; font-weight: 650; }
    [part='message'] { display: block; margin-block-start: 0.125rem; color: inherit; }
    [part='actions'] { justify-self: end; }
    ::slotted([slot='icon']) { inline-size: 1.25rem; block-size: 1.25rem; }
  `;

  @property({ reflect: true }) variant: AdsAlertVariant = 'info';
  @property({ reflect: true }) live: AdsAlertLive = 'polite';

  override render() {
    const role = this.live === 'assertive' ? 'alert' : this.live === 'polite' ? 'status' : nothing;
    return html`
      <div part="alert" role=${role}
        aria-live=${this.live === 'off' ? nothing : this.live}
        aria-atomic=${this.live === 'off' ? nothing : 'true'}>
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
  interface HTMLElementTagNameMap { 'ads-alert': AdsAlert; }
}
