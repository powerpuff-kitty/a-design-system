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
    { name: '--ads-code-background', default: 'var(--ads-color-surface-subtle, #f6f6f8)' },
    { name: '--ads-code-border', default: 'var(--ads-color-line-default, #dedee3)' },
    { name: '--ads-code-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-code-block-font-size', default: '0.8125rem', description: 'Code text size in block mode only.' },
    { name: '--ads-code-block-padding', default: '1rem', description: 'Padding of the preformatted block container.' },
    { name: '--ads-code-color', default: 'var(--ads-color-text-default, #242429)', description: 'Text color inherited by the component content.' },
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
      border-radius: var(--ads-code-radius, var(--ads-radius-control, 0px));
      background: var(--ads-code-background, var(--ads-color-surface-subtle, #f6f6f8));
      color: var(--ads-code-color, var(--ads-color-text-default, #242429));
      font-family: var(--ads-font-mono, var(--ads-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace));
      font-size: 0.875em;
    }

    :host(:not([block])) code {
      padding: 0.1em 0.3em;
    }

    pre {
      overflow: auto;
      margin: 0;
      padding: var(--ads-code-block-padding, 1rem);
      border: 1px solid var(--ads-code-border, var(--ads-color-line-default, #dedee3));
      border-radius: var(--ads-code-radius, var(--ads-radius-control, 0px));
      background: var(--ads-code-background, var(--ads-color-surface-subtle, #f6f6f8));
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
