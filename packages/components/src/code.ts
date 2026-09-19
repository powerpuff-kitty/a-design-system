import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsCodeContract = defineComponentContract({
  name: 'AdsCode',
  tagName: 'ads-code',
  description: 'Displays inline or block code content.',
  status: 'experimental',
  attributes: [{ name: 'block', type: 'boolean', default: 'false' }],
  properties: [{ name: 'block', type: 'boolean' }],
  slots: [{ name: 'default', description: 'Code content.' }],
  parts: [
    { name: 'code', description: 'The code content.' },
    { name: 'pre', description: 'The block code container.' },
  ],
});
export class AdsCode extends LitElement {
  static styles = css`
    :host {
      display: inline;
    }
    :host([block]) {
      display: block;
    }
    code {
      display: inline;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      background: var(--ads-code-background, Canvas);
      color: var(--ads-code-color, CanvasText);
      font-family: ui-monospace, monospace;
    }
    pre {
      margin: 0;
      padding: 0.75rem;
      overflow: auto;
      border-radius: 0.375rem;
      background: var(--ads-code-background, Canvas);
      color: var(--ads-code-color, CanvasText);
      font-family: ui-monospace, monospace;
      white-space: pre;
    }
  `;
  @property({ type: Boolean, reflect: true }) block = false;
  override render() {
    return this.block
      ? html`<pre part="pre"><code part="code"><slot></slot></code></pre>`
      : html`<code part="code"><slot></slot></code>`;
  }
}
registerAdsElement('code', AdsCode);
