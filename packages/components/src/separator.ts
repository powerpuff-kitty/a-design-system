import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsSeparatorOrientation = 'horizontal' | 'vertical';

export const adsSeparatorContract = defineComponentContract({
  name: 'Separator',
  tagName: 'ads-separator',
  description: 'Semantic or decorative separator with horizontal and vertical orientations.',
  status: 'experimental',
  attributes: [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'horizontal' },
    { name: 'decorative', type: 'boolean', default: 'false' },
  ],
  parts: [{ name: 'separator', description: 'The separator rule.' }],
  cssCustomProperties: [
    { name: '--ads-separator-color', default: '#dedee3' },
    { name: '--ads-separator-size', default: '1px' },
  ],
});

export class AdsSeparator extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    [part='separator'] {
      inline-size: 100%;
      block-size: var(--ads-separator-size, 1px);
      background: var(--ads-separator-color, #dedee3);
    }

    :host([orientation='vertical']) {
      display: inline-block;
      align-self: stretch;
      min-block-size: 1em;
    }

    :host([orientation='vertical']) [part='separator'] {
      inline-size: var(--ads-separator-size, 1px);
      block-size: 100%;
    }
  `;

  @property({ reflect: true }) orientation: AdsSeparatorOrientation = 'horizontal';
  @property({ type: Boolean, reflect: true }) decorative = false;

  override render() {
    return html`
      <div
        part="separator"
        role=${this.decorative ? 'presentation' : 'separator'}
        aria-orientation=${this.decorative ? nothing : this.orientation}
      ></div>
    `;
  }
}

registerAdsElement('separator', AdsSeparator);

declare global {
  interface HTMLElementTagNameMap {
    'ads-separator': AdsSeparator;
  }
}
