import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsButtonGroupContract = defineComponentContract({
  name: 'AdsButtonGroup',
  tagName: 'ads-button-group',
  description: 'Groups related actions with consistent spacing and orientation.',
  status: 'experimental',
  attributes: [{ name: 'orientation', type: "'horizontal' | 'vertical'", default: 'horizontal' }],
  properties: [
    { name: 'orientation', type: "'horizontal' | 'vertical'" },
    { name: 'label', type: 'string' },
  ],
  slots: [{ name: 'default', description: 'Buttons or links in the group.' }],
  parts: [{ name: 'group', description: 'The semantic action group.' }],
});

export class AdsButtonGroup extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      gap: var(--ads-button-group-gap, 0.5rem);
    }
    [part='group'] {
      display: inherit;
      gap: inherit;
    }
    :host([orientation='vertical']) {
      flex-direction: column;
    }
  `;
  @property() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property() label = '';
  override render() {
    const vertical = this.orientation === 'vertical';
    return html`<div
      part="group"
      role="group"
      aria-label=${this.label || nothing}
      aria-orientation=${vertical ? 'vertical' : nothing}
    >
      <slot></slot>
    </div>`;
  }
}
registerAdsElement('button-group', AdsButtonGroup);
