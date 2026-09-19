import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSliderContract = defineComponentContract({
  name: 'AdsSlider',
  tagName: 'ads-slider',
  description: 'A native range slider.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'value', type: 'number', default: '0' },
    { name: 'min', type: 'number', default: '0' },
    { name: 'max', type: 'number', default: '100' },
    { name: 'step', type: 'number', default: '1' },
    { name: 'disabled', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
    { name: 'name', type: 'string' },
    { name: 'value', type: 'number' },
    { name: 'min', type: 'number' },
    { name: 'max', type: 'number' },
    { name: 'step', type: 'number' },
    { name: 'disabled', type: 'boolean' },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'blur', signature: 'blur(): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when the slider changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsSlider extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
    }
    input {
      width: 100%;
      accent-color: currentColor;
    }
  `;
  @property({ reflect: true }) name = '';
  @property() label = '';
  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @query('input') private inputElement?: HTMLInputElement;
  private defaultValue = 0;
  private defaultValueCaptured = false;

  override connectedCallback(): void {
    if (!this.defaultValueCaptured) {
      this.defaultValue = Number(this.getAttribute('value') ?? this.value);
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
      changed.has('disabled')
    ) {
      this.syncNativeState();
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.inputElement) this.inputElement.focus(options);
    else void this.updateComplete.then(() => this.inputElement?.focus(options));
  }

  override blur(): void {
    this.inputElement?.blur();
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
    const value = Number(state);
    if (Number.isFinite(value)) this.value = value;
    this.syncNativeState();
  }

  private syncNativeState(): void {
    const input = this.inputElement;
    if (!input) return;
    const disabled = this.disabled || this.formDisabled;
    input.value = String(this.value);
    input.disabled = disabled;
    this.internals.ariaDisabled = String(disabled);
    this.setFormValue(disabled ? null : String(this.value), String(this.value));
    if (input.validity.valid) this.setValidity({});
    else
      this.setValidity(
        {
          rangeOverflow: input.validity.rangeOverflow,
          rangeUnderflow: input.validity.rangeUnderflow,
          stepMismatch: input.validity.stepMismatch,
        },
        input.validationMessage,
        input,
      );
  }

  private change = (event: Event) => {
    this.value = Number((event.target as HTMLInputElement).value);
    this.syncNativeState();
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };
  override render() {
    const disabled = this.disabled || this.formDisabled;
    return html`<label
      >${this.label}<slot name="label"></slot
      ><input
        name=${this.name}
        type="range"
        .value=${String(this.value)}
        .min=${String(this.min)}
        .max=${String(this.max)}
        .step=${String(this.step)}
        ?disabled=${disabled}
        @input=${this.change}
    /></label>`;
  }
}
registerAdsElement('slider', AdsSlider);
