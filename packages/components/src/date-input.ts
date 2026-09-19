import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsDateInputContract = defineComponentContract({
  name: 'AdsDateInput',
  tagName: 'ads-date-input',
  description: 'A native date input with constraint support.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'string' },
    { name: 'min', type: 'string' },
    { name: 'max', type: 'string' },
    { name: 'label', type: 'string', default: '' },
    { name: 'required', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'value', type: 'string' },
    { name: 'min', type: 'string' },
    { name: 'max', type: 'string' },
    { name: 'label', type: 'string' },
    { name: 'required', type: 'boolean' },
    { name: 'disabled', type: 'boolean' },
  ],
  slots: [{ name: 'label', description: 'Accessible visible label.' }],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when the date changes.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsDateInput extends LitElement {
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

  @property() value = '';
  @property() min = '';
  @property() max = '';
  @property() label = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @query('input') private inputElement?: HTMLInputElement;

  override focus(options?: FocusOptions): void {
    this.inputElement?.focus(options);
  }

  override blur(): void {
    this.inputElement?.blur();
  }

  private change = (event: Event) => {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };

  override render() {
    return html`<label
      >${this.label}<slot name="label"></slot
      ><input
        type="date"
        .value=${this.value}
        .min=${this.min}
        .max=${this.max}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @change=${this.change}
    /></label>`;
  }
}

registerAdsElement('date-input', AdsDateInput);
