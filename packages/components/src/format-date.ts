import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsDateValue = Date | string | number;
export type AdsDateStyle = NonNullable<Intl.DateTimeFormatOptions['dateStyle']>;
export type AdsTimeStyle = NonNullable<Intl.DateTimeFormatOptions['timeStyle']>;

export const adsFormatDateContract = defineComponentContract({
  name: 'Format Date',
  tagName: 'ads-format-date',
  description: 'Locale-aware date/time formatter backed by Intl.DateTimeFormat.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'Date | string | number', default: '' },
    { name: 'locale', type: 'string', default: '' },
    { name: 'date-style', type: "'full' | 'long' | 'medium' | 'short' | ''", default: 'medium' },
    { name: 'time-style', type: "'full' | 'long' | 'medium' | 'short' | ''", default: '' },
    { name: 'time-zone', type: 'string', default: '' },
    { name: 'fallback', type: 'string', default: '—' },
  ],
  properties: [
    {
      name: 'options',
      type: 'Intl.DateTimeFormatOptions',
      default: '{}',
      description: 'Additional Intl options. Explicit component attributes take precedence.',
    },
  ],
  parts: [{ name: 'value', description: 'Formatted output.' }],
});

export class AdsFormatDate extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  @property() value: AdsDateValue = '';
  @property() locale = '';
  @property({ attribute: 'date-style' }) dateStyle: AdsDateStyle | '' = 'medium';
  @property({ attribute: 'time-style' }) timeStyle: AdsTimeStyle | '' = '';
  @property({ attribute: 'time-zone' }) timeZone = '';
  @property() fallback = '—';
  @property({ attribute: false }) options: Intl.DateTimeFormatOptions = {};

  private resolveDate(): Date | null {
    if (this.value instanceof Date) {
      return Number.isNaN(this.value.getTime()) ? null : this.value;
    }

    if (typeof this.value === 'number') {
      const date = new Date(this.value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (!this.value.trim()) return null;
    const date = new Date(this.value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatValue(): string {
    const date = this.resolveDate();
    if (!date) return this.fallback;

    const options: Intl.DateTimeFormatOptions = { ...this.options };
    if (this.dateStyle) options.dateStyle = this.dateStyle;
    if (this.timeStyle) options.timeStyle = this.timeStyle;
    if (this.timeZone) options.timeZone = this.timeZone;

    try {
      return new Intl.DateTimeFormat(this.locale || undefined, options).format(date);
    } catch {
      return this.fallback;
    }
  }

  override render() {
    return html`<span part="value" dir="auto">${this.formatValue()}</span>`;
  }
}

registerAdsElement('format-date', AdsFormatDate);

declare global {
  interface HTMLElementTagNameMap {
    'ads-format-date': AdsFormatDate;
  }
}
