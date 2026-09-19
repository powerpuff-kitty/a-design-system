import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsRelativeTimeNumeric = 'always' | 'auto';
export type AdsRelativeTimeStyle = 'long' | 'short' | 'narrow';

export const adsRelativeTimeContract = defineComponentContract({
  name: 'Relative Time',
  tagName: 'ads-relative-time',
  description: 'Locale-aware relative time formatter backed by Intl.RelativeTimeFormat.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number', default: '0' },
    { name: 'unit', type: 'Intl.RelativeTimeFormatUnit', default: 'second' },
    { name: 'locale', type: 'string', default: '' },
    { name: 'numeric', type: "'always' | 'auto'", default: 'auto' },
    { name: 'style', type: "'long' | 'short' | 'narrow'", default: 'long' },
    { name: 'fallback', type: 'string', default: '—' },
  ],
  properties: [
    {
      name: 'options',
      type: 'Intl.RelativeTimeFormatOptions',
      default: '{}',
      description: 'Additional Intl options. Explicit component attributes take precedence.',
    },
  ],
  parts: [{ name: 'value', description: 'Formatted output.' }],
});

export class AdsRelativeTime extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: Number }) value = 0;
  @property() unit: Intl.RelativeTimeFormatUnit = 'second';
  @property() locale = '';
  @property() numeric: AdsRelativeTimeNumeric = 'auto';
  @property({ attribute: 'style' }) relativeStyle: AdsRelativeTimeStyle = 'long';
  @property() fallback = '—';
  @property({ attribute: false }) options: Intl.RelativeTimeFormatOptions = {};

  private formatValue(): string {
    if (!Number.isFinite(this.value)) return this.fallback;

    try {
      const formatter = new Intl.RelativeTimeFormat(this.locale || undefined, {
        ...this.options,
        numeric: this.numeric,
        style: this.relativeStyle,
      });
      return formatter.format(this.value, this.unit);
    } catch {
      return this.fallback;
    }
  }

  override render() {
    return html`<span part="value" dir="auto">${this.formatValue()}</span>`;
  }
}

registerAdsElement('relative-time', AdsRelativeTime);

declare global {
  interface HTMLElementTagNameMap {
    'ads-relative-time': AdsRelativeTime;
  }
}
