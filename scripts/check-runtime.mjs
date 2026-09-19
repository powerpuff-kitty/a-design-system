import assert from 'node:assert/strict';

// Importing the built component entry point in Node must not require browser globals.
const components = await import('../packages/components/dist/index.js');
const expected = [
  ['ads-avatar', 'AdsAvatar', 'adsAvatarContract'],
  ['ads-badge', 'AdsBadge', 'adsBadgeContract'],
  ['ads-card', 'AdsCard', 'adsCardContract'],
  ['ads-code', 'AdsCode', 'adsCodeContract'],
  ['ads-copy-button', 'AdsCopyButton', 'adsCopyButtonContract'],
  ['ads-alert', 'AdsAlert', 'adsAlertContract'],
  ['ads-callout', 'AdsCallout', 'adsCalloutContract'],
  ['ads-skeleton', 'AdsSkeleton', 'adsSkeletonContract'],
  ['ads-spinner', 'AdsSpinner', 'adsSpinnerContract'],
  ['ads-progress', 'AdsProgress', 'adsProgressContract'],
  ['ads-visually-hidden', 'AdsVisuallyHidden', 'adsVisuallyHiddenContract'],
  ['ads-progress-ring', 'AdsProgressRing', 'adsProgressRingContract'],
  ['ads-toast', 'AdsToast', 'adsToastContract'],
  ['ads-toast-item', 'AdsToastItem', 'adsToastItemContract'],
  ['ads-field', 'AdsField', 'adsFieldContract'],
  ['ads-label', 'AdsLabel', 'adsLabelContract'],
  ['ads-description', 'AdsDescription', 'adsDescriptionContract'],
  ['ads-error', 'AdsError', 'adsErrorContract'],
  ['ads-switch', 'AdsSwitch', 'adsSwitchContract'],
  ['ads-search-input', 'AdsSearchInput', 'adsSearchInputContract'],
  ['ads-password-input', 'AdsPasswordInput', 'adsPasswordInputContract'],
  ['ads-number-input', 'AdsNumberInput', 'adsNumberInputContract'],
  ['ads-slider', 'AdsSlider', 'adsSliderContract'],
  ['ads-range-slider', 'AdsRangeSlider', 'adsRangeSliderContract'],
  ['ads-checkbox-group', 'AdsCheckboxGroup', 'adsCheckboxGroupContract'],
  ['ads-select', 'AdsSelect', 'adsSelectContract'],
  ['ads-date-input', 'AdsDateInput', 'adsDateInputContract'],
  ['ads-collapsible', 'AdsCollapsible', 'adsCollapsibleContract'],
  ['ads-tabs', 'AdsTabs', 'adsTabsContract'],
  ['ads-tab', 'AdsTab', 'adsTabContract'],
  ['ads-tab-panel', 'AdsTabPanel', 'adsTabPanelContract'],
  ['ads-breadcrumb', 'AdsBreadcrumb', 'adsBreadcrumbContract'],
  ['ads-pagination', 'AdsPagination', 'adsPaginationContract'],
  ['ads-stepper', 'AdsStepper', 'adsStepperContract'],
  ['ads-dialog', 'AdsDialog', 'adsDialogContract'],
  ['ads-alert-dialog', 'AdsAlertDialog', 'adsAlertDialogContract'],
  ['ads-popover', 'AdsPopover', 'adsPopoverContract'],
  ['ads-menu', 'AdsMenu', 'adsMenuContract'],
  ['ads-drawer', 'AdsDrawer', 'adsDrawerContract'],
  ['ads-time-input', 'AdsTimeInput', 'adsTimeInputContract'],
  ['ads-kbd', 'AdsKbd', 'adsKbdContract'],
  ['ads-separator', 'AdsSeparator', 'adsSeparatorContract'],
  ['ads-tag', 'AdsTag', 'adsTagContract'],
  ['ads-table', 'AdsTable', 'adsTableContract'],
  ['ads-tree', 'AdsTree', 'adsTreeContract'],
  ['ads-button-group', 'AdsButtonGroup', 'adsButtonGroupContract'],
  ['ads-icon-button', 'AdsIconButton', 'adsIconButtonContract'],
  ['ads-link', 'AdsLink', 'adsLinkContract'],
  ['ads-button', 'AdsButton', 'adsButtonContract'],
  ['ads-checkbox', 'AdsCheckbox', 'adsCheckboxContract'],
  ['ads-input', 'AdsInput', 'adsInputContract'],
  ['ads-radio', 'AdsRadio', 'adsRadioContract'],
  ['ads-radio-group', 'AdsRadioGroup', 'adsRadioGroupContract'],
  ['ads-textarea', 'AdsTextarea', 'adsTextareaContract'],
];
for (const [tagName, constructorName, contractName] of expected) {
  const constructor = components[constructorName];
  const contract = components[contractName];
  assert.equal(typeof constructor, 'function', `${constructorName} must be exported`);
  assert.equal(contract.tagName, tagName, `${contractName} tag mismatch`);
  assert.match(tagName, /^ads-/);
  if (constructor.formAssociated) assert.equal(constructor.formAssociated, true);
}
console.log(`Verified ${expected.length} SSR-safe runtime contracts`);
