import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsTagContract = defineComponentContract({
  name: 'AdsTag',
  tagName: 'ads-tag',
  description: 'A removable label for categorization and filtering.',
  status: 'experimental',
  attributes: [{ name: 'removable', type: 'boolean', default: 'false' }],
  properties: [{ name: 'removable', type: 'boolean' }],
  slots: [{ name: 'default', description: 'Tag content.' }],
  parts: [
    { name: 'tag', description: 'The tag surface.' },
    { name: 'remove', description: 'The remove button.' },
  ],
  events: [
    {
      name: 'ads-remove',
      description: 'Fired when the remove button is activated.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsTag extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    [part='tag'] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      min-height: 1.75rem;
      padding: 0 0.5rem;
      border: 1px solid var(--ads-tag-border, ButtonBorder);
      border-radius: var(--ads-tag-radius, var(--ads-radius-control, 0.375rem));
      font: inherit;
      font-size: 0.875rem;
    }
    button {
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 1px;
    }
  `;
  @property({ type: Boolean, reflect: true }) removable = false;
  private removeTag = () =>
    this.dispatchEvent(new Event('ads-remove', { bubbles: true, composed: true }));
  override render() {
    return html`<span part="tag"
      ><slot></slot
      >${this.removable ? html`<button part="remove" type="button" aria-label="Remove" @click=${this.removeTag}>×</button>` : ''}</span
    >`;
  }
}
registerAdsElement('tag', AdsTag);
