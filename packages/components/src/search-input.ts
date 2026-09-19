import { defineComponentContract } from '@a-design-system/core';
import { AdsInput, adsInputContract, type AdsInputType } from './input.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsSearchInputContract = defineComponentContract({
  ...adsInputContract,
  name: 'Search Input',
  tagName: 'ads-search-input',
  description: 'Form-associated search control backed by the shared ADS native input foundation.',
  attributes: adsInputContract.attributes?.filter((attribute) => attribute.name !== 'type'),
});

export class AdsSearchInput extends AdsInput {
  override type: AdsInputType = 'search';

  protected override get nativeType(): AdsInputType {
    return 'search';
  }
}

registerAdsElement('search-input', AdsSearchInput);

declare global {
  interface HTMLElementTagNameMap {
    'ads-search-input': AdsSearchInput;
  }
}
