import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSkeletonContract = defineComponentContract({
  name: 'AdsSkeleton',
  tagName: 'ads-skeleton',
  description: 'Represents content while it is loading.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Optional accessible loading label.' }],
});
export class AdsSkeleton extends LitElement {
  @state() private hasLabel = false;

  static styles = css`
    :host {
      display: block;
      min-height: 1rem;
      border-radius: 0.25rem;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, CanvasText 8%, transparent) 25%,
        color-mix(in srgb, CanvasText 16%, transparent) 50%,
        color-mix(in srgb, CanvasText 8%, transparent) 75%
      );
      background-size: 200% 100%;
      animation: ads-shimmer 1.4s ease-in-out infinite;
    }
    @keyframes ads-shimmer {
      to {
        background-position: -200% 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `;
  protected firstUpdated() {
    this.updateLabelState();
  }

  private updateLabelState = () => {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot');
    this.hasLabel = Boolean(
      slot
        ?.assignedNodes({ flatten: true })
        .some((node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())),
    );
  };

  override render() {
    return html`<span
      role="status"
      aria-busy="true"
      aria-label=${this.hasLabel ? nothing : 'Loading'}
      ><slot @slotchange=${this.updateLabelState}></slot
    ></span>`;
  }
}
registerAdsElement('skeleton', AdsSkeleton);
