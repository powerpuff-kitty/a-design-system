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
    { name: '--ads-callout-border', default: '#dedee3' },
    { name: '--ads-callout-background', default: '#f8f8fa' },
    { name: '--ads-callout-radius', default: 'var(--ads-radius-panel, 0.375rem)' },
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
      border-inline-start: var(--ads-callout-accent-width, 3px) solid var(--ads-callout-accent, #85858f);
      border-radius: var(--ads-callout-radius, var(--ads-radius-panel, 0.375rem));
      background: var(--ads-callout-background, #f8f8fa);
      color: var(--ads-callout-color, #29292f);
    }
    :host([variant='info']) [part='callout'] { --ads-callout-accent: var(--ads-color-action, #315efb); --ads-callout-background: #f5f8ff; }
    :host([variant='tip']) [part='callout'] { --ads-callout-accent: var(--ads-color-success-strong, #067647); --ads-callout-background: var(--ads-color-success-subtle, #ecfdf3); }
    :host([variant='warning']) [part='callout'] { --ads-callout-accent: var(--ads-color-warning-strong, #b54708); --ads-callout-background: var(--ads-color-warning-subtle, #fffaeb); }
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
  interface HTMLElementTagNameMap {
    'ads-callout': AdsCallout;
  }
}
