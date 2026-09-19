import { defineComponentContract } from '@a-design-system/core';
import { AdsInput } from './input.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSearchInputContract = defineComponentContract({
  name: 'AdsSearchInput',
  tagName: 'ads-search-input',
  description: 'A search-specific input with native search semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'placeholder', type: 'string' },
  ],
  properties: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'placeholder', type: 'string' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
});
export class AdsSearchInput extends AdsInput {
  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('type', 'search');
  }
}
registerAdsElement('search-input', AdsSearchInput);
