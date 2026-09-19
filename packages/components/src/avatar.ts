import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsAvatarShape = 'circle' | 'square';

export const adsAvatarContract = defineComponentContract({
  name: 'Avatar',
  tagName: 'ads-avatar',
  description: 'Image avatar with deterministic initials fallback and accessible naming.',
  status: 'experimental',
  attributes: [
    { name: 'src', type: 'string', default: '' },
    { name: 'alt', type: 'string', default: '' },
    { name: 'initials', type: 'string', default: '' },
    { name: 'shape', type: "'circle' | 'square'", default: 'circle' },
  ],
  parts: [
    { name: 'avatar', description: 'Avatar container.' },
    { name: 'image', description: 'Avatar image.' },
    { name: 'fallback', description: 'Initials fallback.' },
  ],
  cssCustomProperties: [
    { name: '--ads-avatar-size', default: '2.5rem' },
    { name: '--ads-avatar-background', default: '#ececf0' },
    { name: '--ads-avatar-color', default: '#39393f' },
    { name: '--ads-avatar-radius', default: '50%' },
  ],
});

export class AdsAvatar extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    [part='avatar'] {
      inline-size: var(--ads-avatar-size, 2.5rem);
      block-size: var(--ads-avatar-size, 2.5rem);
      overflow: hidden;
      display: inline-grid;
      place-items: center;
      border-radius: var(--ads-avatar-radius, 50%);
      background: var(--ads-avatar-background, #ececf0);
      color: var(--ads-avatar-color, #39393f);
      font-size: calc(var(--ads-avatar-size, 2.5rem) * 0.36);
      font-weight: 650;
      line-height: 1;
      text-transform: uppercase;
      user-select: none;
    }

    :host([shape='square']) [part='avatar'] {
      border-radius: var(--ads-avatar-square-radius, var(--ads-radius-control, 0.375rem));
    }

    [part='image'] {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  `;

  @property() src = '';
  @property() alt = '';
  @property() initials = '';
  @property({ reflect: true }) shape: AdsAvatarShape = 'circle';
  @state() private imageFailed = false;

  override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('src')) this.imageFailed = false;
  }

  private handleImageError(): void {
    this.imageFailed = true;
  }

  override render() {
    const showImage = Boolean(this.src) && !this.imageFailed;
    return html`
      <span
        part="avatar"
        role=${showImage || this.alt ? 'img' : nothing}
        aria-label=${this.alt || nothing}
        aria-hidden=${!showImage && !this.alt ? 'true' : nothing}
      >
        ${showImage
          ? html`<img part="image" src=${this.src} alt="" @error=${this.handleImageError} />`
          : html`<span part="fallback" aria-hidden="true">${this.initials || '•'}</span>`}
      </span>
    `;
  }
}

registerAdsElement('avatar', AdsAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'ads-avatar': AdsAvatar;
  }
}
