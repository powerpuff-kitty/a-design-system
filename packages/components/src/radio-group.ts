import { defineComponentContract, getNextEnabledIndex } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { AdsRadio, type AdsRadioSelectDetail } from './radio.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsRadioGroupOrientation = 'horizontal' | 'vertical';

export const adsRadioGroupContract = defineComponentContract({
  name: 'Radio Group',
  tagName: 'ads-radio-group',
  description: 'Form-associated single-selection group that manages ads-radio options.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'vertical' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
  ],
  methods: [
    {
      name: 'focus',
      signature: 'focus(options?: FocusOptions): void',
      description: 'Focuses the selected radio, or the first enabled option.',
    },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  events: [
    {
      name: 'input',
      detail: 'Event',
      description: 'Dispatched when user interaction changes the selected value.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'change',
      detail: 'Event',
      description: 'Dispatched after user interaction commits a new selected value.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [
    { name: '', description: 'ads-radio options.' },
    { name: 'label', description: 'Visible group label.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation/error message.' },
  ],
  parts: [
    { name: 'label', description: 'Group label container.' },
    { name: 'group', description: 'ARIA radiogroup wrapper.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: [
    { name: '--ads-radio-group-gap', default: '0.625rem' },
    { name: '--ads-radio-group-label-gap', default: '0.5rem' },
  ],
  states: [
    { name: 'invalid', description: 'Required/custom constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

export class AdsRadioGroup extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-radio-group-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: block;
      margin-block-end: var(--ads-radio-group-label-gap, 0.5rem);
      font-size: var(--ads-radio-group-label-font-size, 0.875rem);
      font-weight: var(--ads-radio-group-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='group'] {
      display: flex;
      gap: var(--ads-radio-group-gap, 0.625rem);
    }

    :host([orientation='vertical']) [part='group'] {
      flex-direction: column;
      align-items: flex-start;
    }

    :host([orientation='horizontal']) [part='group'] {
      flex-flow: row wrap;
      align-items: center;
    }

    :host([disabled]) [part='group'],
    :host(:state(form-disabled)) [part='group'] {
      cursor: not-allowed;
    }

    [part='description'],
    [part='error'] {
      margin-block-start: var(--ads-radio-group-message-gap, 0.5rem);
      font-size: var(--ads-radio-group-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-radio-group-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-radio-group-error-color, #b42318);
    }
  `;

  @property({ reflect: true }) name = '';
  @property() value = '';
  @property() label = '';
  @property({ reflect: true }) orientation: AdsRadioGroupOrientation = 'vertical';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('slot:not([name])') private optionsSlot?: HTMLSlotElement;
  @query('[part="group"]') private groupElement?: HTMLElement;
  @state() private invalid = false;

  private defaultValue = '';
  private defaultValueCaptured = false;
  private customValidityMessage = '';

  override firstUpdated(): void {
    this.syncRadios();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('required') ||
      changed.has('disabled') ||
      changed.has('orientation')
    ) {
      this.syncRadios();
    }
  }

  override focus(options?: FocusOptions): void {
    const target = this.getFocusableRadio();
    if (target) {
      target.focus(options);
      return;
    }

    void this.updateComplete.then(() => this.getFocusableRadio()?.focus(options));
  }

  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    this.syncRadios();
  }

  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncRadios());
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncRadios();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    this.value = state;
    this.syncRadios();
  }

  private get radios(): AdsRadio[] {
    return (this.optionsSlot?.assignedElements({ flatten: true }) ?? []).filter(
      (element): element is AdsRadio => element instanceof AdsRadio,
    );
  }

  private get groupDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private getSelectedIndex(radios = this.radios): number {
    return radios.findIndex((radio) => radio.value === this.value);
  }

  private getFocusableRadio(): AdsRadio | undefined {
    const radios = this.radios;
    if (this.groupDisabled) return undefined;

    const selectedIndex = this.getSelectedIndex(radios);
    if (selectedIndex >= 0 && !radios[selectedIndex]?.disabled) return radios[selectedIndex];
    return radios.find((radio) => !radio.disabled);
  }

  private captureDefaultValue(radios: AdsRadio[]): void {
    if (this.defaultValueCaptured) return;

    const attributeValue = this.getAttribute('value');
    const checkedRadio = radios.find((radio) => radio.checked && !radio.disabled);
    const initialValue = attributeValue ?? checkedRadio?.value ?? this.value;

    this.defaultValue = initialValue;
    this.defaultValueCaptured = true;

    if (!this.value && initialValue) this.value = initialValue;
  }

  private syncRadios(): void {
    const radios = this.radios;
    this.captureDefaultValue(radios);

    const selectedIndex = this.getSelectedIndex(radios);
    const firstEnabledIndex = radios.findIndex((radio) => !radio.disabled);
    const focusIndex =
      selectedIndex >= 0 && !radios[selectedIndex]?.disabled ? selectedIndex : firstEnabledIndex;
    const disabled = this.groupDisabled;

    radios.forEach((radio, index) => {
      radio.setGroupState(
        index === selectedIndex,
        !disabled && index === focusIndex ? 0 : -1,
        disabled,
      );
    });

    const selected = selectedIndex >= 0 ? radios[selectedIndex] : undefined;
    const successfulValue = !disabled && selected ? this.value : null;
    this.setFormValue(successfulValue, this.value);
    this.internals.ariaDisabled = String(disabled);

    if (this.customValidityMessage) {
      this.applyValidity({ customError: true }, this.customValidityMessage);
      return;
    }

    if (this.required && !selected) {
      this.applyValidity({ valueMissing: true }, 'Please select an option.');
      return;
    }

    this.applyValidity({});
  }

  private applyValidity(flags: ValidityStateFlags, message = ''): void {
    const invalid = Object.values(flags).some(Boolean);
    this.setValidity(flags, message, this.groupElement);
    this.invalid = invalid;
    this.internals.ariaInvalid = String(invalid);

    if (invalid) this.internals.states.add('invalid');
    else this.internals.states.delete('invalid');
  }

  private selectValue(value: string, userInitiated: boolean): void {
    const radio = this.radios.find((candidate) => candidate.value === value);
    if (!radio || radio.disabled || this.groupDisabled) {
      this.syncRadios();
      return;
    }

    const changed = this.value !== value;
    this.value = value;
    this.syncRadios();

    if (changed && userInitiated) {
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
  }

  private handleRadioSelect(event: CustomEvent<AdsRadioSelectDetail>): void {
    event.stopPropagation();
    this.selectValue(event.detail.value, true);
  }

  private handleRadioMetaChange(event: Event): void {
    const path = event.composedPath();
    if (!path.some((node) => node instanceof AdsRadio)) return;
    void this.updateComplete.then(() => this.syncRadios());
  }

  private handleSlotChange(): void {
    this.syncRadios();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.groupDisabled) return;

    let delta: 1 | -1;
    if (event.key === 'ArrowDown') delta = 1;
    else if (event.key === 'ArrowUp') delta = -1;
    else if (event.key === 'ArrowRight') {
      delta = getComputedStyle(this).direction === 'rtl' ? -1 : 1;
    } else if (event.key === 'ArrowLeft') {
      delta = getComputedStyle(this).direction === 'rtl' ? 1 : -1;
    } else {
      return;
    }

    const path = event.composedPath();
    const currentRadio = path.find((node): node is AdsRadio => node instanceof AdsRadio);
    if (!currentRadio) return;

    const radios = this.radios;
    const currentIndex = radios.indexOf(currentRadio);
    if (currentIndex < 0) return;

    const nextIndex = getNextEnabledIndex(
      radios.map((radio) => ({ disabled: radio.disabled })),
      currentIndex,
      delta,
      true,
    );
    const nextRadio = radios[nextIndex];
    if (!nextRadio || nextRadio.disabled) return;

    event.preventDefault();
    this.selectValue(nextRadio.value, true);
    nextRadio.focus();
  }

  override render() {
    const disabled = this.groupDisabled;

    return html`
      <div id="label" part="label"><slot name="label">${this.label}</slot></div>
      <div
        part="group"
        role="radiogroup"
        aria-labelledby="label"
        aria-describedby="description error"
        aria-required=${this.required ? 'true' : 'false'}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        aria-disabled=${disabled ? 'true' : 'false'}
        @keydown=${this.handleKeyDown}
        @ads-radio-select=${this.handleRadioSelect}
        @ads-radio-meta-change=${this.handleRadioMetaChange}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
    `;
  }
}

registerAdsElement('radio-group', AdsRadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ads-radio-group': AdsRadioGroup;
  }
}
