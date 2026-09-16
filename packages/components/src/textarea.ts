import { defineComponentContract } from '@a-design-system/core';
import { css, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { AdsSelectionDirection } from './input.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

export type AdsTextareaWrap = 'soft' | 'hard';

export const adsTextareaContract = defineComponentContract({
  name: 'Textarea',
  tagName: 'ads-textarea',
  description: 'Form-associated multi-line text control backed by a native textarea.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'placeholder', type: 'string', default: '' },
    { name: 'autocomplete', type: 'string', default: '' },
    { name: 'inputmode', type: 'string', default: '' },
    { name: 'rows', type: 'number', default: '3' },
    { name: 'wrap', type: "'soft' | 'hard'", default: 'soft' },
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
    { name: 'selectionStart', type: 'number', readonly: true },
    { name: 'selectionEnd', type: 'number', readonly: true },
    { name: 'selectionDirection', type: "'forward' | 'backward' | 'none'", readonly: true },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void', description: 'Focuses the internal native textarea.' },
    { name: 'blur', signature: 'blur(): void', description: 'Removes focus from the internal native textarea.' },
    { name: 'select', signature: 'select(): void', description: 'Selects the full text value.' },
    { name: 'setSelectionRange', signature: "setSelectionRange(start: number, end: number, direction?: 'forward' | 'backward' | 'none'): void" },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  slots: [
    { name: 'label', description: 'Accessible visible label content.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation/error message.' },
  ],
  parts: [
    { name: 'label', description: 'Label wrapper.' },
    { name: 'label-text', description: 'Visible label text container.' },
    { name: 'control', description: 'Textarea chrome/control container.' },
    { name: 'textarea', description: 'Native textarea element.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: [
    { name: '--ads-textarea-min-block-size', default: '5rem' },
    { name: '--ads-textarea-padding', default: '0.625rem 0.75rem' },
    { name: '--ads-textarea-border-color', default: '#d7d7dc' },
    { name: '--ads-textarea-background', default: '#fff' },
    { name: '--ads-textarea-color', default: '#111114' },
    { name: '--ads-textarea-radius', default: 'var(--ads-radius-control, 0.375rem)' },
    { name: '--ads-textarea-resize', default: 'vertical' },
  ],
  states: [
    { name: 'invalid', description: 'Native constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

export class AdsTextarea extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-textarea-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: grid;
      gap: var(--ads-textarea-label-gap, 0.375rem);
    }

    [part='label-text'] {
      font-size: var(--ads-textarea-label-font-size, 0.875rem);
      font-weight: var(--ads-textarea-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='control'] {
      box-sizing: border-box;
      display: flex;
      min-block-size: var(--ads-textarea-min-block-size, 5rem);
      border: var(--ads-textarea-border-width, 1px) solid var(--ads-textarea-border-color, #d7d7dc);
      border-radius: var(--ads-textarea-radius, var(--ads-radius-control, 0.375rem));
      background: var(--ads-textarea-background, #fff);
      transition:
        border-color var(--ads-motion-duration-fast, 120ms),
        box-shadow var(--ads-motion-duration-fast, 120ms);
    }

    [part='control']:focus-within {
      border-color: var(--ads-textarea-focus-border-color, currentColor);
      box-shadow: 0 0 0 var(--ads-focus-width, 2px)
        color-mix(in srgb, var(--ads-focus-color, currentColor) 24%, transparent);
    }

    :host(:state(invalid)) [part='control'] {
      border-color: var(--ads-textarea-invalid-border-color, #b42318);
    }

    :host([disabled]) [part='control'] {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    textarea {
      box-sizing: border-box;
      min-inline-size: 0;
      min-block-size: inherit;
      inline-size: 100%;
      padding: var(--ads-textarea-padding, 0.625rem 0.75rem);
      border: 0;
      outline: 0;
      resize: var(--ads-textarea-resize, vertical);
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1.4;
    }

    textarea::placeholder {
      color: var(--ads-textarea-placeholder-color, #707078);
      opacity: 1;
    }

    [part='description'],
    [part='error'] {
      margin-block-start: var(--ads-textarea-message-gap, 0.375rem);
      font-size: var(--ads-textarea-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-textarea-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-textarea-error-color, #b42318);
    }

    @media (prefers-reduced-motion: reduce) {
      [part='control'] {
        transition: none;
      }
    }
  `;

  @property({ reflect: true }) name = '';
  @property() value = '';
  @property() label = '';
  @property() placeholder = '';
  @property() autocomplete = '';
  @property({ attribute: 'inputmode' }) inputMode = '';
  @property({ type: Number, reflect: true }) rows = 3;
  @property({ reflect: true }) wrap: AdsTextareaWrap = 'soft';
  @property({ type: Number, attribute: 'minlength' }) minLength = -1;
  @property({ type: Number, attribute: 'maxlength' }) maxLength = -1;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('textarea') private textareaElement?: HTMLTextAreaElement;
  @state() private invalid = false;

  private defaultValue = '';
  private defaultValueCaptured = false;
  private customValidityMessage = '';

  get selectionStart(): number {
    return this.textareaElement?.selectionStart ?? 0;
  }

  get selectionEnd(): number {
    return this.textareaElement?.selectionEnd ?? 0;
  }

  get selectionDirection(): AdsSelectionDirection {
    return (this.textareaElement?.selectionDirection as AdsSelectionDirection | undefined) ?? 'none';
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
      changed.has('required') ||
      changed.has('minLength') ||
      changed.has('maxLength') ||
      changed.has('disabled') ||
      changed.has('readOnly')
    ) {
      this.syncNativeState();
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.textareaElement) {
      this.textareaElement.focus(options);
      return;
    }
    void this.updateComplete.then(() => this.textareaElement?.focus(options));
  }

  override blur(): void {
    this.textareaElement?.blur();
  }

  select(): void {
    this.textareaElement?.select();
  }

  setSelectionRange(start: number, end: number, direction?: AdsSelectionDirection): void {
    this.textareaElement?.setSelectionRange(start, end, direction);
  }

  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    if (this.textareaElement) {
      this.textareaElement.setCustomValidity(message);
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
    const textarea = this.textareaElement;
    if (!textarea) return;

    if (textarea.value !== this.value) textarea.value = this.value;
    if (textarea.validationMessage !== this.customValidityMessage && this.customValidityMessage) {
      textarea.setCustomValidity(this.customValidityMessage);
    } else if (!this.customValidityMessage && textarea.validity.customError) {
      textarea.setCustomValidity('');
    }

    this.setFormValue(this.disabled ? null : this.value, this.value);

    if (textarea.validity.valid) {
      this.setValidity({});
      this.invalid = false;
      this.internals.states.delete('invalid');
      this.internals.ariaInvalid = 'false';
      return;
    }

    this.setValidity(validityStateToFlags(textarea.validity), textarea.validationMessage, textarea);
    this.invalid = true;
    this.internals.states.add('invalid');
    this.internals.ariaInvalid = 'true';
  }

  private handleInput(event: InputEvent): void {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.value = textarea.value;
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
          <textarea
            part="textarea"
            .value=${this.value}
            .placeholder=${this.placeholder}
            .autocomplete=${this.autocomplete}
            .inputMode=${this.inputMode}
            .rows=${Math.max(1, this.rows)}
            .wrap=${this.wrap}
            minlength=${this.minLength >= 0 ? String(this.minLength) : nothing}
            maxlength=${this.maxLength >= 0 ? String(this.maxLength) : nothing}
            ?disabled=${this.disabled}
            ?readonly=${this.readOnly}
            ?required=${this.required}
            aria-describedby="description error"
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
          ></textarea>
        </span>
      </label>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
    `;
  }
}

registerAdsElement('textarea', AdsTextarea);

declare global {
  interface HTMLElementTagNameMap {
    'ads-textarea': AdsTextarea;
  }
}
