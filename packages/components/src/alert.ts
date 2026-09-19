import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsAlertContract = defineComponentContract({
  name: 'AdsAlert',
  tagName: 'ads-alert',
  description: 'Communicates an important status or message.',
  status: 'experimental',
  attributes: [
    { name: 'tone', type: "'info' | 'success' | 'warning' | 'danger'", default: 'info' },
    { name: 'dismissible', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'tone', type: "'info' | 'success' | 'warning' | 'danger'" },
    { name: 'dismissible', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Alert content.' }],
  parts: [
    { name: 'alert', description: 'The alert surface.' },
    { name: 'dismiss', description: 'The dismiss button.' },
  ],
  events: [
    { name: 'ads-dismiss', description: 'Fired when dismissed.', bubbles: true, composed: true },
  ],
});
export class AdsAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    [part='alert'] {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border: var(--ads-alert-border-width, 1px) solid var(--ads-alert-border, ButtonBorder);
      border-radius: var(--ads-alert-radius, var(--ads-radius-control, 0.375rem));
      background: var(--ads-alert-background, Canvas);
      color: var(--ads-alert-color, CanvasText);
    }
    button {
      margin-left: auto;
      border: 0;
      padding: 0.125rem;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
    }
  `;
  @property({ reflect: true }) tone: 'info' | 'success' | 'warning' | 'danger' = 'info';
  @property({ type: Boolean, reflect: true }) dismissible = false;
  private dismiss = () =>
    this.dispatchEvent(new Event('ads-dismiss', { bubbles: true, composed: true }));
  override render() {
    const role = this.tone === 'danger' ? 'alert' : 'status';
    return html`<div part="alert" data-tone=${this.tone} role=${role} aria-atomic="true">
      <slot></slot
      >${this.dismissible ? html`<button part="dismiss" type="button" aria-label="Dismiss" @click=${this.dismiss}>×</button>` : ''}
    </div>`;
  }
}
registerAdsElement('alert', AdsAlert);
