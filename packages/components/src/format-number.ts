import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsNumberStyle = 'decimal' | 'percent' | 'currency' | 'unit';
export type AdsNumberNotation = 'standard' | 'scientific' | 'engineering' | 'compact';

export const adsFormatNumberContract = defineComponentContract({
  name: 'Format Number',
  tagName: 'ads-format-number',
  description: 'Locale-aware number, percent, currency, and unit formatter backed by Intl.NumberFormat.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number', default: '0' },
    { name: 'locale', type: 'string', default: '' },
    { name: 'format-style', type: "'decimal' | 'percent' | 'currency' | 'unit'", default: 'decimal' },
    { name: 'currency', type: 'string', default: '' },
    { name: 'unit', type: 'string', default: '' },
    { name: 'notation', type: "'standard' | 'scientific' | 'engineering' | 'compact'", default: 'standard' },
    { name: 'minimum-fraction-digits', type: 'number', default: 'NaN' },
    { name: 'maximum-fraction-digits', type: 'number', default: 'NaN' },
    { name: 'fallback', type: 'string', default: '—' },
  ],
  properties: [
    {
      name: 'options',
      type: 'Intl.NumberFormatOptions',
      default: '{}',
      description: 'Additional Intl options. Explicit component attributes take precedence.',
    },
  ],
  parts: [{ name: 'value', description: 'Formatted output.' }],
});

export class AdsFormatNumber extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: Number }) value = 0;
  @property() locale = '';
  @property({ attribute: 'format-style' }) formatStyle: AdsNumberStyle = 'decimal';
  @property() currency = '';
  @property() unit = '';
  @property() notation: AdsNumberNotation = 'standard';
  @property({ type: Number, attribute: 'minimum-fraction-digits' }) minimumFractionDigits = Number.NaN;
  @property({ type: Number, attribute: 'maximum-fraction-digits' }) maximumFractionDigits = Number.NaN;
  @property() fallback = '—';
  @property({ attribute: false }) options: Intl.NumberFormatOptions = {};

  private formatValue(): string {
    if (!Number.isFinite(this.value)) return this.fallback;

    const options: Intl.NumberFormatOptions = {
      ...this.options,
      style: this.formatStyle,
      notation: this.notation,
    };

    if (this.currency) options.currency = this.currency;
    if (this.unit) options.unit = this.unit;
    if (Number.isFinite(this.minimumFractionDigits)) {
      options.minimumFractionDigits = Math.max(0, Math.min(20, Math.floor(this.minimumFractionDigits)));
    }
    if (Number.isFinite(this.maximumFractionDigits)) {
      options.maximumFractionDigits = Math.max(0, Math.min(20, Math.floor(this.maximumFractionDigits)));
    }

    try {
      return new Intl.NumberFormat(this.locale || undefined, options).format(this.value);
    } catch {
      return this.fallback;
    }
  }

  override render() {
    return html`<span part="value" dir="auto">${this.formatValue()}</span>`;
  }
}

registerAdsElement('format-number', AdsFormatNumber);

declare global {
  interface HTMLElementTagNameMap {
    'ads-format-number': AdsFormatNumber;
  }
}
