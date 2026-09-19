import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsAvatarContract = defineComponentContract({
  name: 'AdsAvatar',
  tagName: 'ads-avatar',
  description: 'Represents a person or entity with an image and accessible fallback.',
  status: 'experimental',
  attributes: [
    { name: 'src', type: 'string' },
    { name: 'alt', type: 'string' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md' },
  ],
  properties: [
    { name: 'src', type: 'string' },
    { name: 'alt', type: 'string' },
    { name: 'size', type: "'sm' | 'md' | 'lg'" },
  ],
  slots: [{ name: 'default', description: 'Fallback initials or custom avatar content.' }],
  parts: [{ name: 'avatar', description: 'The avatar surface.' }],
});

export class AdsAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    [part='avatar'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      overflow: hidden;
      border-radius: 50%;
      background: var(--ads-avatar-background, Canvas);
      color: var(--ads-avatar-color, CanvasText);
      font: inherit;
    }
    :host([size='sm']) [part='avatar'] {
      width: 2rem;
      height: 2rem;
      font-size: 0.875rem;
    }
    :host([size='lg']) [part='avatar'] {
      width: 3rem;
      height: 3rem;
      font-size: 1.25rem;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;
  @property() src = '';
  @property() alt = '';
  @property({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  override render() {
    return html`<span
      part="avatar"
      role=${this.src || !this.alt ? nothing : 'img'}
      aria-label=${this.src || !this.alt ? nothing : this.alt}
    >
      ${
        this.src
          ? html`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`
          : html`<slot></slot>`
      }
    </span>`;
  }
  private handleImageError = () => {
    this.src = '';
  };
}
registerAdsElement('avatar', AdsAvatar);
