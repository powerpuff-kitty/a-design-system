import { defineComponentContract } from '@a-design-system/core';
import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { AdsInput, adsInputContract } from './input.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

export const adsNumberInputContract = defineComponentContract({
  name: 'Number Input',
  tagName: 'ads-number-input',
  description: 'Form-associated numeric input with native number validity and stepping semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'placeholder', type: 'string', default: '' },
    { name: 'min', type: 'number', default: 'NaN' },
    { name: 'max', type: 'number', default: 'NaN' },
    { name: 'step', type: 'string', default: '1' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
    { name: 'valueAsNumber', type: 'number', readonly: true },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'blur', signature: 'blur(): void' },
    { name: 'stepUp', signature: 'stepUp(increment?: number): void' },
    { name: 'stepDown', signature: 'stepDown(increment?: number): void' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  slots: [
    { name: 'label', description: 'Accessible visible label content.' },
    { name: 'start', description: 'Leading icon or inline affordance.' },
    { name: 'end', description: 'Trailing icon or inline affordance.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation/error message.' },
  ],
  parts: [
    { name: 'label', description: 'Label wrapper.' },
    { name: 'label-text', description: 'Visible label text container.' },
    { name: 'control', description: 'Input chrome/control container.' },
    { name: 'input', description: 'Native number input.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: adsInputContract.cssCustomProperties,
  states: [
    { name: 'invalid', description: 'Native constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});


export class AdsNumberInput extends FormAssociatedElement {
  static override styles = AdsInput.styles;

  @property({ reflect: true }) name = '';
  @property() value = '';
  @property() label = '';
  @property() placeholder = '';
  @property({ type: Number }) min = Number.NaN;
  @property({ type: Number }) max = Number.NaN;
  @property() step = '1';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('input') private inputElement?: HTMLInputElement;
  @state() private invalid = false;

  private defaultValue = '';
  private defaultValueCaptured = false;
  private customValidityMessage = '';

  get valueAsNumber(): number {
    return this.inputElement?.valueAsNumber ?? Number.NaN;
  }

  override connectedCallback(): void {
    if (!this.defaultValueCaptured) {
      this.defaultValue = this.getAttribute('value') ?? this.value;
      this.defaultValueCaptured = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    this.syncNativeState();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('min') ||
      changed.has('max') ||
      changed.has('step') ||
      changed.has('required') ||
      changed.has('disabled') ||
      changed.has('readOnly')
    ) {
      this.syncNativeState();
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.inputElement) {
      this.inputElement.focus(options);
      return;
    }
    void this.updateComplete.then(() => this.inputElement?.focus(options));
  }

  override blur(): void {
    this.inputElement?.blur();
  }

  stepUp(increment = 1): void {
    const input = this.inputElement;
    if (!input) return;
    input.stepUp(increment);
    this.value = input.value;
    this.syncNativeState();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  stepDown(increment = 1): void {
    const input = this.inputElement;
    if (!input) return;
    input.stepDown(increment);
    this.value = input.value;
    this.syncNativeState();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    if (this.inputElement) {
      this.inputElement.setCustomValidity(message);
      this.syncNativeState();
    }
  }

  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncNativeState());
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncNativeState();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    this.value = state;
    this.syncNativeState();
  }

  private syncNativeState(): void {
    const input = this.inputElement;
    if (!input) return;

    const disabled = this.disabled || this.formDisabled;
    if (input.value !== this.value) input.value = this.value;

    if (this.customValidityMessage) {
      input.setCustomValidity(this.customValidityMessage);
    } else if (input.validity.customError) {
      input.setCustomValidity('');
    }

    this.internals.ariaDisabled = String(disabled);
    this.setFormValue(disabled ? null : this.value, this.value);

    if (input.validity.valid) {
      this.setValidity({});
      this.invalid = false;
      this.internals.states.delete('invalid');
      this.internals.ariaInvalid = 'false';
      return;
    }

    this.setValidity(validityStateToFlags(input.validity), input.validationMessage, input);
    this.invalid = true;
    this.internals.states.add('invalid');
    this.internals.ariaInvalid = 'true';
  }

  private handleInput(event: InputEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncNativeState();
  }

  private handleChange(): void {
    this.syncNativeState();
  }

  override render() {
    const disabled = this.disabled || this.formDisabled;

    return html`
      <label part="label">
        <span part="label-text">
          <slot name="label">${this.label}</slot>
        </span>
        <span part="control">
          <slot name="start"></slot>
          <input
            part="input"
            type="number"
            .value=${this.value}
            .placeholder=${this.placeholder}
            min=${Number.isFinite(this.min) ? String(this.min) : nothing}
            max=${Number.isFinite(this.max) ? String(this.max) : nothing}
            step=${this.step || '1'}
            inputmode="decimal"
            ?disabled=${disabled}
            ?readonly=${this.readOnly}
            ?required=${this.required}
            aria-describedby="description error"
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <slot name="end"></slot>
        </span>
      </label>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
    `;
  }
}

registerAdsElement('number-input', AdsNumberInput);

declare global {
  interface HTMLElementTagNameMap {
    'ads-number-input': AdsNumberInput;
  }
}
