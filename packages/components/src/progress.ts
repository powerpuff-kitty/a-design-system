import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsProgressContract = defineComponentContract({
  name: 'AdsProgress',
  tagName: 'ads-progress',
  description: 'Shows completion progress for a task.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'number' },
    { name: 'max', type: 'number', default: '100' },
  ],
  properties: [
    { name: 'value', type: 'number' },
    { name: 'max', type: 'number' },
  ],
  slots: [{ name: 'default', description: 'Accessible progress label.' }],
});
export class AdsProgress extends LitElement {
  @state() private hasLabel = false;

  static styles = css`
    :host {
      display: block;
    }
    [part='track'] {
      height: 0.5rem;
      overflow: hidden;
      border-radius: 999px;
      background: color-mix(in srgb, CanvasText 15%, transparent);
    }
    [part='bar'] {
      height: 100%;
      border-radius: inherit;
      background: var(--ads-progress-color, currentColor);
      transition: width 160ms ease;
    }
    @media (prefers-reduced-motion: reduce) {
      [part='bar'] {
        transition: none;
      }
    }
  `;
  @property({ type: Number }) value?: number;
  @property({ type: Number }) max = 100;
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
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const determinate = typeof this.value === 'number' && Number.isFinite(this.value);
    const value = determinate ? Math.min(max, Math.max(0, this.value!)) : undefined;
    const percentage = determinate ? (value! / max) * 100 : 40;
    return html`<div
      part="track"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax=${max}
      aria-valuenow=${determinate ? value : nothing}
      aria-label=${this.hasLabel ? nothing : determinate ? `${Math.round(percentage)}%` : 'Loading'}
    >
      <div part="bar" style="width:${percentage}%"></div>
      <slot @slotchange=${this.updateLabelState}></slot>
    </div>`;
  }
}
registerAdsElement('progress', AdsProgress);
