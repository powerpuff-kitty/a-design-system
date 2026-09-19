import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsLinkContract = defineComponentContract({
  name: 'Link',
  tagName: 'ads-link',
  description: 'Token-driven anchor that preserves native link semantics.',
  status: 'experimental',
  attributes: [
    { name: 'href', type: 'string', default: '' },
    { name: 'target', type: 'string', default: '' },
    { name: 'rel', type: 'string', default: '' },
    { name: 'download', type: 'string', default: '' },
  ],
  slots: [
    { name: '', description: 'Link label/content.' },
    { name: 'start', description: 'Leading icon or decoration.' },
    { name: 'end', description: 'Trailing icon or decoration.' },
  ],
  parts: [{ name: 'link', description: 'The internal native anchor.' }],
  cssCustomProperties: [
    { name: '--ads-link-color', default: 'var(--ads-color-action, var(--ads-color-action-primary, #315efb))' },
    { name: '--ads-link-decoration-thickness', default: '0.08em' },
    { name: '--ads-link-underline-offset', default: '0.18em' },
    { name: '--ads-link-gap', default: '0.25em', description: 'Gap between link content and slotted leading or trailing decorations.' },
  ],
});

export class AdsLink extends LitElement {
  static override styles = css`
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    a {
      color: var(--ads-link-color, var(--ads-color-action, var(--ads-color-action-primary, #315efb)));
      text-decoration-thickness: var(--ads-link-decoration-thickness, 0.08em);
      text-underline-offset: var(--ads-link-underline-offset, 0.18em);
    }

    a:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    .content {
      display: inline-flex;
      align-items: baseline;
      gap: var(--ads-link-gap, 0.25em);
    }
  `;

  @property() href = '';
  @property() target = '';
  @property() rel = '';
  @property() download = '';

  private get effectiveRel(): string {
    if (this.target !== '_blank') return this.rel;
    const tokens = new Set(this.rel.split(/\s+/).filter(Boolean));
    tokens.add('noopener');
    return [...tokens].join(' ');
  }

  override render() {
    return html`
      <a
        part="link"
        href=${this.href || nothing}
        target=${this.target || nothing}
        rel=${this.effectiveRel || nothing}
        download=${this.download || nothing}
      >
        <span class="content">
          <slot name="start"></slot>
          <slot></slot>
          <slot name="end"></slot>
        </span>
      </a>
    `;
  }
}

registerAdsElement('link', AdsLink);

declare global {
  interface HTMLElementTagNameMap {
    'ads-link': AdsLink;
  }
}
