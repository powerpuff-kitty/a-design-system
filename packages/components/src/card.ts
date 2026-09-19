import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsCardVariant = 'outlined' | 'filled';

export const adsCardContract = defineComponentContract({
  name: 'Card',
  tagName: 'ads-card',
  description: 'Composable content surface with media, header, body, and footer slots.',
  status: 'experimental',
  attributes: [{ name: 'variant', type: "'outlined' | 'filled'", default: 'outlined' }],
  slots: [
    { name: 'media', description: 'Optional edge-to-edge media.' },
    { name: 'header', description: 'Card heading or header actions.' },
    { name: '', description: 'Primary card content.' },
    { name: 'footer', description: 'Footer actions or metadata.' },
  ],
  parts: [
    { name: 'card', description: 'Card surface.' },
    { name: 'media', description: 'Media region.' },
    { name: 'header', description: 'Header region.' },
    { name: 'body', description: 'Body region.' },
    { name: 'footer', description: 'Footer region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-card-radius', default: 'var(--ads-radius-panel, 0.5rem)' },
    { name: '--ads-card-border', default: '#dedee3' },
    { name: '--ads-card-background', default: '#fff' },
    { name: '--ads-card-padding', default: '1rem' },
  ],
});

function slotHasContent(slot: HTMLSlotElement): boolean {
  return slot.assignedNodes({ flatten: true }).some((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return true;
    return Boolean(node.textContent?.trim());
  });
}

export class AdsCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    [part='card'] {
      overflow: hidden;
      border: 1px solid var(--ads-card-border, #dedee3);
      border-radius: var(--ads-card-radius, var(--ads-radius-panel, 0.5rem));
      background: var(--ads-card-background, #fff);
      color: var(--ads-card-color, inherit);
    }

    :host([variant='filled']) [part='card'] {
      border-color: transparent;
      background: var(--ads-card-filled-background, #f6f6f8);
    }

    [part='media'] {
      line-height: 0;
    }

    [part='header'],
    [part='body'],
    [part='footer'] {
      padding: var(--ads-card-padding, 1rem);
    }

    [part='header'] + [part='body'] {
      padding-block-start: 0;
    }

    [part='footer'] {
      padding-block-start: 0;
    }
  `;

  @property({ reflect: true }) variant: AdsCardVariant = 'outlined';
  @state() private hasMedia = false;
  @state() private hasHeader = false;
  @state() private hasFooter = false;

  private handleSlotChange(kind: 'media' | 'header' | 'footer', event: Event): void {
    const slot = event.currentTarget as HTMLSlotElement;
    const hasContent = slotHasContent(slot);
    if (kind === 'media') this.hasMedia = hasContent;
    if (kind === 'header') this.hasHeader = hasContent;
    if (kind === 'footer') this.hasFooter = hasContent;
  }

  override render() {
    return html`
      <article part="card">
        <div part="media" ?hidden=${!this.hasMedia}>
          <slot name="media" @slotchange=${(event: Event) => this.handleSlotChange('media', event)}></slot>
        </div>
        <header part="header" ?hidden=${!this.hasHeader}>
          <slot name="header" @slotchange=${(event: Event) => this.handleSlotChange('header', event)}></slot>
        </header>
        <div part="body"><slot></slot></div>
        <footer part="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${(event: Event) => this.handleSlotChange('footer', event)}></slot>
        </footer>
      </article>
    `;
  }
}

registerAdsElement('card', AdsCard);

declare global {
  interface HTMLElementTagNameMap {
    'ads-card': AdsCard;
  }
}
