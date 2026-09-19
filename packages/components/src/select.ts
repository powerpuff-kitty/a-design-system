import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSelectContract = defineComponentContract({
  name: 'AdsSelect',
  tagName: 'ads-select',
  description: 'A native-compatible select control.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string' },
    { name: 'label', type: 'string', default: '' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
    { name: 'willValidate', type: 'boolean', readonly: true },
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
    { name: 'disabled', type: 'boolean' },
    { name: 'required', type: 'boolean' },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'blur', signature: 'blur(): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
  ],
  slots: [
    { name: 'label', description: 'Accessible visible label.' },
    { name: 'default', description: 'Option elements.' },
  ],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when selection changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsSelect extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    label {
      display: grid;
      gap: 0.375rem;
    }
    select {
      min-height: 2.5rem;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      font: inherit;
    }
  `;
  @property({ reflect: true }) name = '';
  @property() value = '';
  @property() label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @query('select') private selectElement?: HTMLSelectElement;
  @query('slot:not([name])') private optionsSlot?: HTMLSlotElement;
  @state() private options: Array<{ value: string; label: string; disabled: boolean }> = [];
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
    this.syncOptions();
    this.syncNativeState();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('required') ||
      changed.has('disabled') ||
      changed.has('options' as keyof AdsSelect)
    ) {
      this.syncNativeState();
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.selectElement) this.selectElement.focus(options);
    else void this.updateComplete.then(() => this.selectElement?.focus(options));
  }

  override blur(): void {
    this.selectElement?.blur();
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
    if (typeof state !== 'string') return;
    this.value = state;
    this.syncNativeState();
  }

  private syncNativeState(): void {
    const select = this.selectElement;
    if (!select) return;
    const disabled = this.disabled || this.formDisabled;
    select.value = this.value;
    if (select.value !== this.value) this.value = select.value;
    select.setCustomValidity(this.customValidityMessage);
    this.internals.ariaDisabled = String(disabled);
    this.internals.ariaInvalid = String(!select.validity.valid);
    this.setFormValue(disabled ? null : this.value, this.value);
    if (select.validity.valid) this.setValidity({});
    else
      this.setValidity(
        { valueMissing: select.validity.valueMissing, customError: select.validity.customError },
        select.validationMessage,
        select,
      );
  }

  private change = (event: Event) => {
    this.value = (event.target as HTMLSelectElement).value;
    this.syncNativeState();
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };

  private syncOptions = (): void => {
    const assigned = this.optionsSlot?.assignedElements({ flatten: true }) ?? [];
    this.options = assigned
      .filter((element): element is HTMLOptionElement => element instanceof HTMLOptionElement)
      .map((option) => ({
        value: option.value,
        label: option.textContent ?? option.value,
        disabled: option.disabled,
      }));
  };

  override render() {
    const disabled = this.disabled || this.formDisabled;
    return html`<label
      >${this.label}<slot name="label"></slot
      ><select
        aria-invalid=${this.selectElement?.validity.valid === false ? 'true' : 'false'}
        name=${this.name}
        .value=${this.value}
        ?disabled=${disabled}
        ?required=${this.required}
        @change=${this.change}
      >
        ${this.options.map(
          (option) =>
            html`<option value=${option.value} ?disabled=${option.disabled}>
              ${option.label}
            </option>`,
        )}</select
      ><slot @slotchange=${this.syncOptions} hidden></slot
    ></label>`;
  }
}
registerAdsElement('select', AdsSelect);
