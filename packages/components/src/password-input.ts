import { defineComponentContract } from '@a-design-system/core';
import { AdsInput } from './input.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsPasswordInputContract = defineComponentContract({
  name: 'AdsPasswordInput',
  tagName: 'ads-password-input',
  description: 'A password input with native autocomplete semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'autocomplete', type: 'string' },
  ],
  properties: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'autocomplete', type: 'string' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
});
export class AdsPasswordInput extends AdsInput {
  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('type', 'password');
    if (!this.hasAttribute('autocomplete')) this.setAttribute('autocomplete', 'current-password');
  }
}
registerAdsElement('password-input', AdsPasswordInput);
