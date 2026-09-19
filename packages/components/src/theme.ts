import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsThemeName = 'minimal-light' | 'minimal-dark' | 'minimal-high-contrast';
export type AdsDensity = 'compact' | 'default' | 'comfortable';

export const adsThemeContract = defineComponentContract({
  name: 'Theme',
  tagName: 'a-design-system-theme',
  description: 'Scoped ADS theme/density context that inherits through normal CSS custom properties.',
  status: 'experimental',
  attributes: [
    {
      name: 'theme',
      type: "'minimal-light' | 'minimal-dark' | 'minimal-high-contrast'",
      default: 'minimal-light',
    },
    {
      name: 'density',
      type: "'compact' | 'default' | 'comfortable'",
      default: 'default',
    },
  ],
  slots: [
    { name: '', description: 'Content that inherits the selected ADS theme and density tokens.' },
  ],
  parts: [
    { name: 'content', description: 'Theme content wrapper.' },
  ],
  states: [
    { name: 'dark', description: 'The selected theme uses dark color-scheme semantics.' },
    { name: 'high-contrast', description: 'The selected theme is the high-contrast reference mode.' },
  ],
});

export class AdsTheme extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none;
    }

    [part='content'] {
      display: contents;
    }
  `;

  @property({ reflect: true })
  theme: AdsThemeName = 'minimal-light';

  @property({ reflect: true })
  density: AdsDensity = 'default';

  #internals?: ElementInternals;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.#internals && typeof this.attachInternals === 'function') {
      this.#internals = this.attachInternals();
    }
    this.syncContext();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has('theme') || changed.has('density')) this.syncContext();
  }

  private syncContext(): void {
    this.dataset.adsTheme = this.theme;
    this.dataset.adsDensity = this.density;

    if (this.#internals) {
      if (this.theme === 'minimal-dark') this.#internals.states.add('dark');
      else this.#internals.states.delete('dark');

      if (this.theme === 'minimal-high-contrast') this.#internals.states.add('high-contrast');
      else this.#internals.states.delete('high-contrast');
    }
  }

  override render() {
    return html`<div part="content"><slot></slot></div>`;
  }
}

registerAdsElement('theme', AdsTheme, { prefix: 'a-design-system' });

declare global {
  interface HTMLElementTagNameMap {
    'a-design-system-theme': AdsTheme;
  }
}
