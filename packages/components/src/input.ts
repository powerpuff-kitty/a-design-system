import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export const adsInputContract = defineComponentContract({
  name: 'Input',
  tagName: 'ads-input',
  description: 'Form-associated single-line text control backed by a native input.',
  status: 'experimental',
  attributes: [
    { name: 'type', type: "'text' | 'email' | 'password' | 'search' | 'tel' | 'url'", default: 'text' },
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'placeholder', type: 'string', default: '' },
    { name: 'autocomplete', type: 'string', default: '' },
    { name: 'inputmode', type: 'string', default: '' },
    { name: 'pattern', type: 'string', default: '' },
    { name: 'minlength', type: 'number', default: '-1' },
    { name: 'maxlength', type: 'number', default: '-1' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
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
    { name: 'input', description: 'Native input element.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: [
    { name: '--ads-input-min-block-size', default: '2.5rem' },
    { name: '--ads-input-padding-inline', default: '0.75rem' },
    { name: '--ads-input-gap', default: '0.5rem' },
    { name: '--ads-input-border-color', default: '#d7d7dc' },
    { name: '--ads-input-background', default: '#fff' },
    { name: '--ads-input-color', default: '#111114' },
    { name: '--ads-input-radius', default: 'var(--ads-radius-control, 0.375rem)' },
  ],
  states: [
    { name: 'invalid', description: 'Native constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

function validityFlags(validity: ValidityState): ValidityStateFlags {
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
  };
}

export class AdsInput extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-input-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: grid;
      gap: var(--ads-input-label-gap, 0.375rem);
    }

    [part='label-text'] {
      font-size: var(--ads-input-label-font-size, 0.875rem);
      font-weight: var(--ads-input-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='control'] {
      box-sizing: border-box;
      display: flex;
      min-block-size: var(--ads-input-min-block-size, 2.5rem);
      align-items: center;
      gap: var(--ads-input-gap, 0.5rem);
      padding-inline: var(--ads-input-padding-inline, 0.75rem);
      border: var(--ads-input-border-width, 1px) solid var(--ads-input-border-color, #d7d7dc);
      border-radius: var(--ads-input-radius, var(--ads-radius-control, 0.375rem));
      background: var(--ads-input-background, #fff);
      transition:
        border-color var(--ads-motion-duration-fast, 120ms),
        box-shadow var(--ads-motion-duration-fast, 120ms);
    }

    [part='control']:focus-within {
      border-color: var(--ads-input-focus-border-color, currentColor);
      box-shadow: 0 0 0 var(--ads-focus-width, 2px)
        color-mix(in srgb, var(--ads-focus-color, currentColor) 24%, transparent);
    }

    :host(:state(invalid)) [part='control'] {
      border-color: var(--ads-input-invalid-border-color, #b42318);
    }

    :host([disabled]) [part='control'] {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    input {
      min-inline-size: 0;
      inline-size: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1.4;
    }

    input::placeholder {
      color: var(--ads-input-placeholder-color, #707078);
      opacity: 1;
    }

    ::slotted([slot='start']),
    ::slotted([slot='end']) {
      flex: none;
    }

    [part='description'],
    [part='error'] {
      margin-block-start: var(--ads-input-message-gap, 0.375rem);
      font-size: var(--ads-input-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-input-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-input-error-color, #b42318);
    }

    @media (prefers-reduced-motion: reduce) {
      [part='control'] {
        transition: none;
      }
    }
  `;

  @property() type: AdsInputType = 'text';
  @property() name = '';
  @property() value = '';
  @property() label = '';
  @property() placeholder = '';
  @property() autocomplete = '';
  @property({ attribute: 'inputmode' }) inputMode = '';
  @property() pattern = '';
  @property({ type: Number, attribute: 'minlength' }) minLength = -1;
  @property({ type: Number, attribute: 'maxlength' }) maxLength = -1;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('input') private inputElement!: HTMLInputElement;
  @state() private invalid = false;

  private defaultValue = '';
  private defaultValueCaptured = false;

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
      changed.has('type') ||
      changed.has('required') ||
      changed.has('pattern') ||
      changed.has('minLength') ||
      changed.has('maxLength') ||
      changed.has('disabled') ||
      changed.has('readOnly')
    ) {
      this.syncNativeState();
    }
  }

  protected override onFormDisabledChange(disabled: boolean): void {
    this.disabled = disabled;
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

    if (input.value !== this.value) input.value = this.value;
    this.setFormValue(this.disabled ? null : this.value, this.value);

    if (input.validity.valid) {
      this.setValidity({});
      this.invalid = false;
      this.internals.states.delete('invalid');
      this.internals.ariaInvalid = 'false';
      return;
    }

    this.setValidity(validityFlags(input.validity), input.validationMessage, input);
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
    return html`
      <label part="label">
        <span part="label-text">
          <slot name="label">${this.label}</slot>
        </span>
        <span part="control">
          <slot name="start"></slot>
          <input
            part="input"
            .type=${this.type}
            .value=${this.value}
            .placeholder=${this.placeholder}
            .autocomplete=${this.autocomplete}
            .inputMode=${this.inputMode}
            .pattern=${this.pattern}
            minlength=${this.minLength >= 0 ? String(this.minLength) : nothing}
            maxlength=${this.maxLength >= 0 ? String(this.maxLength) : nothing}
            ?disabled=${this.disabled}
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

registerAdsElement('input', AdsInput);

declare global {
  interface HTMLElementTagNameMap {
    'ads-input': AdsInput;
  }
}
