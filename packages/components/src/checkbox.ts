import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

export const adsCheckboxContract = defineComponentContract({
  name: 'Checkbox',
  tagName: 'ads-checkbox',
  description: 'Form-associated boolean control backed by a native checkbox input.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: 'on' },
    { name: 'label', type: 'string', default: '' },
    { name: 'checked', type: 'boolean', default: 'false' },
    { name: 'indeterminate', type: 'boolean', default: 'false' },
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
      description: 'Focuses the internal native checkbox.',
    },
    {
      name: 'blur',
      signature: 'blur(): void',
      description: 'Removes focus from the internal native checkbox.',
    },
    {
      name: 'click',
      signature: 'click(): void',
      description: 'Activates the native checkbox interaction.',
    },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  slots: [
    { name: '', description: 'Checkbox label content.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation/error message.' },
  ],
  parts: [
    { name: 'label', description: 'Clickable label wrapper.' },
    { name: 'control', description: 'Checkbox control positioning wrapper.' },
    { name: 'input', description: 'Native checkbox input.' },
    { name: 'indicator', description: 'Visual checked/indeterminate indicator.' },
    { name: 'label-text', description: 'Label text/content wrapper.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: [
    { name: '--ads-checkbox-size', default: '1.125rem' },
    { name: '--ads-checkbox-gap', default: '0.5rem' },
    { name: '--ads-checkbox-border-color', default: '#8a8a93' },
    { name: '--ads-checkbox-background', default: '#fff' },
    { name: '--ads-checkbox-checked-background', default: '#111114' },
    { name: '--ads-checkbox-checked-color', default: '#fff' },
    { name: '--ads-checkbox-radius', default: '0.25rem' },
  ],
  states: [
    { name: 'checked', description: 'The checkbox is checked.' },
    { name: 'indeterminate', description: 'The checkbox is visually indeterminate.' },
    { name: 'invalid', description: 'Native constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

export class AdsCheckbox extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: inline-block;
      color: var(--ads-checkbox-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: inline-flex;
      align-items: flex-start;
      gap: var(--ads-checkbox-gap, 0.5rem);
      cursor: pointer;
      line-height: 1.4;
    }

    [part='control'] {
      position: relative;
      display: inline-grid;
      flex: none;
      inline-size: var(--ads-checkbox-size, 1.125rem);
      block-size: var(--ads-checkbox-size, 1.125rem);
      margin-block-start: 0.08em;
    }

    input {
      position: absolute;
      z-index: 1;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    [part='indicator'] {
      box-sizing: border-box;
      display: grid;
      inline-size: 100%;
      block-size: 100%;
      place-items: center;
      border: var(--ads-checkbox-border-width, 1px) solid var(--ads-checkbox-border-color, #8a8a93);
      border-radius: var(--ads-checkbox-radius, 0.25rem);
      background: var(--ads-checkbox-background, #fff);
      color: var(--ads-checkbox-checked-color, #fff);
      transition:
        background-color var(--ads-motion-duration-fast, 120ms),
        border-color var(--ads-motion-duration-fast, 120ms),
        box-shadow var(--ads-motion-duration-fast, 120ms);
    }

    input:focus-visible + [part='indicator'] {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    input:checked + [part='indicator'],
    input:indeterminate + [part='indicator'] {
      border-color: var(--ads-checkbox-checked-background, #111114);
      background: var(--ads-checkbox-checked-background, #111114);
    }

    input:checked + [part='indicator']::after {
      inline-size: 0.45em;
      block-size: 0.7em;
      border: solid currentColor;
      border-width: 0 0.14em 0.14em 0;
      content: '';
      transform: translateY(-0.06em) rotate(45deg);
    }

    input:indeterminate + [part='indicator']::after {
      inline-size: 0.6em;
      block-size: 0.12em;
      border: 0;
      border-radius: 999px;
      background: currentColor;
      content: '';
      transform: none;
    }

    :host(:state(invalid)) [part='indicator'] {
      border-color: var(--ads-checkbox-invalid-border-color, #b42318);
    }

    :host([disabled]) [part='label'],
    :host(:state(form-disabled)) [part='label'] {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    [part='description'],
    [part='error'] {
      margin-block-start: var(--ads-checkbox-message-gap, 0.375rem);
      margin-inline-start: calc(
        var(--ads-checkbox-size, 1.125rem) + var(--ads-checkbox-gap, 0.5rem)
      );
      font-size: var(--ads-checkbox-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-checkbox-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-checkbox-error-color, #b42318);
    }

    @media (prefers-reduced-motion: reduce) {
      [part='indicator'] {
        transition: none;
      }
    }
  `;

  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = 'on';
  @property() label = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('input') private inputElement?: HTMLInputElement;
  @state() private invalid = false;

  private defaultChecked = false;
  private defaultCheckedCaptured = false;
  private customValidityMessage = '';

  override connectedCallback(): void {
    if (!this.defaultCheckedCaptured) {
      this.defaultChecked = this.hasAttribute('checked') || this.checked;
      this.defaultCheckedCaptured = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    this.syncNativeState();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('checked') ||
      changed.has('indeterminate') ||
      changed.has('value') ||
      changed.has('required') ||
      changed.has('disabled')
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

  override click(): void {
    if (this.inputElement) {
      this.inputElement.click();
      return;
    }
    void this.updateComplete.then(() => this.inputElement?.click());
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
    this.checked = this.defaultChecked;
    this.syncNativeState();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    this.checked = state === 'checked';
    this.syncNativeState();
  }

  private syncNativeState(): void {
    const input = this.inputElement;
    if (!input) return;

    const disabled = this.disabled || this.formDisabled;
    input.checked = this.checked;
    input.indeterminate = this.indeterminate;
    input.value = this.value;
    if (input.validationMessage !== this.customValidityMessage && this.customValidityMessage) {
      input.setCustomValidity(this.customValidityMessage);
    } else if (!this.customValidityMessage && input.validity.customError) {
      input.setCustomValidity('');
    }

    this.internals.ariaChecked = this.indeterminate ? 'mixed' : String(this.checked);
    this.internals.ariaDisabled = String(disabled);
    this.setFormValue(
      disabled || !this.checked ? null : this.value,
      this.checked ? 'checked' : 'unchecked',
    );

    if (this.checked) this.internals.states.add('checked');
    else this.internals.states.delete('checked');
    if (this.indeterminate) this.internals.states.add('indeterminate');
    else this.internals.states.delete('indeterminate');

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
    this.checked = input.checked;
    this.indeterminate = input.indeterminate;
    this.syncNativeState();
  }

  private handleChange(): void {
    this.syncNativeState();
  }

  override render() {
    const disabled = this.disabled || this.formDisabled;

    return html`
      <label part="label">
        <span part="control">
          <input
            part="input"
            type="checkbox"
            .checked=${this.checked}
            .value=${this.value}
            ?disabled=${disabled}
            ?required=${this.required}
            aria-describedby="description error"
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <span part="indicator" aria-hidden="true"></span>
        </span>
        <span part="label-text"><slot>${this.label}</slot></span>
      </label>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
    `;
  }
}

registerAdsElement('checkbox', AdsCheckbox);

declare global {
  interface HTMLElementTagNameMap {
    'ads-checkbox': AdsCheckbox;
  }
}
