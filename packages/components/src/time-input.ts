import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

export const adsTimeInputContract = defineComponentContract({
  name: 'AdsTimeInput',
  tagName: 'ads-time-input',
  description: 'A form-associated native time input with constraint support.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'min', type: 'string', default: '' },
    { name: 'max', type: 'string', default: '' },
    { name: 'step', type: 'number', default: '60' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
    { name: 'willValidate', type: 'boolean', readonly: true },
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'min', type: 'string' },
    { name: 'max', type: 'string' },
    { name: 'step', type: 'number' },
    { name: 'disabled', type: 'boolean' },
    { name: 'readonly', type: 'boolean' },
    { name: 'required', type: 'boolean' },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'blur', signature: 'blur(): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
  events: [
    {
      name: 'ads-input',
      description: 'Fired while the time changes.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'ads-change',
      description: 'Fired when the time changes.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsTimeInput extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    label {
      display: grid;
      gap: 0.375rem;
    }
    input {
      min-height: 2.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      font: inherit;
    }
  `;
  @property({ reflect: true }) name = '';
  @property() value = '';
  @property() label = '';
  @property() min = '';
  @property() max = '';
  @property({ type: Number }) step = 60;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @query('input') private inputElement?: HTMLInputElement;
  @state() private invalid = false;
  private defaultValue = '';
  private defaultValueCaptured = false;
  private customValidityMessage = '';

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
    )
      this.syncNativeState();
  }
  override focus(options?: FocusOptions): void {
    if (this.inputElement) this.inputElement.focus(options);
    else void this.updateComplete.then(() => this.inputElement?.focus(options));
  }
  override blur(): void {
    this.inputElement?.blur();
  }
  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    this.syncNativeState();
  }
  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncNativeState());
  }
  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncNativeState();
  }
  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') this.value = state;
    this.syncNativeState();
  }

  private syncNativeState(): void {
    const input = this.inputElement;
    if (!input) return;
    const disabled = this.disabled || this.formDisabled;
    if (input.value !== this.value) input.value = this.value;
    if (
      input.validationMessage !== this.customValidityMessage ||
      input.validity.customError !== Boolean(this.customValidityMessage)
    )
      input.setCustomValidity(this.customValidityMessage);
    this.internals.ariaDisabled = String(disabled);
    this.internals.ariaInvalid = String(!input.validity.valid);
    this.setFormValue(disabled ? null : this.value, this.value);
    if (input.validity.valid) {
      this.setValidity({});
      this.invalid = false;
      this.internals.states.delete('invalid');
    } else {
      this.setValidity(validityStateToFlags(input.validity), input.validationMessage, input);
      this.invalid = true;
      this.internals.states.add('invalid');
    }
  }
  private handleInput = (event: Event): void => {
    this.value = (event.currentTarget as HTMLInputElement).value;
    this.syncNativeState();
    this.dispatchEvent(new Event('ads-input', { bubbles: true, composed: true }));
  };
  private handleChange = (event: Event): void => {
    this.value = (event.currentTarget as HTMLInputElement).value;
    this.syncNativeState();
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };
  override render() {
    const disabled = this.disabled || this.formDisabled;
    return html`<label
      ><span>${this.label}<slot name="label"></slot></span
      ><input
        type="time"
        .value=${this.value}
        .min=${this.min}
        .max=${this.max}
        .step=${String(this.step)}
        ?disabled=${disabled}
        ?readonly=${this.readOnly}
        ?required=${this.required}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @input=${this.handleInput}
        @change=${this.handleChange}
    /></label>`;
  }
}
registerAdsElement('time-input', AdsTimeInput);

declare global {
  interface HTMLElementTagNameMap {
    'ads-time-input': AdsTimeInput;
  }
}
