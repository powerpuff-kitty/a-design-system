import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsFieldContract = defineComponentContract({
  name: 'AdsField',
  tagName: 'ads-field',
  description: 'Composes a form control with its label, description, and error content.',
  status: 'experimental',
  attributes: [{ name: 'required', type: 'boolean', default: 'false' }],
  properties: [{ name: 'required', type: 'boolean' }],
  slots: [
    { name: 'label', description: 'Visible field label.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation message.' },
    { name: 'default', description: 'Form control.' },
  ],
  parts: [
    { name: 'field', description: 'Field wrapper.' },
    { name: 'label', description: 'Label wrapper.' },
    { name: 'description', description: 'Description wrapper.' },
    { name: 'error', description: 'Error wrapper.' },
  ],
});
export class AdsField extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: 0.375rem;
    }
    [part='label'] {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      font-weight: 600;
    }
    [part='description'] {
      color: color-mix(in srgb, currentColor 70%, transparent);
      font-size: 0.875rem;
    }
    [part='error'] {
      color: var(--ads-field-error-color, #b42318);
      font-size: 0.875rem;
    }
  `;
  @property({ type: Boolean, reflect: true }) required = false;
  override render() {
    return html`<div part="field">
      <label part="label"
        ><slot name="label"></slot>${
          this.required ? html`<span aria-hidden="true">*</span>` : ''
        }<slot></slot
      ></label>
      <div part="description"><slot name="description"></slot></div>
      <div part="error" role="alert"><slot name="error"></slot></div>
    </div>`;
  }
}
registerAdsElement('field', AdsField);
