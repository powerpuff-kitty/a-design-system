import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsTagVariant = 'neutral' | 'accent';

export const adsTagContract = defineComponentContract({
  name: 'Tag',
  tagName: 'ads-tag',
  description: 'Compact categorization label with optional native-button removal action.',
  status: 'experimental',
  attributes: [
    { name: 'variant', type: "'neutral' | 'accent'", default: 'neutral' },
    { name: 'removable', type: 'boolean', default: 'false' },
    { name: 'label', type: 'string', default: '' },
  ],
  events: [
    {
      name: 'ads-remove',
      description: 'Fired when the remove button is activated.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [{ name: '', description: 'Tag label.' }],
  parts: [
    { name: 'tag', description: 'Tag container.' },
    { name: 'remove-button', description: 'Native remove button.' },
  ],
  cssCustomProperties: [
    { name: '--ads-tag-radius', default: 'var(--ads-radius-pill, 999px)' },
    { name: '--ads-tag-background', default: '#f5f5f7' },
    { name: '--ads-tag-color', default: '#39393f' },
  ],
});

export class AdsTag extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    [part='tag'] {
      display: inline-flex;
      min-block-size: 1.75rem;
      align-items: center;
      gap: 0.375rem;
      padding: 0.125rem 0.375rem 0.125rem 0.625rem;
      border: 1px solid var(--ads-tag-border, #d7d7dc);
      border-radius: var(--ads-tag-radius, var(--ads-radius-pill, 999px));
      background: var(--ads-tag-background, #f5f5f7);
      color: var(--ads-tag-color, #39393f);
      font-size: 0.8125rem;
      line-height: 1.2;
    }

    :host(:not([removable])) [part='tag'] {
      padding-inline-end: 0.625rem;
    }

    :host([variant='accent']) [part='tag'] {
      --ads-tag-background: var(--ads-color-accent-subtle, #eef2ff);
      --ads-tag-border: var(--ads-color-accent-border, #c7d2fe);
      --ads-tag-color: var(--ads-color-accent-strong, #3730a3);
    }

    [part='remove-button'] {
      display: inline-grid;
      inline-size: 1.25rem;
      block-size: 1.25rem;
      place-items: center;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1;
      cursor: pointer;
    }

    [part='remove-button']:hover {
      background: color-mix(in srgb, currentColor 10%, transparent);
    }

    [part='remove-button']:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: 1px;
    }
  `;

  @property({ reflect: true }) variant: AdsTagVariant = 'neutral';
  @property({ type: Boolean, reflect: true }) removable = false;
  @property() label = '';

  private handleRemove(): void {
    this.dispatchEvent(
      new CustomEvent('ads-remove', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <span part="tag">
        <slot></slot>
        ${this.removable
          ? html`
              <button
                part="remove-button"
                type="button"
                aria-label=${this.label ? `Remove ${this.label}` : 'Remove tag'}
                @click=${this.handleRemove}
              >
                <span aria-hidden="true">×</span>
              </button>
            `
          : null}
      </span>
    `;
  }
}

registerAdsElement('tag', AdsTag);

declare global {
  interface HTMLElementTagNameMap {
    'ads-tag': AdsTag;
  }
}
