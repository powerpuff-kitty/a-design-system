import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSeparatorContract = defineComponentContract({
  name: 'AdsSeparator',
  tagName: 'ads-separator',
  description: 'Separates related content.',
  status: 'experimental',
  attributes: [{ name: 'orientation', type: "'horizontal' | 'vertical'", default: 'horizontal' }],
  properties: [{ name: 'orientation', type: "'horizontal' | 'vertical'" }],
  parts: [{ name: 'separator', description: 'The visual separator.' }],
});
export class AdsSeparator extends LitElement {
  static styles = css`
    :host {
      display: block;
      inline-size: 100%;
    }
    :host([orientation='vertical']) {
      inline-size: 1px;
      block-size: 100%;
    }
    hr {
      margin: 0;
      border: 0;
      inline-size: 100%;
      block-size: 0;
      border-block-start: 1px solid var(--ads-separator-color, ButtonBorder);
    }
    :host([orientation='vertical']) hr {
      inline-size: 0;
      block-size: 100%;
      border-block-start: 0;
      border-inline-start: 1px solid var(--ads-separator-color, ButtonBorder);
    }
  `;
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  override render() {
    const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal';
    return html`<hr part="separator" role="separator" aria-orientation=${orientation} />`;
  }
}
registerAdsElement('separator', AdsSeparator);
