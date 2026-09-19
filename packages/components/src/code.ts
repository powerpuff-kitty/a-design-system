import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsCodeContract = defineComponentContract({
  name: 'Code',
  tagName: 'ads-code',
  description: 'Inline or block semantic code presentation without syntax-highlighter dependency.',
  status: 'experimental',
  attributes: [
    { name: 'block', type: 'boolean', default: 'false' },
    { name: 'language', type: 'string', default: '' },
  ],
  slots: [{ name: '', description: 'Code text or preformatted code nodes.' }],
  parts: [
    { name: 'pre', description: 'Block pre element when block mode is enabled.' },
    { name: 'code', description: 'Native code element.' },
  ],
  cssCustomProperties: [
    { name: '--ads-code-background', default: '#f6f6f8' },
    { name: '--ads-code-border', default: '#dedee3' },
    { name: '--ads-code-radius', default: '0.25rem' },
  ],
});

export class AdsCode extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    :host([block]) {
      display: block;
    }

    code {
      border-radius: var(--ads-code-radius, 0.25rem);
      background: var(--ads-code-background, #f6f6f8);
      color: var(--ads-code-color, #242429);
      font-family: var(--ads-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace);
      font-size: 0.875em;
    }

    :host(:not([block])) code {
      padding: 0.1em 0.3em;
    }

    pre {
      overflow: auto;
      margin: 0;
      padding: var(--ads-code-block-padding, 1rem);
      border: 1px solid var(--ads-code-border, #dedee3);
      border-radius: var(--ads-code-radius, 0.25rem);
      background: var(--ads-code-background, #f6f6f8);
      tab-size: 2;
    }

    pre code {
      padding: 0;
      background: transparent;
      font-size: var(--ads-code-block-font-size, 0.8125rem);
      line-height: 1.55;
    }
  `;

  @property({ type: Boolean, reflect: true }) block = false;
  @property() language = '';

  override render() {
    const code = html`<code part="code" data-language=${this.language || ''}><slot></slot></code>`;
    return this.block ? html`<pre part="pre">${code}</pre>` : code;
  }
}

registerAdsElement('code', AdsCode);

declare global {
  interface HTMLElementTagNameMap {
    'ads-code': AdsCode;
  }
}
