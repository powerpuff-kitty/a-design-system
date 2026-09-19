import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsCalloutVariant = 'neutral' | 'info' | 'tip' | 'warning';

export const adsCalloutContract = defineComponentContract({
  name: 'Callout',
  tagName: 'ads-callout',
  description: 'Non-live contextual aside for notes, tips, warnings, and supporting information.',
  status: 'experimental',
  attributes: [{ name: 'variant', type: "'neutral' | 'info' | 'tip' | 'warning'", default: 'neutral' }],
  slots: [
    { name: 'icon', description: 'Optional leading icon.' },
    { name: 'title', description: 'Optional callout title.' },
    { name: '', description: 'Callout content.' },
    { name: 'actions', description: 'Optional actions.' },
  ],
  parts: [
    { name: 'callout', description: 'Callout aside.' },
    { name: 'icon', description: 'Icon region.' },
    { name: 'content', description: 'Content region.' },
    { name: 'title', description: 'Title region.' },
    { name: 'body', description: 'Body region.' },
    { name: 'actions', description: 'Actions region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-callout-color', default: 'var(--ads-color-text-default)' },
    { name: '--ads-callout-accent', default: 'var(--ads-callout-border, var(--ads-color-line-control))', description: 'Accent border color, honored across variants.' },
    { name: '--ads-callout-accent-width', default: '3px' },
    { name: '--ads-callout-padding', default: '1rem' },
    { name: '--ads-callout-border', default: 'var(--ads-color-line-control)', description: 'Fallback for the neutral accent border.' },
    { name: '--ads-callout-background', default: 'var(--ads-color-surface-subtle)', description: 'Consumer override, honored across variants.' },
    { name: '--ads-callout-radius', default: 'var(--ads-radius-panel, 0px)' },
  ],
});

export class AdsCallout extends LitElement {
  static override styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
    [part='callout'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0.75rem;
      padding: var(--ads-callout-padding, 1rem);
      border-inline-start: var(--ads-callout-accent-width, 3px) solid var(--ads-callout-accent, var(--ads-callout-border, var(--ads-color-line-control, #85858f)));
      border-radius: var(--ads-callout-radius, var(--ads-radius-panel, 0px));
      background: var(--ads-callout-background, var(--ads-color-surface-subtle, #f8f8fa));
      color: var(--ads-callout-color, var(--ads-color-text-default, #29292f));
    }
    :host([variant='info']) [part='callout'] {
      border-inline-start-color: var(--ads-callout-accent, var(--ads-color-action, var(--ads-color-line-control, #315efb)));
      background: var(--ads-callout-background, var(--ads-color-surface-subtle, #f5f8ff));
    }
    :host([variant='tip']) [part='callout'] {
      border-inline-start-color: var(--ads-callout-accent, var(--ads-color-success-strong, var(--ads-color-line-control, #067647)));
      background: var(--ads-callout-background, var(--ads-color-success-subtle, var(--ads-color-surface-subtle, #ecfdf3)));
    }
    :host([variant='warning']) [part='callout'] {
      border-inline-start-color: var(--ads-callout-accent, var(--ads-color-warning-strong, var(--ads-color-line-control, #b54708)));
      background: var(--ads-callout-background, var(--ads-color-warning-subtle, var(--ads-color-surface-subtle, #fffaeb)));
    }
    [part='content'] { min-inline-size: 0; }
    [part='title'] { display: block; font-weight: 650; }
    [part='body'] { display: block; margin-block-start: 0.25rem; }
    [part='actions'] { display: block; margin-block-start: 0.75rem; }
  `;

  @property({ reflect: true }) variant: AdsCalloutVariant = 'neutral';

  override render() {
    return html`
      <aside part="callout">
        <slot part="icon" name="icon"></slot>
        <div part="content">
          <slot part="title" name="title"></slot>
          <slot part="body"></slot>
          <slot part="actions" name="actions"></slot>
        </div>
      </aside>
    `;
  }
}
registerAdsElement('callout', AdsCallout);
declare global {
  interface HTMLElementTagNameMap { 'ads-callout': AdsCallout; }
}
