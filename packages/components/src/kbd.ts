import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { registerAdsElement } from './runtime/registration.js';

export const adsKbdContract = defineComponentContract({
  name: 'Keyboard Key',
  tagName: 'ads-kbd',
  description: 'Semantic keyboard-input token styled with ADS typography and chrome.',
  status: 'experimental',
  slots: [{ name: '', description: 'Key or shortcut label.' }],
  parts: [{ name: 'kbd', description: 'The native kbd element.' }],
  cssCustomProperties: [
    { name: '--ads-kbd-background', default: 'var(--ads-color-surface-subtle, #f6f6f8)' },
    { name: '--ads-kbd-border', default: 'var(--ads-color-line-default, #d7d7dc)' },
    { name: '--ads-kbd-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-kbd-color', default: 'var(--ads-color-text-default, #39393f)', description: 'Text color inherited by the component content.' },
  ],
});

export class AdsKbd extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    kbd {
      display: inline-flex;
      min-inline-size: 1.5em;
      min-block-size: 1.5em;
      align-items: center;
      justify-content: center;
      padding: 0.05em 0.35em;
      border: 1px solid var(--ads-kbd-border, var(--ads-color-line-default, #d7d7dc));
      border-block-end-width: 2px;
      border-radius: var(--ads-kbd-radius, var(--ads-radius-control, 0px));
      background: var(--ads-kbd-background, var(--ads-color-surface-subtle, #f6f6f8));
      color: var(--ads-kbd-color, var(--ads-color-text-default, #39393f));
      font-family: var(--ads-font-mono, var(--ads-font-family-mono, ui-monospace, SFMono-Regular, Consolas, monospace));
      font-size: 0.85em;
      line-height: 1.2;
      white-space: nowrap;
    }
  `;

  override render() {
    return html`<kbd part="kbd"><slot></slot></kbd>`;
  }
}

registerAdsElement('kbd', AdsKbd);

declare global {
  interface HTMLElementTagNameMap {
    'ads-kbd': AdsKbd;
  }
}
