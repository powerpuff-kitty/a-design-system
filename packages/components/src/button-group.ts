import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsButtonGroupOrientation = 'horizontal' | 'vertical';

export const adsButtonGroupContract = defineComponentContract({
  name: 'Button Group',
  tagName: 'ads-button-group',
  description: 'Semantic grouping container for related buttons without overriding native button keyboard behavior.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string', default: '' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'horizontal' },
    { name: 'attached', type: 'boolean', default: 'false' },
  ],
  slots: [{ name: '', description: 'Related ADS or native buttons.' }],
  parts: [{ name: 'group', description: 'The group wrapper.' }],
  cssCustomProperties: [
    { name: '--ads-button-group-gap', default: '0.5rem' },
    { name: '--ads-button-group-attached-gap', default: '0px' },
  ],
});

export class AdsButtonGroup extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }

    [part='group'] {
      display: inline-flex;
      align-items: stretch;
      gap: var(--ads-button-group-gap, 0.5rem);
    }

    :host([orientation='vertical']) [part='group'] {
      flex-direction: column;
    }

    :host([attached]) [part='group'] {
      gap: var(--ads-button-group-attached-gap, 0);
    }
  `;

  @property() label = '';
  @property({ reflect: true }) orientation: AdsButtonGroupOrientation = 'horizontal';
  @property({ type: Boolean, reflect: true }) attached = false;

  override render() {
    return html`
      <div
        part="group"
        role="group"
        aria-label=${this.label || nothing}
      >
        <slot></slot>
      </div>
    `;
  }
}

registerAdsElement('button-group', AdsButtonGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ads-button-group': AdsButtonGroup;
  }
}
