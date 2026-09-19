import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsCheckboxGroupContract = defineComponentContract({
  name: 'AdsCheckboxGroup',
  tagName: 'ads-checkbox-group',
  description: 'Groups related checkbox controls under a shared label.',
  status: 'experimental',
  attributes: [{ name: 'required', type: 'boolean', default: 'false' }],
  properties: [{ name: 'required', type: 'boolean' }],
  slots: [
    { name: 'label', description: 'Group legend.' },
    { name: 'default', description: 'Checkbox controls.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation message.' },
  ],
});
export class AdsCheckboxGroup extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: 0.5rem;
    }
    fieldset {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      border: 0;
    }
    legend {
      font-weight: 600;
    }
    [part='description'] {
      color: color-mix(in srgb, currentColor 70%, transparent);
      font-size: 0.875rem;
    }
    [part='error'] {
      color: #b42318;
      font-size: 0.875rem;
    }
  `;
  @property({ type: Boolean, reflect: true }) required = false;
  override render() {
    return html`<fieldset>
      <legend><slot name="label"></slot>${this.required ? ' *' : ''}</legend>
      <div part="description"><slot name="description"></slot></div>
      <slot></slot>
      <div part="error" role="alert"><slot name="error"></slot></div>
    </fieldset>`;
  }
}
registerAdsElement('checkbox-group', AdsCheckboxGroup);
