import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsByteUnitSystem = 'decimal' | 'binary';

const DECIMAL_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'] as const;
const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'] as const;

export const adsFormatBytesContract = defineComponentContract({
  name: 'Format Bytes',
  tagName: 'ads-format-bytes',
  description: 'Human-readable byte formatter with decimal (SI) and binary (IEC) unit systems.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number', default: '0' },
    { name: 'locale', type: 'string', default: '' },
    { name: 'unit-system', type: "'decimal' | 'binary'", default: 'binary' },
    { name: 'maximum-fraction-digits', type: 'number', default: '1' },
    { name: 'fallback', type: 'string', default: '—' },
  ],
  parts: [{ name: 'value', description: 'Formatted output.' }],
});

export class AdsFormatBytes extends LitElement {
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
  @property({ attribute: 'unit-system' }) unitSystem: AdsByteUnitSystem = 'binary';
  @property({ type: Number, attribute: 'maximum-fraction-digits' }) maximumFractionDigits = 1;
  @property() fallback = '—';

  private formatValue(): string {
    if (!Number.isFinite(this.value)) return this.fallback;

    const base = this.unitSystem === 'decimal' ? 1000 : 1024;
    const units = this.unitSystem === 'decimal' ? DECIMAL_UNITS : BINARY_UNITS;
    const absolute = Math.abs(this.value);
    const index =
      absolute < base || absolute === 0
        ? 0
        : Math.min(Math.floor(Math.log(absolute) / Math.log(base)), units.length - 1);
    const scaled = this.value / base ** index;
    const digits = Number.isFinite(this.maximumFractionDigits)
      ? Math.max(0, Math.min(20, Math.floor(this.maximumFractionDigits)))
      : 1;
    const unit = units[index] ?? 'B';

    try {
      const number = new Intl.NumberFormat(this.locale || undefined, {
        maximumFractionDigits: digits,
      }).format(scaled);
      return `${number} ${unit}`;
    } catch {
      return this.fallback;
    }
  }

  override render() {
    return html`<span part="value" dir="auto">${this.formatValue()}</span>`;
  }
}

registerAdsElement('format-bytes', AdsFormatBytes);

declare global {
  interface HTMLElementTagNameMap {
    'ads-format-bytes': AdsFormatBytes;
  }
}
