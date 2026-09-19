import { defineComponentContract } from '@a-design-system/core';
import { AdsInput, adsInputContract, type AdsInputType } from './input.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsPasswordInputContract = defineComponentContract({
  ...adsInputContract,
  name: 'Password Input',
  tagName: 'ads-password-input',
  description: 'Form-associated password control backed by the shared ADS native input foundation.',
  attributes: adsInputContract.attributes
    ?.filter((attribute) => attribute.name !== 'type')
    .map((attribute) =>
      attribute.name === 'autocomplete'
        ? { ...attribute, default: 'current-password' }
        : attribute,
    ),
});

export class AdsPasswordInput extends AdsInput {
  override type: AdsInputType = 'password';

  constructor() {
    super();
    this.autocomplete = 'current-password';
  }

  protected override get nativeType(): AdsInputType {
    return 'password';
  }
}

registerAdsElement('password-input', AdsPasswordInput);

declare global {
  interface HTMLElementTagNameMap {
    'ads-password-input': AdsPasswordInput;
  }
}
