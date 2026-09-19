import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsKbdContract = defineComponentContract({
  name: 'AdsKbd',
  tagName: 'ads-kbd',
  description: 'Displays a keyboard key or shortcut.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Key label.' }],
  parts: [{ name: 'key', description: 'The keyboard key.' }],
});
export class AdsKbd extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    kbd {
      display: inline-block;
      padding: 0.125rem 0.375rem;
      border: 1px solid ButtonBorder;
      border-bottom-width: 2px;
      border-radius: 0.25rem;
      background: Canvas;
      color: CanvasText;
      font: inherit;
      font-size: 0.875em;
      line-height: 1.2;
      white-space: nowrap;
    }
  `;
  override render() {
    return html`<kbd part="key"><slot></slot></kbd>`;
  }
}
registerAdsElement('kbd', AdsKbd);
