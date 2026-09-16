import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

export const adsSwitchContract = defineComponentContract({
  name: 'Switch',
  tagName: 'ads-switch',
  description: 'Form-associated binary on/off control backed by a native checkbox input with switch semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: 'on' },
    { name: 'label', type: 'string', default: '' },
    { name: 'checked', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void', description: 'Focuses the internal switch input.' },
    { name: 'blur', signature: 'blur(): void', description: 'Removes focus from the internal switch input.' },
    { name: 'click', signature: 'click(): void', description: 'Toggles the switch through native activation.' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  slots: [
    { name: '', description: 'Stable switch label content.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation/error message.' },
  ],
  parts: [
    { name: 'label', description: 'Clickable label wrapper.' },
    { name: 'control', description: 'Switch control positioning wrapper.' },
    { name: 'input', description: 'Native checkbox input exposed as a switch.' },
    { name: 'track', description: 'Visual switch track.' },
    { name: 'thumb', description: 'Visual switch thumb.' },
    { name: 'label-text', description: 'Label text/content wrapper.' },
    { name: 'description', description: 'Description container.' },
    { name: 'error', description: 'Error container.' },
  ],
  cssCustomProperties: [
    { name: '--ads-switch-inline-size', default: '2.25rem' },
    { name: '--ads-switch-block-size', default: '1.25rem' },
    { name: '--ads-switch-gap', default: '0.625rem' },
    { name: '--ads-switch-background', default: '#b8b8c0' },
    { name: '--ads-switch-checked-background', default: '#111114' },
    { name: '--ads-switch-thumb-color', default: '#fff' },
  ],
  states: [
    { name: 'checked', description: 'The switch is on.' },
    { name: 'invalid', description: 'Native constraint validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

export class AdsSwitch extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: inline-block;
      color: var(--ads-switch-color, #111114);
      font: inherit;
    }

    :host([hidden]) { display: none; }

    [part='label'] {
      display: inline-flex;
      align-items: center;
      gap: var(--ads-switch-gap, 0.625rem);
      cursor: pointer;
      line-height: 1.4;
    }

    [part='control'] {
      position: relative;
      display: inline-grid;
      flex: none;
      inline-size: var(--ads-switch-inline-size, 2.25rem);
      block-size: var(--ads-switch-block-size, 1.25rem);
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

    [part='track'] {
      box-sizing: border-box;
      position: relative;
      inline-size: 100%;
      block-size: 100%;
      border: var(--ads-switch-border-width, 1px) solid var(--ads-switch-border-color, transparent);
      border-radius: 999px;
      background: var(--ads-switch-background, #b8b8c0);
      transition: background-color var(--ads-motion-duration-fast, 120ms);
    }

    [part='thumb'] {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: var(--ads-switch-thumb-offset, 0.125rem);
      inline-size: calc(var(--ads-switch-block-size, 1.25rem) - 0.25rem);
      block-size: calc(var(--ads-switch-block-size, 1.25rem) - 0.25rem);
      border-radius: 50%;
      background: var(--ads-switch-thumb-color, #fff);
      box-shadow: var(--ads-switch-thumb-shadow, 0 1px 2px rgb(0 0 0 / 0.2));
      transform: translateY(-50%);
      transition: inset-inline-start var(--ads-motion-duration-fast, 120ms);
    }

    input:checked + [part='track'] {
      background: var(--ads-switch-checked-background, #111114);
    }

    input:checked + [part='track'] [part='thumb'] {
      inset-inline-start: calc(100% - var(--ads-switch-block-size, 1.25rem) + 0.125rem);
    }

    input:focus-visible + [part='track'] {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    :host(:state(invalid)) [part='track'] {
      border-color: var(--ads-switch-invalid-border-color, #b42318);
    }

    :host([disabled]) [part='label'],
    :host(:state(form-disabled)) [part='label'] {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    [part='description'], [part='error'] {
      margin-block-start: var(--ads-switch-message-gap, 0.375rem);
      margin-inline-start: calc(var(--ads-switch-inline-size, 2.25rem) + var(--ads-switch-gap, 0.625rem));
      font-size: var(--ads-switch-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] { color: var(--ads-switch-description-color, #606068); }
    [part='error'] { color: var(--ads-switch-error-color, #b42318); }

    @media (prefers-reduced-motion: reduce) {
      [part='track'], [part='thumb'] { transition: none; }
    }
  `;

  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = 'on';
  @property() label = '';
  @property({ type: Boolean, reflect: true }) checked = false;
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

  override firstUpdated(): void { this.syncNativeState(); }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has('checked') || changed.has('value') || changed.has('required') || changed.has('disabled')) {
      this.syncNativeState();
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.inputElement) this.inputElement.focus(options);
    else void this.updateComplete.then(() => this.inputElement?.focus(options));
  }

  override blur(): void { this.inputElement?.blur(); }

  override click(): void {
    if (this.inputElement) this.inputElement.click();
    else void this.updateComplete.then(() => this.inputElement?.click());
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
    input.value = this.value;
    if (input.validationMessage !== this.customValidityMessage && this.customValidityMessage) {
      input.setCustomValidity(this.customValidityMessage);
    } else if (!this.customValidityMessage && input.validity.customError) {
      input.setCustomValidity('');
    }

    this.setFormValue(disabled || !this.checked ? null : this.value, this.checked ? 'checked' : 'unchecked');
    this.internals.ariaDisabled = String(disabled);

    if (this.checked) this.internals.states.add('checked');
    else this.internals.states.delete('checked');

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

  private handleInput(event: Event): void {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.checked = input.checked;
    this.syncNativeState();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  override render() {
    const disabled = this.disabled || this.formDisabled;
    return html`
      <label part="label">
        <span part="control">
          <input
            part="input"
            type="checkbox"
            role="switch"
            .checked=${this.checked}
            .value=${this.value}
            ?disabled=${disabled}
            ?required=${this.required}
            aria-describedby="description error"
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <span part="track" aria-hidden="true"><span part="thumb"></span></span>
        </span>
        <span part="label-text"><slot>${this.label}</slot></span>
      </label>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
    `;
  }
}

registerAdsElement('switch', AdsSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'ads-switch': AdsSwitch;
  }
}
