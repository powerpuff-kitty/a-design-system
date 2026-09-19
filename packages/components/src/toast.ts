import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsToastContract = defineComponentContract({
  name: 'AdsToast',
  tagName: 'ads-toast',
  description: 'Presents a transient notification to the user.',
  status: 'experimental',
  attributes: [
    { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'", default: 'neutral' },
    { name: 'dismissible', type: 'boolean', default: 'true' },
  ],
  properties: [
    { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger'" },
    { name: 'dismissible', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Toast content.' }],
  parts: [
    { name: 'toast', description: 'The toast surface.' },
    { name: 'dismiss', description: 'The dismiss button.' },
  ],
  events: [
    { name: 'ads-dismiss', description: 'Fired when dismissed.', bubbles: true, composed: true },
  ],
});
export class AdsToast extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    [part='toast'] {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 16rem;
      padding: 0.75rem 1rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      background: Canvas;
      color: CanvasText;
      box-shadow: 0 0.25rem 1rem color-mix(in srgb, CanvasText 20%, transparent);
    }
    button {
      margin-left: auto;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }
  `;
  @property({ reflect: true }) tone: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';
  @property({ type: Boolean, reflect: true }) dismissible = true;
  private dismiss = () =>
    this.dispatchEvent(new Event('ads-dismiss', { bubbles: true, composed: true }));
  override render() {
    const urgent = this.tone === 'danger';
    return html`<div
      part="toast"
      data-tone=${this.tone}
      role=${urgent ? 'alert' : 'status'}
      aria-live=${urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <slot></slot>${
        this.dismissible
          ? html`<button part="dismiss" type="button" aria-label="Dismiss" @click=${this.dismiss}>
              ×
            </button>`
          : ''
      }
    </div>`;
  }
}
registerAdsElement('toast', AdsToast);
