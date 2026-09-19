import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

let popoverId = 0;

export const adsPopoverContract = defineComponentContract({
  name: 'AdsPopover',
  tagName: 'ads-popover',
  description: 'Displays contextual content from a trigger.',
  status: 'experimental',
  attributes: [
    { name: 'open', type: 'boolean', default: 'false' },
    {
      name: 'placement',
      type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'",
      default: 'bottom-start',
    },
  ],
  properties: [
    { name: 'open', type: 'boolean' },
    {
      name: 'placement',
      type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'",
    },
  ],
  slots: [
    { name: 'trigger', description: 'Content for the popover trigger.' },
    { name: 'default', description: 'Content displayed in the popover.' },
  ],
  parts: [
    { name: 'trigger', description: 'The popover trigger button.' },
    { name: 'popover', description: 'The contextual content surface.' },
  ],
  events: [
    {
      name: 'ads-toggle',
      description: 'Fired when the popover opens or closes.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsPopover extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    [part='trigger'] {
      anchor-name: --ads-popover-trigger;
    }
    [part='popover'] {
      position: fixed;
      inset: auto;
      z-index: 1;
      min-width: 12rem;
      max-width: min(24rem, calc(100vw - 2rem));
      margin: 0.5rem 0 0;
      padding: 0.75rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.5rem;
      background: Canvas;
      color: CanvasText;
      box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, CanvasText 18%, transparent);
    }
    :host(:not([open])) [part='popover'] {
      display: none;
    }
    :host([placement='bottom-start']) [part='popover'] {
      position-anchor: --ads-popover-trigger;
      top: anchor(bottom);
      left: anchor(left);
    }
    :host([placement='bottom-end']) [part='popover'] {
      position-anchor: --ads-popover-trigger;
      top: anchor(bottom);
      right: anchor(right);
    }
    :host([placement='top-start']) [part='popover'] {
      position-anchor: --ads-popover-trigger;
      bottom: anchor(top);
      left: anchor(left);
      margin: 0 0 0.5rem;
    }
    :host([placement='top-end']) [part='popover'] {
      position-anchor: --ads-popover-trigger;
      right: anchor(right);
      bottom: anchor(top);
      margin: 0 0 0.5rem;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true })
  placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' = 'bottom-start';

  private readonly contentId = `ads-popover-${++popoverId}`;
  private hasInitialised = false;

  @query('[part="popover"]') private popoverElement?: HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  protected updated(changed: Map<string, unknown>) {
    if (!changed.has('open') || !this.popoverElement) return;
    if (this.open) this.popoverElement.showPopover?.();
    else this.popoverElement.hidePopover?.();

    // Property changes and native light-dismiss actions share the same public
    // event. Skip the first render so an initially open popover is silent.
    if (this.hasInitialised && changed.get('open') !== this.open) {
      this.dispatchEvent(new Event('ads-toggle', { bubbles: true, composed: true }));
    }
    this.hasInitialised = true;
  }

  private toggle = () => {
    this.open = !this.open;
  };

  private syncFromPopover = (event: Event) => {
    const newState = (event as Event & { newState?: string }).newState;
    if (newState === 'open' && !this.open) this.open = true;
    if (newState === 'closed' && this.open) this.open = false;
  };

  override render() {
    return html`<button
        part="trigger"
        type="button"
        aria-haspopup="dialog"
        aria-controls=${this.contentId}
        aria-expanded=${this.open}
        @click=${this.toggle}
      >
        <slot name="trigger">Open</slot>
      </button>
      <div id=${this.contentId} part="popover" popover="auto" @toggle=${this.syncFromPopover}>
        <slot></slot>
      </div>`;
  }
}

registerAdsElement('popover', AdsPopover);
