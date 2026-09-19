import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsLinkContract = defineComponentContract({
  name: 'AdsLink',
  tagName: 'ads-link',
  description: 'A standards-native link with ADS focus and external-link semantics.',
  status: 'experimental',
  attributes: [
    { name: 'href', type: 'string', default: '' },
    { name: 'target', type: 'string', default: '' },
    { name: 'rel', type: 'string', default: '' },
    { name: 'download', type: 'string | boolean', default: '' },
  ],
  properties: [
    { name: 'href', type: 'string' },
    { name: 'target', type: 'string' },
    { name: 'rel', type: 'string' },
  ],
  parts: [{ name: 'link', description: 'The internal native anchor.' }],
});

export class AdsLink extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: inline;
    }
    a {
      color: var(--ads-link-color, currentColor);
      text-decoration: var(--ads-link-decoration, underline);
    }
    a:focus-visible {
      outline: 2px solid var(--ads-focus-ring-color, currentColor);
      outline-offset: 2px;
    }
  `;
  @property({ reflect: true }) href = '';
  @property() target = '';
  @property() rel = '';
  @property({
    attribute: 'download',
    reflect: true,
    converter: {
      fromAttribute: (value: string | null): string | boolean => value ?? false,
      toAttribute: (value: string | boolean): string | null =>
        value === false ? null : value === true ? '' : value,
    },
  })
  download: string | boolean = false;

  private get resolvedRel(): string {
    if (this.target !== '_blank') return this.rel;

    const tokens = new Set(this.rel.split(/\s+/u).filter(Boolean));
    tokens.add('noopener');
    return [...tokens].join(' ');
  }

  override click(): void {
    this.renderRoot.querySelector<HTMLAnchorElement>('a')?.click();
  }

  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector<HTMLAnchorElement>('a')?.focus(options);
  }

  override blur(): void {
    this.renderRoot.querySelector<HTMLAnchorElement>('a')?.blur();
  }

  override render() {
    return html`<a
      part="link"
      href=${this.href || nothing}
      target=${this.target || nothing}
      rel=${this.resolvedRel || nothing}
      download=${this.download === true || this.download === '' ? '' : this.download || nothing}
      ><slot></slot
    ></a>`;
  }
}
registerAdsElement('link', AdsLink);
