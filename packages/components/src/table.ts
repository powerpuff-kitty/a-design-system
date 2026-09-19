import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsTableContract = defineComponentContract({
  name: 'AdsTable',
  tagName: 'ads-table',
  description: 'A responsive, accessible table surface for tabular data.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string' },
    { name: 'density', type: "'comfortable' | 'compact'", default: 'comfortable' },
    { name: 'striped', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'label', type: 'string' },
    { name: 'density', type: "'comfortable' | 'compact'" },
    { name: 'striped', type: 'boolean' },
  ],
  slots: [
    { name: 'caption', description: 'An accessible table caption.' },
    { name: 'default', description: 'Native table sections and rows.' },
  ],
  parts: [
    { name: 'table', description: 'The native table element.' },
    { name: 'caption', description: 'The table caption.' },
  ],
});

export class AdsTable extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 100%;
      overflow-x: auto;
    }
    [part='table'] {
      width: 100%;
      min-width: 32rem;
      border-collapse: collapse;
      color: CanvasText;
    }
    [part='caption'] {
      margin-bottom: 0.75rem;
      text-align: left;
      font-weight: 650;
    }
    ::slotted(*) {
      font: inherit;
    }
  `;

  @property() label = '';
  @property({ reflect: true }) density: 'comfortable' | 'compact' = 'comfortable';
  @property({ type: Boolean, reflect: true }) striped = false;

  override render() {
    return html`<table part="table" aria-label=${this.label || undefined}>
      <caption part="caption">
        <slot name="caption"></slot>
      </caption>
      <slot></slot>
    </table>`;
  }
}

registerAdsElement('table', AdsTable);
